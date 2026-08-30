import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";
import { upsertRoutine } from "../../lib/workout/db";
import { getSupabase } from "../../lib/supabase";
import { SCHEMES, SLOTS, type Routine, type RoutineTag, type Scheme } from "../../lib/workout/types";

type Draft = {
  slot: string;
  name: string;
  alts: string;
  scheme: Scheme;
  restSec: string;
  workSets: string;
  reps: string;
  rpe: string;
  rir: string;
  sides: "one" | "both";
};

function emptyDraft(): Draft {
  return {
    slot: "horizontal_press",
    name: "",
    alts: "",
    scheme: "straight",
    restSec: "180",
    workSets: "3",
    reps: "8",
    rpe: "8",
    rir: "2",
    sides: "one",
  };
}

export default function WorkoutManual() {
  const nav = useNavigate();
  const [name, setName] = useState("Iron Push");
  const [tag, setTag] = useState<RoutineTag>("protocol");
  const [cap, setCap] = useState("75");
  const [slots, setSlots] = useState<Draft[]>([emptyDraft()]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    const filled = slots.filter((s) => s.name.trim());
    if (!name.trim() || !filled.length) {
      setErr("Name and at least one exercise.");
      return;
    }
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    const routine: Routine = {
      name: name.trim(),
      tag,
      timeCapMin: Number(cap) || null,
      notes: "",
      blocks: filled.map((s, i) => {
        const n = Math.max(1, Number(s.workSets) || 3);
        const reps = Number(s.reps) || null;
        const rpe = s.rpe === "" ? null : Number(s.rpe);
        const rir = s.rir === "" ? null : Number(s.rir);
        const rest = s.restSec === "" ? null : Number(s.restSec);
        const work = Array.from({ length: n }, () => ({
          kind: "work" as const,
          kg: null,
          reps,
          repRange: reps ? `${reps}` : "",
          rpe: Number.isFinite(rpe as number) ? rpe : null,
          rir: Number.isFinite(rir as number) ? rir : null,
          restSec: rest,
          drops: [],
        }));
        return {
          id: `${s.slot}-${i}`,
          slot: s.slot.trim() || "other",
          scheme: s.scheme,
          restSec: rest,
          notes: "",
          exercises: [
            {
              name: s.name.trim(),
              role: "primary" as const,
              sides: s.sides,
              alternatives: s.alts
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean)
                .map((a) => ({ name: a, why: "machine busy" })),
              sets: [{ kind: "warmup" as const, kg: null, reps: 12, repRange: "", rpe: null, rir: null, restSec: null, drops: [] }, ...work],
            },
          ],
        };
      }),
    };
    setBusy(true);
    try {
      const row = await upsertRoutine(uid, routine);
      nav(`/train/live/${row.id}`, { replace: true });
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <ScreenHeader kicker="door 03" title="Build routine" />
      <p className="muted">Slots + alternatives. Depth from JSON if you need drop sets / supersets.</p>
      <form className="hud" onSubmit={submit}>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Tag</label>
        <select value={tag} onChange={(e) => setTag(e.target.value as RoutineTag)}>
          <option value="protocol">protocol</option>
          <option value="extra">extra</option>
        </select>
        <label>Time cap (min)</label>
        <input value={cap} onChange={(e) => setCap(e.target.value)} inputMode="numeric" />
        {slots.map((s, i) => (
          <div className="card" key={i}>
            <label>Slot</label>
            <select
              value={s.slot}
              onChange={(e) =>
                setSlots((all) => all.map((x, j) => (j === i ? { ...x, slot: e.target.value } : x)))
              }
            >
              {SLOTS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
            <label>Exercise</label>
            <input
              value={s.name}
              onChange={(e) =>
                setSlots((all) => all.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
              }
              placeholder="Chest press (machine)"
            />
            <label>Alternatives (comma)</label>
            <input
              value={s.alts}
              onChange={(e) =>
                setSlots((all) => all.map((x, j) => (j === i ? { ...x, alts: e.target.value } : x)))
              }
              placeholder="DB bench, barbell bench"
            />
            <div className="row">
              <label style={{ flex: 1 }}>
                Scheme
                <select
                  value={s.scheme}
                  onChange={(e) =>
                    setSlots((all) =>
                      all.map((x, j) => (j === i ? { ...x, scheme: e.target.value as Scheme } : x)),
                    )
                  }
                >
                  {SCHEMES.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              <label style={{ flex: 1 }}>
                Sides
                <select
                  value={s.sides}
                  onChange={(e) =>
                    setSlots((all) =>
                      all.map((x, j) =>
                        j === i ? { ...x, sides: e.target.value as "one" | "both" } : x,
                      ),
                    )
                  }
                >
                  <option value="one">one</option>
                  <option value="both">both (L/R)</option>
                </select>
              </label>
            </div>
            <div className="row">
              <label style={{ flex: 1 }}>
                Work sets
                <input
                  value={s.workSets}
                  onChange={(e) =>
                    setSlots((all) => all.map((x, j) => (j === i ? { ...x, workSets: e.target.value } : x)))
                  }
                />
              </label>
              <label style={{ flex: 1 }}>
                Reps
                <input
                  value={s.reps}
                  onChange={(e) =>
                    setSlots((all) => all.map((x, j) => (j === i ? { ...x, reps: e.target.value } : x)))
                  }
                />
              </label>
            </div>
            <div className="row">
              <label style={{ flex: 1 }}>
                Rest s
                <input
                  value={s.restSec}
                  onChange={(e) =>
                    setSlots((all) => all.map((x, j) => (j === i ? { ...x, restSec: e.target.value } : x)))
                  }
                />
              </label>
              <label style={{ flex: 1 }}>
                RPE
                <input
                  value={s.rpe}
                  onChange={(e) =>
                    setSlots((all) => all.map((x, j) => (j === i ? { ...x, rpe: e.target.value } : x)))
                  }
                />
              </label>
              <label style={{ flex: 1 }}>
                RIR
                <input
                  value={s.rir}
                  onChange={(e) =>
                    setSlots((all) => all.map((x, j) => (j === i ? { ...x, rir: e.target.value } : x)))
                  }
                />
              </label>
            </div>
          </div>
        ))}
        <button
          className="btn ghost"
          type="button"
          onClick={() => setSlots((s) => [...s, emptyDraft()])}
        >
          Add slot
        </button>
        {err ? <p className="err">{err}</p> : null}
        <button className="btn" disabled={busy}>
          Save & start
        </button>
      </form>
    </div>
  );
}
