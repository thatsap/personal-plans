import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { dayEndIso, dayStartIso, formatTime } from "../../lib/dates";
import { deleteSession, listSessions } from "../../lib/workout/db";
import { volumeKg } from "../../lib/workout/live";
import { getSupabase } from "../../lib/supabase";
import type { SessionWithSets } from "../../lib/workout/types";

export function WorkToday({ dayKey }: { dayKey: string }) {
  const [rows, setRows] = useState<SessionWithSets[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    const sb = getSupabase();
    const { data } = await sb!.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    try {
      setRows(await listSessions(uid, dayStartIso(dayKey), dayEndIso(dayKey)));
      setErr("");
    } catch (e) {
      setRows([]);
      setErr(e instanceof Error ? e.message : "Gym load failed");
    }
  }

  useEffect(() => {
    void load();
  }, [dayKey]);

  return (
    <div className="wk-today">
      <h2>Work</h2>
      {err ? (
        <p className="muted">
          Gym not linked yet. Run `supabase/patch-workouts.sql` if this is the first time.
        </p>
      ) : null}
      {rows.length === 0 && !err ? <p className="muted">No session today.</p> : null}
      {rows.map((s) => {
        const work = s.sets.filter((x) => x.kind === "work");
        const top = [...work].sort((a, b) => b.kg - a.kg)[0];
        const name = s.routine_snapshot?.name || "Session";
        const cap = s.routine_snapshot?.timeCapMin;
        const over = cap && s.minutes && s.minutes > cap;
        return (
          <div className="item" key={s.id}>
            <div>
              <div>
                {name}
                {over ? <span className="tag junk">over cap</span> : null}
              </div>
              <div className="muted">
                {formatTime(s.started_at)}
                {s.minutes ? ` · ${s.minutes} min` : ""} · {work.length} work sets
                {top ? ` · ${top.exercise_name} ${top.kg}×${top.reps}` : ""}
                {s.sets.some((x) => x.planned_name && x.planned_name !== x.exercise_name)
                  ? " · swapped"
                  : ""}
              </div>
              {s.minutes && cap ? (
                <div className="muted">
                  Volume {volumeKg(work)} kg · cap {cap} min
                </div>
              ) : null}
            </div>
            <button
              className="btn small ghost"
              type="button"
              onClick={() => void deleteSession(s.id).then(() => load())}
            >
              Undo
            </button>
          </div>
        );
      })}
      <Link to="/add/workout" className="btn ghost">
        Log workout
      </Link>
    </div>
  );
}
