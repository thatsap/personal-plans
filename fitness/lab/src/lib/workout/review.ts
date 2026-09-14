import { formatDay, istDateKey } from "../dates";
import { stallLines } from "./progress";
import { volumeKg } from "./live";
import type { SessionWithSets } from "./types";

export type WorkDay = {
  key: string;
  label: string;
  sessions: number;
  workSets: number;
  minutes: number;
};

export type WorkReview = {
  sessions: SessionWithSets[];
  gymDays: number;
  routines: { name: string; count: number }[];
  swaps: string[];
  overCap: string[];
  stuck: string[];
  lastCompounds: { slot: string; name: string; kg: number; reps: number }[];
  days: WorkDay[];
  lines: string[];
};

function snapshotName(s: SessionWithSets): string {
  return s.routine_snapshot?.name || "session";
}

function timeCap(s: SessionWithSets): number | null {
  return s.routine_snapshot?.timeCapMin ?? null;
}

export function rollupWork(sessions: SessionWithSets[]): WorkReview {
  const byDay = new Map<string, WorkDay>();
  const routineMap = new Map<string, number>();
  const swaps: string[] = [];
  const overCap: string[] = [];

  for (const s of sessions) {
    const key = istDateKey(s.started_at);
    let d = byDay.get(key);
    if (!d) {
      d = { key, label: formatDay(key), sessions: 0, workSets: 0, minutes: 0 };
      byDay.set(key, d);
    }
    d.sessions += 1;
    d.workSets += s.sets.filter((x) => x.kind === "work").length;
    d.minutes += s.minutes ?? 0;
    const name = snapshotName(s);
    routineMap.set(name, (routineMap.get(name) ?? 0) + 1);
    for (const set of s.sets) {
      if (set.planned_name && set.exercise_name && set.planned_name !== set.exercise_name) {
        const line = `${set.planned_name} → ${set.exercise_name}`;
        if (!swaps.includes(line)) swaps.push(line);
      }
    }
    const cap = timeCap(s);
    if (cap && s.minutes && s.minutes > cap) {
      overCap.push(`${name} ${s.minutes} min (cap ${cap})`);
    }
  }

  const days = [...byDay.values()].sort((a, b) => a.key.localeCompare(b.key));
  const routines = [...routineMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const lastCompounds: WorkReview["lastCompounds"] = [];
  const seenSlot = new Set<string>();
  for (const s of [...sessions].reverse()) {
    for (const set of [...s.sets].reverse()) {
      if (set.kind !== "work") continue;
      if (seenSlot.has(set.slot_key)) continue;
      seenSlot.add(set.slot_key);
      lastCompounds.push({
        slot: set.slot_key,
        name: set.exercise_name,
        kg: set.kg,
        reps: set.reps,
      });
    }
  }

  const stuck = stallLines(sessions);

  const lines: string[] = [];
  if (!sessions.length) {
    lines.push("No gym sessions in this window.");
  } else {
    lines.push(
      `${sessions.length} session${sessions.length === 1 ? "" : "s"} across ${days.length} day${days.length === 1 ? "" : "s"}.`,
    );
  }
  if (routines[0]) lines.push(`Most logged: ${routines[0].name} ×${routines[0].count}.`);
  if (overCap.length) lines.push(`Over time cap: ${overCap.join("; ")}.`);
  if (swaps.length) lines.push(`Swaps: ${swaps.join("; ")}.`);
  for (const st of stuck) lines.push(st);

  return {
    sessions,
    gymDays: days.length,
    routines,
    swaps,
    overCap,
    stuck,
    lastCompounds: lastCompounds.slice(0, 8),
    days,
    lines,
  };
}

export function workCsv(stats: WorkReview): string {
  const head = ["started_at", "routine", "minutes", "slot", "planned", "used", "kind", "kg", "reps", "rpe", "rir", "side"].join(",");
  const lines = [head];
  for (const s of stats.sessions) {
    if (!s.sets.length) {
      lines.push(
        [s.started_at, snapshotName(s), s.minutes ?? "", "", "", "", "", "", "", "", "", ""].join(","),
      );
      continue;
    }
    for (const set of s.sets) {
      lines.push(
        [
          s.started_at,
          snapshotName(s),
          s.minutes ?? "",
          set.slot_key,
          set.planned_name,
          set.exercise_name,
          set.kind,
          set.kg,
          set.reps,
          set.rpe ?? "",
          set.rir ?? "",
          set.side ?? "",
        ].join(","),
      );
    }
  }
  return lines.join("\n");
}

export function workText(stats: WorkReview, from: string, to: string): string {
  const lines = [
    "LAB // GYM",
    `Window: ${from} → ${to}`,
    ...stats.lines,
    "",
    "LAST WORKING SETS",
    ...(stats.lastCompounds.length
      ? stats.lastCompounds.map(
          (c) => `- ${c.name} (${c.slot})  ${c.kg} × ${c.reps}`,
        )
      : ["- none"]),
  ];
  return lines.join("\n");
}

export { volumeKg };
