import { multiply } from "./math";
import { uploadMealPhoto } from "./photo";
import { getSupabase } from "./supabase";
import type { FoodRow, IngestionRow, ParsedIngestion, Source } from "./types";

function sb() {
  const c = getSupabase();
  if (!c) throw new Error("Supabase not connected.");
  return c;
}

export async function upsertFood(userId: string, item: ParsedIngestion): Promise<FoodRow> {
  const row = {
    user_id: userId,
    name: item.name,
    bought_from: item.boughtFrom,
    ingredients: item.ingredients,
    tag: item.tag,
    unit: item.unit,
    kcal_per_unit: item.perUnit.kcal,
    protein_g_per_unit: item.perUnit.proteinG,
    carbs_g_per_unit: item.perUnit.carbsG,
    fat_g_per_unit: item.perUnit.fatG,
    fiber_g_per_unit: item.perUnit.fiberG,
    source_json: item.sourceJson,
    last_used_at: new Date().toISOString(),
  };
  const { data, error } = await sb()
    .from("foods")
    .upsert(row, { onConflict: "user_id,name,unit,bought_from" })
    .select()
    .single();
  if (error) throw error;
  return data as FoodRow;
}

export async function logIngestion(
  userId: string,
  food: FoodRow | null,
  item: ParsedIngestion,
  source: Source,
): Promise<IngestionRow> {
  const totals = multiply(item.perUnit, item.quantity);
  const { data, error } = await sb()
    .from("ingestions")
    .insert({
      user_id: userId,
      eaten_at: item.eatenAt,
      food_id: food?.id ?? null,
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      kcal: totals.kcal,
      protein_g: totals.proteinG,
      carbs_g: totals.carbsG,
      fat_g: totals.fatG,
      tag: item.tag,
      source,
    })
    .select()
    .single();
  if (error) throw error;
  return data as IngestionRow;
}

export async function saveParsed(
  userId: string,
  items: ParsedIngestion[],
  source: Source,
  photoDataUrl?: string | null,
) {
  const out: IngestionRow[] = [];
  for (const item of items) {
    const food = await upsertFood(userId, item);
    out.push(await logIngestion(userId, food, item, source));
  }
  if (photoDataUrl && out[0]) {
    try {
      const path = await uploadMealPhoto(userId, out[0].id, photoDataUrl);
      out[0] = { ...out[0], photo_path: path };
    } catch {
      // Meal is already saved. Photo is optional — never block the log.
    }
  }
  return out;
}

export async function listToday(userId: string, fromIso: string, toIso: string) {
  const { data, error } = await sb()
    .from("ingestions")
    .select("*")
    .eq("user_id", userId)
    .gte("eaten_at", fromIso)
    .lte("eaten_at", toIso)
    .order("eaten_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as IngestionRow[];
}

export async function listRange(userId: string, fromIso: string, toIso: string) {
  return listToday(userId, fromIso, toIso);
}

export async function listFoods(userId: string) {
  const { data, error } = await sb()
    .from("foods")
    .select("*")
    .eq("user_id", userId)
    .order("last_used_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FoodRow[];
}

export async function touchFood(id: string) {
  await sb().from("foods").update({ last_used_at: new Date().toISOString() }).eq("id", id);
}

export async function deleteIngestion(id: string) {
  const { data } = await sb()
    .from("ingestions")
    .select("photo_path")
    .eq("id", id)
    .maybeSingle();
  if (data?.photo_path) {
    await sb().storage.from("meal-photos").remove([data.photo_path as string]);
  }
  const { error } = await sb().from("ingestions").delete().eq("id", id);
  if (error) throw error;
}
