import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";
import { parseHash, readTypeSize, routeKey, setRobots, storeTypeSize, type Route, type TypeSize } from "./lib/route.ts";
import Editor from "./pages/Editor.tsx";
import Home from "./pages/Home.tsx";
import PoemPage from "./pages/PoemPage.tsx";
import Write from "./pages/Write.tsx";
import { site } from "./site.ts";

function analyticsPage(route: Route): { route: string; path: string } {
  if (route.name === "home") return { route: "/", path: "/" };
  if (route.name === "poem") return { route: "/p/:slug", path: `/p/${route.slug}` };
  if (route.name === "write") return { route: "/write", path: "/write" };
  return { route: "/write/:id", path: `/write/${route.id}` };
}

function Shell() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const [size, setSize] = useState<TypeSize>(() => readTypeSize());
  const key = routeKey(route);

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [key]);

  useEffect(() => {
    const desk = route.name === "write" || route.name === "editor";
    setRobots(desk ? "noindex, nofollow" : "index, follow");
    if (route.name === "poem") return;
    document.title = desk ? `Write · ${site.title}` : site.title;
  }, [route, key]);

  function onSize(next: TypeSize) {
    setSize(next);
    storeTypeSize(next);
  }

  const page = analyticsPage(route);

  return (
    <div className="shell">
      {route.name === "home" && <Home />}
      {route.name === "poem" && <PoemPage slug={route.slug} size={size} onSize={onSize} />}
      {route.name === "write" && <Write />}
      {route.name === "editor" && (
        <Editor key={routeKey(route)} id={route.id} draftKind={route.draftKind} />
      )}
      <Analytics route={page.route} path={page.path} />
    </div>
  );
}

export default function App() {
  return <Shell />;
}
