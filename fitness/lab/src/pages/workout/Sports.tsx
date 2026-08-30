import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";
import { nowIso } from "../../lib/dates";
import { getSupabase } from "../../lib/supabase";
import { SPORTS, sportLabel } from "../../lib/workout/sports";
import { saveSport } from "../../lib/workout/sportsDb";

export default function SportsLog() {
  const nav = useNavigate();
  const [sport, setSport] = useState("badminton");
  const [minutes, setMinutes] = useState("60");
  const [hr, setHr] = useState("");
  const [peak, setPeak] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const mins = Number(minutes);
    if (!mins || mins <= 0) {
      setErr("Minutes required.");
      return;
    }
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    setBusy(true);
    setErr("");
    try {
      await saveSport({
        userId: uid,
        startedAt: nowIso(),
        sport,
        minutes: mins,
        hrAvg: hr === "" ? null : Number(hr),
        peakHr: peak === "" ? null : Number(peak),
        notes,
      });
      nav("/train", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed. Run patch-sports.sql.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <ScreenHeader kicker="court" title="Sport" />
      <p className="muted">Not Garmin import. You dial time. HR optional.</p>
      <form className="hud" onSubmit={submit}>
        <label>Sport</label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {sportLabel(s)}
            </option>
          ))}
        </select>
        <label>Time (minutes)</label>
        <input
          inputMode="numeric"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          required
        />
        <label>Avg HR (optional)</label>
        <input inputMode="numeric" value={hr} onChange={(e) => setHr(e.target.value)} />
        <label>Peak HR (optional)</label>
        <input inputMode="numeric" value={peak} onChange={(e) => setPeak(e.target.value)} />
        <label>Notes</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} />
        {err ? <p className="err">{err}</p> : null}
        <button className="btn" disabled={busy}>
          Add to log
        </button>
      </form>
    </div>
  );
}
