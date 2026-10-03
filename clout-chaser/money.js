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
  { id: 'hyper',       cat: 'Garage', name: 'Hypercar',        price: 2.5e6, reach: 0.05, upkeep: 1500, desc: '+5% reach. 0 to 100 in 2.3 seconds. Parks in your scene.' },
  { id: 'cabin',       cat: 'Property', name: 'Mountain cabin',  price: 6e5,   rent: 260,   desc: 'Ski-season rentals: +$260/day. A snowy new scene.' },
  { id: 'loft',        cat: 'Property', name: 'Industrial loft', price: 1.2e6, rent: 500,   desc: 'Brick, steel, big windows: +$500/day.' },
  { id: 'lakehouse',   cat: 'Property', name: 'Lake house',      price: 3.5e6, rent: 1400,  desc: 'Private dock: +$1.4K/day.' },
  { id: 'palace',      cat: 'Property', name: 'Desert palace',   price: 1.5e7, rent: 6200,  desc: 'Domes, pools, sunsets: +$6.2K/day.' },
  { id: 'castle',      cat: 'Property', name: 'Castle estate',   price: 4e7,   rent: 16000, desc: 'Weddings every weekend: +$16K/day.' },
  { id: 'heli',        cat: 'Lifestyle', name: 'Helicopter',      price: 3e6,   reach: 0.06, upkeep: 2500, desc: '+6% reach. Lands on your rooftop.' },
  { id: 'yacht',       cat: 'Lifestyle', name: 'Superyacht',      price: 8e6,   reach: 0.1, upkeep: 6000, desc: '+10% reach. Monaco-ready. $6K/day.' },
  { id: 'team_owner',  cat: 'Lifestyle', name: 'Buy a sports team', price: 3e8, reach: 0.2, upkeep: 50000, desc: '+20% reach. You are now a "visionary".' },
  { id: 'studio_apt',  cat: 'Property', name: 'Studio apartment', price: 80000,  rent: 100,   desc: 'Rent it out: +$100/day.' },
  { id: 'condo',       cat: 'Property', name: 'Downtown condo',   price: 400000, rent: 520,   desc: 'Rent it out: +$520/day.' },
  { id: 'villa',       cat: 'Property', name: 'Beach villa',      price: 2e6,    rent: 2900,  desc: 'Holiday rentals: +$2.9K/day.' },
  { id: 'tower',       cat: 'Property', name: 'Office tower',     price: 1.5e7,  rent: 25000, desc: 'Corporate tenants: +$25K/day.' },
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
  wld:   { name: 'World Index', tick: 'WLD',  price: 100, vol: 0.012, drift: 0.0024, div: 0.0012, desc: 'Steady. Pays a daily dividend.' },
  pear:  { name: 'Pear Inc.',   tick: 'PEAR', price: 180, vol: 0.025, drift: 0.003, div: 0.0006, desc: 'Blue chip with a dividend.' },
  tezla: { name: 'Tezla',       tick: 'TZLA', price: 240, vol: 0.05,  drift: 0.0042, desc: 'Wild swings, big runs.' },
  nflx:  { name: 'Netflux',     tick: 'NFLX', price: 90,  vol: 0.03,  drift: 0.0036, div: 0.0005, desc: 'Moves on hit shows.' },
  clt:   { name: 'CloutCoin',   tick: 'CLT',  price: 1.2, vol: 0.12,  drift: 0.0072, desc: 'Pure chaos. Can 10x or go to zero.' },
};
const MARKET_NEWS = [
  ['tezla', 0.14, 'Elon Tusk posts "rocket go up". Tezla rallies.'], ['tezla', -0.12, 'A Cybertruck window shatters on live TV. Tezla slides.'],
  ['pear', 0.09, 'Pear 17 preorders sell out in an hour.'], ['pear', -0.06, 'Pear 17 is "the same, but more". Analysts yawn.'],
  ['nflx', 0.12, 'Netflux\'s new true-crime doc breaks records.'], ['nflx', -0.08, 'Netflux cancels the show everyone liked.'],
  ['clt', 0.45, 'A mega-influencer shills CloutCoin. It moons.'], ['clt', -0.35, 'CloutCoin dev wallet dumps. Chaos.'],
  ['wld', -0.04, 'Markets wobble on rate fears.'], ['wld', 0.05, 'Strong jobs report lifts everything.'],
];
const TIPSTERS = ['@WallStBets_Wendy', '@ChartWizard', '@DiamondHandsDan', '@Finfluencer_Fiona', '@InsiderIvy', '@TheCandleGuy'];
/* Tomorrow's whisper: a tip about a big move. Reliability grows with business skill and a talent manager. */
const tipAccuracy = () => clamp(0.6 + skillLvl('business') * 0.03 + 0.08 * tm('manager') + 0.1 * tm('investor') + SB('tips'), 0.6, 0.97);
function newTip() {
  const k = pick(Object.keys(ASSETS)), up = chance(0.6);
  S.market.tip = { k, up, who: pick(TIPSTERS), size: k === 'clt' ? rnd(0.25, 0.6) : rnd(0.07, 0.18) };
}
function marketInit() {
  if (!S.market) S.market = { p: {}, h: {}, q: {}, c: {} };
  const m = S.market;
  for (const [k, a] of Object.entries(ASSETS)) { if (m.p[k] == null) { m.p[k] = a.price; m.h[k] = [a.price]; m.q[k] = 0; m.c[k] = 0; } }
  m.trend = m.trend || {};
  if (!m.tip) newTip();
}
function marketTick(lines) {
  marketInit();
  const m = S.market, before = holdingsValue();
  let headline = null;
  // yesterday's tip plays out (usually)
  const tip = m.tip;
  if (tip) {
    const right = chance(tipAccuracy());
    m.p[tip.k] *= 1 + (tip.up === right ? 1 : -1) * tip.size;
    m.lastTip = { ...tip, right };
  }
  if (chance(0.25)) { const [k, shock, h] = pick(MARKET_NEWS); m.p[k] *= 1 + shock * rnd(0.6, 1.2); headline = h; news(`Markets: ${h}`); }
  for (const [k, a] of Object.entries(ASSETS)) {
    // momentum: bull and bear runs last a few days
    if (m.trend[k] == null || chance(0.18)) m.trend[k] = +(rnd(-1, 1) + 0.25).toFixed(2);
    const g = (Math.random() + Math.random() + Math.random() - 1.5) * 1.4;
    m.p[k] = Math.max(0.01, m.p[k] * (1 + a.drift + a.vol * (k === 'clt' && typeof worldMult === 'function' ? worldMult('crypto') : 1) * (g * 0.8 + m.trend[k] * 0.6)));
    m.h[k].push(+m.p[k].toFixed(4)); if (m.h[k].length > 40) m.h[k].shift();
  }
  // dividends
  let div = 0; for (const [k, a] of Object.entries(ASSETS)) if (a.div && m.q[k] > 0) div += m.q[k] * m.p[k] * a.div;
  div = Math.round(div);
  if (div) { S.money += div; S.stats.earned += div; }
  newTip();
  if (lines) {
    const dv = Math.round(holdingsValue() - before);
    if (before > 1 || dv) lines.push([`Portfolio ${dv >= 0 ? 'up' : 'down'} ${money(Math.abs(dv))} overnight`, 0]);
    if (div) lines.push(['Stock dividends', div]);
    if (m.lastTip && before > 1) lines.push([`Tip from ${m.lastTip.who} was ${m.lastTip.right ? 'right ✅' : 'wrong ❌'}`, 0]);
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

/* ---------- gigs: paid opportunities in your inbox ---------- */
function makeGig(kind, extra = {}) {
  const t = totalFollowers();
  const G = {
    shoutout:   { subject: 'Paid shoutout request', body: `A small creator, @${fanHandle()}, will pay you to shout them out. Quick money, fans may roll their eyes.`, pay: Math.max(60, t * 0.004), e: 5, rep: -0.3 },
    appearance: { subject: 'Club appearance', body: `A nightclub wants you to "host" Saturday night. Show up, wave, take photos.`, pay: Math.max(400, t * 0.02), e: 30, stress: 12 },
    movie:      { subject: 'Lead role in a movie', body: 'A studio wants you to star in "Influenced", a thriller about a creator who goes too far. Three weeks of filming.', pay: Math.max(250000, t * 0.12), e: 60, stress: 25, rep: 3, fp: 0.06 },
    halftime:   { subject: 'Halftime show guest', body: 'The Clout Bowl wants you on stage at halftime. 120 million people watching.', pay: Math.max(500000, t * 0.08), e: 50, stress: 20, rep: 2, fp: 0.08 },
    reality:    { subject: 'Your own reality show', body: 'A streaming service wants a docuseries about your life. Cameras everywhere for a month.', pay: Math.max(120000, t * 0.06), e: 45, stress: 30, rep: -1, fp: 0.07 },
    keynote:    { subject: 'Speaking gig', body: 'A marketing conference wants you on stage for 20 minutes about "authenticity".', pay: Math.max(1500, t * 0.03), e: 25, stress: 6, rep: 1 },
    license:    { subject: 'License your viral clip', body: 'A media company wants to license your viral clip for a compilation.', pay: Math.max(200, extra.views ? extra.views * 0.0006 : t * 0.01), e: 0 },
    cameo:      { subject: 'Movie cameo', body: 'A director wants you for a 10-second cameo as "influencer #2".', pay: Math.max(5000, t * 0.05), e: 35, stress: 10, rep: 1, fp: 0.02 },
  }[kind];
  mail({ type: 'gig', kind, from: kind === 'movie' ? 'Paramountain Pictures' : kind === 'halftime' ? 'The Clout Bowl' : kind === 'reality' ? 'Netflux Originals' : kind === 'license' ? 'ClipVault Media' : kind === 'cameo' ? 'Paramountain Pictures' : kind === 'keynote' ? 'GrowthCon' : kind === 'appearance' ? 'Club Neon' : '@' + fanHandle(), subject: G.subject, body: G.body, pay: Math.round(G.pay * (1 + 0.3 * tm('agent')) / 5) * 5, e: G.e, stress: G.stress || 0, rep: G.rep || 0, fp: G.fp || 0 });
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
  // course
  if (S.course) {
    const sales = Math.round(totalFollowers() * realRatio() * 0.00003 * clamp(S.rep / 60, 0.2, 1.5) * (S.course.hype || 1) * rnd(0.6, 1.4));
    const inc = sales * 49; S.course.sold += sales; S.course.hype = Math.max(1, (S.course.hype || 1) * 0.9);
    if (inc) { S.money += inc; S.stats.earned += inc; lines.push([`Course sales (${fmt(sales)})`, inc]); }
  }
  // pet
  if (S.owned.pet) S.stress = clamp(S.stress - 3, 0, 100);
  // markets
  if (S.team.investor) investorTick(lines);
  const h = marketTick(lines);
  if (h && Object.values(S.market.q).some((q) => q > 0)) lines.push([`Markets: ${h}`, 0]);
  // gigs
  const t = totalFollowers(), ti = tierIndex();
  const gx = 1 + 0.6 * tm('agent');
  if (t >= 800 && chance((0.25 + ti * 0.05) * gx)) makeGig('shoutout');
  if (t >= 10000 && chance((0.12 + ti * 0.03) * gx)) makeGig('appearance');
  if (t >= 100000 && chance(0.08 * gx)) makeGig('keynote');
  if (t >= 1e6 && chance(0.05 * gx)) makeGig('cameo');
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
  return `<div class="col-head">${head('Money', `Net worth ${money(netWorth())}`)}</div>
    <div class="sect"><div class="wallet"><div><div class="small muted">Cash</div><div class="big">${money(S.money)}</div></div><div><div class="small muted">Investments</div><div class="big">${money(holdingsValue())}</div></div><div><div class="small muted">Yesterday's income</div><div class="big good">${money(incTot)}</div></div></div>
      ${inc.length ? `<div class="bars">${inc.map(([k, v]) => `<div class="bar-row"><span class="small" title="${esc(k)}">${esc(k.split(' (')[0])}</span><div class="track"><i style="width:${(v / maxI) * 100}%;background:var(--gold)"></i></div><span class="n">${money(v)}</span></div>`).join('')}</div>` : '<p class="small muted">Sleep once to see where your money comes from.</p>'}</div>
    <div class="sect"><div class="row between"><h3>${ico('lock')} FanVault</h3>${vaultOn() ? `<span class="pill blue">${fmt(vaultSubs())} subscribers</span>` : ''}</div>
      ${vaultOn() ? `<span class="small muted">${money(vaultSubs() * vaultInit().price * vaultCut() / 30)}/day from subscriptions at $${vaultInit().price}/mo · ${money(vaultInit().earned)} lifetime · ${fmt(vaultInit().ppvSold)} pay-per-view unlocks</span><div class="row">${btn(`${ico('feather')} Post a drop`, 'compose', 'vault', 'sm blue')}${btn('Creator dashboard', 'go', 'fanvault', 'sm')}</div>` : t >= PLATFORMS.vault.unlock ? `<p class="small muted">A paid-subscription platform: fans pay monthly for exclusive drops. Big money, nervous brands.</p><div>${btn('Join FanVault', 'unlock', 'vault', 'primary')}</div>` : `<span class="small muted">${ico('lock')} Unlocks at ${fmt(PLATFORMS.vault.unlock)} followers.</span>`}</div>
    <div class="sect"><div class="row between"><h3>${ico('chart')} Wealth</h3>${typeof netWorth === 'function' ? sparkline((S.fin && S.fin.nw) || [], 120, 30) : ''}</div>
      <div class="wallet"><div><div class="small muted">Stocks & crypto</div><div class="big">${money(holdingsValue())}</div></div><div><div class="small muted">Real estate</div><div class="big">${money(realtyValue())}</div></div><div><div class="small muted">Companies</div><div class="big">${money(acqValue())}</div></div><div><div class="small muted">Debt</div><div class="big ${debtTotal() ? 'bad' : ''}">${money(debtTotal())}</div></div></div>
      <div class="row">${btn(`${ico('chart')} Investing desk`, 'go', 'invest', 'sm primary')}${btn('🏦 Bank & mortgages', 'go', 'bank', 'sm')}${btn('🏢 Acquisitions', 'go', 'acquire', 'sm')}</div></div>
    <div class="sect"><h3>${ico('brief')} Online course</h3>${S.course ? `<span class="small">Sold ${fmt(S.course.sold)} copies at $49 · hype ×${(S.course.hype || 1).toFixed(1)}</span><div>${btn('Promote it · 15', 'coursePush', '', 'sm', S.energy < 15)}</div>` : t >= 50000 ? `<p class="small muted">"How I Went Viral (And You Can Too)". $49, sells every day.</p><div>${btn('Record and launch · $15,000', 'courseLaunch', '', 'primary', S.money < 15000)}</div>` : `<span class="small muted">${ico('lock')} Unlocks at 50K followers.</span>`}</div>
    <div class="sect"><h3>More ways to earn</h3><div class="small muted" style="display:flex;flex-direction:column;gap:4px">
      <span>• FanVault: fans pay monthly for exclusive drops; pay-per-view posts and custom videos pay big.</span>
      <span>• Every post earns tips, more with high reputation and superfans.</span>
      <span>• Add an affiliate link when you post for a commission on views (fans notice if you overdo it).</span>
      <span>• Paid gigs land in Messages: shoutouts, club appearances, speaking, clip licensing, movie cameos.</span>
      <span>• Rental property lives in the Shop. Merch, your brand and the podcast are in Empire.</span></div></div>`;
}

const MONEY_ACT = {
  'buy$': (a) => { const [k, v] = a.split(':'); const amt = v === 'all' ? Math.floor(S.money) : v === 'pct25' ? Math.floor(S.money * 0.25) : +v; if (!buyAsset(k, amt)) toast('Not enough cash.', 'bad'); },
  'sell$': (a) => { const [k, f] = a.split(':'); const g = sellAsset(k, +f); toast(`${g >= 0 ? 'Profit' : 'Loss'}: ${money(Math.abs(g))}`, g >= 0 ? 'gold' : 'bad'); },
  courseLaunch: () => { if (!spend(15000)) return 'norender'; S.course = { sold: 0, hype: 3 }; news(`@${S.handle} launches an online course. The comments are divided.`, true); toast('Course launched. Sales arrive every night.', 'gold'); },
  coursePush: () => { if (!needEnergy(15)) return 'norender'; S.course.hype += 1.5; toast('Course promo posted.'); },
  frame: (a) => { const f = FRAMES[a]; S.frames = S.frames || []; if (!S.frames.includes(a)) { if (!spend(f.price)) { toast('Not enough money.', 'bad'); return 'norender'; } S.frames.push(a); } S.frame = S.frame === a ? null : a; },
  banner: (a) => { const b = BANNERS[a]; S.banners = S.banners || []; if (!S.banners.includes(a)) { if (!spend(b.price)) { toast('Not enough money.', 'bad'); return 'norender'; } S.banners.push(a); } S.banner = S.banner === a ? null : a; },
};

/* ---------- replying to fans (Life action and the social media manager) ---------- */
function replyToComments(max = 10) {
  const todo = [];
  for (const p of S.posts.slice(0, 8)) for (const c of p.comms || []) if (!c.mine && !c.npc && !c.co && todo.length < max) todo.push(c);
  const KIND = ['thank you!! means a lot 🥹', 'you get it ❤️', 'love you for this', 'ok you made my day', 'facts 😂', 'saving this comment forever', 'you\'re the reason I post', 'stop you\'re too sweet', 'hahaha exactly', 'more coming soon 👀'];
  const WITTY = ['noted, ignored 💅', 'and yet you watched till the end', 'thanks for the engagement bestie', 'I\'ll pray for your wifi', 'cute take, wrong though'];
  let pos = 0, neg = 0;
  todo.forEach((c, i) => { if (c.neg) { c.mine = pick(WITTY); neg++; } else { c.mine = KIND[i % KIND.length]; pos++; } c.likes = (c.likes || 0) + ri(1, 12); });
  const n = todo.length;
  unlockedIds().forEach((p) => { S.platforms[p].eng = clamp(S.platforms[p].eng + 0.1 + n * 0.03, 0.5, 30); });
  if (n) changeRep(0.2 + pos * 0.06 - neg * 0.05);
  if (neg) S.heat = clamp(S.heat + neg, 0, 100);
  if (n) addFollowers(Math.max(2, totalFollowers() * 0.0006 * n) * diffM());
  if (n && (S.superfans || []).length && chance(0.4)) { const sf = pick(S.superfans); sf.count += 2; notify('reply', sf.handle, 'you replied to me!!! screenshotting this forever'); }
  return { n, pos, neg };
}

/* ---------- social media manager: runs your accounts on autopilot ---------- */
const MGR_STYLES = {
  safe:  { name: 'Brand-safe', tones: ['authentic', 'wholesome', 'educational'], desc: 'Steady growth, reputation up, brands love it.' },
  funny: { name: 'Funny',      tones: ['funny', 'authentic'], desc: 'Memes and bits. Good reach, low risk.' },
  edgy:  { name: 'Edgy',       tones: ['funny', 'ragebait'], desc: 'Hot takes for reach. More views, more heat.' },
};
function mgrInit() { if (!S.mgr) S.mgr = { style: 'safe', posts: 2, total: 0, earned: 0, last: [] }; return S.mgr; }
function mgrPost() {
  const m = mgrInit();
  const plats = postIds(); if (!plats.length) return null;
  const platform = pick(plats);
  const fmts = Object.keys(FORMATS).filter((f) => FORMATS[f].p === platform); if (!fmts.length) return null;
  const topics = topicsFor().filter((t) => !t.deal && !t.tea && !t.clash && t.id !== 'hot' && !String(t.id).startsWith('diss'));
  const trend = topics.find((t) => t.trend && chance(0.6));
  const topic = trend || pick(topics.filter((t) => t.id === 'niche' || t.id === 'personal' || t.id === 'bts' || t.id === 'pet' || t.id === 'travel').concat(topics.slice(0, 1)));
  const tone = pick(MGR_STYLES[m.style].tones);
  const o = { platform, format: pick(fmts), topic: topic.id, tone: TONES[tone] ? tone : 'authentic', effort: 'normal', time: 'prime', tags: S.trends.slice(0, 2).map((x) => x.tag), caption: '', disclose: true, intents: {}, mgr: true };
  const e0 = S.energy, s0 = S.stress, r = computePost(o, true);
  S.energy = Math.max(S.energy, 0) + r.energy; // the manager films it, not you
  const before = S.posts[0];
  S._autopilot = true;
  try { doPost(o); } finally { delete S._autopilot; }
  S.energy = e0; S.stress = s0;
  const post = S.posts[0];
  if (!post || post === before) return null;
  post.byMgr = true;
  m.total++;
  return post;
}
function mgrTick(lines) {
  if (!S.team.socialmgr) return;
  const m = mgrInit();
  const n = m.posts;
  let views = 0, gain = 0, cash = 0, viral = 0;
  for (let i = 0; i < n; i++) { const p = mgrPost(); if (p) { views += p.views; gain += p.gain; cash += p.cash; if (p.viral) viral++; } }
  const rep = replyToComments(6);
  // small paid promos the manager books for you
  const promo = Math.round(Math.max(170, totalFollowers() * realRatio() * 0.005 * clamp(S.rep / 60, 0.3, 1.4)) * (1 + skillLvl('business') * 0.05) * tm('socialmgr'));
  S.money += promo; S.stats.earned += promo; m.earned += promo + cash;
  m.last = [S.day, n, Math.round(views), Math.round(gain), Math.round(cash + promo), rep.n, viral];
  lines.push([`Your manager posted ${n}× (${fmt(views)} views, ${signed(Math.round(gain))} followers${viral ? `, ${viral} viral!` : ''}) and replied to ${rep.n} fans`, 0]);
  lines.push(['Manager-booked promos', promo]);
  checkAll();
}
function mgrPanel() {
  const m = mgrInit(), L = m.last;
  return `<div class="mgr"><span class="opt-lbl">Posting style</span><div class="scroller">${Object.entries(MGR_STYLES).map(([k, st]) => chip(st.name, 'mgrStyle', k, m.style === k)).join('')}</div>
    <span class="small muted">${MGR_STYLES[m.style].desc}</span>
    <span class="opt-lbl">Posts per day</span><div class="scroller">${[1, 2, 3].map((k) => chip(`${k} post${k > 1 ? 's' : ''}`, 'mgrPosts', k, m.posts === k)).join('')}</div>
    ${L.length ? `<span class="small">Last night: ${L[1]} posts · ${fmt(L[2])} views · ${signed(L[3])} followers · ${money(L[4])} earned · ${L[5]} replies${L[6] ? ` · <span class="gold">${L[6]} viral</span>` : ''}</span>` : '<span class="small muted">Starts working tonight when you sleep.</span>'}
    <span class="small muted">All-time: ${fmt(m.total)} posts · ${money(m.earned)} earned</span></div>`;
}
Object.assign(MONEY_ACT, {
  mgrStyle: (a) => { mgrInit().style = a; },
  mgrPosts: (a) => { mgrInit().posts = +a; },
});

/* ---------- money manager: invests for you every night ---------- */
function invInit() { if (!S.inv) S.inv = { pct: 0.25, reserve: 1000, made: 0 }; return S.inv; }
function investorTick(lines) {
  marketInit();
  const v = invInit(), m = S.market, tip = m.tip;
  // dodge a predicted drop
  if (tip && !tip.up && m.q[tip.k] > 0) { sellAsset(tip.k, 1); lines.push([`Money manager sold ${ASSETS[tip.k].tick} ahead of a predicted drop`, 0]); }
  const spare = Math.floor((S.money - v.reserve) * v.pct);
  if (spare >= 50) {
    const k = tip && tip.up ? tip.k : 'wld';
    buyAsset(k, spare);
    lines.push([`Money manager invested ${money(spare)} in ${ASSETS[k].tick}${tip && tip.up ? ' (hot tip)' : ' (index)'}`, 0]);
  }
}
function invPanel() {
  const v = invInit();
  return `<div class="mgr"><span class="opt-lbl">Invest each night</span><div class="scroller">${[0, 0.1, 0.25, 0.5].map((p) => chip(p ? `${p * 100}% of spare cash` : 'Pause', 'invPct', p, v.pct === p)).join('')}</div>
    <span class="opt-lbl">Always keep in cash</span><div class="scroller">${[500, 1000, 5000, 25000].map((r) => chip(money(r), 'invRes', r, v.reserve === r)).join('')}</div>
    <span class="small muted">Portfolio ${money(holdingsValue())} · tips ${Math.round(tipAccuracy() * 100)}% reliable. They buy the stock from tonight's tip if it's a rise, otherwise the index, and sell ahead of predicted drops.</span></div>`;
}
Object.assign(MONEY_ACT, { invPct: (a) => { invInit().pct = +a; }, invRes: (a) => { invInit().reserve = +a; } });
