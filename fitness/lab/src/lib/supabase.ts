import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readCloud } from "./config";

let client: SupabaseClient | null = null;
let bound = "";

export function getSupabase(): SupabaseClient | null {
  const cloud = readCloud();
  if (!cloud) {
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
        // Implicit puts the reset tokens in the email link, so the phone
        // can request it and the browser can finish it.
        flowType: "implicit",
        detectSessionInUrl: true,
      },
    });
    bound = key;
  }
  return client;
}
