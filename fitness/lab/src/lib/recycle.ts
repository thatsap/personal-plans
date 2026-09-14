import { getSupabase } from "./supabase";
import type { IngestionRow } from "./types";
import type { RoutineRow, SessionRow, SetRow } from "./workout/types";
import type { SportRow } from "./workout/sports";
import type { MobilityRow, SleepRow } from "./recovery/types";

export const BIN_DAYS = 7;

export const RECYCLE_KINDS = ["meal", "session", "sport", "sleep", "mobility", "routine", "body"] as const;
export type RecycleKind = (typeof RECYCLE_KINDS)[number];

export type RecycleRow = {
  id: string;
  user_id: string;
  kind: RecycleKind;
  title: string;
  payload: unknown;
  deleted_at: string;
};

type SessionPayload = { session: SessionRow; sets: SetRow[] };

function sb() {
  const c = getSupabase();
  if (!c) throw new Error("Supabase not connected.");
  return c;
}

function binMissing(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const m = (error.message ?? "").toLowerCase();
  return error.code === "42P01" || m.includes("recycle_bin");
}

function throwBin(error: { message: string; code?: string }): never {
  if (binMissing(error)) throw new Error("Run supabase/patch-recycle.sql in the SQL editor.");
  throw error;
}

export function daysLeft(deletedAt: string): number {
  const end = new Date(deletedAt).getTime() + BIN_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000)));
}

export async function trash(
  userId: string,
  kind: RecycleKind,
  title: string,
  payload: unknown,
) {
  const { error } = await sb().from("recycle_bin").insert({
    user_id: userId,
    kind,
    title,
    payload,
  });
  if (error) throwBin(error);
}

export async function listBin(userId: string): Promise<RecycleRow[]> {
  await purgeExpired(userId);
  const { data, error } = await sb()
    .from("recycle_bin")
    .select("*")
    .eq("user_id", userId)
    .order("deleted_at", { ascending: false });
  if (error) throwBin(error);
  return (data ?? []) as RecycleRow[];
}

export async function purgeExpired(userId: string) {
  const cutoff = new Date(Date.now() - BIN_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await sb()
    .from("recycle_bin")
    .select("id, kind, payload")
    .eq("user_id", userId)
    .lt("deleted_at", cutoff);
  if (error) {
    if (binMissing(error)) return;
    throw error;
  }
  const rows = data ?? [];
  if (!rows.length) return;
  for (const r of rows) {
    if (r.kind === "meal") {
      const path = (r.payload as { row?: IngestionRow })?.row?.photo_path;
      if (path) {
        await sb().storage.from("meal-photos").remove([path]);
      }
    }
    if (r.kind === "body") {
      const row = (r.payload as {
        row?: { photo_front_path?: string | null; photo_side_path?: string | null };
      })?.row;
      const paths = [row?.photo_front_path, row?.photo_side_path].filter((p): p is string => !!p);
      if (paths.length) await sb().storage.from("body-photos").remove(paths);
    }
  }
  const { error: delErr } = await sb()
    .from("recycle_bin")
    .delete()
    .eq("user_id", userId)
    .lt("deleted_at", cutoff);
  if (delErr) throwBin(delErr);
}

export async function restore(id: string) {
  const { data, error } = await sb().from("recycle_bin").select("*").eq("id", id).maybeSingle();
  if (error) throwBin(error);
  if (!data) throw new Error("Already gone.");
  const row = data as RecycleRow;
  if (daysLeft(row.deleted_at) <= 0) {
    await purgeExpired(row.user_id);
    throw new Error("That one aged out of the bin.");
  }
  if (row.kind === "meal") await restoreMeal(row.payload);
  else if (row.kind === "session") await restoreSession(row.payload);
  else if (row.kind === "sport") await restoreSport(row.payload);
  else if (row.kind === "sleep") await restoreSleep(row.payload);
  else if (row.kind === "mobility") await restoreMobility(row.payload);
  else if (row.kind === "routine") await restoreRoutine(row.payload);
  else if (row.kind === "body") await restoreBody(row.payload);
  const { error: delErr } = await sb().from("recycle_bin").delete().eq("id", id);
  if (delErr) throwBin(delErr);
}

async function restoreMeal(payload: unknown) {
  const row = (payload as { row: IngestionRow }).row;
  const { error } = await sb().from("ingestions").insert(row);
  if (error) throw error;
}

async function restoreSession(payload: unknown) {
  const p = payload as SessionPayload;
  const { error } = await sb().from("workout_sessions").insert(p.session);
  if (error) throw error;
  if (p.sets?.length) {
    const { error: sErr } = await sb().from("workout_sets").insert(p.sets);
    if (sErr) throw sErr;
  }
}

async function restoreSport(payload: unknown) {
  const row = (payload as { row: SportRow }).row;
  const { error } = await sb().from("sport_logs").insert(row);
  if (error) throw error;
}

async function restoreSleep(payload: unknown) {
  const row = (payload as { row: SleepRow }).row;
  const { error } = await sb().from("recovery_sleep").insert(row);
  if (error) throw error;
}

async function restoreMobility(payload: unknown) {
  const row = (payload as { row: MobilityRow }).row;
  const { error } = await sb().from("recovery_mobility").insert(row);
  if (error) throw error;
}

async function restoreRoutine(payload: unknown) {
  const row = (payload as { row: RoutineRow }).row;
  const { error } = await sb().from("workout_routines").insert({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    tag: row.tag,
    source_json: row.source_json,
    time_cap_min: row.time_cap_min,
    last_used_at: row.last_used_at,
    created_at: row.created_at,
  });
  if (error) throw error;
}

async function restoreBody(payload: unknown) {
  const row = (payload as { row: Record<string, unknown> }).row;
  const { error } = await sb().from("body_logs").insert(row);
  if (error) throw error;
}
