export type LabBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "callout"; kicker?: string; text: string }
  | { type: "pair"; do: string; dont: string };

export type LabSection = {
  id: string;
  title: string;
  blocks: LabBlock[];
};

export type LabArticle = {
  slug: string;
  title: string;
  kicker: string;
  blurb: string;
  stamp: string;
  sections: LabSection[];
};
