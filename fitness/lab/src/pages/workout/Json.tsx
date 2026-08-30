import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";
import { parseWorkoutJson } from "../../lib/workout/parse";
import { saveParsedSession, upsertRoutine } from "../../lib/workout/db";
import { getSupabase } from "../../lib/supabase";

const HINT =
  "Voice the day to any AI with fitness/prompts/ROUTINE-JSON.md. kind routine = library. kind session = catch-up actuals.";

export default function WorkoutJson() {
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState("");
  const [fileName, setFileName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const preview = useMemo(() => {
    if (!raw.trim()) return { parsed: null as ReturnType<typeof parseWorkoutJson> | null, error: "" };
    try {
      return { parsed: parseWorkoutJson(raw), error: "" };
    } catch (e) {
      return { parsed: null, error: e instanceof Error ? e.message : "Parse failed" };
    }
  }, [raw]);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setFileName(f.name);
    setErr("");
    try {
      setRaw(await f.text());
    } catch {
      setErr("Could not read that file.");
    }
  }

  async function save() {
    setErr("");
    if (!preview.parsed) {
      setErr(preview.error || "Nothing to save");
      return;
    }
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    setBusy(true);
    try {
      if (preview.parsed.kind === "routine") {
        const row = await upsertRoutine(uid, preview.parsed.routine);
        nav(`/train/live/${row.id}`, { replace: true });
      } else {
        await saveParsedSession(uid, preview.parsed.session);
        nav("/train", { replace: true });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <ScreenHeader kicker="forge // file" title="Workout JSON" />
      <p className="muted">{HINT}</p>
      <button className="btn" type="button" onClick={() => fileRef.current?.click()}>
        Choose JSON from folder
      </button>
      <input
        ref={fileRef}
        className="file-hidden"
        type="file"
        accept=".json,.txt,text/plain,application/json,application/octet-stream,*/*"
        onChange={(e) => void onFile(e)}
      />
      {fileName ? <p className="muted">Selected: {fileName}</p> : null}
      <label>Or paste JSON</label>
      <textarea
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          setFileName("");
        }}
        placeholder='{"schemaVersion":1,"kind":"routine","routine":{...}}'
      />
      {preview.error ? <p className="err">{preview.error}</p> : null}
      {preview.parsed?.kind === "routine" ? (
        <div className="card">
          <div className="between">
            <b>{preview.parsed.routine.name}</b>
            <span className="tag protocol">{preview.parsed.routine.tag}</span>
          </div>
          <div className="muted">
            {preview.parsed.routine.blocks.length} slots
            {preview.parsed.routine.timeCapMin ? ` · cap ${preview.parsed.routine.timeCapMin} min` : ""}
          </div>
        </div>
      ) : null}
      {preview.parsed?.kind === "session" ? (
        <div className="card">
          <b>{preview.parsed.session.routineName}</b>
          <div className="muted">
            {preview.parsed.session.actuals.filter((a) => !a.skipped).length} slots logged ·{" "}
            {preview.parsed.session.actuals.filter((a) => a.skipped).length} skipped
          </div>
        </div>
      ) : null}
      {err ? <p className="err">{err}</p> : null}
      <button className="btn" disabled={busy || !preview.parsed} onClick={() => void save()}>
        {preview.parsed?.kind === "session" ? "Commit session" : "Save routine & start"}
      </button>
    </div>
  );
}
