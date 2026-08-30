import { useEffect, useState } from "react";
import { ScreenHeader } from "../../components/ScreenHeader";
import { WorkAar } from "../../components/workout/WorkAar";
import { dayEndIso, dayStartIso, lastNDayKeys, todayKey } from "../../lib/dates";
import { getSupabase } from "../../lib/supabase";
import { listSessions } from "../../lib/workout/db";
import { rollupWork, type WorkReview } from "../../lib/workout/review";
import { listSports } from "../../lib/workout/sportsDb";
import { sportLabel, type SportRow } from "../../lib/workout/sports";

type Mode = "3" | "7" | "custom";

export default function TrainReview() {
  const [mode, setMode] = useState<Mode>("7");
  const [from, setFrom] = useState(() => lastNDayKeys(7).from);
  const [to, setTo] = useState(() => todayKey());
  const [work, setWork] = useState<WorkReview | null>(null);
  const [sports, setSports] = useState<SportRow[]>([]);
  const [err, setErr] = useState("");

  function applyMode(m: Mode) {
    setMode(m);
    if (m === "3" || m === "7") {
      const r = lastNDayKeys(m === "3" ? 3 : 7);
      setFrom(r.from);
      setTo(r.to);
    }
  }

  useEffect(() => {
    void (async () => {
      const sb = getSupabase()!;
      const { data } = await sb.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      try {
        setWork(rollupWork(await listSessions(uid, dayStartIso(from), dayEndIso(to))));
        setErr("");
      } catch (e) {
        setWork(null);
        setErr(e instanceof Error ? e.message : "Gym load failed");
      }
      try {
        setSports(await listSports(uid, dayStartIso(from), dayEndIso(to)));
      } catch {
        setSports([]);
      }
    })();
  }, [from, to]);

  const sportMin = sports.reduce((n, s) => n + s.minutes, 0);

  return (
    <div className="wrap">
      <ScreenHeader kicker="after action" title="Training" />
      <p className="muted">Lifts and sports in this window. Food AAR lives in Fuel.</p>
      <div className="pillrow">
        <button className={mode === "3" ? "on" : ""} type="button" onClick={() => applyMode("3")}>
          3 days
        </button>
        <button className={mode === "7" ? "on" : ""} type="button" onClick={() => applyMode("7")}>
          7 days
        </button>
        <button className={mode === "custom" ? "on" : ""} type="button" onClick={() => setMode("custom")}>
          Custom
        </button>
      </div>
      {mode === "custom" ? (
        <div className="row">
          <label style={{ flex: 1 }}>
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label style={{ flex: 1 }}>
            To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      ) : null}
      {err ? <p className="muted">{err}</p> : null}
      <WorkAar stats={work} />
      <h2>Sports</h2>
      <p className="muted">
        {sports.length} logs · {sportMin} min
      </p>
      {sports.map((s) => (
        <div className="item" key={s.id}>
          <div>
            {sportLabel(s.sport)}
            <div className="muted">
              {s.minutes} min
              {s.hr_avg ? ` · HR ${s.hr_avg}` : ""}
              {s.peak_hr ? ` · peak ${s.peak_hr}` : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
