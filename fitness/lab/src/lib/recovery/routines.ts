import { expandDrillKeys } from "./plan";
import type { MobilityRoutine, MobilityTag } from "./types";

type Item = { drill: string; side?: "L" | "R" };

const STRETCH: {
  key: string;
  name: string;
  when: string;
  tag: Exclude<MobilityTag, "built">;
  minutes: number;
  items: Item[];
}[] = [
  {
    key: "office",
    name: "Office tension",
    when: "Desk, 6 min",
    tag: "desk",
    minutes: 6,
    items: [
      { drill: "neck_side" },
      { drill: "chin_tuck" },
      { drill: "trap_stretch" },
      { drill: "chest_chair" },
      { drill: "thoracic_seated" },
      { drill: "wrist_desk" },
      { drill: "hip_flexor" },
    ],
  },
  {
    key: "neck_traps",
    name: "Neck and traps",
    when: "2 min, anywhere",
    tag: "desk",
    minutes: 3,
    items: [{ drill: "neck_side" }, { drill: "chin_tuck" }, { drill: "trap_stretch" }],
  },
  {
    key: "hips_desk",
    name: "Hips after sitting",
    when: "Office or evening",
    tag: "desk",
    minutes: 8,
    items: [
      { drill: "hip_flexor" },
      { drill: "fig4" },
      { drill: "butterfly" },
      { drill: "hip90" },
      { drill: "worlds" },
    ],
  },
  {
    key: "after_badminton",
    name: "After badminton",
    when: "Court cooldown",
    tag: "court",
    minutes: 8,
    items: [
      { drill: "quad_stand" },
      { drill: "hip_flexor" },
      { drill: "fig4" },
      { drill: "butterfly" },
      { drill: "calf_wall" },
      { drill: "shoulder_cross" },
      { drill: "wrist_desk" },
      { drill: "child_pose" },
    ],
  },
  {
    key: "after_pull",
    name: "After back day",
    when: "Post Black Pull",
    tag: "lift",
    minutes: 6,
    items: [
      { drill: "lat_hang" },
      { drill: "lat_reach" },
      { drill: "bicep_wall" },
      { drill: "rear_delt" },
      { drill: "child_pose" },
    ],
  },
  {
    key: "after_legs",
    name: "After leg day",
    when: "Post Thunder Legs",
    tag: "lift",
    minutes: 8,
    items: [
      { drill: "quad_stand" },
      { drill: "ham_hinge" },
      { drill: "pigeon" },
      { drill: "calf_wall" },
      { drill: "hip_flexor" },
      { drill: "butterfly" },
    ],
  },
  {
    key: "after_push",
    name: "After push day",
    when: "Post Iron Push",
    tag: "lift",
    minutes: 6,
    items: [
      { drill: "chest_door" },
      { drill: "tri_overhead" },
      { drill: "shoulder_cross" },
      { drill: "lat_hang" },
      { drill: "pec_floor" },
    ],
  },
  {
    key: "after_hiit",
    name: "After HIIT",
    when: "Thursday cooldown",
    tag: "lift",
    minutes: 6,
    items: [
      { drill: "hip_flexor" },
      { drill: "quad_stand" },
      { drill: "ham_hinge" },
      { drill: "calf_wall" },
      { drill: "child_pose" },
    ],
  },
  {
    key: "sunday",
    name: "Sunday mobility",
    when: "Active recovery, not a chest day",
    tag: "full",
    minutes: 12,
    items: [
      { drill: "cat_cow" },
      { drill: "worlds" },
      { drill: "hip_circles" },
      { drill: "thoracic_quad" },
      { drill: "chest_door" },
      { drill: "pigeon" },
      { drill: "ham_hinge" },
      { drill: "lat_hang" },
    ],
  },
];

export const MOBILITY: MobilityRoutine[] = STRETCH.map((r) => ({
  key: r.key,
  name: r.name,
  when: r.when,
  tag: r.tag,
  minutes: r.minutes,
  moves: expandDrillKeys(r.items),
}));

export function getRoutine(key: string): MobilityRoutine | undefined {
  return MOBILITY.find((r) => r.key === key);
}

export function routineLabel(key: string): string {
  return getRoutine(key)?.name ?? key.replace(/_/g, " ");
}

export const MOBILITY_GROUPS: { tag: Exclude<MobilityTag, "built">; title: string }[] = [
  { tag: "desk", title: "Desk" },
  { tag: "court", title: "After court" },
  { tag: "lift", title: "After lift" },
  { tag: "full", title: "Sunday" },
];
