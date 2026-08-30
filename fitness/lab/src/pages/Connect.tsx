import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { writeCloud } from "../lib/config";

export default function Connect() {
  const nav = useNavigate();
  const [url, setUrl] = useState("");
  const [anonKey, setAnon] = useState("");

  function save(e: FormEvent) {
    e.preventDefault();
    writeCloud({ url: url.trim(), anonKey: anonKey.trim() });
    nav("/login", { replace: true });
    location.reload();
  }

  return (
    <div className="wrap">
      <p className="brand">LAB // LINK</p>
      <ScreenHeader kicker="backend" title="Connect" />
      <p className="muted">
        Project URL is https://ref.supabase.co — not the dashboard. Run schema.sql once.
        Confirm email off.
      </p>
      <form className="hud" onSubmit={save}>
        <label>Project URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://xxxx.supabase.co"
          required
        />
        <label>Anon public key</label>
        <textarea
          value={anonKey}
          onChange={(e) => setAnon(e.target.value)}
          placeholder="eyJ..."
          required
        />
        <button className="btn" type="submit">
          Save and continue
        </button>
      </form>
    </div>
  );
}
