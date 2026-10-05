import { isSlug, slugify } from "./body.ts";
import {
  excerptFromSections,
  lineCount,
  serializeSections,
} from "../poems/stanzasCodec.ts";
import type { PieceKind, PoemInput, PoemStatus, Section } from "../poems/types.ts";

export function preparePiece(input: {
  title: string;
  slug: string;
  written: string;
  excerpt: string;
  sections: Section[];
  pieceKind: PieceKind;
  status: PoemStatus;
}): { value: PoemInput } | { error: string } {
  const title = input.title.trim();
  const slug = input.slug.trim();
  const written = input.written.trim();
  const excerpt = input.excerpt.trim() || excerptFromSections(input.sections);

  if (!title) return { error: "Add a title." };
  if (title.length > 200) return { error: "Keep the title under 200 characters." };
  if (!isSlug(slug)) {
    return {
      error: "The link needs lowercase letters, numbers, and hyphens. For example: evening-walk.",
    };
  }
  if (written.length > 80) return { error: "Keep the date line under 80 characters." };
  if (excerpt.length > 500) return { error: "Keep the excerpt under 500 characters." };

  const lines = lineCount(input.sections);
  if (input.status === "published" && lines === 0) {
    return { error: "Add at least one line before publishing." };
  }

  const stanzas = serializeSections(input.sections, input.pieceKind);
  const bodyChars = input.sections
    .flatMap((section) => section.lines)
    .join("\n").length;
  if (bodyChars > 20000) {
    return { error: "That piece is too long for this desk." };
  }

  return {
    value: {
      title,
      slug,
      written,
      excerpt,
      stanzas,
      status: input.status,
    },
  };
}

export { slugify };
