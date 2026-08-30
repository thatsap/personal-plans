import { lastNDayKeys, todayKey, yesterdayKey } from "../lib/dates";

export type RangeMode = "today" | "yesterday" | "7" | "30" | "dump" | "custom";

export function rangeWindow(
  mode: RangeMode,
  dump?: { from: string; to: string },
): { from: string; to: string } | null {
  const t = todayKey();
  if (mode === "today") return { from: t, to: t };
  if (mode === "yesterday") {
    const y = yesterdayKey();
    return { from: y, to: y };
  }
  if (mode === "7") return lastNDayKeys(7);
  if (mode === "30") return lastNDayKeys(30);
  if (mode === "dump" && dump) return dump;
  return null;
}

export function RangePills({
  mode,
  onChange,
  showDump,
}: {
  mode: RangeMode;
  onChange: (m: RangeMode) => void;
  showDump?: boolean;
}) {
  const items: { id: RangeMode; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yest" },
    { id: "7", label: "7d" },
    { id: "30", label: "30d" },
  ];
  if (showDump) items.push({ id: "dump", label: "Dump" });
  items.push({ id: "custom", label: "Custom" });

  return (
    <div className="pillrow wrap">
      {items.map((p) => (
        <button key={p.id} type="button" className={mode === p.id ? "on" : ""} onClick={() => onChange(p.id)}>
          {p.label}
        </button>
      ))}
    </div>
  );
}
