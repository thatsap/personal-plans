import { barLabel, eachDayKeys, istDateKey } from "../dates";
import { routineLabel } from "./routines";
import { fmtHours } from "./time";
import { NIGHT_FLOOR_MIN, NIGHT_TARGET_MIN, type MobilityRow, type SleepRow } from "./types";

export type SleepDay = {
  key: string;
  label: string;
  night: number;
  nap: number;
};

export type RecReview = {
  nights: number;
  nightMin: number;
  avgNightMin: number;
  naps: number;
  napMin: number;
  underFloor: number;
  mobility: number;
  lines: string[];
  days: SleepDay[];
};

export function rollupRecovery(sleep: SleepRow[], mobility: MobilityRow[], from?: string, to?: string): RecReview {
  const nights = sleep.filter((s) => s.kind === "night");
  const naps = sleep.filter((s) => s.kind === "nap");
  const nightMin = nights.reduce((n, s) => n + s.minutes, 0);
  const napMin = naps.reduce((n, s) => n + s.minutes, 0);
  const avgNightMin = nights.length ? Math.round(nightMin / nights.length) : 0;
  const underFloor = nights.filter((s) => s.minutes < NIGHT_FLOOR_MIN).length;
  const lines: string[] = [];
  if (nights.length && avgNightMin < NIGHT_FLOOR_MIN) {
    lines.push(`Night floor broken — avg ${fmtHours(avgNightMin)} vs ${fmtHours(NIGHT_TARGET_MIN)} target.`);
  }
  if (naps.length >= 2) {
    lines.push(`${naps.length} naps. Garmin already said multiples wreck rhythm.`);
  }
  const byKey = new Map<string, number>();
  for (const m of mobility) {
    byKey.set(m.routine_key, (byKey.get(m.routine_key) ?? 0) + 1);
  }
  for (const [k, n] of byKey) {
    lines.push(`${routineLabel(k)} ×${n}`);
  }
  const keys = from && to ? eachDayKeys(from, to) : [];
  const span = keys.length;
  const dayMap = new Map(keys.map((k) => [k, { key: k, label: barLabel(k, span), night: 0, nap: 0 }]));
  for (const s of nights) {
    const k = istDateKey(s.wake_at);
    const d = dayMap.get(k);
    if (d) d.night += s.minutes;
  }
  for (const s of naps) {
    const k = istDateKey(s.asleep_at);
    const d = dayMap.get(k);
    if (d) d.nap += s.minutes;
  }
  return {
    nights: nights.length,
    nightMin,
    avgNightMin,
    naps: naps.length,
    napMin,
    underFloor,
    mobility: mobility.length,
    lines,
    days: [...dayMap.values()],
  };
}

export function recoveryText(stats: RecReview, from: string, to: string, sleep: SleepRow[], mobility: MobilityRow[]) {
  const lines = [
    "LAB // RECOVERY",
    `Window: ${from} → ${to}`,
    `Nights: ${stats.nights}  avg ${fmtHours(stats.avgNightMin)}  target ${fmtHours(NIGHT_TARGET_MIN)}`,
    `Under ${fmtHours(NIGHT_FLOOR_MIN)}: ${stats.underFloor}`,
    `Naps: ${stats.naps}  ${fmtHours(stats.napMin)}`,
    `Mobility sessions: ${stats.mobility}`,
    "",
    ...stats.lines.map((l) => `- ${l}`),
    "",
    "SLEEP",
    ...sleep.map((s) => `- ${s.kind}  ${fmtHours(s.minutes)}  ${s.asleep_at} → ${s.wake_at}`),
    "",
    "MOBILITY",
    ...mobility.map((m) => `- ${routineLabel(m.routine_key)}  ${m.minutes} min  ${m.moves_done}/${m.moves_total}`),
  ];
  return lines.join("\n");
}

export function recoveryCsv(sleep: SleepRow[], mobility: MobilityRow[]) {
  const sLines = [
    "sleep",
    "kind,asleep_at,wake_at,minutes",
    ...sleep.map((s) => [s.kind, s.asleep_at, s.wake_at, s.minutes].join(",")),
  ];
  const mLines = [
    "",
    "mobility",
    "started_at,routine,minutes,moves_done,moves_total",
    ...mobility.map((m) => [m.started_at, m.routine_key, m.minutes, m.moves_done, m.moves_total].join(",")),
  ];
  return [...sLines, ...mLines].join("\n");
}
