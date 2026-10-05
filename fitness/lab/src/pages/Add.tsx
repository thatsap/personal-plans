import { Link } from "react-router-dom";
import { ScreenHeader } from "../components/ScreenHeader";
import { useFuelDay } from "../lib/fuelDay";

export default function Add() {
  const { past, when, to } = useFuelDay();
  return (
    <div className="wrap">
      <ScreenHeader kicker="fuel" title="Log" meta={past ? when : "per unit"} />
      <p className="muted">
        {past
          ? `This save lands on ${when}. JSON hits the backend. Repeat is the same plate, new quantity.`
          : "JSON hits the backend. Repeat is the same plate, new quantity."}
      </p>
      <div className="doors">
        <Link className="door" to={to("/fuel/json")}>
          <span className="door-idx">01</span>
          <div>
            <b>JSON</b>
            <span>Paste or pick a file from a folder</span>
          </div>
        </Link>
        <Link className="door" to={to("/fuel/repeat")}>
          <span className="door-idx">02</span>
          <div>
            <b>Repeat</b>
            <span>Saved food × new quantity</span>
          </div>
        </Link>
        <Link className="door" to={to("/fuel/manual")}>
          <span className="door-idx">03</span>
          <div>
            <b>Manual</b>
            <span>Type per-unit, then multiply</span>
          </div>
        </Link>
        <Link className="door" to="/prompts">
          <span className="door-idx">04</span>
          <div>
            <b>Prompts</b>
            <span>Copy Fuel JSON prompt — no repo</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
