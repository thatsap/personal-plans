import { getSupabase } from "../supabase";
import { SPORTS, type Sport, type SportRow } from "./sports";

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

export async function deleteSport(id: string) {
  const { error } = await sb().from("sport_logs").delete().eq("id", id);
  if (error) throw error;
}
