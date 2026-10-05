import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MealThumb } from "../components/MealThumb";
import { Meter } from "../components/Meter";
import { RepeatChips } from "../components/RepeatChips";
import { RowOps } from "../components/RowOps";
import { ScreenHeader } from "../components/ScreenHeader";
import { addDaysKey, dayEndIso, dayStartIso, formatDay, formatTime } from "../lib/dates";
import { useFuelDay } from "../lib/fuelDay";
import { deleteIngestion, listRepeatHints, listToday, type RepeatHint } from "../lib/db";
import { pickPhoto, uploadMealPhoto } from "../lib/photo";
import { getSettings } from "../lib/settings";
import { getSupabase } from "../lib/supabase";
import { DEFAULT_KCAL_TARGET, DEFAULT_PROTEIN_TARGET, type IngestionRow } from "../lib/types";

export default function Today() {
  const [rows, setRows] = useState<IngestionRow[]>([]);
  const [hints, setHints] = useState<RepeatHint[]>([]);
  const [kcalTarget, setKcalTarget] = useState(DEFAULT_KCAL_TARGET);
  const [proteinTarget, setProteinTarget] = useState(DEFAULT_PROTEIN_TARGET);
  const [err, setErr] = useState("");
  const { day, past, hm, setDay, setHm, eatenAt, to } = useFuelDay();

  async function load(dayKey: string) {
    const sb = getSupabase();
    const { data } = await sb!.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    try {
      const [list, settings, repeats] = await Promise.all([
        listToday(uid, dayStartIso(dayKey), dayEndIso(dayKey)),
        getSettings(uid),
        listRepeatHints(uid, 8),
      ]);
      setRows(list);
      setKcalTarget(settings.kcalTarget);
      setProteinTarget(settings.proteinTarget);
      setHints(repeats);
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Load failed");
    }
  }

  useEffect(() => {
    void load(day);
  }, [day]);

  const kcal = useMemo(() => rows.reduce((s, r) => s + r.kcal, 0), [rows]);
  const protein = useMemo(
    () => Math.round(rows.reduce((s, r) => s + r.protein_g, 0)),
    [rows],
  );

  async function remove(id: string) {
    await deleteIngestion(id);
    await load(day);
  }

  async function attach(id: string) {
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    const shot = await pickPhoto("camera");
    if (!shot) return;
    try {
      await uploadMealPhoto(uid, id, shot);
      await load(day);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Photo failed");
    }
  }

  return (
    <div className="wrap">
      <ScreenHeader
        kicker={past ? "ops // backfill" : "ops // intake"}
        title={past ? "That day" : "Today"}
        meta={formatDay(day)}
      />
      <div className="daystep">
        <button type="button" onClick={() => setDay(addDaysKey(day, -1))}>
          Prev
        </button>
        <div className="when">
          <b>{formatDay(day)}</b>
          <span className="muted">{past ? "logging onto this date" : day}</span>
        </div>
        <button type="button" disabled={!past} onClick={() => setDay(addDaysKey(day, 1))}>
          Next
        </button>
      </div>
      {past ? (
        <label className="daytime">
          Clock time on this day
          <input type="time" value={hm} onChange={(e) => setHm(e.target.value)} />
          <span className="muted">Each new row uses this clock. Change it between plates.</span>
        </label>
      ) : null}
      <div className="totals">
        <Meter
          label="Energy"
          value={kcal}
          max={kcalTarget}
          unit="kcal vs protocol"
          tone={kcal > kcalTarget ? "over" : undefined}
        />
        <Meter
          label="Protein"
          value={protein}
          max={proteinTarget}
          unit="grams"
          tone={protein < proteinTarget ? "over" : "ok"}
        />
      </div>
      <RepeatChips
        hints={hints}
        eatenAt={past ? eatenAt() : undefined}
        onLogged={() => void load(day)}
        onError={setErr}
      />
      {err ? <p className="err">{err}</p> : null}
      {rows.length === 0 ? (
        <p className="empty">
          {past ? "Nothing on this day yet. Log it now." : "No contacts logged. Open a door."}
        </p>
      ) : (
        <div className="log-list">
          {rows.map((r) => (
            <div className="item" key={r.id}>
              <div className="item-main">
                <MealThumb path={r.photo_path} />
                <div>
                  <div>
                    {r.name}
                    <span className={`tag ${r.tag}`}>{r.tag}</span>
                  </div>
                  <div className="muted">
                    {formatTime(r.eaten_at)} · {r.quantity} {r.unit} · {r.source}
                  </div>
                  {!r.photo_path ? (
                    <button
                      className="btn small ghost"
                      type="button"
                      onClick={() => void attach(r.id)}
                    >
                      Photo
                    </button>
                  ) : null}
                </div>
              </div>
              <div>
                <div className="meter-num" style={{ fontSize: 16 }}>
                  {r.kcal}
                </div>
                <RowOps
                  editTo={`/fuel/item/${r.id}`}
                  onDelete={() =>
                    void remove(r.id).catch((e) =>
                      setErr(e instanceof Error ? e.message : "Delete failed"),
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <Link to={to("/fuel/add")} className="btn">
        {past ? "Log this day" : "Log intake"}
      </Link>
    </div>
  );
}
