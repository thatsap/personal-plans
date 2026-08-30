export const THEMES = ["forge", "pulse", "steel"] as const;
export type ThemeId = (typeof THEMES)[number];

const KEY = "lab.theme";

export function readTheme(): ThemeId {
  const v = localStorage.getItem(KEY);
  if (v === "pulse" || v === "steel" || v === "forge") return v;
  return "forge";
}

export function applyTheme(id: ThemeId) {
  localStorage.setItem(KEY, id);
  document.documentElement.setAttribute("data-theme", id);
}

export function bootTheme() {
  applyTheme(readTheme());
}
