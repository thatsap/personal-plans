import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";
import { fromKeyHm, formatTime, istDateKey } from "../../lib/dates";
import { SPORTS, sportLabel } from "../../lib/workout/sports";
import { getSport, updateSport } from "../../lib/workout/sportsDb";

export default function EditSport() {
  const { id } = useParams();
  const nav = useNavigate();
  const [sport, setSport] = useState("badminton");
  const [minutes, setMinutes] = useState("60");
  const [hr, setHr] = useState("");
  const [peak, setPeak] = useState("");
  const [notes, setNotes] = useState("");
  const [day, setDay] = useState("");
  const [hm, setHm] = useState("18:00");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const r = await getSport(id);
      if (!r) {
        setErr("Gone.");
        return;
      }
      setSport(r.sport);
      setMinutes(String(r.minutes));
      setHr(r.hr_avg != null ? String(r.hr_avg) : "");
      setPeak(r.peak_hr != null ? String(r.peak_hr) : "");
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
      await updateSport(id, {
        started_at: fromKeyHm(day, hm),
        sport,
        minutes: mins,
        hr_avg: hr === "" ? null : Number(hr),
        peak_hr: peak === "" ? null : Number(peak),
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
      <ScreenHeader kicker="edit" title="Sport" />
      <form className="hud" onSubmit={submit}>
        <label>Sport</label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {sportLabel(s)}
            </option>
          ))}
        </select>
        <label>Date</label>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} required />
        <label>Time</label>
        <input type="time" value={hm} onChange={(e) => setHm(e.target.value)} required />
        <label>Minutes</label>
        <input inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)} required />
        <label>Avg HR</label>
        <input inputMode="numeric" value={hr} onChange={(e) => setHr(e.target.value)} />
        <label>Peak HR</label>
        <input inputMode="numeric" value={peak} onChange={(e) => setPeak(e.target.value)} />
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
