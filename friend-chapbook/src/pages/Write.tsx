import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context.ts";
import { listDesk } from "../lib/poems.ts";
import { go } from "../lib/route.ts";
import type { Poem } from "../poems/types.ts";
import { RequireWriter } from "./Gate.tsx";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Desk() {
  const auth = useAuth();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    listDesk()
      .then((rows) => {
        if (!live) return;
        setPoems(rows);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (live) setError(reason instanceof Error ? reason.message : "The desk did not load.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [tick]);

  return (
    <section className="home">
      <header className="masthead">
        <div className="mast-row">
          <div>
            <p className="kicker">Desk</p>
            <h1>Write</h1>
          </div>
          <button type="button" onClick={() => go("/")}>
            Poems
          </button>
        </div>
        <p className="lede">Drafts stay here. What you publish goes on the stage.</p>
      </header>

      <div className="desk-actions">
        <button className="gold" type="button" onClick={() => go("/write/new")}>
          New piece
        </button>
        <button
          type="button"
          onClick={() => {
            void auth.signOut().then((message) => {
              if (message) setSignOutError(message);
              else go("/");
            });
          }}
        >
          Sign out
        </button>
      </div>

      {loading ? <p className="note">Opening the desk…</p> : null}
      {error ? (
        <p className="err" role="alert">
          {error}
        </p>
      ) : null}
      {signOutError ? (
        <p className="err" role="alert">
          {signOutError}
        </p>
      ) : null}
      {error ? (
        <div className="desk-actions">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError(null);
              setTick((value) => value + 1);
            }}
          >
            Try again
          </button>
        </div>
      ) : null}
      {!loading && !error && poems.length === 0 ? <p className="note">Nothing on the desk yet.</p> : null}

      {poems.length > 0 ? (
        <div className="setlist">
          <h2>On the desk</h2>
          <ol>
            {poems.map((poem, i) => (
              <li key={poem.id}>
                <button className="channel" type="button" onClick={() => go(`/write/${poem.id}`)}>
                  <span className="num">{pad(i + 1)}</span>
                  <span className="channel-copy">
                    <strong>{poem.title}</strong>
                    <span className="meta">
                      <span className={poem.status === "draft" ? "badge dim" : "badge"}>
                        {poem.status === "draft" ? "Draft" : "Published"}
                      </span>
                      {poem.written ? <span>{poem.written}</span> : null}
                    </span>
                  </span>
                  <span className="keycap">Open</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

export default function Write() {
  return (
    <RequireWriter>
      <Desk />
    </RequireWriter>
  );
}
