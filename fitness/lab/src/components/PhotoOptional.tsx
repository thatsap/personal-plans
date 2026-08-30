import { Capacitor } from "@capacitor/core";
import { useRef, useState, type ChangeEvent } from "react";
import { pickPhoto } from "../lib/photo";

export function PhotoOptional({
  preview,
  onChange,
}: {
  preview: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function grab(which: "camera" | "gallery") {
    setBusy(true);
    const data = await pickPhoto(which);
    setBusy(false);
    if (data) onChange(data);
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(f);
  }

  return (
    <div className="photo-opt">
      <label>Photo (optional)</label>
      <p className="muted">Not required. Does not set calories.</p>
      {preview ? (
        <img className="thumb" src={preview} alt="Meal preview" />
      ) : null}
      <div className="row">
        <button
          className="btn small ghost"
          type="button"
          disabled={busy}
          onClick={() => void grab("camera")}
        >
          Camera
        </button>
        <button
          className="btn small ghost"
          type="button"
          disabled={busy}
          onClick={() => {
            if (Capacitor.isNativePlatform()) {
              void grab("gallery");
              return;
            }
            fileRef.current?.click();
          }}
        >
          Folder
        </button>
        <input
          ref={fileRef}
          className="file-hidden"
          type="file"
          accept="image/*"
          onChange={onFile}
        />
        {preview ? (
          <button
            className="btn small ghost"
            type="button"
            onClick={() => onChange(null)}
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
