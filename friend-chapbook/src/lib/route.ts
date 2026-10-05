import type { PieceKind } from "../poems/types.ts";

export type TypeSize = "s" | "m" | "l";

export type Route =
  | { name: "home" }
  | { name: "poem"; slug: string }
  | { name: "write" }
  | { name: "editor"; id: string; draftKind?: PieceKind };

const TYPE_KEY = "chapbook-type";

export function go(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (window.location.hash !== `#${normalized}`) {
    window.location.hash = normalized;
  }
}

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, "").replace(/^\//, "").replace(/\/$/, "");
  const path = raw.split("?")[0] ?? "";
  const parts = path.split("/").filter(Boolean).map((part) => {
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  });
  if (parts[0] === "p" && parts[1]) return { name: "poem", slug: parts[1] };
  if (parts[0] === "write" && parts[1] === "new") {
    if (parts[2] === "poem") return { name: "editor", id: "new", draftKind: "poem" };
    if (parts[2] === "lyrics") return { name: "editor", id: "new", draftKind: "lyrics" };
    return { name: "editor", id: "new" };
  }
  if (parts[0] === "write" && parts[1]) return { name: "editor", id: parts[1] };
  if (parts[0] === "write" || parts[0] === "login") return { name: "write" };
  return { name: "home" };
}

export function routeKey(route: Route): string {
  if (route.name === "poem") return `poem:${route.slug}`;
  if (route.name === "editor") {
    return route.draftKind ? `editor:${route.id}:${route.draftKind}` : `editor:${route.id}`;
  }
  return route.name;
}

export function readTypeSize(): TypeSize {
  const saved = localStorage.getItem(TYPE_KEY);
  if (saved === "s" || saved === "m" || saved === "l") return saved;
  return "m";
}

export function storeTypeSize(size: TypeSize) {
  localStorage.setItem(TYPE_KEY, size);
}

export function setRobots(content: string) {
  let meta = document.querySelector('meta[name="robots"]');
  if (!(meta instanceof HTMLMetaElement)) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "robots");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}
