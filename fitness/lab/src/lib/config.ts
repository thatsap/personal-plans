const STORAGE = "lab.supabase";

export type Cloud = { url: string; anonKey: string };

export function readCloud(): Cloud | null {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (envUrl && envKey) return { url: envUrl, anonKey: envKey };
  const raw = localStorage.getItem(STORAGE);
  if (!raw) return null;
  try {
    const c = JSON.parse(raw) as Cloud;
    if (c.url && c.anonKey) return c;
  } catch {
    return null;
  }
  return null;
}

export function writeCloud(c: Cloud) {
  localStorage.setItem(STORAGE, JSON.stringify(c));
}

export function clearCloud() {
  localStorage.removeItem(STORAGE);
}
