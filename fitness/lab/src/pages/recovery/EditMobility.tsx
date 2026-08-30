import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";
import { fromKeyHm, formatTime, istDateKey } from "../../lib/dates";
import { getMobility, updateMobility } from "../../lib/recovery/db";
import { routineLabel } from "../../lib/recovery/routines";

export default function EditMobility() {
  const { id } = useParams();
  const nav = useNavigate();
  const [title, setTitle] = useState("Mobility");
  const [minutes, setMinutes] = useState("10");
  const [notes, setNotes] = useState("");
  const [day, setDay] = useState("");
  const [hm, setHm] = useState("12:00");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const r = await getMobility(id);
      if (!r) {
        setErr("Gone.");
        return;
      }
      setTitle(routineLabel(r.routine_key));
      setMinutes(String(r.minutes));
      setNotes(r.notes);
      setDay(istDateKey(r.started_at));
      setHm(formatTime(r.started_at));
    })();
  }, [id]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    const mins = Number(minutes);
    if (!mins || mins <= 0) {
      setErr("Minutes required.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await updateMobility(id, {
        started_at: fromKeyHm(day, hm),
        minutes: mins,
        notes,
      });
      nav(-1);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <ScreenHeader kicker="edit" title={title} />
      <form className="hud" onSubmit={submit}>
        <label>Date</label>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} required />
        <label>Time</label>
        <input type="time" value={hm} onChange={(e) => setHm(e.target.value)} required />
        <label>Minutes</label>
        <input inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)} required />
        <label>Notes</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} />
        {err ? <p className="err">{err}</p> : null}
        <button className="btn" disabled={busy}>
          Save
        </button>
      </form>
    </div>
  );
}
