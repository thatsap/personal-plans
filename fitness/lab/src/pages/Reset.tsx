import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { recoveryLinkPresent } from "../lib/resetUrl";
import { getSupabase } from "../lib/supabase";

export default function Reset() {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [ready, setReady] = useState(false);
  const [canSet, setCanSet] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const fromLink = recoveryLinkPresent();
    const sb = getSupabase();
    if (!sb) {
      setErr("Connect Supabase first.");
      setReady(true);
      return;
    }
    let on = true;
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (!on) return;
      if (event === "PASSWORD_RECOVERY" || (fromLink && session)) setCanSet(true);
    });
    void sb.auth.getSession().then(({ data }) => {
      if (!on) return;
      if (fromLink && data.session) setCanSet(true);
      setReady(true);
    });
    return () => {
      on = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function save() {
    setErr("");
    if (password.length < 6) {
      setErr("Use at least 6 characters.");
      return;
    }
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setDone(true);
  }

  return (
    <div className="wrap">
      <p className="brand">LAB // KAI</p>
      <ScreenHeader kicker="restricted" title="New password" />
      {done ? (
        <>
          <p className="muted">
            Password set. The phone app and this site use the same one. Sign in on the phone with it.
          </p>
          <button className="btn" type="button" onClick={() => window.location.assign("/")}>
            Open lab
          </button>
        </>
      ) : !ready ? (
        <p className="muted">Checking the link…</p>
      ) : canSet ? (
        <form
          className="hud"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label>New password</label>
          <div className="pw-wrap">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              autoFocus
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
          <button className="btn" disabled={busy}>
            Set password
          </button>
        </form>
      ) : (
        <>
          <p className="muted">
            {err || "This reset link is missing or expired. Request a new one from the sign-in screen."}
          </p>
          <Link to="/login" className="btn">
            Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}
