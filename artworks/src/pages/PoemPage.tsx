import { getPoem, neighbors } from "../poems/index.ts";
import type { TypeSize } from "../lib/route.ts";
import { useEffect, useState } from "react";

function go(path: string) {
  window.location.hash = path;
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
  const poem = getPoem(slug);
  const { prev, next } = neighbors(slug);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max <= 0 ? 1 : Math.min(1, el.scrollTop / max));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!poem) {
    return (
      <section className="missing">
        <h1>Not in the collection</h1>
        <p className="lede">That page was never bound.</p>
        <button className="text-link" type="button" onClick={() => go("/")}>
          Back to poems
        </button>
      </section>
    );
  }

  const last = poem.stanzas.length - 1;

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
              aria-label={
                s === "s" ? "Small type" : s === "m" ? "Medium type" : "Large type"
              }
            >
              A
            </button>
          ))}
        </div>
      </header>

      <div className="page">
        <p className="kicker">{poem.written}</p>
        <h1>{poem.title}</h1>

        <div className="verse">
          {poem.stanzas.map((stanza, i) => (
            <p
              key={i}
              className={
                i === 0 || i === last || i === last - 1 ? "stanza refrain" : "stanza"
              }
            >
              {stanza.map((line, j) => (
                <span key={j} className="line">
                  {line}
                </span>
              ))}
            </p>
          ))}
        </div>

        <p className="endmark" aria-hidden="true" />

        <nav className={`after${!prev || !next ? " solo" : ""}`} aria-label="More poems">
          {prev ? (
            <button type="button" onClick={() => go(`/p/${prev.slug}`)}>
              <span>Previous</span>
              <strong>{prev.title}</strong>
            </button>
          ) : null}
          {next ? (
            <button className="next" type="button" onClick={() => go(`/p/${next.slug}`)}>
              <span>Next</span>
              <strong>{next.title}</strong>
            </button>
          ) : (
            <button type="button" onClick={() => go("/")}>
              <span>Collection</span>
              <strong>Back to poems</strong>
            </button>
          )}
        </nav>
      </div>
    </article>
  );
}
