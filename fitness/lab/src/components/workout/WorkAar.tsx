import type { WorkReview } from "../../lib/workout/review";

export function WorkAar({ stats }: { stats: WorkReview | null }) {
  if (!stats) {
    return (
      <div className="wk-aar">
        <p className="muted">No gym data in this window (or tables not patched yet).</p>
      </div>
    );
  }

  return (
    <div className="wk-aar">
      <ul className="verdict wrong">
        {stats.overCap.map((w) => (
          <li key={w}>{w}</li>
        ))}
        {stats.stuck.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <ul className="verdict right">
        {stats.lines.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      {stats.routines.length ? (
        <>
          <h2>Routines</h2>
          {stats.routines.map((r) => (
            <div className="item" key={r.name}>
              <div>{r.name}</div>
              <div>×{r.count}</div>
            </div>
          ))}
        </>
      ) : null}
      {stats.lastCompounds.length ? (
        <>
          <h2>Last working sets</h2>
          {stats.lastCompounds.map((c) => (
            <div className="item" key={c.slot + c.name}>
              <div>
                {c.name} <span className="muted">{c.slot.replace(/_/g, " ")}</span>
              </div>
              <div>
                {c.kg} × {c.reps}
              </div>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
}
