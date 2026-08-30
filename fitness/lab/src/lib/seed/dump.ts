import { saveSleep } from "../recovery/db";
import { saveParsedSession, upsertRoutine } from "../workout/db";
import { saveSport } from "../workout/sportsDb";
import { getSupabase } from "../supabase";
import type { ParsedSession, Routine } from "../workout/types";

const MARK = "[dump]";

function set(slot: string, name: string, kg: number, reps: number) {
  return {
    slot,
    plannedName: name,
    usedName: name,
    scheme: "straight" as const,
    skipped: false,
    sets: [{ kind: "work" as const, kg, reps, rpe: null, rir: null, restSec: 180, side: null }],
  };
}

function night(wake: string, asleepHm: string, wakeHm: string, minutes: number, extra: string) {
  const same = asleepHm < wakeHm;
  const [y, m, d] = wake.split("-").map(Number);
  const prev = new Date(Date.UTC(y, m - 1, d - (same ? 0 : 1))).toISOString().slice(0, 10);
  const asleepKey = same ? wake : prev;
  return {
    kind: "night" as const,
    asleepAt: `${asleepKey}T${asleepHm}:00+05:30`,
    wakeAt: `${wake}T${wakeHm}:00+05:30`,
    minutes,
    notes: `${MARK} ${extra}`,
  };
}

function fromDur(wake: string, minutes: number, extra: string) {
  const wakeHm = "06:00";
  const total = 6 * 60 - minutes;
  const hh = String(Math.floor(((total % (24 * 60)) + 24 * 60) % (24 * 60) / 60)).padStart(2, "0");
  const mm = String(((total % (24 * 60)) + 24 * 60) % (24 * 60) % 60).padStart(2, "0");
  return night(wake, `${hh}:${mm}`, wakeHm, minutes, extra);
}

const SLEEP = [
  fromDur("2026-08-14", 404, "score 78 · 6h 44m"),
  fromDur("2026-08-15", 339, "score 46 · 5h 39m"),
  fromDur("2026-08-16", 190, "score 42 · 3h 10m"),
  fromDur("2026-08-17", 265, "score 50 · 4h 25m"),
  fromDur("2026-08-18", 145, "score 32 · 2h 25m"),
  night("2026-08-19", "00:55", "05:15", 253, "score 55 · 00:55–05:15"),
  fromDur("2026-08-20", 214, "score 49 · 3h 34m"),
  fromDur("2026-08-21", 157, "score 34 · 2h 37m"),
  night("2026-08-22", "05:14", "06:00", 46, "score 28 · 46m watch-off or nap counted as night"),
  night("2026-08-26", "23:39", "05:26", 346, "score 70 · 23:39–05:26"),
];

const NAPS = [
  {
    kind: "nap" as const,
    asleepAt: "2026-08-26T10:34:00+05:30",
    wakeAt: "2026-08-26T10:54:00+05:30",
    minutes: 20,
    notes: `${MARK} 10:34 · 20m`,
  },
  {
    kind: "nap" as const,
    asleepAt: "2026-08-26T16:48:00+05:30",
    wakeAt: "2026-08-26T17:03:00+05:30",
    minutes: 15,
    notes: `${MARK} 16:48 · 15m`,
  },
];

const SPORTS = [
  { startedAt: "2026-08-18T19:00:00+05:30", sport: "badminton", minutes: 68, hrAvg: 122, peakHr: null, notes: `${MARK} 1:08:17 · 599 kcal card` },
  { startedAt: "2026-08-18T20:15:00+05:30", sport: "table_tennis", minutes: 48, hrAvg: 117, peakHr: null, notes: `${MARK} 48:28` },
  { startedAt: "2026-08-19T18:00:00+05:30", sport: "table_tennis", minutes: 53, hrAvg: 112, peakHr: null, notes: `${MARK} 52:50` },
  { startedAt: "2026-08-19T19:00:00+05:30", sport: "table_tennis", minutes: 32, hrAvg: 121, peakHr: null, notes: `${MARK} 32:19` },
  { startedAt: "2026-08-22T06:51:00+05:30", sport: "badminton", minutes: 57, hrAvg: 151, peakHr: 190, notes: `${MARK} 57:16 · 151/190` },
  { startedAt: "2026-08-26T08:00:00+05:30", sport: "badminton", minutes: 93, hrAvg: 141, peakHr: null, notes: `${MARK} 1:33:18 · 141 avg` },
  { startedAt: "2026-08-26T14:00:00+05:30", sport: "walking", minutes: 14, hrAvg: null, peakHr: null, notes: `${MARK} Ahmedabad 0.54 km` },
];

function stub(name: string): Routine {
  return {
    name,
    tag: name.includes("watch") ? "extra" : "protocol",
    timeCapMin: 75,
    notes: MARK,
    blocks: [
      {
        id: "d1",
        slot: "other",
        scheme: "straight",
        restSec: 180,
        notes: "",
        exercises: [{ name: name, role: "primary", sides: "one", alternatives: [], sets: [] }],
      },
    ],
  };
}

const LIFTS: ParsedSession[] = [
  { routineName: "Black Pull", startedAt: "2025-12-16T19:50:00+05:30", minutes: 120, notes: `${MARK} Lyfta · pulldown 40×11`, actuals: [set("vertical_pull", "Lat pulldown", 40, 11)] },
  { routineName: "Thunder Legs", startedAt: "2025-12-17T19:50:00+05:30", minutes: 124, notes: `${MARK} Lyfta · press 90×11`, actuals: [set("squat", "Leg press", 90, 11)] },
  { routineName: "Black Pull", startedAt: "2025-12-23T19:50:00+05:30", minutes: 120, notes: `${MARK} Lyfta · pulldown 65×4`, actuals: [set("vertical_pull", "Lat pulldown", 65, 4)] },
  { routineName: "Iron Push", startedAt: "2026-01-03T19:50:00+05:30", minutes: 109, notes: `${MARK} Lyfta · chest press 50×10`, actuals: [set("horizontal_press", "Chest press", 50, 10)] },
  { routineName: "Thunder Legs", startedAt: "2026-02-07T19:50:00+05:30", minutes: 85, notes: `${MARK} Lyfta · press 115×11`, actuals: [set("squat", "Leg press", 115, 11)] },
  {
    routineName: "Evening mixed",
    startedAt: "2026-03-11T19:50:00+05:30",
    minutes: 117,
    notes: `${MARK} Lyfta · hack 110×10 · shoulder 50×12`,
    actuals: [set("squat", "Hack squat", 110, 10), set("vertical_press", "Shoulder press", 50, 12)],
  },
  { routineName: "Iron Push", startedAt: "2026-03-12T19:50:00+05:30", minutes: 114, notes: `${MARK} Lyfta · shoulder 60×8`, actuals: [set("vertical_press", "Shoulder press", 60, 8)] },
  { routineName: "Iron Push", startedAt: "2026-03-17T19:50:00+05:30", minutes: 116, notes: `${MARK} Lyfta · shoulder 60×10`, actuals: [set("vertical_press", "Shoulder press", 60, 10)] },
  {
    routineName: "Black Pull",
    startedAt: "2026-03-18T19:50:00+05:30",
    minutes: 126,
    notes: `${MARK} Lyfta · pulldown 50×15 · row 60×10`,
    actuals: [set("vertical_pull", "Lat pulldown", 50, 15), set("horizontal_pull", "Seated row", 60, 10)],
  },
  {
    routineName: "Iron Push",
    startedAt: "2026-03-23T19:50:00+05:30",
    minutes: 109,
    notes: `${MARK} Lyfta · DB bench 30×10 · shoulder 60×10`,
    actuals: [set("horizontal_press", "DB bench", 30, 10), set("vertical_press", "Shoulder press", 60, 10)],
  },
  { routineName: "Black Pull", startedAt: "2026-03-24T19:50:00+05:30", minutes: 100, notes: `${MARK} Lyfta · pulldown 55×10`, actuals: [set("vertical_pull", "Lat pulldown", 55, 10)] },
  {
    routineName: "Thunder Legs",
    startedAt: "2026-03-25T19:50:00+05:30",
    minutes: 94,
    notes: `${MARK} Lyfta · hack 100×10 · stairs 91×500`,
    actuals: [set("squat", "Hack squat", 100, 10), set("other", "Stairs", 91, 500)],
  },
  { routineName: "Run Maze", startedAt: "2026-03-26T19:50:00+05:30", minutes: 79, notes: `${MARK} Lyfta · core + treadmill`, actuals: [set("core", "Core", 0, 20)] },
  {
    routineName: "Black Pull",
    startedAt: "2026-03-30T19:50:00+05:30",
    minutes: 111,
    notes: `${MARK} Lyfta · bent row 45×12 · stairs 91×569`,
    actuals: [set("horizontal_pull", "Bent row", 45, 12), set("other", "Stairs", 91, 569)],
  },
  { routineName: "Iron Push", startedAt: "2026-04-07T19:50:00+05:30", minutes: 96, notes: `${MARK} Lyfta · DB bench 35×13`, actuals: [set("horizontal_press", "DB bench", 35, 13)] },
  {
    routineName: "Black Pull",
    startedAt: "2026-04-08T19:50:00+05:30",
    minutes: 130,
    notes: `${MARK} Lyfta · assisted pull-up −50×6 · stairs 92×795`,
    actuals: [set("vertical_pull", "Assisted pull-up", -50, 6), set("other", "Stairs", 92, 795)],
  },
  {
    routineName: "Black Pull",
    startedAt: "2026-04-13T19:50:00+05:30",
    minutes: 125,
    notes: `${MARK} Lyfta · assisted pull-up −50×11 · seated row 70×13`,
    actuals: [set("vertical_pull", "Assisted pull-up", -50, 11), set("horizontal_pull", "Seated row", 70, 13)],
  },
  { routineName: "Strength (watch)", startedAt: "2026-08-19T20:00:00+05:30", minutes: 57, notes: `${MARK} Garmin 56:43 · 1 set card`, actuals: [] },
  { routineName: "Strength (watch)", startedAt: "2026-08-26T19:50:00+05:30", minutes: 45, notes: `${MARK} Garmin 44:34 · 417 kcal card`, actuals: [] },
];

async function hasDump(table: string, userId: string): Promise<boolean> {
  const sb = getSupabase()!;
  const { data } = await sb.from(table).select("id").eq("user_id", userId).like("notes", `${MARK}%`).limit(1);
  return !!data?.length;
}

export async function dumpPresent(userId: string): Promise<boolean> {
  return (await hasDump("sport_logs", userId)) && (await hasDump("recovery_sleep", userId));
}

export async function importDump(userId: string): Promise<"loaded" | "already"> {
  const sleepIn = await hasDump("recovery_sleep", userId);
  const sportIn = await hasDump("sport_logs", userId);
  const liftIn = await hasDump("workout_sessions", userId);
  if (sleepIn && sportIn && liftIn) return "already";
  if (!sleepIn) {
    for (const s of [...SLEEP, ...NAPS]) {
      await saveSleep({ userId, ...s });
    }
  }
  if (!sportIn) {
    for (const s of SPORTS) {
      await saveSport({ userId, ...s });
    }
  }
  if (!liftIn) {
    const names = [...new Set(LIFTS.map((s) => s.routineName))];
    for (const name of names) {
      await upsertRoutine(userId, stub(name));
    }
    for (const s of LIFTS) {
      await saveParsedSession(userId, s);
    }
  }
  return "loaded";
}
