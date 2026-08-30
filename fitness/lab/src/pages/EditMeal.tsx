import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { fromKeyHm, formatTime, istDateKey } from "../lib/dates";
import { getIngestion, updateIngestion } from "../lib/db";
import { TAGS, UNITS, type Tag, type Unit } from "../lib/types";

export default function EditMeal() {
  const { id } = useParams();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState<Unit>("g");
  const [tag, setTag] = useState<Tag>("protocol");
  const [day, setDay] = useState("");
  const [hm, setHm] = useState("12:00");
  const [base, setBase] = useState({ q: 1, kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const row = await getIngestion(id);
      if (!row) {
        setErr("Gone.");
        return;
      }
      setName(row.name);
      setQty(String(row.quantity));
      setUnit(row.unit);
      setTag(row.tag);
      setDay(istDateKey(row.eaten_at));
      setHm(formatTime(row.eaten_at));
      setBase({
        q: row.quantity || 1,
        kcal: row.kcal,
        protein: row.protein_g,
        carbs: row.carbs_g,
        fat: row.fat_g,
      });
    })();
  }, [id]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    const q = Number(qty);
    if (!q || q <= 0) {
      setErr("Quantity required.");
      return;
    }
    const factor = q / (base.q || 1);
    setBusy(true);
    setErr("");
    try {
      await updateIngestion(id, {
        name,
        unit,
        quantity: q,
        kcal: Math.round(base.kcal * factor),
        protein_g: Math.round(base.protein * factor * 10) / 10,
        carbs_g: Math.round(base.carbs * factor * 10) / 10,
        fat_g: Math.round(base.fat * factor * 10) / 10,
        tag,
        eaten_at: fromKeyHm(day, hm),
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
      <ScreenHeader kicker="edit" title="Meal" />
      <form className="hud" onSubmit={submit}>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Quantity</label>
        <input inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} />
        <label>Unit</label>
        <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
          {UNITS.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
        <label>Tag</label>
        <select value={tag} onChange={(e) => setTag(e.target.value as Tag)}>
          {TAGS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <label>Date</label>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} required />
        <label>Time</label>
        <input type="time" value={hm} onChange={(e) => setHm(e.target.value)} required />
        {err ? <p className="err">{err}</p> : null}
        <button className="btn" disabled={busy}>
          Save
        </button>
      </form>
    </div>
  );
}
