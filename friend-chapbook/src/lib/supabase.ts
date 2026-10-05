import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Cloud =
  | { ok: true; url: string; anonKey: string }
  | { ok: false; reason: "missing" | "service-role" };

let client: SupabaseClient | null = null;
let bound = "";

function decodeJwtRole(token: string): string | null {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const payload = JSON.parse(atob(padded + pad)) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

function isSecretKey(key: string): boolean {
  if (key.startsWith("sb_secret_")) return true;
  return decodeJwtRole(key) === "service_role";
}

export function readCloud(): Cloud {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !anonKey) return { ok: false, reason: "missing" };
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { ok: false, reason: "missing" };
    }
  } catch {
    return { ok: false, reason: "missing" };
  }
  if (isSecretKey(anonKey)) return { ok: false, reason: "service-role" };
  return { ok: true, url, anonKey };
}

export function getSupabase(): SupabaseClient | null {
  const cloud = readCloud();
  if (!cloud.ok) {
    client = null;
    bound = "";
    return null;
  }
  const key = cloud.url + cloud.anonKey;
  if (!client || bound !== key) {
    client = createClient(cloud.url, cloud.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // PKCE keeps the sign-in code in the query string, so it does not
        // collide with the hash routes this reader uses.
        flowType: "pkce",
      },
    });
    bound = key;
  }
  return client;
}
