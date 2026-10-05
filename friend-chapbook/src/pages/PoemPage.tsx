import { useEffect, useState } from "react";

import { useAuth } from "../lib/auth-context.ts";
import { getBySlug, listPublished } from "../lib/poems.ts";
import { go, setRobots, type TypeSize } from "../lib/route.ts";
import type { Poem, Section } from "../poems/types.ts";
import { lyricTitle } from "../poems/parts.ts";
import { site } from "../site.ts";

function lyricLabelText(label: string): string {
  return lyricTitle(label);
}

function ReaderBlocks({ poem }: { poem: Poem }) {
  const sections: Section[] = poem.sections.length ? poem.sections : [{ kind: "stanza", lines: [] }];
  const isLyrics = poem.pieceKind === "lyrics";
  const last = sections.length - 1;

  if (isLyrics) {
    return (
      <div className="verse lyrics-reader">
        {sections.map((section, i) => {
          if (!("label" in section)) return null;
          return (
            <section key={i} className="lyric-section" data-part={section.label}>
              <h2 className="lyric-label">{lyricLabelText(section.label)}</h2>
              <p className={i === 0 || i === last || i === last - 1 ? "stanza refrain" : "stanza"}>
                {section.lines.map((line, j) => (
                  <span key={j} className="line">
                    {line}
                  </span>
                ))}
              </p>
            </section>
          );
        })}
      </div>
    );
  }

  const stanzas = sections.filter((s): s is { kind: "stanza"; lines: string[] } => "kind" in s && s.kind === "stanza");

  return (
    <div className="verse">
      {stanzas.map((stanza, i) => (
        <p key={i} className={i === 0 || i === last || i === last - 1 ? "stanza refrain" : "stanza"}>
          {stanza.lines.map((line, j) => (
            <span key={j} className="line">
              {line}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

export default function PoemPage({
  slug,
  size,
  onSize,
}: {
  slug: string;
  size: TypeSize;
  onSize: (s: TypeSize) => void;
}) {
  const auth = useAuth();
  const requestKey = `${slug}|${auth.ready}|${auth.writer}|${auth.cloud.ok}`;
  const [seenKey, setSeenKey] = useState(requestKey);
  const [poem, setPoem] = useState<Poem | null>(null);
  const [collection, setCollection] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(auth.cloud.ok);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  if (seenKey !== requestKey) {
    setSeenKey(requestKey);
    setPoem(null);
    setCollection([]);
    setLoading(auth.cloud.ok);
    setMissing(false);
    setError(null);
    setProgress(0);
  }

  useEffect(() => {
    if (!auth.cloud.ok || !auth.ready) return;
    let live = true;
    listPublished()
      .then(async (published) => {
        const found = published.find((item) => item.slug === slug) ?? null;
        const resolved = found ?? (auth.writer ? await getBySlug(slug) : null);
        if (!live) return;
        setCollection(published);
        setPoem(resolved);
        setMissing(!resolved);
      })
      .catch((reason: unknown) => {
        if (!live) return;
        setError(reason instanceof Error ? reason.message : "That page did not load.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [auth.cloud.ok, auth.ready, auth.writer, slug]);

  useEffect(() => {
    if (!poem) return;
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max <= 0 ? 1 : Math.min(1, el.scrollTop / max));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [poem]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (poem?.status === "draft") setRobots("noindex, nofollow");
    document.title = poem ? `${poem.title} · ${site.title}` : site.title;
  }, [poem]);

  if (!auth.cloud.ok) {
    return (
      <section className="missing">
        <h1>Not connected</h1>
        <p className="lede">This collection has no database yet.</p>
        <button className="gold" type="button" onClick={() => go("/")}>
          Back to poems
        </button>
      </section>
    );
  }

  if (!auth.ready || loading) {
    return (
      <section className="missing">
        <p className="lede">Turning the page…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="missing">
        <h1>The page did not open</h1>
        <p className="err" role="alert">
          {error}
        </p>
        <button className="gold" type="button" onClick={() => go("/")}>
          Back to poems
        </button>
      </section>
    );
  }

  if (missing || !poem) {
    return (
      <section className="missing">
        <h1>Not in the collection</h1>
        <p className="lede">That page was never bound.</p>
        <button className="gold" type="button" onClick={() => go("/")}>
          Back to poems
        </button>
      </section>
    );
  }

  const index = collection.findIndex((item) => item.id === poem.id);
  const prev = index > 0 ? collection[index - 1] : undefined;
  const next = index >= 0 ? collection[index + 1] : undefined;

  return (
    <article className="reader" data-size={size}>
      <div className="progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <header className="reader-bar">
        <button className="back" type="button" onClick={() => go("/")}>
          Poems
        </button>
        <span className="now-title">{poem.title}</span>
        <div className="type" role="group" aria-label="Type size">
          {(["s", "m", "l"] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`size-${s}${size === s ? " on" : ""}`}
              onClick={() => onSize(s)}
              aria-pressed={size === s}
              aria-label={s === "s" ? "Small type" : s === "m" ? "Medium type" : "Large type"}
            >
              A
            </button>
          ))}
        </div>
      </header>

      <div className="page">
        {poem.status === "draft" ? (
          <p className="draft-banner">Draft · only the writer can open this page</p>
        ) : null}
        <p className="kicker">{poem.written}</p>
        <h1>{poem.title}</h1>

        <ReaderBlocks poem={poem} />

        <p className="endmark" aria-hidden="true" />

        <nav className={`after${!prev || !next ? " solo" : ""}`} aria-label="More poems">
          {prev ? (
            <button type="button" className="channel" onClick={() => go(`/p/${prev.slug}`)}>
              <span className="num">←</span>
              <span className="channel-copy">
                <span className="meta">Previous</span>
                <strong>{prev.title}</strong>
              </span>
              <span className="keycap">Open</span>
            </button>
          ) : null}
          {next ? (
            <button className="channel next" type="button" onClick={() => go(`/p/${next.slug}`)}>
              <span className="num">→</span>
              <span className="channel-copy">
                <span className="meta">Next</span>
                <strong>{next.title}</strong>
              </span>
              <span className="keycap">Open</span>
            </button>
          ) : (
            <button type="button" className="channel" onClick={() => go("/")}>
              <span className="num">Set</span>
              <span className="channel-copy">
                <span className="meta">Collection</span>
                <strong>Back to poems</strong>
              </span>
              <span className="keycap">Open</span>
            </button>
          )}
        </nav>
      </div>
    </article>
  );
}
