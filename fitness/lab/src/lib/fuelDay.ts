import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { formatDay, fromKeyHm, nowHm, nowIso, todayKey } from "./dates";

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const HM = /^\d{2}:\d{2}$/;

export function useFuelDay() {
  const [params, setParams] = useSearchParams();
  const today = todayKey();
  const raw = params.get("d") ?? "";
  const day = DAY.test(raw) && raw <= today ? raw : today;
  const past = day !== today;
  const tRaw = params.get("t") ?? "";
  const hm = HM.test(tRaw) ? tRaw : nowHm();

  useEffect(() => {
    if (!past || HM.test(params.get("t") ?? "")) return;
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.set("d", day);
        p.set("t", nowHm());
        return p;
      },
      { replace: true },
    );
  }, [past, day, params, setParams]);

  function setDay(next: string) {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        const clamped = next > todayKey() ? todayKey() : next;
        if (clamped === todayKey()) {
          p.delete("d");
          p.delete("t");
        } else {
          p.set("d", clamped);
          if (!HM.test(p.get("t") ?? "")) p.set("t", nowHm());
        }
        return p;
      },
      { replace: true },
    );
  }

  function setHm(next: string) {
    if (!HM.test(next)) return;
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.set("d", day);
        p.set("t", next);
        return p;
      },
      { replace: true },
    );
  }

  function eatenAt() {
    if (day === todayKey()) return nowIso();
    return fromKeyHm(day, HM.test(tRaw) ? tRaw : nowHm());
  }

  function to(path: string) {
    if (day === todayKey()) return path;
    const [pathname, qs] = path.split("?");
    const p = new URLSearchParams(qs ?? "");
    p.set("d", day);
    p.set("t", HM.test(tRaw) ? tRaw : hm);
    const q = p.toString();
    return q ? `${pathname}?${q}` : pathname;
  }

  const when = past ? `${formatDay(day)} · ${hm}` : "";

  return { day, past, hm, when, setDay, setHm, eatenAt, to, today };
}
