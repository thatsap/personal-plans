import { NIGHT_TARGET_MIN } from "../../lib/recovery/types";
import { fmtHours } from "../../lib/recovery/time";
import { fmtMin, fmtVol, type DayActivity } from "../../lib/workout/activity";

export function ShareDonut({ liftMin, sportMin }: { liftMin: number; sportMin: number }) {
  const total = liftMin + sportMin;
  const r = 52;
  const c = 2 * Math.PI * r;
  const liftPct = total ? liftMin / total : 0;
  const sportPct = total ? sportMin / total : 0;
  const liftLen = c * liftPct;
  const sportLen = c * sportPct;

  return (
    <div className="st-donut">
      <svg viewBox="0 0 140 140" aria-hidden>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--line)" strokeWidth="14" />
        {total ? (
          <>
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="14"
              strokeDasharray={`${liftLen} ${c - liftLen}`}
              strokeDashoffset={c * 0.25}
            />
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke="var(--warn)"
              strokeWidth="14"
              strokeDasharray={`${sportLen} ${c - sportLen}`}
              strokeDashoffset={c * 0.25 - liftLen}
            />
          </>
        ) : null}
      </svg>
      <div className="st-donut-mid">
        <b>{total ? fmtMin(total) : "—"}</b>
        <span>total</span>
      </div>
    </div>
  );
}

export function StackedDays({
  days,
  mode,
}: {
  days: DayActivity[];
  mode: "time" | "volume";
}) {
  const max = Math.max(
    1,
    ...days.map((d) => (mode === "volume" ? d.volume : d.liftMin + d.sportMin)),
  );
  return (
    <div className="st-bars" style={{ gridTemplateColumns: `repeat(${Math.max(days.length, 1)}, 1fr)` }}>
      {days.map((d) => {
        const liftH = mode === "volume" ? (d.volume / max) * 100 : (d.liftMin / max) * 100;
        const sportH = mode === "volume" ? 0 : (d.sportMin / max) * 100;
        return (
          <div className="st-col" key={d.key}>
            <div className="st-stack">
              {sportH > 0.4 ? <i className="sport" style={{ height: `${sportH}%` }} /> : null}
              {liftH > 0.4 ? <i className="lift" style={{ height: `${liftH}%` }} /> : null}
            </div>
            <span>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function HorzBars({ rows }: { rows: { label: string; value: number; hint?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="muted">Nothing in this window.</p>;
  return (
    <div className="st-horz">
      {rows.map((r) => (
        <div className="st-hrow" key={r.label}>
          <div className="st-hmeta">
            <b>{r.label}</b>
            <span>{r.hint ?? String(r.value)}</span>
          </div>
          <div className="st-htrack">
            <div className="st-hfill" style={{ width: `${Math.max(4, (r.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SleepBars({
  days,
}: {
  days: { key: string; label: string; night: number; nap: number }[];
}) {
  const max = Math.max(NIGHT_TARGET_MIN, ...days.map((d) => d.night + d.nap), 1);
  const goal = (NIGHT_TARGET_MIN / max) * 100;
  return (
    <div className="st-sleep-wrap">
      <div className="st-bars st-sleep" style={{ gridTemplateColumns: `repeat(${Math.max(days.length, 1)}, 1fr)` }}>
        <div className="st-goal" style={{ bottom: `calc(18px + ${goal * 0.01} * 118px)` }} />
        {days.map((d) => (
          <div className="st-col" key={d.key}>
            <div className="st-stack">
              {d.nap > 0 ? <i className="nap" style={{ height: `${(d.nap / max) * 100}%` }} /> : null}
              {d.night > 0 ? (
                <i className={d.night < 360 ? "night low" : "night"} style={{ height: `${(d.night / max) * 100}%` }} />
              ) : null}
            </div>
            <span>{d.label}</span>
          </div>
        ))}
      </div>
      <p className="muted">Dashed line is {fmtHours(NIGHT_TARGET_MIN)}. Short nights go red.</p>
    </div>
  );
}

export function Legend() {
  return (
    <div className="st-leg">
      <span>
        <i className="lift" /> Lift
      </span>
      <span>
        <i className="sport" /> Court
      </span>
    </div>
  );
}

export function TrainHero({
  liftMin,
  sportMin,
  volume,
}: {
  liftMin: number;
  sportMin: number;
  volume: number;
}) {
  return (
    <div className="st-hero">
      <ShareDonut liftMin={liftMin} sportMin={sportMin} />
      <div className="st-hero-nums">
        <div>
          <b>{fmtMin(liftMin)}</b>
          <span>lift</span>
        </div>
        <div>
          <b>{fmtMin(sportMin)}</b>
          <span>court</span>
        </div>
        <div>
          <b>{fmtVol(volume)}</b>
          <span>volume</span>
        </div>
      </div>
    </div>
  );
}
