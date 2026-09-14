import { DEFAULT_KCAL_TARGET, DEFAULT_PROTEIN_TARGET } from "./types";
import { getSupabase } from "./supabase";

export type LabSettings = {
  kcalTarget: number;
  proteinTarget: number;
  persisted: boolean;
};

function missingTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const m = (error.message ?? "").toLowerCase();
  return error.code === "42P01" || m.includes("lab_settings");
}

function sb() {
  const c = getSupabase();
  if (!c) throw new Error("Supabase not connected.");
  return c;
}

function clampKcal(n: number) {
  return Math.max(800, Math.min(6000, Math.round(n)));
}

function clampProtein(n: number) {
  return Math.max(40, Math.min(400, Math.round(n)));
}

export function defaults(): LabSettings {
  return {
    kcalTarget: DEFAULT_KCAL_TARGET,
    proteinTarget: DEFAULT_PROTEIN_TARGET,
    persisted: false,
  };
}

export async function getSettings(userId: string): Promise<LabSettings> {
  const { data, error } = await sb()
    .from("lab_settings")
    .select("kcal_target, protein_target")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    if (missingTable(error)) return defaults();
    throw error;
  }
  if (!data) return defaults();
  return {
    kcalTarget: clampKcal(Number(data.kcal_target) || DEFAULT_KCAL_TARGET),
    proteinTarget: clampProtein(Number(data.protein_target) || DEFAULT_PROTEIN_TARGET),
    persisted: true,
  };
}

export async function saveSettings(
  userId: string,
  kcalTarget: number,
  proteinTarget: number,
): Promise<LabSettings> {
  const row = {
    user_id: userId,
    kcal_target: clampKcal(kcalTarget),
    protein_target: clampProtein(proteinTarget),
    updated_at: new Date().toISOString(),
  };
  const { error } = await sb().from("lab_settings").upsert(row, { onConflict: "user_id" });
  if (error) {
    if (missingTable(error)) {
      throw new Error("Run supabase/patch-lab-v2.sql in the SQL editor.");
    }
    throw error;
  }
  return {
    kcalTarget: row.kcal_target,
    proteinTarget: row.protein_target,
    persisted: true,
  };
}
