/* Clout Chaser — progression: a guided career path, screens that unlock as you grow, money sinks
   (wealth upkeep and prestige purchases) and events that tie the systems together */
'use strict';

/* ======================================================================
   Screens unlock as you grow, so new players are not buried on day one
   ====================================================================== */
const TF = () => totalFollowers();
const UNLOCKS = {
  invest:   [() => TF() >= 500 || holdingsValue() > 0, '500 followers'],
  team:     [() => TF() >= 1000 || teamSize() > 0, '1K followers'],
  fanvault: [() => TF() >= PLATFORMS.vault.unlock || vaultOn(), `${fmt(PLATFORMS.vault.unlock)} followers`],
  arena:    [() => TF() >= 1000 || S.day >= 4 || !!S.book, '1K followers or day 4'],
  danger:   [() => TF() >= 2000, '2K followers'],
  bank:     [() => TF() >= 2000 || !!(S.bank && (S.bank.loans.length || Object.keys(S.bank.props).length)), '2K followers'],
  hq:       [() => TF() >= 3000 || (typeof hqTotal === 'function' && hqTotal() > 0), '3K followers'],
  empire:   [() => TF() >= 5000 || !!S.merch || !!S.podcast, '5K followers'],
  acquire:  [() => TF() >= 5000 || !!(S.acq && Object.keys(S.acq.own).length), '5K followers'],
  tea:      [() => TF() >= 10000 || (S.tea || []).length > 0, '10K followers'],
  legacy:   [() => TF() >= 1e6 || !!(S.legacy && S.legacy.rank), '1M followers'],
};
function featureOn(t) {
  if (!S || !UNLOCKS[t]) return true;
  S.unlocked = S.unlocked || {};
  if (S.unlocked[t]) return true;
  if (UNLOCKS[t][0]()) { S.unlocked[t] = true; return true; }
  return false;
}
/* call after anything that can grow you: announces newly opened screens */
function unlockCheck() {
  if (!S) return;
  S.unlocked = S.unlocked || {};
  for (const t of Object.keys(UNLOCKS)) if (!S.unlocked[t] && UNLOCKS[t][0]()) {
    S.unlocked[t] = true;
    if (S.day > 1 || S.stats.posts > 0) { toast(`🔓 New screen unlocked: ${careerName(t)}`, 'gold'); notify('system', null, `New screen unlocked: ${careerName(t)}. Find it in the menu.`); }
  }
}
const hubOpen = (h) => h[3].some(featureOn);
function vLocked(t) {
  const [, need] = UNLOCKS[t];
  return `<div class="col-head">${head(careerName(t))}</div><div class="sect locked-screen"><div class="lock-big">${ico('lock', 'ico-lg')}</div>
    <h3>${esc(careerName(t))} unlocks at ${need}</h3><p class="small muted">Keep posting and growing. You have ${fmt(TF())} followers.</p>${btn(`${ico('feather')} Make a post`, 'compose', '', 'primary')}</div>`;
}

/* ======================================================================
   Career path: one clear goal at a time, with a reward
   ====================================================================== */
const owns = () => Object.keys(S.owned).some((k) => S.owned[k]);
const winsAny = () => (S.stats.betWins || 0) + (S.stats.fightWins || 0) + (S.stats.raceWins || 0) + (S.stats.bjWins || 0) + (S.stats.parlayWins || 0) + ((S.casino && S.casino.best) ? 1 : 0);
const CAREER_PATH = [
  { t: 'Make your first post', d: 'Tap Post, pick a format and publish.', ok: () => S.stats.posts >= 1, go: ['compose', ''], cash: 50, e: 10 },
  { t: 'Reach 100 followers', d: 'Post a few times. Trending tags and prime time help.', ok: () => TF() >= 100, go: ['compose', ''], cash: 100 },
  { t: 'Reply to your fans', d: 'Life → "Reply to 10 comments". Fans love it.', ok: () => (S.stats.n_reply || 0) >= 1, go: ['go', 'life'], cash: 0, e: 15 },
  { t: 'Sleep to end the day', d: 'Every night your money, fans and world move forward.', ok: () => S.day >= 2, go: ['endDay', ''], cash: 150 },
  { t: 'Post 5 times', d: 'Try different platforms and formats.', ok: () => S.stats.posts >= 5, go: ['compose', ''], cash: 200 },
  { t: 'Finish a daily quest', d: 'Three new quests every day, plus a bonus chest.', ok: () => (S.stats.questsDone || 0) >= 1 || (S.quests && S.quests.list && S.quests.list.some((q) => q.done)), go: ['go', 'quests'], cash: 250 },
  { t: 'Reach 1,000 followers', d: 'Your team, the Arena and FanVault open up.', ok: () => TF() >= 1000, go: ['compose', ''], cash: 500, e: 20 },
  { t: 'Hire your first team member', d: 'Team → hire someone. A personal assistant is a great start.', ok: () => teamSize() >= 1, go: ['go', 'team'], cash: 300 },
  { t: 'Land a brand deal', d: 'Accept an offer in Brand deals and post it before the deadline.', ok: () => S.stats.deals >= 1, go: ['go', 'deals'], cash: 500 },
  { t: 'Buy something in the Shop', d: 'Gear makes every post better.', ok: owns, go: ['go', 'shop'], cash: 300 },
  { t: 'Invest $100', d: 'Investing → buy anything. Bonds are safe, crypto is chaos.', ok: () => holdingsValue() > 0 || (S.stats.tradeProfit || 0) !== 0, go: ['go', 'invest'], cash: 200 },
  { t: 'Go live', d: 'Unlock Streamly at 8K followers and stream for gifts.', ok: () => S.stats.streams >= 1, go: ['compose', 'live'], cash: 1000, e: 20 },
  { t: 'Reach 10,000 followers', d: 'Micro-influencer status. Empire and Acquisitions open.', ok: () => TF() >= 1e4, go: ['compose', ''], cash: 3000 },
  { t: 'Win a bet in the Arena', d: 'Sports, fights, races or cards. Game money only.', ok: () => winsAny() >= 1, go: ['go', 'arena'], cash: 500 },
  { t: 'Go viral', d: 'Ride a trend, post at prime time, and get lucky.', ok: () => S.stats.viral >= 1, go: ['compose', ''], cash: 2000, e: 25 },
  { t: 'Launch merch or a podcast', d: 'Empire → build something of your own.', ok: () => !!S.merch || !!S.podcast, go: ['go', 'empire'], cash: 2500 },
  { t: 'Reach 100,000 followers', d: 'Mid-tier. Bigger deals, bigger drama.', ok: () => TF() >= 1e5, go: ['compose', ''], cash: 25000 },
  { t: 'Buy a property', d: 'Bank → real estate. A mortgage gets you in with 20% down.', ok: () => (S.stats.propsBought || 0) >= 1 || SHOP.some((it) => it.cat === 'Property' && S.owned[it.id]), go: ['go', 'bank'], cash: 10000 },
  { t: 'Buy a stake in a company', d: 'Acquisitions → start with 10% of a coffee chain.', ok: () => (S.stats.acquisitions || 0) >= 1, go: ['go', 'acquire'], cash: 15000 },
  { t: 'Reach 1 million followers', d: 'Mega status. Legacy opens.', ok: () => TF() >= 1e6, go: ['compose', ''], cash: 250000 },
  { t: 'Take control of a company', d: 'Own 51% of any company for its perk and boardroom moves.', ok: () => S.acq && Object.keys(S.acq.own).some((k) => stakeOf(k) >= 0.51), go: ['go', 'acquire'], cash: 100000 },
  { t: 'Buy a prestige item', d: 'Shop → Prestige. Turn money into fame.', ok: () => prestigeLvl() >= 1, go: ['go', 'shop'], cash: 0, e: 30 },
  { t: 'Reach 10 million followers', d: 'Celebrity. Everyone knows your name.', ok: () => TF() >= 1e7, go: ['compose', ''], cash: 5e6 },
  { t: 'Employ 20 people', d: 'Build a real company: Team → hire whole departments.', ok: () => teamSize() >= 20, go: ['go', 'team'], cash: 1e6 },
  { t: 'Rebrand into a new era', d: 'Reach 100M followers, then rebrand in Legacy for permanent perks.', ok: () => (S.stats.rebrands || 0) >= 1, go: ['go', 'legacy'], cash: 0, e: 50 },
];
/* old saves skip straight past goals they already finished, without paying rewards twice */
function careerInit() {
  if (!S.career) { S.career = { i: 0 }; if (S.day > 1 || S.stats.posts > 0) while (S.career.i < CAREER_PATH.length && CAREER_PATH[S.career.i].ok()) S.career.i++; }
  return S.career;
}
const careerGoal = () => CAREER_PATH[careerInit().i];
function careerClaim() {
  const c = careerInit(), g = careerGoal(); if (!g || !g.ok()) return;
  if (g.cash) { S.money += g.cash; S.stats.earned += g.cash; }
  if (g.e) gainEnergy(g.e, `Goal reward: ${g.t}`);
  c.i++;
  toast(`🎯 Goal complete: ${g.t}${g.cash ? ` · +${money(g.cash)}` : ''}`, 'gold'); sound('cash');
  if (typeof burst === 'function') try { burst('💰'); } catch (e) { /* visual only */ }
  if (c.i % 5 === 0) celebrate('gold');
}
function careerCard() {
  const c = careerInit(), g = careerGoal();
  if (!g) return `<div class="goal-card done"><b>🏆 Career path complete</b><span class="small muted">You've done it all. Keep chasing records, prestige and new eras.</span></div>`;
  const ready = g.ok();
  return `<div class="goal-card ${ready ? 'ready' : ''}"><div class="row between"><span class="eyebrow">Goal ${c.i + 1} of ${CAREER_PATH.length}</span><span class="small gold">${g.cash ? '+' + money(g.cash) : ''}${g.cash && g.e ? ' · ' : ''}${g.e ? `+${g.e} energy` : ''}</span></div>
    <b>${esc(g.t)}</b><span class="small muted">${esc(g.d)}</span><div class="meter gold"><i style="width:${(c.i / CAREER_PATH.length) * 100}%"></i></div>
    <div class="row">${ready ? btn('Claim reward', 'careerClaim', '', 'primary') : btn('Show me', g.go[0], g.go[1], 'sm blue')}</div></div>`;
}

/* ======================================================================
   Money sinks: wealth upkeep and prestige purchases
   ====================================================================== */
/* the rich pay for staff, security, insurance and advisors: a gentle progressive drag on net worth */
function wealthUpkeep() {
  const nw = Math.max(0, netWorth());
  const band = (lo, hi, r) => Math.max(0, Math.min(nw, hi) - lo) * r;
  const raw = band(1e6, 1e8, 0.0002) + band(1e8, 1e9, 0.0005) + band(1e9, Infinity, 0.0008);
  return Math.round(raw * (1 - Math.min(0.5, staffBonus('tax'))));
}
const PRESTIGE = {
  gala:    { name: 'Host a charity gala',        icon: '🥂', price: 250000, fx: { rep: 4, fp: 0.01 },  desc: 'Black tie, big cheques, glowing press.' },
  ad:      { name: 'Clout Bowl halftime ad',     icon: '📺', price: 2e6,    fx: { fp: 0.03 },          desc: '30 seconds in front of 120 million people.' },
  art:     { name: 'Buy a museum-grade artwork', icon: '🖼️', price: 5e6,    fx: { rep: 2, fp: 0.01 },  desc: 'Loaned to a museum with your name on the plaque.' },
  wing:    { name: 'Fund a hospital wing',       icon: '🏥', price: 2.5e7,  fx: { rep: 8, fp: 0.02 },  desc: 'The most wholesome headline money can buy.' },
  stadium: { name: 'Name a stadium',             icon: '🏟️', price: 1e8,    fx: { fp: 0.05, rep: 2 },  desc: 'Every match, every broadcast: your name.' },
  space:   { name: 'Fly to space',               icon: '🚀', price: 3e8,    fx: { fp: 0.1 },           desc: 'Livestream from orbit. The whole planet watches.' },
};
const prestigeLvl = () => (S && S.prestige ? Object.values(S.prestige).reduce((a, b) => a + b, 0) : 0);
const prestigeCost = (k) => Math.round(PRESTIGE[k].price * Math.pow(1.6, (S.prestige && S.prestige[k]) || 0));
const PRESTIGE_TITLES = ['', 'Notable', 'Society regular', 'Philanthropist', 'Tastemaker', 'Icon of the age', 'Living legend'];
const prestigeTitle = () => PRESTIGE_TITLES[Math.min(PRESTIGE_TITLES.length - 1, Math.floor(Math.sqrt(prestigeLvl())))];
function buyPrestige(k) {
  const P = PRESTIGE[k], c = prestigeCost(k);
  if (!spend(c)) return toast('Not enough money.', 'bad');
  S.prestige = S.prestige || {}; S.prestige[k] = (S.prestige[k] || 0) + 1;
  applyFx(P.fx);
  news(`@${S.handle}: ${P.name.toLowerCase()}. The internet is talking.`, true);
  toast(`${P.icon} ${P.name}. Prestige ${prestigeLvl()}${prestigeTitle() ? ` · ${prestigeTitle()}` : ''}`, 'gold'); celebrate('gold'); sound('cash');
  checkAll();
}
function prestigeSection() {
  if (TF() < 1e5 && !prestigeLvl()) return '';
  return `<div class="sect"><h3>✨ Prestige <span class="small muted">· turn money into fame · level ${prestigeLvl()}${prestigeTitle() ? ` · ${prestigeTitle()}` : ''}</span></h3>
    <span class="small muted">Each purchase grows your followers and reputation right away, and every prestige level adds +1% reach for good (up to +20%). Prices rise 60% each time you repeat one.</span>
    <div class="cards">${Object.entries(PRESTIGE).map(([k, P]) => `<div class="card"><div class="t"><span>${P.icon} ${P.name}</span><span class="num">${money(prestigeCost(k))}</span></div><span class="small muted">${P.desc}</span>
      <span class="small gold">${P.fx.fp ? `+${Math.round(P.fx.fp * 100)}% followers` : ''}${P.fx.fp && P.fx.rep ? ' · ' : ''}${P.fx.rep ? `+${P.fx.rep} reputation` : ''}${S.prestige && S.prestige[k] ? ` · done ${S.prestige[k]}×` : ''}</span>${btn('Buy', 'prestigeBuy', k, 'sm primary', S.money < prestigeCost(k))}</div>`).join('')}</div></div>`;
}

/* ======================================================================
   Linked systems: fame, feuds, companies, markets and FanVault affect each other
   ====================================================================== */
const ctrlCos = () => (S.acq ? Object.keys(S.acq.own).filter((k) => stakeOf(k) >= 0.51) : []);
function onGameEvent(kind) {
  if (!S) return;
  if (kind === 'viral') {
    // a viral post sends customers to the companies you own
    const cos = S.acq ? Object.keys(S.acq.own) : [];
    if (cos.length) { const k = pick(cos); S.acq.val[k] *= 1.03; news(`Your viral post sent a wave of customers to ${BIZ[k].name}`, true); }
    // and pumps the coin you hold the most of
    if (S.market && S.market.q.clt > 0 && chance(0.4)) S.market.p.clt *= 1.05;
  }
}
function linksTick(lines) {
  // scandals hurt the companies you control, but controversy sells subscriptions
  if (S.heat >= 70) {
    const cos = ctrlCos();
    cos.forEach((k) => { S.acq.val[k] *= 0.985; });
    if (cos.length) lines.push(['Your scandal is hurting your companies (−1.5% value)', 0]);
    if (vaultOn()) { S.platforms.vault.followers *= 1.01; lines.push(['Drama drove curious fans to FanVault (+1%)', 0]); }
  }
  // great reputation makes banks friendlier
  if (S.bank && S.rep >= 80) S.bank.credit = clamp(S.bank.credit + 0.5, 300, 850);
  // a gentle drag on very large fortunes
  const up = wealthUpkeep();
  if (up) { S.money -= up; lines.push(['Wealth upkeep (security, staff, insurance, advisors)', -up]); }
}
const richStar = () => Object.keys(S.npcs).filter((id) => S.npcs[id].rel >= 55 && !S.npcs[id].feud);
Object.assign(EVENTS, {
  link_inhouse_ad: {
    random: true, w: 1, when: () => ctrlCos().length > 0, ctx: () => ({ k: pick(ctrlCos()) }),
    title: (c) => `${BIZ[c.k].name} wants you in their ad`, text: (c) => `Your own marketing team at ${BIZ[c.k].name} wants you front and center in their new campaign. Fans will know you own it.`,
    choices: (c) => [
      { label: 'Star in it', sub: '−15 energy', fn: () => { S.acq.val[c.k] *= 1.08; return R(`${BIZ[c.k].name} sales jumped. Valuation +8%.`, { energy: -15, rep: -0.5, fp: 0.005 }); } },
      { label: 'Let them hire an actor', fn: () => { S.acq.val[c.k] *= 1.02; return R('A solid ad. Nobody noticed it was yours.'); } },
    ],
  },
  link_celeb_investor: {
    random: true, w: 0.8, when: () => ctrlCos().length > 0 && richStar().length > 0, ctx: () => ({ k: pick(ctrlCos()), n: pick(richStar()) }),
    title: (c) => `${npcName(c.n)} wants in on ${BIZ[c.k].name}`, text: (c) => `${npcName(c.n)} loves what you're building and offers to buy 10% of ${BIZ[c.k].name} at a 25% premium. Celebrity backing tends to lift a company.`,
    choices: (c) => [
      { label: 'Welcome aboard', fn: () => { const st = Math.min(0.1, stakeOf(c.k) - 0.51); if (st <= 0) return R('You realize selling would cost you control. You politely decline.', { rel: { [c.n]: 2 } }); const v = Math.round(S.acq.val[c.k] * st * 1.25); S.acq.own[c.k].stake = +(S.acq.own[c.k].stake - st).toFixed(2); S.acq.val[c.k] *= 1.1; S.money += v; S.stats.earned += v; news(`${npcName(c.n)} invests in @${S.handle}'s ${BIZ[c.k].name}`, true); return R(`${money(v)} in the bank, and the company is worth 10% more with a star on board.`, { rel: { [c.n]: 8 }, fp: 0.01 }); } },
      { label: 'Keep it all', fn: () => R('You like owning it all. They get it.', { rel: { [c.n]: -2 } }) },
    ],
  },
  link_boycott: {
    random: true, neg: true, w: 1, when: () => S.heat >= 50 && S.acq && Object.keys(S.acq.own).length > 0, ctx: () => ({ k: pick(Object.keys(S.acq.own)) }),
    title: (c) => `#Boycott${BIZ[c.k].name.replace(/\W/g, '')} is trending`, text: (c) => `People angry at you have found out you own part of ${BIZ[c.k].name}. Now they're going after it.`,
    choices: (c) => [
      { label: 'Apologize publicly', fn: () => { S.acq.val[c.k] *= 0.97; return R('It calmed down. Mostly.', { heat: -12, rep: 1 }); } },
      { label: 'Double down', fn: () => chance(0.4) ? (S.acq.val[c.k] *= 1.05, R('Your fans bought out the stores in solidarity. Valuation up 5%.', { heat: 6, fp: 0.01 })) : (S.acq.val[c.k] *= 0.85, R('The boycott worked. Valuation −15%.', { heat: 8 })) },
      ...(S.team.crisis || S.team.pr ? [{ label: 'Let your crisis team handle it', fn: () => R('A quiet statement, a donation, and the hashtag died overnight.', { heat: -15 }) }] : []),
    ],
  },
  link_star_tip: {
    random: true, w: 0.8, when: () => richStar().some((id) => ['tech', 'lifestyle'].includes(NPCS[id].niche)) && TF() >= 5000, ctx: () => ({ n: pick(richStar().filter((id) => ['tech', 'lifestyle'].includes(NPCS[id].niche))) }),
    title: (c) => `${npcName(c.n)} slides into your DMs with a stock tip`, text: (c) => { marketInit(); const k = pick(Object.keys(ASSETS)); c.k = k; return `"Between us: ${ASSETS[k].tick} is about to move. Big." ${npcName(c.n)} is usually right about these things.`; },
    choices: (c) => [
      { label: 'Act on it', fn: () => { S.market.tip = { k: c.k, up: chance(0.85), who: '@' + NPCS[c.n].handle, size: rnd(0.1, 0.25) }; return R(`The tip is now tonight's whisper in Investing. Buy ${ASSETS[c.k].tick} before you sleep.`, { rel: { [c.n]: 2 } }); } },
      { label: 'Report it (that\'s insider trading)', fn: () => R('Legally spotless. Socially awkward.', { rep: 2, rel: { [c.n]: -6 } }) },
    ],
  },
  link_bank_review: {
    random: true, neg: true, w: 0.8, when: () => S.heat >= 75 && S.bank && S.bank.loans.length > 0,
    title: () => 'Your bank is "reviewing your relationship"', text: () => 'Clout Bank\'s risk team saw the headlines. They are nervous about lending to someone this controversial.',
    choices: () => [
      { label: 'Pay down 10% of your debt', sub: money(debtTotal() * 0.1), disabled: () => S.money < debtTotal() * 0.1, fn: () => { let left = debtTotal() * 0.1; for (const l of S.bank.loans) { const p = Math.min(left, l.bal); payLoan(l, p); left -= p; if (left <= 0) break; } return R('They relaxed. Your credit is fine.', {}); } },
      { label: 'Ignore them', fn: () => { S.bank.credit = clamp(S.bank.credit - 40, 300, 850); return R('They cut your credit score by 40 points.', { stress: 6 }); } },
    ],
  },
  link_vault_investor: {
    random: true, w: 0.6, when: () => vaultSubs() >= 2000 && S.acq && S.acq.own.stream, title: () => 'StreamNest wants FanVault exclusives',
    text: () => 'Since you own part of StreamNest, they want your FanVault subscribers to get a discounted StreamNest bundle.',
    choices: () => [
      { label: 'Bundle them', fn: () => { S.acq.val.stream *= 1.06; S.platforms.vault.followers *= 1.05; return R('Both grew: StreamNest +6%, FanVault subscribers +5%.'); } },
      { label: 'Keep them separate', fn: () => R('Clean lines. Fine.') },
    ],
  },
});

/* ======================================================================
   Wiring
   ====================================================================== */
const PROG_ACT = {
  careerClaim: () => { careerClaim(); },
  prestigeBuy: (a) => { buyPrestige(a); },
};
ACHIEVEMENTS.push(
  ['path10', 'On the path', 'Complete 10 career goals', () => S.career && S.career.i >= 10],
  ['pathall', 'Career complete', 'Complete every career goal', () => S.career && S.career.i >= CAREER_PATH.length],
  ['prestige5', 'High society', 'Reach prestige level 5', () => prestigeLvl() >= 5],
);
