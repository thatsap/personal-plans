export type HeadlineId =
  | "physical"
  | "philosophy"
  | "career"
  | "metacognition"
  | "hobby";

export type Status = "live" | "covered" | "parked";

export type Mood =
  | "restless"
  | "composed"
  | "grieving"
  | "ambitious"
  | "curious"
  | "cold"
  | "tender"
  | "overloaded";

export type Intent =
  | "biases"
  | "people"
  | "duty"
  | "becoming"
  | "systems"
  | "graphics"
  | "manufacturing"
  | "body"
  | "music"
  | "writing"
  | "judgment"
  | "attention"
  | "chess"
  | "leadership";

export type Depth = "primer" | "working" | "master";
export type Pace = "night" | "weekend" | "campaign";

export type Goal = {
  id: string;
  title: string;
  description: string;
  live?: boolean;
};

export type Topic = {
  id: string;
  title: string;
  briefing: string;
  research: string[];
  bookIds: string[];
  goals: Goal[];
};

export type SubPart = {
  id: string;
  title: string;
  briefing: string;
  topics: Topic[];
};

export type Headline = {
  id: HeadlineId;
  title: string;
  kicker: string;
  briefing: string;
  status: Status;
  parts: SubPart[];
};

export type Book = {
  id: string;
  title: string;
  author: string;
  why: string;
  moods: Mood[];
  intents: Intent[];
  depth: Depth;
  pace: Pace;
  headline?: HeadlineId;
  current?: boolean;
};
