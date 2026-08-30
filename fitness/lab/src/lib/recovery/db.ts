import { trash } from "../recycle";
import { getSupabase } from "../supabase";
import type { MobilityRow, SleepKind, SleepRow } from "./types";

function sb() {
  const c = getSupabase();
  if (!c) throw new Error("Supabase not connected.");
  return c;
}

export async function saveSleep(opts: {
  userId: string;
  kind: SleepKind;
  asleepAt: string;
  wakeAt: string;
  minutes: number;
  notes: string;
}): Promise<SleepRow> {
  const { data, error } = await sb()
    .from("recovery_sleep")
    .insert({
      user_id: opts.userId,
      kind: opts.kind,
      asleep_at: opts.asleepAt,
      wake_at: opts.wakeAt,
      minutes: opts.minutes,
      notes: opts.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SleepRow;
}

export async function listSleep(
  userId: string,
  fromIso: string,
  toIso: string,
): Promise<SleepRow[]> {
  const { data, error } = await sb()
    .from("recovery_sleep")
    .select("*")
    .eq("user_id", userId)
    .gte("wake_at", fromIso)
    .lte("wake_at", toIso)
    .order("wake_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SleepRow[];
}

export async function getSleep(id: string): Promise<SleepRow | null> {
  const { data, error } = await sb().from("recovery_sleep").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as SleepRow) ?? null;
}

export async function updateSleep(
  id: string,
  patch: {
    kind: SleepKind;
    asleep_at: string;
    wake_at: string;
    minutes: number;
    notes: string;
  },
) {
  const { error } = await sb().from("recovery_sleep").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteSleep(id: string) {
  const row = await getSleep(id);
  if (!row) return;
  await trash(row.user_id, "sleep", row.kind === "night" ? "Night" : "Nap", { row });
  const { error } = await sb().from("recovery_sleep").delete().eq("id", id);
  if (error) throw error;
}

export async function saveMobility(opts: {
  userId: string;
  routineKey: string;
  startedAt: string;
  minutes: number;
  movesDone: number;
  movesTotal: number;
  notes: string;
}): Promise<MobilityRow> {
  const { data, error } = await sb()
    .from("recovery_mobility")
    .insert({
      user_id: opts.userId,
      routine_key: opts.routineKey,
      started_at: opts.startedAt,
      minutes: opts.minutes,
      moves_done: opts.movesDone,
      moves_total: opts.movesTotal,
      notes: opts.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return data as MobilityRow;
}

export async function listMobility(
  userId: string,
  fromIso: string,
  toIso: string,
): Promise<MobilityRow[]> {
  const { data, error } = await sb()
    .from("recovery_mobility")
    .select("*")
    .eq("user_id", userId)
    .gte("started_at", fromIso)
    .lte("started_at", toIso)
    .order("started_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MobilityRow[];
}

export async function getMobility(id: string): Promise<MobilityRow | null> {
  const { data, error } = await sb().from("recovery_mobility").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as MobilityRow) ?? null;
}

export async function updateMobility(
  id: string,
  patch: { started_at: string; minutes: number; notes: string },
) {
  const { error } = await sb().from("recovery_mobility").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteMobility(id: string) {
  const row = await getMobility(id);
  if (!row) return;
  await trash(row.user_id, "mobility", row.routine_key, { row });
  const { error } = await sb().from("recovery_mobility").delete().eq("id", id);
  if (error) throw error;
}
