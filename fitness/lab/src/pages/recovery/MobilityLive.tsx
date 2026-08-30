import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { nowIso } from "../../lib/dates";
import { saveMobility } from "../../lib/recovery/db";
import { readPlan } from "../../lib/recovery/plan";
import { getRoutine } from "../../lib/recovery/routines";
import type { MobilityRoutine } from "../../lib/recovery/types";
import { getSupabase } from "../../lib/supabase";
import { restDoneSignal, unlockAudio } from "../../lib/workout/signal";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type Pane = "do" | "avoid" | "confirm";

export default function MobilityLive() {
  const { routineKey } = useParams();
  const nav = useNavigate();
  const [routine, setRoutine] = useState<MobilityRoutine | null>(null);
  const [idx, setIdx] = useState(0);
  const [holdLeft, setHoldLeft] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [pane, setPane] = useState<Pane>("do");
  const [startedAt] = useState(() => nowIso());
  const startMs = useRef(Date.now());
  const holdTotal = useRef(30);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (routineKey === "play") {
      setRoutine(readPlan());
      return;
    }
    setRoutine(routineKey ? getRoutine(routineKey) ?? null : null);
  }, [routineKey]);

  const move = routine?.moves[idx];
  const total = routine?.moves.length ?? 0;

  useEffect(() => {
    const t = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startMs.current) / 1000));
    }, 250);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    setPane("do");
  }, [idx]);

  useEffect(() => {
    if (holdLeft === null) return;
    if (holdLeft <= 0) {
      restDoneSignal();
      if (routine && idx + 1 < routine.moves.length) {
        const next = idx + 1;
        setIdx(next);
        const sec = routine.moves[next].holdSec;
        holdTotal.current = sec;
        setHoldLeft(sec);
      } else {
        setHoldLeft(null);
        setDone(true);
      }
      return;
    }
    const t = window.setTimeout(() => setHoldLeft((n) => (n === null ? n : n - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [holdLeft, idx, routine]);

  function startHold() {
    if (!move) return;
    unlockAudio();
    holdTotal.current = move.holdSec;
    setHoldLeft(move.holdSec);
    setDone(false);
  }

  function skip() {
    if (!routine) return;
    setHoldLeft(null);
    if (idx + 1 < routine.moves.length) {
      setIdx(idx + 1);
    } else {
      setDone(true);
    }
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
    const movesDone = done ? total : idx;
    try {
      await saveMobility({
        userId: uid,
        routineKey: routine.key,
        startedAt,
        minutes,
        movesDone,
        movesTotal: total,
        notes: routine.when,
      });
      nav("/recover", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed. Run patch-recovery.sql.");
    } finally {
      setBusy(false);
    }
  }

  if (!routine || !move) {
    return (
      <div className="wrap">
        <p className="err">Routine missing.</p>
        <button className="btn ghost" type="button" onClick={() => nav("/recover/move")}>
          Back
        </button>
      </div>
    );
  }

  const pct = holdLeft === null ? 0 : Math.max(0, (holdLeft / holdTotal.current) * 100);
  const elapsedMin = Math.round(elapsed / 60);

  return (
    <div className="wrap rc-live">
      <header className="wk-session">
        <div>
          <p className="kicker">
            {idx + 1} / {total}
          </p>
          <h1>{routine.name}</h1>
        </div>
        <div className="wk-clock">
          <b>{fmt(elapsed)}</b>
          <span>clock</span>
        </div>
      </header>
      <div className="rc-dots">
        {routine.moves.map((_, i) => (
          <i key={i} className={i === idx ? "on" : i < idx ? "did" : ""} />
        ))}
      </div>
      <div className="rc-move">
        <p className="kicker">{move.side ? `side ${move.side}` : "both"} · {move.holdSec}s</p>
        <h2>{move.name}</h2>
        <div className="rc-tabs">
          {(["do", "avoid", "confirm"] as Pane[]).map((p) => (
            <button key={p} type="button" className={pane === p ? "on" : ""} onClick={() => setPane(p)}>
              {p === "do" ? "How" : p === "avoid" ? "Avoid" : "Working"}
            </button>
          ))}
        </div>
        <p className="rc-copy">
          {pane === "do" ? move.do : pane === "avoid" ? move.avoid : move.confirm}
        </p>
      </div>
      {holdLeft === null && !done ? (
        <button className="btn" type="button" onClick={startHold}>
          Start hold
        </button>
      ) : null}
      {done ? <p className="muted">Block done. Log it.</p> : null}
      {err ? <p className="err">{err}</p> : null}
      <button className="btn" disabled={busy} onClick={() => void commit()}>
        {done ? "Log block" : "Finish incomplete"} · {elapsedMin} min
      </button>
      <button className="btn ghost" type="button" onClick={() => nav("/recover/move")}>
        Cancel
      </button>
      {holdLeft !== null ? (
        <div className="wk-rest rc-hold">
          <div className="wk-rest-bar" style={{ width: `${pct}%` }} />
          <div className="wk-rest-row">
            <div>
              <p className="kicker">hold</p>
              <b>{fmt(holdLeft)}</b>
            </div>
            <div className="row">
              <button className="btn small ghost" type="button" onClick={skip}>
                Skip
              </button>
              <button
                className="btn small"
                type="button"
                onClick={() => {
                  holdTotal.current += 15;
                  setHoldLeft((n) => (n ?? move.holdSec) + 15);
                }}
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
