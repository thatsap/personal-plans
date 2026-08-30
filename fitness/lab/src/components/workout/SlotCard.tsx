import { useState } from "react";
import { blankSet } from "../../lib/workout/live";
import type { LiveSet, LiveSlot } from "../../lib/workout/types";

export function SlotCard({
  slot,
  onChange,
  onSetDone,
}: {
  slot: LiveSlot;
  onChange: (next: LiveSlot) => void;
  onSetDone: (restSec: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  function patchSet(id: string, patch: Partial<LiveSet>) {
    onChange({
      ...slot,
      sets: slot.sets.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function complete(s: LiveSet) {
    const next = !s.done;
    patchSet(s.id, { done: next });
    if (next) {
      const rest = s.restSec ?? slot.restSec ?? 90;
      if (s.kind !== "warmup") onSetDone(rest);
    }
  }

  const names = [slot.plannedName, ...slot.alternatives.map((a) => a.name)].filter(
    (n, i, a) => n && a.indexOf(n) === i,
  );

  return (
    <div className={`wk-ex ${slot.skipped ? "wk-skip" : ""}`}>
      <div className="wk-ex-head">
        <div>
          <h3>{slot.usedName}</h3>
          <p className="muted">
            {slot.slotKey.replace(/_/g, " ")}
            {slot.scheme !== "straight" ? ` · ${slot.scheme}` : ""}
            {slot.restSec ? ` · rest ${slot.restSec}s` : ""}
          </p>
        </div>
        <div className="row">
          <button className="btn small ghost" type="button" onClick={() => setOpen((v) => !v)}>
            Swap
          </button>
          <button
            className="btn small ghost"
            type="button"
            onClick={() => onChange({ ...slot, skipped: !slot.skipped })}
          >
            {slot.skipped ? "Back" : "Skip"}
          </button>
        </div>
      </div>
      {slot.plannedName !== slot.usedName ? (
        <p className="muted">Was {slot.plannedName}</p>
      ) : null}
      {slot.lastHint ? (
        <p className="wk-hint">
          Last {slot.lastHint.slot.replace(/_/g, " ")} · {slot.lastHint.kg} × {slot.lastHint.reps}
          {slot.lastHint.exercise !== slot.usedName ? ` (${slot.lastHint.exercise})` : ""}
        </p>
      ) : null}
      {open ? (
        <div className="wk-alts">
          {names.map((n) => (
            <button
              key={n}
              type="button"
              className={n === slot.usedName ? "wk-chip on" : "wk-chip"}
              onClick={() => {
                onChange({ ...slot, usedName: n });
                setOpen(false);
              }}
            >
              {n}
            </button>
          ))}
          <div className="row">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Other movement"
            />
            <button
              className="btn small"
              type="button"
              onClick={() => {
                const n = custom.trim();
                if (!n) return;
                onChange({ ...slot, usedName: n });
                setCustom("");
                setOpen(false);
              }}
            >
              Use
            </button>
          </div>
        </div>
      ) : null}
      {slot.skipped ? (
        <p className="muted">Skipped.</p>
      ) : (
        <>
          <div className="wk-cols">
            <span>set</span>
            <span>kg</span>
            <span>reps</span>
            <span>RIR</span>
          </div>
          {slot.sets.map((s, i) => (
            <div className={`wk-row ${s.done ? "done" : ""}`} key={s.id}>
              <button
                type="button"
                className={`wk-check ${s.done ? "on" : ""}`}
                aria-label={s.done ? "Uncheck set" : "Complete set"}
                onClick={() => complete(s)}
              >
                {s.done ? "✓" : s.side || i + 1}
              </button>
              <input
                inputMode="decimal"
                value={s.kg}
                onChange={(e) => patchSet(s.id, { kg: e.target.value })}
                aria-label="kg"
              />
              <input
                inputMode="decimal"
                value={s.reps}
                onChange={(e) => patchSet(s.id, { reps: e.target.value })}
                aria-label="reps"
              />
              <input
                inputMode="decimal"
                value={s.rir}
                onChange={(e) => patchSet(s.id, { rir: e.target.value })}
                aria-label="RIR"
                placeholder={s.kind === "warmup" ? "" : "—"}
              />
            </div>
          ))}
          <button
            className="wk-addset"
            type="button"
            onClick={() => onChange({ ...slot, sets: [...slot.sets, blankSet("work")] })}
          >
            + set
          </button>
        </>
      )}
    </div>
  );
}
