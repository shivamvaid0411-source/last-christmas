import { CONFIG } from "./config.js";

// Straight, high-resolution output. Photos are drawn at 720x900 from the 960x1200 captures.
const PHOTO_W = 720, PHOTO_H = 900, PAD = 45, GAP = 27, FOOTER = 180;
export const STRIP_W = PHOTO_W + PAD * 2;
export const STRIP_H = PAD + CONFIG.shots * PHOTO_H + (CONFIG.shots - 1) * GAP + FOOTER;

function drawStrip(ctx, photos, dateLabel) {
  ctx.fillStyle = "#f8f4f3";
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);
  ctx.imageSmoothingQuality = "high";
  photos.forEach((p, i) => ctx.drawImage(p, PAD, PAD + i * (PHOTO_H + GAP), PHOTO_W, PHOTO_H));
  ctx.textAlign = "center";
  ctx.fillStyle = "#141414";
  ctx.font = "52px Anton, Impact, sans-serif";
  ctx.fillText(CONFIG.brand, STRIP_W / 2, STRIP_H - 92);
  ctx.fillStyle = "#c42a3b";
  ctx.font = "500 30px 'Instrument Sans', sans-serif";
  ctx.fillText(dateLabel, STRIP_W / 2, STRIP_H - 44);
}

/** Returns one straight strip and a straight sheet with two copies side by side. */
export async function buildOutputs(photos) {
  await Promise.all([document.fonts.load("52px Anton"), document.fonts.load("500 30px 'Instrument Sans'")]);

  const strip = document.createElement("canvas");
  strip.width = STRIP_W; strip.height = STRIP_H;
  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  drawStrip(strip.getContext("2d"), photos, date);

  const M = 90;
  const sheet = document.createElement("canvas");
  sheet.width = STRIP_W * 2 + M * 3;
  sheet.height = STRIP_H + M * 2;
  const ctx = sheet.getContext("2d");
  ctx.fillStyle = "#f4ecee";
  ctx.fillRect(0, 0, sheet.width, sheet.height);
  ctx.drawImage(strip, M, M);
  ctx.drawImage(strip, M * 2 + STRIP_W, M);
  return { strip, sheet };
}
