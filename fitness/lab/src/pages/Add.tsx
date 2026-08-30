import { Link } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";

export default function Add() {
  return (
    <div className="wrap">
      <ScreenHeader kicker="fuel" title="Log" meta="per unit" />
      <p className="muted">JSON hits the backend. Repeat is the same plate, new quantity.</p>
      <div className="doors">
        <Link className="door" to="/fuel/json">
          <span className="door-idx">01</span>
          <div>
            <b>JSON</b>
            <span>Paste or pick a file from a folder</span>
          </div>
        </Link>
        <Link className="door" to="/fuel/repeat">
          <span className="door-idx">02</span>
          <div>
            <b>Repeat</b>
            <span>Saved food × new quantity</span>
          </div>
        </Link>
        <Link className="door" to="/fuel/manual">
          <span className="door-idx">03</span>
          <div>
            <b>Manual</b>
            <span>Type per-unit, then multiply</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
