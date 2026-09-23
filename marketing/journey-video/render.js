// Renders journey.html frame-by-frame with headless Chromium and encodes MP4 + WebM.
// Usage: node render.js [--stills]   (requires playwright and ffmpeg; FFMPEG env overrides binary)
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const FPS = 30;
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const OUT = path.join(__dirname, "dist");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto("file://" + path.join(__dirname, "journey.html"));
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.DURATION);

  if (process.argv.includes("--stills")) {
    for (const t of [2.5, 4, 8, 15.5, 22, 27, 33, 38, 40.5, 44.5, 49]) {
      await page.evaluate(t => window.render(t), t);
      await page.screenshot({ path: path.join(OUT, `still-${t}.jpg`), quality: 80 });
    }
    await browser.close();
    return;
  }

  const master = path.join(OUT, "master.mp4");
  const ff = spawn(FFMPEG, ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p", master], { stdio: ["pipe", "inherit", "inherit"] });
  const total = Math.round(duration * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (f % 150 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  // Poster frame
  await page.evaluate(() => window.render(49));
  await page.screenshot({ path: path.join(OUT, "poster.jpg"), type: "jpeg", quality: 85 });
  await browser.close();
})();
