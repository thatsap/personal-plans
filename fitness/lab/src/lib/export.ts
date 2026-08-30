import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { KCAL_TARGET, PROTEIN_TARGET } from "./types";
import type { IngestionRow } from "./types";
import type { ReviewStats } from "./review";

function csvEscape(v: string | number) {
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function buildAarCsv(stats: ReviewStats, rows: IngestionRow[]) {
  const dayLines = [
    ["date", "kcal", "protein_g", "carbs_g", "fat_g", "junk", "snack", "protocol", "items", "over_kcal", "under_protein"].join(","),
    ...stats.days.map((d) =>
      [
        d.key,
        d.kcal,
        Math.round(d.protein),
        Math.round(d.carbs),
        Math.round(d.fat),
        d.junk,
        d.snack,
        d.protocol,
        d.items,
        d.overKcal ? "yes" : "no",
        d.underProtein ? "yes" : "no",
      ].join(","),
    ),
  ];
  const logLines = [
    "",
    "logs",
    ["eaten_at", "name", "tag", "quantity", "unit", "kcal", "protein_g", "source"].join(","),
    ...rows.map((r) =>
      [
        csvEscape(r.eaten_at),
        csvEscape(r.name),
        r.tag,
        r.quantity,
        r.unit,
        r.kcal,
        r.protein_g,
        r.source,
      ].join(","),
    ),
  ];
  return [...dayLines, ...logLines].join("\n");
}

export function buildAarText(
  stats: ReviewStats,
  from: string,
  to: string,
  logCount: number,
) {
  const lines = [
    "LAB // AFTER ACTION REPORT",
    `Window: ${from} → ${to} (Asia/Kolkata)`,
    `Protocol: ${KCAL_TARGET} kcal / ${PROTEIN_TARGET} g protein`,
    `Logs: ${logCount}`,
    `Avg kcal/day: ${stats.avgKcal}`,
    `Avg protein: ${stats.avgProtein} g`,
    `Days over kcal: ${stats.daysOver}`,
    `Days on target: ${stats.daysOnTarget}`,
    "",
    "WRONG",
    ...(stats.wrong.length ? stats.wrong.map((w) => `- ${w}`) : ["- none"]),
    "",
    "RIGHT",
    ...(stats.right.length ? stats.right.map((w) => `- ${w}`) : ["- none"]),
    "",
    "DAYS",
    ...stats.days.map(
      (d) =>
        `${d.key}  ${d.kcal} kcal  P${Math.round(d.protein)}  junk ${d.junk}  protocol ${d.protocol}`,
    ),
  ];
  if (stats.topJunk.length) {
    lines.push("", "JUNK BY KCAL");
    for (const j of stats.topJunk) {
      lines.push(`- ${j.name}  ${j.kcal} kcal  x${j.count}`);
    }
  }
  return lines.join("\n");
}

function download(name: string, body: string, mime: string) {
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportAar(opts: {
  stats: ReviewStats;
  rows: IngestionRow[];
  from: string;
  to: string;
}) {
  const txt = buildAarText(opts.stats, opts.from, opts.to, opts.rows.length);
  const csv = buildAarCsv(opts.stats, opts.rows);
  const combined = `${txt}\n\n--- CSV ---\n${csv}\n`;
  const base = `lab-aar-${opts.from}-to-${opts.to}`;

  if (Capacitor.isNativePlatform()) {
    const file = await Filesystem.writeFile({
      path: `${base}.txt`,
      data: combined,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({
      title: `LAB AAR ${opts.from}–${opts.to}`,
      text: txt,
      files: file.uri ? [file.uri] : undefined,
      dialogTitle: "Export AAR",
    });
    return;
  }

  download(`${base}.txt`, combined, "text/plain");
  download(`${base}.csv`, csv, "text/csv");
}
