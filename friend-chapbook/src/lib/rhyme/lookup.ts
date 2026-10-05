import { normalizeLookupWord, rhymeKeyFromPhonemes, targetWordAtCaret } from "./rhymeKey.ts";

const RHYME_CAP = 20;

type PhonemeData = Record<string, string>;

let indexPromise: Promise<{ data: PhonemeData; byKey: Map<string, string[]> }> | null = null;

async function loadRhymeBundle(): Promise<{ data: PhonemeData; byKey: Map<string, string[]> }> {
  const mod = await import("./data/phonemes.json");
  const data = mod.default as PhonemeData;
  const byKey = new Map<string, string[]>();
  for (const [word, phonesRaw] of Object.entries(data)) {
    const key = rhymeKeyFromPhonemes(phonesRaw.split(" "));
    if (!key) continue;
    const bucket = byKey.get(key);
    if (bucket) bucket.push(word);
    else byKey.set(key, [word]);
  }
  for (const bucket of byKey.values()) {
    bucket.sort((a, b) => a.localeCompare(b));
  }
  return { data, byKey };
}

function getBundle(): Promise<{ data: PhonemeData; byKey: Map<string, string[]> }> {
  if (!indexPromise) indexPromise = loadRhymeBundle();
  return indexPromise;
}

export async function rhymesForLine(
  lineText: string,
  caret: number,
): Promise<{ word: string; rhymes: string[] } | null> {
  const target = targetWordAtCaret(lineText, caret);
  if (!target) return null;
  const normalized = normalizeLookupWord(target.word);
  if (!normalized) return null;

  const { data, byKey } = await getBundle();
  const phonesRaw = data[normalized];
  if (!phonesRaw) return { word: target.word, rhymes: [] };

  const key = rhymeKeyFromPhonemes(phonesRaw.split(" "));
  if (!key) return { word: target.word, rhymes: [] };

  const candidates = byKey.get(key) ?? [];
  const rhymes = candidates.filter((w) => w !== normalized).slice(0, RHYME_CAP);
  return { word: target.word, rhymes };
}

export { replaceWordInLine, targetWordAtCaret } from "./rhymeKey.ts";
