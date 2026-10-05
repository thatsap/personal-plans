# Brief: Lyrics desk

## We're gonna do

Turn the friend-chapbook writing desk into one studio that works in a phone browser and on a computer. When the writer starts a piece, they choose Poem or Lyrics. A poem is built by adding stanzas. Lyrics are built by adding Verse, Chorus, or Bridge, so sections are not faked with blank lines. On both kinds, the writer types a word and gets rhymes from an offline JavaScript dictionary, then inserts a rhyme into the line. The desk looks like a dim music stand: large section controls, a rhyme tray beside the writing on a wide screen and a bottom sheet on a phone. Saving stays on the existing Supabase account, so the same draft shows on another device after refresh. The public reading page still shows a published poem or lyric.

## Until this is done

- [ ] New piece asks Poem or Lyrics before the editor opens.
- [ ] Poem editor can add a stanza without requiring a blank line.
- [ ] Lyrics editor can add a Verse, a Chorus, and a Bridge as labeled sections.
- [ ] Typing a word shows rhyming words, and choosing one inserts it into the current line.
- [ ] A published poem and a published lyric both render on the public page, including on a phone-width layout.
- [ ] A piece saved in this browser is the piece the other browser loads for the same account (refresh). Existing published poems whose stanzas are a list of lines still open.
- [ ] Desk controls are usable at about 390px width and at desktop width: section actions and the rhyme list are reachable without horizontal scrolling.

## Out of scope

- A second app, recording, beats, melody, or an AI that writes the piece.
- Live two-cursor editing.
- Storing the rhyme list. Only the piece is saved.
- Replacing the public reading page with the studio chrome.
- Auth, env, Vercel, or a new Supabase project.

## Stop and confirm with the user if

- Existing published poems would have to change shape to keep displaying.
- The rhyme dictionary is too heavy for a phone, or it needs a paid API or a network account.
- The studio look has to replace the public reading page.
- A SQL migration or a breaking change to the saved poem payload is required.

## Crew

Architect → Implementer (3d-frontend-engineer) → QA. Sub-agents use Composer 2.5 Fast.
