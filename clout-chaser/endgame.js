/* Clout Chaser — the long game: Clout League sportsbook, the Clout Casino, the Clout Pass season,
   weekly world events, mega deals, and Legacy (rebrand for permanent perks). All with in-game money only. */
'use strict';

/* ---------- higher tiers and more milestones ---------- */
TIERS.push({ min: 1e9, name: 'Legend' }, { min: 5e9, name: 'Mythic' });
FOLLOWER_MILESTONES.push(2.5e9, 5e9, 1e10);
MONEY_MILESTONES.push(1e10, 1e11);

/* ---------- mega brands for big accounts ---------- */
Object.assign(BRANDS, {
  nyke:     { name: 'Nyke',             niches: ['all'], base: 160, rep: 1, min: 1e6 },
  megabite: { name: 'MegaBite Burgers', niches: ['all'], base: 120, rep: 0, min: 5e5 },
  lux:      { name: 'Maison Lumière',   niches: ['fashion', 'beauty', 'lifestyle', 'all'], base: 220, rep: 1, min: 2e6 },
  galactic: { name: 'Galactic Airlines', niches: ['all'], base: 260, rep: 1, min: 1e7 },
  pearx:    { name: 'Pear Inc. (global)', niches: ['all'], base: 320, rep: 1, min: 3e7 },
});

/* ---------- weekly world events ---------- */
const WORLD_EVENTS = {
  cup:      { name: 'Clout Cup week', icon: '⚽', desc: 'Football fever. Sportsbook winnings +15% and six matches a day.', bets: 1.15 },
  fashion:  { name: 'Fashion Week', icon: '👗', desc: 'Looks are everything. Every post gets +12% reach.', reach: 1.12 },
  budgets:  { name: 'Brand budget season', icon: '💼', desc: 'Marketing teams have money to burn. Deals pay 30% more.', deals: 1.3 },
  streamfest: { name: 'StreamFest', icon: '🎥', desc: 'Everyone is watching streams. Gifts ×1.4.', gift: 1.4 },
  vegas:    { name: 'Vegas Week', icon: '🎰', desc: 'Casino jackpots pay double.', casino: 2 },
  crypto:   { name: 'Crypto mania', icon: '🪙', desc: 'CloutCoin goes wild. Double the swings both ways.', crypto: 2 },
  viral:    { name: 'Algorithm chaos', icon: '🌀', desc: 'Viral chance +3% on every post. Flops hurt more.', viral: 0.03 },
};
const worldEv = () => (S.world && WORLD_EVENTS[S.world.id]) || {};
const worldMult = (k) => (worldEv()[k] || 1);
function newWorldEvent() {
  const ids = Object.keys(WORLD_EVENTS).filter((k) => !S.world || k !== S.world.id);
  S.world = { id: pick(ids), until: S.day + 7 };
  const e = WORLD_EVENTS[S.world.id];
  news(`This week: ${e.name}. ${e.desc}`);
  notify('system', null, `${e.icon} ${e.name} has started. ${e.desc}`);
}

/* ---------- Clout League sportsbook ---------- */
const FC_TEAMS = {
  rmd: ['Real Madrip', 93], bar: ['Barcelonah', 90], mcy: ['Man Citty', 92], liv: ['Liverpoole', 89],
  ars: ['Arsenul', 87], mun: ['Manchester Unitedd', 80], che: ['Chelsy', 79], bay: ['Bayern Munchkin', 90],
  psg: ['PSJ Paris', 86], juv: ['Juventuss', 81], int: ['Inter Milano', 84], acm: ['AC Mylan', 78],
  bvb: ['Dortmundo', 80], ajx: ['Ajaxx', 72], ben: ['Benfika', 75], nas: ['Al Nassar', 74],
};
const teamName = (k) => FC_TEAMS[k][0];
function poisson(l) { let k = 0, p = Math.exp(-l), s = p; const u = Math.random(); while (u > s && k < 10) { k++; p *= l / k; s += p; } return k; }
function xg(h, a) {
  const sh = FC_TEAMS[h][1], sa = FC_TEAMS[a][1];
  return [1.45 * Math.pow(sh / sa, 2.2) + 0.12, 1.15 * Math.pow(sa / sh, 2.2)];
}
function makeFixture(h, a) {
  const [lh, la] = xg(h, a);
  let H = 0, D = 0, A = 0, O = 0; const N = 600;
  for (let i = 0; i < N; i++) { const x = poisson(lh), y = poisson(la); if (x > y) H++; else if (x === y) D++; else A++; if (x + y > 2) O++; }
  const odd = (n) => Math.max(1.05, +((N / Math.max(n, 6)) * 0.92).toFixed(2)); // 8% house margin
  return { id: uid(), day: S.day, h, a, lh, la, odds: { h: odd(H), d: odd(D), a: odd(A), o: odd(O), u: odd(N - O) }, done: false };
}
function newFixtures() {
  S.book = S.book || { fx: [], bets: [], won: 0, lost: 0, table: {}, history: [] };
  const n = S.world && S.world.id === 'cup' ? 6 : 4;
  const teams = shuffle(Object.keys(FC_TEAMS)).slice(0, n * 2);
  S.book.fx = S.book.fx.filter((f) => !f.done && f.day >= S.day - 1);
  for (let i = 0; i < n; i++) S.book.fx.push(makeFixture(teams[i * 2], teams[i * 2 + 1]));
}
const PICK_LABEL = (f, p) => ({ h: teamName(f.h) + ' win', d: 'Draw', a: teamName(f.a) + ' win', o: 'Over 2.5 goals', u: 'Under 2.5 goals' }[p]);
function placeBet(fid, pickK, stake) {
  const f = S.book.fx.find((x) => x.id === fid);
  if (!f || f.done || f.live) return toast('Betting is closed for this match.', 'bad');
  stake = Math.floor(stake);
  if (stake < 10) return toast('Minimum bet is $10.', 'bad');
  if (!spend(stake)) return toast('Not enough cash.', 'bad');
  S.book.bets.push({ id: uid(), fid, pick: pickK, stake, odds: f.odds[pickK], status: 'open' });
  S.stats.bets = (S.stats.bets || 0) + 1;
  toast(`Bet placed: ${money(stake)} on ${PICK_LABEL(f, pickK)} @ ${f.odds[pickK]}`);
  sound('post');
}
function betWins(b, f) {
  const hg = f.hg, ag = f.ag;
  return { h: hg > ag, d: hg === ag, a: ag > hg, o: hg + ag > 2, u: hg + ag <= 2 }[b.pick];
}
function settleFixture(f) {
  if (f.done) return;
  if (f.hg === undefined) { f.hg = poisson(f.lh); f.ag = poisson(f.la); }
  f.done = true; f.live = false;
  const T = S.book.table;
  T[f.h] = T[f.h] || 0; T[f.a] = T[f.a] || 0;
  if (f.hg > f.ag) T[f.h] += 3; else if (f.hg < f.ag) T[f.a] += 3; else { T[f.h]++; T[f.a]++; }
  S.book.history.unshift({ d: f.day, t: `${teamName(f.h)} ${f.hg}–${f.ag} ${teamName(f.a)}` });
  if (S.book.history.length > 12) S.book.history.length = 12;
  let net = 0;
  for (const b of S.book.bets.filter((x) => x.fid === f.id && x.status === 'open')) {
    if (betWins(b, f)) {
      const pay = Math.round(b.stake * b.odds * worldMult('bets'));
      S.money += pay; S.stats.earned += pay - b.stake; S.book.won += pay - b.stake; net += pay - b.stake;
      b.status = 'won'; b.pay = pay;
      S.stats.betWins = (S.stats.betWins || 0) + 1;
      passXP(15); if (typeof questEvent === 'function') questEvent('betwin');
      if (b.odds >= 5) { S.stats.longshots = (S.stats.longshots || 0) + 1; news(`@${S.handle} hits a ${b.odds}× longshot on ${teamName(f.h)} vs ${teamName(f.a)}`, true); }
    } else { b.status = 'lost'; S.book.lost += b.stake; net -= b.stake; }
  }
  return net;
}
function bookTick(lines) {
  if (!S.book) return newFixtures();
  let net = 0, n = 0;
  for (const f of S.book.fx) if (!f.done) { const r = settleFixture(f); if (r) { net += r; n++; } }
  if (n) lines.push([`Sportsbook: ${net >= 0 ? 'won' : 'lost'} ${money(Math.abs(net))} on today's matches`, 0]);
  S.book.bets = S.book.bets.filter((b) => b.status === 'open' || S.book.fx.some((f) => f.id === b.fid)).slice(-40);
  newFixtures();
}

/* live match: a minute-by-minute ticker with cash-out */
let liveTimer = null;
const LIVE_LINES = {
  goal: ['GOAL! {t} score from a scramble in the box!', 'GOAL! A screamer from 30 yards for {t}!', 'GOAL! {t} head it in from the corner!', 'GOAL! Penalty converted by {t}!'],
  chance: ['{t} hit the post!', 'Huge save denies {t}!', '{t} skies it over the bar.', 'VAR checks a {t} handball… no penalty.'],
  card: ['Yellow card for a {t} defender.', 'RED CARD! {t} are down to ten!'],
};
function startLive(fid) {
  const f = S.book.fx.find((x) => x.id === fid);
  if (!f || f.done || f.live) return;
  if (liveTimer) return toast('One live match at a time.', 'bad');
  f.live = true; f.min = 0; f.hg = 0; f.ag = 0; f.feed = [];
  let lh = f.lh, la = f.la;
  liveTimer = setInterval(() => {
    if (!S) { clearInterval(liveTimer); liveTimer = null; return; }
    f.min += 1;
    const t = Math.random();
    if (t < lh / 90) { f.hg++; f.feed.unshift(`${f.min}' ⚽ ${pick(LIVE_LINES.goal).replace('{t}', teamName(f.h))}`); sound('zap'); }
    else if (t < (lh + la) / 90) { f.ag++; f.feed.unshift(`${f.min}' ⚽ ${pick(LIVE_LINES.goal).replace('{t}', teamName(f.a))}`); sound('zap'); }
    else if (chance(0.06)) f.feed.unshift(`${f.min}' ${pick(LIVE_LINES.chance).replace('{t}', teamName(chance(0.5) ? f.h : f.a))}`);
    else if (chance(0.012)) { const side = chance(0.5); const red = chance(0.25); f.feed.unshift(`${f.min}' ${red ? '🟥' : '🟨'} ${(red ? LIVE_LINES.card[1] : LIVE_LINES.card[0]).replace('{t}', teamName(side ? f.h : f.a))}`); if (red) { if (side) lh *= 0.7; else la *= 0.7; } }
    if (f.feed.length > 8) f.feed.length = 8;
    if (f.min >= 90 + (f.extra || (f.extra = ri(1, 5)))) {
      clearInterval(liveTimer); liveTimer = null;
      const net = settleFixture(f);
      f.feed.unshift(`FT: ${teamName(f.h)} ${f.hg}–${f.ag} ${teamName(f.a)}`);
      if (net) toast(net > 0 ? `You won ${money(net)}!` : `Lost ${money(-net)}. Next time.`, net > 0 ? 'gold' : 'bad');
      if (net > 0) { sound('cash'); if (net >= 1000 && typeof celebrate === 'function') celebrate('gold'); }
      save(); renderAll(); return;
    }
    const box = document.getElementById('live-' + f.id);
    if (box) box.outerHTML = liveBox(f); else if (f.min % 10 === 0) save();
  }, 140);
}
/* cash out: what the bet is worth right now, with a cut for the house */
function cashoutValue(b, f) {
  const left = Math.max(0, 90 - f.min) / 90;
  const [lh, la] = [f.lh * left, f.la * left];
  let w = 0; const N = 300;
  for (let i = 0; i < N; i++) { const g = { hg: f.hg + poisson(lh), ag: f.ag + poisson(la) }; if (betWins(b, g)) w++; }
  return Math.round(b.stake * b.odds * (w / N) * 0.88);
}
function cashOut(bid) {
  const b = S.book.bets.find((x) => x.id === bid), f = b && S.book.fx.find((x) => x.id === b.fid);
  if (!b || b.status !== 'open' || !f || !f.live) return;
  const v = cashoutValue(b, f);
  S.money += v; b.status = 'cashed'; b.pay = v;
  if (v > b.stake) S.stats.earned += v - b.stake;
  toast(`Cashed out for ${money(v)}`, v >= b.stake ? 'gold' : '');
  sound('cash');
}
function liveBox(f) {
  const bets = S.book.bets.filter((b) => b.fid === f.id && b.status === 'open');
  return `<div class="livebox" id="live-${f.id}"><div class="score"><span>${esc(teamName(f.h))}</span><b>${f.hg} – ${f.ag}</b><span>${esc(teamName(f.a))}</span></div>
    ${typeof pitchSvg === 'function' ? pitchSvg(f) : ''}<div class="row between"><span class="pill like">● LIVE ${Math.min(f.min, 90)}'${f.min > 90 ? ` +${f.min - 90}` : ''}</span><div class="minbar"><i style="width:${Math.min(100, f.min / 0.9)}%"></i></div></div>
    <div class="feedlines">${(f.feed || []).map((l) => `<span class="small">${esc(l)}</span>`).join('') || '<span class="small muted">Kick-off!</span>'}</div>
    ${bets.map((b) => `<div class="row between"><span class="small">${esc(PICK_LABEL(f, b.pick))} · ${money(b.stake)} @ ${b.odds}</span>${btn(`Cash out ${money(cashoutValue(b, f))}`, 'betCash', b.id, 'sm primary')}</div>`).join('')}</div>`;
}

/* ---------- Clout Casino (game money only) ---------- */
const SLOT_SYMS = [['🍒', 30, 4], ['🍋', 26, 8], ['🔔', 18, 15], ['⭐', 12, 30], ['💎', 8, 60], ['7️⃣', 5, 150], ['👑', 1, 500]]; // ~93% return
function slotRoll() { const tot = SLOT_SYMS.reduce((a, s) => a + s[1], 0); let r = Math.random() * tot; for (const s of SLOT_SYMS) { r -= s[1]; if (r <= 0) return s; } return SLOT_SYMS[0]; }
function casinoResult(bet, won, label) {
  if (typeof questEvent === 'function') questEvent('casino');
  S.casino = S.casino || { wagered: 0, net: 0, today: 0, day: S.day, best: 0 };
  if (S.casino.day !== S.day) { S.casino.day = S.day; S.casino.today = 0; }
  S.casino.wagered += bet; S.casino.net += won - bet; S.casino.today += won - bet;
  if (won - bet > S.casino.best) S.casino.best = won - bet;
  S.stats.gambles = (S.stats.gambles || 0) + 1;
  if (won > bet) { S.stats.earned += won - bet; sound('cash'); } else sound('bad');
  if (won >= bet * 20) { celebrate('gold'); news(`@${S.handle} hits a ${label} jackpot at the Clout Casino`, true); S.stats.jackpots = (S.stats.jackpots || 0) + 1; }
  if (chance(0.03)) { S.heat = clamp(S.heat + 4, 0, 100); news(`Paparazzi spot @${S.handle} at the casino at 4AM`, true); }
}
function playSlots(bet) {
  if (!spend(bet)) return toast('Not enough cash.', 'bad');
  const r = [slotRoll(), slotRoll(), slotRoll()];
  let mult = 0;
  if (r[0][0] === r[1][0] && r[1][0] === r[2][0]) mult = r[0][2] * worldMult('casino');
  else if (r[0][0] === r[1][0] || r[1][0] === r[2][0]) mult = r[1][0] === '🍒' ? 1.5 : 0.5;
  else if (r.some((s) => s[0] === '🍒')) mult = 0.4;
  const won = Math.round(bet * mult);
  S.money += won;
  ui.slot = { reels: r.map((s) => s[0]), won, bet, fresh: true };
  setTimeout(() => { if (ui.slot) ui.slot.fresh = false; }, 1200);
  casinoResult(bet, won, 'slots');
}
const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
function playRoulette(kind, bet) {
  if (!spend(bet)) return toast('Not enough cash.', 'bad');
  const n = ri(0, 36);
  const hit = { red: RED.has(n), black: n && !RED.has(n), even: n && n % 2 === 0, odd: n % 2 === 1, low: n >= 1 && n <= 18, high: n >= 19, zero: n === 0, lucky: n === (S.casino && S.casino.lucky || 7) }[kind];
  const mult = { red: 2, black: 2, even: 2, odd: 2, low: 2, high: 2, zero: 36, lucky: 36 }[kind] * (kind === 'zero' || kind === 'lucky' ? worldMult('casino') : 1);
  const won = hit ? Math.round(bet * mult) : 0;
  S.money += won;
  ui.wheel = { n, color: n === 0 ? 'green' : RED.has(n) ? 'red' : 'black', won, bet, fresh: true };
  setTimeout(() => { if (ui.wheel) ui.wheel.fresh = false; }, 1600);
  casinoResult(bet, won, 'roulette');
}
let crashTimer = null;
function startCrash(bet) {
  if (crashTimer) return;
  if (!spend(bet)) return toast('Not enough cash.', 'bad');
  const point = Math.max(1, Math.min(200, 0.96 / (1 - Math.random())));
  ui.crash = { bet, m: 1, point, state: 'flying' };
  crashTimer = setInterval(() => {
    const c = ui.crash; if (!S || !c) { clearInterval(crashTimer); crashTimer = null; return; }
    c.m = +(c.m * 1.035 + 0.004).toFixed(2);
    if (c.m >= c.point) { c.m = +c.point.toFixed(2); c.state = 'crashed'; clearInterval(crashTimer); crashTimer = null; casinoResult(c.bet, 0, 'crash'); save(); }
    const box = document.getElementById('crashBox'); if (box) box.outerHTML = crashBox();
  }, 120);
}
function crashCash() {
  const c = ui.crash; if (!c || c.state !== 'flying') return;
  clearInterval(crashTimer); crashTimer = null;
  c.state = 'cashed'; c.won = Math.round(c.bet * c.m);
  S.money += c.won;
  casinoResult(c.bet, c.won, `${c.m}× rocket`);
}
function crashBox() {
  const c = ui.crash;
  if (!c) return '<div id="crashBox" class="crash"><div class="cm">1.00×</div><span class="small muted">The viral rocket climbs until it crashes. Cash out before it does.</span></div>';
  const cls = c.state === 'crashed' ? 'bad' : c.state === 'cashed' ? 'good' : 'gold';
  return `<div id="crashBox" class="crash ${c.state}"><div class="cm ${cls}">${c.m.toFixed(2)}×</div>
    <span class="small">${c.state === 'flying' ? `Riding ${money(c.bet)} → ${money(c.bet * c.m)}` : c.state === 'crashed' ? `💥 Crashed at ${c.m.toFixed(2)}×. Lost ${money(c.bet)}.` : `✅ Cashed out at ${c.m.toFixed(2)}× for ${money(c.won)}`}</span>
    ${c.state === 'flying' ? btn(`Cash out ${money(c.bet * c.m)}`, 'crashCash', '', 'primary') : ''}</div>`;
}

/* ---------- Clout Pass: a 30-tier season that resets every 30 days ---------- */
const SEASON_NAMES = ['Main Character Era', 'Glow Up Summer', 'Villain Arc', 'Soft Launch Season', 'Rich Era', 'Chaos Mode', 'Comeback Season', 'Iconic Behavior'];
const PASS_TIERS = 30;
const passNeed = (t) => Math.round(100 * (1 + t * 0.12));
function passInit() {
  if (!S.pass || S.day >= S.pass.ends) {
    const n = S.pass ? S.pass.n + 1 : 1;
    if (S.pass) notify('system', null, `Season ${S.pass.n} ended. Season ${n}: ${SEASON_NAMES[(n - 1) % SEASON_NAMES.length]} has begun!`);
    S.pass = { n, xp: 0, tier: 0, claimed: [], ends: S.day + 30 };
  }
  return S.pass;
}
function passXP(n) {
  if (!S) return;
  const p = passInit();
  if (p.tier >= PASS_TIERS) return;
  p.xp += n;
  while (p.tier < PASS_TIERS && p.xp >= passNeed(p.tier + 1)) { p.xp -= passNeed(p.tier + 1); p.tier++; notify('system', null, `Clout Pass tier ${p.tier} unlocked! Claim your reward.`); }
}
function passReward(t) {
  const big = Math.max(300, totalFollowers() * 0.004) * (1 + t / 10);
  if (t === PASS_TIERS) return { icon: '🏆', text: `Season champion: ${money(big * 10)}, +10 max energy, gold crown frame`, fx: () => { S.money += Math.round(big * 10); S.bonusMaxE = (S.bonusMaxE || 0) + 10; S.frames = S.frames || []; if (!S.frames.includes('champ')) S.frames.push('champ'); S.stats.passDone = (S.stats.passDone || 0) + 1; } };
  if (t === 20) return { icon: '🖼️', text: 'Stadium profile banner', fx: () => { S.banners = S.banners || []; if (!S.banners.includes('stadium')) S.banners.push('stadium'); } };
  if (t === 10) return { icon: '💍', text: 'Season frame for your avatar', fx: () => { S.frames = S.frames || []; if (!S.frames.includes('season')) S.frames.push('season'); } };
  if (t % 5 === 0) return { icon: '⚡', text: '+3 max energy', fx: () => { S.bonusMaxE = (S.bonusMaxE || 0) + 3; } };
  return [
    { icon: '💵', text: money(Math.round(big)), fx: () => { S.money += Math.round(big); } },
    { icon: '🔋', text: '+25 energy', fx: () => gainEnergy(25, 'Clout Pass reward') },
    { icon: '📸', text: 'Pro photographer today', fx: () => consumeSpecial('photo') },
    { icon: '📈', text: '+1.5% followers', fx: () => addFollowersPct(0.015) },
    { icon: '🍀', text: 'Lucky charm today', fx: () => consumeSpecial('lucky') },
    { icon: '🎟️', text: `${money(Math.round(big * 0.6))} free bet credit`, fx: () => { S.money += Math.round(big * 0.6); } },
  ][t % 6];
}
FRAMES.season = { name: 'Season frame', price: 0, pass: true, css: 'conic-gradient(#7B2CF5, #1D9BF0, #00BA7C, #FFD400, #F91880, #7B2CF5)' };
FRAMES.champ = { name: 'Champion crown', price: 0, pass: true, css: 'conic-gradient(#FFD400, #FFF3B0, #FF9F00, #FFD400, #FFF3B0, #FFD400)' };
BANNERS.stadium = { name: 'Stadium lights', price: 0, pass: true, css: 'radial-gradient(circle at 20% 0%, #fff9 0 6%, transparent 30%), radial-gradient(circle at 80% 0%, #fff9 0 6%, transparent 30%), linear-gradient(#0B3D1E, #1F7A3A 60%, #0B3D1E)' };

/* ---------- Legacy: rebrand at 100M for permanent perks ---------- */
const LEGACY_MIN = 1e8;
const LEGACY_PERKS = {
  growth: { name: 'Fame engine', desc: '+10% followers from every post', max: 10 },
  money:  { name: 'Golden touch', desc: '+10% money from posts and deals', max: 10 },
  energy: { name: 'Iron stamina', desc: '+10 max energy', max: 10 },
  luck:   { name: 'Main character luck', desc: '+0.5% viral chance', max: 6 },
  start:  { name: 'Head start', desc: 'Rebrands start with 2× more followers', max: 6 },
};
const legacyLvl = (k) => (S && S.legacy && S.legacy.perks[k]) || 0;
const legacyPoints = () => Math.floor(Math.sqrt(totalFollowers() / 1e6));
function rebrand() {
  if (totalFollowers() < LEGACY_MIN) return;
  S.legacy = S.legacy || { rank: 0, lp: 0, perks: {}, best: 0 };
  const L = S.legacy, got = legacyPoints();
  L.rank++; L.lp += got; L.best = Math.max(L.best, totalFollowers());
  S.stats.rebrands = (S.stats.rebrands || 0) + 1;
  const start = 500 * Math.pow(2, legacyLvl('start'));
  for (const [id, p] of Object.entries(PLATFORMS)) S.platforms[id] = { unlocked: p.unlock === 0, followers: p.unlock === 0 ? start * (id === 'pix' ? 0.7 : 0.3) : 0, eng: p.baseEng };
  S.fake = 0; S.money = Math.round(S.money * 0.15); S.rep = 55; S.heat = 0; S.stress = 0;
  S.deals = []; S.inbox = []; S.collab = null; S.partner = null;
  S.flags.tier = undefined; S.flags.tierMax = undefined; S.flags.ms = undefined; S.flags.mm = undefined;
  S.vault && (S.vault.drops = []);
  S.bio = `Era ${L.rank + 1}. New name energy, same main character.`;
  news(`@${S.handle} wipes their accounts and starts Era ${L.rank + 1}. The internet is obsessed.`, true);
  notify('system', null, `Rebranded! You earned ${got} Legacy points. Spend them on permanent perks.`);
  celebrate('gold');
}

/* ---------- XP hooks and daily tick ---------- */
function endgameTick(lines) {
  if (!S.world || S.day >= S.world.until) newWorldEvent();
  passInit();
  bookTick(lines);
  // mega contracts for huge accounts
  const t = totalFollowers();
  if (t >= 5e6 && chance(0.06)) makeGig('movie');
  if (t >= 2e7 && chance(0.04)) makeGig('halftime');
  if (t >= 1e6 && chance(0.05)) makeGig('reality');
}

/* ---------- screens ---------- */
function vArena() {
  const tabK = ui.arenaTab || 'book';
  const ev = worldEv();
  const top = `${ev.name ? `<div class="hint world">${ev.icon} <b>${ev.name}</b> · ${ev.desc} <span class="muted">(${S.world.until - S.day} days left)</span></div>` : ''}`;
  let body = '';
  if (tabK === 'book') body = bookBody();
  else if (tabK === 'casino') body = casinoBody();
  else body = passBody();
  return `<div class="col-head">${head('Arena', 'Bets, casino and your season pass. Game money only.')}${tabsBar([['book', '⚽ Sportsbook'], ['casino', '🎰 Casino'], ['pass', '🎟️ Clout Pass']], tabK, 'arenaTab')}</div>
    ${top ? `<div class="sect">${top}</div>` : ''}${body}`;
}
function stakeBtns(act, arg) {
  const v = [10, 100, 1000, 10000, 100000].filter((x) => x <= Math.max(10, S.money));
  const pct = S.money >= 200 ? [[0.1, '10%'], [0.25, '25%']] : [];
  return `<div class="row">${v.map((x) => chip(money(x), act, `${arg}${x}`, false, S.money < x)).join('')}${pct.map(([p, l]) => chip(l, act, `${arg}${Math.floor(S.money * p)}`, false)).join('')}</div>`;
}
function bookBody() {
  if (!S.book) newFixtures();
  const B = S.book;
  const sel = ui.betSel; // {fid, pick}
  const fx = B.fx.filter((f) => !f.done || f.day === S.day);
  const table = Object.entries(B.table).sort((a, b) => b[1] - a[1]).slice(0, 6);
  return `<div class="sect"><div class="row between"><h3>Today's Clout League matches</h3><span class="small ${B.won - B.lost >= 0 ? 'good' : 'bad'}">Season P&L ${B.won - B.lost >= 0 ? '+' : '−'}${money(Math.abs(B.won - B.lost))}</span></div>
    <span class="small muted">Tap odds to pick, choose a stake, then watch it live (and cash out) or let it settle when you sleep.</span>
    ${fx.map((f) => {
      const my = B.bets.filter((b) => b.fid === f.id);
      if (f.live && liveTimer) return liveBox(f);
      return `<div class="match ${f.done ? 'done' : ''}"><div class="teams"><b>${esc(teamName(f.h))}</b><span class="muted">${f.done ? `${f.hg} – ${f.ag}` : 'vs'}</span><b>${esc(teamName(f.a))}</b></div>
        ${f.done ? '' : `<div class="odds">${['h', 'd', 'a', 'o', 'u'].map((k) => `<button class="odd ${sel && sel.fid === f.id && sel.pick === k ? 'on' : ''}" data-act="betPick" data-arg="${f.id}:${k}"><span>${{ h: '1', d: 'X', a: '2', o: 'O2.5', u: 'U2.5' }[k]}</span><b>${f.odds[k].toFixed(2)}</b></button>`).join('')}</div>`}
        ${sel && sel.fid === f.id && !f.done ? `<div class="betslip"><span class="small">${esc(PICK_LABEL(f, sel.pick))} @ <b>${f.odds[sel.pick]}</b>${worldMult('bets') > 1 ? ' <span class="pill gold">+15% Cup boost</span>' : ''}</span>${stakeBtns('betPlace', `${f.id}:${sel.pick}:`)}</div>` : ''}
        ${my.length ? `<div class="mybets">${my.map((b) => `<span class="pill ${b.status === 'won' ? 'good' : b.status === 'lost' ? 'bad' : b.status === 'cashed' ? 'gold' : 'blue'}">${esc(PICK_LABEL(f, b.pick))} ${money(b.stake)} @ ${b.odds}${b.status === 'won' ? ` → ${money(b.pay)}` : b.status === 'cashed' ? ` → cashed ${money(b.pay)}` : b.status === 'lost' ? ' ✗' : ''}</span>`).join('')}</div>` : ''}
        ${!f.done ? btn(`${ico('live')} Watch live`, 'betLive', f.id, 'sm blue', !!liveTimer) : ''}</div>`;
    }).join('')}</div>
    ${table.length ? `<div class="sect"><h3>League table</h3><div class="lgt">${table.map(([k, p], i) => `<div class="row between small"><span>${i + 1}. ${esc(teamName(k))}</span><b>${p} pts</b></div>`).join('')}</div></div>` : ''}
    ${B.history.length ? `<div class="sect"><h3>Recent results</h3><div class="lgt">${B.history.slice(0, 6).map((h) => `<span class="small">Day ${h.d} · ${esc(h.t)}</span>`).join('')}</div></div>` : ''}`;
}
function casinoBody() {
  const C = S.casino || { wagered: 0, net: 0, today: 0, best: 0 };
  const s = ui.slot, w = ui.wheel;
  return `<div class="sect"><div class="row between"><h3>🎰 Clout Slots</h3><span class="small muted">👑👑👑 pays 500×${worldMult('casino') > 1 ? ' (×2 this week!)' : ''}</span></div>
      <div class="reels ${s && s.fresh ? 'spin' : ''}">${(s ? s.reels : ['❔', '❔', '❔']).map((r, i) => `<span style="--d:${i * 0.18}s"><b>${r}</b></span>`).join('')}</div>
      ${s ? `<span class="small ${s.won > s.bet ? 'good' : s.won ? 'warn' : 'bad'}">${s.won ? `Won ${money(s.won)}` : 'No win'} on a ${money(s.bet)} spin</span>` : '<span class="small muted">Three of a kind pays big. Cherries give a little back.</span>'}
      ${stakeBtns('slots', '')}</div>
    <div class="sect"><h3>🎡 Roulette</h3>
      <div class="row">${typeof rouletteSvg === 'function' ? rouletteSvg(w ? w.n : 0, w && w.fresh) : ''}${w ? `<span class="rball ${w.color}">${w.n}</span><span class="small ${w.won ? 'good' : 'bad'}">${w.won ? `Won ${money(w.won)}` : `Lost ${money(w.bet)}`}</span>` : '<span class="small muted">Pick a bet type and a stake.</span>'}</div>
      <div class="scroller">${[['red', 'Red 2×'], ['black', 'Black 2×'], ['even', 'Even 2×'], ['odd', 'Odd 2×'], ['low', '1–18 2×'], ['high', '19–36 2×'], ['zero', 'Zero 36×'], ['lucky', 'Lucky 7 36×']].map(([k, l]) => chip(l, 'rouletteKind', k, (ui.rKind || 'red') === k)).join('')}</div>
      ${stakeBtns('roulette', '')}</div>
    <div class="sect"><h3>🚀 Viral Rocket</h3>${crashBox()}${!ui.crash || ui.crash.state !== 'flying' ? stakeBtns('crash', '') : ''}</div>
    <div class="sect"><h3>Your casino stats</h3><span class="small">Wagered ${money(C.wagered)} · all-time <span class="${C.net >= 0 ? 'good' : 'bad'}">${C.net >= 0 ? '+' : '−'}${money(Math.abs(C.net))}</span> · today <span class="${C.today >= 0 ? 'good' : 'bad'}">${C.today >= 0 ? '+' : '−'}${money(Math.abs(C.today))}</span> · best win ${money(C.best)}</span>
      <span class="small muted">The house always has a small edge. It's play money, but set yourself a limit anyway.</span></div>`;
}
function passBody() {
  const p = passInit();
  const need = p.tier < PASS_TIERS ? passNeed(p.tier + 1) : 1;
  return `<div class="sect"><div class="pass-head"><div><div class="small muted">Season ${p.n} · ends in ${p.ends - S.day} days</div><h3>${SEASON_NAMES[(p.n - 1) % SEASON_NAMES.length]}</h3></div><div class="pass-tier">Tier <b>${p.tier}</b>/${PASS_TIERS}</div></div>
    ${p.tier < PASS_TIERS ? `<div class="tierbar"><i style="width:${(p.xp / need) * 100}%"></i></div><span class="small muted">${fmt(p.xp)} / ${fmt(need)} XP to tier ${p.tier + 1}. Earn XP by posting (+10, viral +40), streaming (+30), challenges (+40), deals (+30), stunts (+25), FanVault drops (+15) and winning bets (+15).</span>` : '<span class="pill gold">Season complete! New season soon.</span>'}
    <div class="pass-grid">${Array.from({ length: PASS_TIERS }, (_, i) => i + 1).map((t) => { const r = passReward(t), got = p.claimed.includes(t), open = t <= p.tier;
      return `<div class="ptier ${got ? 'got' : open ? 'open' : ''} ${t % 10 === 0 ? 'big' : ''}"><span class="pt-n">${t}</span><span class="pt-i">${r.icon}</span><span class="pt-t">${esc(r.text)}</span>${got ? '<span class="pill good">✓</span>' : open ? btn('Claim', 'passClaim', t, 'sm primary') : `<span class="small muted">${ico('lock')}</span>`}</div>`; }).join('')}</div></div>`;
}
function vLegacy() {
  const L = S.legacy || { rank: 0, lp: 0, perks: {}, best: 0 };
  const t = totalFollowers(), can = t >= LEGACY_MIN;
  return `<div class="col-head">${head('Legacy', `Era ${L.rank + 1} · ${L.lp} Legacy points`)}</div>
    <div class="sect"><div class="hint">Hit ${fmt(LEGACY_MIN)} followers, then <b>rebrand</b>: start over as a new era with permanent perks. You keep your skills, gear, property, team, investments and trophies. Followers reset, cash drops to 15%. The bigger you are when you rebrand, the more Legacy points you get.</div>
      <div class="row between"><span>Rebrand now for <b class="gold">${legacyPoints()}</b> Legacy points</span>${can ? btn(ui.confirmRebrand ? 'Yes, rebrand now' : 'Rebrand: start a new era', 'rebrand', '', ui.confirmRebrand ? 'primary' : 'danger') : `<span class="small muted">${ico('lock')} ${fmt(t)} / ${fmt(LEGACY_MIN)} followers</span>`}</div>
      ${L.rank ? `<span class="small muted">Rebrands: ${L.rank} · best era peak: ${fmt(L.best)} followers</span>` : ''}</div>
    <div class="sect"><h3>Permanent perks</h3><div class="cards">${Object.entries(LEGACY_PERKS).map(([k, pk]) => { const lv = legacyLvl(k), cost = lv + 1;
      return `<div class="card ${lv ? 'owned' : ''}"><div class="t"><span>${pk.name}</span><span class="pill gold">Lv ${lv}/${pk.max}</span></div><span class="small muted">${pk.desc} per level</span>${lv >= pk.max ? '<span class="pill good">Maxed</span>' : btn(`Upgrade · ${cost} LP`, 'legacyBuy', k, 'sm primary', L.lp < cost)}</div>`; }).join('')}</div></div>`;
}

const ENDGAME_ACT = {
  arenaTab: (a) => { ui.arenaTab = a; },
  betPick: (a) => { const [f, p] = a.split(':'); ui.betSel = ui.betSel && ui.betSel.fid === +f && ui.betSel.pick === p ? null : { fid: +f, pick: p }; },
  betPlace: (a) => { const [f, p, v] = a.split(':'); placeBet(+f, p, +v); ui.betSel = null; },
  betLive: (a) => { startLive(+a); },
  betCash: (a) => { cashOut(+a); },
  slots: (a) => { playSlots(+a); },
  rouletteKind: (a) => { ui.rKind = a; },
  roulette: (a) => { playRoulette(ui.rKind || 'red', +a); },
  crash: (a) => { startCrash(+a); },
  crashCash: () => { crashCash(); },
  passClaim: (a) => { const p = passInit(), t = +a; if (t > p.tier || p.claimed.includes(t)) return 'norender'; p.claimed.push(t); passReward(t).fx(); toast(`Clout Pass reward claimed: ${passReward(t).text}`, 'gold'); sound('cash'); if (t % 10 === 0) celebrate('gold'); },
  rebrand: () => { if (!ui.confirmRebrand) { ui.confirmRebrand = true; toast('Tap Rebrand again to confirm. Followers reset; you keep 15% of your cash.', 'bad'); return; } ui.confirmRebrand = false; rebrand(); },
  legacyBuy: (a) => { const L = S.legacy; const cost = legacyLvl(a) + 1; if (!L || L.lp < cost || legacyLvl(a) >= LEGACY_PERKS[a].max) return 'norender'; L.lp -= cost; L.perks[a] = legacyLvl(a) + 1; toast(`${LEGACY_PERKS[a].name} is now level ${L.perks[a]}`, 'gold'); },
};

/* ---------- trophies for the long game ---------- */
ACHIEVEMENTS.push(
  ['bet1', 'Punter', 'Win a sports bet', () => (S.stats.betWins || 0) >= 1],
  ['longshot', 'Longshot legend', 'Win a bet at 5× odds or more', () => (S.stats.longshots || 0) >= 1],
  ['jackpot', 'Jackpot!', 'Win 20× your bet at the casino', () => (S.stats.jackpots || 0) >= 1],
  ['pass30', 'Season champion', 'Reach tier 30 of a Clout Pass', () => (S.stats.passDone || 0) >= 1],
  ['era2', 'New era', 'Rebrand for the first time', () => (S.stats.rebrands || 0) >= 1],
  ['era5', 'Reinvention icon', 'Rebrand five times', () => (S.stats.rebrands || 0) >= 5],
  ['b1', 'Billion club', 'Reach 1,000,000,000 followers', () => totalFollowers() >= 1e9],
);
