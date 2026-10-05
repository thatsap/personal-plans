type StudioMetadataProps = {
  written: string;
  excerpt: string;
  slug: string;
  onWritten: (value: string) => void;
  onExcerpt: (value: string) => void;
  onSlug: (value: string) => void;
  onSlugTouched: () => void;
};

export function StudioMetadata({
  written,
  excerpt,
  slug,
  onWritten,
  onExcerpt,
  onSlug,
  onSlugTouched,
}: StudioMetadataProps) {
  return (
    <div className="slip-grid">
      <label className="field">
        <span>Written</span>
        <input
          value={written}
          placeholder="September 2026"
          onChange={(event) => onWritten(event.target.value)}
        />
      </label>
      <label className="field">
        <span>Excerpt</span>
        <input
          value={excerpt}
          placeholder="Leave blank to use the first lines"
          onChange={(event) => onExcerpt(event.target.value)}
        />
      </label>
      <label className="field">
        <span>Link</span>
        <input
          value={slug}
          spellCheck={false}
          autoCapitalize="none"
          onChange={(event) => {
            onSlugTouched();
            onSlug(event.target.value);
          }}
        />
      </label>
    </div>
  );
}