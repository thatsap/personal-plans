import type { ReactNode } from "react";
import { useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth-context.ts";
import { go } from "../lib/route.ts";
import { site } from "../site.ts";

function Cover({ title, lede }: { title: string; lede: string }) {
  return (
    <header className="cover">
      <button className="text-link" type="button" onClick={() => go("/")}>
        Poems
      </button>
      <p className="kicker">Desk</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
    </header>
  );
}

function Setup() {
  const { cloud } = useAuth();
  const secret = !cloud.ok && cloud.reason === "service-role";

  return (
    <section className="home">
      <Cover
        title="Connect"
        lede={
          secret
            ? "That key is a secret. This site can only use the public anon key or the publishable key."
            : "Add his Supabase project, then restart the dev server."
        }
      />
      <ol className="steps">
        <li>
          Copy <code>.env.example</code> to <code>.env.local</code> in this folder.
        </li>
        <li>
          Paste the project URL and the anon or publishable key. Leave the service role key in
          Supabase.
        </li>
        <li>
          Run <code>supabase/schema.sql</code>, create his user, and insert his email into{" "}
          <code>allowed_emails</code>. The README has the click path.
        </li>
      </ol>
    </section>
  );
}

function Login() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(auth.urlError);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<"password" | "magic" | null>(null);

  async function onPassword(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim() || !password) {
      setError("Enter the email and password from his Supabase user.");
      return;
    }
    setPending("password");
    const message = await auth.signInWithPassword(email, password);
    setPending(null);
    if (message) setError(message);
  }

  async function onMagic() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Enter his email first.");
      return;
    }
    setPending("magic");
    const message = await auth.signInWithMagicLink(email);
    setPending(null);
    if (message) setError(message);
    else {
      setNotice("If this inbox is the writer, a sign-in link is on its way. Open it in this same browser.");
    }
  }

  return (
    <section className="home">
      <Cover
        title="Write"
        lede="Sign in to draft and publish. Readers only see poems you mark published."
      />
      <form onSubmit={onPassword}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? (
          <p className="err" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="note" role="status">
            {notice}
          </p>
        ) : null}
        <div className="desk-actions">
          <button className="solid" type="submit" disabled={pending !== null}>
            {pending === "password" ? "Signing in…" : "Sign in"}
          </button>
          <button className="ghost" type="button" disabled={pending !== null} onClick={() => void onMagic()}>
            {pending === "magic" ? "Sending…" : "Email me a link"}
          </button>
        </div>
        <p className="hint">The link only finishes in the browser that asked for it.</p>
      </form>
      <p className="hint" style={{ marginTop: 18 }}>
        {site.title} keeps drafts off the cover.
      </p>
    </section>
  );
}

function NotWriter() {
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="home">
      <Cover
        title="Not the writer"
        lede={
          auth.email
            ? `Signed in as ${auth.email}. The desk only opens for an address in allowed_emails.`
            : "The desk only opens for an address in allowed_emails."
        }
      />
      <p className="note">
        In the Supabase SQL editor, insert his email, then sign in again.
      </p>
      {error ? (
        <p className="err" role="alert">
          {error}
        </p>
      ) : null}
      <div className="desk-actions">
        <button
          className="ghost"
          type="button"
          onClick={() => {
            void auth.signOut().then((message) => setError(message));
          }}
        >
          Sign out
        </button>
      </div>
    </section>
  );
}

function DeskProblem() {
  const auth = useAuth();

  return (
    <section className="home">
      <Cover title="The desk is not ready" lede={auth.writerError ?? "The database did not answer."} />
      <div className="desk-actions">
        <button className="ghost" type="button" onClick={() => void auth.signOut()}>
          Sign out
        </button>
      </div>
    </section>
  );
}

export function RequireWriter({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (!auth.cloud.ok) return <Setup />;
  if (!auth.ready) {
    return (
      <section className="home">
        <p className="lede">Checking the desk…</p>
      </section>
    );
  }
  if (!auth.email) return <Login />;
  if (auth.writerError) return <DeskProblem />;
  if (!auth.writer) return <NotWriter />;
  return children;
}
