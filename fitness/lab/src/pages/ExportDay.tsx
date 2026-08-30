import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ScreenHeader } from "../components/ScreenHeader";
import { dayEndIso, dayStartIso, todayKey } from "../lib/dates";
import { listRange } from "../lib/db";
import { exportAar } from "../lib/export";
import { rollup } from "../lib/review";
import { getSupabase } from "../lib/supabase";
import { listSessions } from "../lib/workout/db";
import { rollupWork } from "../lib/workout/review";
import { listSports } from "../lib/workout/sportsDb";
import { sportLabel, type SportRow } from "../lib/workout/sports";
import type { IngestionRow } from "../lib/types";
import type { WorkReview } from "../lib/workout/review";

export default function ExportDay() {
  const [day, setDay] = useState(() => todayKey());
  const [rows, setRows] = useState<IngestionRow[]>([]);
  const [work, setWork] = useState<WorkReview | null>(null);
  const [sports, setSports] = useState<SportRow[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const sb = getSupabase()!;
      const { data } = await sb.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      try {
        setRows(await listRange(uid, dayStartIso(day), dayEndIso(day)));
        setErr("");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Food load failed");
      }
      try {
        setWork(rollupWork(await listSessions(uid, dayStartIso(day), dayEndIso(day))));
      } catch {
        setWork(null);
      }
      try {
        setSports(await listSports(uid, dayStartIso(day), dayEndIso(day)));
      } catch {
        setSports([]);
      }
    })();
  }, [day]);

  const kcal = rows.reduce((s, r) => s + r.kcal, 0);
  const protein = Math.round(rows.reduce((s, r) => s + r.protein_g, 0));

  return (
    <div className="wrap home-wrap">
      <ScreenHeader kicker="dump" title="Export" />
      <p className="muted">One day. Food + lifts + sports. Not Garmin burn.</p>
      <Link to="/" className="muted">
        ← Lab
      </Link>
      <label>Date</label>
      <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
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
        {rows.length} meals · {work?.sessions.length ?? 0} lift sessions · {sports.length} sports
      </p>
      {sports.map((s) => (
        <div className="item" key={s.id}>
          <div>{sportLabel(s.sport)}</div>
          <div>{s.minutes} min</div>
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
                stats: rollup(rows),
                rows,
                from: day,
                to: day,
                work,
                sports,
              });
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Export failed");
            } finally {
              setBusy(false);
            }
          })();
        }}
      >
        Download this day
      </button>
    </div>
  );
}
