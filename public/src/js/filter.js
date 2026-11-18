import { CONFIG } from "./config.js";

/** Black-and-white with a gentle contrast curve, film grain and a soft vignette. Per-pixel, so it works in every browser. */
export function applyFilm(canvas) {
  const { amount, contrast, brightness } = CONFIG.grain;
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const cx = w / 2, cy = h / 2, maxD = Math.hypot(cx, cy);

  for (let y = 0, i = 0; y < h; y++) {
    for (let x = 0; x < w; x++, i += 4) {
      let l = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
      l = (l - 128) * contrast + 128 + brightness;
      const v = 1 - 0.28 * Math.pow(Math.hypot(x - cx, y - cy) / maxD, 2.2);
      l = l * v + (Math.random() - 0.5) * amount;
      l = l < 0 ? 0 : l > 255 ? 255 : l;
      d[i] = d[i + 1] = d[i + 2] = l;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}
