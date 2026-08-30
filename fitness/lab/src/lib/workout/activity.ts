import { barLabel, eachDayKeys, istDateKey } from "../dates";
import { sportLabel, type SportRow } from "./sports";
import { volumeKg } from "./live";
import type { SessionWithSets } from "./types";

export type DayActivity = {
  key: string;
  label: string;
  liftMin: number;
  sportMin: number;
  volume: number;
  liftSessions: number;
  sportLogs: number;
};

export type SportBreak = {
  sport: string;
  label: string;
  minutes: number;
  count: number;
  hr: number | null;
};

export type ActivityRollup = {
  days: DayActivity[];
  liftMin: number;
  sportMin: number;
  volume: number;
  liftSessions: number;
  sportLogs: number;
  bySport: SportBreak[];
  avgHr: number | null;
};

function emptyDay(key: string, span: number): DayActivity {
  return {
    key,
    label: barLabel(key, span),
    liftMin: 0,
    sportMin: 0,
    volume: 0,
    liftSessions: 0,
    sportLogs: 0,
  };
}

function weekStart(key: string, origin: string): string {
  const keys = eachDayKeys(origin, key);
  const i = keys.length - 1;
  const back = i % 7;
  return keys[i - back] ?? key;
}

export function rollupActivity(
  from: string,
  to: string,
  sessions: SessionWithSets[],
  sports: SportRow[],
): ActivityRollup {
  const keys = eachDayKeys(from, to);
  const span = keys.length;
  const daily = new Map(keys.map((k) => [k, emptyDay(k, span)]));

  for (const s of sessions) {
    const d = daily.get(istDateKey(s.started_at));
    if (!d) continue;
    d.liftMin += s.minutes ?? 0;
    d.liftSessions += 1;
    d.volume += volumeKg(s.sets.filter((x) => x.kind === "work"));
  }
  for (const s of sports) {
    const d = daily.get(istDateKey(s.started_at));
    if (!d) continue;
    d.sportMin += s.minutes;
    d.sportLogs += 1;
  }

  let days = [...daily.values()];
  if (span > 35) {
    const weeks = new Map<string, DayActivity>();
    for (const d of days) {
      const wk = weekStart(d.key, from);
      let w = weeks.get(wk);
      if (!w) {
        w = {
          key: wk,
          label: wk.slice(5),
          liftMin: 0,
          sportMin: 0,
          volume: 0,
          liftSessions: 0,
          sportLogs: 0,
        };
        weeks.set(wk, w);
      }
      w.liftMin += d.liftMin;
      w.sportMin += d.sportMin;
      w.volume += d.volume;
      w.liftSessions += d.liftSessions;
      w.sportLogs += d.sportLogs;
    }
    days = [...weeks.values()];
  }

  const byMap = new Map<string, { minutes: number; count: number; hrSum: number; hrN: number }>();
  for (const s of sports) {
    const cur = byMap.get(s.sport) ?? { minutes: 0, count: 0, hrSum: 0, hrN: 0 };
    cur.minutes += s.minutes;
    cur.count += 1;
    if (s.hr_avg) {
      cur.hrSum += s.hr_avg;
      cur.hrN += 1;
    }
    byMap.set(s.sport, cur);
  }
  const bySport: SportBreak[] = [...byMap.entries()]
    .map(([sport, v]) => ({
      sport,
      label: sportLabel(sport),
      minutes: v.minutes,
      count: v.count,
      hr: v.hrN ? Math.round(v.hrSum / v.hrN) : null,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  const hrs = sports.map((s) => s.hr_avg).filter((n): n is number => n !== null);
  const liftMin = sessions.reduce((n, s) => n + (s.minutes ?? 0), 0);
  const sportMin = sports.reduce((n, s) => n + s.minutes, 0);
  const volume = sessions.reduce(
    (n, s) => n + volumeKg(s.sets.filter((x) => x.kind === "work")),
    0,
  );

  return {
    days,
    liftMin,
    sportMin,
    volume,
    liftSessions: sessions.length,
    sportLogs: sports.length,
    bySport,
    avgHr: hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : null,
  };
}

export function fmtMin(n: number): string {
  if (n < 60) return `${n}m`;
  const h = Math.floor(n / 60);
  const m = n % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function fmtVol(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}t`;
  return `${n} kg`;
}
