import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";
import { buildMobilityPlan, writePlan } from "../../lib/recovery/plan";
import { MOBILITY, MOBILITY_GROUPS } from "../../lib/recovery/routines";
import { BODY_PARTS, PART_LABEL, type BodyPart } from "../../lib/recovery/types";

const TIMES = [5, 8, 10, 12, 15];

export default function MobilityHub() {
  const nav = useNavigate();
  const [parts, setParts] = useState<BodyPart[]>(["hips"]);
  const [mins, setMins] = useState(10);
  const [openKey, setOpen] = useState<string | null>(null);

  const plan = useMemo(() => (parts.length ? buildMobilityPlan(parts, mins) : null), [parts, mins]);

  function toggle(p: BodyPart) {
    setParts((cur) => {
      if (cur.includes(p)) {
        const next = cur.filter((x) => x !== p);
        return next.length ? next : cur;
      }
      return [...cur, p];
    });
  }

  function play() {
    if (!plan || !plan.moves.length) return;
    writePlan(plan);
    nav("/recover/move/play");
  }

  return (
    <div className="wrap rc-hub">
      <ScreenHeader kicker="move" title="Move" />

      <section className="rc-panel">
        <div className="rc-panel-head">
          <p className="kicker">01 stretch</p>
          <h2>Stretching</h2>
        </div>
        <p className="muted">Known blocks. After court, after a lift, desk. Hold timer on each move.</p>
        {MOBILITY_GROUPS.map((g) => (
          <div key={g.tag}>
            <p className="rc-sub">{g.title}</p>
            <div className="rc-stretch-grid">
              {MOBILITY.filter((r) => r.tag === g.tag).map((r) => (
                <Link className="rc-stretch-card" to={`/recover/move/${r.key}`} key={r.key}>
                  <b>{r.name}</b>
                  <span>
                    {r.minutes} min · {r.moves.length} holds
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rc-panel rc-panel-hit">
        <div className="rc-panel-head">
          <p className="kicker">02 mobility</p>
          <h2>Mobility</h2>
        </div>
        <p className="muted">Pick the part that is stuck. Dial time. The block is built for you. Play it.</p>
        <p className="rc-sub">Hit</p>
        <div className="rc-parts">
          {BODY_PARTS.map((p) => (
            <button
              key={p}
              type="button"
              className={parts.includes(p) ? "on" : ""}
              onClick={() => toggle(p)}
            >
              {PART_LABEL[p]}
            </button>
          ))}
        </div>
        <p className="rc-sub">Time</p>
        <div className="pillrow">
          {TIMES.map((t) => (
            <button key={t} type="button" className={mins === t ? "on" : ""} onClick={() => setMins(t)}>
              {t}m
            </button>
          ))}
        </div>
        {plan ? (
          <>
            <div className="rc-plan-meta">
              <div>
                <b>{plan.moves.length}</b>
                <span>holds</span>
              </div>
              <div>
                <b>
                  {Math.round(plan.moves.reduce((n, m) => n + m.holdSec, 0) / 60)}
                  m
                </b>
                <span>hold clock</span>
              </div>
            </div>
            <p className="rc-sub">The block</p>
            <div className="rc-preview">
              {plan.moves.map((m, i) => {
                const k = `${m.key}-${i}`;
                const open = openKey === k;
                return (
                  <div className={`rc-acc ${open ? "open" : ""}`} key={k}>
                    <button type="button" className="rc-acc-h" onClick={() => setOpen(open ? null : k)}>
                      <span className="rc-n">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>
                          {m.name}
                          {m.side ? ` · ${m.side}` : ""}
                        </strong>
                        <em>{m.holdSec}s</em>
                      </div>
                      <span className="rc-chev">{open ? "–" : "+"}</span>
                    </button>
                    {open ? (
                      <div className="rc-acc-b">
                        <p>
                          <span>How</span>
                          {m.do}
                        </p>
                        <p>
                          <span>Avoid</span>
                          {m.avoid}
                        </p>
                        <p>
                          <span>Working</span>
                          {m.confirm}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <button className="btn" type="button" disabled={!plan.moves.length} onClick={play}>
              Play this block
            </button>
          </>
        ) : (
          <p className="muted">Select a body part.</p>
        )}
      </section>
    </div>
  );
}
