export const DEFAULT_KCAL_TARGET = 2455;
export const DEFAULT_PROTEIN_TARGET = 214;

export const UNITS = [
  "g",
  "ml",
  "piece",
  "katori",
  "cup",
  "tbsp",
  "tsp",
  "plate",
  "packet",
  "slice",
] as const;

export type Unit = (typeof UNITS)[number];

export const TAGS = ["protocol", "snack", "junk"] as const;
export type Tag = (typeof TAGS)[number];

export const SOURCES = ["manual", "json", "repeat"] as const;
export type Source = (typeof SOURCES)[number];

export type PerUnit = {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
};

export type ParsedIngestion = {
  eatenAt: string;
  name: string;
  boughtFrom: string;
  ingredients: string;
  tag: Tag;
  unit: Unit;
  quantity: number;
  perUnit: PerUnit;
  uncertainty: string;
  notes: string;
  sourceJson: unknown;
};

export type FoodRow = {
  id: string;
  user_id: string;
  name: string;
  bought_from: string;
  ingredients: string;
  tag: Tag;
  unit: Unit;
  kcal_per_unit: number;
  protein_g_per_unit: number;
  carbs_g_per_unit: number;
  fat_g_per_unit: number;
  fiber_g_per_unit: number;
  source_json: unknown;
  last_used_at: string;
  created_at: string;
};

export type IngestionRow = {
  id: string;
  user_id: string;
  eaten_at: string;
  food_id: string | null;
  name: string;
  unit: Unit;
  quantity: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  tag: Tag;
  source: Source;
  photo_path: string | null;
  created_at: string;
};
