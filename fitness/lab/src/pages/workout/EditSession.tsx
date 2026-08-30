import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";
import { fromKeyHm, formatTime, istDateKey } from "../../lib/dates";
import { getSession, saveSessionEdits } from "../../lib/workout/db";
import { SET_KINDS, type SessionWithSets, type SetKind } from "../../lib/workout/types";

export default function EditSession() {
  const { id } = useParams();
  const nav = useNavigate();
  const [row, setRow] = useState<SessionWithSets | null>(null);
  const [day, setDay] = useState("");
  const [hm, setHm] = useState("18:00");
  const [minutes, setMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const s = await getSession(id);
      if (!s) {
        setErr("Gone.");
        return;
      }
      setRow(s);
      setDay(istDateKey(s.started_at));
      setHm(formatTime(s.started_at));
      setMinutes(s.minutes != null ? String(s.minutes) : "");
      setNotes(s.notes);
    })();
  }, [id]);

  function patchSet(i: number, patch: Partial<SessionWithSets["sets"][number]>) {
    setRow((cur) => {
      if (!cur) return cur;
      const sets = cur.sets.map((s, j) => (j === i ? { ...s, ...patch } : s));
      return { ...cur, sets };
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!row) return;
    setBusy(true);
    setErr("");
    try {
      await saveSessionEdits({
        ...row,
        started_at: fromKeyHm(day, hm),
        minutes: minutes === "" ? null : Number(minutes),
        notes,
      });
      nav(-1);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const name = row?.routine_snapshot?.name || "Session";

  return (
    <div className="wrap">
      <ScreenHeader kicker="edit" title={name} />
      {!row ? (
        <p className="muted">{err || "Loading…"}</p>
      ) : (
        <form className="hud" onSubmit={submit}>
          <label>Date</label>
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} required />
          <label>Start</label>
          <input type="time" value={hm} onChange={(e) => setHm(e.target.value)} required />
          <label>Minutes</label>
          <input inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          <label>Notes</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} />
          <h2>Sets</h2>
          {row.sets.map((s, i) => (
            <div className="card" key={s.id || i}>
              <label>Exercise</label>
              <input
                value={s.exercise_name}
                onChange={(e) => patchSet(i, { exercise_name: e.target.value })}
              />
              <div className="row">
                <label style={{ flex: 1 }}>
                  kg
                  <input
                    inputMode="decimal"
                    value={String(s.kg)}
                    onChange={(e) => patchSet(i, { kg: Number(e.target.value) })}
                  />
                </label>
                <label style={{ flex: 1 }}>
                  reps
                  <input
                    inputMode="decimal"
                    value={String(s.reps)}
                    onChange={(e) => patchSet(i, { reps: Number(e.target.value) })}
                  />
                </label>
              </div>
              <label>Kind</label>
              <select
                value={s.kind}
                onChange={(e) => patchSet(i, { kind: e.target.value as SetKind })}
              >
                {SET_KINDS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
              <button
                className="btn small ghost"
                type="button"
                onClick={() =>
                  setRow((cur) => (cur ? { ...cur, sets: cur.sets.filter((_, j) => j !== i) } : cur))
                }
              >
                Remove set
              </button>
            </div>
          ))}
          {err ? <p className="err">{err}</p> : null}
          <button className="btn" disabled={busy}>
            Save
          </button>
        </form>
      )}
    </div>
  );
}
