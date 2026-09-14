import { trash } from "./recycle";
import { uploadUserPhoto } from "./photo";
import { getSupabase } from "./supabase";

export type BodyRow = {
  id: string;
  user_id: string;
  logged_at: string;
  weight_kg: number;
  waist_cm: number | null;
  notes: string;
  photo_front_path: string | null;
  photo_side_path: string | null;
  created_at: string;
};

function missingTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const m = (error.message ?? "").toLowerCase();
  return error.code === "42P01" || m.includes("body_logs");
}

function throwBody(error: { message: string; code?: string }): never {
  if (missingTable(error)) throw new Error("Run supabase/patch-lab-v2.sql in the SQL editor.");
  throw error;
}

function sb() {
  const c = getSupabase();
  if (!c) throw new Error("Supabase not connected.");
  return c;
}

export async function saveBody(opts: {
  userId: string;
  loggedAt: string;
  weightKg: number;
  waistCm: number | null;
  notes: string;
  frontDataUrl?: string | null;
  sideDataUrl?: string | null;
}): Promise<BodyRow> {
  const { data, error } = await sb()
    .from("body_logs")
    .insert({
      user_id: opts.userId,
      logged_at: opts.loggedAt,
      weight_kg: opts.weightKg,
      waist_cm: opts.waistCm,
      notes: opts.notes,
    })
    .select()
    .single();
  if (error) throwBody(error);
  let row = data as BodyRow;
  const front = opts.frontDataUrl;
  const side = opts.sideDataUrl;
  if (front) {
    try {
      const path = await uploadUserPhoto("body-photos", opts.userId, `${row.id}-front`, front);
      row = { ...row, photo_front_path: path };
    } catch {
      /* photo optional */
    }
  }
  if (side) {
    try {
      const path = await uploadUserPhoto("body-photos", opts.userId, `${row.id}-side`, side);
      row = { ...row, photo_side_path: path };
    } catch {
      /* photo optional */
    }
  }
  if (row.photo_front_path || row.photo_side_path) {
    const { error: upErr } = await sb()
      .from("body_logs")
      .update({
        photo_front_path: row.photo_front_path,
        photo_side_path: row.photo_side_path,
      })
      .eq("id", row.id);
    if (upErr) throwBody(upErr);
  }
  return row;
}

export async function listBody(userId: string, limit = 24): Promise<BodyRow[]> {
  const { data, error } = await sb()
    .from("body_logs")
    .select("*")
    .eq("user_id", userId)
    .order("logged_at", { ascending: false })
    .limit(limit);
  if (error) throwBody(error);
  return (data ?? []) as BodyRow[];
}

export async function lastBody(userId: string): Promise<BodyRow | null> {
  const rows = await listBody(userId, 1);
  return rows[0] ?? null;
}

export async function getBody(id: string): Promise<BodyRow | null> {
  const { data, error } = await sb().from("body_logs").select("*").eq("id", id).maybeSingle();
  if (error) throwBody(error);
  return (data as BodyRow) ?? null;
}

export async function deleteBody(id: string) {
  const row = await getBody(id);
  if (!row) return;
  await trash(row.user_id, "body", `${row.weight_kg} kg`, { row });
  const { error } = await sb().from("body_logs").delete().eq("id", id);
  if (error) throwBody(error);
}
