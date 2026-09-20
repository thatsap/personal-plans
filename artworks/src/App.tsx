import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";
import Home from "./pages/Home.tsx";
import PoemPage from "./pages/PoemPage.tsx";
import { getPoem } from "./poems/index.ts";
import { parseHash, readTypeSize, type Route, type TypeSize } from "./lib/route.ts";

function analyticsPage(route: Route): { route: string; path: string } {
  if (route.name === "home") return { route: "/", path: "/" };
  return { route: "/p/:slug", path: `/p/${route.slug}` };
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const [size, setSize] = useState<TypeSize>(() => readTypeSize());

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (route.name === "poem") {
      const poem = getPoem(route.slug);
      document.title = poem ? `${poem.title} · Artworks` : "Artworks";
    } else {
      document.title = "Artworks";
    }
  }, [route]);

  function onSize(next: TypeSize) {
    setSize(next);
    localStorage.setItem("artworks-type", next);
  }

  const page = analyticsPage(route);

  return (
    <div className="shell">
      {route.name === "home" && <Home />}
      {route.name === "poem" && (
        <PoemPage slug={route.slug} size={size} onSize={onSize} />
      )}
      <Analytics route={page.route} path={page.path} />
    </div>
  );
}
