import { useState } from "react";
import { Link } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { FUEL_PROMPT, GYM_PROMPT } from "../lib/prompts";

function CopyBlock({ title, blurb, text, to }: { title: string; blurb: string; text: string; to: string }) {
  const [ok, setOk] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      window.setTimeout(() => setOk(false), 1600);
    } catch {
      setOk(false);
    }
  }

  return (
    <section className="st-block pr-card">
      <p className="kicker">{title}</p>
      <h2>{title === "fuel" ? "Fuel JSON" : "Gym JSON"}</h2>
      <p className="muted">{blurb}</p>
      <button className="btn" type="button" onClick={() => void copy()}>
        {ok ? "Copied" : "Copy prompt"}
      </button>
      <Link className="btn ghost" to={to}>
        Paste in app
      </Link>
      <pre className="pr-pre">{text}</pre>
    </section>
  );
}

export default function Prompts() {
  return (
    <div className="wrap home-wrap">
      <ScreenHeader kicker="lab" title="Prompts" />
      <p className="muted">Copy into ChatGPT / Claude / Grok. Then paste the JSON back in Fuel or Training. You do not need the repo.</p>
      <Link to="/" className="muted">
        ← Lab
      </Link>
      <CopyBlock
        title="fuel"
        blurb="Meals. schemaVersion 2. Per 1 unit, then quantity."
        text={FUEL_PROMPT}
        to="/fuel/json"
      />
      <CopyBlock
        title="gym"
        blurb="kind routine = library. kind session = catch-up of what you already did."
        text={GYM_PROMPT}
        to="/train/json"
      />
    </div>
  );
}
