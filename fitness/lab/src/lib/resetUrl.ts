import { Capacitor } from "@capacitor/core";

/** Public site. Email links land here, then the new password works in the app too. */
export const PUBLIC_ORIGIN = "https://lab-ten-psi.vercel.app";

export function resetRedirect(): string {
  if (Capacitor.isNativePlatform()) return `${PUBLIC_ORIGIN}/reset`;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return `${PUBLIC_ORIGIN}/reset`;
  return `${window.location.origin}/reset`;
}

export function recoveryLinkPresent(): boolean {
  const hash = window.location.hash;
  const search = window.location.search;
  return hash.includes("type=recovery") || search.includes("type=recovery") || search.includes("code=");
}
