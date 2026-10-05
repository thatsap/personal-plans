export const LYRIC_PARTS = [
  { id: "intro", name: "Intro", hint: "Open the room" },
  { id: "verse", name: "Verse", hint: "Tell the story" },
  { id: "prechorus", name: "Pre-chorus", hint: "Lift into it" },
  { id: "chorus", name: "Chorus", hint: "The part they sing" },
  { id: "postchorus", name: "Post-chorus", hint: "Let it ring" },
  { id: "hook", name: "Hook", hint: "The chant" },
  { id: "bridge", name: "Bridge", hint: "Turn the song" },
  { id: "breakdown", name: "Breakdown", hint: "Strip it back" },
  { id: "outro", name: "Outro", hint: "Walk out" },
] as const;

export type LyricLabel = (typeof LYRIC_PARTS)[number]["id"];

const LABEL_SET = new Set<string>(LYRIC_PARTS.map((part) => part.id));

export function isLyricLabel(value: string): value is LyricLabel {
  return LABEL_SET.has(value);
}

export function lyricPart(label: string) {
  return LYRIC_PARTS.find((part) => part.id === label);
}

export function lyricTitle(label: string): string {
  return lyricPart(label)?.name ?? label.charAt(0).toUpperCase() + label.slice(1);
}

export function lyricHeading(
  label: string,
  index: number,
  labels: string[],
): string {
  const name = lyricTitle(label);
  const total = labels.filter((item) => item === label).length;
  if (total < 2) return name;
  const number = labels.slice(0, index + 1).filter((item) => item === label).length;
  return `${name} ${number}`;
}
