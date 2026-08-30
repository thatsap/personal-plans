export const SPORTS = [
  "badminton",
  "table_tennis",
  "tennis",
  "running",
  "walking",
  "cycling",
  "swimming",
  "football",
  "cricket",
  "basketball",
  "other",
] as const;

export type Sport = (typeof SPORTS)[number];

export type SportRow = {
  id: string;
  user_id: string;
  started_at: string;
  sport: Sport;
  minutes: number;
  hr_avg: number | null;
  peak_hr: number | null;
  notes: string;
  created_at: string;
};

export function sportLabel(s: string) {
  return s.replace(/_/g, " ");
}
