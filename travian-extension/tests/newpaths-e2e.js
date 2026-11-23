// 2.11.2: Travian moved its pages — /dorf1.php → /resource, /dorf2.php →
// /village, /build.php → /building (the old addresses forward there). The
// bot reads the villages, builds and trains as before.
// Run: xvfb-run -a node tests/newpaths-e2e.js   (OLD=1: a server without the move)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const EXT = process.env.EXT || path.join(__dirname, '..');
const HOST = 'https://ts30.x3.international.travian.com';
const FX = process.env.FX || '/home/user/vinaghost/fx/MainCore.Test/Parsers';
const OUT = process.argv[2] || fs.mkdtempSync(path.join(require('os').tmpdir(), 'tvh-np-'));
const read = (f) => fs.readFileSync(path.join(FX, f), 'utf8');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const check = (name, ok, got) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` — got ${JSON.stringify(got)}`}`); if (!ok) failed++; };

const world = { upgrades: [], trains: [], old: 0, served: [] };
// OLD=1: a server that still uses the old addresses (no forwarding).
const MOVED = process.env.OLD ? {} : { '/dorf1.php': '/resource', '/dorf2.php': '/village', '/build.php': '/building' };
function page_(u, method, post) {
  const p = u.pathname;
  if (p === '/resource' || p === '/dorf1.php') return read('BuildingLayout/Resources.html');
  if (p === '/village' || p === '/dorf2.php') return read('BuildingLayout/Buildings.html');
  if (p === '/building' || p === '/build.php') {
    if (method === 'POST') { world.trains.push(Object.fromEntries(new URLSearchParams(post || ''))); }
    if (u.searchParams.get('gid') === '19') return read('TrainTroop/BarrackPage.html');
    return read('Upgrade/CroplandConstructed.html');
  }
  return read('BuildingLayout/Buildings.html').replace('<div id="contentOuterContainer" class="">', '<div id="contentOuterContainer" class=""><div id="content"><div></div></div>');
}

(async () => {
  // A local "game" over HTTPS with real redirects, on the game's own host name.
  const https = require('https');
  const certDir = path.join(OUT, 'cert');
  fs.mkdirSync(certDir, { recursive: true });
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${certDir}/key.pem -out ${certDir}/cert.pem -days 2 -subj "/CN=*.travian.com" -addext "subjectAltName=DNS:*.travian.com,DNS:*.x3.international.travian.com" 2>/dev/null`);
  const server = https.createServer({ key: fs.readFileSync(`${certDir}/key.pem`), cert: fs.readFileSync(`${certDir}/cert.pem`) }, (req, res) => {
    const u = new URL(req.url, HOST);
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      if (u.searchParams.get('action') === 'build') world.upgrades.push(u.searchParams.get('id'));
      if (MOVED[u.pathname] && req.method !== 'POST') {
        world.old++;
        res.writeHead(302, { Location: `${HOST}${MOVED[u.pathname]}${u.search}` });
        return res.end();
      }
      const p = MOVED[u.pathname] ? new URL(`${HOST}${MOVED[u.pathname]}${u.search}`) : u;
      // The saved pages' own files (scripts, styles, frames): not served.
      const asset = /\.(png|gif|jpg|css|js|ico|svg|woff2?|download|html)$/.test(p.pathname) || /_files\//.test(decodeURIComponent(p.pathname));
      if (asset) { res.writeHead(404); return res.end(); }
      world.served.push(p.pathname + p.search);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(page_(p, req.method, body));
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const ctx = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(OUT, 'profile-')), {
    headless: false, ignoreHTTPSErrors: true,
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, `--host-resolver-rules=MAP *.travian.com 127.0.0.1:${port}`, '--no-proxy-server', '--ignore-certificate-errors'],
    viewport: { width: 1366, height: 1000 },
  });
  // Anything not on the game's host (images, fonts from elsewhere) answers at once.
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith('chrome-extension://') || u.startsWith(HOST)) return route.continue();
    return route.fulfill({ status: 404, body: '' });
  });
  const sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
  const extId = sw.url().split('/')[2];
  const store = () => sw.evaluate(() => chrome.storage.local.get(null));
  const waitFor = async (fn, ms) => { const end = Date.now() + ms; for (;;) { const v = await fn(); if (v || Date.now() > end) return v; await sleep(1000); } };

  const game = await ctx.newPage();
  await game.goto(`${HOST}/dorf1.php`, { waitUntil: 'domcontentloaded' }); await sleep(2500);
  await game.goto(`${HOST}/dorf2.php`, { waitUntil: 'domcontentloaded' }); await sleep(2500);
  await game.close();
  let st = await store();
  const vid = Object.keys(st.villages || {})[0];
  const v = (st.villages || {})[vid] || {};
  check('the village is read at the new addresses (/resource, /village): fields and buildings', (v.fields || []).length === 18 && (v.buildings || []).filter((b) => b.gid).length >= 2, [(v.fields || []).length, (v.buildings || []).length]);

  const dash = await ctx.newPage();
  await dash.goto(`chrome-extension://${extId}/dashboard/dashboard.html`); await sleep(1500);
  const cmd = (name, args) => dash.evaluate(([n, a]) => chrome.runtime.sendMessage({ type: 'COMMAND', name: n, args: a }), [name, args]);
  await sw.evaluate((id) => chrome.storage.local.set({ training: [{ id: 'r1', villageId: id, gid: 19, troop: 't1', amount: 2, everyMinutes: 60, enabled: true }] }), vid);
  await cmd('saveSettings', { settings: { autopilot: { enabled: true, build: true }, botEnabled: true, pauseWhenPlaying: false, watchEnabled: true } });
  await cmd('runNow', {});
  await waitFor(() => world.upgrades.length > 0 && world.trains.length > 0, 150000);
  st = await store();
  const errs = (st.log || []).filter((e) => e.level === 'error').map((e) => e.msg);
  console.log('    old addresses forwarded:', world.old, '| upgrades', JSON.stringify(world.upgrades), '| trains', JSON.stringify(world.trains), '| errors', JSON.stringify(errs.slice(0, 3)));
  check('builds: the upgrade button on /building was pressed', world.upgrades.length > 0, world.upgrades);
  check('trains: the barracks form on /building was sent', world.trains.some((f) => f.t1 === '2'), world.trains);
  check('no "build page not loaded" errors', !errs.some((m) => /لم يتم تحميل صفحة البناء|build page/i.test(m)), errs);
  if (!process.env.OLD) check('the old addresses were used and forwarded', world.old > 0 && world.served.some((x) => x.startsWith('/building')), world.old);
  await ctx.close();
  server.close();
  console.log(failed ? `${failed} FAILED` : 'ALL PASS');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
