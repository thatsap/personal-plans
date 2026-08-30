import { nowIso } from "./dates";
import { num } from "./math";
import { TAGS, UNITS, type ParsedIngestion, type Tag, type Unit } from "./types";

function stripFences(raw: string): string {
  const t = raw.trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (m ? m[1] : t).trim();
}

function isUnit(v: unknown): v is Unit {
  return typeof v === "string" && (UNITS as readonly string[]).includes(v);
}

function isTag(v: unknown): v is Tag {
  return typeof v === "string" && (TAGS as readonly string[]).includes(v);
}

function parseOne(raw: Record<string, unknown>): ParsedIngestion {
  const unit = raw.unit;
  const tag = raw.tag;
  const quantity = num(raw.quantity, NaN);
  const per =
    raw.perUnit && typeof raw.perUnit === "object"
      ? (raw.perUnit as Record<string, unknown>)
      : null;
  if (!isUnit(unit)) throw new Error("Each item needs unit (g, piece, katori…).");
  if (!isTag(tag)) throw new Error("Each item needs tag: protocol, snack, or junk.");
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Each item needs quantity as a number > 0.");
  }
  if (!per) throw new Error("Each item needs perUnit macros.");
  const kcal = num(per.kcal, NaN);
  if (!Number.isFinite(kcal)) throw new Error("perUnit.kcal is required.");
  const name = String(raw.name ?? "").trim();
  if (!name) throw new Error("Each item needs a name.");

  return {
    eatenAt:
      typeof raw.eatenAt === "string" && raw.eatenAt.trim()
        ? raw.eatenAt
        : nowIso(),
    name,
    boughtFrom: String(raw.boughtFrom ?? ""),
    ingredients: String(raw.ingredients ?? ""),
    tag,
    unit,
    quantity,
    perUnit: {
      kcal,
      proteinG: num(per.proteinG),
      carbsG: num(per.carbsG),
      fatG: num(per.fatG),
      fiberG: num(per.fiberG),
    },
    uncertainty: String(raw.uncertainty ?? ""),
    notes: String(raw.notes ?? ""),
    sourceJson: raw,
  };
}

export function parseIntakeJson(raw: string): ParsedIngestion[] {
  const text = stripFences(raw);
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Not valid JSON. Copy the model output only.");
  }
  if (Array.isArray(data)) {
    return data.map((item, i) => {
      if (!item || typeof item !== "object") throw new Error(`Item ${i + 1} is not an object.`);
      return parseOne(item as Record<string, unknown>);
    });
  }
  if (!data || typeof data !== "object") throw new Error("JSON must be an object.");
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.ingestions)) {
    if (obj.schemaVersion !== 2 && obj.schemaVersion !== 1) {
      // still accept if ingestions look right
    }
    return obj.ingestions.map((item, i) => {
      if (!item || typeof item !== "object") throw new Error(`Item ${i + 1} is not an object.`);
      return parseOne(item as Record<string, unknown>);
    });
  }
  return [parseOne(obj)];
}
