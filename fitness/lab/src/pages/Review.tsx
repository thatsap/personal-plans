import { useEffect, useState } from "react";
import { ScreenHeader } from "../components/ScreenHeader";
import { dayEndIso, dayStartIso, lastNDayKeys, todayKey } from "../lib/dates";
import { listRange } from "../lib/db";
import { exportAar } from "../lib/export";
import { rollup, type ReviewStats } from "../lib/review";
import { getSupabase } from "../lib/supabase";
import { KCAL_TARGET, PROTEIN_TARGET, type IngestionRow } from "../lib/types";

type Mode = "3" | "7" | "custom";

export default function Review() {
  const [mode, setMode] = useState<Mode>("7");
  const [from, setFrom] = useState(() => lastNDayKeys(7).from);
  const [to, setTo] = useState(() => todayKey());
  const [rows, setRows] = useState<IngestionRow[]>([]);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [exporting, setExporting] = useState(false);

  function applyMode(m: Mode) {
    setMode(m);
    if (m === "3") {
      const r = lastNDayKeys(3);
      setFrom(r.from);
      setTo(r.to);
    }
    if (m === "7") {
      const r = lastNDayKeys(7);
      setFrom(r.from);
      setTo(r.to);
    }
  }

  useEffect(() => {
    void (async () => {
      const sb = getSupabase()!;
      const { data } = await sb.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      try {
        const list = await listRange(uid, dayStartIso(from), dayEndIso(to));
        setRows(list);
        setStats(rollup(list));
        setErr("");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Load failed");
      }
    })();
  }, [from, to]);

  return (
    <div className="wrap">
      <ScreenHeader kicker="after action" title="Review" />
      <p className="muted">
        Window vs {KCAL_TARGET} kcal / {PROTEIN_TARGET} g protein. Not Garmin burn.
      </p>
      <div className="pillrow">
        <button className={mode === "3" ? "on" : ""} type="button" onClick={() => applyMode("3")}>
          3 days
        </button>
        <button className={mode === "7" ? "on" : ""} type="button" onClick={() => applyMode("7")}>
          7 days
        </button>
        <button
          className={mode === "custom" ? "on" : ""}
          type="button"
          onClick={() => setMode("custom")}
        >
          Custom
        </button>
      </div>
      {mode === "custom" ? (
        <div className="row">
          <label style={{ flex: 1 }}>
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label style={{ flex: 1 }}>
            To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      ) : null}
      {err ? <p className="err">{err}</p> : null}
      {stats ? (
        <>
          <div className="totals">
            <div className="stat">
              <b>{stats.avgKcal}</b>
              <span>avg kcal / logged day</span>
            </div>
            <div className="stat">
              <b>{stats.avgProtein} g</b>
              <span>avg protein</span>
            </div>
            <div className="stat">
              <b>{stats.daysOver}</b>
              <span>days over calories</span>
            </div>
            <div className="stat">
              <b>{stats.daysOnTarget}</b>
              <span>days on target</span>
            </div>
          </div>
          <h2>What went wrong</h2>
          <ul className="verdict wrong">
            {stats.wrong.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <h2>What was right</h2>
          <ul className="verdict right">
            {stats.right.length ? (
              stats.right.map((w) => <li key={w}>{w}</li>)
            ) : (
              <li>Nothing in this window yet.</li>
            )}
          </ul>
          <h2>Days</h2>
          {stats.days.map((d) => (
            <div className="card" key={d.key}>
              <div className="between">
                <b>{d.label}</b>
                <span className={d.overKcal ? "tag junk" : "tag protocol"}>
                  {d.kcal} kcal
                </span>
              </div>
              <div className="muted">
                P {Math.round(d.protein)} · junk {d.junk} · protocol {d.protocol} · {d.items}{" "}
                logs
              </div>
            </div>
          ))}
          {stats.topJunk.length ? (
            <>
              <h2>Junk by kcal</h2>
              {stats.topJunk.map((j) => (
                <div className="item" key={j.name}>
                  <div>
                    {j.name} <span className="muted">×{j.count}</span>
                  </div>
                  <div>{j.kcal} kcal</div>
                </div>
              ))}
            </>
          ) : null}
          <p className="muted">{rows.length} logs in range.</p>
          <button
            className="btn"
            type="button"
            disabled={exporting}
            onClick={() => {
              void (async () => {
                setExporting(true);
                try {
                  await exportAar({ stats, rows, from, to });
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Export failed");
                } finally {
                  setExporting(false);
                }
              })();
            }}
          >
            Download / share AAR
          </button>
        </>
      ) : (
        <p className="empty">Compiling window…</p>
      )}
    </div>
  );
}
