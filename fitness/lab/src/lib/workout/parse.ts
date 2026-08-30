import { nowIso } from "../dates";
import { num } from "../math";
import {
  ROUTINE_TAGS,
  SCHEMES,
  SET_KINDS,
  type Alternative,
  type Drop,
  type ParsedActual,
  type ParsedSession,
  type PrescribedSet,
  type Routine,
  type RoutineBlock,
  type RoutineExercise,
  type RoutineTag,
  type Scheme,
  type SetKind,
} from "./types";

function stripFences(raw: string): string {
  const t = raw.trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (m ? m[1] : t).trim();
}

function isScheme(v: unknown): v is Scheme {
  return typeof v === "string" && (SCHEMES as readonly string[]).includes(v);
}

function isKind(v: unknown): v is SetKind {
  return typeof v === "string" && (SET_KINDS as readonly string[]).includes(v);
}

function isTag(v: unknown): v is RoutineTag {
  return typeof v === "string" && (ROUTINE_TAGS as readonly string[]).includes(v);
}

function optNum(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = num(v, NaN);
  return Number.isFinite(n) ? n : null;
}

function parseDrops(raw: unknown): Drop[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((d) => d && typeof d === "object")
    .map((d) => {
      const o = d as Record<string, unknown>;
      return { kg: num(o.kg), reps: num(o.reps) };
    });
}

function parseSet(raw: Record<string, unknown>): PrescribedSet {
  const kind = isKind(raw.kind) ? raw.kind : raw.type && isKind(raw.type) ? raw.type : "work";
  return {
    kind,
    kg: optNum(raw.kg),
    reps: optNum(raw.reps),
    repRange: String(raw.repRange ?? ""),
    rpe: optNum(raw.rpe),
    rir: optNum(raw.rir),
    restSec: optNum(raw.restSec),
    drops: parseDrops(raw.drops),
  };
}

function parseAlts(raw: unknown): Alternative[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((a) => {
      if (typeof a === "string") return { name: a, why: "" };
      if (a && typeof a === "object") {
        const o = a as Record<string, unknown>;
        const name = String(o.name ?? "").trim();
        if (!name) return null;
        return { name, why: String(o.why ?? "") };
      }
      return null;
    })
    .filter((a): a is Alternative => !!a);
}

function parseExercise(raw: Record<string, unknown>, i: number): RoutineExercise {
  const name = String(raw.name ?? "").trim();
  if (!name) throw new Error(`Exercise ${i + 1} needs a name.`);
  const setsRaw = Array.isArray(raw.sets) ? raw.sets : [];
  return {
    name,
    role: raw.role === "alt" ? "alt" : "primary",
    sides: raw.sides === "both" ? "both" : "one",
    alternatives: parseAlts(raw.alternatives),
    sets: setsRaw
      .filter((s) => s && typeof s === "object")
      .map((s) => parseSet(s as Record<string, unknown>)),
  };
}

function parseBlock(raw: Record<string, unknown>, i: number): RoutineBlock {
  const slot = String(raw.slot ?? raw.slotKey ?? "").trim() || "other";
  const scheme = isScheme(raw.scheme) ? raw.scheme : "straight";
  const exercisesRaw = Array.isArray(raw.exercises) ? raw.exercises : [];
  if (!exercisesRaw.length) throw new Error(`Block ${i + 1} (${slot}) needs exercises.`);
  const exercises = exercisesRaw.map((e, j) => {
    if (!e || typeof e !== "object") throw new Error(`Block ${i + 1} exercise ${j + 1} is not an object.`);
    return parseExercise(e as Record<string, unknown>, j);
  });
  return {
    id: String(raw.id ?? `block-${i + 1}`),
    slot,
    scheme,
    restSec: optNum(raw.restSec),
    notes: String(raw.notes ?? ""),
    exercises,
  };
}

export function parseRoutineObject(raw: Record<string, unknown>): Routine {
  const name = String(raw.name ?? "").trim();
  if (!name) throw new Error("Routine needs a name.");
  const tag = isTag(raw.tag) ? raw.tag : "protocol";
  const blocksRaw = Array.isArray(raw.blocks) ? raw.blocks : [];
  if (!blocksRaw.length) throw new Error("Routine needs at least one block.");
  return {
    name,
    tag,
    timeCapMin: optNum(raw.timeCapMin),
    notes: String(raw.notes ?? ""),
    blocks: blocksRaw.map((b, i) => {
      if (!b || typeof b !== "object") throw new Error(`Block ${i + 1} is not an object.`);
      return parseBlock(b as Record<string, unknown>, i);
    }),
  };
}

function parseActualSet(raw: Record<string, unknown>): {
  kind: SetKind;
  kg: number;
  reps: number;
  rpe: number | null;
  rir: number | null;
  restSec: number | null;
  side: "L" | "R" | null;
} {
  const kind = isKind(raw.kind) ? raw.kind : "work";
  const side = raw.side === "L" || raw.side === "R" ? raw.side : null;
  return {
    kind,
    kg: num(raw.kg),
    reps: num(raw.reps),
    rpe: optNum(raw.rpe),
    rir: optNum(raw.rir),
    restSec: optNum(raw.restSec),
    side,
  };
}

function parseActual(raw: Record<string, unknown>): ParsedActual {
  const slot = String(raw.slot ?? raw.slotKey ?? "").trim() || "other";
  const usedName = String(raw.usedName ?? raw.exercise ?? raw.name ?? "").trim();
  const plannedName = String(raw.plannedName ?? usedName).trim();
  if (!raw.skipped && !usedName) throw new Error(`Actual for ${slot} needs usedName.`);
  const setsRaw = Array.isArray(raw.sets) ? raw.sets : [];
  return {
    slot,
    plannedName,
    usedName: usedName || plannedName,
    scheme: isScheme(raw.scheme) ? raw.scheme : "straight",
    skipped: raw.skipped === true,
    sets: setsRaw
      .filter((s) => s && typeof s === "object")
      .map((s) => parseActualSet(s as Record<string, unknown>)),
  };
}

export function parseSessionObject(raw: Record<string, unknown>): ParsedSession {
  const routineName = String(raw.routineName ?? raw.name ?? "").trim();
  if (!routineName) throw new Error("Session needs routineName.");
  const actualsRaw = Array.isArray(raw.actuals) ? raw.actuals : [];
  return {
    routineName,
    startedAt:
      typeof raw.startedAt === "string" && raw.startedAt.trim()
        ? raw.startedAt
        : nowIso(),
    minutes: optNum(raw.minutes),
    notes: String(raw.notes ?? ""),
    actuals: actualsRaw
      .filter((a) => a && typeof a === "object")
      .map((a) => parseActual(a as Record<string, unknown>)),
  };
}

export type ParsedWorkoutJson =
  | { kind: "routine"; routine: Routine }
  | { kind: "session"; session: ParsedSession };

export function parseWorkoutJson(raw: string): ParsedWorkoutJson {
  const text = stripFences(raw);
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Not valid JSON. Copy the model output only.");
  }
  if (!data || typeof data !== "object") throw new Error("JSON must be an object.");
  const obj = data as Record<string, unknown>;
  const kind = String(obj.kind ?? "").toLowerCase();
  if (kind === "session") {
    return { kind: "session", session: parseSessionObject(obj) };
  }
  if (kind === "routine" || obj.routine) {
    const inner =
      obj.routine && typeof obj.routine === "object"
        ? (obj.routine as Record<string, unknown>)
        : obj;
    return { kind: "routine", routine: parseRoutineObject(inner) };
  }
  if (Array.isArray(obj.actuals) || obj.routineName) {
    return { kind: "session", session: parseSessionObject(obj) };
  }
  if (Array.isArray(obj.blocks) || obj.name) {
    return { kind: "routine", routine: parseRoutineObject(obj) };
  }
  throw new Error('JSON needs kind "routine" or "session".');
}
