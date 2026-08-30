import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";
import { formatTime, istDateKey } from "../../lib/dates";
import { getSleep, updateSleep } from "../../lib/recovery/db";
import { fmtHours, minutesBetween, napTimes, nightTimes } from "../../lib/recovery/time";
import { NIGHT_FLOOR_MIN, type SleepKind } from "../../lib/recovery/types";

export default function EditSleep() {
  const { id } = useParams();
  const nav = useNavigate();
  const [kind, setKind] = useState<SleepKind>("night");
  const [day, setDay] = useState("");
  const [asleep, setAsleep] = useState("23:30");
  const [wake, setWake] = useState("07:00");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const r = await getSleep(id);
      if (!r) {
        setErr("Gone.");
        return;
      }
      setKind(r.kind);
      setDay(istDateKey(r.wake_at));
      setAsleep(formatTime(r.asleep_at));
      setWake(formatTime(r.wake_at));
      setNotes(r.notes);
    })();
  }, [id]);

  const times = kind === "night" ? nightTimes(day || "2026-01-01", asleep, wake) : napTimes(day || "2026-01-01", asleep, wake);
  const mins = minutesBetween(times.asleepAt, times.wakeAt);
  const shortNight = kind === "night" && mins < NIGHT_FLOOR_MIN;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (new Date(times.wakeAt) <= new Date(times.asleepAt)) {
      setErr("Wake has to be after asleep.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await updateSleep(id, {
        kind,
        asleep_at: times.asleepAt,
        wake_at: times.wakeAt,
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
      <ScreenHeader kicker="edit" title="Sleep" />
      <div className="pillrow">
        <button type="button" className={kind === "night" ? "on" : ""} onClick={() => setKind("night")}>
          Night
        </button>
        <button type="button" className={kind === "nap" ? "on" : ""} onClick={() => setKind("nap")}>
          Nap
        </button>
      </div>
      <form className="hud" onSubmit={submit}>
        <label>{kind === "night" ? "Woke on" : "Date"}</label>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} required />
        <label>{kind === "night" ? "Asleep" : "Start"}</label>
        <input type="time" value={asleep} onChange={(e) => setAsleep(e.target.value)} required />
        <label>{kind === "night" ? "Wake" : "End"}</label>
        <input type="time" value={wake} onChange={(e) => setWake(e.target.value)} required />
        <p className="muted">{fmtHours(mins)}</p>
        {shortNight ? <p className="err">Under 6h. Saved anyway.</p> : null}
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
