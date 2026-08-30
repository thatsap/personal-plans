import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";
import { formatTime, nowIso, todayKey } from "../../lib/dates";
import { saveSleep } from "../../lib/recovery/db";
import { fmtHours, minutesBetween, napTimes, nightTimes } from "../../lib/recovery/time";
import { NIGHT_FLOOR_MIN, type SleepKind } from "../../lib/recovery/types";
import { getSupabase } from "../../lib/supabase";

export default function SleepLog() {
  const nav = useNavigate();
  const [kind, setKind] = useState<SleepKind>("night");
  const [day, setDay] = useState(() => todayKey());
  const [asleep, setAsleep] = useState("23:30");
  const [wake, setWake] = useState("07:00");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const times = kind === "night" ? nightTimes(day, asleep, wake) : napTimes(day, asleep, wake);
  const mins = minutesBetween(times.asleepAt, times.wakeAt);
  const shortNight = kind === "night" && mins < NIGHT_FLOOR_MIN;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (new Date(times.wakeAt) <= new Date(times.asleepAt)) {
      setErr("Wake has to be after asleep.");
      return;
    }
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    setBusy(true);
    setErr("");
    try {
      await saveSleep({
        userId: uid,
        kind,
        asleepAt: times.asleepAt,
        wakeAt: times.wakeAt,
        minutes: mins,
        notes,
      });
      nav("/recover", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed. Run patch-recovery.sql.");
    } finally {
      setBusy(false);
    }
  }

  function napNow() {
    const start = formatTime(nowIso());
    setKind("nap");
    setDay(todayKey());
    setAsleep(start);
    const [h, m] = start.split(":").map(Number);
    const end = (h * 60 + m + 20) % (24 * 60);
    setWake(`${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`);
  }

  return (
    <div className="wrap">
      <ScreenHeader kicker="sleep" title="Sleep" />
      <p className="muted">No JSON. Night uses the wake date. If you slept at 23:30, pick tomorrow’s morning as the date.</p>
      <div className="pillrow">
        <button type="button" className={kind === "night" ? "on" : ""} onClick={() => setKind("night")}>
          Night
        </button>
        <button type="button" className={kind === "nap" ? "on" : ""} onClick={() => setKind("nap")}>
          Nap
        </button>
        <button type="button" onClick={napNow}>
          Nap now
        </button>
      </div>
      <form className="hud" onSubmit={submit}>
        <label>{kind === "night" ? "Woke on" : "Date"}</label>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} required />
        <label>{kind === "night" ? "Asleep" : "Start"}</label>
        <input type="time" value={asleep} onChange={(e) => setAsleep(e.target.value)} required />
        <label>{kind === "night" ? "Wake" : "End"}</label>
        <input type="time" value={wake} onChange={(e) => setWake(e.target.value)} required />
        <p className="muted">
          {fmtHours(mins)}
          {kind === "night" ? " night" : ""}
        </p>
        {shortNight ? <p className="err">Under 6h. Logged anyway.</p> : null}
        <label>Notes</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="watch off, late lift…" />
        {err ? <p className="err">{err}</p> : null}
        <button className="btn" disabled={busy}>
          Add to log
        </button>
      </form>
    </div>
  );
}
