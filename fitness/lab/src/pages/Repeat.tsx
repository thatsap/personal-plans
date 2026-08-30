import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { PhotoOptional } from "../components/PhotoOptional";
import { nowIso } from "../lib/dates";
import { listFoods, saveParsed, touchFood } from "../lib/db";
import { multiply } from "../lib/math";
import { getSupabase } from "../lib/supabase";
import type { FoodRow } from "../lib/types";

export default function Repeat() {
  const nav = useNavigate();
  const [foods, setFoods] = useState<FoodRow[]>([]);
  const [pick, setPick] = useState<FoodRow | null>(null);
  const [qty, setQty] = useState("1");
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const sb = getSupabase()!;
      const { data } = await sb.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      try {
        setFoods(await listFoods(uid));
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Load failed");
      }
    })();
  }, []);

  const shown = foods.filter((f) =>
    `${f.name} ${f.bought_from}`.toLowerCase().includes(q.toLowerCase()),
  );

  const live = useMemo(() => {
    if (!pick) return null;
    const n = Number(qty);
    if (!n) return null;
    return multiply(
      {
        kcal: pick.kcal_per_unit,
        proteinG: pick.protein_g_per_unit,
        carbsG: pick.carbs_g_per_unit,
        fatG: pick.fat_g_per_unit,
        fiberG: pick.fiber_g_per_unit,
      },
      n,
    );
  }, [pick, qty]);

  async function save() {
    if (!pick) return;
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    setBusy(true);
    setErr("");
    try {
      await saveParsed(
        uid,
        [
          {
            eatenAt: nowIso(),
            name: pick.name,
            boughtFrom: pick.bought_from,
            ingredients: pick.ingredients,
            tag: pick.tag,
            unit: pick.unit,
            quantity: Number(qty),
            perUnit: {
              kcal: pick.kcal_per_unit,
              proteinG: pick.protein_g_per_unit,
              carbsG: pick.carbs_g_per_unit,
              fatG: pick.fat_g_per_unit,
              fiberG: pick.fiber_g_per_unit,
            },
            uncertainty: "",
            notes: "",
            sourceJson: pick.source_json,
          },
        ],
        "repeat",
        photo,
      );
      await touchFood(pick.id);
      nav("/", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <ScreenHeader kicker="door 02" title="Repeat" />
      <p className="muted">Same food, new quantity. No new JSON.</p>
      <label>Search</label>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="samosa, rice…" />
      {shown.map((f) => (
        <button
          type="button"
          className={pick?.id === f.id ? "card pick on" : "card pick"}
          key={f.id}
          style={{ width: "100%", textAlign: "left" }}
          onClick={() => {
            setPick(f);
            setQty("1");
          }}
        >
          <div className="between">
            <b>{f.name}</b>
            <span className={`tag ${f.tag}`}>{f.tag}</span>
          </div>
          <div className="muted">
            {f.kcal_per_unit} kcal / {f.unit}
            {f.bought_from ? ` · ${f.bought_from}` : ""}
          </div>
        </button>
      ))}
      {pick ? (
        <>
          <label>Quantity ({pick.unit})</label>
          <input
            type="number"
            step="any"
            min="0.01"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
          {live ? (
            <p className="live">
              This log: <b>{live.kcal} kcal</b> · {live.proteinG} g P
            </p>
          ) : null}
          <PhotoOptional preview={photo} onChange={setPhoto} />
          {err ? <p className="err">{err}</p> : null}
          <button className="btn" disabled={busy} onClick={() => void save()}>
            Log it
          </button>
        </>
      ) : (
        <p className="muted">No saved foods yet. Paste JSON once.</p>
      )}
    </div>
  );
}
