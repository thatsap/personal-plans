import { useCallback, useEffect, useRef, useState } from "react";
import { rhymesForLine } from "../lib/rhyme/lookup.ts";

export type ActiveLine = { sectionIndex: number; lineIndex: number } | null;

export function useRhymeLookup(active: ActiveLine, lineText: string, caret: number) {
  const [word, setWord] = useState<string | null>(null);
  const [rhymes, setRhymes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const refresh = useCallback(async (text: string, pos: number) => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const result = await rhymesForLine(text, pos);
      if (id !== requestId.current) return;
      if (!result) {
        setWord(null);
        setRhymes([]);
        return;
      }
      setWord(result.word);
      setRhymes(result.rhymes);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!active) {
      setWord(null);
      setRhymes([]);
      return;
    }
    void refresh(lineText, caret);
  }, [active, lineText, caret, refresh]);

  return { word, rhymes, loading, refresh };
}
