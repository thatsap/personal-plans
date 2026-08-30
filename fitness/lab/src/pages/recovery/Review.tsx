import { useEffect, useState } from "react";
import { SleepBars } from "../../components/charts/StatViz";
import { RangePills, rangeWindow, type RangeMode } from "../../components/RangePills";
import { ScreenHeader } from "../../components/ScreenHeader";
import { dayEndIso, dayStartIso } from "../../lib/dates";
import { listMobility, listSleep } from "../../lib/recovery/db";
import { rollupRecovery } from "../../lib/recovery/review";
import { routineLabel } from "../../lib/recovery/routines";
import { fmtHours } from "../../lib/recovery/time";
import { NIGHT_TARGET_MIN, type MobilityRow, type SleepRow } from "../../lib/recovery/types";
import { getSupabase } from "../../lib/supabase";

export default function RecReview() {
  const [mode, setMode] = useState<RangeMode>("7");
  const [from, setFrom] = useState(() => rangeWindow("7")!.from);
  const [to, setTo] = useState(() => rangeWindow("7")!.to);
  const [sleep, setSleep] = useState<SleepRow[]>([]);
  const [mobility, setMobility] = useState<MobilityRow[]>([]);
  const [err, setErr] = useState("");

  function applyMode(m: RangeMode) {
    setMode(m);
    const w = rangeWindow(m, { from: "2026-08-13", to: "2026-08-26" });
    if (w) {
      setFrom(w.from);
      setTo(w.to);
    }
  }

  useEffect(() => {
    void (async () => {
      const sb = getSupabase()!;
      const { data } = await sb.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      try {
        setSleep(await listSleep(uid, dayStartIso(from), dayEndIso(to)));
        setErr("");
      } catch (e) {
        setSleep([]);
        setErr(e instanceof Error ? e.message : "Recovery load failed");
      }
      try {
        setMobility(await listMobility(uid, dayStartIso(from), dayEndIso(to)));
      } catch {
        setMobility([]);
      }
    })();
  }, [from, to]);

  const stats = rollupRecovery(sleep, mobility, from, to);

  return (
    <div className="wrap">
      <ScreenHeader kicker="after action" title="Recovery" />
      <p className="muted">Nights vs {fmtHours(NIGHT_TARGET_MIN)} target. Naps stacked on top. No Garmin burn.</p>
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
      <div className="totals">
        <div className="stat">
          <b>{stats.nights ? fmtHours(stats.avgNightMin) : "—"}</b>
          <span>avg night</span>
        </div>
        <div className="stat">
          <b>{fmtHours(stats.napMin)}</b>
          <span>naps</span>
        </div>
        <div className="stat">
          <b>{stats.mobility}</b>
          <span>stretch blocks</span>
        </div>
      </div>
      {stats.days.length ? <SleepBars days={stats.days} /> : null}
      {stats.lines.map((l) => (
        <p className="muted" key={l}>
          {l}
        </p>
      ))}
      <h2>Sleep</h2>
      {sleep.length === 0 ? <p className="empty">No sleep in this window.</p> : null}
      {sleep.map((s) => (
        <div className="item" key={s.id}>
          <div>
            {s.kind === "night" ? "Night" : "Nap"}
            <div className="muted">{fmtHours(s.minutes)}</div>
          </div>
        </div>
      ))}
      <h2>Mobility</h2>
      {mobility.map((m) => (
        <div className="item" key={m.id}>
          <div>
            {routineLabel(m.routine_key)}
            <div className="muted">
              {m.minutes} min · {m.moves_done}/{m.moves_total}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
