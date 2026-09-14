import type { LiveSlot, Routine, SessionWithSets } from "./types";

export const KG_BUMP = 2.5;

export type SlotStall = {
  slot: string;
  name: string;
  kg: number;
  rir: number;
};

export type AarBump = {
  slotKey: string;
  name: string;
  fromKg: number;
  toKg: number;
};

function slotWork(s: SessionWithSets, slot: string) {
  return s.sets.filter((x) => x.slot_key === slot && x.kind === "work");
}

function heaviest(sets: SessionWithSets["sets"]) {
  if (!sets.length) return null;
  return [...sets].sort((a, b) => b.kg - a.kg)[0];
}

export function stalledSlots(sessions: SessionWithSets[]): SlotStall[] {
  const bySlot = new Map<string, { kg: number; rir: number | null; name: string }[]>();
  for (const s of sessions) {
    const slots = new Set(s.sets.map((x) => x.slot_key));
    for (const slot of slots) {
      const work = slotWork(s, slot);
      const h = heaviest(work);
      if (!h) continue;
      const rirs = work.map((x) => x.rir).filter((n): n is number => n !== null);
      const rir = rirs.length ? Math.min(...rirs) : null;
      const list = bySlot.get(slot) ?? [];
      list.push({ kg: h.kg, rir, name: h.exercise_name });
      bySlot.set(slot, list);
    }
  }
  const out: SlotStall[] = [];
  for (const [slot, hist] of bySlot) {
    if (hist.length < 2) continue;
    const a = hist[hist.length - 2];
    const b = hist[hist.length - 1];
    if (a.kg === b.kg && a.rir !== null && b.rir !== null && a.rir >= 3 && b.rir >= 3) {
      out.push({ slot, name: b.name, kg: b.kg, rir: b.rir });
    }
  }
  return out;
}

export function stallLines(sessions: SessionWithSets[]): string[] {
  return stalledSlots(sessions).map(
    (s) => `${s.name} (${s.slot}) stuck at ${s.kg} kg, RIR ${s.rir}. +${KG_BUMP} next time.`,
  );
}

export function applyAarProgression(
  slots: LiveSlot[],
  history: SessionWithSets[],
): { slots: LiveSlot[]; bumps: AarBump[] } {
  const stalls = stalledSlots(history);
  if (!stalls.length) return { slots, bumps: [] };
  const bumps: AarBump[] = [];
  const next = slots.map((slot) => {
    const stall = stalls.find((s) => s.slot === slot.slotKey);
    if (!stall || slot.skipped) return slot;
    const toKg = stall.kg + KG_BUMP;
    bumps.push({ slotKey: slot.slotKey, name: slot.usedName || stall.name, fromKg: stall.kg, toKg });
    return {
      ...slot,
      sets: slot.sets.map((s) =>
        s.kind === "work"
          ? { ...s, kg: String(toKg), plannedKg: toKg }
          : s,
      ),
    };
  });
  return { slots: next, bumps };
}

export function writeBumpsIntoRoutine(routine: Routine, bumps: AarBump[]): Routine {
  if (!bumps.length) return routine;
  const next = JSON.parse(JSON.stringify(routine)) as Routine;
  for (const bump of bumps) {
    for (const block of next.blocks) {
      if (block.slot !== bump.slotKey) continue;
      for (const ex of block.exercises) {
        for (const set of ex.sets) {
          if (set.kind !== "work") continue;
          if (set.kg === bump.fromKg || set.kg === null) set.kg = bump.toKg;
        }
      }
    }
  }
  return next;
}

export function bumpConfirmed(slot: LiveSlot, bump: AarBump): boolean {
  if (slot.skipped || slot.slotKey !== bump.slotKey) return false;
  const work = slot.sets
    .filter((s) => s.kind === "work")
    .map((s) => Number(s.kg))
    .filter((n) => Number.isFinite(n));
  if (!work.length) return false;
  return Math.max(...work) + 0.01 >= bump.toKg;
}
