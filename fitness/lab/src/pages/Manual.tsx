import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { PhotoOptional } from "../components/PhotoOptional";
import { saveParsed } from "../lib/db";
import { useFuelDay } from "../lib/fuelDay";
import { multiply } from "../lib/math";
import { getSupabase } from "../lib/supabase";
import { TAGS, UNITS, type Tag, type Unit } from "../lib/types";

export default function Manual() {
  const nav = useNavigate();
  const { past, when, eatenAt, to } = useFuelDay();
  const [name, setName] = useState("");
  const [boughtFrom, setBought] = useState("");
  const [ingredients, setIng] = useState("");
  const [unit, setUnit] = useState<Unit>("g");
  const [quantity, setQty] = useState("1");
  const [kcal, setKcal] = useState("");
  const [protein, setP] = useState("0");
  const [carbs, setC] = useState("0");
  const [fat, setF] = useState("0");
  const [tag, setTag] = useState<Tag>("protocol");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const live = useMemo(() => {
    const q = Number(quantity);
    const pu = {
      kcal: Number(kcal) || 0,
      proteinG: Number(protein) || 0,
      carbsG: Number(carbs) || 0,
      fatG: Number(fat) || 0,
      fiberG: 0,
    };
    if (!q || !pu.kcal) return null;
    return multiply(pu, q);
  }, [quantity, kcal, protein, carbs, fat]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    setBusy(true);
    try {
      await saveParsed(
        uid,
        [
          {
            eatenAt: eatenAt(),
            name: name.trim(),
            boughtFrom,
            ingredients,
            tag,
            unit,
            quantity: Number(quantity),
            perUnit: {
              kcal: Number(kcal),
              proteinG: Number(protein) || 0,
              carbsG: Number(carbs) || 0,
              fatG: Number(fat) || 0,
              fiberG: 0,
            },
            uncertainty: "low",
            notes: "",
            sourceJson: { source: "manual" },
          },
        ],
        "manual",
        photo,
      );
      nav(to("/fuel"), { replace: true });
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <ScreenHeader kicker="door 03" title="Manual" />
      <p className="muted">
        {past ? `Lands on ${when}. ` : ""}
        Per 1 unit, then quantity. Lab multiplies.
      </p>
      <form className="hud" onSubmit={submit}>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Bought from</label>
        <input value={boughtFrom} onChange={(e) => setBought(e.target.value)} />
        <label>Ingredients</label>
        <input value={ingredients} onChange={(e) => setIng(e.target.value)} />
        <label>Unit</label>
        <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
          {UNITS.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
        <label>Quantity (this time)</label>
        <input
          type="number"
          step="any"
          min="0.01"
          value={quantity}
          onChange={(e) => setQty(e.target.value)}
          required
        />
        <label>kcal per 1 {unit}</label>
        <input
          type="number"
          step="any"
          value={kcal}
          onChange={(e) => setKcal(e.target.value)}
          required
        />
        <label>Protein g / unit</label>
        <input type="number" step="any" value={protein} onChange={(e) => setP(e.target.value)} />
        <label>Carbs g / unit</label>
        <input type="number" step="any" value={carbs} onChange={(e) => setC(e.target.value)} />
        <label>Fat g / unit</label>
        <input type="number" step="any" value={fat} onChange={(e) => setF(e.target.value)} />
        <label>Tag</label>
        <select value={tag} onChange={(e) => setTag(e.target.value as Tag)}>
          {TAGS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <PhotoOptional preview={photo} onChange={setPhoto} />
        {live ? (
          <p className="live">
            This log: <b>{live.kcal} kcal</b> · {live.proteinG} g P
          </p>
        ) : null}
        {err ? <p className="err">{err}</p> : null}
        <button className="btn" disabled={busy}>
          Save
        </button>
      </form>
    </div>
  );
}
