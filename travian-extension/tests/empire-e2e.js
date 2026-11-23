// 2.12 end to end, against a local HTTPS "game" on the game's own host
// name (real pages from the fixtures, real redirects): two villages — Main
// (army, barracks) and North (economy, marketplace). In one round the
// coordinator has North send its army share to Main (and not train
// itself), the hero's new points go into fighting strength, a nearby
// player's profile is read (their village's population lands on the map
// store), and the Empire page shows it all.
// Run: xvfb-run -a node tests/empire-e2e.js   (FX = fixtures folder, see paths.cjs)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const EXT = process.env.EXT || path.join(__dirname, '..');
const FX = process.env.FX || '/home/user/vinaghost/fx/MainCore.Test/Parsers';
const HOST = 'https://ts30.x3.international.travian.com';
const OUT = fs.mkdtempSync(path.join(require('os').tmpdir(), 'tvh-e2e-'));
const read = (f) => fs.readFileSync(path.join(FX, f), 'utf8');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const check = (name, ok, got) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` — got ${JSON.stringify(got)}`}`); if (!ok) failed++; };

const MAIN = '38356', NORTH = '40001';
const world = { active: MAIN, sent: [], free: 2, heroSaved: null, profiles: [], trainsNorth: 0, reqs: [] };
const stockOf = () => (world.active === NORTH ? 780 : 400);
function sidebar(html) {
  html = html.replace('class="listEntry  active"', `class="listEntry ${world.active === MAIN ? ' active' : ''}"`);
  const north = `<div class="dropContainer" data-sortindex="0"><div class="listEntry${world.active === NORTH ? ' active' : ''}" data-did="${NORTH}">
    <a href="${HOST}/dorf1.php?newdid=${NORTH}&amp;"><span class="iconAndNameWrapper"><span class="name" data-did="${NORTH}">North</span></span></a>
    <span class="coordinatesGrid"><span class="coordinates coordinatesWrapper"><span class="coordinateX">(130</span><span class="coordinatePipe">|</span><span class="coordinateY">−89)</span></span></span></div></div>`;
  html = html.replace('<div class="dropContainer" data-sortindex="1">', north + '<div class="dropContainer" data-sortindex="1">');
  const n = stockOf();
  html = html.replace('storage: {"l1": 800,"l2": 800,"l3": 800,"l4": 800}', `storage: {"l1": ${n},"l2": ${n},"l3": ${n},"l4": ${n}}`).replace(/id="l([1-4])" class="value">800</g, `id="l$1" class="value">${n}<`);
  // The hero's level-up mark, until the points are saved.
  if (!world.heroSaved) html = html.replace('<body', '<body data-x="1"').replace(/(<body[^>]*>)/, '$1<div id="topBarHero"><i class="levelUp show"></i></div>');
  return html;
}
const withContent = (inner) => read('BuildingLayout/Buildings.html').replace('<div id="contentOuterContainer" class="">', `<div id="contentOuterContainer" class=""><div id="content" class="build">${inner}</div>`);
const slot = (n, gid, name, level) => [new RegExp(`class="buildingSlot a${n} g0 aid${n} gaul" data-aid="${n}" data-gid="0"([^>]*) data-name=""><a href="${HOST.replace(/\./g, '\\.')}/build\\.php\\?id=${n}" class="emptyBuildingSlot"></a>`),
  `class="buildingSlot a${n} g${gid} aid${n} gaul" data-aid="${n}" data-gid="${gid}"$1 data-name="${name}"><a href="${HOST}/build.php?id=${n}&amp;gid=${gid}" class="level colorLayer good aid${n} gaul" data-level="${level}"><div class="labelLayer">${level}</div></a>`];
const fields5 = (html) => html.replace(/(<div id="resourceFieldContainer"[\s\S]*?<\/div>\s*<\/div>)/, (m) => m.replace(/\blevel\d+\b/g, 'level5').replace(/<div class="labelLayer">\d+<\/div>/g, '<div class="labelLayer">5</div>'));
function dorf2() {
  let html = read('BuildingLayout/Buildings.html');
  const slots = world.active === NORTH ? [slot(24, 17, 'Marketplace', 5), slot(22, 19, 'Barracks', 3)] : [slot(22, 19, 'Barracks', 5)];
  for (const [re, to] of slots) html = html.replace(re, to);
  return sidebar(html);
}
function market() {
  return sidebar(withContent(`<div id="build" class="gid17 level5"><form onsubmit="return false"><span class="merchantsAvailable">${world.free}/2</span> <div id="merchantCapacityValue">500</div>
    <input id="r1" name="r1"><input id="r2" name="r2"><input id="r3" name="r3"><input id="r4" name="r4"><input id="xCoordInput" name="x"><input id="yCoordInput" name="y">
    <div id="check"></div><button id="enabledButton" class="textButtonV1 green" type="button">Prepare</button></form>
    <script>document.getElementById('enabledButton').addEventListener('click', function () {
      var q = ['r1','r2','r3','r4','xCoordInput','yCoordInput'].map(function (id) { return id + '=' + encodeURIComponent(document.getElementById(id).value); }).join('&');
      if (!document.getElementById('target_validate')) document.getElementById('check').innerHTML = '<table id="target_validate"><tr><td>Main</td></tr></table>';
      else location.href = '/building?gid=17&t=5&send=1&' + q; });</script></div>`));
}
function heroPage() {
  const v = world.heroSaved || { power: 10, offBonus: 0, defBonus: 0, productionPoints: 30 };
  return sidebar(withContent(`<div id="heroV2"><div class="attributeBox"><div class="heroAttributes"><div class="attributes formV2">
    ${['power', 'offBonus', 'defBonus', 'productionPoints'].map((k) => `<input name="${k}" value="${v[k]}">`).join('')}
    <button id="savePoints" class="textButtonV2 green" type="button">Save</button></div></div></div></div>
    <script>document.getElementById('savePoints').addEventListener('click', function () {
      var q = ['power','offBonus','defBonus','productionPoints'].map(function (k) { return k + '=' + document.querySelector('input[name="' + k + '"]').value; }).join('&');
      location.href = '/hero/attributes?saved=1&' + q; });</script>`));
}
const co = (x, y) => `<span class="coordinates coordinatesWrapper"><span class="coordinateX">(${x}</span><span class="coordinatePipe">|</span><span class="coordinateY">${y})</span></span>`;
const profilePage = (uid) => sidebar(withContent(`<h1 class="titleInHeader">Player profile - Sleepy</h1><table id="details"><tr><th>Population</th><td>300</td></tr></table>
  <table id="villages"><tbody><tr><td class="name"><a href="#">Sleepy Hollow</a></td><td class="inhabitants">300</td><td>${co(132, -90)}</td></tr></tbody></table>`));
function page_(u) {
  const p = u.pathname;
  const q = (k) => u.searchParams.get(k);
  if (q('newdid')) world.active = q('newdid');
  if (p === '/resource' || p === '/dorf1.php') return sidebar(fields5(read('BuildingLayout/Resources.html')));
  if (p === '/village' || p === '/dorf2.php') return dorf2();
  if (p.startsWith('/hero/attributes')) {
    if (q('saved')) world.heroSaved = { power: Number(q('power')), offBonus: Number(q('offBonus')), defBonus: Number(q('defBonus')), productionPoints: Number(q('productionPoints')) };
    return heroPage();
  }
  if (/^\/profile\/\d+$/.test(p)) { world.profiles.push(p); return profilePage(p.split('/')[2]); }
  if (p === '/building' || p === '/build.php') {
    if (q('gid') === '17' && q('t') === '5') {
      if (q('send')) { world.sent.push({ from: world.active, r1: q('r1'), x: q('xCoordInput'), y: q('yCoordInput') }); world.free = 1; }
      return market();
    }
    if (q('gid') === '19') return sidebar(read('TrainTroop/BarrackPage.html'));
    return sidebar(read('Upgrade/CroplandConstructed.html'));
  }
  return sidebar(withContent('<div></div>'));
}
const MOVED = { '/dorf1.php': '/resource', '/dorf2.php': '/village', '/build.php': '/building' };

(async () => {
  const certDir = path.join(OUT, 'cert');
  fs.mkdirSync(certDir);
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${certDir}/key.pem -out ${certDir}/cert.pem -days 2 -subj "/CN=*.travian.com" -addext "subjectAltName=DNS:*.travian.com,DNS:*.x3.international.travian.com" 2>/dev/null`);
  const server = https.createServer({ key: fs.readFileSync(`${certDir}/key.pem`), cert: fs.readFileSync(`${certDir}/cert.pem`) }, (req, res) => {
    const u = new URL(req.url, HOST);
    // The saved pages' own files (scripts, styles, frames): not served.
    if (/\.(png|gif|jpg|css|js|ico|svg|woff2?|download|html)$/.test(u.pathname) || /_files\//.test(decodeURIComponent(u.pathname))) { res.writeHead(404); return res.end(); }
    req.on('data', () => {});
    req.on('end', () => {
      world.reqs.push(`${(Date.now() % 1000000)} ${req.method} ${u.pathname}${u.search} [${world.active}]`);
      // A troop order (the barracks form posts): count North's.
      if (req.method === 'POST' && world.active === NORTH) world.trainsNorth++;
      if (MOVED[u.pathname] && req.method !== 'POST') { res.writeHead(302, { Location: `${HOST}${MOVED[u.pathname]}${u.search}` }); return res.end(); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(page_(u));
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const ctx = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(OUT, 'profile-')), {
    headless: false, ignoreHTTPSErrors: true, viewport: { width: 1366, height: 1000 },
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, `--host-resolver-rules=MAP *.travian.com 127.0.0.1:${server.address().port}`, '--no-proxy-server', '--ignore-certificate-errors'],
  });
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
  for (const p of [`dorf1.php?newdid=${MAIN}`, `dorf2.php?newdid=${MAIN}`, `dorf1.php?newdid=${NORTH}`, `dorf2.php?newdid=${NORTH}`, `dorf1.php?newdid=${MAIN}`]) {
    await game.goto(`${HOST}/${p}`, { waitUntil: 'domcontentloaded' }); await sleep(1500);
  }
  await game.close();
  // A nearby player's village on the map store (the map gave no population).
  await sw.evaluate(() => chrome.storage.local.set({ mapVillages: { '132|-90': { x: 132, y: -90, did: 999, uid: 555, pop: null, seen: [] } } }));
  const dash = await ctx.newPage();
  await dash.goto(`chrome-extension://${extId}/dashboard/dashboard.html#empire`); await sleep(1500);
  const cmd = (name, args) => dash.evaluate(([n, a]) => chrome.runtime.sendMessage({ type: 'COMMAND', name: n, args: a }), [name, args]);
  await cmd('saveSettings', { settings: { brain: { enabled: true, supply: true, transfers: true, roles: { [MAIN]: 'military', [NORTH]: 'economy' } }, hero: { points: 'fight', revive: true }, farmTune: { enabled: true, radius: 20 }, pauseWhenPlaying: false, watchEnabled: true } });
  // Let the villages be read once with the brain on (its purses start).
  await cmd('runNow', {});
  await waitFor(async () => {
    const x = await store();
    return world.sent.length > 0 && world.heroSaved && x.players && x.players[555] && ((x.log || []).some((e) => /البطل: وُزّعت/.test(e.msg)));
  }, 240000);
  const st = await store();
  console.log('    sent', JSON.stringify(world.sent), '| hero', JSON.stringify(world.heroSaved), '| profiles', JSON.stringify(world.profiles), '| north troop orders', world.trainsNorth);
  if (!world.sent.length) {
    const n = (st.villages || {})[NORTH] || {};
    console.log('    debug round', JSON.stringify(st.empire), '\n    north lanes', JSON.stringify(n.lanes), 'res', JSON.stringify(n.resources), 'pending', JSON.stringify(n.transferPending), '\n    log', JSON.stringify((st.log || []).slice(0, 25).map((e) => e.msg)), '\n    reqs\n     ', world.reqs.slice(-90).join('\n      '));
  }
  check('supply: North sent its army share to Main with the marketplace', world.sent.length >= 1 && world.sent[0].from === NORTH && world.sent[0].x === '134' && world.sent[0].y === '-91', world.sent);
  check('North, supplying, didn\'t train troops itself', world.trainsNorth === 0, world.trainsNorth);
  check('hero: 4 new points into fighting strength, saved', world.heroSaved && world.heroSaved.power === 14 && world.heroSaved.productionPoints === 30, world.heroSaved);
  check('a nearby player\'s profile read: their village\'s population on the map store', st.players && st.players[555] && st.players[555].pop === 300 && st.mapVillages['132|-90'].pop === 300, [st.players, st.mapVillages && st.mapVillages['132|-90']]);
  check('the coordinator recorded the round', st.empire && (st.empire.run || []).length > 0, st.empire);
  const log = (st.log || []).map((e) => e.msg);
  check('logs say what happened', log.some((m) => /تموين لقرية الجيش/.test(m)) && log.some((m) => /البطل: وُزّعت/.test(m)), log.slice(0, 8));
  await dash.reload(); await sleep(2500);
  const cards = await dash.textContent('#empCards');
  const round = await dash.textContent('#empRound');
  const table = await dash.textContent('#empTable');
  console.log('    cards:', cards.replace(/\s+/g, ' ').slice(0, 300));
  check('Empire page: production, army, farms, supply, hero, players', /الإنتاج/.test(cards) && /الجيش/.test(cards) && /قرى التموين/.test(cards) && /البطل/.test(cards), cards.slice(0, 300));
  check('Empire page: this round and the villages', round.length > 5 && /North/.test(table) && /تموّن الجيش/.test(table), [round.slice(0, 120), table.slice(0, 200)]);
  await ctx.close();
  server.close();
  console.log(failed ? `${failed} FAILED` : 'ALL PASS');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
