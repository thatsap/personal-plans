export type TypeSize = "s" | "m" | "l";

export type Route = { name: "home" } | { name: "poem"; slug: string };

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, "").replace(/\/$/, "");
  const parts = raw.split("/").filter(Boolean);
  if (parts[0] === "p" && parts[1]) return { name: "poem", slug: parts[1] };
  return { name: "home" };
}

export function readTypeSize(): TypeSize {
  const saved = localStorage.getItem("artworks-type");
  if (saved === "s" || saved === "m" || saved === "l") return saved;
  return "m";
}
