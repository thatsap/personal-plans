import type { LastSlotHint, LiveSet, LiveSlot, PrescribedSet, Routine, SessionWithSets } from "./types";

function nid(): string {
  return crypto.randomUUID();
}

function asStr(n: number | null): string {
  return n === null || n === undefined ? "" : String(n);
}

function expandPrescribed(p: PrescribedSet): PrescribedSet[] {
  const out: PrescribedSet[] = [{ ...p, drops: [] }];
  for (const d of p.drops) {
    out.push({
      kind: "drop",
      kg: d.kg,
      reps: d.reps,
      repRange: "",
      rpe: null,
      rir: null,
      restSec: null,
      drops: [],
    });
  }
  return out;
}

function toLiveSet(p: PrescribedSet, side: "L" | "R" | null): LiveSet {
  return {
    id: nid(),
    kind: p.kind,
    kg: asStr(p.kg),
    reps: asStr(p.reps),
    rpe: p.kind === "warmup" ? "" : asStr(p.rpe),
    rir: p.kind === "warmup" ? "" : asStr(p.rir),
    restSec: p.restSec,
    side,
    done: false,
    plannedKg: p.kg,
    plannedReps: p.reps,
    plannedRpe: p.rpe,
    plannedRir: p.rir,
    plannedRepRange: p.repRange,
  };
}

export function blankSet(kind: LiveSet["kind"] = "work"): LiveSet {
  return {
    id: nid(),
    kind,
    kg: "",
    reps: "",
    rpe: "",
    rir: "",
    restSec: null,
    side: null,
    done: false,
    plannedKg: null,
    plannedReps: null,
    plannedRpe: null,
    plannedRir: null,
    plannedRepRange: "",
  };
}

export function routineToLive(
  routine: Routine,
  hints: LastSlotHint[] = [],
): LiveSlot[] {
  const hintMap = new Map(hints.map((h) => [h.slot, h]));
  const slots: LiveSlot[] = [];
  for (const block of routine.blocks) {
    const primaries = block.exercises.filter((e) => e.role !== "alt");
    const list = primaries.length ? primaries : block.exercises;
    list.forEach((ex, i) => {
      const prescribed = (ex.sets.length ? ex.sets : [{ kind: "work" as const, kg: null, reps: null, repRange: "", rpe: null, rir: null, restSec: block.restSec, drops: [] }]).flatMap(expandPrescribed);
      const sides = ex.sides === "both" ? (["L", "R"] as const) : [null];
      const sets: LiveSet[] = [];
      for (const p of prescribed) {
        for (const side of sides) {
          sets.push(toLiveSet(p, side));
        }
      }
      slots.push({
        key: `${block.id}:${i}`,
        slotKey: block.slot,
        scheme: block.scheme,
        restSec: block.restSec ?? prescribed.find((s) => s.restSec)?.restSec ?? null,
        plannedName: ex.name,
        usedName: ex.name,
        alternatives: ex.alternatives,
        skipped: false,
        sets,
        lastHint: hintMap.get(block.slot) ?? null,
      });
    });
  }
  return slots;
}

export function applyLastSession(slots: LiveSlot[], last: SessionWithSets): LiveSlot[] {
  return slots.map((slot) => {
    const rows = last.sets
      .filter((s) => s.slot_key === slot.slotKey)
      .sort((a, b) => a.sort_index - b.sort_index);
    if (!rows.length) return slot;
    const used = rows[0]?.exercise_name || slot.usedName;
    const planned = rows[0]?.planned_name || slot.plannedName;
    const nextSets: LiveSet[] = rows.map((r) => ({
      id: nid(),
      kind: r.kind,
      kg: asStr(r.kg),
      reps: asStr(r.reps),
      rpe: r.rpe === null ? "" : String(r.rpe),
      rir: r.rir === null ? "" : String(r.rir),
      restSec: r.rest_sec,
      side: r.side,
      done: false,
      plannedKg: null,
      plannedReps: null,
      plannedRpe: null,
      plannedRir: null,
      plannedRepRange: "",
    }));
    return { ...slot, usedName: used, plannedName: planned || slot.plannedName, sets: nextSets.length ? nextSets : slot.sets };
  });
}

export function volumeKg(sets: { kg: number; reps: number; kind: string }[]): number {
  return Math.round(
    sets
      .filter((s) => s.kind !== "warmup" && s.kg > 0)
      .reduce((n, s) => n + s.kg * s.reps, 0),
  );
}
