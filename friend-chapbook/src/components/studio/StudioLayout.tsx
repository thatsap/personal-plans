import { useEffect, useState, type ReactNode } from "react";
import { go } from "../../lib/route.ts";
import { RhymeTray } from "./RhymeTray.tsx";

type StudioLayoutProps = {
  title: string;
  isNew: boolean;
  slug: string;
  pieceLabel: string;
  children: ReactNode;
  meta: ReactNode;
  rhymeWord: string | null;
  rhymes: string[];
  rhymeLoading: boolean;
  onTitle: (value: string) => void;
  onRhymePick: (word: string) => void;
  error: string | null;
  notice: string | null;
  pending: "save" | "delete" | null;
  status: "draft" | "published";
  onStatus: (status: "draft" | "published") => void;
  onSave: () => void;
  onDelete: () => void;
};

export function StudioLayout({
  title,
  isNew,
  slug,
  pieceLabel,
  children,
  meta,
  rhymeWord,
  rhymes,
  rhymeLoading,
  onTitle,
  onRhymePick,
  error,
  notice,
  pending,
  status,
  onStatus,
  onSave,
  onDelete,
}: StudioLayoutProps) {
  const [slip, setSlip] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className="board" data-kind={pieceLabel.toLowerCase()}>
      <header className="board-top">
        <button className="back board-back" type="button" onClick={() => go("/write")}>
          Desk
        </button>
        <label className="board-title">
          <span className="visually-hidden">Title</span>
          <input
            value={title}
            placeholder={`Untitled ${pieceLabel.toLowerCase()}`}
            onChange={(event) => onTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
          />
        </label>
        <div className="board-status" role="group" aria-label="Status">
          <button
            type="button"
            className={status === "draft" ? "on" : undefined}
            aria-pressed={status === "draft"}
            onClick={() => onStatus("draft")}
          >
            Draft
          </button>
          <button
            type="button"
            className={status === "published" ? "on" : undefined}
            aria-pressed={status === "published"}
            onClick={() => onStatus("published")}
          >
            Live
          </button>
        </div>
        <button className="gold solid board-save" type="button" disabled={pending !== null} onClick={onSave}>
          {pending === "save" ? "Saving" : "Save"}
        </button>
      </header>

      <div className="board-stage">
        {children}
        <RhymeTray word={rhymeWord} rhymes={rhymes} loading={rhymeLoading} onPick={onRhymePick} />
      </div>

      <footer className="board-foot">
        <button type="button" className={slip ? "tool on" : "tool"} aria-expanded={slip} onClick={() => setSlip((open) => !open)}>
          {slip ? "Close details" : "Details"}
        </button>
        {slug && !isNew ? (
          <button className="tool" type="button" onClick={() => go(`/p/${slug}`)}>
            Read
          </button>
        ) : null}
        <button className="tool danger" type="button" disabled={pending !== null} onClick={() => void onDelete()}>
          {isNew ? "Discard" : "Remove"}
        </button>
        <p className={`board-flash${error ? " is-err" : ""}`} role="status">
          {error ?? notice ?? pieceLabel}
        </p>
      </footer>

      {slip ? <div className="board-slip">{meta}</div> : null}
    </div>
  );
}
