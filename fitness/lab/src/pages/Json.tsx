import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { PhotoOptional } from "../components/PhotoOptional";
import { saveParsed } from "../lib/db";
import { parseIntakeJson } from "../lib/jsonIntake";
import { multiply } from "../lib/math";
import { getSupabase } from "../lib/supabase";
import type { ParsedIngestion } from "../lib/types";

const PROMPT_HINT =
  "Voice the plate to any AI with fitness/prompts/INTAKE-JSON.md. Then paste, or pick the file from a folder.";

export default function Json() {
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState("");
  const [fileName, setFileName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!raw.trim()) return { items: [] as ParsedIngestion[], error: "" };
    try {
      return { items: parseIntakeJson(raw), error: "" };
    } catch (e) {
      return { items: [], error: e instanceof Error ? e.message : "Parse failed" };
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
    if (!preview.items.length) {
      setErr(preview.error || "Nothing to save");
      return;
    }
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    setBusy(true);
    try {
      await saveParsed(uid, preview.items, "json", photo);
      nav("/fuel", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <ScreenHeader kicker="ingest // file" title="JSON" />
      <p className="muted">{PROMPT_HINT}</p>
      <button
        className="btn"
        type="button"
        onClick={() => fileRef.current?.click()}
      >
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
        placeholder='{"schemaVersion":2,"ingestions":[...]}'
      />
      {preview.error ? <p className="err">{preview.error}</p> : null}
      {preview.items.map((it, i) => {
        const t = multiply(it.perUnit, it.quantity);
        return (
          <div className="card" key={i}>
            <div className="between">
              <b>{it.name}</b>
              <span className={`tag ${it.tag}`}>{it.tag}</span>
            </div>
            <div className="muted">
              {it.quantity} × 1 {it.unit} ({it.perUnit.kcal} kcal/{it.unit})
            </div>
            <div>
              {t.kcal} kcal · {t.proteinG} P · {t.carbsG} C · {t.fatG} F
            </div>
          </div>
        );
      })}
      {err ? <p className="err">{err}</p> : null}
      <PhotoOptional preview={photo} onChange={setPhoto} />
      <p className="muted">Photo attaches to the first item only if you add more than one.</p>
      <button className="btn" disabled={busy || !preview.items.length} onClick={() => void save()}>
        Commit to log
      </button>
    </div>
  );
}
