export const NIGHT_TARGET_MIN = 8 * 60;
export const NIGHT_FLOOR_MIN = 6 * 60;

export type SleepKind = "night" | "nap";

export type SleepRow = {
  id: string;
  user_id: string;
  kind: SleepKind;
  asleep_at: string;
  wake_at: string;
  minutes: number;
  notes: string;
  created_at: string;
};

export type MobilityRow = {
  id: string;
  user_id: string;
  routine_key: string;
  started_at: string;
  minutes: number;
  moves_done: number;
  moves_total: number;
  notes: string;
  created_at: string;
};

export type MobilityTag = "desk" | "lift" | "court" | "full" | "built";

export const BODY_PARTS = [
  "neck",
  "shoulders",
  "chest",
  "lats",
  "thoracic",
  "low_back",
  "hips",
  "glutes",
  "quads",
  "hamstrings",
  "adductors",
  "calves",
  "ankles",
  "wrists",
] as const;

export type BodyPart = (typeof BODY_PARTS)[number];

export const PART_LABEL: Record<BodyPart, string> = {
  neck: "Neck",
  shoulders: "Shoulders",
  chest: "Chest",
  lats: "Lats",
  thoracic: "T-spine",
  low_back: "Low back",
  hips: "Hips",
  glutes: "Glutes",
  quads: "Quads",
  hamstrings: "Hamstrings",
  adductors: "Adductors",
  calves: "Calves",
  ankles: "Ankles",
  wrists: "Wrists",
};

export type Drill = {
  key: string;
  name: string;
  parts: BodyPart[];
  holdSec: number;
  bilateral: boolean;
  do: string;
  avoid: string;
  confirm: string;
};

export type MobilityMove = {
  key: string;
  name: string;
  side?: "L" | "R";
  holdSec: number;
  cue: string;
  do: string;
  avoid: string;
  confirm: string;
};

export type MobilityRoutine = {
  key: string;
  name: string;
  when: string;
  tag: MobilityTag;
  minutes: number;
  moves: MobilityMove[];
};
