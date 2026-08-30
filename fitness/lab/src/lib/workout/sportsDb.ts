import { getSupabase } from "../supabase";
import { trash } from "../recycle";
import { SPORTS, sportLabel, type Sport, type SportRow } from "./sports";

function sb() {
  const c = getSupabase();
  if (!c) throw new Error("Supabase not connected.");
  return c;
}

function isSport(v: string): v is Sport {
  return (SPORTS as readonly string[]).includes(v);
}

export async function saveSport(opts: {
  userId: string;
  startedAt: string;
  sport: string;
  minutes: number;
  hrAvg: number | null;
  peakHr: number | null;
  notes: string;
}): Promise<SportRow> {
  const sport = isSport(opts.sport) ? opts.sport : "other";
  const { data, error } = await sb()
    .from("sport_logs")
    .insert({
      user_id: opts.userId,
      started_at: opts.startedAt,
      sport,
      minutes: opts.minutes,
      hr_avg: opts.hrAvg,
      peak_hr: opts.peakHr,
      notes: opts.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SportRow;
}

export async function listSports(
  userId: string,
  fromIso: string,
  toIso: string,
): Promise<SportRow[]> {
  const { data, error } = await sb()
    .from("sport_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("started_at", fromIso)
    .lte("started_at", toIso)
    .order("started_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SportRow[];
}

export async function getSport(id: string): Promise<SportRow | null> {
  const { data, error } = await sb().from("sport_logs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as SportRow) ?? null;
}

export async function updateSport(
  id: string,
  patch: {
    started_at: string;
    sport: string;
    minutes: number;
    hr_avg: number | null;
    peak_hr: number | null;
    notes: string;
  },
) {
  const sport = isSport(patch.sport) ? patch.sport : "other";
  const { error } = await sb()
    .from("sport_logs")
    .update({
      started_at: patch.started_at,
      sport,
      minutes: patch.minutes,
      hr_avg: patch.hr_avg,
      peak_hr: patch.peak_hr,
      notes: patch.notes,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSport(id: string) {
  const row = await getSport(id);
  if (!row) return;
  await trash(row.user_id, "sport", sportLabel(row.sport), { row });
  const { error } = await sb().from("sport_logs").delete().eq("id", id);
  if (error) throw error;
}
