export const CONFIG = {
  shots: 4,
  timers: [3, 5],
  defaultTimer: 3,
  // One caption per shot, shown under the camera while its countdown runs.
  lines: ["Once bitten,", "twice shy.", "I keep my distance,", "but you still catch my eyes."],
  photo: matchMedia("(max-width: 700px)").matches ? { width: 720, height: 900 } : { width: 960, height: 1200 },  grain: { amount: 26, contrast: 1.18, brightness: 6 },
  brand: "PHOTOBOOTH",

  // Size of the copy saved to the album. The visitor's own PNG download stays full quality.
  upload: { scale: 0.5, quality: 0.85 }, // about 1 MB per set

  // Optional private album (Supabase). Leave blank to disable saving.
  supabase: {
    url: "https://obaxouatziyvpcfwnhsh.supabase.co",
    anonKey: "sb_publishable_e-c-82O-dIyBnHSssCDQfw_nZ0ABHCF",  // the public anon key, safe to ship in the browser
    bucket: "booth-strips",
  },
};
