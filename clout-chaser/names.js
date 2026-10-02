/* Clout Chaser — Store-safe names. Swaps every parody of a real person, brand or club for an original name
   and drops the look-alike logos. On by default in the app-store build (window.STORE_BUILD), optional on the web. */
'use strict';

const SAFE_KEY = 'clout-chaser-safe-names';
const safeNames = (() => { try { const v = localStorage.getItem(SAFE_KEY); return v == null ? !!window.STORE_BUILD : v === '1'; } catch (e) { return !!window.STORE_BUILD; } })();

const SAFE_NPCS = {
  taylor: ['Harper Lane', 'harperlane'], elon: ['Nash Voltaire', 'nashvoltaire'], zuck: ['Miles Metzger', 'milesmetz'],
  kym: ['Kiki Valentina', 'kikivalentina'], kylie: ['Kassidy Rae', 'kassidyrae'], ronaldough: ['Rafael Duarte', 'rafaduarte7'],
  messy: ['Mateo Ferrán', 'mateoferran10'], mrfeast: ['MegaMax', 'megamaxhq'], drayke: ['Six Sunset', 'sixsunset'],
  kendrik: ['Kofi Lamont', 'kofilamont'], rihannah: ['Rumi Fontaine', 'rumifontaine'], beyonslay: ['Queen Solenne', 'solenne'],
  beaver: ['Jayden Beck', 'jaydenbeck'], venti: ['Ari Bellamy', 'aribellamy'], pebble: ['Duke "The Boulder" Mason', 'theboulder'],
  loganp: ['Colt Ridge', 'coltridge'], jakep: ['Jett Ridge', 'jettridge'], senate: ['Kenzo Steele', 'kenzosteele'],
  snoop: ['DJ Mellow', 'djmellow'], eyelash: ['Willow Grey', 'willowgrey'], badbunni: ['El Tigre', 'eltigre'],
  selina: ['Celestine Vega', 'celestinevega'], zendayah: ['Zara Monroe', 'zaramonroe'], oprah: ['Grace Holloway', 'graceholloway'],
  khaby: ['Kobi Still', 'kobistill'], lebrawn: ['Leon Hartley', 'leonhartley'], shakirra: ['Marisol', 'marisolmusic'],
  charlie: ['Callie Dawson', 'calliedawson'], doja: ['Dolly Kix', 'dollykix'], cardi: ['Coco Blaze', 'cocoblaze'],
  nicki: ['Nika Royale', 'nikaroyale'], sped: ['iBlastBenji', 'iblastbenji'],
};
const SAFE_COS = {
  windys: ["Breezy's", 'breezys'], mcdougals: ['Burger Barn', 'burgerbarn'], nikey: ['Velocity Athletics', 'velocityath'],
  pear: ['Lumen', 'lumentech'], tezla: ['Voltra', 'voltra'], netflux: ['BingeBox', 'bingebox'], starbux: ['Bean Scene', 'beanscene'],
  redbully: ['Rocket Fuel', 'rocketfuel'], cocakola: ['FizzCo Cola', 'fizzco'], amazin: ['ParcelPlanet', 'parcelplanet'],
  gucchi: ['Maison Vellini', 'vellini'], duolinguo: ['LingoLeaf', 'lingoleaf'],
};
const SAFE_CLUBS = {
  rmd: 'Royal Madera', bar: 'Costa Brava FC', mcy: 'Northbridge City', liv: 'Mersey Rovers', ars: 'Thames Athletic',
  mun: 'Redbrick United', che: 'Kingsbridge Blues', bay: 'Alpenstadt FC', psg: 'Seine Saint-Clair', juv: 'Po Valley FC',
  int: 'Navigli FC', acm: 'Sforza Milano', bvb: 'Ruhrpott SV', ajx: 'Grachten FC', ben: 'Tejo United', nas: 'Desert Falcons',
};
const SAFE_ASSETS = { pear: ['Lumen Tech', 'LUMN'], tezla: ['Voltra', 'VLTR'], nflx: ['BingeBox', 'BNGE'], amzon: ['ParcelPlanet', 'PRCL'] };
/* hardcoded words that still point at real things */
const SAFE_EXTRA = [['Cybertruck', 'Voltra pickup'], ['Paramountain', 'Summit Peak'], ['Amazoom', 'ParcelPlanet'], ['Netflux', 'BingeBox'], ['Tezla', 'Voltra'], ['Pear 17', 'Lumen 17'], ['Pear Inc.', 'Lumen Tech'], ['Kola', 'Fizz'], ['Swifties', 'Laners']];

let SAFE_RE = [];
function applySafeNames() {
  const pairs = [];
  const swap = (obj, id, name, handle) => { const o = obj[id]; if (!o) return; pairs.push([o.name, name]); if (handle && o.handle) pairs.push(['@' + o.handle, '@' + handle]); /* bare handles double as ids, so only @mentions */ o.name = name; if (handle && o.handle) o.handle = handle; };
  for (const [id, [n, h]] of Object.entries(SAFE_NPCS)) swap(NPCS, id, n, h);
  for (const [id, [n, h]] of Object.entries(SAFE_COS)) { swap(COMPANIES, id, n, h); if (BRANDS[id]) BRANDS[id].name = n; }
  for (const [id, n] of Object.entries(SAFE_CLUBS)) if (FC_TEAMS[id]) { pairs.push([FC_TEAMS[id][0], n]); FC_TEAMS[id][0] = n; }
  for (const [id, [n, t]] of Object.entries(SAFE_ASSETS)) if (ASSETS[id]) { pairs.push([ASSETS[id].name, n], [ASSETS[id].tick, t]); ASSETS[id].name = n; ASSETS[id].tick = t; }
  pairs.push(...SAFE_EXTRA);
  for (const k of Object.keys(CO_LOGOS)) delete CO_LOGOS[k]; // generic logos instead of look-alikes
  pairs.sort((a, b) => b[0].length - a[0].length);
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  SAFE_RE = pairs.filter(([a, b]) => a && a !== b && a.length > 2).map(([a, b]) => [new RegExp(`${a[0] === '@' ? '' : '(?<![\\w@])'}${escRe(a)}(?!\\w)`, 'g'), b]);
  // text baked into data: celebrity lines, brand posts, market news
  const fix = (s) => (typeof s === 'string' ? safe(s) : s);
  for (const N of Object.values(NPCS)) for (const k of Object.keys(N)) if (Array.isArray(N[k])) N[k] = N[k].map(fix);
  for (const C of Object.values(COMPANIES)) if (C.posts) C.posts = C.posts.map(fix);
  MARKET_NEWS.forEach((m) => { m[2] = fix(m[2]); });
  for (const a of Object.values(ASSETS)) a.desc = fix(a.desc);
}
/* last line of defence for anything generated before the switch (old saves) or written inside functions */
function safe(html) { if (!safeNames || !SAFE_RE.length || typeof html !== 'string') return html; for (const [re, to] of SAFE_RE) html = html.replace(re, to); return html; }
function setSafeNames(on) { try { localStorage.setItem(SAFE_KEY, on ? '1' : '0'); } catch (e) { /* private mode */ } }
if (safeNames) applySafeNames();
