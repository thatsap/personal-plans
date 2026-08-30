import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MealThumb } from "../components/MealThumb";
import { Meter } from "../components/Meter";
import { ScreenHeader } from "../components/ScreenHeader";
import { dayEndIso, dayStartIso, formatTime, todayKey } from "../lib/dates";
import { deleteIngestion, listToday } from "../lib/db";
import { pickPhoto, uploadMealPhoto } from "../lib/photo";
import { getSupabase } from "../lib/supabase";
import { KCAL_TARGET, PROTEIN_TARGET, type IngestionRow } from "../lib/types";

export default function Today() {
  const [rows, setRows] = useState<IngestionRow[]>([]);
  const [err, setErr] = useState("");
  const key = todayKey();

  async function load() {
    const sb = getSupabase();
    const { data } = await sb!.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    try {
      setRows(await listToday(uid, dayStartIso(key), dayEndIso(key)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Load failed");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const kcal = useMemo(() => rows.reduce((s, r) => s + r.kcal, 0), [rows]);
  const protein = useMemo(
    () => Math.round(rows.reduce((s, r) => s + r.protein_g, 0)),
    [rows],
  );

  async function remove(id: string) {
    await deleteIngestion(id);
    await load();
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
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Photo failed");
    }
  }

  return (
    <div className="wrap">
      <ScreenHeader kicker="ops // intake" title="Today" meta={key} />
      <div className="totals">
        <Meter
          label="Energy"
          value={kcal}
          max={KCAL_TARGET}
          unit="kcal vs protocol"
          tone={kcal > KCAL_TARGET ? "over" : undefined}
        />
        <Meter
          label="Protein"
          value={protein}
          max={PROTEIN_TARGET}
          unit="grams"
          tone={protein < PROTEIN_TARGET ? "over" : "ok"}
        />
      </div>
      {err ? <p className="err">{err}</p> : null}
      {rows.length === 0 ? (
        <p className="empty">No contacts logged. Open a door.</p>
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
                <button
                  className="btn small ghost"
                  type="button"
                  onClick={() => void remove(r.id)}
                >
                  Undo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Link to="/add" className="btn">
        Log intake
      </Link>
    </div>
  );
}
