import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Meter } from "../components/Meter";
import { ScreenHeader } from "../components/ScreenHeader";
import { lastBody, type BodyRow } from "../lib/body";
import { dayEndIso, dayStartIso, formatDay, formatTime, todayKey, weekdayFromKey } from "../lib/dates";
import { listToday } from "../lib/db";
import { matchRoutine, protocolDay } from "../lib/protocol";
import { listSleep } from "../lib/recovery/db";
import { fmtHours } from "../lib/recovery/time";
import { NIGHT_FLOOR_MIN, NIGHT_TARGET_MIN, type SleepRow } from "../lib/recovery/types";
import { importDump } from "../lib/seed/dump";
import { getSettings, saveSettings } from "../lib/settings";
import { getSupabase } from "../lib/supabase";
import { applyTheme, readTheme, THEMES, type ThemeId } from "../lib/theme";
import { DEFAULT_KCAL_TARGET, DEFAULT_PROTEIN_TARGET } from "../lib/types";
import { listRoutines, listSessions } from "../lib/workout/db";
import type { RoutineRow, SessionWithSets } from "../lib/workout/types";

const LABELS: Record<ThemeId, string> = {
  forge: "Forge",
  pulse: "Pulse",
  steel: "Steel",
};

export default function Home() {
  const [theme, setTheme] = useState<ThemeId>(() => readTheme());
  const [dump, setDump] = useState("");
  const [err, setErr] = useState("");
  const [kcalTarget, setKcalTarget] = useState(DEFAULT_KCAL_TARGET);
  const [proteinTarget, setProteinTarget] = useState(DEFAULT_PROTEIN_TARGET);
  const [kcalEdit, setKcalEdit] = useState(String(DEFAULT_KCAL_TARGET));
  const [proteinEdit, setProteinEdit] = useState(String(DEFAULT_PROTEIN_TARGET));
  const [kcal, setKcal] = useState(0);
  const [protein, setProtein] = useState(0);
  const [body, setBody] = useState<BodyRow | null>(null);
  const [nights, setNights] = useState<SleepRow[]>([]);
  const [sessions, setSessions] = useState<SessionWithSets[]>([]);
  const [routines, setRoutines] = useState<RoutineRow[]>([]);
  const [savingTargets, setSavingTargets] = useState(false);
  const key = todayKey();

  async function load() {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    try {
      const [settings, meals, sleep, lifts, lib] = await Promise.all([
        getSettings(uid),
        listToday(uid, dayStartIso(key), dayEndIso(key)),
        listSleep(uid, dayStartIso(key), dayEndIso(key)).catch(() => [] as SleepRow[]),
        listSessions(uid, dayStartIso(key), dayEndIso(key)).catch(() => [] as SessionWithSets[]),
        listRoutines(uid).catch(() => [] as RoutineRow[]),
      ]);
      setKcalTarget(settings.kcalTarget);
      setProteinTarget(settings.proteinTarget);
      setKcalEdit(String(settings.kcalTarget));
      setProteinEdit(String(settings.proteinTarget));
      setKcal(meals.reduce((s, r) => s + r.kcal, 0));
      setProtein(Math.round(meals.reduce((s, r) => s + r.protein_g, 0)));
      setNights(sleep.filter((s) => s.kind === "night"));
      setSessions(lifts);
      setRoutines(lib);
      try {
        setBody(await lastBody(uid));
      } catch {
        setBody(null);
      }
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Load failed");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    void (async () => {
      const sb = getSupabase();
      if (!sb) return;
      const { data } = await sb.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      try {
        const r = await importDump(uid);
        setDump(r === "already" ? "" : "Garmin + Lyfta dump loaded. Not food.");
      } catch (e) {
        setDump(e instanceof Error ? e.message : "Dump failed");
      }
    })();
  }, []);

  const nightMin = nights.reduce((n, s) => n + s.minutes, 0);
  const plan = useMemo(() => protocolDay(weekdayFromKey(key)), [key]);
  const matched = plan.liftName ? matchRoutine(routines, plan.liftName) : null;
  const doneLift = sessions.find((s) => {
    const name = (s.routine_snapshot?.name || "").toLowerCase();
    if (plan.liftName && name === plan.liftName.toLowerCase()) return true;
    if (matched && s.routine_id === matched.id) return true;
    return false;
  });

  async function saveTargets() {
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    setSavingTargets(true);
    try {
      const next = await saveSettings(uid, Number(kcalEdit), Number(proteinEdit));
      setKcalTarget(next.kcalTarget);
      setProteinTarget(next.proteinTarget);
      setKcalEdit(String(next.kcalTarget));
      setProteinEdit(String(next.proteinTarget));
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save targets");
    } finally {
      setSavingTargets(false);
    }
  }

  return (
    <div className="wrap home-wrap">
      <p className="brand">LAB // KAI</p>
      <ScreenHeader kicker="today" title={formatDay(key)} meta={key} />
      {err ? <p className="err">{err}</p> : null}

      <section className="today-panel">
        <div className="between">
          <div>
            <p className="kicker">body</p>
            <b className="today-num">
              {body ? `${body.weight_kg} kg` : "—"}
            </b>
            <p className="muted">
              {body
                ? `${formatTime(body.logged_at)}${body.waist_cm ? ` · waist ${body.waist_cm} cm` : ""}`
                : "No scale log yet"}
            </p>
          </div>
          <Link className="btn small" to="/body">
            Log
          </Link>
        </div>
      </section>

      <div className="totals">
        <Meter
          label="Energy"
          value={kcal}
          max={kcalTarget}
          unit="kcal vs protocol"
          tone={kcal > kcalTarget ? "over" : undefined}
        />
        <Meter
          label="Protein"
          value={protein}
          max={proteinTarget}
          unit="grams"
          tone={protein < proteinTarget ? "over" : "ok"}
        />
      </div>

      <section className="today-panel">
        <div className="between">
          <div>
            <p className="kicker">sleep</p>
            <b className="today-num">{nights.length ? fmtHours(nightMin) : "—"}</b>
            <p className="muted">
              night / {fmtHours(NIGHT_TARGET_MIN)}
              {nights.length && nightMin < NIGHT_FLOOR_MIN ? " · under floor" : ""}
            </p>
          </div>
          <Link className="btn small ghost" to="/recover/sleep">
            Log
          </Link>
        </div>
      </section>

      <section className="today-panel">
        <div className="between">
          <div>
            <p className="kicker">lift</p>
            <b className="today-num">{plan.liftName || plan.blurb}</b>
            <p className="muted">
              {doneLift
                ? `Done · ${doneLift.minutes ?? "—"} min`
                : plan.recover
                  ? "Stretch block"
                  : matched
                    ? `${plan.blurb} · ready`
                    : plan.liftName
                      ? `${plan.blurb} · not in library`
                      : plan.blurb}
            </p>
          </div>
          {doneLift ? (
            <Link className="btn small ghost" to="/train">
              Today
            </Link>
          ) : plan.recover ? (
            <Link className="btn small" to="/recover/move">
              Move
            </Link>
          ) : matched ? (
            <Link className="btn small" to={`/train/live/${matched.id}`}>
              Start
            </Link>
          ) : (
            <Link className="btn small ghost" to="/train/add">
              Add
            </Link>
          )}
        </div>
      </section>

      <div className="home-decks">
        <Link to="/fuel">Fuel</Link>
        <Link to="/train">Train</Link>
        <Link to="/recover">Recover</Link>
        <Link to="/lab">Lab</Link>
      </div>
      <div className="home-more">
        <Link to="/export">Export</Link>
        <Link to="/prompts">Prompts</Link>
        <Link to="/bin">Bin</Link>
      </div>

      <p className="muted">Targets</p>
      <div className="row">
        <label style={{ flex: 1 }}>
          kcal
          <input
            type="number"
            min={800}
            max={6000}
            value={kcalEdit}
            onChange={(e) => setKcalEdit(e.target.value)}
          />
        </label>
        <label style={{ flex: 1 }}>
          protein g
          <input
            type="number"
            min={40}
            max={400}
            value={proteinEdit}
            onChange={(e) => setProteinEdit(e.target.value)}
          />
        </label>
      </div>
      <button className="btn ghost" type="button" disabled={savingTargets} onClick={() => void saveTargets()}>
        Save targets
      </button>

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
