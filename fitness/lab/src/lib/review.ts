import { formatDay, istDateKey } from "./dates";
import { KCAL_TARGET, PROTEIN_TARGET, type IngestionRow } from "./types";

export type DayRollup = {
  key: string;
  label: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  junk: number;
  snack: number;
  protocol: number;
  items: number;
  overKcal: boolean;
  underProtein: boolean;
  onTarget: boolean;
};

export type ReviewStats = {
  days: DayRollup[];
  avgKcal: number;
  avgProtein: number;
  totalJunk: number;
  totalProtocol: number;
  daysOver: number;
  daysProteinHit: number;
  daysOnTarget: number;
  topJunk: { name: string; kcal: number; count: number }[];
  wrong: string[];
  right: string[];
};

export function rollup(rows: IngestionRow[]): ReviewStats {
  const map = new Map<string, DayRollup>();
  const junkMap = new Map<string, { name: string; kcal: number; count: number }>();

  for (const r of rows) {
    const key = istDateKey(r.eaten_at);
    let d = map.get(key);
    if (!d) {
      d = {
        key,
        label: formatDay(key),
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        junk: 0,
        snack: 0,
        protocol: 0,
        items: 0,
        overKcal: false,
        underProtein: false,
        onTarget: false,
      };
      map.set(key, d);
    }
    d.kcal += r.kcal;
    d.protein += r.protein_g;
    d.carbs += r.carbs_g;
    d.fat += r.fat_g;
    d.items += 1;
    if (r.tag === "junk") d.junk += 1;
    if (r.tag === "snack") d.snack += 1;
    if (r.tag === "protocol") d.protocol += 1;
    if (r.tag === "junk") {
      const j = junkMap.get(r.name) ?? { name: r.name, kcal: 0, count: 0 };
      j.kcal += r.kcal;
      j.count += 1;
      junkMap.set(r.name, j);
    }
  }

  const days = [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  for (const d of days) {
    d.overKcal = d.kcal > KCAL_TARGET;
    d.underProtein = d.protein < PROTEIN_TARGET;
    d.onTarget = !d.overKcal && !d.underProtein;
  }

  const n = days.length || 1;
  const avgKcal = Math.round(days.reduce((s, d) => s + d.kcal, 0) / n);
  const avgProtein = Math.round(days.reduce((s, d) => s + d.protein, 0) / n);
  const totalJunk = days.reduce((s, d) => s + d.junk, 0);
  const totalProtocol = days.reduce((s, d) => s + d.protocol, 0);
  const daysOver = days.filter((d) => d.overKcal).length;
  const daysProteinHit = days.filter((d) => !d.underProtein).length;
  const daysOnTarget = days.filter((d) => d.onTarget).length;

  const topJunk = [...junkMap.values()]
    .sort((a, b) => b.kcal - a.kcal)
    .slice(0, 5);

  const wrong: string[] = [];
  const right: string[] = [];
  if (daysOver) {
    wrong.push(
      `${daysOver} day${daysOver === 1 ? "" : "s"} over ${KCAL_TARGET} kcal.`,
    );
  }
  const missP = days.filter((d) => d.underProtein).length;
  if (missP) {
    wrong.push(`${missP} day${missP === 1 ? "" : "s"} under ${PROTEIN_TARGET} g protein.`);
  }
  if (totalJunk) {
    wrong.push(`${totalJunk} junk log${totalJunk === 1 ? "" : "s"} in this window.`);
  }
  if (topJunk[0]) {
    wrong.push(`Biggest junk: ${topJunk[0].name} (${topJunk[0].kcal} kcal).`);
  }
  if (daysOnTarget) {
    right.push(
      `${daysOnTarget} day${daysOnTarget === 1 ? "" : "s"} hit calories and protein.`,
    );
  }
  if (totalProtocol) {
    right.push(`${totalProtocol} protocol meal${totalProtocol === 1 ? "" : "s"} logged.`);
  }
  if (daysProteinHit && missP === 0 && days.length) {
    right.push("Protein held every day in this window.");
  }
  if (!days.length) {
    wrong.push("No logs in this window. The leak is an empty day.");
  }
  if (!wrong.length && days.length) {
    right.push("Window is clean vs 2455 / 214. Keep the log boring.");
  }

  return {
    days,
    avgKcal,
    avgProtein,
    totalJunk,
    totalProtocol,
    daysOver,
    daysProteinHit,
    daysOnTarget,
    topJunk,
    wrong,
    right,
  };
}
