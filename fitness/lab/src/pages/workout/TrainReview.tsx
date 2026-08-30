import { useEffect, useState } from "react";
import { MuscleWeb } from "../../components/charts/MuscleWeb";
import { HorzBars, Legend, StackedDays, TrainHero } from "../../components/charts/StatViz";
import { RangePills, rangeWindow, type RangeMode } from "../../components/RangePills";
import { RowOps } from "../../components/RowOps";
import { ScreenHeader } from "../../components/ScreenHeader";
import { WorkAar } from "../../components/workout/WorkAar";
import { dayEndIso, dayStartIso } from "../../lib/dates";
import { getSupabase } from "../../lib/supabase";
import { muscleCoverage } from "../../lib/workout/muscles";
import { fmtMin, rollupActivity } from "../../lib/workout/activity";
import { listSessions, deleteSession } from "../../lib/workout/db";
import { rollupWork, type WorkReview } from "../../lib/workout/review";
import { deleteSport, listSports } from "../../lib/workout/sportsDb";
import { sportLabel, type SportRow } from "../../lib/workout/sports";

export default function TrainReview() {
  const [mode, setMode] = useState<RangeMode>("7");
  const [from, setFrom] = useState(() => rangeWindow("7")!.from);
  const [to, setTo] = useState(() => rangeWindow("7")!.to);
  const [work, setWork] = useState<WorkReview | null>(null);
  const [sports, setSports] = useState<SportRow[]>([]);
  const [err, setErr] = useState("");

  function applyMode(m: RangeMode) {
    setMode(m);
    const w = rangeWindow(m, { from: "2025-12-16", to: "2026-08-26" });
    if (w) {
      setFrom(w.from);
      setTo(w.to);
    }
  }

  async function load() {
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    try {
      setWork(rollupWork(await listSessions(uid, dayStartIso(from), dayEndIso(to))));
      setErr("");
    } catch (e) {
      setWork(null);
      setErr(e instanceof Error ? e.message : "Gym load failed");
    }
    try {
      setSports(await listSports(uid, dayStartIso(from), dayEndIso(to)));
    } catch {
      setSports([]);
    }
  }

  useEffect(() => {
    void load();
  }, [from, to]);

  const act = rollupActivity(from, to, work?.sessions ?? [], sports);
  const cover = muscleCoverage(work?.sessions ?? []);
  const total = act.liftMin + act.sportMin;
  const liftShare = total ? Math.round((act.liftMin / total) * 100) : 0;
  const courtShare = total ? 100 - liftShare : 0;

  return (
    <div className="wrap">
      <ScreenHeader kicker="after action" title="Training" />
      <p className="muted">Lift and court, together then split. Food AAR stays in Fuel.</p>
      <RangePills mode={mode} showDump onChange={applyMode} />
      {mode === "custom" ? (
        <div className="row">
          <label style={{ flex: 1 }}>
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label style={{ flex: 1 }}>
            To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      ) : null}
      {err ? <p className="muted">{err}</p> : null}

      <section className="st-block">
        <p className="kicker">all</p>
        <h2>Load</h2>
        <TrainHero liftMin={act.liftMin} sportMin={act.sportMin} volume={act.volume} />
        <Legend />
        <p className="muted">
          {liftShare}% lift · {courtShare}% court · {act.liftSessions} sessions · {act.sportLogs} sports
        </p>
        <StackedDays days={act.days} mode="time" />
      </section>

      <section className="st-block">
        <p className="kicker">coverage</p>
        <h2>Muscle web</h2>
        <p className="muted">One picture. Peak group is full. Empty spoke = not hit in this window.</p>
        <MuscleWeb hits={cover.hits} />
        {cover.missed.length ? (
          <p className="err">Not hit: {cover.missed.join(" · ")}</p>
        ) : (
          <p className="muted">Every spoke got a working set.</p>
        )}
        <div className="st-chips">
          {cover.hits.map((h) => (
            <span key={h.id} className={h.sets ? "on" : ""}>
              {h.label} {h.sets || "—"}
            </span>
          ))}
        </div>
      </section>

      <section className="st-block">
        <p className="kicker">lift</p>
        <h2>Training</h2>
        <div className="totals">
          <div className="stat">
            <b>{act.liftSessions}</b>
            <span>sessions</span>
          </div>
          <div className="stat">
            <b>{fmtMin(act.liftMin)}</b>
            <span>time under bar</span>
          </div>
        </div>
        <p className="rc-sub">Volume</p>
        <StackedDays days={act.days} mode="volume" />
        <WorkAar stats={work} />
        <h2>Sessions</h2>
        {(work?.sessions ?? []).map((s) => (
          <div className="item" key={s.id}>
            <div>
              {s.routine_snapshot?.name || "Session"}
              <div className="muted">{s.sets.filter((x) => x.kind === "work").length} work sets</div>
            </div>
            <RowOps
              editTo={`/train/session/${s.id}`}
              onDelete={() =>
                void deleteSession(s.id)
                  .then(load)
                  .catch((e) => setErr(e instanceof Error ? e.message : "Delete failed"))
              }
            />
          </div>
        ))}
      </section>

      <section className="st-block">
        <p className="kicker">cardio</p>
        <h2>Sport</h2>
        <div className="totals">
          <div className="stat">
            <b>{fmtMin(act.sportMin)}</b>
            <span>court / run</span>
          </div>
          <div className="stat">
            <b>{act.avgHr ?? "—"}</b>
            <span>avg HR</span>
          </div>
        </div>
        <HorzBars
          rows={act.bySport.map((s) => ({
            label: s.label,
            value: s.minutes,
            hint: `${s.count} · ${fmtMin(s.minutes)}${s.hr ? ` · HR ${s.hr}` : ""}`,
          }))}
        />
        {sports.map((s) => (
          <div className="item" key={s.id}>
            <div>
              {sportLabel(s.sport)}
              <div className="muted">
                {s.minutes} min
                {s.hr_avg ? ` · HR ${s.hr_avg}` : ""}
                {s.peak_hr ? ` · peak ${s.peak_hr}` : ""}
              </div>
            </div>
            <RowOps
              editTo={`/train/sport/${s.id}`}
              onDelete={() =>
                void deleteSport(s.id)
                  .then(load)
                  .catch((e) => setErr(e instanceof Error ? e.message : "Delete failed"))
              }
            />
          </div>
        ))}
      </section>
    </div>
  );
}
