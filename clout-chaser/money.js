/* Clout Chaser — ways to make money: subscriptions, tips, affiliate links, gigs, markets, property, courses; plus the bigger shop */
'use strict';

/* ---------- more shop ---------- */
SHOP.push(
  { id: 'gimbal',      cat: 'Gear', name: 'Gimbal stabilizer',  price: 600,   q: 0.06, plats: ['clipz', 'tube', 'pix'], desc: '+6% quality on video. No more shaky footage.' },
  { id: 'teleprompter', cat: 'Gear', name: 'Teleprompter',      price: 450,   q: 0.05, plats: ['tube', 'live'], desc: '+5% on long video and streams.' },
  { id: 'greenscreen', cat: 'Gear', name: 'Green screen kit',   price: 900,   q: 0.06, plats: ['clipz', 'tube'], desc: '+6% on shorts and long video. Teleport anywhere.' },
  { id: 'glasses',     cat: 'Gear', name: 'POV smart glasses',  price: 1500,  q: 0.07, plats: ['pix', 'clipz'], desc: '+7% on photos and shorts. First-person everything.' },
  { id: 'podstudio',   cat: 'Gear', name: 'Podcast studio',     price: 8000,  q: 0.1,  plats: ['tube', 'live'], desc: '+10% on long video and streams.' },
  { id: 'pet',         cat: 'Lifestyle', name: 'Golden retriever', price: 1500, reach: 0.02, desc: 'Unlocks pet content (big engagement). −3 stress every day.' },
  { id: 'sneakers',    cat: 'Lifestyle', name: 'Grail sneakers',  price: 1200,  reach: 0.02, desc: '+2% reach. Sneakerheads notice.' },
  { id: 'watch',       cat: 'Lifestyle', name: 'Luxury watch',    price: 25000, reach: 0.03, desc: '+3% reach. The wrist shot is a genre.' },
  { id: 'penthouse',   cat: 'Lifestyle', name: 'City penthouse',  price: 6e6,   reach: 0.08, upkeep: 3000, desc: '+8% reach, skyline content. $3K/day.' },
  { id: 'yacht',       cat: 'Lifestyle', name: 'Superyacht',      price: 8e6,   reach: 0.1, upkeep: 6000, desc: '+10% reach. Monaco-ready. $6K/day.' },
  { id: 'team_owner',  cat: 'Lifestyle', name: 'Buy a sports team', price: 3e8, reach: 0.2, upkeep: 50000, desc: '+20% reach. You are now a "visionary".' },
  { id: 'studio_apt',  cat: 'Property', name: 'Studio apartment', price: 80000,  rent: 140,   desc: 'Rent it out: +$140/day.' },
  { id: 'condo',       cat: 'Property', name: 'Downtown condo',   price: 400000, rent: 750,   desc: 'Rent it out: +$750/day.' },
  { id: 'villa',       cat: 'Property', name: 'Beach villa',      price: 2e6,    rent: 4200,  desc: 'Holiday rentals: +$4.2K/day.' },
  { id: 'tower',       cat: 'Property', name: 'Office tower',     price: 1.5e7,  rent: 36000, desc: 'Corporate tenants: +$36K/day.' },
);
CONSUMABLES.push(
  { id: 'megadrink',   name: 'Energy pack (×6)',   price: 60,   desc: '+50 energy, +12 stress.', fx: { energy: 50, stress: 12 } },
  { id: 'photographer', name: 'Pro photographer (today)', price: 300, desc: '+30% post quality for the rest of today.', special: 'photo' },
  { id: 'lucky',       name: 'Lucky charm (today)', price: 150,  desc: '+4% viral chance on every post today.', special: 'lucky' },
  { id: 'trendreport', name: 'Trend forecast',      price: 250,  desc: 'Get a brand-new trend that fits your niche, before anyone else.', special: 'trend' },
  { id: 'crisis',      name: 'Crisis PR kit',       price: 2500, desc: '−30 heat, +2 reputation.', fx: { heat: -30, rep: 2 } },
  { id: 'botclean',    name: 'Bot cleanup',         price: 1000, desc: 'Remove 60% of your fake followers. +2 reputation.', special: 'botclean' },
);

/* Cosmetics: avatar frames and profile banners */
const FRAMES = {
  gold:    { name: 'Gold ring',    price: 500,    css: 'conic-gradient(#FFD400, #F5A623, #FFD400)' },
  neon:    { name: 'Neon ring',    price: 2000,   css: 'conic-gradient(#FF2E9A, #21D4FD, #B6FF3B, #FF2E9A)' },
  fire:    { name: 'On fire',      price: 10000,  css: 'conic-gradient(#FF3D00, #FFC400, #FF6D00, #FF3D00)' },
  diamond: { name: 'Diamond',      price: 100000, css: 'conic-gradient(#E0F7FF, #7FDBFF, #FFFFFF, #B3E5FC, #E0F7FF)' },
};
const BANNERS = {
  sunset:  { name: 'Sunset',  price: 300,   css: 'linear-gradient(120deg, #FF7E5F, #FEB47B 60%, #6A3093)' },
  aurora:  { name: 'Aurora',  price: 1500,  css: 'linear-gradient(120deg, #00C9A7, #845EC2 55%, #0B132B)' },
  matrix:  { name: 'Matrix',  price: 5000,  css: 'repeating-linear-gradient(90deg, #031 0 6px, #052 6px 7px), linear-gradient(#0f2, #000)' },
  galaxy:  { name: 'Galaxy',  price: 25000, css: 'radial-gradient(circle at 20% 30%, #fff8 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, #fff6 0 2px, transparent 3px), linear-gradient(120deg, #1B1464, #6A0572 50%, #0B0B2B)' },
};

/* ---------- markets ---------- */
const ASSETS = {
  wld:   { name: 'World Index',  tick: 'WLD',  price: 100,  vol: 0.012, drift: 0.0007 },
  pear:  { name: 'Pear Inc.',    tick: 'PEAR', price: 180,  vol: 0.028, drift: 0.0009 },
  tezla: { name: 'Tezla',        tick: 'TZLA', price: 240,  vol: 0.055, drift: 0.0008 },
  nflx:  { name: 'Netflux',      tick: 'NFLX', price: 90,   vol: 0.032, drift: 0.0006 },
  clt:   { name: 'CloutCoin',    tick: 'CLT',  price: 1.2,  vol: 0.13,  drift: 0.001 },
};
const MARKET_NEWS = [
  ['tezla', 0.14, 'Elon Tusk posts "rocket go up". Tezla rallies.'], ['tezla', -0.16, 'A Cybertruck window shatters on live TV. Tezla slides.'],
  ['pear', 0.09, 'Pear 17 preorders sell out in an hour.'], ['pear', -0.08, 'Pear 17 is "the same, but more". Analysts yawn.'],
  ['nflx', 0.12, 'Netflux\'s new true-crime doc breaks records.'], ['nflx', -0.1, 'Netflux cancels the show everyone liked.'],
  ['clt', 0.45, 'A mega-influencer shills CloutCoin. It moons.'], ['clt', -0.5, 'CloutCoin dev wallet dumps. Chaos.'],
  ['wld', -0.06, 'Markets wobble on rate fears.'], ['wld', 0.05, 'Strong jobs report lifts everything.'],
];
function marketInit() {
  if (S.market) return;
  S.market = { p: {}, h: {}, q: {}, c: {} };
  for (const [k, a] of Object.entries(ASSETS)) { S.market.p[k] = a.price; S.market.h[k] = [a.price]; S.market.q[k] = 0; S.market.c[k] = 0; }
}
function marketTick() {
  marketInit();
  const m = S.market;
  let headline = null;
  if (chance(0.25)) { const [k, shock, h] = pick(MARKET_NEWS); m.p[k] *= 1 + shock * rnd(0.6, 1.2); headline = h; news(`Markets: ${h}`); }
  for (const [k, a] of Object.entries(ASSETS)) {
    const g = (Math.random() + Math.random() + Math.random() - 1.5) * 1.4;
    m.p[k] = Math.max(0.01, m.p[k] * (1 + a.drift + a.vol * g));
    m.h[k].push(+m.p[k].toFixed(4)); if (m.h[k].length > 40) m.h[k].shift();
  }
  return headline;
}
const holdingsValue = () => { marketInit(); return Object.keys(ASSETS).reduce((a, k) => a + S.market.q[k] * S.market.p[k], 0); };
function buyAsset(k, amt) {
  marketInit();
  amt = Math.min(amt, S.money); if (amt < 1) return false;
  const m = S.market, q = amt / m.p[k];
  m.c[k] = (m.c[k] * m.q[k] + amt) / (m.q[k] + q); m.q[k] += q; S.money -= amt;
  log(`Bought ${money(amt)} of ${ASSETS[k].tick}.`); return true;
}
function sellAsset(k, frac) {
  marketInit();
  const m = S.market, q = m.q[k] * frac; if (q <= 0) return 0;
  const val = q * m.p[k], gain = (m.p[k] - m.c[k]) * q;
  m.q[k] -= q; if (m.q[k] < 1e-9) { m.q[k] = 0; m.c[k] = 0; }
  S.money += val; if (gain > 0) S.stats.earned += gain;
  S.stats.tradeProfit = (S.stats.tradeProfit || 0) + gain;
  log(`Sold ${ASSETS[k].tick} for ${money(val)} (${gain >= 0 ? '+' : '−'}${money(Math.abs(gain))}).`, gain >= 0 ? 'good' : 'bad');
  return gain;
}

/* ---------- subscriptions ---------- */
const SUB_PRICES = { 2.99: 0.014, 4.99: 0.009, 9.99: 0.0045, 19.99: 0.0018 };
function subsTarget() {
  const s = S.subs; if (!s || !s.on) return 0;
  return Math.round(totalFollowers() * realRatio() * SUB_PRICES[s.price] * clamp(engRate() / 6, 0.4, 2) * clamp(S.rep / 60, 0.2, 1.5) * (S.day - (s.lastEx || 0) <= 4 ? 1 : 0.6));
}

/* ---------- gigs: paid opportunities in your inbox ---------- */
function makeGig(kind, extra = {}) {
  const t = totalFollowers();
  const G = {
    shoutout:   { subject: 'Paid shoutout request', body: `A small creator, @${fanHandle()}, will pay you to shout them out. Quick money, fans may roll their eyes.`, pay: Math.max(60, t * 0.004), e: 5, rep: -0.3 },
    appearance: { subject: 'Club appearance', body: `A nightclub wants you to "host" Saturday night. Show up, wave, take photos.`, pay: Math.max(400, t * 0.02), e: 30, stress: 12 },
    keynote:    { subject: 'Speaking gig', body: 'A marketing conference wants you on stage for 20 minutes about "authenticity".', pay: Math.max(1500, t * 0.03), e: 25, stress: 6, rep: 1 },
    license:    { subject: 'License your viral clip', body: 'A media company wants to license your viral clip for a compilation.', pay: Math.max(200, extra.views ? extra.views * 0.0006 : t * 0.01), e: 0 },
    cameo:      { subject: 'Movie cameo', body: 'A director wants you for a 10-second cameo as "influencer #2".', pay: Math.max(5000, t * 0.05), e: 35, stress: 10, rep: 1, fp: 0.02 },
  }[kind];
  mail({ type: 'gig', kind, from: kind === 'license' ? 'ClipVault Media' : kind === 'cameo' ? 'Paramountain Pictures' : kind === 'keynote' ? 'GrowthCon' : kind === 'appearance' ? 'Club Neon' : '@' + fanHandle(), subject: G.subject, body: G.body, pay: Math.round(G.pay / 5) * 5, e: G.e, stress: G.stress || 0, rep: G.rep || 0, fp: G.fp || 0 });
}
function acceptGig(m) {
  if (S.energy < m.e) { toast(`You need ${m.e} energy for this gig.`, 'bad'); return false; }
  S.energy -= m.e;
  applyFx({ money: m.pay, stress: m.stress, rep: m.rep, fp: m.fp });
  S.stats.gigs = (S.stats.gigs || 0) + 1;
  if (m.kind === 'appearance' && chance(0.2)) S.queue.push({ ev: 'paparazzi', ctx: {} });
  log(`Gig done (${m.subject}): ${money(m.pay)}.`, 'good');
  return true;
}

/* ---------- daily money tick, called from endDay ---------- */
function moneyTick(lines) {
  // rent
  let rent = 0; for (const it of SHOP) if (S.owned[it.id] && it.rent) rent += it.rent;
  if (rent) { S.money += rent; S.stats.earned += rent; lines.push(['Rental income', rent]); }
  // subscriptions
  if (S.subs && S.subs.on) {
    const target = subsTarget();
    S.subs.count = Math.max(0, Math.round(S.subs.count + (target - S.subs.count) * 0.35));
    const inc = Math.round(S.subs.count * S.subs.price * 0.7 / 30);
    if (inc) { S.money += inc; S.stats.earned += inc; lines.push([`Subscriptions (${fmt(S.subs.count)} subs)`, inc]); }
  }
  // course
  if (S.course) {
    const sales = Math.round(totalFollowers() * realRatio() * 0.00003 * clamp(S.rep / 60, 0.2, 1.5) * (S.course.hype || 1) * rnd(0.6, 1.4));
    const inc = sales * 49; S.course.sold += sales; S.course.hype = Math.max(1, (S.course.hype || 1) * 0.9);
    if (inc) { S.money += inc; S.stats.earned += inc; lines.push([`Course sales (${fmt(sales)})`, inc]); }
  }
  // pet
  if (S.owned.pet) S.stress = clamp(S.stress - 3, 0, 100);
  // markets
  const h = marketTick();
  if (h && Object.values(S.market.q).some((q) => q > 0)) lines.push([`Markets: ${h}`, 0]);
  // gigs
  const t = totalFollowers(), ti = tierIndex();
  if (t >= 800 && chance(0.25 + ti * 0.05)) makeGig('shoutout');
  if (t >= 10000 && chance(0.12 + ti * 0.03)) makeGig('appearance');
  if (t >= 100000 && chance(0.08)) makeGig('keynote');
  if (t >= 1e6 && chance(0.05)) makeGig('cameo');
  S.lastIncome = lines.filter(([, v]) => v > 0);
}
function consumeSpecial(k) {
  if (k === 'photo') { S.flags.photoDay = S.day; toast('Photographer booked. Every post today looks incredible.', 'gold'); }
  if (k === 'lucky') { S.flags.luckyDay = S.day; toast('Lucky charm active for today. 🍀', 'gold'); }
  if (k === 'trend') { const pool = TREND_POOL.filter((x) => (x.niches.includes(S.niche) || x.niches.includes('all')) && !S.trends.some((y) => y.tag === x.tag)); const x = pick(pool.length ? pool : TREND_POOL); S.trends.unshift({ tag: x.tag, niches: x.niches, edgy: !!x.edgy, born: S.day, life: 5, hot: 1.4 }); toast(`New trend for you: ${x.tag}`, 'gold'); }
  if (k === 'botclean') { const rm = S.fake * 0.6; S.fake -= rm; S.platforms.pix.followers = Math.max(0, S.platforms.pix.followers - rm); changeRep(2); toast(rm >= 1 ? `Removed ${fmt(rm)} bots.` : 'No bots found. Your audience is clean.'); }
}

/* ---------- Money screen ---------- */
function sparkline(arr, w = 120, h = 34) {
  if (!arr || arr.length < 2) return '';
  const min = Math.min(...arr), max = Math.max(...arr), span = max - min || 1;
  const pts = arr.map((v, i) => `${((i / (arr.length - 1)) * w).toFixed(1)},${(h - ((v - min) / span) * (h - 4) - 2).toFixed(1)}`).join(' ');
  const up = arr[arr.length - 1] >= arr[0];
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${up ? 'var(--good)' : 'var(--bad)'}" stroke-width="2" stroke-linejoin="round"/></svg>`;
}
function vMoney() {
  marketInit();
  const t = totalFollowers();
  const inc = S.lastIncome || [];
  const incTot = inc.reduce((a, [, v]) => a + v, 0);
  const maxI = Math.max(1, ...inc.map(([, v]) => v));
  const netWorth = S.money + S.savings + holdingsValue() + SHOP.filter((it) => S.owned[it.id] && it.cat === 'Property').reduce((a, it) => a + it.price, 0);
  const subs = S.subs || { on: false, price: 4.99, count: 0 };
  const m = S.market;
  return `<div class="col-head">${head('Money', `Net worth ${money(netWorth)}`)}</div>
    <div class="sect"><div class="wallet"><div><div class="small muted">Cash</div><div class="big">${money(S.money)}</div></div><div><div class="small muted">Investments</div><div class="big">${money(holdingsValue())}</div></div><div><div class="small muted">Yesterday's income</div><div class="big good">${money(incTot)}</div></div></div>
      ${inc.length ? `<div class="bars">${inc.map(([k, v]) => `<div class="bar-row"><span class="small" title="${esc(k)}">${esc(k.split(' (')[0])}</span><div class="track"><i style="width:${(v / maxI) * 100}%;background:var(--gold)"></i></div><span class="n">${money(v)}</span></div>`).join('')}</div>` : '<p class="small muted">Sleep once to see where your money comes from.</p>'}</div>
    <div class="sect"><div class="row between"><h3>${ico('star')} Fan subscriptions</h3>${subs.on ? `<span class="pill good">${fmt(subs.count)} subscribers</span>` : ''}</div>
      ${t < 1000 ? `<span class="small muted">${ico('lock')} Unlocks at 1K followers.</span>` : !subs.on ? `<p class="small muted">Fans pay monthly for exclusive posts. Keep posting exclusives or they cancel.</p><div>${btn('Turn on subscriptions', 'subsOn', '', 'primary')}</div>` : `
      <div class="row">${Object.keys(SUB_PRICES).map((p) => chip(`$${p}/mo`, 'subsPrice', p, String(subs.price) === p)).join('')}</div>
      <span class="small muted">Cheaper means more subscribers; pricier means fewer but more per fan. About ${fmt(subsTarget())} fans want in at this price. You keep 70%.</span>
      <div class="row">${btn(`${ico('feather')} Post exclusive content · 12`, 'subsPost', '', 'sm blue', S.energy < 12 || subs.lastEx === S.day)}<span class="small ${S.day - (subs.lastEx || 0) > 4 ? 'bad' : 'muted'}">${subs.lastEx ? `Last exclusive: day ${subs.lastEx}` : 'No exclusives yet'}${S.day - (subs.lastEx || 0) > 4 ? ' · subscribers are cancelling' : ''}</span></div>`}</div>
    <div class="sect"><h3>${ico('chart')} Markets</h3><span class="small muted">Prices move every night. News moves them a lot. Not financial advice, but definitely financial chaos.</span>
      ${Object.entries(ASSETS).map(([k, a]) => { const p = m.p[k], h = m.h[k], ch = h.length > 1 ? (p / h[h.length - 2] - 1) * 100 : 0, own = m.q[k] * p, pl = (p - m.c[k]) * m.q[k];
        return `<div class="asset"><div style="min-width:0"><b>${a.tick}</b> <span class="small muted">${a.name}</span><div class="num">${p < 10 ? '$' + p.toFixed(3) : money(p)} <span class="${ch >= 0 ? 'good' : 'bad'} small">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch).toFixed(1)}%</span></div>${own > 0.5 ? `<div class="small">You own ${money(own)} <span class="${pl >= 0 ? 'good' : 'bad'}">(${pl >= 0 ? '+' : '−'}${money(Math.abs(pl))})</span></div>` : ''}</div>${sparkline(h)}<div class="row" style="justify-content:flex-end">${[[100, '$100'], [1000, '$1K'], [10000, '$10K']].map(([v, l]) => btn(`+${l}`, 'buy$', `${k}:${v}`, 'sm', S.money < v, `Buy ${money(v)}`)).join('')}${own > 0.5 ? btn('Sell ½', 'sell$', `${k}:0.5`, 'sm', false, 'Sell half') + btn('Sell all', 'sell$', `${k}:1`, 'sm danger') : ''}</div></div>`; }).join('')}
      ${S.stats.tradeProfit ? `<span class="small ${S.stats.tradeProfit >= 0 ? 'good' : 'bad'}">Realized trading P&L: ${S.stats.tradeProfit >= 0 ? '+' : '−'}${money(Math.abs(S.stats.tradeProfit))}</span>` : ''}</div>
    <div class="sect"><h3>${ico('brief')} Online course</h3>${S.course ? `<span class="small">Sold ${fmt(S.course.sold)} copies at $49 · hype ×${(S.course.hype || 1).toFixed(1)}</span><div>${btn('Promote it · 15', 'coursePush', '', 'sm', S.energy < 15)}</div>` : t >= 50000 ? `<p class="small muted">"How I Went Viral (And You Can Too)". $49, sells every day.</p><div>${btn('Record and launch · $15,000', 'courseLaunch', '', 'primary', S.money < 15000)}</div>` : `<span class="small muted">${ico('lock')} Unlocks at 50K followers.</span>`}</div>
    <div class="sect"><h3>More ways to earn</h3><div class="small muted" style="display:flex;flex-direction:column;gap:4px">
      <span>• Every post earns tips, more with high reputation and superfans.</span>
      <span>• Add an affiliate link when you post for a commission on views (fans notice if you overdo it).</span>
      <span>• Paid gigs land in Messages: shoutouts, club appearances, speaking, clip licensing, movie cameos.</span>
      <span>• Rental property lives in the Shop. Merch, your brand and the podcast are in Empire.</span></div></div>`;
}

const MONEY_ACT = {
  subsOn: () => { S.subs = { on: true, price: 4.99, count: 0, lastEx: S.day }; toast('Subscriptions are live. Post exclusives to keep fans paying.', 'gold'); },
  subsPrice: (a) => { S.subs.price = +a; },
  subsPost: () => { if (!needEnergy(12)) return 'norender'; S.subs.lastEx = S.day; S.subs.count = Math.round(S.subs.count * 1.03 + 3); unlockedIds().forEach((p) => { S.platforms[p].eng = clamp(S.platforms[p].eng + 0.1, 0.5, 30); }); toast('Exclusive posted. Subscribers are happy.'); },
  'buy$': (a) => { const [k, v] = a.split(':'); if (!buyAsset(k, +v)) toast('Not enough cash.', 'bad'); },
  'sell$': (a) => { const [k, f] = a.split(':'); const g = sellAsset(k, +f); toast(`${g >= 0 ? 'Profit' : 'Loss'}: ${money(Math.abs(g))}`, g >= 0 ? 'gold' : 'bad'); },
  courseLaunch: () => { if (!spend(15000)) return 'norender'; S.course = { sold: 0, hype: 3 }; news(`@${S.handle} launches an online course. The comments are divided.`, true); toast('Course launched. Sales arrive every night.', 'gold'); },
  coursePush: () => { if (!needEnergy(15)) return 'norender'; S.course.hype += 1.5; toast('Course promo posted.'); },
  frame: (a) => { const f = FRAMES[a]; S.frames = S.frames || []; if (!S.frames.includes(a)) { if (!spend(f.price)) { toast('Not enough money.', 'bad'); return 'norender'; } S.frames.push(a); } S.frame = S.frame === a ? null : a; },
  banner: (a) => { const b = BANNERS[a]; S.banners = S.banners || []; if (!S.banners.includes(a)) { if (!spend(b.price)) { toast('Not enough money.', 'bad'); return 'norender'; } S.banners.push(a); } S.banner = S.banner === a ? null : a; },
};
