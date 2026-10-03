/* Clout Chaser — the Gem Store: real-money purchases of an in-game currency (Gems) and a few packs.
   Payments go through a provider:
     'play' — Google Play Billing, via the Android bridge window.AndroidBilling (wired in the app build)
     'test' — a clearly labelled test mode for trying the flow without paying (Settings → Developer)
   Nothing is ever charged outside the official store, and the game never asks for card details itself. */
'use strict';

/* product ids must match the in-app products you create in Google Play Console */
const IAP = {
  gems_100:     { kind: 'consumable', gems: 100,  usd: 0.99,  name: 'Pouch of Gems',  icon: '💎' },
  gems_550:     { kind: 'consumable', gems: 550,  usd: 4.99,  name: 'Bag of Gems',    icon: '💎', tag: '+10% bonus' },
  gems_1200:    { kind: 'consumable', gems: 1200, usd: 9.99,  name: 'Chest of Gems',  icon: '💎', tag: 'Most popular' },
  gems_2600:    { kind: 'consumable', gems: 2600, usd: 19.99, name: 'Vault of Gems',  icon: '💎', tag: '+30% bonus' },
  gems_7000:    { kind: 'consumable', gems: 7000, usd: 49.99, name: 'Mountain of Gems', icon: '💎', tag: 'Best value' },
  starter_pack: { kind: 'once', gems: 300, usd: 2.99, name: 'Starter pack', icon: '🚀', desc: '300 Gems, $25,000 cash, 50 energy and the exclusive Diamond avatar frame. One per player.' },
  vip_month:    { kind: 'timed', days: 30, usd: 4.99, name: 'VIP for 30 days', icon: '👑', desc: '20 Gems every day you play, +20 max energy, double daily login rewards and a VIP badge.' },
};
/* what Gems buy: convenience, boosts and cosmetics. Gems never go to the Arena or casino. */
const GEM_SHOP = [
  { id: 'refill',  name: 'Full energy refill', icon: '⚡', gems: 25,  desc: 'Back to full energy right now.', fx: () => { S.energy = Math.max(S.energy, maxEnergy()); } },
  { id: 'cash',    name: 'Cash bundle',        icon: '💵', gems: 60,  desc: () => `${money(gemCash())} straight to your wallet.`, fx: () => { const c = gemCash(); S.money += c; S.stats.earned += c; } },
  { id: 'reach',   name: 'Algorithm boost',    icon: '📈', gems: 40,  desc: 'Today, every post reaches 50% more people.', fx: () => { S.flags.gemBoost = S.day; } },
  { id: 'streak',  name: 'Streak shield',      icon: '🛡️', gems: 30,  desc: 'Your posting streak survives one missed day.', fx: () => { S.flags.streakShield = (S.flags.streakShield || 0) + 1; } },
  { id: 'calm',    name: 'Spa day',            icon: '🧖', gems: 20,  desc: 'Stress to zero, heat −20.', fx: () => { S.stress = 0; S.heat = clamp(S.heat - 20, 0, 100); } },
  { id: 'frame',   name: 'Diamond avatar frame', icon: '🖼️', gems: 150, once: () => (S.frames || []).includes('diamond'), desc: 'Exclusive animated frame. Cosmetic.', fx: () => giveFrame('diamond') },
  { id: 'banner',  name: 'Aurora Borealis banner', icon: '🌌', gems: 120, once: () => (S.banners || []).includes('borealis'), desc: 'Exclusive profile banner. Cosmetic.', fx: () => giveBanner('borealis') },
];
const gemCash = () => Math.round(Math.max(5000, totalFollowers() * 0.05) / 100) * 100;
FRAMES.diamond = { name: 'Diamond', price: 0, pass: true, css: 'conic-gradient(from 0deg, #B9F2FF, #E0FFFF, #7FDBFF, #FFFFFF, #B9F2FF)' };
BANNERS.borealis = { name: 'Aurora Borealis', price: 0, pass: true, css: 'linear-gradient(160deg, #021B2B, #00C9A7 35%, #845EC2 70%, #021B2B)' };
function giveFrame(k) { S.frames = S.frames || []; if (!S.frames.includes(k)) S.frames.push(k); S.frame = k; }
function giveBanner(k) { S.banners = S.banners || []; if (!S.banners.includes(k)) S.banners.push(k); S.banner = k; }

function storeInit() {
  if (!S.store) S.store = { gems: 0, orders: [], spent: 0, vipUntil: 0, vipLast: '', starter: false };
  return S.store;
}
const gems = () => storeInit().gems;
const vipOn = () => storeInit().vipUntil > Date.now();

/* ---------- payment providers ---------- */
const TEST_KEY = 'clout-chaser-iap-test';
/* never in the app-store build: there, Gems only come from Google Play or from playing */
const testMode = () => { if (window.STORE_BUILD) return false; try { return localStorage.getItem(TEST_KEY) === '1'; } catch (e) { return false; } };
const Pay = {
  prices: {}, // localized prices from the store, e.g. { gems_100: '€1.09' }
  provider() { if (window.AndroidBilling && AndroidBilling.available && AndroidBilling.available()) return 'play'; if (testMode()) return 'test'; return null; },
  price(id) { return this.prices[id] || `$${IAP[id].usd.toFixed(2)}`; },
  init() {
    if (this.provider() === 'play') { try { AndroidBilling.query(JSON.stringify(Object.keys(IAP))); AndroidBilling.restore(); } catch (e) { console.error('billing init', e); } }
  },
  buy(id) {
    const p = this.provider();
    if (!p) return toast('Purchases work in the Android app from Google Play.', 'bad');
    if (p === 'play') { ui.payBusy = id; try { AndroidBilling.buy(id); } catch (e) { ui.payBusy = null; toast('The store is not available right now.', 'bad'); } return; }
    // test mode: no money moves; the order is marked as a test
    fulfill(id, 'TEST-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7), null, true);
  },
};
/* Called once per order. Orders are remembered so a purchase can never be delivered twice. */
function fulfill(id, orderId, token, test) {
  const P = IAP[id], st = storeInit();
  if (!P || !orderId) return false;
  if (st.orders.some((o) => o.id === orderId)) { if (token && P.kind === 'consumable' && window.AndroidBilling) AndroidBilling.consume(token); return false; }
  if (P.kind === 'once' && st.starter && id === 'starter_pack') { if (token && window.AndroidBilling) AndroidBilling.acknowledge(token); return false; }
  if (P.gems) st.gems += P.gems;
  if (id === 'starter_pack') { st.starter = true; S.money += 25000; S.energy += 50; giveFrame('diamond'); }
  if (id === 'vip_month') st.vipUntil = Math.max(Date.now(), st.vipUntil) + P.days * 864e5;
  st.orders.unshift({ id: orderId, p: id, t: Date.now(), test: !!test });
  if (st.orders.length > 200) st.orders.length = 200;
  if (!test) st.spent += P.usd;
  // tell Google Play the item was delivered (consumables can be bought again)
  if (token && window.AndroidBilling) { if (P.kind === 'consumable') AndroidBilling.consume(token); else AndroidBilling.acknowledge(token); }
  ui.payBusy = null;
  toast(`${P.icon} ${P.name} delivered${test ? ' (test purchase, no money charged)' : ''}. Thank you!`, 'gold');
  celebrate('gold'); sound('cash');
  save(); renderAll();
  return true;
}
/* callbacks from the Android bridge */
window.onBillingProducts = (json) => { try { const list = JSON.parse(json); for (const p of list) Pay.prices[p.id] = p.price; if (S) renderAll(); } catch (e) { console.error(e); } };
window.onBillingPurchase = (json) => { try { const p = JSON.parse(json); if (S) fulfill(p.productId, p.orderId, p.token, false); } catch (e) { console.error(e); } };
window.onBillingError = (msg) => { ui.payBusy = null; if (msg && msg !== 'cancelled') toast(`Purchase failed: ${msg}`, 'bad'); if (S) renderAll(); };

/* VIP: daily Gems the first time you open the game each real day */
function vipDaily() {
  const st = storeInit();
  if (!vipOn() || st.vipLast === todayKey()) return;
  st.vipLast = todayKey(); st.gems += 20;
  toast('👑 VIP: +20 Gems today', 'gold');
}
/* a trickle of free Gems for playing, so everyone can use the Gem shop */
function earnGems(n, why) { storeInit().gems += n; toast(`💎 +${n} Gems · ${why}`, 'gold'); }

function spendGems(item) {
  const st = storeInit();
  if (item.once && item.once()) return toast('You already have this.', 'bad');
  if (st.gems < item.gems) { ui.storeTab = 'buy'; return toast('Not enough Gems.', 'bad'); }
  st.gems -= item.gems; item.fx();
  toast(`${item.icon} ${item.name}`, 'gold'); sound('cash');
  S.stats.gemsSpent = (S.stats.gemsSpent || 0) + item.gems;
}

/* ---------- screen ---------- */
function vStore() {
  const st = storeInit(), prov = Pay.provider(), tabK = ui.storeTab || 'buy';
  const banner = prov === 'test' ? '<div class="hint warn-hint">🧪 <b>Test mode</b> · purchases are free and marked as tests. Turn it off in Settings.</div>'
    : !prov ? '<div class="hint">Gem purchases are available in the Android app through Google Play. You can still earn free Gems by playing and spend them below.</div>' : '';
  const pack = (id) => { const P = IAP[id], owned = (id === 'starter_pack' && st.starter);
    return `<div class="card iap ${P.kind !== 'consumable' ? 'feature' : ''}"><div class="t"><span>${P.icon} ${P.name}</span>${P.tag ? `<span class="pill gold">${P.tag}</span>` : ''}</div>
      ${P.gems && P.kind === 'consumable' ? `<div class="gem-n">💎 ${fmt(P.gems)}</div>` : ''}${P.desc ? `<span class="small muted">${P.desc}</span>` : ''}
      ${owned ? '<span class="pill good">Owned</span>' : id === 'vip_month' && vipOn() ? `<span class="pill good">Active · ${Math.ceil((st.vipUntil - Date.now()) / 864e5)} days left</span>${btn(`Extend · ${Pay.price(id)}`, 'iapBuy', id, 'sm primary', !prov || !!ui.payBusy)}`
        : btn(ui.payBusy === id ? 'Waiting for Google Play…' : Pay.price(id), 'iapBuy', id, 'primary', !prov || !!ui.payBusy)}</div>`; };
  const body = tabK === 'buy' ? `
    <div class="sect"><h3>Special offers</h3><div class="cards">${pack('starter_pack')}${pack('vip_month')}</div></div>
    <div class="sect"><h3>Gem packs</h3><div class="cards">${['gems_100', 'gems_550', 'gems_1200', 'gems_2600', 'gems_7000'].map(pack).join('')}</div>
      <span class="small muted">Prices include tax where required and are charged by Google Play. Purchases are for virtual items with no cash value and cannot be exchanged for real money.</span>${prov === 'play' ? `<div>${btn('Restore purchases', 'iapRestore', '', 'sm')}</div>` : ''}</div>`
    : tabK === 'spend' ? `
    <div class="sect"><h3>Spend Gems</h3><div class="cards">${GEM_SHOP.map((g) => { const have = g.once && g.once();
      return `<div class="card"><div class="t"><span>${g.icon} ${g.name}</span><span class="pill">💎 ${g.gems}</span></div><span class="small muted">${typeof g.desc === 'function' ? g.desc() : g.desc}</span>${have ? '<span class="pill good">Owned</span>' : btn('Use Gems', 'gemSpend', g.id, 'sm primary', st.gems < g.gems)}</div>`; }).join('')}</div>
      <span class="small muted">Earn free Gems from your daily login streak, career goals and trophies.</span></div>`
    : `<div class="sect"><h3>Purchase history</h3>${st.orders.length ? `<div class="lgt">${st.orders.slice(0, 40).map((o) => `<div class="row between small"><span>${IAP[o.p] ? IAP[o.p].icon + ' ' + IAP[o.p].name : o.p}${o.test ? ' <span class="pill warn">test</span>' : ''}</span><span class="muted">${new Date(o.t).toLocaleDateString()}</span></div>`).join('')}</div>` : '<p class="small muted">No purchases yet.</p>'}</div>`;
  return `<div class="col-head">${head('Gem Store', `💎 ${fmt(st.gems)} Gems${vipOn() ? ' · 👑 VIP' : ''}`)}${tabsBar([['buy', '💳 Get Gems'], ['spend', '💎 Spend'], ['history', '🧾 History']], tabK, 'storeTab')}</div>
    ${banner ? `<div class="sect">${banner}</div>` : ''}${body}`;
}

const STORE_ACT = {
  storeTab: (a) => { ui.storeTab = a; },
  iapBuy: (a) => { if (IAP[a]) Pay.buy(a); },
  iapRestore: () => { if (window.AndroidBilling) { AndroidBilling.restore(); toast('Checking Google Play for your purchases…'); } },
  gemSpend: (a) => { const g = GEM_SHOP.find((x) => x.id === a); if (g) spendGems(g); },
  iapTest: () => { try { localStorage.setItem(TEST_KEY, testMode() ? '0' : '1'); } catch (e) { /* private mode */ } toast(testMode() ? 'Test purchases on. Nothing is charged.' : 'Test purchases off.'); },
};
