/* Clout Chaser — finance: the bank (loans, mortgages, credit score), the investing desk
   (more assets, short selling, portfolio), company acquisitions, and the enterprise org chart */
'use strict';

/* ======================================================================
   Enterprise staff: every role has a department and a set of effects.
   staffBonus(key) adds up the effect of everyone you employ (scaled by level).
   ====================================================================== */
const DEPTS = {
  exec:     ['👔', 'Executive suite'],
  creative: ['🎬', 'Creative studio'],
  growth:   ['📈', 'Growth & marketing'],
  biz:      ['🤝', 'Business & deals'],
  commerce: ['🛍️', 'Commerce'],
  finance:  ['💹', 'Finance & investing'],
  legal:    ['⚖️', 'Legal & safety'],
  ops:      ['🗂️', 'Operations'],
  care:     ['🧘', 'Personal care'],
};
const FX_LABEL = {
  reach: (v) => `+${Math.round(v * 100)}% reach`, quality: (v) => `+${Math.round(v * 100)}% quality`, deal: (v) => `+${Math.round(v * 100)}% brand deal pay`,
  sales: (v) => `+${Math.round(v * 100)}% merch & product sales`, cash: (v) => `+${Math.round(v * 100)}% post earnings`, energy: (v) => `+${v} max energy`,
  stress: (v) => `−${v} stress a day`, heat: (v) => `−${v} heat a day`, rep: (v) => `+${v} reputation a day`, gift: (v) => `+${Math.round(v * 100)}% live gifts`,
  vault: (v) => `+${Math.round(v * 100)}% FanVault income`, tax: (v) => `−${Math.round(v * 100)}% cost of fame`, payroll: (v) => `−${Math.round(v * 100)}% salaries`,
  rate: (v) => `−${(v * 100).toFixed(1)}% loan rates`, credit: (v) => `+${v} credit score a day`, alpha: (v) => `+${(v * 100).toFixed(2)}% a day on your portfolio`,
  tips: (v) => `+${Math.round(v * 100)}% tip reliability`, realty: (v) => `−${Math.round(v * 100)}% property prices`, rent: (v) => `+${Math.round(v * 100)}% rent`,
  acq: (v) => `−${Math.round(v * 100)}% acquisition prices`, profit: (v) => `+${Math.round(v * 100)}% company profits`, risk: () => 'Auto stop-loss at −20% and no margin calls',
  legal: (v) => `−${Math.round(v * 100)}% fines`, crisis: (v) => `−${Math.round(v * 100)}% scandal damage`, hire: (v) => `−${Math.round(v * 100)}% hiring cost`,
};
Object.assign(TEAM, {
  // executive suite
  ceo:        { dept: 'exec', name: 'Chief Executive Officer', pay: 6000, req: 5e6, fx: { reach: 0.03, deal: 0.1, sales: 0.1, profit: 0.1 }, desc: 'Runs the whole company so you can be the face.' },
  coo:        { dept: 'exec', name: 'Chief Operating Officer', pay: 4000, req: 2e6, fx: { energy: 10, stress: 3, payroll: 0.05 }, desc: 'Makes everything run on time. Less chaos for you.' },
  cfo:        { dept: 'exec', name: 'Chief Financial Officer', pay: 4500, req: 1e6, fx: { tax: 0.15, rate: 0.01, profit: 0.05, alpha: 0.0002 }, desc: 'Owns the money: taxes, loans, investments.' },
  cmo:        { dept: 'exec', name: 'Chief Marketing Officer', pay: 4000, req: 1e6, fx: { reach: 0.06, deal: 0.05 }, desc: 'Your brand, everywhere, all the time.' },
  cto:        { dept: 'exec', name: 'Chief Technology Officer', pay: 3500, req: 750000, fx: { quality: 0.04, reach: 0.02 }, desc: 'Better gear, better pipeline, better uploads.' },
  cos:        { dept: 'exec', name: 'Chief of Staff', pay: 2000, req: 300000, fx: { energy: 8, stress: 2 }, desc: 'Guards your calendar like a dragon.' },
  // creative studio
  creative:   { dept: 'creative', name: 'Creative director', pay: 1200, req: 100000, fx: { quality: 0.06 }, desc: 'Every post has a concept now.' },
  videog:     { dept: 'creative', name: 'Videographer', pay: 400, req: 8000, fx: { quality: 0.04 }, desc: 'Cinematic B-roll for everything.' },
  thumb:      { dept: 'creative', name: 'Thumbnail artist', pay: 250, req: 4000, fx: { reach: 0.03 }, desc: 'Shocked face, red arrow, big numbers.' },
  copy:       { dept: 'creative', name: 'Copywriter', pay: 300, req: 10000, fx: { reach: 0.02, deal: 0.04 }, desc: 'Captions that convert and pitches brands love.' },
  setdes:     { dept: 'creative', name: 'Set designer', pay: 500, req: 40000, fx: { quality: 0.03 }, desc: 'Your room looks like a magazine now.' },
  composer:   { dept: 'creative', name: 'Music composer', pay: 600, req: 60000, fx: { quality: 0.03, reach: 0.01 }, desc: 'Original sounds nobody can copyright-strike.' },
  // growth & marketing
  growth:     { dept: 'growth', name: 'Growth hacker', pay: 700, req: 25000, fx: { reach: 0.05 }, desc: 'A/B tests everything you post.' },
  seo:        { dept: 'growth', name: 'SEO specialist', pay: 350, req: 15000, fx: { reach: 0.03 }, desc: 'Tags, titles and keywords, optimized.' },
  ads:        { dept: 'growth', name: 'Paid ads manager', pay: 800, req: 50000, fx: { reach: 0.04, cash: 0.05 }, desc: 'Turns ad money into followers and followers into money.' },
  trend:      { dept: 'growth', name: 'Trend forecaster', pay: 500, req: 30000, fx: { reach: 0.03 }, desc: 'Knows the next sound before it trends.' },
  mods:       { dept: 'growth', name: 'Moderation team', pay: 450, req: 80000, fx: { heat: 2, rep: 0.05 }, desc: 'Cleans your comments 24/7.' },
  // business & deals
  partner:    { dept: 'biz', name: 'Brand partnerships lead', pay: 1000, req: 75000, fx: { deal: 0.15 }, desc: 'Negotiates every deal up.' },
  lic:        { dept: 'biz', name: 'Licensing manager', pay: 900, req: 200000, fx: { cash: 0.08, deal: 0.05 }, desc: 'Your clips earn money everywhere they appear.' },
  events:     { dept: 'biz', name: 'Events manager', pay: 700, req: 120000, fx: { deal: 0.05, stress: 1 }, desc: 'Tours, appearances and parties, handled.' },
  // commerce
  ecom:       { dept: 'commerce', name: 'E-commerce manager', pay: 900, req: 50000, fx: { sales: 0.15 }, desc: 'Runs your online store like a machine.' },
  merchdes:   { dept: 'commerce', name: 'Merch designer', pay: 500, req: 20000, fx: { sales: 0.1 }, desc: 'Hoodies people actually want to wear.' },
  supply:     { dept: 'commerce', name: 'Supply chain lead', pay: 800, req: 150000, fx: { sales: 0.08 }, desc: 'No more "sold out, ships in 6 weeks".' },
  fanclub:    { dept: 'commerce', name: 'Fan club manager', pay: 600, req: 30000, fx: { vault: 0.12, gift: 0.05 }, desc: 'Turns casual fans into paying members.' },
  livehost:   { dept: 'commerce', name: 'Live co-host', pay: 400, req: 10000, fx: { gift: 0.15 }, desc: 'Hypes the chat during your streams.' },
  // finance & investing
  fundmgr:    { dept: 'finance', name: 'Fund manager', pay: 1500, req: 100000, fx: { alpha: 0.0008 }, desc: 'Actively manages your portfolio for extra return every day.' },
  quant:      { dept: 'finance', name: 'Quant trader', pay: 2000, req: 250000, fx: { tips: 0.08, alpha: 0.0004 }, desc: 'Algorithms read the market better than tipsters.' },
  advisor:    { dept: 'finance', name: 'Financial advisor', pay: 500, req: 10000, fx: { rate: 0.01, credit: 2 }, desc: 'Fixes your credit and gets you cheaper loans.' },
  taxatty:    { dept: 'finance', name: 'Tax attorney', pay: 900, req: 150000, fx: { tax: 0.2 }, desc: 'Perfectly legal. Probably.' },
  realtor:    { dept: 'finance', name: 'Real estate agent', pay: 700, req: 50000, fx: { realty: 0.05, rent: 0.1 }, desc: 'Finds deals and better tenants.' },
  mabanker:   { dept: 'finance', name: 'M&A banker', pay: 2500, req: 500000, fx: { acq: 0.12, profit: 0.1 }, desc: 'Buys companies cheaper and runs them better.' },
  risk:       { dept: 'finance', name: 'Risk officer', pay: 1200, req: 300000, fx: { risk: 1 }, desc: 'Sells any stock that falls 20% below what you paid, and never lets a short get margin-called.' },
  // legal & safety
  counsel:    { dept: 'legal', name: 'General counsel', pay: 1800, req: 1e6, fx: { legal: 0.2, rep: 0.05 }, desc: 'A lawyer for your lawyers.' },
  compliance: { dept: 'legal', name: 'Compliance officer', pay: 700, req: 150000, fx: { heat: 2 }, desc: 'Checks every #ad before it goes out.' },
  crisis:     { dept: 'legal', name: 'Crisis manager', pay: 1500, req: 400000, fx: { crisis: 0.2, heat: 2 }, desc: 'Writes the apology before you need it.' },
  security:   { dept: 'legal', name: 'Head of security', pay: 900, req: 500000, fx: { stress: 2 }, desc: 'You sleep better knowing they are there.' },
  // operations
  hr:         { dept: 'ops', name: 'HR director', pay: 1000, req: 200000, fx: { payroll: 0.08 }, desc: 'Negotiates salaries and keeps people happy.' },
  recruiter:  { dept: 'ops', name: 'Recruiter', pay: 500, req: 100000, fx: { hire: 0.25 }, desc: 'Finds talent for less.' },
  office:     { dept: 'ops', name: 'Office manager', pay: 350, req: 30000, fx: { stress: 2, energy: 3 }, desc: 'Snacks stocked, printers working.' },
  it:         { dept: 'ops', name: 'IT support', pay: 300, req: 15000, fx: { quality: 0.01, reach: 0.01 }, desc: 'Turned it off and on again.' },
  driver:     { dept: 'ops', name: 'Chauffeur', pay: 350, req: 60000, fx: { energy: 5 }, desc: 'Nap in the back seat between shoots.' },
  execasst:   { dept: 'ops', name: 'Executive assistant', pay: 600, req: 150000, fx: { energy: 6 }, desc: 'Answers 400 emails a day for you.' },
  // personal care
  nutrition:  { dept: 'care', name: 'Nutritionist', pay: 300, req: 20000, fx: { energy: 5 }, desc: 'Meal plans that actually work.' },
  sleepcoach: { dept: 'care', name: 'Sleep coach', pay: 250, req: 15000, fx: { energy: 4, stress: 2 }, desc: 'Eight hours. Phone in another room.' },
  lifecoach:  { dept: 'care', name: 'Life coach', pay: 400, req: 40000, fx: { stress: 4, rep: 0.03 }, desc: 'Reminds you why you started.' },
  physio:     { dept: 'care', name: 'Physiotherapist', pay: 450, req: 100000, fx: { energy: 4 }, desc: 'Injuries heal twice as fast.' },
  glam:       { dept: 'care', name: 'Glam squad', pay: 800, req: 200000, fx: { quality: 0.03, rep: 0.05 }, desc: 'Camera-ready in ten minutes.' },
});
/* the original crew, filed into departments */
const DEPT_OF = { assistant: 'ops', editor: 'creative', manager: 'biz', socialmgr: 'growth', analyst: 'growth', ghostwriter: 'creative', investor: 'finance', stylist: 'creative', agent: 'biz', accountant: 'finance', smm: 'growth', pr: 'legal', therapist: 'care', lawyer: 'legal', bodyguard: 'legal', photographer: 'creative', chef: 'care', trainer: 'care', producer: 'commerce', scout: 'biz', cyber: 'legal' };
const deptOf = (k) => TEAM[k].dept || DEPT_OF[k] || 'ops';
function staffBonus(key) {
  if (!S || !S.team) return 0;
  let v = 0;
  for (const k in S.team) if (S.team[k] && TEAM[k] && TEAM[k].fx && TEAM[k].fx[key]) v += TEAM[k].fx[key] * tm(k);
  return v;
}
const hireCost = (k) => Math.round(TEAM[k].pay * (1 - Math.min(0.5, staffBonus('hire'))));
const fxText = (m) => (m.fx ? Object.entries(m.fx).map(([k, v]) => FX_LABEL[k](v)).join(' · ') : '');

/* ======================================================================
   Investing desk: more asset classes and short selling
   ====================================================================== */
Object.assign(ASSETS.wld, { cls: 'etf' }); Object.assign(ASSETS.pear, { cls: 'stock' }); Object.assign(ASSETS.tezla, { cls: 'stock' });
Object.assign(ASSETS.nflx, { cls: 'stock' }); Object.assign(ASSETS.clt, { cls: 'crypto' });
Object.assign(ASSETS, {
  c500:  { cls: 'etf',    name: 'Clout 500 ETF',    tick: 'C500', price: 400,   vol: 0.01,  drift: 0.0021, div: 0.0004, desc: 'The 500 biggest companies in one fund.' },
  tech:  { cls: 'etf',    name: 'Tech Titans ETF',  tick: 'TECH', price: 250,   vol: 0.022, drift: 0.0036,  desc: 'Every big tech stock in one basket.' },
  bond:  { cls: 'bond',   name: 'Treasury Bonds',   tick: 'BOND', price: 100,   vol: 0.002, drift: 0.00036, div: 0.0003, desc: 'Boring and safe. Pays a coupon every day.' },
  hyb:   { cls: 'bond',   name: 'High-Yield Bonds', tick: 'JUNK', price: 100,   vol: 0.006, drift: 0.00024, div: 0.0008, desc: 'Fat coupons, occasional defaults.' },
  gold:  { cls: 'commod', name: 'Gold',             tick: 'GOLD', price: 180,   vol: 0.009, drift: 0.00108, desc: 'Rises when everything else panics.' },
  oil:   { cls: 'commod', name: 'PetroMax Oil',     tick: 'PMX',  price: 70,    vol: 0.03,  drift: 0.0018,  div: 0.0008, desc: 'Moves on world news.' },
  reit:  { cls: 'reit',   name: 'Skyline REIT',     tick: 'SKYR', price: 50,    vol: 0.012, drift: 0.0015, div: 0.0018, desc: 'Owns malls and offices. Big daily payouts.' },
  zoomr: { cls: 'stock',  name: 'Zoomr Rides',      tick: 'ZMR',  price: 45,    vol: 0.04,  drift: 0.003,  desc: 'Ride-hailing. Profitable some quarters.' },
  amzon: { cls: 'stock',  name: 'Amazoom',          tick: 'AMZM', price: 140,   vol: 0.022, drift: 0.0033, desc: 'Ships everything by tomorrow.' },
  btcn:  { cls: 'crypto', name: 'Bitcorn',          tick: 'BTCN', price: 30000, vol: 0.055, drift: 0.0048,  desc: 'The original. Volatile, but it keeps coming back.' },
  ethg:  { cls: 'crypto', name: 'Ethergem',         tick: 'ETHG', price: 2000,  vol: 0.07,  drift: 0.0054,  desc: 'Smart contracts and dumb apes.' },
  dogb:  { cls: 'crypto', name: 'DogeBone',         tick: 'DOGB', price: 0.08,  vol: 0.16,  drift: 0.0072,  desc: 'A meme coin. A dog. A dream.' },
});
const ASSET_CLS = { all: 'All', stock: 'Stocks', etf: 'ETFs', bond: 'Bonds', commod: 'Commodities', reit: 'Real estate', crypto: 'Crypto' };
MARKET_NEWS.push(
  ['gold', 0.06, 'Investors flee to safety. Gold shines.'], ['gold', -0.04, 'Risk-on mood. Gold slips.'],
  ['oil', 0.15, 'Supply shock! Oil spikes.'], ['oil', -0.12, 'Oil glut. Prices slide.'],
  ['btcn', 0.25, 'A country adopts Bitcorn as legal tender.'], ['btcn', -0.2, 'An exchange "pauses withdrawals". Bitcorn tumbles.'],
  ['ethg', 0.3, 'Ethergem upgrade ships on time, for once.'], ['dogb', 0.8, 'A billionaire tweets a dog picture. DogeBone moons.'], ['dogb', -0.5, 'DogeBone holders discover there is no product.'],
  ['tech', 0.07, 'AI hype lifts all of tech.'], ['tech', -0.08, 'Tech sells off on regulation fears.'],
  ['amzon', 0.09, 'Amazoom delivers by drone. Stock soars.'], ['zoomr', -0.15, 'Zoomr loses money on every ride. Again.'], ['zoomr', 0.18, 'Zoomr posts its first profit ever.'],
  ['hyb', -0.06, 'A big borrower defaults. Junk bonds wobble.'], ['reit', -0.05, 'Offices sit empty. REITs dip.'],
);
function shortInit() { marketInit(); S.market.sh = S.market.sh || {}; return S.market.sh; }
const shortVal = (k) => { const s = shortInit()[k]; return s ? Math.max(0, s.margin + (s.entry - S.market.p[k]) * s.q) : 0; };
const shortsValue = () => Object.keys(shortInit()).reduce((a, k) => a + shortVal(k), 0);
function openShort(k, amt) {
  const sh = shortInit(); amt = Math.floor(Math.min(amt, S.money)); if (amt < 50) return toast('Minimum short is $50.', 'bad');
  if (sh[k]) return toast(`Close your ${ASSETS[k].tick} short first.`, 'bad');
  S.money -= amt;
  sh[k] = { q: amt / S.market.p[k], entry: S.market.p[k], margin: amt };
  log(`Shorted ${money(amt)} of ${ASSETS[k].tick}.`); toast(`Short opened: you profit if ${ASSETS[k].tick} falls.`);
}
function closeShort(k, why) {
  const sh = shortInit(), s = sh[k]; if (!s) return 0;
  const val = shortVal(k), gain = val - s.margin;
  S.money += val; delete sh[k];
  if (gain > 0) S.stats.earned += gain;
  S.stats.tradeProfit = (S.stats.tradeProfit || 0) + gain;
  log(`${why || 'Closed'} ${ASSETS[k].tick} short: ${gain >= 0 ? '+' : '−'}${money(Math.abs(gain))}.`, gain >= 0 ? 'good' : 'bad');
  return gain;
}
const netWorth = () => S.money + S.savings + holdingsValue() + shortsValue() + SHOP.filter((it) => S.owned[it.id] && it.cat === 'Property').reduce((a, it) => a + it.price, 0) + realtyValue() + acqValue() - debtTotal();

/* ======================================================================
   Bank: credit score, personal loans, mortgages and real estate
   ====================================================================== */
function bankInit() {
  if (!S.bank) S.bank = { credit: 650, loans: [], props: {}, hpi: 1, hpiH: [1], paid: 0, interest: 0, missed: 0 };
  return S.bank;
}
const CREDIT_BANDS = [[800, 'Exceptional', 'good'], [740, 'Very good', 'good'], [670, 'Good', 'blue'], [580, 'Fair', 'warn'], [0, 'Poor', 'bad']];
const creditBand = (c) => CREDIT_BANDS.find(([m]) => c >= m);
const debtTotal = () => (S.bank ? S.bank.loans.reduce((a, l) => a + l.bal, 0) : 0);
/* yearly rate → daily rate; better credit and finance staff make borrowing cheaper */
function loanApr(kind) {
  const c = bankInit().credit, risk = (850 - c) / 550;
  const base = kind === 'mortgage' ? 0.045 + risk * 0.06 : kind === 'business' ? 0.07 + risk * 0.1 : 0.1 + risk * 0.25;
  return Math.max(0.02, base - staffBonus('rate'));
}
function loanLimit() {
  const c = bankInit().credit;
  const base = Math.max(1000, (S.stats.earned || 0) * 0.08 + Math.max(0, netWorth()) * 0.35);
  return Math.max(0, Math.round(base * Math.pow(c / 700, 3) - S.bank.loans.filter((l) => l.kind === 'personal').reduce((a, l) => a + l.bal, 0)) / 100) * 100;
}
function amortized(P, r, n) { return r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n; }
function takeLoan(kind, P, days, extra = {}) {
  const b = bankInit(), apr = loanApr(kind), r = apr / 365;
  const pay = Math.ceil(amortized(P, r, days));
  const L = { id: uid(), kind, bal: Math.round(P), rate: r, apr, pay, left: days, missed: 0, day: S.day, ...extra };
  b.loans.push(L);
  return L;
}
const LOAN_KIND = { personal: 'Personal loan', mortgage: 'Mortgage', business: 'Acquisition loan' };
const loanName = (l) => l.kind === 'mortgage' ? `Mortgage · ${REALTY[l.prop] ? REALTY[l.prop].name : 'property'}` : l.kind === 'business' ? `Acquisition loan · ${BIZ[l.co] ? BIZ[l.co].name : 'company'}` : 'Personal loan';
function payLoan(l, amt) {
  amt = Math.min(amt, l.bal, S.money); if (amt <= 0) return 0;
  S.money -= amt; l.bal -= amt; S.bank.paid += amt;
  if (l.bal < 1) { S.bank.loans = S.bank.loans.filter((x) => x !== l); S.bank.credit = clamp(S.bank.credit + 15, 300, 850); log(`${loanName(l)} paid off!`, 'good'); toast(`${loanName(l)} paid off. Credit score +15.`, 'gold'); }
  return amt;
}

/* Properties you buy with a mortgage. Prices follow a housing index; rent pays nightly. */
const REALTY = {
  loft:   { name: 'Starter loft',       icon: '🏠', price: 60000,  rent: 80,    desc: 'Small, bright, always rented.' },
  duplex: { name: 'Suburban duplex',    icon: '🏡', price: 250000, rent: 350,    desc: 'Two families, two rent checks.' },
  beach:  { name: 'Beach house',        icon: '🏖️', price: 900000, rent: 1300,   desc: 'Holiday lets. Great for content too.' },
  block:  { name: 'Apartment block',    icon: '🏢', price: 4e6,    rent: 5800,   desc: 'Forty units, steady income.' },
  hotel:  { name: 'Boutique hotel',     icon: '🏨', price: 1.2e7,  rent: 18200,  desc: 'Influencers stay free (for content).' },
  plaza:  { name: 'Shopping plaza',     icon: '🛍️', price: 3e7,    rent: 45500,  desc: 'Anchor stores and a food court.' },
  tower:  { name: 'Skyscraper',         icon: '🌆', price: 1.5e8,  rent: 221000, desc: 'Your name in lights on top.' },
};
const propPrice = (k) => Math.round(REALTY[k].price * bankInit().hpi * (1 - Math.min(0.3, staffBonus('realty'))));
const propValue = (k) => Math.round(REALTY[k].price * bankInit().hpi);
const propRent = (k) => Math.round(REALTY[k].rent * Math.sqrt(bankInit().hpi) * (1 + staffBonus('rent')));
const realtyValue = () => (S.bank ? Object.keys(S.bank.props).reduce((a, k) => a + propValue(k), 0) : 0);
const downPct = () => (bankInit().credit >= 760 ? 0.1 : bankInit().credit >= 650 ? 0.2 : 0.35);
function buyProp(k, mortgage) {
  const b = bankInit(); if (b.props[k]) return toast('You already own this.', 'bad');
  const price = propPrice(k);
  if (!mortgage) { if (!spend(price)) return toast('Not enough cash.', 'bad'); }
  else {
    if (b.credit < 560) return toast('The bank says no. Your credit score needs to be at least 560.', 'bad');
    const dp = Math.round(price * downPct());
    if (!spend(dp)) return toast(`You need ${money(dp)} for the down payment.`, 'bad');
    takeLoan('mortgage', price - dp, 360, { prop: k });
  }
  b.props[k] = { day: S.day, paid: price };
  log(`Bought a ${REALTY[k].name.toLowerCase()} for ${money(price)}${mortgage ? ' with a mortgage' : ''}.`, 'good');
  toast(`${REALTY[k].icon} ${REALTY[k].name} is yours. Rent starts tonight.`, 'gold'); sound('cash');
  if (typeof questEvent === 'function') questEvent('buy');
  S.stats.propsBought = (S.stats.propsBought || 0) + 1;
  checkAll();
}
function sellProp(k, forced) {
  const b = bankInit(); if (!b.props[k]) return;
  let val = Math.round(propValue(k) * (forced ? 0.7 : 0.97));
  const l = b.loans.find((x) => x.kind === 'mortgage' && x.prop === k);
  if (l) { const pay = Math.min(val, l.bal); val -= pay; l.bal -= pay; if (l.bal < 1) b.loans = b.loans.filter((x) => x !== l); }
  delete b.props[k];
  S.money += val;
  log(`${forced ? 'The bank repossessed' : 'Sold'} your ${REALTY[k].name.toLowerCase()}. ${money(val)} back to you after the mortgage.`, forced ? 'bad' : 'good');
  return val;
}

/* nightly: house prices move, rent comes in, loans are paid automatically */
function bankTick(lines) {
  const b = bankInit();
  b.hpi = Math.max(0.5, b.hpi * (1 + 0.0006 + (Math.random() + Math.random() - 1) * 0.008));
  b.hpiH.push(+b.hpi.toFixed(4)); if (b.hpiH.length > 40) b.hpiH.shift();
  let rent = 0; for (const k of Object.keys(b.props)) rent += propRent(k);
  if (rent) { S.money += rent; S.stats.earned += rent; lines.push([`Rent from ${Object.keys(b.props).length} propert${Object.keys(b.props).length > 1 ? 'ies' : 'y'}`, rent]); }
  let paid = 0, interest = 0;
  for (const l of [...b.loans]) {
    const i = l.bal * l.rate; interest += i;
    const due = Math.min(l.pay, l.bal + i);
    if (S.money < due && S.savings >= due - Math.max(0, S.money)) { const need = due - Math.max(0, S.money); S.savings -= need; S.money += need; }
    if (S.money >= due) {
      S.money -= due; l.bal = Math.max(0, l.bal + i - due); l.left--; l.missed = 0; paid += due;
      b.credit = clamp(b.credit + 1, 300, 850);
      if (l.bal < 1) { b.loans = b.loans.filter((x) => x !== l); b.credit = clamp(b.credit + 15, 300, 850); lines.push([`${loanName(l)} fully paid off! Credit +15`, 0]); }
    } else {
      l.bal += i + l.pay * 0.05; l.missed++; b.missed++;
      b.credit = clamp(b.credit - 30, 300, 850);
      lines.push([`Missed a ${LOAN_KIND[l.kind].toLowerCase()} payment (credit −30, late fee)`, 0]);
      if (l.kind === 'mortgage' && l.missed >= 5) { const back = sellProp(l.prop, true); b.credit = clamp(b.credit - 120, 300, 850); lines.push([`Repossessed: ${REALTY[l.prop].name}`, back || 0]); news(`Bank repossesses @${S.handle}'s ${REALTY[l.prop].name.toLowerCase()}`, true); }
      else if (l.kind === 'business' && l.missed >= 5 && S.acq && S.acq.own[l.co]) { const back = sellStake(l.co, 1, true); b.credit = clamp(b.credit - 120, 300, 850); lines.push([`The bank seized your stake in ${BIZ[l.co].name}`, back || 0]); }
      else if (l.kind === 'personal' && l.missed >= 4) {
        // collections: they take what they can find
        let owed = l.bal;
        const fromSav = Math.min(S.savings, owed); S.savings -= fromSav; owed -= fromSav;
        for (const k of Object.keys(ASSETS)) { if (owed <= 0) break; const v = S.market.q[k] * S.market.p[k]; if (v > 1) { const f = Math.min(1, owed / v); const got = S.market.q[k] * f * S.market.p[k]; S.market.q[k] *= 1 - f; owed -= got; } }
        S.money -= Math.max(0, owed);
        b.loans = b.loans.filter((x) => x !== l); b.credit = clamp(b.credit - 100, 300, 850);
        lines.push(['Debt collectors cleared your personal loan from your savings and stocks', 0]); news(`@${S.handle}'s loan goes to collections`, true);
        S.heat = clamp(S.heat + 6, 0, 100);
      }
    }
  }
  b.interest += interest;
  if (paid) lines.push([`Loan payments (${money(interest)} of it interest)`, -Math.round(paid)]);
  if (staffBonus('credit')) b.credit = clamp(b.credit + Math.round(staffBonus('credit')), 300, 850);
  if (!b.loans.length && b.credit < 700) b.credit = clamp(b.credit + 0.5, 300, 850);
}

/* ======================================================================
   Acquisitions: buy stakes in companies. They pay you a share of profit every night.
   ====================================================================== */
const BIZ = {
  cafe:    { name: 'Brewtopia Coffee',     icon: '☕', val: 120000, y: 0.00168, g: 0.0009, vol: 0.02,  req: 5000,   perk: ['energy', 3, '+3 morning energy (free coffee)'] },
  salon:   { name: 'GlowUp Salons',        icon: '💇', val: 350000, y: 0.00156, g: 0.0008, vol: 0.02,  req: 20000,  perk: ['quality', 0.02, '+2% post quality'] },
  kicks:   { name: 'HypeKicks Sneakers',   icon: '👟', val: 900000, y: 0.00144, g: 0.0012, vol: 0.03,  req: 50000,  perk: ['sales', 0.1, '+10% merch sales'] },
  gym:     { name: 'IronPulse Gyms',       icon: '🏋️', val: 2.5e6,  y: 0.00132, g: 0.0009, vol: 0.018, req: 100000, perk: ['energy', 10, '+10 max energy'] },
  records: { name: 'Clout Records',        icon: '🎵', val: 5e6,    y: 0.00132, g: 0.0013, vol: 0.035, req: 250000, perk: ['reach', 0.05, '+5% reach'] },
  club:    { name: 'Club Neon Group',      icon: '🪩', val: 8e6,    y: 0.0018,  g: 0.0008, vol: 0.03,  req: 400000, perk: ['gift', 0.1, '+10% live gifts'] },
  agency:  { name: 'Starmaker Talent',     icon: '⭐', val: 1.2e7,  y: 0.00132, g: 0.001,  vol: 0.025, req: 600000, perk: ['deal', 0.1, '+10% brand deal pay'] },
  games:   { name: 'PixelForge Games',     icon: '🎮', val: 2.5e7,  y: 0.0009, g: 0.0022, vol: 0.05,  req: 1e6,    perk: ['reach', 0.04, '+4% reach'] },
  snack:   { name: 'SnackWave Foods',      icon: '🍿', val: 4e7,    y: 0.00126, g: 0.001,  vol: 0.015, req: 2e6,    perk: ['sales', 0.15, '+15% product sales'] },
  stream:  { name: 'StreamNest',           icon: '📺', val: 9e7,    y: 0.00096, g: 0.002,  vol: 0.04,  req: 5e6,    perk: ['vault', 0.1, '+10% FanVault income'] },
  fc:      { name: 'Clout City FC',        icon: '⚽', val: 2.5e8,  y: 0.00084, g: 0.0012, vol: 0.03,  req: 1e7,    perk: ['rep', 0.2, '+0.2 reputation a day'] },
  air:     { name: 'JetSet Air',           icon: '✈️', val: 8e8,    y: 0.00072, g: 0.0009, vol: 0.03,  req: 3e7,    perk: ['stress', 4, '−4 stress a day (private jet)'] },
  omni:    { name: 'Omni Media Group',     icon: '🌐', val: 3e9,    y: 0.00072, g: 0.0011, vol: 0.025, req: 1e8,    perk: ['reach', 0.1, '+10% reach'] },
};
function acqInit() {
  if (!S.acq) S.acq = { own: {}, val: {}, h: {}, earned: 0 };
  for (const [k, c] of Object.entries(BIZ)) if (S.acq.val[k] == null) { S.acq.val[k] = c.val; S.acq.h[k] = [c.val]; }
  return S.acq;
}
const stakeOf = (k) => (S.acq && S.acq.own[k] ? S.acq.own[k].stake : 0);
const acqValue = () => (S.acq ? Object.keys(S.acq.own).reduce((a, k) => a + S.acq.val[k] * stakeOf(k), 0) : 0);
/* controlling owners (51%+) get the company perk, counted like staff bonuses */
const _staffBonus = staffBonus;
staffBonus = function (key) { // eslint-disable-line no-func-assign
  let v = _staffBonus(key);
  if (S && S.acq) for (const k in S.acq.own) if (stakeOf(k) >= 0.51 && BIZ[k].perk[0] === key) v += BIZ[k].perk[1];
  return v;
};
function stakePrice(k, add) {
  const A = acqInit(), cur = stakeOf(k), control = cur < 0.51 && cur + add >= 0.51;
  return Math.round(A.val[k] * add * (control ? 1.15 : 1) * (1 - Math.min(0.3, staffBonus('acq'))));
}
function buyStake(k, add, financed) {
  const A = acqInit(), c = BIZ[k];
  if (totalFollowers() < c.req) return toast(`Sellers want someone with ${fmt(c.req)}+ followers.`, 'bad');
  add = Math.min(add, 1 - stakeOf(k)); if (add <= 0) return toast('You already own all of it.', 'bad');
  const price = stakePrice(k, add);
  let cash = price;
  if (financed) {
    if (bankInit().credit < 620) return toast('Acquisition loans need a credit score of 620+.', 'bad');
    if (S.bank.loans.some((l) => l.kind === 'business' && l.co === k)) return toast('You already have a loan on this company.', 'bad');
    cash = Math.round(price * 0.4);
  }
  if (!spend(cash)) return toast(`You need ${money(cash)}${financed ? ' (40% down)' : ''}.`, 'bad');
  if (financed) takeLoan('business', price - cash, 240, { co: k });
  const o = A.own[k] || (A.own[k] = { stake: 0, cost: 0, day: S.day, exp: 0, cut: -99, earned: 0 });
  const wasControl = o.stake >= 0.51;
  o.stake = +(o.stake + add).toFixed(2); o.cost += price;
  S.stats.acquisitions = (S.stats.acquisitions || 0) + 1;
  log(`Bought ${Math.round(add * 100)}% of ${c.name} for ${money(price)}.`, 'good');
  if (!wasControl && o.stake >= 0.51) { news(`@${S.handle} takes control of ${c.name}`, true); toast(`${c.icon} You control ${c.name}. Perk unlocked: ${c.perk[2]}`, 'gold'); celebrate('gold'); }
  else toast(`${c.icon} You own ${Math.round(o.stake * 100)}% of ${c.name}`, 'gold');
  if (o.stake >= 1) news(`@${S.handle} now owns 100% of ${c.name}`, true);
  sound('cash'); checkAll();
}
function sellStake(k, frac, forced) {
  const A = acqInit(), o = A.own[k]; if (!o) return 0;
  const part = o.stake * frac;
  let val = Math.round(A.val[k] * part * (forced ? 0.75 : 0.97));
  const l = S.bank && S.bank.loans.find((x) => x.kind === 'business' && x.co === k);
  if (l && frac >= 1) { const pay = Math.min(val, l.bal); val -= pay; l.bal -= pay; if (l.bal < 1) S.bank.loans = S.bank.loans.filter((x) => x !== l); }
  const gain = val - o.cost * frac;
  o.cost *= 1 - frac; o.stake = +(o.stake - part).toFixed(2);
  if (o.stake <= 0.001) delete A.own[k];
  S.money += val; if (gain > 0) S.stats.earned += gain;
  log(`${forced ? 'Lost' : 'Sold'} ${Math.round(part * 100)}% of ${BIZ[k].name} for ${money(val)}.`, gain >= 0 ? 'good' : 'bad');
  return val;
}
const bizGrowth = (k) => BIZ[k].g + 0.0004 * ((S.acq.own[k] && S.acq.own[k].exp) || 0);
const bizProfit = (k) => {
  const o = S.acq.own[k]; if (!o) return 0;
  const cut = S.day - o.cut < 7 ? 1.3 : 1;
  return S.acq.val[k] * BIZ[k].y * o.stake * cut * (1 + staffBonus('profit')) * (o.stake >= 0.51 ? 1.1 : 1);
};
function acqTick(lines) {
  const A = acqInit();
  let tot = 0;
  for (const k of Object.keys(BIZ)) {
    const g = (Math.random() + Math.random() + Math.random() - 1.5) * 1.2;
    A.val[k] = Math.max(BIZ[k].val * 0.2, A.val[k] * (1 + bizGrowth(k) + BIZ[k].vol * g * 0.6));
    A.h[k].push(Math.round(A.val[k])); if (A.h[k].length > 40) A.h[k].shift();
    if (A.own[k]) { const p = Math.round(bizProfit(k)); A.own[k].earned += p; tot += p; }
  }
  if (tot) { S.money += tot; S.stats.earned += tot; A.earned += tot; lines.push([`Company profits (${Object.keys(A.own).length} compan${Object.keys(A.own).length > 1 ? 'ies' : 'y'})`, tot]); }
  const owned = Object.keys(A.own);
  if (owned.length && chance(0.12)) S.queue.push({ ev: pick(['acq_offer', 'acq_boom', 'acq_scandal', 'acq_merger']), ctx: { k: pick(owned) } });
}

/* ======================================================================
   Nightly finance tick (called from endDay)
   ====================================================================== */
function financeTick(lines) {
  bankTick(lines);
  acqTick(lines);
  // shorts: borrow fee and margin calls
  const sh = shortInit();
  for (const k of Object.keys(sh)) {
    const s = sh[k]; s.margin -= s.q * S.market.p[k] * 0.0004 * (S.team.quant ? 0.5 : 1);
    if (shortVal(k) <= s.margin * 0.2 && !staffBonus('risk')) { const g = closeShort(k, 'Margin call closed your'); lines.push([`Margin call on your ${ASSETS[k].tick} short`, 0]); if (g < 0) S.stress = clamp(S.stress + 6, 0, 100); }
  }
  // fund manager alpha
  const alpha = staffBonus('alpha'), hv = holdingsValue();
  if (alpha && hv > 100) { const a = Math.round(hv * alpha); S.money += a; S.stats.earned += a; lines.push(['Fund manager returns', a]); }
  // risk officer stop-loss
  if (staffBonus('risk')) for (const k of Object.keys(ASSETS)) if (S.market.q[k] > 0 && S.market.p[k] < S.market.c[k] * 0.8) { sellAsset(k, 1); lines.push([`Risk officer stop-loss sold ${ASSETS[k].tick}`, 0]); }
  // daily staff wellness and reputation effects
  const st = staffBonus('stress'), ht = staffBonus('heat'), rp = staffBonus('rep');
  if (st) S.stress = clamp(S.stress - st, 0, 100);
  if (ht) S.heat = clamp(S.heat - ht, 0, 100);
  if (rp) changeRep(rp);
  if (typeof linksTick === 'function') linksTick(lines);
  const nw = netWorth(); S.stats.bestNW = Math.max(S.stats.bestNW || 0, nw);
  S.fin = S.fin || { nw: [] }; S.fin.nw.push(Math.round(nw)); if (S.fin.nw.length > 40) S.fin.nw.shift();
  S.lastIncome = lines.filter(([, v]) => v > 0); // include everything earned tonight
}

/* ======================================================================
   Screens
   ====================================================================== */
const kv = (l, v, cls = '') => `<div><div class="small muted">${l}</div><div class="big ${cls}">${v}</div></div>`;
const pl = (v) => `<span class="${v >= 0 ? 'good' : 'bad'}">${v >= 0 ? '+' : '−'}${money(Math.abs(v))}</span>`;
function priceTxt(p) { return p < 1 ? '$' + p.toFixed(4) : p < 10 ? '$' + p.toFixed(3) : money(p); }

function vInvest() {
  marketInit(); shortInit();
  const m = S.market, cls = ui.assetCls || 'all';
  const hv = holdingsValue(), sv = shortsValue();
  const costBasis = Object.keys(ASSETS).reduce((a, k) => a + m.q[k] * m.c[k], 0);
  const alloc = {}; for (const k of Object.keys(ASSETS)) { const v = m.q[k] * m.p[k]; if (v > 0.5) alloc[ASSETS[k].cls] = (alloc[ASSETS[k].cls] || 0) + v; }
  const tot = Object.values(alloc).reduce((a, b) => a + b, 0) || 1;
  const COL = { stock: '#1D9BF0', etf: '#00BA7C', bond: '#8B98A5', commod: '#FFD400', reit: '#F91880', crypto: '#7856FF' };
  const mode = ui.tradeMode || 'long';
  const list = Object.entries(ASSETS).filter(([, a]) => cls === 'all' || a.cls === cls);
  return `<div class="col-head">${head('Investing desk', `Portfolio ${money(hv + sv)}`)}${tabsBar(Object.entries(ASSET_CLS), cls, 'assetCls').replace('class="tabs"', 'class="tabs scroll"')}</div>
    <div class="sect"><div class="wallet">${kv('Holdings', money(hv))}${kv('Unrealized', pl(hv - costBasis))}${kv('Shorts', money(sv))}${kv('Realized', pl(S.stats.tradeProfit || 0))}</div>
      ${Object.keys(alloc).length ? `<div class="alloc">${Object.entries(alloc).map(([c, v]) => `<i style="width:${(v / tot) * 100}%;background:${COL[c]}" title="${ASSET_CLS[c]} ${Math.round((v / tot) * 100)}%"></i>`).join('')}</div><div class="row small">${Object.entries(alloc).map(([c, v]) => `<span><span class="dot" style="background:${COL[c]}"></span> ${ASSET_CLS[c]} ${Math.round((v / tot) * 100)}%</span>`).join('')}</div>` : '<span class="small muted">Nothing invested yet. Bonds are safe, ETFs are steady, crypto is a rollercoaster.</span>'}
      ${m.tip ? `<div class="tip"><span class="small muted">Tonight's whisper · ${Math.round(tipAccuracy() * 100)}% reliable</span><b>${esc(m.tip.who)}: "${ASSETS[m.tip.k].tick} is about to ${m.tip.up ? 'rip 🚀' : 'tank 📉'}"</b>${m.lastTip ? `<span class="small">Last tip (${ASSETS[m.lastTip.k].tick}) was ${m.lastTip.right ? '<span class="good">right</span>' : '<span class="bad">wrong</span>'}.</span>` : ''}</div>` : ''}
      <div class="row"><span class="opt-lbl" style="margin:0">Mode</span>${chip('📈 Buy (long)', 'tradeMode', 'long', mode === 'long')}${chip('📉 Short', 'tradeMode', 'short', mode === 'short')}</div>
      <span class="small muted">${mode === 'short' ? 'Shorting: you put up cash as margin and profit when the price falls. Small nightly borrow fee. If the price rises too far, a margin call closes it.' : 'Prices move every night with bull and bear runs. Dividends and bond coupons pay out daily.'}</span></div>
    <div class="sect">${list.map(([k, a]) => { const p = m.p[k], h = m.h[k], ch = h.length > 1 ? (p / h[h.length - 2] - 1) * 100 : 0, own = m.q[k] * p, gain = (p - m.c[k]) * m.q[k], tr = m.trend[k] || 0, s = m.sh[k];
      const amts = [[100, '$100'], [1000, '$1K'], [10000, '$10K'], [100000, '$100K']].filter(([v]) => v <= Math.max(100, S.money));
      const buys = mode === 'long' ? amts.map(([v, l]) => btn(`+${l}`, 'buy$', `${k}:${v}`, 'sm', S.money < v)).join('') + (S.money >= 400 ? btn('+25%', 'buy$', `${k}:pct25`, 'sm') : '') + (S.money >= 100 ? btn('All in', 'buy$', `${k}:all`, 'sm') : '')
        : s ? btn(`Close short ${money(shortVal(k))}`, 'shortClose', k, 'sm primary') : amts.map(([v, l]) => btn(`Short ${l}`, 'shortOpen', `${k}:${v}`, 'sm danger', S.money < v)).join('');
      return `<div class="asset"><div style="min-width:0"><b>${a.tick}</b> <span class="small muted">${a.name}</span> <span class="pill">${ASSET_CLS[a.cls]}</span> ${tr > 0.4 ? '<span class="pill good">Bull</span>' : tr < -0.4 ? '<span class="pill bad">Bear</span>' : ''}${a.div ? ` <span class="pill gold">${(a.div * 100).toFixed(2)}%/day</span>` : ''}
        <div class="num">${priceTxt(p)} <span class="${ch >= 0 ? 'good' : 'bad'} small">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch).toFixed(1)}%</span></div>
        ${own > 0.5 ? `<div class="small">You own ${money(own)} (${pl(gain)})</div>` : ''}${s ? `<div class="small">Short ${money(s.margin)} from ${priceTxt(s.entry)} → now ${money(shortVal(k))} (${pl(shortVal(k) - s.margin)})</div>` : ''}${own <= 0.5 && !s ? `<div class="small muted">${a.desc}</div>` : ''}</div>
        ${sparkline(h)}<div class="row" style="justify-content:flex-end">${buys}${own > 0.5 && mode === 'long' ? btn('Sell ½', 'sell$', `${k}:0.5`, 'sm') + btn('Sell all', 'sell$', `${k}:1`, 'sm danger') : ''}</div></div>`; }).join('')}</div>
    <div class="sect"><h3>Investing team</h3><span class="small muted">Hire them in Team → Finance & investing.</span><div class="row small">${['investor', 'fundmgr', 'quant', 'risk', 'cfo'].map((k) => `<span class="pill ${S.team[k] ? 'good' : ''}">${S.team[k] ? '✓' : ico('lock')} ${TEAM[k].name}</span>`).join('')}</div>
      ${S.team.investor ? invPanel() : ''}</div>`;
}

function vBank() {
  const b = bankInit(), [, band, bc] = creditBand(b.credit);
  const lim = loanLimit(), apr = loanApr('personal');
  const amts = [0.1, 0.25, 0.5, 1].map((f) => Math.round(lim * f / 100) * 100).filter((v, i, a) => v >= 500 && a.indexOf(v) === i);
  const days = ui.loanDays || 90;
  const debt = debtTotal();
  const daily = b.loans.reduce((a, l) => a + l.pay, 0);
  return `<div class="col-head">${head('Clout Bank', `Credit score ${Math.round(b.credit)} · ${band}`)}</div>
    <div class="sect"><div class="wallet">${kv('Credit score', `<span class="${bc}">${Math.round(b.credit)}</span>`)}${kv('Total debt', money(debt), debt ? 'bad' : '')}${kv('Daily payments', money(daily))}${kv('Net worth', money(netWorth()), 'good')}</div>
      <div class="meter credit"><i style="width:${((b.credit - 300) / 550) * 100}%"></i></div>
      <span class="small muted">Pay on time to build credit (+1 a day, +15 per loan paid off). A missed payment costs 30 points and a late fee. Better credit means lower rates, bigger limits and smaller down payments.</span></div>
    <div class="sect"><h3>💳 Personal loan</h3><span class="small">Limit ${money(lim)} · ${(apr * 100).toFixed(1)}% a year</span>
      <div class="scroller">${[30, 90, 180].map((d) => chip(`${d} days`, 'loanDays', d, days === d)).join('')}</div>
      ${amts.length ? `<div class="row">${amts.map((v) => btn(`Borrow ${money(v)} · ${money(Math.ceil(amortized(v, apr / 365, days)))}/day`, 'loanTake', v, 'sm primary')).join('')}</div>` : '<span class="small muted">No credit available right now. Grow your income and net worth, or pay down debt.</span>'}
      <span class="small muted">Payments come out automatically every night (from savings if your cash runs short). Four missed payments in a row and collectors take it from your savings and stocks.</span></div>
    ${b.loans.length ? `<div class="sect"><h3>Your loans</h3>${b.loans.map((l) => `<div class="card"><div class="t"><span>${esc(loanName(l))}</span><span class="pill ${l.missed ? 'bad' : ''}">${(l.apr * 100).toFixed(1)}% APR</span></div>
      <span class="small">Balance ${money(l.bal)} · ${money(l.pay)}/day · ${l.left} days left${l.missed ? ` · <span class="bad">${l.missed} missed</span>` : ''}</span>
      <div class="row">${btn(`Pay ${money(Math.min(l.bal, Math.max(100, Math.round(l.bal * 0.25))))}`, 'loanPay', `${l.id}:0.25`, 'sm', S.money < Math.min(l.bal, 100))}${btn(`Pay off ${money(l.bal)}`, 'loanPay', `${l.id}:1`, 'sm primary', S.money < l.bal)}</div></div>`).join('')}</div>` : ''}
    <div class="sect"><div class="row between"><h3>🏘️ Real estate</h3><span class="small muted">Housing index ${(b.hpi * 100).toFixed(1)} ${sparkline(b.hpiH, 80, 24)}</span></div>
      <span class="small muted">Buy outright or with a 360-day mortgage: ${Math.round(downPct() * 100)}% down at ${(loanApr('mortgage') * 100).toFixed(1)}% a year. Rent pays every night and property values follow the housing index. Miss five mortgage payments and the bank takes it back.</span>
      <div class="cards">${Object.entries(REALTY).map(([k, R]) => { const own = b.props[k], price = propPrice(k), dp = Math.round(price * downPct()), l = b.loans.find((x) => x.kind === 'mortgage' && x.prop === k);
        return `<div class="card ${own ? 'owned' : ''}"><div class="t"><span>${R.icon} ${R.name}</span><span class="num">${money(own ? propValue(k) : price)}</span></div><span class="small muted">${R.desc}</span><span class="small">Rent ${money(propRent(k))}/day${l ? ` · mortgage ${money(l.bal)} left` : ''}</span>
          ${own ? `<div class="row"><span class="pill good">Owned · ${pl(propValue(k) - own.paid)}</span>${btn(`Sell · ${money(propValue(k) * 0.97 - (l ? l.bal : 0))} net`, 'propSell', k, 'sm danger')}</div>` : `<div class="row">${btn(`Buy cash`, 'propBuy', `${k}:0`, 'sm', S.money < price)}${btn(`Mortgage · ${money(dp)} down`, 'propBuy', `${k}:1`, 'sm primary', S.money < dp || b.credit < 560)}</div>`}</div>`; }).join('')}</div></div>`;
}

function vAcquire() {
  const A = acqInit(), t = totalFollowers();
  const owned = Object.keys(A.own);
  return `<div class="col-head">${head('Acquisitions', `${owned.length} compan${owned.length === 1 ? 'y' : 'ies'} · ${money(acqValue())}`)}</div>
    <div class="sect"><div class="wallet">${kv('Portfolio value', money(acqValue()))}${kv('Profit per day', money(owned.reduce((a, k) => a + bizProfit(k), 0)), 'gold')}${kv('All-time profit', money(A.earned), 'good')}</div>
      <span class="small muted">Buy stakes in companies. Every night you get your share of their profit, and the stake grows (or shrinks) with the company's value. Own 51% to take control: a 15% control premium, a perk for you and boardroom moves. Finance with an acquisition loan (40% down) if your credit is 620+.${S.team.mabanker ? ' Your M&A banker gets you a discount.' : ''}</span></div>
    <div class="sect"><div class="cards">${Object.entries(BIZ).map(([k, c]) => {
      const o = A.own[k], st = stakeOf(k), val = A.val[k], h = A.h[k], ch = h.length > 1 ? (val / h[h.length - 2] - 1) * 100 : 0;
      const locked = t < c.req;
      const opts = [0.1, 0.25, 0.51, 1].map((target) => target - st).filter((add) => add > 0.001);
      const ctrl = st >= 0.51, cutOn = o && S.day - o.cut < 7;
      return `<div class="card biz ${o ? 'owned' : ''}"><div class="t"><span>${c.icon} ${c.name}</span><span class="num">${money(val)}</span></div>
        <div class="row between"><span class="small"><span class="${ch >= 0 ? 'good' : 'bad'}">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch).toFixed(1)}%</span> · earns ${(c.y * 100).toFixed(2)}% of value a day</span>${sparkline(h, 90, 26)}</div>
        <span class="small muted">Control perk: ${c.perk[2]}</span>
        ${o ? `<div class="row"><span class="pill ${ctrl ? 'gold' : 'good'}">${Math.round(st * 100)}%${ctrl ? ' · in control' : ''}</span><span class="small">${money(bizProfit(k))}/day · stake ${money(val * st)} (${pl(val * st - o.cost)})</span></div>` : ''}
        ${locked ? `<span class="small muted row">${ico('lock')} Needs ${fmt(c.req)} followers</span>` : `<div class="row">${opts.map((add) => btn(`${st ? 'To' : 'Buy'} ${Math.round((st + add) * 100)}% · ${money(stakePrice(k, add))}`, 'acqBuy', `${k}:${add.toFixed(2)}:0`, 'sm', S.money < stakePrice(k, add))).join('')}</div>
          ${opts.length && bankInit().credit >= 620 && !(S.bank.loans.some((l) => l.kind === 'business' && l.co === k)) ? `<div class="row">${opts.slice(-2).map((add) => btn(`Finance ${Math.round((st + add) * 100)}% · ${money(stakePrice(k, add) * 0.4)} down`, 'acqBuy', `${k}:${add.toFixed(2)}:1`, 'sm blue', S.money < stakePrice(k, add) * 0.4)).join('')}</div>` : ''}`}
        ${ctrl ? `<div class="row">${btn(`Expand · ${money(val * 0.05)}`, 'acqExpand', k, 'sm primary', S.money < val * 0.05 || o.exp >= 5, `Growth +0.04%/day (${o.exp}/5)`)}${btn(cutOn ? 'Cost cuts active' : 'Cut costs', 'acqCut', k, 'sm', cutOn, '+30% profit for 7 days, staff unhappy')}${st >= 1 && val >= 5e6 ? btn('IPO 40%', 'acqIpo', k, 'sm gold') : ''}</div>` : ''}
        ${o ? `<div class="row">${btn('Sell half', 'acqSell', `${k}:0.5`, 'sm')}${btn(`Sell all · ${money(val * st * 0.97)}`, 'acqSell', `${k}:1`, 'sm danger')}</div>` : ''}</div>`; }).join('')}</div></div>`;
}

/* Team screen: the whole org chart, grouped by department */
function vTeamOrg() {
  const t = totalFollowers(), dep = ui.teamDept || 'all';
  let payroll = 0; Object.keys(S.team).forEach((k) => { if (S.team[k] && TEAM[k]) payroll += teamPay(k); });
  const due = (k) => Math.max(0, ((S.teamDue || {})[k] || S.day + 30) - S.day);
  const byDept = {}; for (const k of Object.keys(TEAM)) (byDept[deptOf(k)] = byDept[deptOf(k)] || []).push(k);
  const card = (k) => {
    const m = TEAM[k], hired = !!S.team[k], locked = t < m.req, fx = fxText(m);
    return `<div class="card ${hired ? 'owned' : ''}"><div class="t"><span>${m.name}</span><span class="num">${money(hired ? teamPay(k) : m.pay)}/mo</span></div><span class="small muted">${m.desc}</span>${fx ? `<span class="small gold">${fx}</span>` : ''}
      ${hired ? `<div class="row"><span class="pill good">${TEAM_LEVELS[teamLvl(k) - 1]} · Lv ${teamLvl(k)}</span><span class="small muted">Effect ×${tm(k).toFixed(2)} · payday in ${due(k)}d</span>${teamLvl(k) < 5 ? btn(`Upgrade · ${money(teamUpCost(k))}`, 'teamUp', k, 'sm primary', S.money < teamUpCost(k), `Effect ×${(tm(k) + 0.25).toFixed(2)}`) : '<span class="pill gold">Legend</span>'}${btn('Let go', 'fire', k, 'sm danger')}</div>${k === 'socialmgr' ? mgrPanel() : k === 'investor' ? invPanel() : ''}`
        : locked ? `<span class="small muted row">${ico('lock')} Needs ${fmt(m.req)} followers</span>` : btn(`Hire · ${money(hireCost(k))} first month`, 'hire', k, 'sm primary', S.money < hireCost(k))}</div>`;
  };
  const depts = Object.keys(DEPTS).filter((d) => byDept[d]);
  const show = dep === 'all' ? depts : [dep];
  const openRoles = (d) => byDept[d].filter((k) => !S.team[k] && t >= TEAM[k].req);
  return `<div class="col-head">${head('Your company', `${teamSize()} staff · payroll ${money(payroll)}/month`)}</div>
    <div class="sect"><div class="orgchart">${depts.map((d) => { const n = byDept[d].filter((k) => S.team[k]).length; return `<button class="org-dept ${dep === d ? 'on' : ''}" data-act="teamDept" data-arg="${dep === d ? 'all' : d}"><span class="oi">${DEPTS[d][0]}</span><b>${DEPTS[d][1]}</b><span class="small muted">${n}/${byDept[d].length} hired</span><div class="meter"><i style="width:${(n / byDept[d].length) * 100}%"></i></div></button>`; }).join('')}</div>
      <span class="small muted">Salaries are monthly; hiring pays the first month up front. Upgrade people from Junior to Legend to double what they do. Three days in debt and everyone quits. Tap a department to focus on it.</span></div>
    ${show.map((d) => { const open = openRoles(d), cost = open.reduce((a, k) => a + hireCost(k), 0);
      return `<div class="sect"><div class="row between"><h3>${DEPTS[d][0]} ${DEPTS[d][1]}</h3>${open.length > 1 ? btn(`Hire all ${open.length} · ${money(cost)}`, 'hireDept', d, 'sm blue', S.money < cost) : ''}</div><div class="cards">${byDept[d].map(card).join('')}</div></div>`; }).join('')}`;
}

/* ======================================================================
   Actions
   ====================================================================== */
const FINANCE_ACT = {
  assetCls: (a) => { ui.assetCls = a; },
  tradeMode: (a) => { ui.tradeMode = a; },
  shortOpen: (a) => { const [k, v] = a.split(':'); openShort(k, +v); },
  shortClose: (a) => { const g = closeShort(a); toast(`${g >= 0 ? 'Profit' : 'Loss'}: ${money(Math.abs(g))}`, g >= 0 ? 'gold' : 'bad'); },
  loanDays: (a) => { ui.loanDays = +a; },
  loanTake: (a) => { const v = +a; if (v > loanLimit()) return toast('Over your limit.', 'bad'); takeLoan('personal', v, ui.loanDays || 90); S.money += v; S.bank.credit = clamp(S.bank.credit - 5, 300, 850); log(`Took a ${money(v)} personal loan.`); toast(`${money(v)} deposited. Payments start tonight.`, 'gold'); sound('cash'); },
  loanPay: (a) => { const [id, f] = a.split(':'); const l = bankInit().loans.find((x) => x.id === +id); if (!l) return; const amt = +f >= 1 ? l.bal : Math.max(100, Math.round(l.bal * 0.25)); const p = payLoan(l, amt); if (p && l.bal >= 1) toast(`Paid ${money(p)}. ${money(l.bal)} left.`); },
  propBuy: (a) => { const [k, m] = a.split(':'); buyProp(k, m === '1'); },
  propSell: (a) => { const v = sellProp(a); toast(`Sold. ${money(v)} after paying off the mortgage.`, 'gold'); },
  acqBuy: (a) => { const [k, add, f] = a.split(':'); buyStake(k, +add, f === '1'); },
  acqSell: (a) => { const [k, f] = a.split(':'); const v = sellStake(k, +f); toast(`Sold for ${money(v)}`, 'gold'); },
  acqExpand: (a) => { const o = S.acq.own[a], c = Math.round(S.acq.val[a] * 0.05); if (!o || o.exp >= 5 || !spend(c)) return toast('Not enough cash.', 'bad'); o.exp++; S.acq.val[a] += c * 0.6; toast(`${BIZ[a].name} is expanding. Growth up for good.`, 'gold'); },
  acqCut: (a) => { const o = S.acq.own[a]; if (!o) return; o.cut = S.day; changeRep(-0.5); toast('Costs cut: +30% profit for a week. The staff are not happy.'); if (chance(0.3)) S.queue.push({ ev: 'acq_strike', ctx: { k: a } }); },
  acqIpo: (a) => { const o = S.acq.own[a]; if (!o || o.stake < 1) return; const v = Math.round(S.acq.val[a] * 0.4 * 1.25); o.stake = 0.6; o.cost *= 0.6; S.money += v; S.stats.earned += v; S.acq.val[a] *= 1.15; S.stats.ipos = (S.stats.ipos || 0) + 1; news(`${BIZ[a].name} goes public! @${S.handle} rings the opening bell.`, true); toast(`IPO! You raised ${money(v)} and still own 60%.`, 'gold'); celebrate('gold'); sound('cash'); },
  teamDept: (a) => { ui.teamDept = a; },
  hireDept: (a) => { const ks = Object.keys(TEAM).filter((k) => deptOf(k) === a && !S.team[k] && totalFollowers() >= TEAM[k].req); const cost = ks.reduce((s, k) => s + hireCost(k), 0); if (!spend(cost)) return toast('Not enough money.', 'bad'); S.teamDue = S.teamDue || {}; ks.forEach((k) => { S.team[k] = true; S.teamDue[k] = S.day + 30; }); log(`Hired the whole ${DEPTS[a][1]} department.`, 'good'); toast(`${ks.length} people hired.`, 'gold'); checkAll(); },
};

/* ======================================================================
   Events
   ====================================================================== */
Object.assign(EVENTS, {
  acq_offer: {
    title: (c) => `Buyout offer for your ${BIZ[c.k].name} stake`,
    text: (c) => `A private equity fund wants your ${Math.round(stakeOf(c.k) * 100)}% of ${BIZ[c.k].name} and is offering 30% over market: ${money(S.acq.val[c.k] * stakeOf(c.k) * 1.3)}.`,
    choices: (c) => [
      { label: 'Sell at the premium', fn: () => { const v = Math.round(S.acq.val[c.k] * stakeOf(c.k) * 1.3); const l = S.bank && S.bank.loans.find((x) => x.kind === 'business' && x.co === c.k); let net = v; if (l) { net -= Math.min(v, l.bal); S.bank.loans = S.bank.loans.filter((x) => x !== l); } delete S.acq.own[c.k]; S.money += net; S.stats.earned += net; return R(`Deal closed. ${money(net)} in the bank${l ? ' after paying off the loan' : ''}.`, { rep: 1 }); } },
      { label: 'Counter for 50%', sub: `Business ${skillLvl('business')}`, fn: () => chance(0.3 + skillLvl('business') * 0.04) ? (S.acq.val[c.k] *= 1.1, R('They walked away, but the news pushed the valuation up 10%.')) : R('They walked. No deal.') },
      { label: 'Not for sale', fn: () => R('You are building something. They respect it.', { rep: 0.5 }) },
    ],
  },
  acq_boom: {
    title: (c) => `${BIZ[c.k].name} is booming`,
    text: (c) => `${BIZ[c.k].name} just had its best month ever. Analysts are calling it the next big thing.`,
    choices: (c) => [
      { label: 'Post about it', fn: () => { S.acq.val[c.k] *= 1.2; return R('Your post sent customers flooding in. Valuation +20%.', { fp: 0.004 }); } },
      { label: 'Quietly reinvest', fn: () => { S.acq.val[c.k] *= 1.12; if (S.acq.own[c.k]) S.acq.own[c.k].exp = Math.min(5, (S.acq.own[c.k].exp || 0) + 1); return R('Valuation +12% and growth is up for good.'); } },
    ],
  },
  acq_scandal: {
    neg: true, title: (c) => `Scandal at ${BIZ[c.k].name}`,
    text: (c) => `A former employee posted a long thread about working conditions at ${BIZ[c.k].name}. People are tagging you, the owner.`,
    choices: (c) => [
      { label: 'Fix it and apologize', sub: '5% of company value', disabled: () => S.money < S.acq.val[c.k] * 0.05, fn: () => { S.money -= Math.round(S.acq.val[c.k] * 0.05); return R('Raises, a new HR team and a real apology. People noticed.', { rep: 2, heat: -5 }); } },
      { label: 'Blame the managers', fn: () => { S.acq.val[c.k] *= 0.9; return R('Nobody bought it. Valuation −10%.', { rep: -2, heat: 8 }); } },
      { label: 'Say nothing', fn: () => { S.acq.val[c.k] *= 0.8; return R('The boycott hit sales hard. Valuation −20%.', { rep: -1, heat: 4 }); } },
    ],
  },
  acq_merger: {
    title: (c) => `${BIZ[c.k].name} merger talks`,
    text: (c) => `A rival wants to merge with ${BIZ[c.k].name}. It could double the business, or blow up in everyone's face.`,
    choices: (c) => [
      { label: 'Merge', sub: '55% it works', fn: () => chance(0.55) ? (S.acq.val[c.k] *= 1.45, news(`${BIZ[c.k].name} merger is a hit`, true), R('The merger worked. Valuation +45%.')) : (S.acq.val[c.k] *= 0.75, R('Culture clash. Half the staff quit. Valuation −25%.', { stress: 8 })) },
      { label: 'Stay independent', fn: () => R('Steady as she goes.') },
    ],
  },
  acq_strike: {
    neg: true, title: (c) => `Staff walk out at ${BIZ[c.k].name}`,
    text: () => 'After the cost cuts, the staff are on strike. The picket line is trending.',
    choices: (c) => [
      { label: 'Give them a raise', sub: '3% of company value', disabled: () => S.money < S.acq.val[c.k] * 0.03, fn: () => { S.money -= Math.round(S.acq.val[c.k] * 0.03); if (S.acq.own[c.k]) S.acq.own[c.k].cut = -99; return R('Back to work, happier than before.', { rep: 1.5 }); } },
      { label: 'Wait them out', fn: () => { S.acq.val[c.k] *= 0.88; return R('Two weeks of closed stores. Valuation −12%.', { rep: -2, heat: 6 }); } },
    ],
  },
  bank_offer: {
    random: true, w: 0.6, when: () => S.bank && S.bank.credit >= 740 && totalFollowers() >= 50000,
    title: () => 'Clout Bank wants you as an ambassador',
    text: () => 'Clout Bank loves your credit history. They offer a lower rate on every loan if you post one sponsored video about "financial freedom".',
    choices: () => [
      { label: 'Do it', fn: () => { S.bank.loans.forEach((l) => { l.rate *= 0.8; l.apr *= 0.8; }); return R('Every loan rate is now 20% lower.', { money: 2000, rep: -0.5 }); } },
      { label: 'Pass', fn: () => R('You keep your feed ad-free today.', { rep: 0.5 }) },
    ],
  },
  housing_boom: {
    random: true, w: 0.5, when: () => S.bank && Object.keys(S.bank.props).length > 0,
    title: () => 'Housing boom', text: () => 'A new rail line was announced near your properties. Prices are jumping.',
    choices: () => [{ label: 'Nice', fn: () => { S.bank.hpi *= 1.08; return R('Your properties are worth 8% more.'); } }],
  },
  housing_crash: {
    random: true, neg: true, w: 0.35, when: () => S.bank && Object.keys(S.bank.props).length > 0,
    title: () => 'Housing market wobbles', text: () => 'Rates are up and buyers are scared. House prices dip across the country.',
    choices: () => [{ label: 'Hold on', fn: () => { S.bank.hpi *= 0.93; return R('Your properties lost 7% of their value. Rent is still coming in.'); } }],
  },
});

ACHIEVEMENTS.push(
  ['landlord', 'Landlord', 'Buy a property with a mortgage or cash', () => (S.stats.propsBought || 0) >= 1],
  ['mogul', 'Real estate mogul', 'Own 5 properties at once', () => S.bank && Object.keys(S.bank.props).length >= 5],
  ['credit800', 'Credit royalty', 'Reach an 800 credit score', () => S.bank && S.bank.credit >= 800],
  ['acq1', 'Investor', 'Buy a stake in a company', () => (S.stats.acquisitions || 0) >= 1],
  ['control', 'Majority owner', 'Take control of a company', () => S.acq && Object.keys(S.acq.own).some((k) => stakeOf(k) >= 0.51)],
  ['ipo', 'Ring the bell', 'Take a company public', () => (S.stats.ipos || 0) >= 1],
  ['nw1b', 'Billionaire', 'Reach a $1B net worth', () => (S.stats.bestNW || 0) >= 1e9],
  ['org20', 'Enterprise', 'Employ 20 people', () => teamSize() >= 20],
  ['org40', 'Corporation', 'Employ 40 people', () => teamSize() >= 40],
);
