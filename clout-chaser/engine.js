/* Clout Chaser — simulation engine */
'use strict';

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const chance = (p) => Math.random() < p;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function fmt(n) {
  n = Math.round(n || 0);
  const a = Math.abs(n), s = n < 0 ? '−' : '';
  const f = (v, u) => {
    const d = v >= 100 ? 0 : 1;
    return s + v.toFixed(d).replace(/\.0$/, '') + u;
  };
  if (a >= 1e9) return f(a / 1e9, 'B');
  if (a >= 1e6) return f(a / 1e6, 'M');
  if (a >= 1e4) return f(a / 1e3, 'K');
  return s + a.toLocaleString('en-US');
}
const money = (n) => (n < 0 ? '−$' : '$') + fmt(Math.abs(n));
const signed = (n) => (n >= 0 ? '+' : '−') + fmt(Math.abs(n));
const signed1 = (n) => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(1).replace(/\.0$/, '');
const signedMoney = (n) => (n >= 0 ? '+$' : '−$') + fmt(Math.abs(n));
const initials = (name) => name.replace(/["']/g, '').split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ---------- state ---------- */
let S = null;
const SAVE_KEY = 'clout-chaser-save-v1';

function newGame(o) {
  S = {
    v: 1, name: o.name, handle: o.handle, niche: o.niche, diff: o.diff, color: o.color,
    day: 1, energy: 100, money: 250, rep: 50, heat: 0, stress: 10,
    platforms: {}, skills: {}, owned: {}, team: {}, fake: 0,
    posts: [], feed: [], npcs: {}, partner: null, collab: null,
    inbox: [], deals: [], history: [], achievements: {}, log: [], news: [], trends: [], algo: {},
    merch: null, product: null, podcast: null, savings: 0,
    stats: { posts: 0, viral: 0, flops: 0, scandals: 0, cancels: 0, collabs: 0, celebCollabs: 0, deals: 0, dealsFailed: 0, earned: 0, donated: 0,
      streams: 0, subathons: 0, feuds: 0, awards: 0, noms: 0, bestViews: 0, bought: 0, exposed: 0, burnouts: 0, breakups: 0, dates: 0,
      giveaways: 0, meetups: 0, episodes: 0, ragebait: 0, wholesome: 0, vacations: 0, debtDays: 0, comebacks: 0 },
    flags: {}, queue: [], uid: 1, lastPostDay: 0, shadowbanUntil: 0, hackedUntil: 0, travelUntil: 0, algoBoost: {},
    settings: { sound: true }, won: false, over: false, dayStart: null, weekStart: null, created: Date.now(),
  };
  for (const [id, p] of Object.entries(PLATFORMS)) S.platforms[id] = { unlocked: p.unlock === 0, followers: p.start, eng: p.baseEng };
  for (const k of Object.keys(COURSES)) S.skills[k] = { lvl: 1, xp: 0 };
  for (const [id, n] of Object.entries(NPCS)) S.npcs[id] = { followers: n.followers, rel: n.niche === o.niche ? 5 : 0, following: false, followsYou: false, feud: false, rep: n.rep };
  for (let i = 0; i < 5; i++) addTrend();
  rollAlgo();
  for (let i = 0; i < 8; i++) npcPost(pick(Object.keys(NPCS)), true);
  mail({ type: 'system', from: 'Pixgram Team', subject: 'Welcome to Pixgram!', body: `Hey ${o.name}, your account @${o.handle} is live. Post consistently, ride trends, and don't feed the trolls. Your first 1,000 followers are the hardest.` });
  mail({ type: 'npc', npc: o.niche === 'gaming' ? 'milo' : 'skye', subject: 'hey neighbor', body: 'Saw you just started posting. The first month is rough, keep going! Maybe we collab once you get a few more followers?' });
  mail({ type: 'fan', from: '@' + fanHandle(), subject: 'first!!', body: "I don't know you yet but your vibe is immaculate. Following." });
  S.notifs = []; S.bio = `${NICHES[o.niche].name} creator. Posting my way to the top.`;
  S.clashes = []; S.aesthetic = pick(Object.keys(FILTERS));
  S.country = o.country || 'us'; S.faceSeed = o.faceSeed || o.name; S.tea = []; S.visited = [S.country];
  S.geo = { [S.country]: 0.62 };
  shuffle(['us', 'in', 'br', 'gb', 'mx', 'ph', 'id', 'ca', 'ng', 'de', 'fr', 'es', 'tr', 'sa', 'ae', 'eg', 'jp', 'kr', 'au', 'it', 'ar', 'co'].filter((c) => c !== S.country)).slice(0, 6).forEach((c, i) => { S.geo[c] = [0.12, 0.08, 0.06, 0.05, 0.04, 0.03][i]; });
  for (const id of shuffle(Object.keys(COMPANIES)).slice(0, 3)) companyPost(id);
  startClash(true);
  newChallenge();
  notify('system', null, `Welcome to the timeline, ${o.name}. Your first post is waiting.`);
  S.dayStart = snap(); S.weekStart = snap();
  pushHistory();
  log(`Account @${o.handle} created. Niche: ${NICHES[o.niche].name}.`, 'gold');
  news(`New creator @${o.handle} joins Pixgram. Nobody notices yet.`, true);
}

function snap() { return { f: totalFollowers(), money: S.money, rep: S.rep, heat: S.heat, day: S.day, posts: S.stats.posts, earned: S.stats.earned }; }
function pushHistory() {
  S.history.push({ d: S.day, f: Math.round(totalFollowers()), rep: +S.rep.toFixed(1), m: Math.round(S.money), e: +engRate().toFixed(2), h: Math.round(S.heat) });
  if (S.history.length > 400) S.history.splice(0, S.history.length - 400);
}

function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }
function loadSave() {
  try { const raw = localStorage.getItem(SAVE_KEY); if (!raw) return null; const s = JSON.parse(raw); return s && s.v === 1 ? migrate(s) : null; } catch (e) { return null; }
}
/* Fill in fields added after a save was made */
function migrate(s) {
  s.notifs = s.notifs || [];
  s.bio = s.bio || `${NICHES[s.niche].name} creator. Posting my way to the top.`;
  (s.feed || []).forEach((f) => { if (!f.views) f.views = Math.round(f.likes * 25); if (!f.reposts) f.reposts = Math.round(f.likes * 0.04); });
  (s.posts || []).forEach((p) => (p.comms || []).forEach((c) => { if (c.likes === undefined) c.likes = 0; }));
  for (const [id, n] of Object.entries(NPCS)) if (!s.npcs[id]) s.npcs[id] = { followers: n.followers, rel: 0, following: false, followsYou: false, feud: false, rep: n.rep };
  s.clashes = s.clashes || [];
  s.country = s.country || 'us'; s.faceSeed = s.faceSeed || s.name; s.tea = s.tea || []; s.visited = s.visited || [s.country];
  if (!s.geo) { s.geo = { [s.country]: 0.7, us: 0.1, br: 0.08, in: 0.07, gb: 0.05 }; }
  s.aesthetic = s.aesthetic || 'neon';
  if (!s.challenge) { const prev = S; S = s; newChallenge(); S = prev; }
  return s;
}
function notify(type, who, text, extra = {}) {
  S.notifs.unshift({ id: uid(), d: S.day, type, who, text, read: false, ...extra });
  if (S.notifs.length > 150) S.notifs.length = 150;
}
function wipeSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }

/* ---------- derived stats ---------- */
const uid = () => S.uid++;
const unlockedIds = () => Object.keys(PLATFORMS).filter((id) => S.platforms[id].unlocked);
const totalFollowers = () => unlockedIds().reduce((a, id) => a + S.platforms[id].followers, 0);
function realRatio() { const t = totalFollowers(); return t > 0 ? clamp(1 - S.fake / t, 0.05, 1) : 1; }
function engRate() {
  let f = 0, w = 0;
  for (const id of unlockedIds()) { const p = S.platforms[id]; f += p.followers; w += p.followers * p.eng; }
  return f ? (w / f) * realRatio() : 0;
}
function tierIndex(t = totalFollowers()) { let i = 0; TIERS.forEach((x, k) => { if (t >= x.min) i = k; }); return i; }
const tier = (t) => TIERS[tierIndex(t)];
const diffM = () => ({ chill: 1.35, normal: 1, brutal: 0.75 }[S.diff] || 1);
const sev = () => ({ chill: 0.7, normal: 1, brutal: 1.4 }[S.diff] || 1);
const skillLvl = (k) => S.skills[k].lvl;
function maxEnergy() { return 100 + (S.bonusMaxE || 0) + (S.team.assistant ? 20 : 0) + (S.owned.mansion ? 10 : 0) + (S.owned.island ? 10 : 0); }
const energyCap = () => maxEnergy() + 60; // rewards can overcharge you past your normal max
function gearQ(pid) {
  let q = 0;
  for (const it of SHOP) if (S.owned[it.id] && it.q && (!it.plats || it.plats.includes(pid))) q += it.q;
  if (S.owned.drone && S.niche === 'travel' && (pid === 'tube' || pid === 'clipz')) q += 0.1;
  if (S.team.editor && (pid === 'clipz' || pid === 'tube' || pid === 'pix')) q += 0.1;
  return Math.min(q, 0.35); // gear helps, but talent still matters
}
function reachBonus() { let r = 0; for (const it of SHOP) if (S.owned[it.id] && it.reach) r += it.reach; return r; }
function repLabel(r = S.rep) { return r >= 85 ? 'Beloved' : r >= 68 ? 'Respected' : r >= 50 ? 'Liked' : r >= 35 ? 'Mixed' : r >= 20 ? 'Sketchy' : 'Toxic'; }
function repClass(r = S.rep) { return r >= 60 ? 'good' : r >= 35 ? 'warn' : 'bad'; }
function heatLabel(h = S.heat) { return h >= 85 ? 'Imploding' : h >= 60 ? 'Scorching' : h >= 35 ? 'Heated' : h >= 12 ? 'Buzzing' : 'Calm'; }
function stressLabel(s = S.stress) { return s >= 85 ? 'Burning out' : s >= 60 ? 'Frazzled' : s >= 35 ? 'Busy' : 'Chill'; }
function relLabel(r) { return r <= -60 ? 'Nemesis' : r <= -25 ? 'Rival' : r < 10 ? 'Stranger' : r < 35 ? 'Acquaintance' : r < 65 ? 'Friend' : 'Bestie'; }
const weekday = (d = S.day) => WEEKDAYS[(d - 1) % 7];
const npcName = (id) => NPCS[id].name;

/* ---------- mutations ---------- */
function changeRep(d) { if (d > 0) d *= clamp(1.25 - S.rep / 100, 0.15, 1); S.rep = clamp(S.rep + d, 0, 100); } // goodwill is harder to earn at the top
function changeRel(id, d) { const n = S.npcs[id]; n.rel = clamp(n.rel + d, -100, 100); }
function addFollowers(n) {
  const ids = unlockedIds(); const tot = totalFollowers();
  for (const id of ids) {
    const p = S.platforms[id];
    const share = tot > 0 ? p.followers / tot : 1 / ids.length;
    p.followers = Math.max(0, p.followers + n * share);
  }
}
function addFollowersPct(pct) {
  for (const id of unlockedIds()) S.platforms[id].followers = Math.max(0, S.platforms[id].followers * (1 + pct));
  if (pct < 0) S.fake = Math.max(0, S.fake * (1 + pct));
}
function spend(n) { if (S.money < n) return false; S.money -= n; return true; }
/* Good things give you a second wind. Every reward shows up as an energy burst in the UI. */
function gainEnergy(n, reason) {
  if (!S || n <= 0) return 0;
  const before = S.energy;
  S.energy = Math.min(energyCap(), S.energy + n);
  const got = Math.round(S.energy - before);
  if (got > 0) {
    S.stats.energyEarned = (S.stats.energyEarned || 0) + got;
    if (typeof energyBurst === 'function') energyBurst(got, reason);
  }
  return got;
}
const FOLLOWER_MILESTONES = [500, 1e3, 2500, 5e3, 1e4, 25e3, 5e4, 1e5, 25e4, 5e5, 1e6, 25e5, 5e6, 1e7, 25e6, 5e7, 1e8, 25e7, 5e8, 1e9];

function log(msg, cls = '') { S.log.unshift({ d: S.day, m: msg, c: cls }); if (S.log.length > 80) S.log.length = 80; }
function news(msg, you = false) { S.news.unshift({ d: S.day, m: msg, you }); if (S.news.length > 80) S.news.length = 80; }
function mail(m) {
  m.id = uid(); m.day = S.day; m.read = false; m.done = false;
  S.inbox.unshift(m);
  if (S.inbox.length > 60) S.inbox = S.inbox.filter((x, i) => i < 50 || !x.done);
  return m;
}
function fanHandle() { return pick(HANDLE_A) + '.' + pick(HANDLE_B) + (chance(0.6) ? ri(1, 99) : ''); }

/* Applies an effect bundle and returns chips [label, text, good] for display */
function applyFx(e = {}) {
  const out = [];
  const f0 = totalFollowers();
  if (e.fp) addFollowersPct(e.fp > 0 ? e.fp * diffM() : e.fp * sev());
  if (e.f) addFollowers(e.f > 0 ? e.f * diffM() : e.f);
  const df = Math.round(totalFollowers() - f0);
  if (df) out.push(['Followers', signed(df), df > 0]);
  if (e.rep) {
    let d = e.rep;
    if (d < 0) { d *= sev(); if (S.team.pr) d *= 0.6; }
    const r0 = S.rep; changeRep(d); const dd = S.rep - r0;
    if (Math.abs(dd) >= 0.05) out.push(['Reputation', signed1(dd), dd > 0]);
  }
  if (e.heat) {
    let d = e.heat; if (d > 0 && S.team.pr) d *= 0.7;
    const h0 = S.heat; S.heat = clamp(S.heat + d, 0, 100); const dd = S.heat - h0;
    if (Math.abs(dd) >= 0.5) out.push(['Heat', signed1(dd), dd < 0]);
  }
  if (e.money) {
    let d = e.money; if (d < 0 && e.legal && S.team.lawyer) d *= 0.5;
    S.money += d; if (d > 0) S.stats.earned += d;
    out.push(['Money', signedMoney(d), d > 0]);
  }
  if (e.stress) { const s0 = S.stress; S.stress = clamp(S.stress + e.stress, 0, 100); const dd = S.stress - s0; if (dd) out.push(['Stress', signed1(dd), dd < 0]); }
  if (e.energy) { const e0 = S.energy; S.energy = clamp(S.energy + e.energy, 0, maxEnergy() + 60); const dd = S.energy - e0; if (dd) out.push(['Energy', signed1(dd), dd > 0]); }
  if (e.rel) for (const [id, d] of Object.entries(e.rel)) { changeRel(id, d); out.push([NPCS[id].name.split(' ')[0], (d >= 0 ? '+' : '−') + Math.abs(d) + ' rel', d > 0]); }
  return out;
}

/* ---------- trends & algorithm ---------- */
function addTrend() {
  const used = new Set(S.trends.map((t) => t.tag));
  const pool = TREND_POOL.filter((t) => !used.has(t.tag));
  const t = pick(pool);
  S.trends.push({ tag: t.tag, niches: t.niches, edgy: !!t.edgy, born: S.day, life: ri(3, 6), hot: +rnd(0.85, 1.35).toFixed(2) });
}
function rollAlgo() {
  for (const id of Object.keys(PLATFORMS)) {
    let v = rnd(0.75, 1.3);
    if (S.algoBoost[id]) { v *= S.algoBoost[id]; delete S.algoBoost[id]; }
    S.algo[id] = +v.toFixed(2);
  }
}
function algoLabel(v) { return v >= 1.18 ? ['Hot', 'good'] : v >= 0.95 ? ['Normal', ''] : v >= 0.82 ? ['Sluggish', 'warn'] : ['Cold', 'bad']; }
const trendFits = (t) => t.niches.includes(S.niche) || t.niches.includes('all');
const trendFresh = (t) => clamp(1.35 - (S.day - t.born) * 0.15, 0.55, 1.35);

/* ---------- posting ---------- */
function topicsFor() {
  const niche = NICHES[S.niche];
  const t = [{ id: 'niche', label: `${niche.name} content`, reach: 1.05, eng: 1.1, rep: 0.3, heat: 0, viral: 0, phrase: pick(niche.phrase) }];
  S.trends.forEach((tr) => {
    const fit = trendFits(tr), fresh = trendFresh(tr);
    t.push({ id: 'trend:' + tr.tag, label: tr.tag, group: 'Trend', reach: (1.25 + (fit ? 0.35 : 0)) * fresh * tr.hot, eng: fit ? 1.12 : 0.95, rep: tr.edgy ? -1 : 0, heat: tr.edgy ? 6 : 0, viral: 0.025 * fresh, trend: tr.tag, phrase: tr.tag });
  });
  t.push({ id: 'personal', label: 'Storytime', reach: 1.1, eng: 1.25, rep: 0.3, heat: 1, viral: 0.01, phrase: pick(['my worst date ever', 'why I quit my job', 'the night I got locked out in Lisbon', 'my first viral flop']) });
  t.push({ id: 'bts', label: 'Behind the scenes', reach: 0.95, eng: 1.2, rep: 0.8, heat: 0, viral: 0, phrase: 'how I actually make content' });
  t.push({ id: 'cause', label: 'Social cause', reach: 0.85, eng: 1.0, rep: 2.5, heat: -2, viral: 0.01, phrase: pick(['mental health', 'ocean cleanups', 'local food banks', 'creator burnout']) });
  t.push({ id: 'hot', label: 'Controversial take', reach: 1.8, eng: 1.35, rep: -3, heat: 14, viral: 0.05, phrase: pick(HOT_TAKES) });
  if (S.owned.wardrobe || S.owned.car || S.owned.mansion || S.owned.jet) t.push({ id: 'flex', label: 'Luxury flex', reach: 1.4, eng: 0.9, rep: -1.5, heat: 4, viral: 0.02, phrase: S.owned.jet ? 'the jet' : S.owned.mansion ? 'the new house' : S.owned.car ? 'the new ride' : 'the new fits' });
  if (S.travelUntil >= S.day) { const tc = COUNTRIES[S.travelCountry || 'id']; t.push({ id: 'travel', label: `Trip to ${tc.name}`, reach: 1.35, eng: 1.2, rep: 0.3, heat: 1, viral: 0.03, phrase: `${tc.flag} ${tc.name} photo dump` }); }
  for (const x of (S.tea || [])) t.push({ id: 'tea:' + x.id, label: `Spill ${NPCS[x.npc].name.split(' ')[0]}'s tea`, group: 'Tea', reach: 2.4, eng: 1.5, rep: -3, heat: 20, viral: 0.1, tea: x.id, phrase: `${NPCS[x.npc].name} ${x.text}` });
  if (S.merch) t.push({ id: 'merch', label: 'Plug your merch', reach: 0.8, eng: 0.85, rep: -0.3, heat: 0, viral: 0, phrase: 'the new merch drop', merch: true });
  for (const d of S.deals.filter((x) => x.status === 'active')) {
    const b = BRANDS[d.brand];
    t.push({ id: 'deal:' + d.id, label: `Sponsored: ${b.name}`, group: 'Deal', reach: 0.85, eng: 0.8, rep: b.rep * 0.5, heat: b.shady ? 4 : 0, viral: 0, deal: d.id, phrase: b.name });
  }
  if (S.collab && S.collab.until >= S.day) t.push({ id: 'collab', label: `Collab with ${npcName(S.collab.npc)}`, group: 'Collab', reach: 1.6, eng: 1.3, rep: (S.npcs[S.collab.npc].rep - 55) / 20, heat: 0, viral: 0.06, collab: S.collab.npc, phrase: `a day with @${NPCS[S.collab.npc].handle}` });
  for (const [id, n] of Object.entries(S.npcs)) if (n.feud) t.push({ id: 'diss:' + id, label: `Diss ${NPCS[id].name}`, group: 'Feud', reach: 2.3, eng: 1.5, rep: -4, heat: 16, viral: 0.08, diss: id, phrase: '@' + NPCS[id].handle });
  for (const c of (S.clashes || []).filter((x) => !x.done)) t.push({ id: 'clash:' + c.id, label: `${NPCS[c.a].name.split(' ')[0]} vs ${NPCS[c.b].name.split(' ')[0]}`, group: 'Clash', reach: 1.9, eng: 1.35, rep: -0.3, heat: 5, viral: 0.06, clash: c.id, phrase: `the ${NPCS[c.a].name} vs ${NPCS[c.b].name} ${c.kind.toLowerCase()}` });
  if (S.partner) t.push({ id: 'couple', label: `Couple content`, group: 'Partner', reach: 1.7, eng: 1.35, rep: 0.5, heat: 2, viral: 0.05, phrase: `date night with @${NPCS[S.partner].handle}` });
  return t;
}

function tagValue(tag) {
  if (S.trends.some((t) => t.tag === tag)) return 0.08;
  if (NICHES[S.niche].tags.includes(tag)) return 0.06;
  if (GENERIC_TAGS.includes(tag)) return 0.02;
  return 0;
}

const hasLook = (format) => !!format && format !== 'take' && format !== 'thread';
const capWords = (t) => (t || '').toLowerCase().replace(/[^a-z0-9#@\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2);
const TEMPLATE_STARTS = Object.values(CAPTIONS).flat().map((c) => c.split('{')[0].toLowerCase().trim()).filter((c) => c.length > 6);
/* Originality: rewards writing your own words, punishes repeating yourself and canned captions */
function originality(text) {
  const t = (text || '').trim();
  if (!t) return 20;
  const words = capWords(t);
  if (!words.length) return 25;
  const set = new Set(words);
  let maxSim = 0;
  for (const p of S.posts.slice(0, 12)) {
    const o = new Set(capWords(p.caption)); if (!o.size) continue;
    let inter = 0; set.forEach((w) => { if (o.has(w)) inter++; });
    maxSim = Math.max(maxSim, inter / Math.min(set.size, o.size));
  }
  let sc = 35 + Math.min(25, set.size * 2.2);
  if (set.size / words.length > 0.85) sc += 8;
  if (t.includes('?')) sc += 5;
  if (/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(t)) sc += 4;
  if (/@\w/.test(t)) sc += 4;
  if (t.length < 15) sc -= 15;
  sc += (skillLvl('creativity') - 1) * 1.5;
  sc -= maxSim * 45;
  if (TEMPLATE_STARTS.some((c) => t.toLowerCase().startsWith(c))) sc -= 12;
  return Math.round(clamp(sc, 0, 100));
}
const mentionedNpcs = (t) => { const low = (t || '').toLowerCase(); return Object.keys(NPCS).filter((id) => low.includes('@' + NPCS[id].handle)); };

function computePost(o, det = false) {
  const R = det ? (a, b) => (a + b) / 2 : rnd;
  const P = PLATFORMS[o.platform], ps = S.platforms[o.platform];
  const F = FORMATS[o.format], T = TONES[o.tone], E = EFFORT[o.effort], TM = TIMES[o.time];
  const topics = topicsFor();
  const topic = topics.find((x) => x.id === o.topic) || topics[0];
  const FL = hasLook(o.format) && o.filter && FILTERS[o.filter] ? FILTERS[o.filter] : null;
  const lookMatch = !!FL && o.filter === S.aesthetic;
  const energy = Math.max(2, Math.round(F.e * E.e * (S.team.editor && F.video ? 0.8 : 1)) + (FL && FL.e ? FL.e : 0));
  const orig = Math.min(100, originality(o.caption) + (o.img ? 8 : 0)); // your own photo counts as original
  let q = E.q * (1 + 0.07 * (skillLvl(F.skill) - 1)) * (1 + gearQ(o.platform));
  if (T.skill) q *= 1 + 0.03 * (skillLvl(T.skill) - 1);
  if (S.stress > 70) q *= 0.85;
  if (FL && FL.q) q *= 1 + FL.q;
  if (o.img) q *= 1.08;
  q *= R(0.7, 1.3);
  let tagB = 0;
  for (const tg of o.tags) tagB += tagValue(tg);
  if (o.tags.length > 4) tagB -= 0.12;
  const cap = (o.caption || '').toLowerCase();
  if (cap && S.trends.some((t) => cap.includes(t.tag.slice(1).toLowerCase()))) tagB += 0.08;
  const total = totalFollowers();
  const base = ps.followers * 0.35 + total * 0.02 + 70;
  let mult = F.reach * T.reach * topic.reach * TM.reach * (S.algo[o.platform] || 1) * q * diffM() * (1 + tagB) * (1 + reachBonus()) * (1 + S.heat / 250);
  if (F.trendy && topic.trend) mult *= 1.25;
  if (o.platform === 'chirp' && S.flags.paidCheck) mult *= 1.1;
  if (S.shadowbanUntil >= S.day) mult *= 0.25;
  const recent = S.posts.slice(0, 10);
  const spon = recent.filter((p) => p.sponsored).length;
  const sellout = topic.deal && spon >= 4;
  if (sellout) mult *= 0.7;
  const repeat = recent.slice(0, 3).filter((p) => p.topicId === topic.id && p.platform === o.platform).length;
  mult *= 1 - repeat * 0.12; // audiences tire of the same thing
  mult *= (0.82 + orig / 280) * (1 + (FL && FL.reach ? FL.reach : 0)) * (lookMatch ? 1.12 : 1); // original writing and on-trend looks travel further
  mult = Math.pow(Math.max(mult, 0.01), 0.6); // stacked bonuses have diminishing returns
  const today = S.posts.filter((p) => p.day === S.day);
  mult *= Math.pow(0.72, today.filter((p) => p.platform === o.platform).length) * Math.pow(0.86, today.length); // followers tire of spam
  const viralP = clamp(0.01 + clamp(q - 1, 0, 0.4) * 0.04 + (topic.viral || 0) + (F.viral || 0) + (TM.viral || 0) + (T.viral || 0) + orig / 2500 + (FL && FL.viral ? FL.viral : 0) + (lookMatch ? 0.01 : 0), 0, 0.4);
  let viral = false, flop = false;
  if (!det) {
    if (chance(viralP)) { viral = true; mult *= rnd(3, 8); }
    else if (chance(0.06 + (q < 0.8 ? 0.1 : 0))) { flop = true; mult *= rnd(0.15, 0.4); }
  }
  const views = Math.max(3, Math.round(base * mult * R(0.85, 1.15)));
  let er = P.baseEng * T.eng * topic.eng * (F.eng || 1) * clamp(q, 0.5, 1.6) * realRatio() * R(0.8, 1.2);
  if (topic.deal && !o.disclose) er *= 1.1;
  if (FL && FL.eng) er *= 1 + FL.eng;
  er = clamp(er, 0.3, 40);
  const likes = Math.round((views * er) / 100);
  const refund = viral || flop ? 0 : Math.round(energy * clamp((er / P.baseEng - 0.6) * 0.5, 0, 0.6)); // a warm reception gives energy back
  const spicy = T.heat + topic.heat >= 10;
  const comments = Math.round(likes * R(0.03, 0.09) * (spicy ? 2.5 : 1));
  const shares = Math.round(likes * R(0.02, 0.07) * (viral ? 2.5 : 1));
  const conv = 0.024 / (1 + Math.log10(Math.max(ps.followers, 100) / 100) * 1.25);
  const repF = 0.4 + S.rep / 100;
  const gain = Math.min(views * conv * clamp(q, 0.4, 1.5) * T.follow * repF * (viral ? 1.3 : 1) * (topic.collab ? 1.3 : 1), ps.followers * 0.6 + 400);
  let loss = 0;
  if (spicy && S.rep < 45) loss += ps.followers * R(0.005, 0.02);
  if (sellout) loss += ps.followers * 0.01;
  let rep = T.rep + topic.rep + (F.rep || 0) + (q > 1.25 ? 0.5 : 0) + (FL && FL.rep ? FL.rep : 0);
  if (views > total * 3 && total > 500) rep *= 1.4; // bigger stage, bigger swing
  const heat = T.heat + topic.heat + (viral && spicy ? 10 : 0) + (FL && FL.heat ? FL.heat : 0);
  let cash = 0;
  if (o.platform === 'tube' && ps.followers >= 1000) cash += (views / 1000) * P.cpm * (1 + 0.05 * skillLvl('business'));
  if (o.platform === 'clipz') cash += (views / 1000) * P.cpm;
  return { energy, refund, orig, lookMatch, q, views, er, likes, comments, shares, gain: Math.round(gain), loss: Math.round(loss), rep, heat, cash, viral, flop, topic, viralP, sellout };
}

function genCaption(o, topic) {
  const tpl = pick(CAPTIONS[o.tone] || CAPTIONS.authentic);
  const t = topic.phrase || topic.label;
  return tpl.replace('{t}', t).replace('{T}', t.toUpperCase());
}

const STOP_WORDS = new Set(['this', 'that', 'with', 'have', 'just', 'your', 'from', 'they', 'what', 'when', 'about', 'there', 'their', 'will', 'been', 'were', 'into', 'more', 'than', 'then', 'them', 'some', 'like', 'really', 'honestly', 'today']);
function pickWord(caption) {
  const ws = (caption || '').replace(/[#@]\S+/g, '').split(/\s+/).map((w) => w.replace(/[^A-Za-z']/g, '')).filter((w) => w.length >= 4 && !STOP_WORDS.has(w.toLowerCase()));
  return ws.length ? pick(ws).toLowerCase() : null;
}
function fillTpl(t, o, w) { return t.replace(/\{w\}/g, w || 'this').replace(/\{h\}/g, S.handle).replace(/\{n\}/g, NICHES[S.niche].name.toLowerCase()).replace(/\{p\}/g, PLATFORMS[o.platform].name); }
function geoPick(excludeHome) {
  const e = Object.entries(S.geo || {}).filter(([c]) => !excludeHome || c !== S.country);
  if (!e.length) return pick(Object.keys(COUNTRIES));
  let x = Math.random() * e.reduce((a, [, v]) => a + v, 0);
  for (const [c, v] of e) { x -= v; if (x <= 0) return c; }
  return e[0][0];
}
/* Comments read your caption, your niche and the room. Companies and international fans show up too. */
function genComments(o, r) {
  const out = [], n = Math.min(9, 2 + Math.floor(Math.log10(r.comments + 1) * 1.3));
  const neg = clamp(0.1 + (TONES[o.tone].heat + r.topic.heat) / 30 + (50 - S.rep) / 150 + S.heat / 250 + (r.flop ? 0.15 : 0), 0.03, 0.8);
  const w = pickWord(o.caption);
  const L = (r) => Math.round(r.likes * rnd(0.0005, 0.03));
  for (let i = 0; i < n; i++) {
    let text, isNeg = false;
    const tpl = (k) => fillTpl(pick(COMMENT_TPL[k]), o, w);
    if (S.fake > 0 && chance(0.25 * (1 - realRatio()) + 0.05)) text = pick(COMMENTS.bot);
    else if (r.topic.deal && chance(0.35)) text = pick(COMMENTS.spon);
    else if (S.heat > 40 && chance(0.25)) { text = pick(COMMENTS.heat); isNeg = true; }
    else if (chance(neg)) { text = w && chance(0.65) ? tpl('neg') : pick(COMMENTS.neg); isNeg = true; }
    else if (chance(0.12)) text = tpl('ask');
    else if (S.rep > 60 && chance(0.15)) text = tpl('stan');
    else if ((o.tone === 'funny' || chance(0.25)) && chance(0.6)) text = w && chance(0.7) ? tpl('fun') : pick(COMMENTS.fun);
    else text = w && chance(0.6) ? tpl('pos') : pick(COMMENTS.pos);
    out.push({ who: fanHandle(), text, likes: L(r), neg: isNeg });
  }
  // international fans
  if (chance(0.25)) { const c = geoPick(true); out.push({ who: fanHandle(), cc: c, text: pick(COUNTRY_FAN).replace('{f}', COUNTRIES[c].flag).replace('{c}', COUNTRIES[c].name), likes: L(r) }); }
  // reply chains under the top comments
  out.sort((a, b) => b.likes - a.likes);
  out.slice(0, 2).forEach((c) => { if (chance(0.45)) c.sub = [{ who: fanHandle(), text: c.neg ? pick(['who hurt you', `@${c.who} touch grass`, 'ratio incoming', 'the jealousy is loud']) : pick(COMMENT_TPL.thread) }]; });
  // a company account might drop in
  const spicy = TONES[o.tone].heat + r.topic.heat >= 10;
  if (r.viral || chance(0.07) || (spicy && chance(0.12))) {
    const roasters = Object.keys(COMPANIES).filter((k) => COMPANIES[k].roast);
    const id = (spicy || r.flop) && chance(0.6) ? pick(roasters) : pick(Object.keys(COMPANIES));
    out.unshift({ who: COMPANIES[id].handle, co: id, text: r.flop && COMPANIES[id].roast ? 'we would roast this but it already roasted itself' : pick(COMPANIES[id].replies), likes: Math.round(r.likes * rnd(0.03, 0.12)) });
  }
  // a celebrity friend might chime in
  const friends = Object.entries(S.npcs).filter(([, n]) => n.rel >= 35 && !n.feud);
  if (friends.length && chance(0.35)) {
    const [id] = pick(friends);
    out.unshift({ who: NPCS[id].handle, npc: id, text: pick(['we need to collab fr', 'this is so good', 'proud of you', 'ok you ate', 'how are you this talented', 'the vision!!', w ? `"${w}" is going in my next caption, sorry` : 'stealing this idea']), likes: Math.round(r.likes * rnd(0.05, 0.2)) });
  }
  for (const [id, n] of Object.entries(S.npcs)) if (n.feud && chance(0.25)) out.unshift({ who: NPCS[id].handle, npc: id, text: pick(['lol who is this', 'desperate much?', 'still irrelevant I see', 'ratio', w ? `"${w}"? be serious` : 'be serious']), likes: Math.round(r.likes * rnd(0.05, 0.2)), neg: true });
  const top = out.filter((c) => c.npc || c.co), rest = out.filter((c) => !c.npc && !c.co).sort((a, b) => b.likes - a.likes);
  return [...top, ...rest].slice(0, 10);
}

/* ---------- companies, countries, tea ---------- */
function companyPost(id) {
  const c = COMPANIES[id];
  const likes = Math.round(rnd(4e3, 3e5));
  S.feed.unshift({ id: uid(), co: id, day: S.day, text: pick(c.posts), likes, comments: Math.round(likes * rnd(0.01, 0.05)), reposts: Math.round(likes * rnd(0.03, 0.1)), views: Math.round(likes * rnd(20, 50)), liked: false, commented: false, reposted: false });
  if (S.feed.length > 60) S.feed.length = 60;
}
const mentionedCompanies = (t) => { const low = (t || '').toLowerCase(); return Object.keys(COMPANIES).filter((id) => low.includes('@' + COMPANIES[id].handle)); };
function geoAdd(cc, amt) {
  if (!S.geo) S.geo = {};
  S.geo[cc] = (S.geo[cc] || 0) + amt;
  const tot = Object.values(S.geo).reduce((a, b) => a + b, 0);
  for (const k of Object.keys(S.geo)) { S.geo[k] /= tot; if (S.geo[k] < 0.004) delete S.geo[k]; }
}
function gainTea(npc, how) {
  if (!S.tea) S.tea = [];
  const used = new Set(S.tea.filter((t) => t.npc === npc).map((t) => t.text));
  const text = pick(TEA_LINES.filter((t) => !used.has(t)));
  if (!text) return;
  S.tea.unshift({ id: uid(), npc, text, day: S.day });
  if (S.tea.length > 6) S.tea.length = 6;
  notify('system', null, `You heard some tea ${how}: ${NPCS[npc].name} ${text}. Spill it or keep it.`);
  log(`Got tea on ${NPCS[npc].name}.`, 'gold');
}

function addXp(skill, amount) {
  const s = S.skills[skill];
  if (skill === 'editing' && S.owned.editsw) amount *= 2;
  s.xp += amount;
  while (s.lvl < 10 && s.xp >= s.lvl * 60) { s.xp -= s.lvl * 60; s.lvl++; log(`${skill} skill reached level ${s.lvl}.`, 'good'); gainEnergy(10, `${skill[0].toUpperCase() + skill.slice(1)} reached level ${s.lvl}`); }
  if (s.lvl >= 10) s.xp = 0;
}

function doPost(o) {
  if (S.hackedUntil >= S.day) return toast('Your account is locked while you recover it.', 'bad');
  const r = computePost(o);
  if (S.energy < r.energy) return toast(`Not enough energy. This post needs ${r.energy}.`, 'bad');
  const ps = S.platforms[o.platform];
  S.energy -= r.energy;
  S.stress = clamp(S.stress + r.energy * 0.12, 0, 100);
  ps.followers = Math.max(0, ps.followers + r.gain - r.loss);
  for (const id of unlockedIds()) if (id !== o.platform) S.platforms[id].followers += r.gain * rnd(0.02, 0.05);
  ps.eng = clamp(ps.eng * 0.85 + r.er * 0.15, 0.5, 30);
  changeRep(r.rep < 0 ? r.rep * sev() * (S.team.pr ? 0.7 : 1) : r.rep);
  const h0 = S.heat;
  S.heat = clamp(S.heat + (r.heat > 0 && S.team.pr ? r.heat * 0.7 : r.heat), 0, 100);
  S.money += r.cash; S.stats.earned += r.cash;
  addXp(FORMATS[o.format].skill, 12 * EFFORT[o.effort].e);
  if (TONES[o.tone].skill) addXp(TONES[o.tone].skill, 5);
  const post = {
    id: uid(), day: S.day, platform: o.platform, format: o.format, topicId: r.topic.id, topic: r.topic.label, tone: o.tone,
    caption: (o.caption || '').trim().slice(0, 220) || genCaption(o, r.topic), tags: o.tags.slice(0, 6),
    views: r.views, likes: r.likes, comments: r.comments, shares: r.shares, gain: r.gain - r.loss, rep: r.rep, cash: r.cash,
    viral: r.viral, flop: r.flop, sponsored: !!r.topic.deal, q: r.q, comms: genComments(o, r),
    filter: hasLook(o.format) && o.filter ? o.filter : null, orig: r.orig, lookMatch: r.lookMatch, img: o.img || null,
  };
  S.posts.unshift(post); if (S.posts.length > 80) S.posts.length = 80;
  S.posts.filter((p) => p.img).slice(10).forEach((p) => { p.img = null; }); // keep saves small
  post.fresh = true;
  // @mentions: stars notice, friends might answer
  post.mentions = mentionedNpcs(o.caption).slice(0, 2);
  for (const id of post.mentions) {
    const n = S.npcs[id];
    if (n.feud) { changeRel(id, -3); continue; }
    changeRel(id, TONES[o.tone].heat >= 10 ? -4 : 1.5);
    if (n.rel >= 25 && chance(0.4) && !post.comms.some((c) => c.npc === id)) post.comms.unshift({ who: NPCS[id].handle, npc: id, text: pick(['haha thank you for the mention!', 'this is so real', 'love you for this', 'ok I see you 👀']), likes: Math.round(r.likes * rnd(0.05, 0.2)) });
  }
  for (const id of mentionedCompanies(o.caption).slice(0, 2)) {
    const c = COMPANIES[id];
    if (chance(0.55)) {
      const roast = c.roast && (TONES[o.tone].heat >= 3 || chance(0.5));
      post.comms.unshift({ who: c.handle, co: id, text: roast ? pick(['and yet you still tagged us', 'we have more followers and better fries', 'bold of you to @ us with that caption', 'this is giving "tagged a brand for clout"']) : pick(c.replies), likes: Math.round(r.likes * rnd(0.05, 0.2)), neg: roast });
      gainEnergy(4, `${c.name} replied to you`);
      S.stats.coReplies = (S.stats.coReplies || 0) + 1;
    }
    if (chance(0.08) && totalFollowers() >= BRANDS[id].min) { const b = BRANDS[id]; const req = 1; mail({ type: 'deal', brand: id, pay: dealPay(b), req, days: ri(3, 6), from: b.name, subject: 'Saw your tag. Want to make it official?', body: `${b.name} noticed your post and wants a paid one.` }); }
  }
  for (const [cc, C] of Object.entries(COUNTRIES)) if ((o.caption || '').includes(C.flag) || (o.caption || '').toLowerCase().includes(C.name.toLowerCase())) geoAdd(cc, 0.01);
  if (r.topic.tea) {
    const t = S.tea.find((x) => x.id === r.topic.tea);
    if (t) {
      S.tea = S.tea.filter((x) => x.id !== t.id);
      changeRel(t.npc, -45); S.stats.teaSpilled = (S.stats.teaSpilled || 0) + 1;
      if (chance(0.6) && !S.npcs[t.npc].feud) { S.npcs[t.npc].feud = true; S.stats.feuds++; }
      news(`@${S.handle} spills tea: ${NPCS[t.npc].name} ${t.text}`, true);
      S.queue.push({ ev: 'tea_fallout', ctx: { npc: t.npc } });
    }
  }
  if (r.topic.clash) { const c = S.clashes.find((x) => x.id === r.topic.clash); if (c) c.playerPosts = (c.playerPosts || 0) + 1; }
  if (r.orig >= 85) S.stats.originals = (S.stats.originals || 0) + 1;
  // notifications, the way a real app would batch them
  post.comms.slice(0, 3).forEach((c) => notify('reply', c.npc || c.co || c.who, c.text, { post: post.id, npc: !!c.npc, co: !!c.co }));
  const starLiker = Object.entries(S.npcs).filter(([, n]) => n.rel >= 25 && !n.feud).map(([id]) => id);
  const liker = starLiker.length && chance(0.4) ? pick(starLiker) : null;
  if (r.likes > 0) notify('like', liker || fanHandle(), `and ${fmt(Math.max(0, r.likes - 1))} others liked your post`, { post: post.id, npc: !!liker });
  if (r.shares > 2) notify('repost', fanHandle(), `and ${fmt(r.shares - 1)} others reposted your post`, { post: post.id });
  if (post.gain > 0) notify('follow', fanHandle(), post.gain > 1 ? `and ${fmt(post.gain - 1)} others followed you` : 'followed you');
  if (r.viral) notify('viral', null, `Your post is going viral: ${fmt(r.views)} views and counting.`, { post: post.id });
  S.stats.posts++; S.lastPostDay = S.day;
  if (o.tone === 'ragebait') S.stats.ragebait++;
  if (o.tone === 'wholesome') S.stats.wholesome++;
  if (r.views > S.stats.bestViews) S.stats.bestViews = r.views;
  if (r.viral) {
    S.stats.viral++;
    log(`Your ${FORMATS[o.format].name.toLowerCase()} went viral: ${fmt(r.views)} views.`, 'gold');
    news(`@${S.handle}'s ${PLATFORMS[o.platform].name} post is everywhere today (${fmt(r.views)} views)`, true);
    sound('viral');
  } else if (r.flop) { S.stats.flops++; log(`Post flopped on ${PLATFORMS[o.platform].name}.`, 'bad'); sound('bad'); }
  else { log(`Posted on ${PLATFORMS[o.platform].name}: ${fmt(r.views)} views, ${signed(r.gain - r.loss)} followers.`); sound('post'); }
  if (r.sellout) log('Fans are calling you a sellout. Too many ads lately.', 'bad');
  // Energy rewards for a post that lands
  const prev = S.posts.slice(1, 11);
  const avg = prev.length ? prev.reduce((a, p) => a + p.views, 0) / prev.length : 0;
  const weak = r.flop || (prev.length >= 3 && r.views < avg * 0.45);
  S.flopStreak = weak ? (S.flopStreak || 0) + 1 : 0;
  if (S.flopStreak >= 3) { S.flopStreak = 0; if (!S.queue.some((q) => q.ev === 'fell_off')) S.queue.push({ ev: 'fell_off', ctx: {} }); }
  if (r.viral) gainEnergy(25, 'Your post went viral');
  else if (!r.flop) {
    if (r.refund > 0) gainEnergy(r.refund, 'Fans loved it');
    if (prev.length >= 3 && r.views > avg * 1.6) gainEnergy(8, 'Beat your average views');
  }
  if (post.comms.some((c) => c.npc && !c.neg)) gainEnergy(5, 'A star replied to you');
  if (r.orig >= 85) gainEnergy(4, 'That was original');
  if (S.challenge && !S.challenge.done && challengeMet(S.challenge.req, o, r, post)) {
    S.challenge.done = true; S.stats.challenges = (S.stats.challenges || 0) + 1;
    addFollowersPct(0.02 * diffM());
    notify('system', null, `Daily challenge complete: ${S.challenge.text}`);
    log(`Daily challenge complete: ${S.challenge.text}.`, 'gold');
    gainEnergy(20, 'Daily challenge complete');
  }

  // Deal progress
  if (r.topic.deal) {
    const d = S.deals.find((x) => x.id === r.topic.deal);
    d.done++;
    if (!o.disclose) { d.undisclosed = true; }
    if (d.done >= d.req) completeDeal(d);
  }
  if (r.topic.merch && S.merch) { S.merch.boost = (S.merch.boost || 0) + 1; }
  if (r.topic.collab) {
    const id = r.topic.collab, n = S.npcs[id];
    const bonus = Math.min(n.followers * 0.003 * clamp(r.q, 0.5, 1.6) * (0.5 + Math.max(n.rel, 0) / 100), Math.max(totalFollowers() * 0.25, 2500));
    addFollowers(bonus * diffM());
    post.gain += Math.round(bonus * diffM());
    changeRel(id, 10); S.stats.collabs++;
    if (NPCS[id].followers >= 1e7) S.stats.celebCollabs++;
    S.collab = null;
    gainEnergy(15, `Collab with ${npcName(id).split(' ')[0]}`);
    if (chance(0.35)) { const others = Object.keys(NPCS).filter((x) => x !== id); gainTea(pick(others), `from ${npcName(id).split(' ')[0]} during the collab`); }
    log(`Collab with ${npcName(id)} brought in ${fmt(bonus)} extra followers.`, 'gold');
    news(`${npcName(id)} and @${S.handle} team up in a surprise collab`, true);
  }
  if (r.topic.diss) {
    const id = r.topic.diss; changeRel(id, -12);
    if (chance(0.5)) S.queue.push({ ev: 'diss_reply', ctx: { npc: id } });
  }
  if (r.topic.id === 'couple' && S.partner) changeRel(S.partner, 2);
  // Backlash / cancel checks
  if (S.heat >= 100) { if (!S.queue.some((q) => q.ev === 'cancel')) S.queue.push({ ev: 'cancel', ctx: {} }); }
  else if (S.heat >= 60 && S.heat - h0 >= 8 && chance(0.4)) S.queue.push({ ev: 'backlash', ctx: { platform: o.platform } });
  checkAll();
  return post;
}

/* ---------- daily creative challenge ---------- */
function newChallenge() {
  const plats = unlockedIds().filter((p) => p !== 'live');
  const plat = pick(plats);
  const fm = pick(Object.keys(FORMATS).filter((f) => FORMATS[f].p === plat));
  const lookFm = pick(Object.keys(FORMATS).filter((f) => plats.includes(FORMATS[f].p) && hasLook(f)));
  const tr = pick(S.trends);
  const opts = [
    { text: `Post a Funny ${FORMATS[fm].name} on ${PLATFORMS[plat].name}`, req: { tone: 'funny', format: fm } },
    { text: `Ride ${tr.tag} before it peaks`, req: { trend: tr.tag } },
    { text: 'Write a post with 75+ originality', req: { minOrig: 75 } },
    { text: `Post a ${FORMATS[lookFm].name} with this week's ${FILTERS[S.aesthetic].name} look`, req: { filter: S.aesthetic } },
    { text: 'Shout out a star with an @mention in a Wholesome post', req: { tone: 'wholesome', mention: true } },
    { text: 'Ask your followers a question in an Educational post', req: { tone: 'educational', question: true } },
    { text: `Post a Polished ${FORMATS[fm].name}`, req: { format: fm, effort: 'polished' } },
  ];
  const live = (S.clashes || []).filter((c) => !c.done);
  if (live.length) { const c = pick(live); opts.push({ text: `Post about the ${NPCS[c.a].name} vs ${NPCS[c.b].name} clash`, req: { clash: c.id } }); }
  const ch = pick(opts);
  S.challenge = { ...ch, day: S.day, done: false };
}
function challengeMet(q, o, r, post) {
  if (q.tone && o.tone !== q.tone) return false;
  if (q.format && o.format !== q.format) return false;
  if (q.effort && o.effort !== q.effort) return false;
  if (q.trend && r.topic.trend !== q.trend && !o.tags.includes(q.trend)) return false;
  if (q.minOrig && r.orig < q.minOrig) return false;
  if (q.filter && (post.filter !== q.filter)) return false;
  if (q.mention && !(post.mentions || []).length) return false;
  if (q.question && !(o.caption || '').includes('?')) return false;
  if (q.clash && r.topic.clash !== q.clash) return false;
  return true;
}

/* ---------- deals ---------- */
function dealPay(b) {
  const t = Math.max(totalFollowers(), 300);
  let pay = b.base * Math.pow(t / 1000, 0.85) * clamp(engRate() / 5, 0.4, 2.2) * (S.team.manager ? 1.25 : 1) * (1 + 0.04 * (skillLvl('business') - 1));
  if (b.shady) pay *= 1.6;
  return Math.max(25, Math.round(pay / 5) * 5);
}
function makeOffer() {
  const t = totalFollowers();
  const brands = Object.entries(BRANDS).filter(([, b]) => (b.niches.includes(S.niche) || b.niches.includes('all') || chance(0.15)) && (!b.min || t >= b.min));
  if (!brands.length) return;
  const [id, b] = pick(brands);
  const req = ri(1, t > 1e5 ? 3 : 2);
  const pay = dealPay(b) * req;
  mail({ type: 'deal', brand: id, pay, req, days: ri(3, 7), from: b.name, subject: `Partnership offer: ${req} sponsored post${req > 1 ? 's' : ''}`,
    body: `${b.name} wants ${req} sponsored post${req > 1 ? 's' : ''} from you. ${b.shady ? 'They pay well and ask no questions.' : 'They love your audience.'}` });
}
function completeDeal(d) {
  const b = BRANDS[d.brand];
  d.status = 'done';
  S.money += d.pay; S.stats.earned += d.pay; S.stats.deals++;
  gainEnergy(10, `${b.name} paid you`);
  if (b.shady) { S.flags.shadyDeal = d.brand; }
  log(`Deal complete: ${b.name} paid ${money(d.pay)}.`, 'good');
  toast(`${b.name} paid ${money(d.pay)}`, 'gold');
  sound('cash');
  if (d.undisclosed && chance(0.35)) S.queue.push({ ev: 'ftc', ctx: { brand: d.brand, pay: d.pay } });
}

/* ---------- NPC simulation ---------- */
function npcPost(id, silent) {
  const n = NPCS[id];
  const tr = S.trends.length ? pick(S.trends).tag : '#fyp';
  const text = (n.lines && chance(0.65) ? pick(n.lines) : pick(NPC_POSTS[n.niche] || NPC_POSTS.lifestyle)).replace('{trend}', tr);
  const likes = Math.round(S.npcs[id].followers * rnd(0.01, 0.06));
  S.feed.unshift({ id: uid(), npc: id, day: S.day, text, likes, comments: Math.round(likes * rnd(0.01, 0.04)), reposts: Math.round(likes * rnd(0.02, 0.06)), views: Math.round(likes * rnd(15, 40)), liked: false, commented: false, reposted: false });
  if (S.feed.length > 60) S.feed.length = 60;
}

function simulateNpcs(report) {
  const t = totalFollowers();
  for (const [id, n] of Object.entries(S.npcs)) {
    n.followers *= 1 + rnd(-0.002, 0.007) + (n.feud ? 0.004 : 0);
    if (chance(0.3)) npcPost(id);
    if (n.rel > 5 && !n.feud) n.rel -= 0.3; // relationships need upkeep
    if (n.rel < -5 && !n.feud) n.rel += 0.5;
    // rising creators grow faster
    if (NPCS[id].type === 'Rising creator') n.followers *= 1 + rnd(0, 0.02);
    // offers from friends
    if (n.rel >= 35 && !S.collab && chance(0.06 + n.rel / 1000)) {
      mail({ type: 'collab', npc: id, subject: 'collab?', body: pick(['Been loving your stuff lately. Want to film something together this week?', 'My audience would love you. Collab?', 'Down to make something fun together? I have an idea.']) });
    }
    if (n.rel >= 30 && !n.followsYou && chance(0.12)) { n.followsYou = true; notify('follow', id, 'followed you', { npc: true }); log(`${NPCS[id].name} followed you.`, 'gold'); }
    if (n.rel >= 20 && chance(0.03)) mail({ type: 'npc', npc: id, subject: pick(['lol', 'random thought', 'saw your post']), body: pick(['your last post had me crying', 'we should get dinner next time I am in town', 'the algorithm has been weird this week right??', 'proud of how far you have come']) });
    // hostile NPCs
    if ((n.feud || n.rel <= -40) && chance(0.05 + NPCS[id].drama * 0.05)) S.queue.push({ ev: 'npc_callout', ctx: { npc: id } });
  }
  // Kenzie loves drama
  if (S.heat >= 45 && t >= 5000 && chance(0.12)) S.queue.push({ ev: 'kenzie_video', ctx: {} });
  // Gossip
  const ids = Object.keys(NPCS);
  for (let i = 0; i < ri(1, 2); i++) {
    const a = pick(ids); let b = pick(ids); if (b === a) b = pick(ids);
    const pool = NPCS[a].lines ? NEWS_NPC.filter((x) => !/under fire|sketchy|rumors/.test(x)) : NEWS_NPC; // parody stars only get light gossip
    const h = pick(pool).replace('{npc}', npcName(a)).replace('{npc2}', npcName(b));
    news(h);
    if (h.includes('under fire')) S.npcs[a].rep = clamp(S.npcs[a].rep - 5, 5, 95);
    if (h.includes('charity')) S.npcs[a].rep = clamp(S.npcs[a].rep + 3, 5, 95);
  }
}

/* ---------- day cycle ---------- */
function endDay() {
  if (S.over) return;
  const lines = [];
  const before = snap();
  // Salaries & upkeep
  let salaries = 0; for (const k of Object.keys(S.team)) if (S.team[k]) salaries += TEAM[k].pay;
  let upkeep = 0; for (const it of SHOP) if (S.owned[it.id] && it.upkeep) upkeep += it.upkeep;
  if (salaries) { S.money -= salaries; lines.push(['Team salaries', -salaries]); }
  if (upkeep) { S.money -= upkeep; lines.push(['Lifestyle upkeep', -upkeep]); }
  const fameTax = [0, 10, 45, 160, 550, 1600, 6500, 26000][tierIndex()];
  if (fameTax) { S.money -= fameTax; lines.push(['Cost of fame (rent, stylist, security)', -fameTax]); }
  // Passive businesses
  const t = totalFollowers(); const repF = clamp(S.rep / 60, 0.2, 1.6);
  if (S.merch) {
    const units = Math.round(t * realRatio() * 0.00012 * repF * S.merch.lvl * (1 + (S.merch.boost || 0) * 0.8) * rnd(0.7, 1.3));
    const profit = Math.round(units * (10 + S.merch.lvl * 3) * (1 + 0.04 * skillLvl('business')));
    S.merch.boost = 0; S.merch.sold += units;
    S.money += profit; S.stats.earned += profit; if (profit) lines.push([`Merch (${fmt(units)} sold)`, profit]);
  }
  if (S.product) {
    const units = Math.round(t * realRatio() * 0.0003 * repF * rnd(0.6, 1.4) * (S.product.hype || 1));
    const profit = Math.round(units * 14 * (1 + 0.05 * skillLvl('business')));
    S.product.hype = Math.max(1, (S.product.hype || 1) * 0.9); S.product.sold += units;
    S.money += profit; S.stats.earned += profit; if (profit) lines.push([`${S.product.name} sales`, profit]);
  }
  if (S.savings > 0) { const i = Math.round(S.savings * 0.0006); S.savings += i; if (i) lines.push(['Savings interest', i]); }
  // Tube passive ad revenue from the back catalog
  const tube = S.platforms.tube;
  if (tube.unlocked && tube.followers >= 1000) { const ad = Math.round(tube.followers * 0.02 * PLATFORMS.tube.cpm / 10 * realRatio()); if (ad) { S.money += ad; S.stats.earned += ad; lines.push(['ViewTube back-catalog ads', ad]); } }
  // Organic growth / decay
  const idle = S.day - S.lastPostDay;
  for (const id of unlockedIds()) {
    const p = S.platforms[id];
    let g = ((S.rep - 40) / 100) * 0.012 * diffM();
    if (idle > 2) g -= Math.min(0.05, (idle - 2) * 0.008);
    if (S.team.smm) { g += 0.002; p.eng = clamp(p.eng + 0.08, 0.5, 30); }
    p.followers = Math.max(0, p.followers * (1 + g));
    p.eng += (PLATFORMS[id].baseEng - p.eng) * 0.05; // drift back to platform norm
  }
  if (S.partner) addFollowers(Math.min(S.npcs[S.partner].followers * 0.0004, totalFollowers() * 0.03));
  // Fake follower purges
  if (S.fake > 0) { const purge = S.fake * 0.015; S.fake -= purge; S.platforms.pix.followers = Math.max(0, S.platforms.pix.followers - purge); }
  // Heat & stress
  S.heat = clamp(S.heat - (S.team.pr ? 14 : 6), 0, 100);
  S.stress = clamp(S.stress - 12 - (S.team.therapist ? 12 : 0) - (S.owned.mansion ? 5 : 0) + S.heat / 25, 0, 100);
  if (S.money < 0) {
    S.stats.debtDays++; S.stress = clamp(S.stress + 8, 0, 100);
    lines.push(['You are in debt', 0]);
    if (S.stats.debtDays >= 3 && Object.values(S.team).some(Boolean)) {
      S.team = {}; log('Your team quit because payroll bounced.', 'bad'); lines.push(['Your team quit (unpaid)', 0]);
    }
  } else S.stats.debtDays = 0;
  // Deals
  for (const d of S.deals) if (d.status === 'active' && S.day >= d.deadline) {
    d.status = 'failed'; S.stats.dealsFailed++;
    const fee = Math.round(d.pay * 0.2);
    S.money -= fee; changeRep(-3 * sev());
    log(`Missed ${BRANDS[d.brand].name} deadline. Breach fee ${money(fee)}.`, 'bad');
    lines.push([`${BRANDS[d.brand].name} breach fee`, -fee]);
  }
  if (S.collab && S.collab.until < S.day + 1) { if (S.collab.until <= S.day) { log(`Collab window with ${npcName(S.collab.npc)} expired.`, 'bad'); S.collab = null; } }

  // Posting streak: show up every day and you wake up hyped
  S.streak = S.lastPostDay === S.day ? (S.streak || 0) + 1 : 0;
  S.stats.bestStreak = Math.max(S.stats.bestStreak || 0, S.streak);
  const streakBonus = Math.min(30, S.streak * 5);
  if (streakBonus) lines.push([`${S.streak}-day posting streak: +${streakBonus} morning energy`, 0]);
  else lines.push(['No post today, streak reset', 0]);
  // Advance
  S.day++;
  simulateNpcs();
  S.trends = S.trends.filter((tr) => S.day - tr.born < tr.life);
  while (S.trends.length < 5) addTrend();
  rollAlgo();
  S.energy = Math.round(maxEnergy() * (S.stress >= 80 ? 0.7 : 1)) + streakBonus;
  generateInbox();
  // Burnout
  if (S.stress >= 100) S.queue.push({ ev: 'burnout', ctx: {} });
  // Bot exposure
  const fakeShare = S.fake / Math.max(1, totalFollowers());
  if (fakeShare > 0.15 && chance(0.05 + fakeShare * 0.2)) S.queue.push({ ev: 'exposed_bots', ctx: {} });
  // Random events
  rollRandomEvents();
  tickClashes();
  if (chance(0.6)) companyPost(pick(Object.keys(COMPANIES)));
  if (S.geo) geoAdd(pick(['us', 'in', 'br', 'id', 'ph', 'mx']), 0.003);
  if (chance(0.35)) startClash();
  if ((S.day - 1) % 7 === 0) { S.aesthetic = pick(Object.keys(FILTERS).filter((k) => k !== S.aesthetic)); news(`This week's look: everyone is posting ${FILTERS[S.aesthetic].name}.`); }
  if (S.challenge && !S.challenge.done) log('Missed yesterday\'s challenge.', '');
  newChallenge();
  // Awards season every 30 days
  if (S.day % 30 === 0) S.queue.push({ ev: 'awards', ctx: {} });

  const after = snap();
  const summary = { day: S.day - 1, df: after.f - before.f, dm: S.money - before.money, drep: S.rep - before.rep, lines,
    posts: S.stats.posts - (S.dayStart ? S.dayStart.posts : 0), totalF: after.f };
  S.queue.unshift({ ev: '_summary', ctx: summary });
  if ((S.day - 1) % 7 === 0) S.queue.splice(1, 0, { ev: '_weekly', ctx: weeklyReport() });
  pushHistory();
  S.dayStart = snap();
  checkAll();
  save();
}

function weeklyReport() {
  const ws = S.weekStart || snap();
  const weekPosts = S.posts.filter((p) => p.day > S.day - 8);
  const best = weekPosts.slice().sort((a, b) => b.views - a.views)[0];
  const r = { week: Math.ceil((S.day - 1) / 7), df: totalFollowers() - ws.f, dm: S.money - ws.money, drep: S.rep - ws.rep, posts: weekPosts.length,
    best: best ? { caption: best.caption, views: best.views, platform: best.platform } : null, viral: weekPosts.filter((p) => p.viral).length,
    avgViews: weekPosts.length ? weekPosts.reduce((a, p) => a + p.views, 0) / weekPosts.length : 0 };
  S.weekStart = snap();
  return r;
}

function generateInbox() {
  const t = totalFollowers();
  const ti = tierIndex(t);
  // fans and haters
  const nFan = ri(0, Math.min(3, 1 + ti));
  for (let i = 0; i < nFan; i++) {
    const hater = chance(clamp(0.2 + S.heat / 150 + (50 - S.rep) / 200, 0.05, 0.85));
    if (hater) mail({ type: 'hater', from: '@' + fanHandle(), subject: pick(['honestly', 'read this', 'unfollowed', 'you should know']), body: pick(['You are the reason the internet is cooked.', 'Your content was better before you got famous.', 'I hope your next post flops. Nothing personal.', 'Delete your account.', 'Everyone in my group chat thinks you are fake.']) });
    else mail({ type: 'fan', from: '@' + fanHandle(), subject: pick(['thank you', 'hi!!', 'you helped me', 'big fan']), body: pick(['Your posts got me through a really hard week. Thank you.', 'I tried your recipe/tip/routine and it actually worked!', 'Can you say hi to my sister in your next post? She is obsessed.', 'Been here since you had like 200 followers. So proud.', 'You inspired me to start my own account!']) });
  }
  // brand offers
  let p = 0.15 + ti * 0.08 + (S.team.manager ? 0.15 : 0) - (S.rep < 30 ? 0.15 : 0);
  if (S.heat > 70) p *= 0.4;
  if (t >= 400 && chance(clamp(p, 0.05, 0.85))) makeOffer();
  if (t >= 20000 && chance(p * 0.4)) makeOffer();
  // scams
  if (chance(0.07)) {
    if (chance(0.5)) mail({ type: 'scam_verify', from: 'Pixgram Security Team', subject: 'URGENT: Your account will be deleted in 24h', body: 'We detected copyright violations. Verify your account at pixgram-verify-support.co within 24 hours or it will be permanently deleted.' });
    else mail({ type: 'scam_invest', from: 'Prince of Crypto', subject: '10x your money guaranteed', body: 'Send $500 today and receive $5,000 by Friday. Many influencers already did. Totally legit, very safe.' });
  }
}

function rollRandomEvents() {
  const ti = tierIndex();
  const n = chance(Math.min(0.88, 0.58 + ti * 0.04)) ? (chance(0.16 + ti * 0.03) ? 2 : 1) : 0; // fame brings scrutiny
  const used = new Set(S.queue.map((q) => q.ev));
  const wt = (e) => (e.w || 1) * (e.neg ? 1 + ti * 0.2 : 1);
  for (let i = 0; i < n; i++) {
    const pool = Object.entries(EVENTS).filter(([id, e]) => e.random && !used.has(id) && (!e.when || e.when()) && !(e.once && S.flags['ev_' + id]));
    if (!pool.length) return;
    const tot = pool.reduce((a, [, e]) => a + wt(e), 0);
    let r = Math.random() * tot;
    for (const [id, e] of pool) { r -= wt(e); if (r <= 0) { S.queue.push({ ev: id, ctx: e.ctx ? e.ctx() : {} }); used.add(id); if (e.once) S.flags['ev_' + id] = true; break; } }
  }
}

/* ---------- platform unlocks ---------- */
function canUnlock(id) { return !S.platforms[id].unlocked && totalFollowers() >= PLATFORMS[id].unlock; }
function unlockPlatform(id) {
  if (!canUnlock(id)) return;
  const p = S.platforms[id];
  p.unlocked = true; p.followers = Math.round(totalFollowers() * 0.04 + 20);
  log(`Joined ${PLATFORMS[id].name}. ${fmt(p.followers)} fans followed you over.`, 'gold');
  toast(`${PLATFORMS[id].name} unlocked`, 'gold');
  news(`@${S.handle} just joined ${PLATFORMS[id].name}`, true);
  checkAll();
}

/* ---------- achievements & milestones ---------- */
const ACHIEVEMENTS = [
  ['first', 'Hello, world', 'Publish your first post', () => S.stats.posts >= 1],
  ['k1', 'Nano', 'Reach 1,000 followers', () => totalFollowers() >= 1e3],
  ['k10', 'Micro', 'Reach 10,000 followers', () => totalFollowers() >= 1e4],
  ['k100', 'Six figures', 'Reach 100,000 followers', () => totalFollowers() >= 1e5],
  ['m1', 'Millionaire (followers)', 'Reach 1M followers', () => totalFollowers() >= 1e6],
  ['m10', 'Household name', 'Reach 10M followers', () => totalFollowers() >= 1e7],
  ['m100', 'Icon', 'Reach 100M followers', () => totalFollowers() >= 1e8],
  ['viral1', 'Went viral', 'Have a post go viral', () => S.stats.viral >= 1],
  ['viral10', 'Algorithm whisperer', '10 viral posts', () => S.stats.viral >= 10],
  ['viral25', 'Main character', '25 viral posts', () => S.stats.viral >= 25],
  ['posts100', 'Content machine', 'Publish 100 posts', () => S.stats.posts >= 100],
  ['allplat', 'Omnipresent', 'Unlock all five platforms', () => unlockedIds().length === 5],
  ['verified', 'Blue check', 'Get verified', () => !!S.flags.verified],
  ['deal1', 'Paid partnership', 'Complete a brand deal', () => S.stats.deals >= 1],
  ['deal10', 'Brand darling', 'Complete 10 brand deals', () => S.stats.deals >= 10],
  ['collab1', 'Better together', 'Complete a collab', () => S.stats.collabs >= 1],
  ['celebcollab', 'Rubbing elbows', 'Collab with a 10M+ celebrity', () => S.stats.celebCollabs >= 1],
  ['feud', 'Beef season', 'Start a feud', () => S.stats.feuds >= 1],
  ['cancelled', 'Cancelled', 'Survive getting cancelled', () => S.stats.cancels >= 1],
  ['comeback', 'Comeback arc', 'Get back to 60 reputation after being cancelled', () => S.stats.cancels >= 1 && S.rep >= 60 && S.flags.canceledLow],
  ['beloved', 'Beloved', 'Reach 90 reputation', () => S.rep >= 90],
  ['villain', 'Villain era', 'Hit 90 heat', () => S.heat >= 90],
  ['cash10k', 'Rent paid', 'Have $10K', () => S.money >= 1e4],
  ['cash1m', 'Seven figures', 'Have $1M', () => S.money >= 1e6],
  ['cash100m', 'Mogul', 'Have $100M', () => S.money >= 1e8],
  ['merch', 'Merch drop', 'Launch a merch line', () => !!S.merch],
  ['product', 'Founder', 'Launch your own brand', () => !!S.product],
  ['podcast', 'Mic check', 'Launch a podcast', () => !!S.podcast],
  ['mansion', 'Content house', 'Buy the mansion', () => !!S.owned.mansion],
  ['jet', 'Wheels up', 'Buy a private jet', () => !!S.owned.jet],
  ['island', 'Final boss', 'Buy a private island', () => !!S.owned.island],
  ['stream10', 'Streamer', 'Stream 10 times', () => S.stats.streams >= 10],
  ['subathon', 'Subathon survivor', 'Finish a 12-hour subathon', () => S.stats.subathons >= 1],
  ['award', 'Award winner', 'Win a Clout Award', () => S.stats.awards >= 1],
  ['award3', 'Trophy shelf', 'Win 3 Clout Awards', () => S.stats.awards >= 3],
  ['dating', 'Power couple', 'Date a celebrity', () => S.stats.dates >= 1],
  ['breakup', 'Heartbreak content', 'Go through a public breakup', () => S.stats.breakups >= 1],
  ['burnout', 'Running on empty', 'Burn out', () => S.stats.burnouts >= 1],
  ['bots', 'Fake it', 'Buy followers', () => S.stats.bought >= 1],
  ['exposed', 'Exposed', 'Get caught with bot followers', () => S.stats.exposed >= 1],
  ['charity', 'Philanthropist', 'Donate $100K total', () => S.stats.donated >= 1e5],
  ['team', 'Full staff', 'Employ 5 team members at once', () => Object.values(S.team).filter(Boolean).length >= 5],
  ['maxskill', 'Mastery', 'Reach level 10 in any skill', () => Object.values(S.skills).some((s) => s.lvl >= 10)],
  ['day30', 'One month in', 'Survive 30 days', () => S.day >= 30],
  ['day100', 'Veteran', 'Survive 100 days', () => S.day >= 100],
  ['day365', 'A year online', 'Survive 365 days', () => S.day >= 365],
  ['wholesome', 'Wholesome king/queen', 'Post 25 wholesome posts', () => S.stats.wholesome >= 25],
  ['ragebait', 'Professional troll', 'Post 25 rage-bait posts', () => S.stats.ragebait >= 25],
  ['bestie', 'Bestie', 'Reach Bestie with any star', () => Object.values(S.npcs).some((n) => n.rel >= 65)],
  ['clash1', 'Main event', 'Win a clash battle against a star', () => (S.stats.battleWins || 0) >= 1],
  ['clash5', 'Undisputed', 'Win 5 clash battles', () => (S.stats.battleWins || 0) >= 5],
  ['sidewin', 'Right side of history', 'Back the winning side of 3 celebrity clashes', () => (S.stats.sideWins || 0) >= 3],
  ['peace', 'Peacemaker', 'End a celebrity clash with a truce', () => (S.stats.truces || 0) >= 1],
  ['original', 'Original thinker', 'Write 10 posts with 85+ originality', () => (S.stats.originals || 0) >= 10],
  ['challenge1', 'Challenge accepted', 'Complete a daily challenge', () => (S.stats.challenges || 0) >= 1],
  ['challenge10', 'Daily grinder', 'Complete 10 daily challenges', () => (S.stats.challenges || 0) >= 10],
  ['alist', 'A-list friends', 'Reach Friend (40+) with a parody A-lister', () => Object.keys(PARODY_NPCS).some((id) => S.npcs[id] && S.npcs[id].rel >= 40)],
  ['tea', 'Tea time', 'Spill a star\'s tea', () => (S.stats.teaSpilled || 0) >= 1],
  ['corp', 'Brand bestie', 'Get 5 replies from company accounts', () => (S.stats.coReplies || 0) >= 5],
  ['globe', 'Globetrotter', 'Visit 5 countries', () => (S.visited || []).length >= 5],
  ['hotseat', 'Hot seat survivor', 'Finish a hot seat interview', () => (S.stats.hotseats || 0) >= 1],
  ['nemesis', 'Arch-nemesis', 'Make a Nemesis', () => Object.values(S.npcs).some((n) => n.rel <= -60)],
  ['top10', 'Top 10', 'Pass 10 stars on the leaderboard', () => Object.values(S.npcs).filter((n) => n.followers < totalFollowers()).length >= 10],
  ['number1', 'Number one', 'Top the leaderboard', () => Object.values(S.npcs).every((n) => n.followers < totalFollowers())],
];

let lastTier = null;
function checkAll() {
  if (!S) return;
  const t = totalFollowers();
  const ti = tierIndex(t);
  if (S.flags.tier === undefined) S.flags.tier = ti;
  if (S.flags.tierMax === undefined) S.flags.tierMax = ti;
  if (S.flags.ms === undefined) S.flags.ms = FOLLOWER_MILESTONES.filter((m) => t >= m).length;
  while (S.flags.ms < FOLLOWER_MILESTONES.length && t >= FOLLOWER_MILESTONES[S.flags.ms]) {
    const m = FOLLOWER_MILESTONES[S.flags.ms++];
    S.bonusMaxE = (S.bonusMaxE || 0) + 2;
    notify('system', null, `You hit ${fmt(m)} followers! Max energy +2.`);
    gainEnergy(15, `${fmt(m)} followers`);
  }
  if (ti > S.flags.tierMax) {
    S.flags.tierMax = ti;
    S.bonusMaxE = (S.bonusMaxE || 0) + 5;
    gainEnergy(Math.max(0, maxEnergy() - S.energy) + 15, `New tier: ${TIERS[ti].name}. Energy refilled, max +5`);
  }
  if (ti > S.flags.tier) {
    S.flags.tier = ti;
    toast(`New tier: ${TIERS[ti].name} creator`, 'gold');
    log(`You're now a ${TIERS[ti].name} creator.`, 'gold');
    news(`@${S.handle} passes ${fmt(TIERS[ti].min)} followers`, true);
    sound('viral');
  } else if (ti < S.flags.tier) S.flags.tier = ti;
  if (!S.flags.verified && t >= 1e5 && S.rep >= 40) {
    S.flags.verified = true; S.queue.push({ ev: '_verified', ctx: {} }); gainEnergy(30, 'You got verified');
  }
  if (S.flags.verified && S.rep < 15 && !S.flags.lostCheck) { S.flags.verified = false; S.flags.lostCheck = true; log('Platforms removed your verification badge.', 'bad'); toast('You lost your verification badge', 'bad'); }
  if (S.stats.cancels && S.rep < 40) S.flags.canceledLow = true;
  for (const [id, name, , test] of ACHIEVEMENTS) {
    if (!S.achievements[id] && test()) { S.achievements[id] = S.day; log(`Achievement unlocked: ${name}.`, 'gold'); gainEnergy(8, `Achievement: ${name}`); }
  }
  if (!S.won && t >= 1e8 && S.rep >= 60) { S.won = true; S.queue.push({ ev: '_win', ctx: {} }); }
  if (S.rep <= 0 && !S.over) { S.over = true; S.queue.unshift({ ev: '_gameover', ctx: {} }); }
}

/* ---------- sound ---------- */
let actx = null;
function sound(kind) {
  if (!S || !S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = { post: [660], viral: [523, 659, 784, 1046], bad: [220, 165], cash: [880, 1320], click: [500], alert: [440, 330], zap: [784, 1175, 1568] }[kind] || [440];
    notes.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = kind === 'bad' ? 'sawtooth' : 'triangle'; o.frequency.value = f;
      const t0 = actx.currentTime + i * 0.08;
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.08, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
      o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + 0.2);
    });
  } catch (e) { /* audio unavailable */ }
}
