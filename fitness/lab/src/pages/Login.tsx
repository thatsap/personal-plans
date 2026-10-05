import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { clearCloud } from "../lib/config";
import { resetRedirect } from "../lib/resetUrl";
import { getSupabase } from "../lib/supabase";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(mode: "in" | "up") {
    setErr("");
    const sb = getSupabase();
    if (!sb) {
      setErr("Connect Supabase first.");
      return;
    }
    setBusy(true);
    const fn =
      mode === "in"
        ? sb.auth.signInWithPassword({ email, password })
        : sb.auth.signUp({ email, password });
    const { error } = await fn;
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    nav("/", { replace: true });
  }

  async function forgot() {
    setErr("");
    setNote("");
    const sb = getSupabase();
    if (!sb) {
      setErr("Connect Supabase first.");
      return;
    }
    if (!email.trim()) {
      setErr("Email first.");
      return;
    }
    setBusy(true);
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: resetRedirect(),
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setNote("Link sent. Open it in the browser and set a new password. The phone uses that same password.");
  }

  return (
    <div className="wrap">
      <p className="brand">LAB // KAI</p>
      <ScreenHeader kicker="restricted" title="Sign in" />
      <p className="muted">One account. This is the log, not a social app.</p>
      <form className="hud">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <div className="pw-wrap">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button
            className="eye"
            type="button"
            aria-label={showPw ? "Hide password" : "Show password"}
            onClick={() => setShowPw((v) => !v)}
          >
            {showPw ? "HIDE" : "SHOW"}
          </button>
        </div>
        {err ? <p className="err">{err}</p> : null}
        {note ? <p className="muted">{note}</p> : null}
        <button
          className="btn ghost"
          type="button"
          disabled={busy}
          onClick={() => void forgot()}
        >
          Forgot password
        </button>
        <button
          className="btn"
          type="button"
          disabled={busy}
          onClick={() => void go("in")}
        >
          Enter
        </button>
        <button
          className="btn ghost"
          type="button"
          disabled={busy}
          onClick={() => void go("up")}
        >
          Create account
        </button>
      </form>
      <button
        className="btn ghost"
        type="button"
        onClick={() => {
          clearCloud();
          nav("/connect", { replace: true });
        }}
      >
        Change project
      </button>
    </div>
  );
}
