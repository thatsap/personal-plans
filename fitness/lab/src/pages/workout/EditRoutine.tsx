import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";
import { getRoutine, updateRoutine } from "../../lib/workout/db";
import { parseWorkoutJson } from "../../lib/workout/parse";

export default function EditRoutine() {
  const { id } = useParams();
  const nav = useNavigate();
  const [raw, setRaw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const r = await getRoutine(id);
      if (!r) {
        setErr("Gone.");
        return;
      }
      setRaw(
        JSON.stringify(
          { schemaVersion: 1, kind: "routine", routine: r.source_json },
          null,
          2,
        ),
      );
    })();
  }, [id]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setBusy(true);
    setErr("");
    try {
      const parsed = parseWorkoutJson(raw);
      if (parsed.kind !== "routine") {
        setErr("This has to be a routine JSON.");
        return;
      }
      await updateRoutine(id, {
        name: parsed.routine.name,
        tag: parsed.routine.tag,
        source_json: parsed.routine,
        time_cap_min: parsed.routine.timeCapMin,
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
      <ScreenHeader kicker="edit" title="Routine" />
      <p className="muted">Same JSON as paste. Save writes over this library row.</p>
      <form className="hud" onSubmit={submit}>
        <textarea rows={18} value={raw} onChange={(e) => setRaw(e.target.value)} />
        {err ? <p className="err">{err}</p> : null}
        <button className="btn" disabled={busy}>
          Save
        </button>
      </form>
    </div>
  );
}
