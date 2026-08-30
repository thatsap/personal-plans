export const SCHEMES = [
  "straight",
  "superset",
  "dropset",
  "rest_pause",
  "cluster",
  "giant",
] as const;
export type Scheme = (typeof SCHEMES)[number];

export const SET_KINDS = ["warmup", "work", "drop", "failure"] as const;
export type SetKind = (typeof SET_KINDS)[number];

export const ROUTINE_TAGS = ["protocol", "extra"] as const;
export type RoutineTag = (typeof ROUTINE_TAGS)[number];

export const SESSION_SOURCES = ["live", "json", "repeat"] as const;
export type SessionSource = (typeof SESSION_SOURCES)[number];

export const SLOTS = [
  "horizontal_press",
  "incline_press",
  "vertical_press",
  "lateral_raise",
  "tricep",
  "hinge",
  "vertical_pull",
  "horizontal_pull",
  "face_pull",
  "squat",
  "split_squat",
  "leg_curl",
  "calf",
  "bicep",
  "core",
  "other",
] as const;

export type Alternative = { name: string; why: string };

export type Drop = { kg: number; reps: number };

export type PrescribedSet = {
  kind: SetKind;
  kg: number | null;
  reps: number | null;
  repRange: string;
  rpe: number | null;
  rir: number | null;
  restSec: number | null;
  drops: Drop[];
};

export type RoutineExercise = {
  name: string;
  role: "primary" | "alt";
  sides: "one" | "both";
  alternatives: Alternative[];
  sets: PrescribedSet[];
};

export type RoutineBlock = {
  id: string;
  slot: string;
  scheme: Scheme;
  restSec: number | null;
  notes: string;
  exercises: RoutineExercise[];
};

export type Routine = {
  name: string;
  tag: RoutineTag;
  timeCapMin: number | null;
  notes: string;
  blocks: RoutineBlock[];
};

export type ActualSet = {
  kind: SetKind;
  kg: number;
  reps: number;
  rpe: number | null;
  rir: number | null;
  restSec: number | null;
  side: "L" | "R" | null;
};

export type ParsedActual = {
  slot: string;
  plannedName: string;
  usedName: string;
  scheme: Scheme;
  skipped: boolean;
  sets: ActualSet[];
};

export type ParsedSession = {
  routineName: string;
  startedAt: string;
  minutes: number | null;
  notes: string;
  actuals: ParsedActual[];
};

export type RoutineRow = {
  id: string;
  user_id: string;
  name: string;
  tag: RoutineTag;
  source_json: Routine;
  time_cap_min: number | null;
  last_used_at: string;
  created_at: string;
};

export type SessionRow = {
  id: string;
  user_id: string;
  routine_id: string | null;
  started_at: string;
  minutes: number | null;
  source: SessionSource;
  routine_snapshot: Routine | null;
  notes: string;
  created_at: string;
};

export type SetRow = {
  id: string;
  session_id: string;
  slot_key: string;
  exercise_name: string;
  planned_name: string;
  scheme: Scheme;
  sort_index: number;
  kg: number;
  reps: number;
  rpe: number | null;
  rir: number | null;
  kind: SetKind;
  side: "L" | "R" | null;
  rest_sec: number | null;
};

export type SessionWithSets = SessionRow & { sets: SetRow[] };

export type LastSlotHint = {
  slot: string;
  kg: number;
  reps: number;
  exercise: string;
};

export type LiveSet = {
  id: string;
  kind: SetKind;
  kg: string;
  reps: string;
  rpe: string;
  rir: string;
  restSec: number | null;
  side: "L" | "R" | null;
  done: boolean;
  plannedKg: number | null;
  plannedReps: number | null;
  plannedRpe: number | null;
  plannedRir: number | null;
  plannedRepRange: string;
};

export type LiveSlot = {
  key: string;
  slotKey: string;
  scheme: Scheme;
  restSec: number | null;
  plannedName: string;
  usedName: string;
  alternatives: Alternative[];
  skipped: boolean;
  sets: LiveSet[];
  lastHint: LastSlotHint | null;
};
