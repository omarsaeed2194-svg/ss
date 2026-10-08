// Renders ad.html to an MP4 by stepping its animation timeline frame by frame.
//
//   node render.mjs [--audio=music.wav] [--out=jeep-ad-30s.mp4] [--price=499 --old=699 --cod=1]
//   node render.mjs --stills=out_dir --at=1,5.5,12   (PNG snapshots for checking)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require('/opt/node22/lib/node_modules/playwright'));
}

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=')];
}));
const fps = 30;
const duration = Number(args.duration || 30);

const params = new URLSearchParams({ render: '1' });
for (const k of ['price', 'old', 'cod']) if (args[k]) params.set(k, args[k]);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + path.join(here, 'ad.html') + '?' + params);
await page.evaluate(() => window.__ready);

if (args.stills) {
  mkdirSync(args.stills, { recursive: true });
  for (const t of args.at.split(',').map(Number)) {
    await page.evaluate(t => window.seek(t), t);
    await page.screenshot({ path: path.join(args.stills, `t${t.toFixed(2)}.png`) });
  }
  await browser.close();
  process.exit(0);
}

const out = path.resolve(args.out || path.join(here, 'jeep-ad-30s.mp4'));
const audio = args.audio ? ['-i', path.resolve(args.audio)] : [];
const ff = spawn('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
  ...audio,
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps),
  ...(audio.length ? ['-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
  '-movflags', '+faststart', out,
], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error(`ffmpeg exited with ${c}`)))));

const frames = Math.round(duration * fps);
for (let i = 0; i < frames; i++) {
  await page.evaluate(t => window.seek(t), i / fps);
  const buf = await page.screenshot({ type: 'png' });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 150 === 0) console.log(`frame ${i}/${frames}`);
}
ff.stdin.end();
await done;
await browser.close();
console.log('wrote', out);
