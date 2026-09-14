import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { RangePills, rangeWindow, type RangeMode } from "../components/RangePills";
import { ScreenHeader } from "../components/ScreenHeader";
import { dayEndIso, dayStartIso } from "../lib/dates";
import { listRange } from "../lib/db";
import { exportAar } from "../lib/export";
import { rollup } from "../lib/review";
import { getSettings } from "../lib/settings";
import { DEFAULT_KCAL_TARGET, DEFAULT_PROTEIN_TARGET, type IngestionRow } from "../lib/types";
import { getSupabase } from "../lib/supabase";
import { listSessions } from "../lib/workout/db";
import { rollupWork } from "../lib/workout/review";
import { listSports } from "../lib/workout/sportsDb";
import { sportLabel, type SportRow } from "../lib/workout/sports";
import { listMobility, listSleep } from "../lib/recovery/db";
import { routineLabel } from "../lib/recovery/routines";
import { fmtHours } from "../lib/recovery/time";
import type { MobilityRow, SleepRow } from "../lib/recovery/types";
import type { WorkReview } from "../lib/workout/review";

const DUMP = { from: "2025-12-16", to: "2026-08-26" };

export default function ExportDay() {
  const [mode, setMode] = useState<RangeMode>("today");
  const [from, setFrom] = useState(() => rangeWindow("today")!.from);
  const [to, setTo] = useState(() => rangeWindow("today")!.to);
  const [rows, setRows] = useState<IngestionRow[]>([]);
  const [work, setWork] = useState<WorkReview | null>(null);
  const [sports, setSports] = useState<SportRow[]>([]);
  const [sleep, setSleep] = useState<SleepRow[]>([]);
  const [mobility, setMobility] = useState<MobilityRow[]>([]);
  const [kcalTarget, setKcalTarget] = useState(DEFAULT_KCAL_TARGET);
  const [proteinTarget, setProteinTarget] = useState(DEFAULT_PROTEIN_TARGET);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function applyMode(m: RangeMode) {
    setMode(m);
    const w = rangeWindow(m, DUMP);
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
        setRows(await listRange(uid, dayStartIso(from), dayEndIso(to)));
        try {
          const settings = await getSettings(uid);
          setKcalTarget(settings.kcalTarget);
          setProteinTarget(settings.proteinTarget);
        } catch {
          /* defaults */
        }
        setErr("");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Food load failed");
      }
      try {
        setWork(rollupWork(await listSessions(uid, dayStartIso(from), dayEndIso(to))));
      } catch {
        setWork(null);
      }
      try {
        setSports(await listSports(uid, dayStartIso(from), dayEndIso(to)));
      } catch {
        setSports([]);
      }
      try {
        setSleep(await listSleep(uid, dayStartIso(from), dayEndIso(to)));
      } catch {
        setSleep([]);
      }
      try {
        setMobility(await listMobility(uid, dayStartIso(from), dayEndIso(to)));
      } catch {
        setMobility([]);
      }
    })();
  }, [from, to]);

  const kcal = rows.reduce((s, r) => s + r.kcal, 0);
  const protein = Math.round(rows.reduce((s, r) => s + r.protein_g, 0));
  const same = from === to;
  const label = same ? from : `${from} → ${to}`;

  return (
    <div className="wrap home-wrap">
      <ScreenHeader kicker="dump" title="Export" />
      <p className="muted">Food + lifts + sports + sleep + mobility for the window. Not Garmin burn.</p>
      <Link to="/" className="muted">
        ← Lab
      </Link>
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
      <p className="muted">{label}</p>
      {err ? <p className="err">{err}</p> : null}
      <div className="totals">
        <div className="stat">
          <b>{kcal}</b>
          <span>kcal</span>
        </div>
        <div className="stat">
          <b>{protein} g</b>
          <span>protein</span>
        </div>
      </div>
      <p className="muted">
        {rows.length} meals · {work?.sessions.length ?? 0} lift sessions · {sports.length} sports ·{" "}
        {sleep.length} sleep · {mobility.length} mobility
      </p>
      {sports.map((s) => (
        <div className="item" key={s.id}>
          <div>{sportLabel(s.sport)}</div>
          <div>{s.minutes} min</div>
        </div>
      ))}
      {sleep.map((s) => (
        <div className="item" key={s.id}>
          <div>{s.kind === "night" ? "Night" : "Nap"}</div>
          <div>{fmtHours(s.minutes)}</div>
        </div>
      ))}
      {mobility.map((m) => (
        <div className="item" key={m.id}>
          <div>{routineLabel(m.routine_key)}</div>
          <div>{m.minutes} min</div>
        </div>
      ))}
      <button
        className="btn"
        type="button"
        disabled={busy}
        onClick={() => {
          void (async () => {
            setBusy(true);
            try {
              await exportAar({
                stats: rollup(rows, kcalTarget, proteinTarget),
                rows,
                from,
                to,
                kcalTarget,
                proteinTarget,
                work,
                sports,
                sleep,
                mobility,
              });
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Export failed");
            } finally {
              setBusy(false);
            }
          })();
        }}
      >
        Download {same ? "this day" : "this window"}
      </button>
    </div>
  );
}
