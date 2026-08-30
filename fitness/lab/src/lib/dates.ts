const TZ = "Asia/Kolkata";

export function nowIso(): string {
  const d = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}+05:30`;
}

export function istDateKey(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function todayKey(): string {
  return istDateKey(new Date().toISOString());
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function formatDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 6, 30));
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(dt);
}

/** Inclusive IST date keys for last n days including today. */
export function lastNDayKeys(n: number): { from: string; to: string } {
  const to = todayKey();
  const [y, m, d] = to.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  start.setUTCDate(start.getUTCDate() - (n - 1));
  const from = start.toISOString().slice(0, 10);
  return { from, to };
}

/** Start of IST day as ISO for query (from 00:00 IST). */
export function dayStartIso(key: string): string {
  return `${key}T00:00:00+05:30`;
}

export function dayEndIso(key: string): string {
  return `${key}T23:59:59.999+05:30`;
}
