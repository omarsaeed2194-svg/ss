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
  S.platforms.vault.followers += n;
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
  const churn = idle > 3 ? Math.min(0.12, 0.03 + (idle - 3) * 0.015) : 0.008;
  const lost = ps.followers * churn;
  ps.followers = Math.max(0, ps.followers - lost);
  if (v.link) ps.followers += Math.max(0, totalFollowers() - ps.followers) * 0.0003 * VAULT_PRICES[v.price] * clamp(S.rep / 60, 0.3, 1.4);
  const inc = vaultEarn(ps.followers * v.price * vaultCut() / 30);
  if (inc) lines.push([`FanVault (${fmt(ps.followers)} subscribers)`, inc]);
  if (idle > 3 && ps.followers > 10) lines.push([`FanVault: no new drop in ${idle} days, ${fmt(lost)} cancelled`, 0]);
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

const VAULT_ACT = {
  vPrice: (a) => { const v = vaultInit(); const old = v.price; v.price = +a; if (v.price > old) { const lost = S.platforms.vault.followers * 0.1; S.platforms.vault.followers -= lost; toast(`Price up. ${fmt(lost)} fans cancelled.`, 'bad'); } renderCompose(false); return 'norender'; },
  vLink: () => { const v = vaultInit(); v.link = !v.link; if (v.link) { changeRep(-1); toast('Link in bio. Your free posts now funnel fans to FanVault.'); } renderCompose(false); return 'norender'; },
  vDrop: (a) => { if (!vaultDrop(a)) return 'norender'; renderCompose(false); return 'norender'; },
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
