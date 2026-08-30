import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { applyTheme, readTheme, THEMES, type ThemeId } from "../lib/theme";
import { importDump } from "../lib/seed/dump";
import { getSupabase } from "../lib/supabase";

const LABELS: Record<ThemeId, string> = {
  forge: "Forge",
  pulse: "Pulse",
  steel: "Steel",
};

export default function Home() {
  const [theme, setTheme] = useState<ThemeId>(() => readTheme());
  const [dump, setDump] = useState("");

  useEffect(() => {
    void (async () => {
      const sb = getSupabase();
      if (!sb) return;
      const { data } = await sb.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      try {
        const r = await importDump(uid);
        setDump(r === "already" ? "Dump already in." : "Garmin + Lyfta dump loaded. Not food.");
      } catch (e) {
        setDump(e instanceof Error ? e.message : "Dump failed");
      }
    })();
  }, []);

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
        <Link className="home-door recover" to="/recover">
          <span className="door-idx">03</span>
          <div>
            <b>Recovery</b>
            <span>Sleep, naps, stretch blocks</span>
          </div>
        </Link>
        <Link className="home-door export" to="/export">
          <span className="door-idx">04</span>
          <div>
            <b>Export</b>
            <span>Window: food + lifts + court + sleep</span>
          </div>
        </Link>
        <Link className="home-door prompts" to="/prompts">
          <span className="door-idx">05</span>
          <div>
            <b>Prompts</b>
            <span>Fuel + gym JSON — copy, no repo</span>
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
      {dump ? <p className="muted">{dump}</p> : null}
    </div>
  );
}
