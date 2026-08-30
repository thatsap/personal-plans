import { useEffect, useState } from "react";
import { signedPhotoUrl } from "../lib/photo";

export function MealThumb({ path }: { path: string | null }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    let live = true;
    void signedPhotoUrl(path).then((u) => {
      if (live) setUrl(u);
    });
    return () => {
      live = false;
    };
  }, [path]);

  if (!path || !url) return null;
  return <img className="thumb sm" src={url} alt="" />;
}
