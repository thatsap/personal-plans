import type { PoemInput, PoemStatus } from "../poems/types.ts";

export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function isSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function bodyToStanzas(body: string): string[][] {
  const normalized = body.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];
  return normalized
    .split(/\n[ \t]*\n/)
    .map((block) =>
      block
        .split("\n")
        .map((line) => line.replace(/\s+$/g, ""))
        .filter((line) => line.trim().length > 0),
    )
    .filter((stanza) => stanza.length > 0);
}

export function stanzasToBody(stanzas: string[][]): string {
  return stanzas.map((stanza) => stanza.join("\n")).join("\n\n");
}

export function excerptFromStanzas(stanzas: string[][]): string {
  const text = stanzas
    .flat()
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
  if (text.length <= 180) return text;
  return `${text.slice(0, 177).trimEnd()}…`;
}

export function preparePoem(input: {
  title: string;
  slug: string;
  written: string;
  excerpt: string;
  body: string;
  status: PoemStatus;
}): { value: PoemInput } | { error: string } {
  if (input.body.length > 20000) {
    return { error: "That poem is too long for this desk." };
  }

  const title = input.title.trim();
  const slug = input.slug.trim();
  const written = input.written.trim();
  const stanzas = bodyToStanzas(input.body);
  const excerpt = input.excerpt.trim() || excerptFromStanzas(stanzas);

  if (!title) return { error: "Add a title." };
  if (title.length > 200) return { error: "Keep the title under 200 characters." };
  if (!isSlug(slug)) {
    return {
      error: "The link needs lowercase letters, numbers, and hyphens. For example: evening-walk.",
    };
  }
  if (written.length > 80) return { error: "Keep the date line under 80 characters." };
  if (excerpt.length > 500) return { error: "Keep the excerpt under 500 characters." };

  const lines = stanzas.reduce((count, stanza) => count + stanza.length, 0);
  if (input.status === "published" && lines === 0) {
    return { error: "Add at least one line before publishing." };
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
