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

  const headers = { apikey: anonKey, "Content-Type": "image/jpeg", "x-upsert": "false" };
  // New sb_publishable keys are not JWTs, so they must not go in Authorization.
  if (!anonKey.startsWith("sb_")) headers.Authorization = `Bearer ${anonKey}`;

  const res = await fetch(`${url}/storage/v1/object/${bucket}/${name}`, {
    method: "POST", headers, body: blob,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
  return name;
}
