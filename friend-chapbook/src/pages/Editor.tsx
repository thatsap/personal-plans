import { SectionEditor } from "../components/studio/SectionEditor.tsx";
import { StudioLayout } from "../components/studio/StudioLayout.tsx";
import { StudioMetadata } from "../components/studio/StudioMetadata.tsx";
import { usePieceEditor } from "../hooks/usePieceEditor.ts";
import { useRhymeLookup } from "../hooks/useRhymeLookup.ts";
import { go } from "../lib/route.ts";
import type { PieceKind } from "../poems/types.ts";
import { RequireWriter } from "./Gate.tsx";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function NewChooser() {
  return (
    <section className="home">
      <header className="masthead">
        <div className="mast-row">
          <div>
            <p className="kicker">New piece</p>
            <h1>What are you writing?</h1>
          </div>
          <button type="button" onClick={() => go("/write")}>
            Desk
          </button>
        </div>
        <p className="lede">Pick a shape for this draft. You can save and read it on any device.</p>
      </header>
      <div className="chooser">
        <button type="button" className="channel chooser-key" onClick={() => go("/write/new/poem")}>
          <span className="num">01</span>
          <span className="channel-copy">
            <strong>Poem</strong>
            <span>Stanzas of lines</span>
          </span>
          <span className="keycap">Open</span>
        </button>
        <button type="button" className="channel chooser-key" onClick={() => go("/write/new/lyrics")}>
          <span className="num">02</span>
          <span className="channel-copy">
            <strong>Lyrics</strong>
            <span>Verse, chorus, bridge, and the rest of the map</span>
          </span>
          <span className="keycap">Open</span>
        </button>
      </div>
    </section>
  );
}

function EditorStudio({ id, draftKind }: { id: string; draftKind?: PieceKind }) {
  const isNew = id === "new";
  const invalidId = !isNew && !UUID.test(id);

  if (isNew && !draftKind) {
    return <NewChooser />;
  }

  if (invalidId) {
    return (
      <section className="home">
        <header className="masthead">
          <button type="button" onClick={() => go("/write")}>
            Desk
          </button>
          <h1>Not on the desk</h1>
          <p className="lede">That draft is gone, or the link is wrong.</p>
        </header>
      </section>
    );
  }

  return <EditorLoaded id={id} draftKind={draftKind ?? "poem"} />;
}

function EditorLoaded({ id, draftKind }: { id: string; draftKind: PieceKind }) {
  const editor = usePieceEditor(id, draftKind);
  const rhyme = useRhymeLookup(editor.active, editor.activeLineText, editor.activeCaret);

  if (editor.missing) {
    return (
      <section className="home">
        <header className="masthead">
          <button type="button" onClick={() => go("/write")}>
            Desk
          </button>
          <h1>Not on the desk</h1>
          <p className="lede">That draft is gone, or the link is wrong.</p>
        </header>
      </section>
    );
  }

  if (editor.loading) {
    return (
      <section className="home">
        <p className="lede">Opening the desk…</p>
      </section>
    );
  }

  const pieceLabel = editor.pieceKind === "lyrics" ? "Lyrics" : "Poem";

  return (
    <StudioLayout
      title={editor.title}
      isNew={editor.isNew}
      slug={editor.slug}
      pieceLabel={pieceLabel}
      rhymeWord={rhyme.word}
      rhymes={rhyme.rhymes}
      rhymeLoading={rhyme.loading}
      onTitle={editor.onTitle}
      onRhymePick={editor.insertRhyme}
      error={editor.error}
      notice={editor.notice}
      pending={editor.pending}
      status={editor.status}
      onStatus={editor.setStatus}
      onSave={() => void editor.onSave()}
      onDelete={() => void editor.onDelete()}
      meta={
        <StudioMetadata
          written={editor.written}
          excerpt={editor.excerpt}
          slug={editor.slug}
          onWritten={editor.setWritten}
          onExcerpt={editor.setExcerpt}
          onSlug={editor.setSlug}
          onSlugTouched={() => editor.setSlugTouched(true)}
        />
      }
    >
      <SectionEditor
        pieceKind={editor.pieceKind}
        sections={editor.sections}
        focusIndex={editor.focusIndex}
        focusToken={editor.focusToken}
        active={editor.active}
        onLineChange={editor.updateLine}
        onLineFocus={(sectionIndex, lineIndex) => editor.setActive({ sectionIndex, lineIndex })}
        onFocusSection={(sectionIndex) => editor.focusSection(sectionIndex, 0)}
        onAddStanza={editor.addPoemStanza}
        onAddLyric={editor.addLyricSection}
        onAddLine={editor.addLine}
        onRemoveLine={editor.removeLine}
        onRemoveSection={editor.removeSection}
        onDuplicate={editor.duplicateSection}
        onMove={editor.moveSection}
      />
    </StudioLayout>
  );
}

export default function Editor({ id, draftKind }: { id: string; draftKind?: PieceKind }) {
  return (
    <RequireWriter>
      <EditorStudio id={id} draftKind={draftKind} />
    </RequireWriter>
  );
}
