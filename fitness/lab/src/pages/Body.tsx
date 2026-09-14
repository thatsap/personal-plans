import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PhotoOptional } from "../components/PhotoOptional";
import { RowOps } from "../components/RowOps";
import { ScreenHeader } from "../components/ScreenHeader";
import { deleteBody, listBody, saveBody, type BodyRow } from "../lib/body";
import { formatDay, formatTime, istDateKey, nowIso, todayKey } from "../lib/dates";
import { getSupabase } from "../lib/supabase";
import { MealThumb } from "../components/MealThumb";

export default function Body() {
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [notes, setNotes] = useState("");
  const [front, setFront] = useState<string | null>(null);
  const [side, setSide] = useState<string | null>(null);
  const [rows, setRows] = useState<BodyRow[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    try {
      setRows(await listBody(uid));
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Load failed");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const kg = Number(weight);
    if (!kg || kg < 30 || kg > 250) {
      setErr("Weight in kg.");
      return;
    }
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    setBusy(true);
    setErr("");
    const waistN = waist.trim() === "" ? null : Number(waist);
    try {
      await saveBody({
        userId: uid,
        loggedAt: nowIso(),
        weightKg: kg,
        waistCm: waistN !== null && Number.isFinite(waistN) ? waistN : null,
        notes,
        frontDataUrl: front,
        sideDataUrl: side,
      });
      setWeight("");
      setWaist("");
      setNotes("");
      setFront(null);
      setSide(null);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <ScreenHeader kicker="recomp" title="Body" meta={todayKey()} />
      <p className="muted">Scale, waist, front / side. This is the scoreboard Fuel does not have.</p>
      <Link to="/" className="muted">
        ← Today
      </Link>
      <form className="hud" onSubmit={(e) => void submit(e)}>
        <label>Weight (kg)</label>
        <input
          type="number"
          step="0.1"
          min={30}
          max={250}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
        />
        <label>Waist (cm, optional)</label>
        <input
          type="number"
          step="0.1"
          min={50}
          max={200}
          value={waist}
          onChange={(e) => setWaist(e.target.value)}
        />
        <label>Notes</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} />
        <PhotoOptional
          preview={front}
          onChange={setFront}
          label="Front (optional)"
          hint="Does not set calories. Same light if you can."
        />
        <PhotoOptional
          preview={side}
          onChange={setSide}
          label="Side (optional)"
          hint=""
        />
        {err ? <p className="err">{err}</p> : null}
        <button className="btn" type="submit" disabled={busy}>
          Log body
        </button>
      </form>
      <h2>Log</h2>
      {rows.length === 0 ? <p className="empty">No scale entries.</p> : null}
      {rows.map((r) => (
        <div className="item" key={r.id}>
          <div className="item-main">
            <MealThumb path={r.photo_front_path} bucket="body-photos" />
            <MealThumb path={r.photo_side_path} bucket="body-photos" />
            <div>
              <div>
                {r.weight_kg} kg
                {r.waist_cm ? <span className="muted"> · {r.waist_cm} cm</span> : null}
              </div>
              <div className="muted">
                {formatDay(istDateKey(r.logged_at))} · {formatTime(r.logged_at)}
              </div>
              {r.notes ? <div className="muted">{r.notes}</div> : null}
            </div>
          </div>
          <RowOps
            onDelete={() =>
              void deleteBody(r.id)
                .then(load)
                .catch((e) => setErr(e instanceof Error ? e.message : "Delete failed"))
            }
          />
        </div>
      ))}
    </div>
  );
}
