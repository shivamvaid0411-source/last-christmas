import { CONFIG } from "./config.js";

export async function startCamera(video) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser cannot access a camera. Try Chrome or Safari over https.");
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
  return stream;
}

/** Grab the current frame, centre-cropped to 4:5 and mirrored like a mirror booth. */
export function captureFrame(video) {
  const { width: W, height: H } = CONFIG.photo;
  const vw = video.videoWidth, vh = video.videoHeight;
  const target = W / H;
  let sw = vw, sh = vw / target;
  if (sh > vh) { sh = vh; sw = vh * target; }
  const sx = (vw - sw) / 2, sy = (vh - sh) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.translate(W, 0); ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
  return canvas;
}
