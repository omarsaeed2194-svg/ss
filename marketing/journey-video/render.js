// Renders journey.html frame-by-frame with headless Chromium, then encodes the web files into dist/.
// Usage: node render.js [page.html] [--portrait] [--stills]   (page defaults to journey.html)
//   --portrait  vertical 1080x1920 cut (default: horizontal 1920x1080)
//   --stills    only write a few preview JPGs
// Requires playwright (with Chromium) and ffmpeg; PLAYWRIGHT_PATH / FFMPEG override their locations.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const { spawn, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const FPS = 30;
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const OUT = path.join(__dirname, "dist");
const PORTRAIT = process.argv.includes("--portrait");
const [W, H] = PORTRAIT ? [1080, 1920] : [1920, 1080];
const PAGE = process.argv.slice(2).find(a => a.endsWith(".html")) || "journey.html";

function ffmpeg(args) {
  const r = spawnSync(FFMPEG, ["-loglevel", "error", "-y", ...args], { stdio: "inherit" });
  if (r.status !== 0) throw new Error("ffmpeg failed: " + args.join(" "));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto("file://" + path.join(__dirname, PAGE) + (PORTRAIT ? "?portrait" : ""));
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.DURATION);
  const base = await page.evaluate(() => window.VIDEO_NAME || "saudisoft-localization-journey");
  const NAME = base + "-" + (PORTRAIT ? "vertical" : "horizontal");

  if (process.argv.includes("--stills")) {
    for (const t of await page.evaluate(() => window.STILLS || [4, 8, 15.5, 27, 33, 38, 44.5, 49])) {
      await page.evaluate(t => window.render(t), t);
      await page.screenshot({ path: path.join(OUT, `still-${PORTRAIT ? "v" : "h"}-${t}.jpg`), quality: 80 });
    }
    await browser.close();
    return;
  }

  const master = path.join(OUT, `master-${NAME}.mp4`);
  const ff = spawn(FFMPEG, ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p", master], { stdio: ["pipe", "inherit", "inherit"] });
  const total = Math.round(duration * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (f % 300 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));

  await page.evaluate(d => window.render(d - 3), duration);
  const posterPng = path.join(OUT, "poster.png");
  await page.screenshot({ path: posterPng });
  await browser.close();

  const out = suffix => path.join(OUT, `${NAME}-${suffix}`);
  const small = PORTRAIT ? "720:1280" : "1280:720";
  const h264 = ["-c:v", "libx264", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an"];
  ffmpeg(["-i", master, ...h264, "-crf", "22", out("1080p.mp4")]);
  ffmpeg(["-i", master, "-vf", `scale=${small}`, ...h264, "-crf", "23", out("720p.mp4")]);
  ffmpeg(["-i", master, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-an", out("1080p.webm")]);
  ffmpeg(["-i", posterPng, "-q:v", "4", out("poster.jpg")]);
  fs.rmSync(master); fs.rmSync(posterPng);
  console.log("done:", NAME);
})();
