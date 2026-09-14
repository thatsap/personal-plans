import { useEffect, useState } from "react";
import { signedPhotoUrl } from "../lib/photo";

export function MealThumb({ path, bucket = "meal-photos" }: { path: string | null; bucket?: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    let live = true;
    void signedPhotoUrl(path, bucket).then((u) => {
      if (live) setUrl(u);
    });
    return () => {
      live = false;
    };
  }, [path, bucket]);

  if (!path || !url) return null;
  return <img className="thumb sm" src={url} alt="" />;
}
