# Design: Lyrics desk (studio editor + offline rhymes)

## Approach

Extend the existing friend-chapbook desk and reader **without** SQL migrations, auth/env changes, or new backend work. Persistence stays `public.poems.stanzas` (jsonb **array**); the app adds a **codec** that reads legacy poem rows (`string[][]` elements) and writes new lyric rows (labeled section objects) in the same column.

**Piece kind (Poem vs Lyrics)**

- **Poem (legacy + new):** each top-level `stanzas` element is a JSON array of strings (one stanza). Existing published poems are unchanged on disk.
- **Lyrics (new):** each top-level element is a JSON object `{ "label": "verse" | "chorus" | "bridge", "lines": string[] }`.
- **Kind in the app** is **derived on read** in domain code: if every element is a string array → `poem`; if any element is a labeled section object → `lyrics`. No new DB column.

**Editor UX (BRIEF KPIs)**

- **New piece:** desk flow asks Poem or Lyrics, then opens the studio editor (hash routes below).
- **Poem studio:** structured sections (add stanza control); lines edited per stanza—not “blank line = stanza” as the only model (keep optional import from plain text via existing `bodyToStanzas` for migration/paste only if implementer chooses; not required for KPI).
- **Lyrics studio:** add Verse / Chorus / Bridge as labeled blocks; no faking sections with blank lines.
- **Rhyme tray:** on word focus or selection in the active line, domain extracts the **last word** (letters/apostrophe), looks up **perfect rhymes offline**, UI shows list; pick inserts/replaces that word in the line. Rhyme data is **not** saved.
- **Layout:** dim “music stand” chrome on desk routes only; rhyme tray **aside** at `min-width` breakpoint (~768px), **bottom sheet** below that; no horizontal scroll for primary controls at ~390px.
- **Reader:** `PoemPage` renders poems as today; lyrics render section labels + lines inside existing reader chrome (not studio chrome).

**Rhyme data (offline, phone-safe)**

- Do **not** add the full `cmu-pronouncing-dictionary` npm package (~4.7MB unpacked)—too heavy for first load on a phone.
- **Allowed:** one **vendored, trimmed** phoneme index committed under `friend-chapbook/src/lib/rhyme/data/` (e.g. `phonemes.json`, target **≤ ~300KB** raw, **lazy `import()`** on first rhyme lookup so the reader/home bundle stays small). Source: CMUdict (public domain) reduced to common headwords at build/commit time; document generation in a one-line comment in data README inside allowlist folder only if needed.
- **Domain:** pure functions in `src/lib/rhyme/` (normalize word → rhyme key → lookup → ranked candidates). No network, no paid API.

**Escalation check:** KPIs are met with **codec-only** jsonb evolution and **no** row rewrites. **Do not escalate** for schema. If implementer cannot keep the trimmed dictionary under ~300KB or rhyme quality is unusable, **stop and escalate** per BRIEF (dictionary weight).

---

## Layers (table: Change | Layer | Path)

| Change | Layer | Path |
|--------|--------|------|
| Locked | Brief | `docs/briefs/lyrics-desk/BRIEF.md` |
| Locked | Design | `docs/briefs/lyrics-desk/DESIGN.md` (this file) |
| Extend | Domain types | `friend-chapbook/src/poems/types.ts` |
| New | Stanza codec (parse/serialize/kind/excerpt) | `friend-chapbook/src/poems/stanzasCodec.ts` |
| Extend | Poem I/O (use codec; same columns) | `friend-chapbook/src/lib/poems.ts` |
| Extend | Slug/excerpt helpers | `friend-chapbook/src/lib/body.ts` (poem-only helpers stay; piece prep moves to codec or `piecePrepare.ts`) |
| New | Piece prepare (title/slug/status + sections → `PoemInput`) | `friend-chapbook/src/lib/piecePrepare.ts` |
| New | Rhyme domain + lazy data | `friend-chapbook/src/lib/rhyme/*.ts`, `friend-chapbook/src/lib/rhyme/data/*` |
| New | Editor state / rhyme wiring | `friend-chapbook/src/hooks/usePieceEditor.ts`, `friend-chapbook/src/hooks/useRhymeLookup.ts` |
| New | Studio UI (presentational) | `friend-chapbook/src/components/studio/*.tsx` |
| Extend | Desk list + new-piece chooser | `friend-chapbook/src/pages/Write.tsx` |
| Refactor | Studio shell (thin page) | `friend-chapbook/src/pages/Editor.tsx` |
| Extend | Public reader (lyric labels) | `friend-chapbook/src/pages/PoemPage.tsx` |
| Extend | Hash routes for new kind | `friend-chapbook/src/lib/route.ts`, `friend-chapbook/src/App.tsx` |
| Extend | Studio + tray layout | `friend-chapbook/src/index.css` |

**Layer rule:** section add/remove, stanza/line edits, jsonb serialization, rhyme keying, and excerpt-from-sections live in **domain/codec/hooks**—not in page components.

---

## Contract

### Database wire (unchanged)

| Column | Use |
|--------|-----|
| `id, slug, title, written, excerpt, stanzas, status, created_at, updated_at` | Same as today |

`stanzas` **on the wire** remains a JSON **array**. Elements:

| Element shape | Meaning |
|---------------|---------|
| `string[]` | Poem stanza (legacy and new poems) |
| `{ "label": "verse" \| "chorus" \| "bridge", "lines": string[] }` | Lyrics section |

Constraints already satisfied: root is array; published length > 0 when at least one section/stanza exists with lines (client validates before publish; same as today).

### App model (after codec)

```ts
type PieceKind = "poem" | "lyrics";

type PoemSection = { kind: "stanza"; lines: string[] };
type LyricSection = { label: "verse" | "chorus" | "bridge"; lines: string[] };

type Piece = Poem & {
  pieceKind: PieceKind;
  sections: (PoemSection | LyricSection)[];
};
```

`Poem` / list APIs may expose `pieceKind` + `sections` while still accepting legacy `stanzas: string[][]` on old code paths internally mapped through codec.

### Save path

- `savePoem(id, input)` still sends `{ slug, title, written, excerpt, stanzas, status }`.
- `input.stanzas` is **`serializeSections(sections, pieceKind)`** → `unknown[]` (string arrays and/or label objects).
- **Never** rewrite existing published poem rows; new saves for lyrics use object elements only.

### Routes

| Hash | Behavior |
|------|----------|
| `#/write` | Desk list |
| `#/write/new/poem` | New poem studio (`editor` id `new`, kind poem) |
| `#/write/new/lyrics` | New lyrics studio (`editor` id `new`, kind lyrics) |
| `#/write/new` | Redirect or chooser (pick poem/lyrics)—must not open editor without choice |
| `#/write/:uuid` | Edit existing; kind from codec |
| `#/p/:slug` | Reader (poem or lyric) |

Extend `Route` with optional `draftKind?: PieceKind` when `name === "editor" && id === "new"`.

### Rhyme contract

- Input: `{ lineText: string, caret: number }` → domain finds **target word** at/ before caret.
- Output: `{ word: string, rhymes: string[] }` capped (e.g. 20), exclude identical word.
- Insert: replace target word span in line with chosen rhyme; preserve surrounding punctuation/spaces via domain helper.
- Load dictionary: **single** dynamic import; cache module singleton in rhyme service.

### Studio UI contract

- Active line tracked per section index + line index.
- Section actions: poem → “Add stanza”; lyrics → “Add verse” / “Add chorus” / “Add bridge”.
- Rhyme tray: visible when a word is available; dismissible on mobile sheet.
- Metadata fields (title, written, excerpt, slug, status) same semantics as `Editor.tsx` today.

---

## Allowlist (implementer may edit/create)

- `friend-chapbook/src/poems/types.ts`
- `friend-chapbook/src/poems/stanzasCodec.ts`
- `friend-chapbook/src/lib/poems.ts`
- `friend-chapbook/src/lib/body.ts`
- `friend-chapbook/src/lib/piecePrepare.ts`
- `friend-chapbook/src/lib/rhyme/**`
- `friend-chapbook/src/hooks/usePieceEditor.ts`
- `friend-chapbook/src/hooks/useRhymeLookup.ts`
- `friend-chapbook/src/components/studio/**`
- `friend-chapbook/src/pages/Editor.tsx`
- `friend-chapbook/src/pages/Write.tsx`
- `friend-chapbook/src/pages/PoemPage.tsx`
- `friend-chapbook/src/lib/route.ts`
- `friend-chapbook/src/App.tsx`
- `friend-chapbook/src/index.css`
- `friend-chapbook/package.json` / `package-lock.json` **only** if no new runtime dependency is added (vendored JSON preferred). If a tiny rhyme helper package is added instead of vendored data, **stop and escalate**—default is vendored data only.

**Do not edit:** `supabase/schema.sql`, auth, env, Vercel config, `Gate.tsx`, `Home.tsx` except if QA requires a label tweak (prefer not).

---

## Forbidden

- SQL migrations, new tables/columns, RLS/auth changes, env/secrets, CI/deploy changes.
- Replacing public reader chrome with studio chrome.
- Storing rhyme lists or dictionary state in Supabase.
- Moving stanza/kind/rhyme logic into `Editor.tsx` / `PoemPage.tsx` (render + event wiring only).
- New state library, UI kit, or **full** CMU dictionary npm package.
- Second app, recording, beats, AI generation, live co-editing.
- Rewriting legacy published `string[][]` rows on load or save.
- Network rhyme APIs or paid services.

---

## Risks / stop-lines

| Risk | Stop-line |
|------|-----------|
| Schema change temptation | Adding `kind` column or non-array `stanzas` → **escalate**; use codec only. |
| Legacy poems break | Any published poem fails to open/read → **block release**; codec must treat all-string-array elements as poem stanzas. |
| Dictionary weight | Initial rhyme chunk or vendored JSON **> ~300KB** gzip or noticeable 3G stall → trim further or **escalate**. |
| Rhyme quality | Only perfect rhymes from phoneme index; near-rhymes optional later—do not block KPI on slant rhymes. |
| Route regression | `#/write/:id` UUID edit and `#/p/:slug` unchanged for existing links. |
| Publish validation | Empty lyrics/poem cannot publish; match existing `preparePoem` line-count rule via `piecePrepare`. |
| Horizontal scroll | Section bar + rhyme tray must fit ~390px (stack/wrap/sheet)—QA fail if primary actions scroll horizontally. |
| Dependency creep | Adding large npm dict packages → **escalate**; use vendored subset. |

---

## QA hooks

Manual + build checks (friend-chapbook):

| Hook | Pass |
|------|------|
| New piece chooser | `#/write/new` does not open editor until Poem or Lyrics chosen; both routes open studio. |
| Legacy poem | Open/edit/publish an existing row whose `stanzas` is only `string[][]`; reader unchanged visually (no section labels). |
| Poem stanza control | Add stanza without relying on blank-line-only input; save → reload → same structure. |
| Lyrics sections | Add verse/chorus/bridge; save → reload → labels intact; reader shows labels. |
| Cross-device | Same account: save draft on one browser, refresh on another → identical sections. |
| Rhyme offline | Airplane mode / DevTools offline: typing a common word shows rhymes; pick inserts into line; save does not store rhyme list. |
| Rhyme lazy load | First paint of home/reader does not download phoneme JSON; first rhyme use loads once. |
| Mobile layout | ~390px: section actions + rhyme sheet usable without horizontal scroll. |
| Desktop layout | Wide: rhyme tray beside writing area. |
| Build | `npm run build` and `npm run lint` pass. |
| Scope | No schema/auth/env changes in diff. |

---

## Reference (existing patterns)

- I/O and row mapping: `friend-chapbook/src/lib/poems.ts` (`columns`, `rowToPoem`, `savePoem`).
- Text ↔ stanza parsing (poem-only legacy): `friend-chapbook/src/lib/body.ts` (`bodyToStanzas`, `preparePoem`).
- Editor form state + save: `friend-chapbook/src/pages/Editor.tsx`.
- Reader stanza loop: `friend-chapbook/src/pages/PoemPage.tsx` (`.verse` / `.stanza`).
