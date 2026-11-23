// 2.12: player profiles, the hero's attribute page, map villages with ids
// only. Run from travian-extension/: node tests/parser-empire.cjs
// (jsdom from JSDOM_DIR, default: the session scratchpad's jsdom-env).
const path = require('path');
const { JSDOM } = require(path.join(process.env.JSDOM_DIR || '/tmp/claude-0/-home-user-ss/21855661-2e08-5d01-a58a-b58743978a7e/scratchpad/jsdom-env', 'node_modules/jsdom'));
const P = require(path.join(__dirname, '..', 'src/parser.js'));
let fails = 0;
const eq = (name, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${JSON.stringify(got)}${ok ? '' : ` (want ${JSON.stringify(want)})`}`); };
const H = 'https://ts30.x3.international.travian.com';
const shell = (inner, heroMark = false) => `<html><body><div id="stockBar"></div><div id="topBarHero">${heroMark ? '<i class="levelUp show"></i>' : ''}<div class="heroStatus"><a title="home"><i class="heroHome"></i></a></div></div><div id="content">${inner}</div></body></html>`;
const page = (html, u) => P.parsePage(new JSDOM(html, { url: H + u }).window.document, new URL(H + u));
const co = (x, y) => `<span class="coordinates coordinatesWrapper"><span class="coordinateX">(&#x202d;${x}&#x202c;</span><span class="coordinatePipe">|</span><span class="coordinateY">&#x202d;${y}&#x202c;)</span></span>`;

const profile = shell(`<h1 class="titleInHeader">Player profile - Sleepy</h1>
  <table id="details"><tr><th>Rank</th><td>120</td></tr><tr><th>Population</th><td>&#x202d;412&#x202c;</td></tr></table>
  <table id="villages"><thead><tr><th>Name</th><th>Inhabitants</th><th>Coordinates</th></tr></thead><tbody>
    <tr><td class="name"><a href="/karte.php?x=3&y=-4">Home</a></td><td class="inhabitants">&#x202d;250&#x202c;</td><td class="coords">${co(3, '&minus;4')}</td></tr>
    <tr><td class="name"><a href="/karte.php?x=5&y=6">Second</a></td><td class="inhabitants">162</td><td class="coords">${co(5, 6)}</td></tr>
  </tbody></table>`);
let r = page(profile, '/profile/77');
eq('profile page type and uid', [r.type, r.profile && r.profile.uid], ['profile', 77]);
eq('profile: name, total population', [r.profile.name, r.profile.pop], ['Sleepy', 412]);
eq('profile: villages with coordinates and population', r.profile.villages.map((v) => [v.x, v.y, v.pop, v.name]), [[3, -4, 250, 'Home'], [5, 6, 162, 'Second']]);
// A page without class names on the cells: the number cell of the row.
const bare = profile.replace(/ class="(inhabitants|name|coords)"/g, '').replace(/<table id="details">[\s\S]*?<\/table>/, '');
r = page(bare, '/profile/77');
eq('profile without cell classes: population from the number cell; total from the villages', [r.profile.villages.map((v) => v.pop), r.profile.pop], [[250, 162], 412]);
eq('old address spieler.php?uid=', page(profile, '/spieler.php?uid=88').profile.uid, 88);

const attrs = shell(`<div id="heroV2"><div class="attributeBox"><div class="heroAttributes"><div class="attributes formV2">
  <input name="power" value="10"><input name="offBonus" value="0"><input name="defBonus" value="2"><input name="productionPoints" value="30">
  <button id="savePoints" class="textButtonV2 green">Save</button></div></div></div></div>`, true);
r = page(attrs, '/hero/attributes');
eq('hero attributes page: inputs and save', [r.type, r.heroAttributes], ['heroAttributes', { power: 10, offBonus: 0, defBonus: 2, productionPoints: 30, save: true }]);
eq('level-up mark seen on any page', r.account.hero.levelUp, true);
const dead = shell('<p></p>').replace('<i class="heroHome"></i>', '<i class="heroDead"></i>');
eq('a dead hero', page(dead, '/dorf1.php').account.hero.dead, true);

const tiles = [
  { position: { x: 78, y: 61 }, uid: 1, did: 19923, title: '{k.regionTooltip} Bastarnae', text: 'زيادة إنتاج نقاط النصر' },
  { position: { x: 79, y: 61 }, title: '{k.regionTooltip} Bastarnae', text: 'زيادة إنتاج نقاط النصر' },
  { position: { x: 78, y: 60 }, uid: 2688, aid: 23, did: 21021, title: '{k.regionTooltip} Bastarnae', text: 'x' },
];
eq('map villages with ids only (no population) count; plain land doesn\'t', P.villagesFromTiles(tiles).map((v) => [v.x, v.y, v.uid, v.did, v.pop]), [[78, 61, 1, 19923, null], [78, 60, 2688, 21021, null]]);
console.log(fails ? `FAILED ${fails}` : 'ALL OK');
process.exit(fails ? 1 : 0);
