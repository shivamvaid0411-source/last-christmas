export function startSnow(canvas) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || innerWidth < 700) return;
  const ctx = canvas.getContext("2d");
  let w, h, flakes = [];
  const resize = () => {
    w = canvas.width = innerWidth; h = canvas.height = innerHeight;
    flakes = Array.from({ length: Math.min(70, Math.floor(w / 18)) }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: 1 + Math.random() * 2.2,
      s: 0.25 + Math.random() * 0.7, d: Math.random() * Math.PI * 2,
    }));
  };
  resize(); addEventListener("resize", resize);
  (function frame() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,.85)";
    for (const f of flakes) {
      f.y += f.s; f.d += 0.01; f.x += Math.sin(f.d) * 0.3;
      if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w; }
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
    }
    requestAnimationFrame(frame);
  })();
}
