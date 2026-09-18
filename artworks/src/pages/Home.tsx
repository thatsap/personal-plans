import { poems } from "../poems/index.ts";

function go(path: string) {
  window.location.hash = path;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Home() {
  const featured = poems[0];

  return (
    <section className="home">
      <header className="cover">
        <p className="kicker">A private collection</p>
        <h1>Artworks</h1>
        <p className="lede">
          A quiet room for poems. Read slowly. The page will wait.
        </p>
      </header>

      {featured && (
        <button
          className="featured"
          type="button"
          onClick={() => go(`/p/${featured.slug}`)}
        >
          <div className="featured-top">
            <span className="kicker" style={{ margin: 0 }}>
              Latest
            </span>
            <span className="meta">{featured.written}</span>
          </div>
          <h2>{featured.title}</h2>
          <p className="excerpt">{featured.excerpt}</p>
          <span className="read">Read the poem</span>
        </button>
      )}

      {poems.length > 1 && (
        <div className="toc">
          <h3>All poems</h3>
          <ol>
            {poems.map((poem, i) => (
              <li key={poem.slug}>
                <button
                  className="leaf"
                  type="button"
                  onClick={() => go(`/p/${poem.slug}`)}
                >
                  <span className="num">{pad(i + 1)}</span>
                  <span className="leaf-body">
                    <strong>{poem.title}</strong>
                    <em>{poem.written}</em>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
