import type { LyricLabel } from "./parts.ts";

export type { LyricLabel } from "./parts.ts";

export type PoemStatus = "draft" | "published";

export type PieceKind = "poem" | "lyrics";

export type PoemSection = { kind: "stanza"; lines: string[] };
export type LyricSection = { label: LyricLabel; lines: string[] };
export type Section = PoemSection | LyricSection;

export type Poem = {
  id: string;
  slug: string;
  title: string;
  written: string;
  excerpt: string;
  stanzas: unknown[];
  pieceKind: PieceKind;
  sections: Section[];
  status: PoemStatus;
  createdAt: string;
  updatedAt: string;
};

export type PoemInput = {
  slug: string;
  title: string;
  written: string;
  excerpt: string;
  stanzas: unknown[];
  status: PoemStatus;
};
