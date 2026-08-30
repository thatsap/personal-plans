import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";
import { listRoutines } from "../../lib/workout/db";
import { getSupabase } from "../../lib/supabase";
import type { RoutineRow } from "../../lib/workout/types";

export default function WorkoutRepeat() {
  const nav = useNavigate();
  const [rows, setRows] = useState<RoutineRow[]>([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    void (async () => {
      const sb = getSupabase()!;
      const { data } = await sb.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      try {
        setRows(await listRoutines(uid));
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Load failed");
      }
    })();
  }, []);

  const shown = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="wrap">
      <ScreenHeader kicker="door 02" title="Repeat last" />
      <p className="muted">Opens the routine with last working sets already filled.</p>
      <label>Search</label>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Iron Push…" />
      {err ? <p className="err">{err}</p> : null}
      {shown.map((r) => (
        <button
          type="button"
          className="card pick"
          key={r.id}
          style={{ width: "100%", textAlign: "left" }}
          onClick={() => nav(`/train/live/${r.id}?repeat=1`)}
        >
          <div className="between">
            <b>{r.name}</b>
            <span className={`tag ${r.tag === "protocol" ? "protocol" : "snack"}`}>{r.tag}</span>
          </div>
          <div className="muted">
            {r.source_json.blocks.length} slots
            {r.time_cap_min ? ` · cap ${r.time_cap_min} min` : ""}
          </div>
        </button>
      ))}
      {!shown.length ? <p className="muted">No routines yet. Paste JSON or use Manual.</p> : null}
    </div>
  );
}
