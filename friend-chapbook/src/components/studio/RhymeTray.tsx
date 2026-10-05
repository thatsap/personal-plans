type RhymeTrayProps = {
  word: string | null;
  rhymes: string[];
  loading: boolean;
  onPick: (rhyme: string) => void;
};

export function RhymeTray({ word, rhymes, loading, onPick }: RhymeTrayProps) {
  return (
    <aside className="rhyme-well" aria-label="Rhymes">
      <p className="rhyme-kicker">{word ? word : "Rhyme"}</p>
      {!word ? (
        <p className="rhyme-empty">Put the cursor in a word.</p>
      ) : loading ? (
        <p className="rhyme-empty">Listening for {word}…</p>
      ) : rhymes.length === 0 ? (
        <p className="rhyme-empty">Nothing in the book for {word}.</p>
      ) : (
        <ul className="rhyme-list">
          {rhymes.map((rhyme) => (
            <li key={rhyme}>
              <button type="button" className="rhyme-chip" onClick={() => onPick(rhyme)}>
                {rhyme}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
