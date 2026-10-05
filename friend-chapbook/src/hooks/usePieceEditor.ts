import { useCallback, useEffect, useMemo, useState } from "react";
import { preparePiece, slugify } from "../lib/piecePrepare.ts";
import { deletePoem, getById, savePoem } from "../lib/poems.ts";
import { go } from "../lib/route.ts";
import { replaceWordInLine, targetWordAtCaret } from "../lib/rhyme/lookup.ts";
import { emptyPoemSections, sectionsForNewKind } from "../poems/stanzasCodec.ts";
import type { LyricLabel, PieceKind, PoemStatus, Section } from "../poems/types.ts";

export type ActiveLine = { sectionIndex: number; lineIndex: number };

function cloneSections(sections: Section[]): Section[] {
  return sections.map((section) =>
    "label" in section
      ? { label: section.label, lines: [...section.lines] }
      : { kind: "stanza" as const, lines: [...section.lines] },
  );
}

export function usePieceEditor(id: string, draftKind: PieceKind | undefined) {
  const isNew = id === "new";
  const [loading, setLoading] = useState(!isNew);
  const [missing, setMissing] = useState(false);
  const [pieceKind, setPieceKind] = useState<PieceKind>(draftKind ?? "poem");
  const [sections, setSections] = useState<Section[]>(() =>
    isNew ? sectionsForNewKind(draftKind ?? "poem") : emptyPoemSections(),
  );
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [written, setWritten] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<PoemStatus>("draft");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<"save" | "delete" | null>(null);
  const [active, setActive] = useState<ActiveLine | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [focusToken, setFocusToken] = useState(0);
  const [carets, setCarets] = useState<Record<string, number>>({});
  const [sheetOpen, setSheetOpen] = useState(false);

  const caretKey = (sectionIndex: number, lineIndex: number) => `${sectionIndex}:${lineIndex}`;

  const load = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    try {
      const poem = await getById(id);
      if (!poem) {
        setMissing(true);
        return;
      }
      setTitle(poem.title);
      setSlug(poem.slug);
      setSlugTouched(true);
      setWritten(poem.written);
      setExcerpt(poem.excerpt);
      setPieceKind(poem.pieceKind);
      setSections(cloneSections(poem.sections.length ? poem.sections : emptyPoemSections()));
      setStatus(poem.status);
      setFocusIndex(0);
      setActive({ sectionIndex: 0, lineIndex: 0 });
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "This piece did not open.");
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    if (isNew) return;
    void load();
  }, [isNew, load]);

  const onTitle = useCallback(
    (value: string) => {
      setTitle(value);
      if (!slugTouched) setSlug(slugify(value));
    },
    [slugTouched],
  );

  const updateLine = useCallback(
    (sectionIndex: number, lineIndex: number, value: string, caret: number) => {
      setSections((prev) => {
        const next = cloneSections(prev);
        const section = next[sectionIndex];
        if (!section) return prev;
        section.lines[lineIndex] = value;
        return next;
      });
      setCarets((prev) => ({ ...prev, [caretKey(sectionIndex, lineIndex)]: caret }));
      setActive({ sectionIndex, lineIndex });
      setSheetOpen(true);
    },
    [],
  );

  const focusSection = useCallback((sectionIndex: number, lineIndex = 0) => {
    setFocusIndex(sectionIndex);
    setActive({ sectionIndex, lineIndex });
    setFocusToken((token) => token + 1);
    setSheetOpen(true);
  }, []);

  const addPoemStanza = useCallback(() => {
    const index = sections.length === 0 ? 0 : Math.min(focusIndex, sections.length - 1) + 1;
    setSections((prev) => {
      const next = cloneSections(prev);
      next.splice(index, 0, { kind: "stanza", lines: [""] });
      return next;
    });
    focusSection(index, 0);
  }, [focusIndex, focusSection, sections.length]);

  const addLyricSection = useCallback(
    (label: LyricLabel) => {
      const index = sections.length === 0 ? 0 : Math.min(focusIndex, sections.length - 1) + 1;
      setSections((prev) => {
        const next = cloneSections(prev);
        next.splice(index, 0, { label, lines: [""] });
        return next;
      });
      focusSection(index, 0);
    },
    [focusIndex, focusSection, sections.length],
  );

  const duplicateSection = useCallback(() => {
    const index = Math.min(focusIndex, Math.max(sections.length - 1, 0));
    const source = sections[index];
    if (!source) return;
    const copy = cloneSections([source])[0];
    if (!copy) return;
    setSections((prev) => {
      const next = cloneSections(prev);
      next.splice(index + 1, 0, copy);
      return next;
    });
    focusSection(index + 1, 0);
  }, [focusIndex, focusSection, sections]);

  const moveSection = useCallback(
    (delta: -1 | 1) => {
      const from = focusIndex;
      const to = from + delta;
      if (to < 0 || to >= sections.length) return;
      setSections((prev) => {
        const next = cloneSections(prev);
        const [item] = next.splice(from, 1);
        if (!item) return prev;
        next.splice(to, 0, item);
        return next;
      });
      setFocusIndex(to);
      setActive((current) =>
        current && current.sectionIndex === from ? { sectionIndex: to, lineIndex: current.lineIndex } : current,
      );
    },
    [focusIndex, sections.length],
  );

  const addLine = useCallback(
    (sectionIndex: number, afterLine?: number) => {
      const section = sections[sectionIndex];
      if (!section) return;
      const insertAt =
        afterLine === undefined ? section.lines.length : Math.min(afterLine + 1, section.lines.length);
      setSections((prev) => {
        const next = cloneSections(prev);
        const block = next[sectionIndex];
        if (!block) return prev;
        block.lines.splice(insertAt, 0, "");
        return next;
      });
      focusSection(sectionIndex, insertAt);
    },
    [focusSection, sections],
  );

  const removeLine = useCallback(
    (sectionIndex: number, lineIndex: number) => {
      const section = sections[sectionIndex];
      if (!section) return;
      if (section.lines.length <= 1) {
        updateLine(sectionIndex, 0, "", 0);
        focusSection(sectionIndex, 0);
        return;
      }
      setSections((prev) => {
        const next = cloneSections(prev);
        const block = next[sectionIndex];
        if (!block) return prev;
        block.lines.splice(lineIndex, 1);
        return next;
      });
      focusSection(sectionIndex, Math.max(0, lineIndex - 1));
    },
    [focusSection, sections, updateLine],
  );

  const removeSection = useCallback(
    (sectionIndex: number) => {
      setSections((prev) => {
        if (prev.length <= 1) return prev;
        return prev.filter((_, i) => i !== sectionIndex);
      });
      if (sections.length <= 1) return;
      const nextIndex = Math.max(0, Math.min(sectionIndex, sections.length - 2));
      focusSection(nextIndex, 0);
    },
    [focusSection, sections.length],
  );

  const insertRhyme = useCallback(
    (rhyme: string) => {
      if (!active) return;
      const { sectionIndex, lineIndex } = active;
      const section = sections[sectionIndex];
      if (!section) return;
      const lineText = section.lines[lineIndex] ?? "";
      const caret = carets[caretKey(sectionIndex, lineIndex)] ?? lineText.length;
      const target = targetWordAtCaret(lineText, caret);
      if (!target) return;
      const nextLine = replaceWordInLine(lineText, target.start, target.end, rhyme);
      updateLine(sectionIndex, lineIndex, nextLine, target.start + rhyme.length);
    },
    [active, sections, carets, updateLine],
  );

  const activeLineText = useMemo(() => {
    if (!active) return "";
    const section = sections[active.sectionIndex];
    return section?.lines[active.lineIndex] ?? "";
  }, [active, sections]);

  const activeCaret = useMemo(() => {
    if (!active) return 0;
    return carets[caretKey(active.sectionIndex, active.lineIndex)] ?? activeLineText.length;
  }, [active, activeLineText, carets]);

  const onSave = useCallback(async () => {
    setError(null);
    setNotice(null);
    const prepared = preparePiece({
      title,
      slug,
      written,
      excerpt,
      sections,
      pieceKind,
      status,
    });
    if ("error" in prepared) {
      setError(prepared.error);
      return;
    }
    setPending("save");
    try {
      const saved = await savePoem(isNew ? null : id, prepared.value);
      setExcerpt(saved.excerpt);
      setSlug(saved.slug);
      setTitle(saved.title);
      setNotice(saved.status === "published" ? "Published." : "Saved.");
      if (isNew) go(`/write/${saved.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The piece did not save.");
    } finally {
      setPending(null);
    }
  }, [title, slug, written, excerpt, sections, pieceKind, status, isNew, id]);

  const onDelete = useCallback(async () => {
    if (isNew) {
      go("/write");
      return;
    }
    if (!window.confirm("Remove this piece? This cannot be undone.")) return;
    setPending("delete");
    setError(null);
    try {
      await deletePoem(id);
      go("/write");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The piece did not delete.");
      setPending(null);
    }
  }, [id, isNew]);

  return {
    isNew,
    loading,
    missing,
    pieceKind,
    sections,
    title,
    slug,
    slugTouched,
    written,
    excerpt,
    status,
    error,
    notice,
    pending,
    active,
    activeLineText,
    activeCaret,
    sheetOpen,
    setSheetOpen,
    setSlug,
    setSlugTouched,
    setWritten,
    setExcerpt,
    setStatus,
    onTitle,
    updateLine,
    setActive,
    focusIndex,
    focusToken,
    setFocusIndex,
    focusSection,
    addPoemStanza,
    addLyricSection,
    duplicateSection,
    moveSection,
    addLine,
    removeLine,
    removeSection,
    insertRhyme,
    onSave,
    onDelete,
  };
}
