import { useEffect, useState } from "react";
import { listPublished } from "../lib/poems.ts";
import { go } from "../lib/route.ts";
import { readCloud } from "../lib/supabase.ts";
import type { Poem } from "../poems/types.ts";
import { site } from "../site.ts";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Home() {
  const cloud = readCloud();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(cloud.ok);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cloud.ok) return;
    let live = true;
    listPublished()
      .then((rows) => {
        if (live) setPoems(rows);
      })
      .catch((reason: unknown) => {
        if (live) setError(reason instanceof Error ? reason.message : "The collection did not load.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [cloud.ok]);

  return (
    <section className="home">
      <header className="masthead">
        <div className="mast-row">
          <div className="mast-brand">
            <p className="kicker">{site.kicker}</p>
            <h1 className="brand">{site.title}</h1>
          </div>
          <button className="gold" type="button" onClick={() => go("/write")}>
            Write
          </button>
        </div>
        <p className="lede">{site.lede}</p>
      </header>

      {loading ? <p className="note">Opening the collection…</p> : null}
      {error ? (
        <p className="err" role="alert">
          {error}
        </p>
      ) : null}
      {!cloud.ok ? (
        <p className="note">The collection is not connected yet. Write explains what to add.</p>
      ) : null}
      {cloud.ok && !loading && !error && poems.length === 0 ? (
        <p className="note">Nothing published yet.</p>
      ) : null}

      {poems.length > 0 ? (
        <div className="setlist">
          <h2>The set</h2>
          <ol>
            {poems.map((poem, i) => (
              <li key={poem.id}>
                <button
                  className={i === 0 ? "channel lit" : "channel"}
                  type="button"
                  onClick={() => go(`/p/${poem.slug}`)}
                >
                  <span className="num">{pad(i + 1)}</span>
                  <span className="channel-copy">
                    <strong>{poem.title}</strong>
                    <span className="meta">
                      {i === 0 ? <span className="badge">Latest</span> : null}
                      {poem.written ? <span>{poem.written}</span> : null}
                    </span>
                    {i === 0 && poem.excerpt ? <span className="excerpt">{poem.excerpt}</span> : null}
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
