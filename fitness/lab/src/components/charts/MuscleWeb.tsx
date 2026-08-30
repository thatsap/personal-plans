import type { MuscleHit } from "../../lib/workout/muscles";

function pt(i: number, n: number, r: number, cx: number, cy: number) {
  const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

export function MuscleWeb({ hits }: { hits: MuscleHit[] }) {
  const n = hits.length;
  const cx = 160;
  const cy = 160;
  const r = 92;
  const rings = [0.25, 0.5, 0.75, 1];
  const poly = hits
    .map((h, i) => {
      const [x, y] = pt(i, n, r * h.score, cx, cy);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="st-web">
      <svg viewBox="0 0 320 320" role="img" aria-label="Muscle coverage">
        {rings.map((t) => (
          <polygon
            key={t}
            fill="none"
            stroke="var(--line)"
            strokeWidth="1"
            points={hits.map((_, i) => pt(i, n, r * t, cx, cy).join(",")).join(" ")}
          />
        ))}
        {hits.map((_, i) => {
          const [x, y] = pt(i, n, r, cx, cy);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth="1" />;
        })}
        <polygon points={poly} fill="var(--accent)" fillOpacity="0.32" stroke="var(--accent)" strokeWidth="2" />
        {hits.map((h, i) => {
          const [x, y] = pt(i, n, r + 22, cx, cy);
          const cold = h.sets === 0;
          return (
            <text
              key={h.id}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={cold ? "var(--muted)" : "var(--text)"}
              fontSize="11"
              fontFamily="Barlow Condensed, Arial Narrow, sans-serif"
              letterSpacing="0.06em"
            >
              {h.label.toUpperCase()}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
