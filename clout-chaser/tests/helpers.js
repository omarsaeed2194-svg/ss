/* Shared helpers for the browser tests. Uses Playwright from a local install or the global one. */
const path = require('path');
let pw;
try { pw = require('playwright'); } catch (e) { pw = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); }
const GAME = 'file://' + path.resolve(__dirname, '..', 'index.html');
const OLD_SAVE = require('fs').readFileSync(path.join(__dirname, 'fixtures', 'old-save.json'), 'utf8');

async function launch() { return pw.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}); }
/* a page that records every uncaught error and console.error */
async function page(browser, width = 1400) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const p = await ctx.newPage();
  p.errors = [];
  p.on('pageerror', (e) => p.errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_/.test(m.text())) p.errors.push('console: ' + m.text()); });
  return p;
}
async function newGame(p, setup) {
  await p.goto(GAME); await p.evaluate(() => localStorage.clear()); await p.reload();
  for (const s of ['onbNext', 'onbNext', 'onbNext', 'onbGo']) await p.click(`[data-act="${s}"]`);
  await p.waitForTimeout(100);
  await p.evaluate(setup || (() => {}));
  await p.evaluate(() => { closeCompose(); S.queue = []; renderAll(); });
}
async function oldGame(p) {
  await p.goto(GAME); await p.evaluate((s) => { localStorage.clear(); localStorage.setItem(SAVE_KEY, s); }, OLD_SAVE); await p.reload();
  await p.click('[data-act="onbContinue"]'); await p.waitForTimeout(100);
  await p.evaluate(() => { closeCompose(); S.queue = []; renderAll(); });
}
let failures = 0;
function check(name, ok, info = '') { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  ' + info : ''}`); if (!ok) failures++; }
function done() { console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed'); process.exit(failures ? 1 : 0); }
module.exports = { launch, page, newGame, oldGame, check, done };
