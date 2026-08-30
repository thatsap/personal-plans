export function shiftDay(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function istFromKeyHm(key: string, hm: string): string {
  const [h = "00", min = "00"] = hm.split(":");
  return `${key}T${h.padStart(2, "0")}:${min.padStart(2, "0")}:00+05:30`;
}

export function nightTimes(wakeKey: string, asleepHm: string, wakeHm: string) {
  const sameDay = asleepHm < wakeHm;
  const asleepKey = sameDay ? wakeKey : shiftDay(wakeKey, -1);
  return {
    asleepAt: istFromKeyHm(asleepKey, asleepHm),
    wakeAt: istFromKeyHm(wakeKey, wakeHm),
  };
}

export function napTimes(dayKey: string, startHm: string, endHm: string) {
  const endKey = endHm > startHm ? dayKey : shiftDay(dayKey, 1);
  return {
    asleepAt: istFromKeyHm(dayKey, startHm),
    wakeAt: istFromKeyHm(endKey, endHm),
  };
}

export function minutesBetween(a: string, b: string): number {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));
}

export function fmtHours(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
