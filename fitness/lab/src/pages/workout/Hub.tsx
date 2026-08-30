import { Link } from "react-router-dom";
import { ScreenHeader } from "../../components/ScreenHeader";

export default function WorkoutHub() {
  return (
    <div className="wrap">
      <ScreenHeader kicker="forge" title="Add" meta="lift" />
      <p className="muted">JSON builds a routine or logs a session. Repeat last. Manual form. Then the clock starts.</p>
      <div className="doors">
        <Link className="door" to="/train/json">
          <span className="door-idx">01</span>
          <div>
            <b>JSON</b>
            <span>Paste routine or catch-up JSON</span>
          </div>
        </Link>
        <Link className="door" to="/train/repeat">
          <span className="door-idx">02</span>
          <div>
            <b>Repeat last</b>
            <span>Last working sets prefilled</span>
          </div>
        </Link>
        <Link className="door" to="/train/manual">
          <span className="door-idx">03</span>
          <div>
            <b>Manual</b>
            <span>Build a routine, then lift</span>
          </div>
        </Link>
        <Link className="door" to="/train/sports">
          <span className="door-idx">04</span>
          <div>
            <b>Sport</b>
            <span>Badminton, TT, run — minutes + optional HR</span>
          </div>
        </Link>
        <Link className="door" to="/prompts">
          <span className="door-idx">05</span>
          <div>
            <b>Prompts</b>
            <span>Copy gym JSON prompt — no repo</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
