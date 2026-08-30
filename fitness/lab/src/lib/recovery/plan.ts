import { DRILLS, getDrill, PART_NEAR } from "./drills";
import type { BodyPart, Drill, MobilityMove, MobilityRoutine } from "./types";
import { PART_LABEL } from "./types";

export function drillToMoves(d: Drill, side?: "L" | "R"): MobilityMove[] {
  const one = (s?: "L" | "R"): MobilityMove => ({
    key: s ? `${d.key}_${s.toLowerCase()}` : d.key,
    name: d.name,
    side: s,
    holdSec: d.holdSec,
    cue: d.do,
    do: d.do,
    avoid: d.avoid,
    confirm: d.confirm,
  });
  if (side) return [one(side)];
  if (d.bilateral) return [one("L"), one("R")];
  return [one()];
}

function scoreDrill(d: Drill, parts: BodyPart[]): number {
  let n = 0;
  for (const p of parts) {
    const i = d.parts.indexOf(p);
    if (i === 0) n += 3;
    else if (i > 0) n += 2;
  }
  return n;
}

function rotate<T>(arr: T[], by: number): T[] {
  if (!arr.length) return arr;
  const n = ((by % arr.length) + arr.length) % arr.length;
  return [...arr.slice(n), ...arr.slice(0, n)];
}

export function buildMobilityPlan(parts: BodyPart[], minutes: number): MobilityRoutine {
  const want = Math.max(5, Math.min(20, Math.round(minutes)));
  const budget = want * 52;
  const seed = new Date().getDate() + parts.join("").length;

  const picked = new Set<string>();
  const moves: MobilityMove[] = [];
  let used = 0;

  const take = (list: Drill[]) => {
    for (const d of list) {
      if (picked.has(d.key)) continue;
      const chunk = drillToMoves(d);
      const cost = chunk.reduce((n, m) => n + m.holdSec, 0);
      if (used > 0 && used + cost > budget * 1.12) continue;
      picked.add(d.key);
      moves.push(...chunk);
      used += cost;
      if (used >= budget) break;
    }
  };

  const primary = rotate(
    DRILLS.filter((d) => d.parts.some((p) => parts.includes(p))).sort(
      (a, b) => scoreDrill(b, parts) - scoreDrill(a, parts),
    ),
    seed,
  );
  take(primary);

  if (used < budget * 0.75) {
    const near = [...new Set(parts.flatMap((p) => PART_NEAR[p]))].filter((p) => !parts.includes(p));
    const secondary = rotate(
      DRILLS.filter((d) => d.parts.some((p) => near.includes(p))),
      seed + 3,
    );
    take(secondary);
  }

  if (used < budget * 0.55) {
    take(rotate(DRILLS.filter((d) => d.key === "cat_cow" || d.key === "worlds" || d.key === "child_pose"), seed));
  }

  const names = parts.map((p) => PART_LABEL[p]).join(" + ");
  return {
    key: `built_${parts.join("_")}_${want}`,
    name: names,
    when: `${want} min · built`,
    tag: "built",
    minutes: want,
    moves,
  };
}

export function expandDrillKeys(items: { drill: string; side?: "L" | "R" }[]): MobilityMove[] {
  const out: MobilityMove[] = [];
  for (const it of items) {
    const d = getDrill(it.drill);
    if (!d) continue;
    out.push(...drillToMoves(d, it.side));
  }
  return out;
}

export const PLAN_STORE = "lab.mob.plan";

export function writePlan(plan: MobilityRoutine) {
  sessionStorage.setItem(PLAN_STORE, JSON.stringify(plan));
}

export function readPlan(): MobilityRoutine | null {
  try {
    const raw = sessionStorage.getItem(PLAN_STORE);
    if (!raw) return null;
    const p = JSON.parse(raw) as MobilityRoutine;
    if (!p?.moves?.length) return null;
    return p;
  } catch {
    return null;
  }
}
