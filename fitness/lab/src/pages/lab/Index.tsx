import { Link } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";
import { ARTICLES } from "../../lib/lab/articles";

export default function LabIndex() {
  return (
    <div className="wrap">
      <ScreenHeader kicker="lab" title="Notes" meta={`${ARTICLES.length} on file`} />
      <p className="muted">
        Doctrine that lives next to the log. Not a new bible. Fuel / Train / Recover stay the work.
      </p>
      <div className="lab-list">
        {ARTICLES.map((a) => (
          <Link key={a.slug} className="lab-item" to={`/lab/${a.slug}`}>
            <p className="kicker">{a.kicker}</p>
            <b>{a.title}</b>
            <p className="muted">{a.blurb}</p>
            <span className="stamp">{a.stamp}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
