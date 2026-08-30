import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SlotCard } from "../../components/workout/SlotCard";
import { nowIso } from "../../lib/dates";
import {
  getRoutine,
  lastSessionForRoutine,
  lastSlotHints,
  saveLiveSession,
} from "../../lib/workout/db";
import { applyLastSession, routineToLive } from "../../lib/workout/live";
import { restDoneSignal, unlockAudio } from "../../lib/workout/signal";
import { getSupabase } from "../../lib/supabase";
import type { LiveSlot, RoutineRow } from "../../lib/workout/types";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function WorkoutLive() {
  const { routineId } = useParams();
  const [params] = useSearchParams();
  const repeat = params.get("repeat") === "1";
  const nav = useNavigate();
  const [routine, setRoutine] = useState<RoutineRow | null>(null);
  const [slots, setSlots] = useState<LiveSlot[]>([]);
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [startedAt] = useState(() => nowIso());
  const startMs = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [restLeft, setRestLeft] = useState<number | null>(null);
  const restTotal = useRef(90);

  useEffect(() => {
    const t = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startMs.current) / 1000));
    }, 250);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (restLeft === null) return;
    if (restLeft <= 0) {
      restDoneSignal();
      setRestLeft(null);
      return;
    }
    const t = window.setTimeout(() => setRestLeft((n) => (n === null ? n : n - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [restLeft]);

  useEffect(() => {
    if (!routineId) return;
    void (async () => {
      const sb = getSupabase()!;
      const { data } = await sb.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      try {
        const row = await getRoutine(routineId);
        if (!row) {
          setErr("Routine missing.");
          return;
        }
        setRoutine(row);
        const hints = await lastSlotHints(uid);
        let live = routineToLive(row.source_json, hints);
        if (repeat) {
          const last = await lastSessionForRoutine(uid, row.id);
          if (last) live = applyLastSession(live, last);
        }
        setSlots(live);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Load failed");
      }
    })();
  }, [routineId, repeat]);

  function startRest(sec: number) {
    unlockAudio();
    const n = Math.max(5, Math.round(sec));
    restTotal.current = n;
    setRestLeft(n);
  }

  async function commit() {
    if (!routine) return;
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    setBusy(true);
    setErr("");
    const minutes = Math.max(1, Math.round(elapsed / 60));
    try {
      await saveLiveSession({
        userId: uid,
        routine,
        startedAt,
        minutes,
        notes,
        source: repeat ? "repeat" : "live",
        slots,
      });
      nav("/train", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const cap = routine?.time_cap_min;
  const elapsedMin = Math.round(elapsed / 60);
  const over = cap && elapsedMin > cap;
  const restPct =
    restLeft === null ? 0 : Math.max(0, (restLeft / restTotal.current) * 100);

  return (
    <div className="wrap wk-live">
      <header className="wk-session">
        <div>
          <p className="kicker">session</p>
          <h1>{routine?.name || "Lift"}</h1>
        </div>
        <div className="wk-clock">
          <b>{fmt(elapsed)}</b>
          <span>{cap ? `cap ${cap}m` : "clock"}</span>
        </div>
      </header>
      {over ? <p className="err">Over {cap} min. Warning only.</p> : null}
      {slots.map((slot) => (
        <SlotCard
          key={slot.key}
          slot={slot}
          onChange={(next) => setSlots((all) => all.map((s) => (s.key === next.key ? next : s)))}
          onSetDone={startRest}
        />
      ))}
      <label>Notes</label>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} />
      {err ? <p className="err">{err}</p> : null}
      <button className="btn" disabled={busy || !routine} onClick={() => void commit()}>
        Finish · {elapsedMin} min
      </button>
      <button className="btn ghost" type="button" onClick={() => nav("/train")}>
        Cancel
      </button>
      {restLeft !== null ? (
        <div className="wk-rest">
          <div className="wk-rest-bar" style={{ width: `${restPct}%` }} />
          <div className="wk-rest-row">
            <div>
              <p className="kicker">rest</p>
              <b>{fmt(restLeft)}</b>
            </div>
            <div className="row">
              <button className="btn small ghost" type="button" onClick={() => setRestLeft(null)}>
                Skip
              </button>
              <button
                className="btn small"
                type="button"
                onClick={() => startRest(restTotal.current + 15)}
              >
                +15s
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
