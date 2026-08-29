import { useEffect, useMemo, useState } from "react";
import {
  CORE,
  allTopics,
  findHeadline,
  findPart,
  findTopic,
  headlines,
} from "./data/map";
import {
  books,
  currentBook,
  depths,
  getBook,
  intents,
  moods,
  paces,
} from "./data/books";
import type { Book, Depth, Intent, Mood, Pace, Status } from "./data/types";

type Route =
  | { name: "hub" }
  | { name: "now" }
  | { name: "books" }
  | { name: "book"; id: string }
  | { name: "headline"; id: string }
  | { name: "part"; h: string; p: string }
  | { name: "topic"; h: string; p: string; t: string };

function parseHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, "").replace(/\/$/, "");
  const parts = raw.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "hub" };
  if (parts[0] === "now") return { name: "now" };
  if (parts[0] === "books" && parts[1]) return { name: "book", id: parts[1] };
  if (parts[0] === "books") return { name: "books" };
  if (parts[0] === "h" && parts[1] && parts[2] && parts[3]) {
    return { name: "topic", h: parts[1], p: parts[2], t: parts[3] };
  }
  if (parts[0] === "h" && parts[1] && parts[2]) {
    return { name: "part", h: parts[1], p: parts[2] };
  }
  if (parts[0] === "h" && parts[1]) return { name: "headline", id: parts[1] };
  return { name: "hub" };
}

function go(path: string) {
  window.location.hash = path;
}

function Badge({ status }: { status: Status }) {
  return <span className={`badge ${status}`}>{status}</span>;
}

function Crumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="crumb">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {i > 0 && <span> / </span>}
          {item.href ? (
            <button type="button" onClick={() => go(item.href!)}>
              {item.label}
            </button>
          ) : (
            item.label
          )}
        </span>
      ))}
    </nav>
  );
}

function Hub() {
  return (
    <section>
      <p className="kicker">Core engineer · age 24</p>
      <h1>Arjun OS</h1>
      <p className="lede">
        Headline, then part, then topic, then goals. Read a little. Research
        from there. Parallel load. The well has a rope.
      </p>
      <div className="north">
        <p className="serif">{CORE}</p>
      </div>
      <div className="hub-grid">
        {headlines.map((h) => (
          <button
            key={h.id}
            className="spoke"
            type="button"
            onClick={() => go(`/h/${h.id}`)}
          >
            <div className="spoke-top">
              <span className="kicker" style={{ margin: 0 }}>
                {h.kicker}
              </span>
              <Badge status={h.status} />
            </div>
            <h3>{h.title}</h3>
            <p>
              {h.parts.length} parts ·{" "}
              {h.parts.reduce((n, p) => n + p.topics.length, 0)} topics
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

function Now() {
  const current = currentBook();
  return (
    <section>
      <p className="kicker">On the desk</p>
      <h1>Now</h1>
      {current && (
        <button
          className="now-read"
          type="button"
          onClick={() => go(`/books/${current.id}`)}
        >
          <div className="label">Current read</div>
          <h2>{current.title}</h2>
          <p className="lede" style={{ marginBottom: 0 }}>
            {current.author}
          </p>
          <p className="lede" style={{ marginBottom: 0 }}>
            Adler. Separation of tasks. The courage to be disliked — office,
            family, and the ghost.
          </p>
        </button>
      )}
      <div className="panel">
        <h3>Live load</h3>
        <p className="lede" style={{ marginBottom: 0 }}>
          Hobby: new poems, old poems as craft, guitar one song, listening log.
          Psychology: both paths. Texts: Gita + Nietzsche, Kahneman as manual.
          Religion parked. Polymath: all, coupled to live material. Physical and
          career stay on the map — not redesigned tonight.
        </p>
      </div>
      <div className="list">
        {[
          ["Philosophy", "/h/philosophy"],
          ["Hobby", "/h/hobby"],
          ["Metacognition", "/h/metacognition"],
          ["Books", "/books"],
        ].map(([label, href]) => (
          <button key={href} className="row" type="button" onClick={() => go(href)}>
            <div>
              <strong>{label}</strong>
              <div className="meta">Open the spoke</div>
            </div>
            <span className="chev">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function HeadlineView({ id }: { id: string }) {
  const h = findHeadline(id);
  if (!h) return <Missing />;
  return (
    <section>
      <Crumb
        items={[
          { label: "Map", href: "/" },
          { label: h.title },
        ]}
      />
      <p className="kicker">{h.kicker}</p>
      <h1>{h.title}</h1>
      <p className="lede">{h.briefing}</p>
      <div className="list">
        {h.parts.map((p) => (
          <button
            key={p.id}
            className="row"
            type="button"
            onClick={() => go(`/h/${h.id}/${p.id}`)}
          >
            <div>
              <strong>{p.title}</strong>
              <div className="meta">
                {p.topics.length} topic{p.topics.length === 1 ? "" : "s"} ·{" "}
                {p.briefing.slice(0, 88)}
                {p.briefing.length > 88 ? "…" : ""}
              </div>
            </div>
            <span className="chev">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PartView({ h, p }: { h: string; p: string }) {
  const headline = findHeadline(h);
  const part = findPart(h, p);
  if (!headline || !part) return <Missing />;
  return (
    <section>
      <Crumb
        items={[
          { label: "Map", href: "/" },
          { label: headline.title, href: `/h/${h}` },
          { label: part.title },
        ]}
      />
      <p className="kicker">{headline.title}</p>
      <h1>{part.title}</h1>
      <p className="lede">{part.briefing}</p>
      <div className="list">
        {part.topics.map((t) => (
          <button
            key={t.id}
            className="row"
            type="button"
            onClick={() => go(`/h/${h}/${p}/${t.id}`)}
          >
            <div>
              <strong>{t.title}</strong>
              <div className="meta">
                {t.goals.filter((g) => g.live).length
                  ? `${t.goals.filter((g) => g.live).length} live goals · `
                  : ""}
                {t.briefing.slice(0, 90)}
                {t.briefing.length > 90 ? "…" : ""}
              </div>
            </div>
            <span className="chev">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function TopicView({ h, p, t }: { h: string; p: string; t: string }) {
  const headline = findHeadline(h);
  const part = findPart(h, p);
  const topic = findTopic(h, p, t);
  if (!headline || !part || !topic) return <Missing />;
  const related = topic.bookIds.map(getBook).filter(Boolean) as Book[];
  return (
    <section>
      <Crumb
        items={[
          { label: "Map", href: "/" },
          { label: headline.title, href: `/h/${h}` },
          { label: part.title, href: `/h/${h}/${p}` },
          { label: topic.title },
        ]}
      />
      <p className="kicker">
        {headline.title} · {part.title}
      </p>
      <h1>{topic.title}</h1>
      <p className="lede">{topic.briefing}</p>
      <div className="panel">
        <h3>Goals</h3>
        {topic.goals.map((g) => (
          <div className="goal" key={g.id}>
            <h4>
              {g.title} {g.live ? <span className="badge live">live</span> : null}
            </h4>
            <p>{g.description}</p>
          </div>
        ))}
      </div>
      <div className="panel">
        <h3>Research from here</h3>
        <ul className="research">
          {topic.research.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
      <div className="panel">
        <h3>Books</h3>
        {related.map((b) => (
          <button
            key={b.id}
            className="book-mini"
            type="button"
            onClick={() => go(`/books/${b.id}`)}
          >
            <strong>
              {b.title}
              {b.current ? " · current" : ""}
            </strong>
            <span>
              {b.author} — {b.why}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function BooksView() {
  const [q, setQ] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [depth, setDepth] = useState<Depth | null>(null);
  const [pace, setPace] = useState<Pace | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return books.filter((b) => {
      if (mood && !b.moods.includes(mood)) return false;
      if (intent && !b.intents.includes(intent)) return false;
      if (depth && b.depth !== depth) return false;
      if (pace && b.pace !== pace) return false;
      if (!query) return true;
      return (
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        b.why.toLowerCase().includes(query)
      );
    });
  }, [q, mood, intent, depth, pace]);

  return (
    <section>
      <p className="kicker">Library · {books.length} titles</p>
      <h1>Books</h1>
      <p className="lede">
        Filter by mood, what you want to learn, how deep, and how long you have.
        Current read is pinned in ember.
      </p>
      <input
        className="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search title, author, why…"
        type="search"
      />
      <div className="filters" style={{ marginTop: 16 }}>
        <FilterRow
          title="Mood"
          options={moods.map((m) => ({ id: m.id, label: m.label }))}
          value={mood}
          onChange={setMood}
        />
        <FilterRow
          title="Wanting to learn"
          options={intents}
          value={intent}
          onChange={setIntent}
        />
        <FilterRow
          title="Expectation"
          options={depths}
          value={depth}
          onChange={setDepth}
        />
        <FilterRow
          title="When"
          options={paces}
          value={pace}
          onChange={setPace}
        />
      </div>
      <p className="count">{filtered.length} matches</p>
      <div className="books">
        {filtered.map((b) => (
          <button
            key={b.id}
            className={`book-card${b.current ? " current" : ""}`}
            type="button"
            onClick={() => go(`/books/${b.id}`)}
          >
            <div className="spoke-top">
              <span className="kicker" style={{ margin: 0 }}>
                {b.current ? "Current" : b.pace}
              </span>
              <span className="badge">{b.depth}</span>
            </div>
            <h3 style={{ fontSize: 22 }}>{b.title}</h3>
            <em>{b.author}</em>
            <p className="meta" style={{ marginTop: 8, color: "var(--mute)" }}>
              {b.why}
            </p>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="empty">Nothing on that filter. Clear a chip.</p>
      )}
    </section>
  );
}

function FilterRow<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (v: T | null) => void;
}) {
  return (
    <div className="filter-block">
      <h4>{title}</h4>
      <div className="chips">
        <button
          type="button"
          className={`chip${!value ? " on" : ""}`}
          onClick={() => onChange(null)}
        >
          Any
        </button>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`chip${value === o.id ? " on" : ""}`}
            onClick={() => onChange(value === o.id ? null : o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BookView({ id }: { id: string }) {
  const book = getBook(id);
  if (!book) return <Missing />;
  const also = books.filter(
    (b) =>
      b.id !== book.id &&
      (b.intents.some((i) => book.intents.includes(i)) ||
        b.moods.some((m) => book.moods.includes(m))),
  ).slice(0, 6);
  const topics = allTopics().filter((x) => x.topic.bookIds.includes(book.id));
  return (
    <section>
      <Crumb
        items={[
          { label: "Books", href: "/books" },
          { label: book.title },
        ]}
      />
      <p className="kicker">{book.current ? "Current read" : book.depth}</p>
      <h1>{book.title}</h1>
      <p className="lede" style={{ fontStyle: "italic", color: "var(--gold)" }}>
        {book.author}
      </p>
      <p className="lede">{book.why}</p>
      <div className="panel">
        <h3>Place</h3>
        <p className="lede" style={{ marginBottom: 8 }}>
          Mood: {book.moods.join(" · ")}
        </p>
        <p className="lede" style={{ marginBottom: 8 }}>
          Learn: {book.intents.join(" · ")}
        </p>
        <p className="lede" style={{ marginBottom: 0 }}>
          Expectation: {book.depth} · {book.pace}
        </p>
      </div>
      {topics.length > 0 && (
        <div className="panel">
          <h3>On the map</h3>
          {topics.map(({ headline, part, topic }) => (
            <button
              key={`${headline.id}-${part.id}-${topic.id}`}
              className="book-mini"
              type="button"
              onClick={() => go(`/h/${headline.id}/${part.id}/${topic.id}`)}
            >
              <strong>{topic.title}</strong>
              <span>
                {headline.title} / {part.title}
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="panel">
        <h3>If this, then also</h3>
        {also.map((b) => (
          <button
            key={b.id}
            className="book-mini"
            type="button"
            onClick={() => go(`/books/${b.id}`)}
          >
            <strong>{b.title}</strong>
            <span>{b.author}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Missing() {
  return (
    <section>
      <h1>No such node</h1>
      <p className="lede">That path is not on the map.</p>
      <button className="row" type="button" onClick={() => go("/")}>
        <strong>Return to map</strong>
        <span className="chev">→</span>
      </button>
    </section>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const topicHits = query
    ? allTopics().filter(
        (x) =>
          x.topic.title.toLowerCase().includes(query) ||
          x.topic.briefing.toLowerCase().includes(query) ||
          x.part.title.toLowerCase().includes(query),
      )
    : [];
  const bookHits = query
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query),
      )
    : [];

  return (
    <div className="overlay">
      <input
        className="search"
        autoFocus
        placeholder="Jump to a topic or book…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="hits">
        {topicHits.slice(0, 8).map(({ headline, part, topic }) => (
          <button
            key={topic.id + part.id}
            className="hit"
            type="button"
            onClick={() => {
              go(`/h/${headline.id}/${part.id}/${topic.id}`);
              onClose();
            }}
          >
            {topic.title}
            <small>
              {headline.title} / {part.title}
            </small>
          </button>
        ))}
        {bookHits.slice(0, 8).map((b) => (
          <button
            key={b.id}
            className="hit"
            type="button"
            onClick={() => {
              go(`/books/${b.id}`);
              onClose();
            }}
          >
            {b.title}
            <small>{b.author}</small>
          </button>
        ))}
      </div>
      <button className="row" type="button" onClick={onClose}>
        <strong>Close</strong>
      </button>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const [search, setSearch] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const dock = route.name === "now" ? "now" : route.name === "books" || route.name === "book" ? "books" : "map";

  return (
    <div className="os">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => go("/")}>
          <span className="brand-mark">Arjun OS</span>
          <span className="brand-sub">Core Engineer</span>
        </button>
        <button className="search-btn" type="button" onClick={() => setSearch(true)} aria-label="Search">
          ⌕
        </button>
      </header>
      <main className="main">
        {route.name === "hub" && <Hub />}
        {route.name === "now" && <Now />}
        {route.name === "books" && <BooksView />}
        {route.name === "book" && <BookView id={route.id} />}
        {route.name === "headline" && <HeadlineView id={route.id} />}
        {route.name === "part" && <PartView h={route.h} p={route.p} />}
        {route.name === "topic" && <TopicView h={route.h} p={route.p} t={route.t} />}
      </main>
      <nav className="dock">
        <button className={dock === "map" ? "on" : ""} type="button" onClick={() => go("/")}>
          Map
        </button>
        <button className={dock === "now" ? "on" : ""} type="button" onClick={() => go("/now")}>
          Now
        </button>
        <button className={dock === "books" ? "on" : ""} type="button" onClick={() => go("/books")}>
          Books
        </button>
      </nav>
      {search && <SearchOverlay onClose={() => setSearch(false)} />}
    </div>
  );
}
