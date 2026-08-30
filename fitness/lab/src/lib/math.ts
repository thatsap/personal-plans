import type { PerUnit } from "./types";

export function multiply(perUnit: PerUnit, quantity: number) {
  return {
    kcal: Math.round(perUnit.kcal * quantity),
    proteinG: round1(perUnit.proteinG * quantity),
    carbsG: round1(perUnit.carbsG * quantity),
    fatG: round1(perUnit.fatG * quantity),
    fiberG: round1(perUnit.fiberG * quantity),
  };
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}
