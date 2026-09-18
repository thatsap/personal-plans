import { Link, Navigate, useParams } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";
import { getArticle } from "../../lib/lab/articles";
import type { LabBlock } from "../../lib/lab/types";

function jump(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Blocks({ blocks }: { blocks: LabBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "p") return <p key={i}>{b.text}</p>;
        if (b.type === "h3") return <h3 key={i}>{b.text}</h3>;
        if (b.type === "ul") {
          return (
            <ul key={i}>
              {b.items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          );
        }
        if (b.type === "ol") {
          return (
            <ol key={i}>
              {b.items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          );
        }
        if (b.type === "table") {
          return (
            <div key={i} className="lab-table-wrap">
              <table className="lab-table">
                <thead>
                  <tr>
                    {b.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (b.type === "callout") {
          return (
            <aside key={i} className="lab-callout">
              {b.kicker ? <p className="kicker">{b.kicker}</p> : null}
              <p>{b.text}</p>
            </aside>
          );
        }
        return (
          <div key={i} className="lab-pair">
            <p>
              <span className="kicker">do</span> {b.do}
            </p>
            <p>
              <span className="kicker">don&apos;t</span> {b.dont}
            </p>
          </div>
        );
      })}
    </>
  );
}

export default function LabArticlePage() {
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : null;
  if (!article) return <Navigate to="/lab" replace />;

  return (
    <div className="wrap lab-article">
      <ScreenHeader kicker={article.kicker} title={article.title} meta={article.stamp} />
      <p className="muted">{article.blurb}</p>
      <Link className="muted lab-back" to="/lab">
        ← Notes
      </Link>

      <nav className="lab-toc" aria-label="Sections">
        {article.sections.map((s) => (
          <button key={s.id} type="button" onClick={() => jump(s.id)}>
            {s.title}
          </button>
        ))}
      </nav>

      {article.sections.map((s) => (
        <section key={s.id} id={s.id} className="st-block">
          <h2>{s.title}</h2>
          <Blocks blocks={s.blocks} />
        </section>
      ))}
    </div>
  );
}
