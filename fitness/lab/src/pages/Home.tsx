import { Link } from "react-router-dom";
import { useState } from "react";
import { applyTheme, readTheme, THEMES, type ThemeId } from "../lib/theme";

const LABELS: Record<ThemeId, string> = {
  forge: "Forge",
  pulse: "Pulse",
  steel: "Steel",
};

export default function Home() {
  const [theme, setTheme] = useState<ThemeId>(() => readTheme());

  return (
    <div className="wrap home-wrap">
      <p className="brand">LAB // KAI</p>
      <header className="ops-head">
        <p className="kicker">choose a deck</p>
        <h1>Lab</h1>
      </header>
      <div className="home-doors">
        <Link className="home-door fuel" to="/fuel">
          <span className="door-idx">01</span>
          <div>
            <b>Fuel</b>
            <span>Meals, JSON, repeat, AAR</span>
          </div>
        </Link>
        <Link className="home-door train" to="/train">
          <span className="door-idx">02</span>
          <div>
            <b>Training</b>
            <span>Lifts, sports, rest timer, analysis</span>
          </div>
        </Link>
        <Link className="home-door export" to="/export">
          <span className="door-idx">03</span>
          <div>
            <b>Export</b>
            <span>One day: food + lifts + court</span>
          </div>
        </Link>
      </div>
      <p className="muted">Theme</p>
      <div className="pillrow">
        {THEMES.map((id) => (
          <button
            key={id}
            type="button"
            className={theme === id ? "on" : ""}
            onClick={() => {
              applyTheme(id);
              setTheme(id);
            }}
          >
            {LABELS[id]}
          </button>
        ))}
      </div>
    </div>
  );
}
