/* Clout Chaser — FanVault: a paid-subscription platform. Fans pay monthly for exclusive drops.
   Huge money, but brands get nervous, content leaks, and the internet has opinions. Kept PG-13. */
'use strict';

PLATFORMS.vault = { name: 'FanVault', kind: 'Paid subscriptions', unlock: 1000, start: 0, baseEng: 14, cpm: 0, color: '#00AFF0' };
const SPECIAL_PLATS = new Set(['live', 'vault']);
const postIds = () => unlockedIds().filter((p) => !SPECIAL_PLATS.has(p));

/* price → how many fans are willing to pay it */
const VAULT_PRICES = { 4.99: 1.6, 9.99: 1, 14.99: 0.72, 24.99: 0.45 };
const VAULT_DROPS = {
  bts:      { name: 'Behind-the-scenes vlog', e: 8,  desc: 'Unfiltered day in your life. Keeps subscribers loyal.', subs: 0.012, keep: true },
  glam:     { name: 'Glam photoshoot set',    e: 14, cost: 500, desc: 'Stylist, lights, ten looks. Pulls in new subscribers.', subs: 0.045, heat: 2 },
  poolside: { name: 'Poolside set',           e: 12, desc: 'Swimwear, golden hour, a lot of "accidental" angles. Subscribers flood in; so do opinions.', subs: 0.08, heat: 7, rep: -1.5, leak: 0.18 },
  ppv:      { name: 'Pay-per-view exclusive', e: 16, desc: 'A locked premium post at $20. Big one-time payday.', ppv: 20 },
  customs:  { name: 'Custom shoutout videos', e: 20, desc: 'Personal videos for fans who pay $25 each.', customs: 25, stress: 6 },
  dmhour:   { name: 'Paid DM hour',           e: 10, desc: 'Chat with subscribers. Tips roll in. Exhausting.', tips: true, stress: 9 },
};

function vaultInit() {
  if (!S.vault) S.vault = { price: 9.99, link: false, lastDrop: 0, lastPpv: -9, earned: 0, ppvSold: 0, drops: [], ownApp: false };
  return S.vault;
}
const vaultOn = () => S.platforms.vault && S.platforms.vault.unlocked;
const vaultSubs = () => (vaultOn() ? S.platforms.vault.followers : 0);
const vaultCut = () => (vaultInit().ownApp ? 0.92 : 0.8);
function vaultEarn(n, why) {
  n = Math.round(n); if (n <= 0) return 0;
  S.money += n; S.stats.earned += n; vaultInit().earned += n;
  return n;
}
function vaultRecord(kind, text, cash, dsubs) {
  const v = vaultInit();
  v.drops.unshift({ d: S.day, kind, text, cash: Math.round(cash), dsubs: Math.round(dsubs) });
  if (v.drops.length > 12) v.drops.length = 12;
}

/* Free posts funnel fans to the paywall when your link is in your bio */
function vaultFunnel(r) {
  if (!vaultOn() || !vaultInit().link || r.gain <= 0) return 0;
  const n = (r.gain * 0.08 + r.views * 0.0004) * VAULT_PRICES[S.vault.price] * clamp(S.rep / 60, 0.3, 1.4) * realRatio();
  S.platforms.vault.followers += n * promoGrowth();
  return n;
}

function vaultDrop(kind) {
  const D = VAULT_DROPS[kind], v = vaultInit(), ps = S.platforms.vault;
  if (D.cost && !spend(D.cost)) { toast(`You need ${money(D.cost)} for this.`, 'bad'); return false; }
  if (!needEnergy(D.e)) { if (D.cost) S.money += D.cost; return false; }
  const free = Math.max(0, totalFollowers() - ps.followers);
  const demand = VAULT_PRICES[v.price] * clamp(S.rep / 60, 0.3, 1.4) * realRatio() * (1 + gearQ('pix')) * (S.algo.vault || 1);
  let dsubs = 0, cash = 0, msg = '';
  if (D.subs) {
    dsubs = (ps.followers * D.subs + free * D.subs * 0.03 * (v.link ? 1.5 : 1)) * demand * rnd(0.7, 1.3) + 2;
    dsubs *= promoGrowth();
    ps.followers += dsubs;
    msg = `${D.name} is up. ${signed(Math.round(dsubs))} subscribers.`;
  }
  if (D.ppv) {
    const tired = S.day - v.lastPpv <= 2;
    const buyers = ps.followers * rnd(0.15, 0.35) * (tired ? 0.4 : 1) * clamp(S.rep / 60, 0.4, 1.3);
    cash = vaultEarn(buyers * D.ppv * vaultCut());
    v.ppvSold += Math.round(buyers); v.lastPpv = S.day;
    if (tired) { const lost = ps.followers * 0.03; ps.followers -= lost; dsubs = -lost; }
    msg = `${fmt(buyers)} fans unlocked it: ${money(cash)}.${tired ? ' Too many paywalls in a row; some fans cancelled.' : ''}`;
  }
  if (D.customs) {
    const orders = Math.min(ps.followers * rnd(0.01, 0.03) + 1, 40 + skillLvl('charisma') * 8);
    cash = vaultEarn(orders * D.customs * vaultCut());
    msg = `You recorded ${Math.round(orders)} custom videos: ${money(cash)}.`;
  }
  if (D.tips) {
    cash = vaultEarn(ps.followers * rnd(0.02, 0.07) * rnd(3, 8) * vaultCut() * (1 + 0.05 * skillLvl('charisma')));
    msg = `Your DMs were chaos. Tips: ${money(cash)}.`;
    if (chance(0.25)) gainEnergy(6, 'A subscriber sent the sweetest message');
  }
  if (D.heat) S.heat = clamp(S.heat + D.heat, 0, 100);
  if (D.rep) changeRep(D.rep * sev());
  if (D.stress) S.stress = clamp(S.stress + D.stress, 0, 100);
  v.lastDrop = S.day;
  if (S.challenge && !S.challenge.done && S.challenge.req.vault) completeChallenge();
  S.stats.vaultDrops = (S.stats.vaultDrops || 0) + 1;
  if (typeof passXP === 'function') passXP(15);
  if (typeof questEvent === 'function') questEvent('vault');
  addXp('creativity', 8);
  if (D.leak && chance(D.leak) && !S.queue.some((q) => q.ev === 'vault_leak')) S.queue.push({ ev: 'vault_leak', ctx: {} });
  vaultRecord(kind, D.name, cash, dsubs);
  log(`FanVault: ${msg}`, cash > 0 ? 'gold' : 'good');
  toast(msg, cash > 0 ? 'gold' : '');
  if (cash > 0) sound('cash');
  checkAll();
  return true;
}

/* Nightly: subscriptions renew, idle vaults bleed subscribers */
function vaultTick(lines) {
  if (!vaultOn()) return;
  const v = vaultInit(), ps = S.platforms.vault;
  const idle = S.day - (v.lastDrop || 0);
  const churn = (idle > 3 ? Math.min(0.12, 0.03 + (idle - 3) * 0.015) : 0.008) * (v.promo && v.promo.k === 'bundle' && S.day <= v.promo.until ? 0.5 : 1);
  const lost = ps.followers * churn;
  ps.followers = Math.max(0, ps.followers - lost);
  if (v.link) ps.followers += Math.max(0, totalFollowers() - ps.followers) * 0.0003 * VAULT_PRICES[v.price] * clamp(S.rep / 60, 0.3, 1.4) * promoGrowth();
  const inc = vaultEarn(ps.followers * v.price * vaultCut() / 30 * vaultArpu() * promoIncome() * (1 + SB('vault')));
  if (inc) lines.push([`FanVault (${fmt(ps.followers)} subscribers)`, inc]);
  if (idle > 3 && ps.followers > 10) lines.push([`FanVault: no new drop in ${idle} days, ${fmt(lost)} cancelled`, 0]);
  vaultTick2(lines);
}

/* Composer body for FanVault */
function vaultBody() {
  const v = vaultInit(), ps = S.platforms.vault, idle = S.day - (v.lastDrop || 0);
  const perDay = ps.followers * v.price * vaultCut() / 30;
  return `<div class="opts vault" style="border-top:0">
    <div class="vault-head"><div><b style="font-size:20px">FanVault</b><div class="small muted">Fans pay monthly for what you don't post anywhere else. You keep ${Math.round(vaultCut() * 100)}%.</div></div><span class="pill blue">18+ creators only · PG-13 here</span></div>
    <div class="wallet"><div><div class="small muted">Subscribers</div><div class="big">${fmt(ps.followers)}</div></div><div><div class="small muted">Per day</div><div class="big gold">${money(perDay)}</div></div><div><div class="small muted">Lifetime</div><div class="big good">${money(v.earned)}</div></div></div>
    <span class="opt-lbl">Monthly price</span>
    <div class="scroller">${Object.keys(VAULT_PRICES).map((p) => chip(`$${p}`, 'vPrice', p, String(v.price) === p)).join('')}</div>
    <span class="small muted">Cheaper gets more subscribers; pricier earns more per fan.</span>
    <label class="row small"><input type="checkbox" data-act="vLink" ${v.link ? 'checked' : ''}> Link FanVault in my bio <span class="muted">(free posts send fans here; some brands get nervous)</span></label>
    <span class="opt-lbl">Drop something ${idle > 3 ? `<span class="bad">· ${idle} days since your last drop, fans are cancelling</span>` : ''}</span>
    <div class="cards">${Object.entries(VAULT_DROPS).map(([k, D]) => `<div class="card"><div class="t"><span>${D.name}</span><span class="pill blue">${D.e} energy${D.cost ? ` · ${money(D.cost)}` : ''}</span></div><span class="small muted">${D.desc}</span>${btn('Drop it', 'vDrop', k, 'sm blue', S.energy < D.e || (D.cost && S.money < D.cost))}</div>`).join('')}</div>
    ${v.drops.length ? `<span class="opt-lbl">Recent drops</span><div class="bars">${v.drops.slice(0, 5).map((x) => `<div class="small row between"><span>Day ${x.d} · ${esc(x.text)}</span><span class="${x.cash ? 'gold' : x.dsubs >= 0 ? 'good' : 'bad'}">${x.cash ? money(x.cash) : `${signed(x.dsubs)} subs`}</span></div>`).join('')}</div>` : ''}
  </div>`;
}

/* redraw whichever surface is showing: the composer sheet or the FanVault dashboard */
const vaultRedraw = () => { const w = document.getElementById('composeWrap'); if (w && !w.hidden) { renderCompose(false); return 'norender'; } };
const VAULT_ACT = {
  vPrice: (a) => { const v = vaultInit(); const old = v.price; v.price = +a; if (v.price > old) { const lost = S.platforms.vault.followers * 0.1; S.platforms.vault.followers -= lost; toast(`Price up. ${fmt(lost)} fans cancelled.`, 'bad'); } return vaultRedraw(); },
  vLink: () => { const v = vaultInit(); v.link = !v.link; if (v.link) { changeRep(-1); toast('Link in bio. Your free posts now funnel fans to FanVault.'); } return vaultRedraw(); },
  vDrop: (a) => { if (!vaultDrop(a)) return 'norender'; return vaultRedraw(); },
};

const VS = () => S.platforms.vault;
const vaultLose = (f) => { const n = VS().followers * f; VS().followers = Math.max(0, VS().followers - n); return n; };
Object.assign(EVENTS, {
  vault_leak: {
    neg: true, title: () => 'Your FanVault set leaked',
    text: () => 'Someone screenshotted your latest drop and posted it on a free forum. It is spreading on Chirp with the caption "saved you $10".',
    choices: () => [
      { label: 'File takedowns', sub: '$800', disabled: () => S.money < 800, fn: () => { vaultLose(0.02); return R('Most copies are gone. A few subscribers cancelled anyway.', { money: -800, heat: -4 }); } },
      { label: 'Joke about it', sub: `Charisma ${skillLvl('charisma')}`, fn: () => chance(0.4 + skillLvl('charisma') * 0.05) ? (VS().followers *= 1.06, R('"The free version is the low-res one, the real thing is on FanVault." Subscriptions went UP.', { fp: 0.01, heat: 6 })) : (vaultLose(0.06), R('It came off weird. More reposts, fewer subscribers.', { heat: 10, rep: -2 })) },
      { label: 'Ignore it', fn: () => { const n = vaultLose(0.1); return R(`Why pay if it's free? ${fmt(n)} subscribers cancelled.`, { heat: 5 }); } },
    ],
  },
  vault_whale: {
    random: true, w: 1.3, when: () => vaultSubs() >= 50, title: () => 'A whale appeared',
    text: () => `@KingWhale${ri(10, 99)} just tipped you $${fmt(Math.round(800 + vaultSubs() * 0.6))} and wants a personal birthday video. He also wants your phone number.`,
    choices: () => [
      { label: 'Record the video, keep it professional', sub: '−15 energy', fn: () => { vaultEarn(800 + vaultSubs() * 0.6); return R('He cried. He renewed for a year. Boundaries intact.', { energy: -15 }); } },
      { label: 'Take the money and give him your number', fn: () => { vaultEarn(800 + vaultSubs() * 0.6); if (chance(0.5)) S.queue.push({ ev: 'stalker', ctx: {} }); return R('He texts you good morning. Every morning. At 4:12 AM.', { stress: 15 }); } },
      { label: 'Refund him', fn: () => R('"Respect," he says, and tips again anyway.', { rep: 1, money: 200 }) },
    ],
  },
  vault_brand: {
    random: true, neg: true, w: 1, when: () => vaultOn() && S.vault && S.vault.link && S.deals.some((d) => d.status === 'active'), ctx: () => ({ d: S.deals.find((d) => d.status === 'active').id }),
    title: (c) => `${BRANDS[S.deals.find((d) => d.id === c.d).brand].name} saw your FanVault`,
    text: (c) => `${BRANDS[S.deals.find((d) => d.id === c.d).brand].name}'s marketing team found your FanVault link. They are "reviewing the partnership".`,
    choices: (c) => [
      { label: 'Promise to keep the deal posts classy', fn: () => chance(0.6) ? R('They stayed. Barely.', { rep: -1 }) : (S.deals.find((d) => d.id === c.d).status = 'failed', R('They pulled out anyway.', { rep: -2 })) },
      { label: 'Remove the link from your bio', fn: () => { S.vault.link = false; return R('Brand safe again. Your free fans stopped finding FanVault.', { rep: 1 }); } },
      { label: 'Tell them FanVault pays better', fn: () => { S.deals.find((d) => d.id === c.d).status = 'failed'; return R('The screenshot of that email got 2 million likes.', { fp: 0.02, heat: 10, rep: -2 }); } },
    ],
  },
  vault_family: {
    random: true, w: 0.9, once: true, when: () => vaultSubs() >= 100, title: () => 'Your aunt subscribed to your FanVault',
    text: () => 'Aunt Linda, $9.99 a month, comments "So proud of you sweetie ❤️" under every single drop. The fans have adopted her.',
    choices: () => [
      { label: 'Give her a free lifetime sub', fn: () => R('Aunt Linda is now the most beloved person on FanVault.', { rep: 2, stress: -5 }) },
      { label: 'Block her', fn: () => R('Thanksgiving is going to be awkward.', { stress: 10 }) },
      { label: 'Post the screenshot', fn: () => R('The screenshot went viral. Aunt Linda is a meme.', { fp: 0.02, heat: 3 }) },
    ],
  },
  vault_copycat: {
    random: true, neg: true, w: 1, when: () => vaultSubs() >= 200, title: () => 'A fake account is reselling your content',
    text: () => `"@${S.handle}_vip_official" is selling your drops for half price. Some of your fans think it's you.`,
    choices: () => [
      { label: 'Report it', sub: '$200, slow', fn: () => { vaultLose(0.02); return R('Taken down after a week.', { money: -200 }); } },
      { label: 'Expose them publicly', fn: () => R('Your fans dragged them off the internet. Free promo, too.', { fp: 0.01, heat: 8 }) },
      { label: 'Ignore it', fn: () => { const n = vaultLose(0.07); return R(`${fmt(n)} subscribers switched to the cheap copy.`); } },
    ],
  },
  vault_policy: {
    random: true, neg: true, w: 0.6, when: () => vaultSubs() >= 500 && !S.vault.ownApp, title: () => 'FanVault announces a policy change',
    text: () => 'FanVault says it will "review creator content" next month. Creators are panicking and fans are cancelling just in case.',
    choices: () => [
      { label: 'Build your own app', sub: '$25,000 · keep 92% from now on', disabled: () => S.money < 25000, fn: () => { S.vault.ownApp = true; vaultLose(0.05); return R('You moved fans to your own app. A few got lost on the way, but your cut is bigger forever.', { money: -25000 }); } },
      { label: 'Wait it out', fn: () => { const n = vaultLose(0.12); return R(`FanVault reversed the policy two days later. You still lost ${fmt(n)} subscribers.`); } },
      { label: 'Rant about it on Chirp', fn: () => { vaultLose(0.05); return R('Your thread became the official creator anthem.', { fp: 0.015, heat: 8 }); } },
    ],
  },
});


/* ======================================================================
   FanVault creator dashboard: tiers, promos, mass messages, top fans,
   custom requests and analytics
   ====================================================================== */
const VAULT_TIERS = {
  vip:   { name: 'VIP',          icon: '💎', mult: 3,  share: 0.12,  cost: 2000,  req: 100,  desc: '12% of subscribers pay 3× for early drops and a badge.' },
  inner: { name: 'Inner Circle', icon: '👑', mult: 10, share: 0.025, cost: 15000, req: 1000, desc: '2.5% pay 10× for a weekly group call. Skip the call and half of them downgrade.' },
};
const VAULT_PROMOS = {
  trial:  { name: 'Free trial week', icon: '🎁', days: 7, cd: 10, desc: 'New subscribers ×3 for a week. 40% of the trial crowd leaves when it ends.' },
  sale:   { name: '50% off flash sale', icon: '🏷️', days: 3, cd: 8, desc: 'New subscribers ×2.5 for 3 days, but income from everyone −25% while it runs.' },
  bundle: { name: '3-month bundle', icon: '📦', days: 5, cd: 14, desc: '20% of fans prepay 3 months at 15% off: instant cash, and half the usual cancellations.' },
};
const MASS_PPV = [[5, 'Teaser clip', 0.35], [15, 'Exclusive set', 0.18], [40, 'Premium bundle', 0.07]];
const REQ_KINDS = [['birthday shoutout', 8], ['pep talk video', 10], ['outfit rating', 6], ['cook-along video', 14], ['gaming session', 16], ['custom workout plan', 12], ['voice message', 5], ['signed polaroid', 6], ['song cover request', 14], ['study-with-me stream', 12]];
function vaultX() {
  const v = vaultInit();
  v.tiers = v.tiers || {}; v.fans = v.fans || []; v.reqs = v.reqs || []; v.hist = v.hist || []; v.innerCall = v.innerCall || 0;
  if (v.lastEarned == null) v.lastEarned = v.earned;
  return v;
}
const promoOn = (k) => { const v = vaultInit(); return v.promo && v.promo.k === k && S.day <= v.promo.until; };
const promoGrowth = () => (promoOn('trial') ? 3 : promoOn('sale') ? 2.5 : 1);
const promoIncome = () => (promoOn('sale') ? 0.75 : 1);
function vaultArpu() {
  const v = vaultX(); let m = 1;
  for (const [k, T] of Object.entries(VAULT_TIERS)) if (v.tiers[k]) m += T.share * (k === 'inner' && S.day - v.innerCall > 7 ? 0.5 : 1) * (T.mult - 1);
  return m;
}
const vaultPerDay = () => vaultSubs() * vaultInit().price * vaultCut() / 30 * vaultArpu() * promoIncome() * (1 + SB('vault'));
function vaultRank(perDay) { return perDay >= 50000 ? 'Top 0.1%' : perDay >= 5000 ? 'Top 1%' : perDay >= 500 ? 'Top 5%' : perDay >= 50 ? 'Top 30%' : 'Top 80%'; }
function vaultTick2(lines) {
  const v = vaultX(), ps = S.platforms.vault;
  // promos ending
  if (v.promo && S.day === v.promo.until) {
    if (v.promo.k === 'trial') { const gone = Math.min(ps.followers * 0.5, Math.max(0, ps.followers - v.promo.start) * 0.4); ps.followers -= gone; lines.push([`FanVault trial ended: ${fmt(gone)} trial fans left`, 0]); }
    else lines.push([`FanVault ${VAULT_PROMOS[v.promo.k].name.toLowerCase()} ended`, 0]);
  }
  // top fans tip
  if (ps.followers >= 20 && v.fans.length < 8 && chance(0.25)) v.fans.push({ h: fanHandle(), spent: 0, since: S.day });
  let tips = 0;
  for (const f of v.fans) { if (chance(0.45)) { const t = Math.round(rnd(5, 40) * (v.price / 9.99) * (1 + Math.log10(1 + ps.followers) * 0.4)); f.spent += t; tips += t; } }
  v.fans.sort((a, b) => b.spent - a.spent);
  if (tips) { const got = vaultEarn(tips * vaultCut()); lines.push([`FanVault top-fan tips`, got]); }
  // custom requests: new ones arrive, overdue ones get refunded
  const late = v.reqs.filter((r) => S.day > r.due);
  if (late.length) { v.reqs = v.reqs.filter((r) => S.day <= r.due); const lost = ps.followers * 0.01 * late.length; ps.followers = Math.max(0, ps.followers - lost); changeRep(-0.4 * late.length); lines.push([`${late.length} FanVault request${late.length > 1 ? 's' : ''} expired (refunded, fans annoyed)`, 0]); }
  if (ps.followers >= 25) { const n = chance(0.5) ? ri(1, 2) : 0; for (let i = 0; i < n && v.reqs.length < 5; i++) { const [kind, e] = pick(REQ_KINDS); v.reqs.push({ id: uid(), from: fanHandle(), kind, e, due: S.day + ri(2, 4), pay: Math.round(rnd(30, 110) * (v.price / 9.99) * Math.sqrt(1 + ps.followers / 500)) }); } }
  // analytics
  v.hist.push({ d: S.day, rev: Math.round(v.earned - v.lastEarned), subs: Math.round(ps.followers) }); if (v.hist.length > 30) v.hist.shift();
  v.lastEarned = v.earned;
}
function massPpv(i) {
  const [price, name, share] = MASS_PPV[i], v = vaultX(), ps = S.platforms.vault;
  if (!needEnergy(6)) return false;
  const tired = S.day - v.lastPpv <= 1;
  const buyers = ps.followers * share * rnd(0.8, 1.2) * (tired ? 0.4 : 1) * clamp(S.rep / 60, 0.4, 1.3);
  const cash = vaultEarn(buyers * price * vaultCut() * (1 + SB('vault')));
  v.ppvSold += Math.round(buyers); v.lastPpv = S.day;
  if (tired) { const lost = ps.followers * 0.02; ps.followers -= lost; }
  vaultRecord('mass', `Mass message: ${name} $${price}`, cash, 0);
  toast(`${fmt(buyers)} fans unlocked your ${name.toLowerCase()}: ${money(cash)}${tired ? '. Inbox fatigue: a few cancelled.' : ''}`, 'gold');
  if (cash) sound('cash');
  if (typeof questEvent === 'function') questEvent('vault');
  return true;
}
function vFanVault() {
  if (!vaultOn()) {
    const t = totalFollowers();
    return `<div class="col-head">${head('FanVault', 'Paid subscriptions')}</div><div class="sect"><p class="small muted">A paid-subscription platform: fans pay monthly for exclusive drops. Big money, nervous brands. Kept PG-13.</p>
      ${t >= PLATFORMS.vault.unlock ? btn('Join FanVault', 'unlock', 'vault', 'primary') : `<span class="small muted">${ico('lock')} Unlocks at ${fmt(PLATFORMS.vault.unlock)} followers.</span>`}</div>`;
  }
  const v = vaultX(), ps = S.platforms.vault, pd = vaultPerDay(), idle = S.day - (v.lastDrop || 0);
  const tab = ui.fvTab || 'grow';
  const rev = v.hist.map((h) => h.rev), subs = v.hist.map((h) => h.subs);
  let body = '';
  if (tab === 'grow') body = `
    <div class="sect"><h3>Price & link</h3><div class="scroller">${Object.keys(VAULT_PRICES).map((p) => chip(`$${p}/mo`, 'vPrice', p, String(v.price) === p)).join('')}</div>
      <label class="row small"><input type="checkbox" data-act="vLink" ${v.link ? 'checked' : ''}> Link FanVault in my bio <span class="muted">(free posts funnel fans here)</span></label></div>
    <div class="sect"><h3>Subscription tiers</h3><div class="cards">${Object.entries(VAULT_TIERS).map(([k, T]) => `<div class="card ${v.tiers[k] ? 'owned' : ''}"><div class="t"><span>${T.icon} ${T.name}</span><span class="pill">$${(v.price * T.mult).toFixed(2)}/mo</span></div><span class="small muted">${T.desc}</span>
      ${v.tiers[k] ? (k === 'inner' ? `<div class="row"><span class="pill ${S.day - v.innerCall > 7 ? 'bad' : 'good'}">${S.day - v.innerCall > 7 ? 'Call overdue: half downgraded' : `Next call due in ${7 - (S.day - v.innerCall)}d`}</span>${btn('Host the call · 15', 'fvCall', '', 'sm blue', S.energy < 15)}</div>` : '<span class="pill good">Live</span>')
        : ps.followers < T.req ? `<span class="small muted">${ico('lock')} Needs ${fmt(T.req)} subscribers</span>` : btn(`Launch · ${money(T.cost)}`, 'fvTier', k, 'sm primary', S.money < T.cost)}</div>`).join('')}</div>
      <span class="small muted">Tiers raise what an average fan pays: now ×${vaultArpu().toFixed(2)}.</span></div>
    <div class="sect"><h3>Promotions</h3>${v.promo && S.day <= v.promo.until ? `<div class="hint">${VAULT_PROMOS[v.promo.k].icon} <b>${VAULT_PROMOS[v.promo.k].name}</b> running · ${v.promo.until - S.day + 1} day(s) left</div>` : ''}
      <div class="cards">${Object.entries(VAULT_PROMOS).map(([k, P]) => { const cd = (v.promoCd || {})[k] || 0; return `<div class="card"><div class="t"><span>${P.icon} ${P.name}</span><span class="pill">${P.days} days</span></div><span class="small muted">${P.desc}</span>${S.day < cd ? `<span class="small muted">Ready again in ${cd - S.day} days</span>` : btn('Start', 'fvPromo', k, 'sm primary', !!(v.promo && S.day <= v.promo.until))}</div>`; }).join('')}</div></div>`;
  else if (tab === 'earn') body = `
    <div class="sect"><h3>Mass message (pay-to-unlock)</h3><span class="small muted">Send a locked message to every subscriber. Cheaper unlocks sell to more fans. Two in a row tires them out.</span>
      <div class="row">${MASS_PPV.map(([p, n], i) => btn(`${n} · $${p}`, 'fvMass', i, 'sm blue', S.energy < 6)).join('')}</div></div>
    <div class="sect"><h3>Custom requests <span class="small muted">· ${v.reqs.length}/5</span></h3>${v.reqs.length ? v.reqs.map((r) => `<div class="card" style="flex-direction:row;align-items:center;gap:10px"><div style="flex:1;min-width:0"><b>@${esc(r.from)}</b> <span class="small">wants a ${esc(r.kind)}</span><div class="small muted">Pays ${money(r.pay)} · ${r.e} energy · due in ${r.due - S.day}d</div></div>${btn('Make it', 'fvReq', r.id, 'sm primary', S.energy < r.e)}${btn('Decline', 'fvReqNo', r.id, 'sm')}</div>`).join('') : '<p class="small muted">No requests right now. They arrive overnight once you have 25+ subscribers.</p>'}</div>
    <div class="sect"><h3>Drops</h3><div class="cards">${Object.entries(VAULT_DROPS).map(([k, D]) => `<div class="card"><div class="t"><span>${D.name}</span><span class="pill blue">${D.e} energy${D.cost ? ` · ${money(D.cost)}` : ''}</span></div><span class="small muted">${D.desc}</span>${btn('Drop it', 'vDrop', k, 'sm blue', S.energy < D.e || (D.cost && S.money < D.cost))}</div>`).join('')}</div>
      ${idle > 3 ? `<span class="small bad">${idle} days since your last drop: fans are cancelling.</span>` : ''}</div>`;
  else if (tab === 'fans') body = `
    <div class="sect"><div class="row between"><h3>Top fans</h3>${v.fans.length ? btn('Send thank-you voice notes · 5', 'fvThank', '', 'sm', S.energy < 5 || v.thanked === S.day) : ''}</div>
      ${v.fans.length ? `<div class="lgt">${v.fans.map((f, i) => `<div class="row between"><span>${['🥇', '🥈', '🥉'][i] || `${i + 1}.`} ${avatar(f.h, '#00AFF0', 'xs')} @${esc(f.h)} <span class="small muted">since day ${f.since}</span></span><b class="gold">${money(f.spent)}</b></div>`).join('')}</div>` : '<p class="small muted">Your biggest supporters show up here once you have 20+ subscribers.</p>'}</div>
    <div class="sect"><h3>Recent activity</h3>${v.drops.length ? `<div class="bars">${v.drops.slice(0, 8).map((x) => `<div class="small row between"><span>Day ${x.d} · ${esc(x.text)}</span><span class="${x.cash ? 'gold' : x.dsubs >= 0 ? 'good' : 'bad'}">${x.cash ? money(x.cash) : `${signed(x.dsubs)} subs`}</span></div>`).join('')}</div>` : '<p class="small muted">Nothing yet.</p>'}</div>`;
  return `<div class="col-head">${head('FanVault', `${vaultRank(pd)} of creators`)}${tabsBar([['grow', '📈 Grow'], ['earn', '💸 Earn'], ['fans', '💙 Fans']], tab, 'fvTab')}</div>
    <div class="sect vault"><div class="wallet">${kv('Subscribers', fmt(ps.followers))}${kv('Per day', money(pd), 'gold')}${kv('Lifetime', money(v.earned), 'good')}${kv('Avg fan pays', `$${(v.price * vaultArpu()).toFixed(2)}`)}</div>
      ${rev.length > 1 ? `<div class="row between small"><span>Revenue (30 days) ${sparkline(rev, 140, 32)}</span><span>Subscribers ${sparkline(subs, 140, 32)}</span></div>` : '<span class="small muted">Charts appear after a couple of nights.</span>'}
      <div class="row">${btn(`${ico('feather')} Post to FanVault`, 'compose', 'vault', 'sm blue')}<span class="small muted">You keep ${Math.round(vaultCut() * 100)}%${v.ownApp ? ' (your own app)' : ''}.</span></div></div>${body}`;
}
Object.assign(VAULT_ACT, {
  fvTab: (a) => { ui.fvTab = a; },
  fvTier: (a) => { const T = VAULT_TIERS[a], v = vaultX(); if (v.tiers[a] || !spend(T.cost)) return toast('Not enough money.', 'bad'); v.tiers[a] = true; if (a === 'inner') v.innerCall = S.day; toast(`${T.icon} ${T.name} tier launched.`, 'gold'); sound('cash'); },
  fvCall: () => { if (!needEnergy(15)) return; const v = vaultX(); v.innerCall = S.day; const t = vaultEarn(vaultSubs() * 0.025 * rnd(2, 6)); changeRep(0.3); toast(`Inner Circle call done. They loved it${t ? ` and tipped ${money(t)}` : ''}.`, 'gold'); },
  fvPromo: (a) => { const v = vaultX(), P = VAULT_PROMOS[a]; v.promoCd = v.promoCd || {}; if (S.day < (v.promoCd[a] || 0)) return; v.promo = { k: a, until: S.day + P.days - 1, start: vaultSubs() }; v.promoCd[a] = S.day + P.days + P.cd;
    if (a === 'bundle') { const c = vaultEarn(vaultSubs() * 0.2 * v.price * 3 * 0.85 * vaultCut()); toast(`Bundle launched: ${money(c)} prepaid today.`, 'gold'); if (c) sound('cash'); } else toast(`${P.name} is live.`, 'gold'); },
  fvMass: (a) => { massPpv(+a); },
  fvReq: (a) => { const v = vaultX(), r = v.reqs.find((x) => x.id === +a); if (!r || !needEnergy(r.e)) return; v.reqs = v.reqs.filter((x) => x !== r); const c = vaultEarn(r.pay * vaultCut()); S.platforms.vault.followers += 1 + vaultSubs() * 0.002; vaultRecord('custom', `Custom ${r.kind} for @${r.from}`, c, 0); toast(`Delivered. @${r.from} paid ${money(c)} and told everyone.`, 'gold'); sound('cash'); addXp('charisma', 6); },
  fvReqNo: (a) => { const v = vaultX(); v.reqs = v.reqs.filter((x) => x.id !== +a); },
  fvThank: () => { const v = vaultX(); if (v.thanked === S.day || !needEnergy(5)) return; v.thanked = S.day; let t = 0; v.fans.slice(0, 5).forEach((f) => { const x = Math.round(rnd(10, 60) * (v.price / 9.99)); f.spent += x; t += x; }); const c = vaultEarn(t * vaultCut()); toast(`Your top fans melted. They tipped ${money(c)}.`, 'gold'); if (c) sound('cash'); },
});
