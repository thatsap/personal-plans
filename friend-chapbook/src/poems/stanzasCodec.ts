import { isLyricLabel } from "./parts.ts";
import type { LyricLabel, PieceKind, PoemSection, Section, LyricSection } from "./types.ts";

type WireLyric = { label: LyricLabel; lines: string[] };

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isWireLyric(value: unknown): value is WireLyric {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  const label = row.label;
  if (typeof label !== "string" || !isLyricLabel(label)) return false;
  return isStringArray(row.lines);
}

function cleanLines(lines: string[]): string[] {
  return lines.map((line) => line.replace(/\s+$/g, ""));
}

export function deriveKind(wire: unknown[]): PieceKind {
  for (const element of wire) {
    if (isWireLyric(element)) return "lyrics";
  }
  return "poem";
}

export function parseSections(wire: unknown): Section[] {
  if (!Array.isArray(wire)) return [];
  const kind = deriveKind(wire);
  if (kind === "lyrics") {
    return wire
      .filter(isWireLyric)
      .map(
        (block): LyricSection => ({
          label: block.label,
          lines: cleanLines(block.lines),
        }),
      );
  }
  return wire
    .filter(isStringArray)
    .map(
      (stanza): PoemSection => ({
        kind: "stanza",
        lines: cleanLines(stanza),
      }),
    );
}

export function serializeSections(sections: Section[], pieceKind: PieceKind): unknown[] {
  if (pieceKind === "lyrics") {
    return sections
      .filter((section): section is LyricSection => "label" in section)
      .map((section) => ({
        label: section.label,
        lines: section.lines.map((line) => line.replace(/\s+$/g, "")),
      }));
  }
  return sections
    .filter((section): section is PoemSection => "kind" in section && section.kind === "stanza")
    .map((section) =>
      section.lines
        .map((line) => line.replace(/\s+$/g, ""))
        .filter((line) => line.trim().length > 0),
    )
    .filter((stanza) => stanza.length > 0);
}

export function excerptFromSections(sections: Section[]): string {
  const text = sections
    .flatMap((section) => section.lines)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
  if (text.length <= 180) return text;
  return `${text.slice(0, 177).trimEnd()}…`;
}

export function lineCount(sections: Section[]): number {
  return sections.reduce((count, section) => count + section.lines.length, 0);
}

export function emptyPoemSections(): PoemSection[] {
  return [{ kind: "stanza", lines: [""] }];
}

export function emptyLyricSections(): LyricSection[] {
  return [{ label: "verse", lines: [""] }];
}

export function sectionsForNewKind(kind: PieceKind): Section[] {
  return kind === "lyrics" ? emptyLyricSections() : emptyPoemSections();
}
