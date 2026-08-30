export function Meter({
  label,
  value,
  max,
  unit,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  tone?: "ok" | "over" | "warn";
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`meter ${tone ?? ""}`}>
      <div className="meter-top">
        <span className="kicker">{label}</span>
        <span className="meter-num">
          {value}
          <em>/{max}</em>
        </span>
      </div>
      <div className="meter-track" aria-hidden>
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="meter-unit">{unit}</span>
    </div>
  );
}
