import { CONFIG } from "./config.js";
import { startCamera, captureFrame } from "./camera.js";
import { applyFilm } from "./filter.js";
import { buildOutputs } from "./strip.js";
import { uploadSheet, toAlbumBlob } from "./storage.js";
import { startSnow } from "./snow.js";

const $ = (id) => document.getElementById(id);
const app = document.querySelector(".app");
const el = {
  video: $("video"), start: $("startBtn"), again: $("againBtn"), dlStrip: $("dlStrip"), dlSheet: $("dlSheet"),
  status: $("status"), badge: $("countBadge"), countdown: $("countdown"), flash: $("flash"),
  thumbs: [...$("thumbs").children], segs: [...$("segments").querySelectorAll("i")],
  lines: [...$("lines").children], developFill: $("developFill"), blurb: $("blurb"),
  dispenser: $("dispenser"), drop: document.querySelector(".drop"), stripA: $("stripA"), stripB: $("stripB"),
  consent: $("consent"), timerBtns: [...document.querySelectorAll("[data-seconds]")], lookBtns: [...document.querySelectorAll("[data-look]")],
};
const BLURB = el.blurb.textContent;

let seconds = CONFIG.defaultTimer;
let look = "bw"; // "bw" or "color"
let stream = null;
let files = { strip: null, sheet: null };
let urls = [];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const setState = (s) => (app.dataset.state = s);
const say = (msg = "") => (el.status.textContent = msg);
const restart = (node, cls) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };
const toBlob = (canvas, type, q) => new Promise((r) => canvas.toBlob(r, type, q));
const markLines = (active) => el.lines.forEach((li, i) => {
  li.classList.toggle("is-active", i === active);
  li.classList.toggle("is-done", i < active);
});

startSnow($("snow"));

el.timerBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    seconds = Number(btn.dataset.seconds);
    el.timerBtns.forEach((b) => b.setAttribute("aria-checked", String(b === btn)));
  })
);

el.lookBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    look = btn.dataset.look;
    app.dataset.look = look;
    el.lookBtns.forEach((b) => b.setAttribute("aria-checked", String(b === btn)));
  })
);

const lockOptions = (locked) => [...el.timerBtns, ...el.lookBtns].forEach((b) => (b.disabled = locked));

function resetUI() {
  el.thumbs.forEach((t) => { t.style.backgroundImage = ""; t.classList.remove("is-filled"); });
  el.segs.forEach((s) => (s.style.width = "0"));
  markLines(-1);
  el.developFill.style.width = "0";
  el.drop.classList.remove("is-dropping");
  el.dispenser.hidden = true;
  urls.forEach(URL.revokeObjectURL); urls = []; files = { strip: null, sheet: null };
  el.dlStrip.hidden = el.dlSheet.hidden = el.again.hidden = true;
  el.start.hidden = false; el.start.disabled = false;
  lockOptions(false);
  el.blurb.textContent = BLURB;
  say();
  setState("intro");
}

function countdown(i) {
  return new Promise((resolve) => {
    const seg = el.segs[i], t0 = performance.now(), total = seconds * 1000;
    let shown = 0;
    (function tick(now) {
      const p = Math.min(1, (now - t0) / total);
      seg.style.width = `${p * 100}%`;
      const n = Math.ceil(seconds - p * seconds);
      if (n !== shown && n > 0) { shown = n; el.countdown.textContent = n; restart(el.countdown, "is-tick"); }
      p < 1 ? requestAnimationFrame(tick) : resolve();
    })(t0);
  });
}

async function run() {
  el.start.disabled = true;
  lockOptions(true);
  say();

  try {
    if (!stream) stream = await startCamera(el.video);
  } catch (err) {
    say(err.name === "NotAllowedError" ? "Camera access was blocked. Allow it in your browser settings, then press Start." : err.message);
    el.start.disabled = false; lockOptions(false);
    return;
  }
  app.dataset.live = "true";
  el.start.hidden = true;
  setState("shooting");

  const photos = [];
  for (let i = 0; i < CONFIG.shots; i++) {
    el.badge.textContent = `${i + 1}/${CONFIG.shots}`;
    markLines(i);
    await countdown(i);
    const frame = captureFrame(el.video);
    const shot = look === "bw" ? applyFilm(frame) : frame;
    photos.push(shot);
    restart(el.flash, "is-fire");
    el.thumbs[i].style.backgroundImage = `url(${shot.toDataURL("image/jpeg", 0.5)})`;
    el.thumbs[i].classList.add("is-filled");
    await sleep(700);
  }
  markLines(CONFIG.shots);

  setState("developing");
  const t0 = performance.now();
  const grow = setInterval(() => {
    el.developFill.style.width = `${Math.min(92, ((performance.now() - t0) / 2600) * 100)}%`;
  }, 40);
  const { strip, sheet } = await buildOutputs(photos);
  files.strip = await toBlob(strip, "image/png");
  files.sheet = await toBlob(sheet, "image/png");
  await sleep(Math.max(0, 2600 - (performance.now() - t0)));
  clearInterval(grow);
  el.developFill.style.width = "100%";
  await sleep(200);

  const stripUrl = URL.createObjectURL(files.strip);
  urls.push(stripUrl);
  el.stripA.src = el.stripB.src = stripUrl;
  await Promise.all([el.stripA.decode(), el.stripB.decode()]).catch(() => {});

  el.dispenser.hidden = false;
  el.blurb.textContent = "Your strips are printing.";
  setState("result");
  requestAnimationFrame(() => el.drop.classList.add("is-dropping"));
  el.dlStrip.hidden = el.dlSheet.hidden = el.again.hidden = false;

}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

el.start.addEventListener("click", run);
el.again.addEventListener("click", resetUI);
el.dlStrip.addEventListener("click", () => files.strip && download(files.strip, "mistletoe-strip.png"));
el.dlSheet.addEventListener("click", () => files.sheet && download(files.sheet, "mistletoe-strips-pair.png"));
