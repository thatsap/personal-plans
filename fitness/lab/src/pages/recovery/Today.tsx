import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ScreenHeader } from "../../components/ScreenHeader";
import { RowOps } from "../../components/RowOps";
import { deleteMobility, deleteSleep, listMobility, listSleep } from "../../lib/recovery/db";
import { routineLabel } from "../../lib/recovery/routines";
import { fmtHours } from "../../lib/recovery/time";
import { NIGHT_FLOOR_MIN, NIGHT_TARGET_MIN, type MobilityRow, type SleepRow } from "../../lib/recovery/types";
import { dayEndIso, dayStartIso, formatTime, todayKey } from "../../lib/dates";
import { getSupabase } from "../../lib/supabase";

export default function RecToday() {
  const key = todayKey();
  const [sleep, setSleep] = useState<SleepRow[]>([]);
  const [moves, setMoves] = useState<MobilityRow[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    try {
      setSleep(await listSleep(uid, dayStartIso(key), dayEndIso(key)));
      setErr("");
    } catch {
      setSleep([]);
      setErr("Run patch-recovery.sql if recovery tables are missing.");
    }
    try {
      setMoves(await listMobility(uid, dayStartIso(key), dayEndIso(key)));
    } catch {
      setMoves([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const nights = sleep.filter((s) => s.kind === "night");
  const naps = sleep.filter((s) => s.kind === "nap");
  const nightMin = nights.reduce((n, s) => n + s.minutes, 0);

  return (
    <div className="wrap">
      <ScreenHeader kicker="recovery" title="Today" meta={key} />
      <p className="muted">Sleep is a log. Mobility is a routine you run. Fuel and Training stay on their decks.</p>
      {err ? <p className="muted">{err}</p> : null}
      <div className="totals">
        <div className="stat">
          <b>{nights.length ? fmtHours(nightMin) : "—"}</b>
          <span>night / {fmtHours(NIGHT_TARGET_MIN)}</span>
        </div>
        <div className="stat">
          <b>{naps.length}</b>
          <span>naps</span>
        </div>
        <div className="stat">
          <b>{moves.length}</b>
          <span>mobility</span>
        </div>
      </div>
      {nights.length > 0 && nightMin < NIGHT_FLOOR_MIN ? (
        <p className="err">Under {fmtHours(NIGHT_FLOOR_MIN)}. Warning only.</p>
      ) : null}
      <h2>Sleep</h2>
      {sleep.length === 0 ? <p className="empty">No sleep logged for this wake day.</p> : null}
      {sleep.map((s) => (
        <div className="item" key={s.id}>
          <div>
            <div>{s.kind === "night" ? "Night" : "Nap"}</div>
            <div className="muted">
              {formatTime(s.asleep_at)} → {formatTime(s.wake_at)} · {fmtHours(s.minutes)}
            </div>
          </div>
          <RowOps
            editTo={`/recover/sleep/${s.id}`}
            onDelete={() =>
              void deleteSleep(s.id)
                .then(load)
                .catch((e) => setErr(e instanceof Error ? e.message : "Delete failed"))
            }
          />
        </div>
      ))}
      <h2>Mobility</h2>
      {moves.length === 0 ? <p className="muted">No stretch block yet.</p> : null}
      {moves.map((m) => (
        <div className="item" key={m.id}>
          <div>
            <div>{routineLabel(m.routine_key)}</div>
            <div className="muted">
              {formatTime(m.started_at)} · {m.minutes} min · {m.moves_done}/{m.moves_total}
            </div>
          </div>
          <RowOps
            editTo={`/recover/mobility/${m.id}`}
            onDelete={() =>
              void deleteMobility(m.id)
                .then(load)
                .catch((e) => setErr(e instanceof Error ? e.message : "Delete failed"))
            }
          />
        </div>
      ))}
      <Link to="/recover/sleep" className="btn">
        Log sleep
      </Link>
      <Link to="/recover/move" className="btn ghost">
        Stretch
      </Link>
    </div>
  );
}
