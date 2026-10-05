/** ARPAbet tail from the last stressed vowel (perfect-rhyme key). */
export function rhymeKeyFromPhonemes(phonemes: string[]): string | null {
  let stressIndex = -1;
  for (let i = 0; i < phonemes.length; i++) {
    if (/[012]$/.test(phonemes[i])) stressIndex = i;
  }
  if (stressIndex === -1) return null;
  return phonemes
    .slice(stressIndex)
    .map((phone) => phone.replace(/[012]$/, ""))
    .join("-");
}

export function normalizeLookupWord(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z']/g, "");
}

/** Last word token at or before caret (letters and apostrophe). */
export function targetWordAtCaret(lineText: string, caret: number): { word: string; start: number; end: number } | null {
  const clamped = Math.max(0, Math.min(caret, lineText.length));
  const before = lineText.slice(0, clamped);
  const match = /(?:^|[^a-zA-Z'])([a-zA-Z']+)$/.exec(before);
  if (!match || !match[1]) return null;
  const word = match[1];
  const end = before.length;
  const start = end - word.length;
  return { word, start, end };
}

export function replaceWordInLine(lineText: string, start: number, end: number, replacement: string): string {
  return lineText.slice(0, start) + replacement + lineText.slice(end);
}
