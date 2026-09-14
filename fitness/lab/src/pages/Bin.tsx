import { useEffect, useState } from "react";
import { ScreenHeader } from "../components/ScreenHeader";
import { BIN_DAYS, daysLeft, listBin, restore, type RecycleKind, type RecycleRow } from "../lib/recycle";
import { getSupabase } from "../lib/supabase";

const LABELS: Record<RecycleKind, string> = {
  meal: "Meals",
  session: "Lifts",
  sport: "Sports",
  sleep: "Sleep",
  mobility: "Mobility",
  routine: "Routines",
  body: "Body",
};

export default function Bin() {
  const [rows, setRows] = useState<RecycleRow[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const sb = getSupabase()!;
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    try {
      setRows(await listBin(uid));
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Bin load failed");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function putBack(id: string) {
    setBusy(id);
    try {
      await restore(id);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setBusy(null);
    }
  }

  const grouped = RECYCLE_ORDER.map((kind) => ({
    kind,
    items: rows.filter((r) => r.kind === kind),
  })).filter((g) => g.items.length);

  return (
    <div className="wrap home-wrap">
      <ScreenHeader kicker="bin" title="Recycle bin" />
      <p className="muted">
        Delete sends it here. Restore any time for {BIN_DAYS} days. After that it is gone for
        good.
      </p>
      {err ? <p className="err">{err}</p> : null}
      {rows.length === 0 ? <p className="empty">Bin is empty.</p> : null}
      {grouped.map((g) => (
        <section key={g.kind}>
          <h2>{LABELS[g.kind]}</h2>
          {g.items.map((r) => (
            <div className="item" key={r.id}>
              <div>
                <div>{r.title}</div>
                <div className="muted">{daysLeft(r.deleted_at)}d left</div>
              </div>
              <button
                className="btn small ghost"
                type="button"
                disabled={busy === r.id}
                onClick={() => void putBack(r.id)}
              >
                Restore
              </button>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

const RECYCLE_ORDER: RecycleKind[] = ["session", "sport", "meal", "sleep", "mobility", "routine", "body"];
