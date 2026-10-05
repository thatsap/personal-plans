import { useEffect, useRef, useState } from "react";
import { LYRIC_PARTS, lyricHeading, lyricTitle, type LyricLabel } from "../../poems/parts.ts";
import type { PieceKind, Section } from "../../poems/types.ts";

type SectionEditorProps = {
  pieceKind: PieceKind;
  sections: Section[];
  focusIndex: number;
  focusToken: number;
  active: { sectionIndex: number; lineIndex: number } | null;
  onLineChange: (sectionIndex: number, lineIndex: number, value: string, caret: number) => void;
  onLineFocus: (sectionIndex: number, lineIndex: number) => void;
  onFocusSection: (sectionIndex: number) => void;
  onAddStanza: () => void;
  onAddLyric: (label: LyricLabel) => void;
  onAddLine: (sectionIndex: number, afterLine: number) => void;
  onRemoveLine: (sectionIndex: number, lineIndex: number) => void;
  onRemoveSection: (sectionIndex: number) => void;
  onDuplicate: () => void;
  onMove: (delta: -1 | 1) => void;
};

function blockName(section: Section, index: number, sections: Section[], kind: PieceKind): string {
  if (kind === "poem") {
    return sections.length > 1 ? `Stanza ${index + 1}` : "Stanza";
  }
  if (!("label" in section)) return "Section";
  const labels = sections.map((item) => ("label" in item ? item.label : ""));
  return lyricHeading(section.label, index, labels);
}

export function SectionEditor({
  pieceKind,
  sections,
  focusIndex,
  focusToken,
  active,
  onLineChange,
  onLineFocus,
  onFocusSection,
  onAddStanza,
  onAddLyric,
  onAddLine,
  onRemoveLine,
  onRemoveSection,
  onDuplicate,
  onMove,
}: SectionEditorProps) {
  const [palette, setPalette] = useState(false);
  const lineRef = useRef<HTMLTextAreaElement | null>(null);
  const safeIndex = Math.min(focusIndex, Math.max(sections.length - 1, 0));
  const section = sections[safeIndex];
  const part = section && "label" in section ? section.label : "stanza";

  useEffect(() => {
    if (focusToken === 0) return;
    const frame = window.requestAnimationFrame(() => {
      lineRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusToken]);

  return (
    <div className="stage-column">
      <div className="arrange" role="tablist" aria-label="Song arrangement">
        <div className="arrange-scroll">
          {sections.map((block, index) => {
            const name = blockName(block, index, sections, pieceKind);
            const role = "label" in block ? block.label : "stanza";
            return (
              <button
                key={`${role}-${index}`}
                type="button"
                role="tab"
                aria-selected={index === safeIndex}
                className={`clip${index === safeIndex ? " on" : ""}`}
                data-part={role}
                tabIndex={-1}
                onClick={() => {
                  setPalette(false);
                  onFocusSection(index);
                }}
              >
                <i />
                <span>{name}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className={`clip-add${palette ? " on" : ""}`}
          tabIndex={-1}
          aria-expanded={palette}
          onClick={() => {
            if (pieceKind === "poem") onAddStanza();
            else setPalette((open) => !open);
          }}
        >
          {pieceKind === "poem" ? "Stanza" : "Part"}
        </button>
        {palette && pieceKind === "lyrics" ? (
          <div className="palette" role="menu">
            {LYRIC_PARTS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className="palette-item"
                data-part={item.id}
                onClick={() => {
                  onAddLyric(item.id);
                  setPalette(false);
                }}
              >
                <i />
                <span>
                  <strong>{item.name}</strong>
                  <em>{item.hint}</em>
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {section ? (
        <article className="sheet" data-part={part}>
          <header className="sheet-bar">
            <p className="sheet-kicker">
              {pieceKind === "lyrics" && "label" in section ? lyricTitle(section.label) : "Poem"}
            </p>
            <h2>{blockName(section, safeIndex, sections, pieceKind)}</h2>
            <div className="sheet-tools">
              <button type="button" className="tool" tabIndex={-1} onClick={() => onMove(-1)} disabled={safeIndex === 0} aria-label="Move earlier">
                ←
              </button>
              <button
                type="button"
                className="tool"
                tabIndex={-1}
                onClick={() => onMove(1)}
                disabled={safeIndex >= sections.length - 1}
                aria-label="Move later"
              >
                →
              </button>
              <button type="button" className="tool" tabIndex={-1} onClick={onDuplicate}>
                Repeat
              </button>
              <button
                type="button"
                className="tool danger"
                tabIndex={-1}
                onClick={() => onRemoveSection(safeIndex)}
                disabled={sections.length <= 1}
              >
                Drop
              </button>
            </div>
          </header>
          <div className="sheet-lines">
            {section.lines.map((line, lineIndex) => {
              const isActive = active?.sectionIndex === safeIndex && active.lineIndex === lineIndex;
              return (
                <label key={lineIndex} className={`sheet-line${isActive ? " on" : ""}`}>
                  <span className="sheet-num">{lineIndex + 1}</span>
                  <textarea
                    ref={isActive ? lineRef : undefined}
                    rows={1}
                    value={line}
                    spellCheck
                    placeholder={lineIndex === 0 ? "Write the line. Enter adds another." : ""}
                    aria-label={`${blockName(section, safeIndex, sections, pieceKind)} line ${lineIndex + 1}`}
                    onChange={(event) =>
                      onLineChange(
                        safeIndex,
                        lineIndex,
                        event.target.value.replace(/\n/g, ""),
                        event.target.selectionStart ?? event.target.value.length,
                      )
                    }
                    onFocus={(event) => {
                      onLineFocus(safeIndex, lineIndex);
                      onLineChange(
                        safeIndex,
                        lineIndex,
                        event.target.value,
                        event.target.selectionStart ?? event.target.value.length,
                      );
                    }}
                    onSelect={(event) => {
                      const el = event.currentTarget;
                      onLineChange(safeIndex, lineIndex, el.value, el.selectionStart ?? el.value.length);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") {
                        if (event.key === "Backspace" && line.length === 0) {
                          event.preventDefault();
                          onRemoveLine(safeIndex, lineIndex);
                        }
                        return;
                      }
                      event.preventDefault();
                      event.stopPropagation();
                      onAddLine(safeIndex, lineIndex);
                    }}
                  />
                </label>
              );
            })}
          </div>
          <p className="sheet-hint">Enter makes the next line. The rest of the song stays on the strip.</p>
        </article>
      ) : null}
    </div>
  );
}
