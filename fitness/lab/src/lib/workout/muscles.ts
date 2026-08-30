import type { SessionWithSets } from "./types";

export const MUSCLE_GROUPS = [
  { id: "chest", label: "Chest", slots: ["horizontal_press", "incline_press"] },
  { id: "shoulders", label: "Shoulders", slots: ["vertical_press", "lateral_raise"] },
  { id: "triceps", label: "Triceps", slots: ["tricep"] },
  { id: "back", label: "Back", slots: ["vertical_pull", "horizontal_pull", "face_pull"] },
  { id: "biceps", label: "Biceps", slots: ["bicep"] },
  { id: "abs", label: "Abs", slots: ["core"] },
  { id: "quads", label: "Quads", slots: ["squat", "split_squat"] },
  { id: "hams", label: "Hams", slots: ["hinge", "leg_curl"] },
  { id: "calves", label: "Calves", slots: ["calf"] },
] as const;

export type MuscleHit = {
  id: string;
  label: string;
  sets: number;
  score: number;
};

export function muscleCoverage(sessions: SessionWithSets[]): {
  hits: MuscleHit[];
  missed: string[];
} {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    for (const set of s.sets) {
      if (set.kind !== "work" && set.kind !== "drop" && set.kind !== "failure") continue;
      const g = MUSCLE_GROUPS.find((m) => (m.slots as readonly string[]).includes(set.slot_key));
      if (!g) continue;
      counts.set(g.id, (counts.get(g.id) ?? 0) + 1);
    }
  }
  const max = Math.max(1, ...MUSCLE_GROUPS.map((g) => counts.get(g.id) ?? 0));
  const hits: MuscleHit[] = MUSCLE_GROUPS.map((g) => {
    const sets = counts.get(g.id) ?? 0;
    return {
      id: g.id,
      label: g.label,
      sets,
      score: sets ? Math.max(0.18, sets / max) : 0,
    };
  });
  return {
    hits,
    missed: hits.filter((h) => h.sets === 0).map((h) => h.label),
  };
}
