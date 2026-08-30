export function ScreenHeader({
  kicker,
  title,
  meta,
}: {
  kicker: string;
  title: string;
  meta?: string;
}) {
  return (
    <header className="ops-head">
      <div className="ops-head-row">
        <p className="kicker">{kicker}</p>
        {meta ? <span className="stamp">{meta}</span> : null}
      </div>
      <h1>{title}</h1>
    </header>
  );
}
