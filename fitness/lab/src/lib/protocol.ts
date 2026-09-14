import type { RoutineRow } from "./workout/types";

export type DayPlan = {
  liftName: string | null;
  blurb: string;
  recover: boolean;
};

export function protocolDay(weekday: number): DayPlan {
  switch (weekday) {
    case 1:
      return { liftName: "Iron Push", blurb: "Push A", recover: false };
    case 2:
      return { liftName: "Black Pull", blurb: "Pull A", recover: false };
    case 3:
      return { liftName: "Thunder Legs", blurb: "Legs", recover: false };
    case 4:
      return { liftName: null, blurb: "HIIT / extra", recover: false };
    case 5:
      return { liftName: "Iron Push", blurb: "Push B", recover: false };
    case 6:
      return { liftName: "Black Pull", blurb: "Pull B", recover: false };
    default:
      return { liftName: null, blurb: "Sunday mobility", recover: true };
  }
}

export function matchRoutine(routines: RoutineRow[], name: string): RoutineRow | null {
  const n = name.toLowerCase();
  return (
    routines.find((r) => r.name.toLowerCase() === n) ??
    routines.find((r) => r.name.toLowerCase().includes(n)) ??
    null
  );
}
