import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ScreenHeader } from "../../components/ScreenHeader";
import { RowOps } from "../../components/RowOps";
import { dayEndIso, dayStartIso, formatTime, todayKey } from "../../lib/dates";
import { deleteSession, listSessions } from "../../lib/workout/db";
import { volumeKg } from "../../lib/workout/live";
import { deleteSport, listSports } from "../../lib/workout/sportsDb";
import { sportLabel } from "../../lib/workout/sports";
import { getSupabase } from "../../lib/supabase";
import type { SessionWithSets } from "../../lib/workout/types";
import type { SportRow } from "../../lib/workout/sports";

export default function TrainToday() {
  const key = todayKey();
  const [sessions, setSessions] = useState<SessionWithSets[]>([]);
  const [sports, setSports] = useState<SportRow[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    try {
      setSessions(await listSessions(uid, dayStartIso(key), dayEndIso(key)));
    } catch {
      setSessions([]);
      setErr("Run patch-workouts.sql if gym tables are missing.");
    }
    try {
      setSports(await listSports(uid, dayStartIso(key), dayEndIso(key)));
    } catch {
      /* sports patch optional */
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="wrap">
      <ScreenHeader kicker="training" title="Today" meta={key} />
      <p className="muted">Lifts and sports. Fuel is a separate deck.</p>
      {err ? <p className="muted">{err}</p> : null}
      <h2>Lifts</h2>
      {sessions.length === 0 ? <p className="empty">No lift yet.</p> : null}
      {sessions.map((s) => {
        const work = s.sets.filter((x) => x.kind === "work");
        const top = [...work].sort((a, b) => b.kg - a.kg)[0];
        const name = s.routine_snapshot?.name || "Session";
        return (
          <div className="item" key={s.id}>
            <div>
              <div>{name}</div>
              <div className="muted">
                {formatTime(s.started_at)}
                {s.minutes ? ` · ${s.minutes} min` : ""} · {work.length} sets
                {top ? ` · ${top.exercise_name} ${top.kg}×${top.reps}` : ""}
              </div>
              <div className="muted">Volume {volumeKg(work)} kg</div>
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
        );
      })}
      <h2>Sports</h2>
      {sports.length === 0 ? <p className="muted">No court / run logged.</p> : null}
      {sports.map((r) => (
        <div className="item" key={r.id}>
          <div>
            <div>{sportLabel(r.sport)}</div>
            <div className="muted">
              {formatTime(r.started_at)} · {r.minutes} min
              {r.hr_avg ? ` · HR ${r.hr_avg}` : ""}
              {r.peak_hr ? ` · peak ${r.peak_hr}` : ""}
            </div>
          </div>
          <RowOps
            editTo={`/train/sport/${r.id}`}
            onDelete={() =>
              void deleteSport(r.id)
                .then(load)
                .catch((e) => setErr(e instanceof Error ? e.message : "Delete failed"))
            }
          />
        </div>
      ))}
      <Link to="/train/add" className="btn">
        Start workout
      </Link>
      <Link to="/train/sports" className="btn ghost">
        Log sport
      </Link>
    </div>
  );
}
