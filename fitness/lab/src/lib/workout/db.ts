import { getSupabase } from "../supabase";
import { parseRoutineObject } from "./parse";
import { trash } from "../recycle";
import type {
  LastSlotHint,
  LiveSlot,
  ParsedSession,
  Routine,
  RoutineRow,
  SessionRow,
  SessionSource,
  SessionWithSets,
  SetRow,
} from "./types";

function sb() {
  const c = getSupabase();
  if (!c) throw new Error("Supabase not connected.");
  return c;
}

function asRoutine(json: unknown): Routine {
  if (!json || typeof json !== "object") throw new Error("Routine JSON missing.");
  return parseRoutineObject(json as Record<string, unknown>);
}

function rowToRoutine(data: Record<string, unknown>): RoutineRow {
  return {
    id: String(data.id),
    user_id: String(data.user_id),
    name: String(data.name),
    tag: data.tag === "extra" ? "extra" : "protocol",
    source_json: asRoutine(data.source_json),
    time_cap_min:
      typeof data.time_cap_min === "number" ? data.time_cap_min : null,
    last_used_at: String(data.last_used_at),
    created_at: String(data.created_at),
  };
}

export async function upsertRoutine(userId: string, routine: Routine): Promise<RoutineRow> {
  const row = {
    user_id: userId,
    name: routine.name,
    tag: routine.tag,
    source_json: routine,
    time_cap_min: routine.timeCapMin,
    last_used_at: new Date().toISOString(),
  };
  const { data, error } = await sb()
    .from("workout_routines")
    .upsert(row, { onConflict: "user_id,name" })
    .select()
    .single();
  if (error) throw error;
  return rowToRoutine(data as Record<string, unknown>);
}

export async function listRoutines(userId: string): Promise<RoutineRow[]> {
  const { data, error } = await sb()
    .from("workout_routines")
    .select("*")
    .eq("user_id", userId)
    .order("last_used_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((d) => rowToRoutine(d as Record<string, unknown>));
}

export async function getRoutine(id: string): Promise<RoutineRow | null> {
  const { data, error } = await sb()
    .from("workout_routines")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToRoutine(data as Record<string, unknown>);
}

export async function touchRoutine(id: string) {
  await sb()
    .from("workout_routines")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", id);
}

function flattenLive(sessionId: string, slots: LiveSlot[]): Omit<SetRow, "id">[] {
  const out: Omit<SetRow, "id">[] = [];
  let sort = 0;
  for (const slot of slots) {
    if (slot.skipped) continue;
    for (const s of slot.sets) {
      const kg = Number(s.kg);
      const reps = Number(s.reps);
      if (!Number.isFinite(kg) && !Number.isFinite(reps)) continue;
      if (s.kg === "" && s.reps === "") continue;
      const rpe = s.rpe === "" ? null : Number(s.rpe);
      const rir = s.rir === "" ? null : Number(s.rir);
      out.push({
        session_id: sessionId,
        slot_key: slot.slotKey,
        exercise_name: slot.usedName,
        planned_name: slot.plannedName,
        scheme: slot.scheme,
        sort_index: sort++,
        kg: Number.isFinite(kg) ? kg : 0,
        reps: Number.isFinite(reps) ? reps : 0,
        rpe: rpe !== null && Number.isFinite(rpe) ? rpe : null,
        rir: rir !== null && Number.isFinite(rir) ? rir : null,
        kind: s.kind,
        side: s.side,
        rest_sec: s.restSec,
      });
    }
  }
  return out;
}

export async function saveLiveSession(opts: {
  userId: string;
  routine: RoutineRow;
  startedAt: string;
  minutes: number | null;
  notes: string;
  source: SessionSource;
  slots: LiveSlot[];
}): Promise<SessionRow> {
  const { data, error } = await sb()
    .from("workout_sessions")
    .insert({
      user_id: opts.userId,
      routine_id: opts.routine.id,
      started_at: opts.startedAt,
      minutes: opts.minutes,
      source: opts.source,
      routine_snapshot: opts.routine.source_json,
      notes: opts.notes,
    })
    .select()
    .single();
  if (error) throw error;
  const session = data as SessionRow;
  const sets = flattenLive(session.id, opts.slots);
  if (sets.length) {
    const { error: sErr } = await sb().from("workout_sets").insert(sets);
    if (sErr) throw sErr;
  }
  await touchRoutine(opts.routine.id);
  return session;
}

export async function saveParsedSession(
  userId: string,
  parsed: ParsedSession,
): Promise<SessionRow> {
  const routines = await listRoutines(userId);
  const match = routines.find(
    (r) => r.name.toLowerCase() === parsed.routineName.toLowerCase(),
  );
  const snapshot = match?.source_json ?? {
    name: parsed.routineName,
    tag: "extra" as const,
    timeCapMin: null,
    notes: "",
    blocks: parsed.actuals.map((a, i) => ({
      id: `catch-${i}`,
      slot: a.slot,
      scheme: a.scheme,
      restSec: null,
      notes: "",
      exercises: [{ name: a.plannedName || a.usedName, role: "primary" as const, sides: "one" as const, alternatives: [], sets: [] }],
    })),
  };
  const { data, error } = await sb()
    .from("workout_sessions")
    .insert({
      user_id: userId,
      routine_id: match?.id ?? null,
      started_at: parsed.startedAt,
      minutes: parsed.minutes,
      source: "json",
      routine_snapshot: snapshot,
      notes: parsed.notes,
    })
    .select()
    .single();
  if (error) throw error;
  const session = data as SessionRow;
  const sets: Omit<SetRow, "id">[] = [];
  let sort = 0;
  for (const a of parsed.actuals) {
    if (a.skipped) continue;
    for (const s of a.sets) {
      sets.push({
        session_id: session.id,
        slot_key: a.slot,
        exercise_name: a.usedName,
        planned_name: a.plannedName,
        scheme: a.scheme,
        sort_index: sort++,
        kg: s.kg,
        reps: s.reps,
        rpe: s.rpe,
        rir: s.rir,
        kind: s.kind,
        side: s.side,
        rest_sec: s.restSec,
      });
    }
  }
  if (sets.length) {
    const { error: sErr } = await sb().from("workout_sets").insert(sets);
    if (sErr) throw sErr;
  }
  if (match) await touchRoutine(match.id);
  return session;
}

export async function listSessions(
  userId: string,
  fromIso: string,
  toIso: string,
): Promise<SessionWithSets[]> {
  const { data, error } = await sb()
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .gte("started_at", fromIso)
    .lte("started_at", toIso)
    .order("started_at", { ascending: true });
  if (error) throw error;
  const sessions = (data ?? []) as SessionRow[];
  if (!sessions.length) return [];
  const ids = sessions.map((s) => s.id);
  const { data: setData, error: sErr } = await sb()
    .from("workout_sets")
    .select("*")
    .in("session_id", ids)
    .order("sort_index", { ascending: true });
  if (sErr) throw sErr;
  const by = new Map<string, SetRow[]>();
  for (const s of (setData ?? []) as SetRow[]) {
    const list = by.get(s.session_id) ?? [];
    list.push(s);
    by.set(s.session_id, list);
  }
  return sessions.map((s) => ({ ...s, sets: by.get(s.id) ?? [] }));
}

export async function lastSessionForRoutine(
  userId: string,
  routineId: string,
): Promise<SessionWithSets | null> {
  const { data, error } = await sb()
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("routine_id", routineId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const session = data as SessionRow;
  const { data: setData, error: sErr } = await sb()
    .from("workout_sets")
    .select("*")
    .eq("session_id", session.id)
    .order("sort_index", { ascending: true });
  if (sErr) throw sErr;
  return { ...session, sets: (setData ?? []) as SetRow[] };
}

export async function lastSlotHints(userId: string): Promise<LastSlotHint[]> {
  const { data, error } = await sb()
    .from("workout_sessions")
    .select("id, started_at")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(40);
  if (error) throw error;
  const ids = (data ?? []).map((r) => (r as { id: string }).id);
  if (!ids.length) return [];
  const { data: setData, error: sErr } = await sb()
    .from("workout_sets")
    .select("*")
    .in("session_id", ids)
    .eq("kind", "work");
  if (sErr) throw sErr;
  const order = new Map(ids.map((id, i) => [id, i]));
  const rows = ((setData ?? []) as SetRow[]).sort(
    (a, b) => (order.get(a.session_id) ?? 99) - (order.get(b.session_id) ?? 99),
  );
  const seen = new Set<string>();
  const hints: LastSlotHint[] = [];
  for (const r of rows) {
    if (seen.has(r.slot_key)) continue;
    seen.add(r.slot_key);
    hints.push({
      slot: r.slot_key,
      kg: r.kg,
      reps: r.reps,
      exercise: r.exercise_name,
    });
  }
  return hints;
}

export async function getSession(id: string): Promise<SessionWithSets | null> {
  const { data, error } = await sb().from("workout_sessions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const session = data as SessionRow;
  const { data: setData, error: sErr } = await sb()
    .from("workout_sets")
    .select("*")
    .eq("session_id", session.id)
    .order("sort_index", { ascending: true });
  if (sErr) throw sErr;
  return { ...session, sets: (setData ?? []) as SetRow[] };
}

export async function saveSessionEdits(session: SessionWithSets) {
  const { error } = await sb()
    .from("workout_sessions")
    .update({
      started_at: session.started_at,
      minutes: session.minutes,
      notes: session.notes,
    })
    .eq("id", session.id);
  if (error) throw error;
  const { error: delErr } = await sb().from("workout_sets").delete().eq("session_id", session.id);
  if (delErr) throw delErr;
  if (!session.sets.length) return;
  const { error: sErr } = await sb().from("workout_sets").insert(
    session.sets.map((s, i) => ({
      session_id: session.id,
      slot_key: s.slot_key,
      exercise_name: s.exercise_name,
      planned_name: s.planned_name,
      scheme: s.scheme,
      sort_index: i,
      kg: s.kg,
      reps: s.reps,
      rpe: s.rpe,
      rir: s.rir,
      kind: s.kind,
      side: s.side,
      rest_sec: s.rest_sec,
    })),
  );
  if (sErr) throw sErr;
}

export async function updateRoutine(
  id: string,
  patch: { name: string; tag: RoutineRow["tag"]; source_json: Routine; time_cap_min: number | null },
) {
  const { error } = await sb()
    .from("workout_routines")
    .update({
      name: patch.name,
      tag: patch.tag,
      source_json: patch.source_json,
      time_cap_min: patch.time_cap_min,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRoutine(id: string) {
  const row = await getRoutine(id);
  if (!row) return;
  await trash(row.user_id, "routine", row.name, { row });
  const { error } = await sb().from("workout_routines").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteSession(id: string) {
  const full = await getSession(id);
  if (!full) return;
  const title = full.routine_snapshot?.name || "Session";
  await trash(full.user_id, "session", title, { session: stripSets(full), sets: full.sets });
  const { error } = await sb().from("workout_sessions").delete().eq("id", id);
  if (error) throw error;
}

function stripSets(s: SessionWithSets): SessionRow {
  return {
    id: s.id,
    user_id: s.user_id,
    routine_id: s.routine_id,
    started_at: s.started_at,
    minutes: s.minutes,
    source: s.source,
    routine_snapshot: s.routine_snapshot,
    notes: s.notes,
    created_at: s.created_at,
  };
}
