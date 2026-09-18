import { andIHadEnough } from "./and-i-had-enough.ts";
import type { Poem } from "./types.ts";

export type { Poem } from "./types.ts";

/**
 * Add a new poem:
 * 1. Create src/poems/your-slug.ts with a Poem object
 * 2. Import it here and push it onto this list
 */
export const poems: Poem[] = [andIHadEnough];

export function getPoem(slug: string): Poem | undefined {
  return poems.find((p) => p.slug === slug);
}

export function neighbors(slug: string): { prev?: Poem; next?: Poem } {
  const i = poems.findIndex((p) => p.slug === slug);
  if (i < 0) return {};
  return { prev: poems[i - 1], next: poems[i + 1] };
}
