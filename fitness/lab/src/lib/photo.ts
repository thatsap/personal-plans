import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { getSupabase } from "./supabase";

export function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(head)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export async function pickPhoto(
  source: "camera" | "gallery",
): Promise<string | null> {
  try {
    const image = await Camera.getPhoto({
      quality: 72,
      width: 1280,
      resultType: CameraResultType.DataUrl,
      source: source === "camera" ? CameraSource.Camera : CameraSource.Photos,
    });
    return image.dataUrl ?? null;
  } catch {
    return null;
  }
}

export async function uploadUserPhoto(
  bucket: string,
  userId: string,
  fileId: string,
  dataUrl: string,
): Promise<string> {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase not connected.");
  const path = `${userId}/${fileId}.jpg`;
  const blob = dataUrlToBlob(dataUrl);
  const { error } = await sb.storage.from(bucket).upload(path, blob, {
    upsert: true,
    contentType: blob.type || "image/jpeg",
  });
  if (error) throw error;
  return path;
}

export async function uploadMealPhoto(
  userId: string,
  ingestionId: string,
  dataUrl: string,
): Promise<string> {
  const path = await uploadUserPhoto("meal-photos", userId, ingestionId, dataUrl);
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase not connected.");
  const { error: upErr } = await sb
    .from("ingestions")
    .update({ photo_path: path })
    .eq("id", ingestionId);
  if (upErr) throw upErr;
  return path;
}

export async function signedPhotoUrl(
  path: string,
  bucket = "meal-photos",
): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

export async function removeMealPhoto(path: string, ingestionId: string) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.storage.from("meal-photos").remove([path]);
  await sb.from("ingestions").update({ photo_path: null }).eq("id", ingestionId);
}
