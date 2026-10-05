import { useState } from "react";
import { multiply } from "../lib/math";
import { logRepeat, type RepeatHint } from "../lib/db";
import { getSupabase } from "../lib/supabase";

export function RepeatChips({
  hints,
  eatenAt,
  onLogged,
  onError,
}: {
  hints: RepeatHint[];
  eatenAt?: string;
  onLogged: () => void;
  onError: (msg: string) => void;
}) {
  const [pick, setPick] = useState<RepeatHint | null>(null);
  const [qty, setQty] = useState("1");
  const [busy, setBusy] = useState(false);

  if (!hints.length) return null;

  const live =
    pick && Number(qty) > 0
      ? multiply(
          {
            kcal: pick.food.kcal_per_unit,
            proteinG: pick.food.protein_g_per_unit,
            carbsG: pick.food.carbs_g_per_unit,
            fatG: pick.food.fat_g_per_unit,
            fiberG: pick.food.fiber_g_per_unit,
          },
          Number(qty),
        )
      : null;

  async function save() {
    if (!pick) return;
    const n = Number(qty);
    if (!n || n <= 0) return;
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    setBusy(true);
    try {
      await logRepeat(uid, pick.food, n, null, eatenAt);
      setPick(null);
      onLogged();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Repeat failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="repeat-box">
      <p className="kicker">repeat</p>
      <div className="pillrow wrap">
        {hints.map((h) => (
          <button
            key={h.food.id}
            type="button"
            className={pick?.food.id === h.food.id ? "on" : ""}
            onClick={() => {
              setPick(h);
              setQty(String(h.lastQty));
            }}
          >
            {h.food.name}
          </button>
        ))}
      </div>
      {pick ? (
        <div className="repeat-confirm">
          <label>
            {pick.food.unit}
            <input
              type="number"
              step="any"
              min="0.01"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </label>
          {live ? (
            <p className="muted">
              {live.kcal} kcal · {live.proteinG} g P
            </p>
          ) : null}
          <button className="btn" type="button" disabled={busy || !live} onClick={() => void save()}>
            Log {pick.food.name}
          </button>
        </div>
      ) : (
        <p className="muted">Tap a food, then log. Last quantity is already in.</p>
      )}
    </section>
  );
}
