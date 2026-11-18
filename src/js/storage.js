import { CONFIG } from "./config.js";

export const storageEnabled = () => Boolean(CONFIG.supabase.url && CONFIG.supabase.anonKey);

/** Shrink the full-size sheet to a small JPEG so storage lasts. */
export function toAlbumBlob(canvas) {
  const { scale, quality } = CONFIG.upload;
  const small = document.createElement("canvas");
  small.width = Math.round(canvas.width * scale);
  small.height = Math.round(canvas.height * scale);
  const ctx = small.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, small.width, small.height);
  return new Promise((r) => small.toBlob(r, "image/jpeg", quality));
}

/** Upload a finished sheet to a private Supabase Storage bucket. The anon key can only insert, never read or list. */
export async function uploadSheet(blob) {
  const { url, anonKey, bucket } = CONFIG.supabase;
  const name = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.jpg`;
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${name}`, {
    method: "POST",
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "Content-Type": "image/jpeg", "x-upsert": "false" },
    body: blob,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  return name;
}
