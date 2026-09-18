import { TO_TWELVE } from "./toTwelve";
import type { LabArticle } from "./types";

export type { LabArticle, LabBlock, LabSection } from "./types";

export const ARTICLES: LabArticle[] = [TO_TWELVE];

export function getArticle(slug: string): LabArticle | null {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}
