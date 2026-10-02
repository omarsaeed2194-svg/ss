/* Clout Chaser — app UI: timeline, threads, notifications, DMs, profiles, compose, career screens */
'use strict';

/* ---------- icons (24px stroke set) ---------- */
const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  feather: '<path d="M20 4c-8 0-14 6-14 14v2h2c8 0 14-6 14-14V4z"/><path d="M4 20 14 10"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
  bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  team: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 20a7 7 0 0 0-4-6.3"/>',
  crown: '<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
  heartp: '<path d="M12 20s-8-4.7-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.3 12 20 12 20z"/><path d="M4 12h4l2-3 3 6 2-3h5"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  tea: '<path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M12 2v3"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  reply: '<path d="M4 5h16v11H9l-5 4z"/>',
  repost: '<path d="M4 11V8a2 2 0 0 1 2-2h12M15 3l3 3-3 3M20 13v3a2 2 0 0 1-2 2H6M9 21l-3-3 3-3"/>',
  heart: '<path d="M12 20s-8-4.7-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.3 12 20 12 20z"/>',
  views: '<path d="M5 20V12M10 20V6M15 20v-9M20 20V9"/>',
  back: '<path d="M19 12H5M11 5l-7 7 7 7"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.2"/><circle cx="15.5" cy="15.5" r="1.2"/><circle cx="12" cy="12" r="1.2"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  fire: '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8a7 7 0 0 0 7 7z"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7z"/>',
  live: '<circle cx="12" cy="12" r="3"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  plane: '<path d="M10 14 3 11l1-2 8 1 5-6h2l-2 7 4 1 1-1h1l-1 3-1 3h-1l-1-1-4 1 1 7h-2l-4-7z"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
};
const ico = (k, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
const VBADGE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22.5 12.5c0-1.6-.9-2.9-2.2-3.6.5-1.4.2-3.1-.9-4.2s-2.8-1.4-4.2-.9C14.5 2.4 13.2 1.5 11.6 1.5S8.7 2.4 8 3.8c-1.4-.5-3.1-.2-4.2.9S2.4 7.5 2.9 8.9C1.6 9.6.7 10.9.7 12.5s.9 2.9 2.2 3.6c-.5 1.4-.2 3.1.9 4.2s2.8 1.4 4.2.9c.7 1.3 2 2.2 3.6 2.2s2.9-.9 3.6-2.2c1.4.5 3.1.2 4.2-.9s1.4-2.8.9-4.2c1.3-.7 2.2-2 2.2-3.6z"/><path fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="m7.5 12.5 3 3 6-6.5"/></svg>';

/* ---------- ui state ---------- */
let tab = 'home';
const ui = {
  view: null, hist: [], feedTab: 'foryou', notifTab: 'all', profTab: 'posts', metric: 'f', q: '',
  c: null, typing: null, confirmRestart: false, exportCode: '', editBio: false,
  onb: { step: 0, name: 'Jordan Vale', handle: 'jordanvale', niche: 'lifestyle', diff: 'normal', color: AVATAR_COLORS[0], handleTouched: false },
};
const MAIN_TABS = [['home', 'Home', 'home'], ['explore', 'Explore', 'search'], ['notifs', 'Notifications', 'bell'], ['messages', 'Messages', 'mail'], ['profile', 'Profile', 'user']];
const CAREER = [['money', 'Money', 'cash'], ['arena', 'Arena', 'dice'], ['legacy', 'Legacy', 'star'], ['deals', 'Brand deals', 'brief'], ['shop', 'Shop', 'bag'], ['team', 'Team', 'team'], ['empire', 'Empire', 'crown'], ['life', 'Life & skills', 'heartp'], ['stats', 'Analytics', 'chart'], ['tea', 'The Tea', 'tea'], ['trophies', 'Trophies', 'trophy'], ['danger', 'Danger Zone', 'fire'], ['account', 'Settings', 'gear']];
CAREER.push(['hq', 'Headquarters', 'home'], ['friends', 'Friends', 'user'], ['quests', 'Daily quests', 'star']);
/* The sidebar shows five hubs; each hub holds several screens with a tab row on top */
const HUBS = [['biz', 'Business', 'cash', ['money', 'deals', 'shop', 'empire']], ['play', 'Play', 'dice', ['arena', 'danger']], ['crew', 'Team & HQ', 'team', ['team', 'hq', 'legacy']], ['social', 'Friends', 'user', ['friends', 'quests']], ['me', 'Me', 'heartp', ['life', 'stats', 'trophies', 'tea']], ['account', 'Settings', 'gear', ['account']]];
const hubOf = (t) => HUBS.find((h) => h[3].includes(t));
const careerName = (id) => (CAREER.find((c) => c[0] === id) || [id, id])[1];
function hubBadge(h, b) { return h[3].reduce((a, t) => a + (b[t] || 0), 0); }
function hubBar() {
  const h = hubOf(tab); if (!h || h[3].length < 2 || ui.view) return '';
  ui.hubLast = ui.hubLast || {}; ui.hubLast[h[0]] = tab;
  return `<div class="hubbar">${h[3].map((t) => `<button class="hubtab" data-act="go" data-arg="${t}" aria-current="${t === tab}">${ico((CAREER.find((c) => c[0] === t) || [])[2] || 'star', 'ico')}<span>${careerName(t)}</span></button>`).join('')}</div>`;
}
const NICHE_DESC = { beauty: 'Skincare, makeup, dupes', gaming: 'Clutches, speedruns, rage', fitness: 'Gains, routines, discipline', comedy: 'Skits, bits, chaos', tech: 'Reviews, setups, hot takes', food: 'Recipes, taste tests', music: 'Covers, hooks, studio life', fashion: 'Fits, thrift flips, trends', travel: 'Hidden gems, packing hacks', lifestyle: 'Routines, resets, vibes' };

/* ---------- small helpers ---------- */
const avatar = (name, color, size = '', seed) => `<span class="av ${size}" style="background:${color}" aria-hidden="true">${faceSvg(seed || name)}</span>`;
const npcAv = (id, size = '') => avatar(NPCS[id].name, NPCS[id].color, size, 'npc:' + id);
const meAv = (size = '') => { const F = S.frame && FRAMES[S.frame]; const a = avatar(S.name, S.color, size, S.faceSeed || S.name); return F ? a.replace(`style="background:${S.color}"`, `style="border:${size === 'xl' ? 5 : 2.5}px solid transparent;background:linear-gradient(${S.color}, ${S.color}) padding-box, ${F.css} border-box"`) : a; };
const coAv = (id, size = '') => `<span class="av co ${size}" aria-hidden="true">${logoSvg(COMPANIES[id].name, COMPANIES[id].color)}</span>`;
const flag = (cc) => (COUNTRIES[cc] ? `<span class="flag" title="${COUNTRIES[cc].name}">${COUNTRIES[cc].flag}</span>` : '');
const vb = (gold) => `<span class="badge-v ${gold ? 'gold' : ''}" title="${gold ? 'Paid badge' : 'Verified'}">${VBADGE}</span>`;
const meBadge = () => S.flags.verified ? vb() : S.flags.paidCheck ? vb(true) : '';
const npcBadge = (id) => NPCS[id].followers >= 1e5 ? vb() : '';
const pdot = (id) => `<span class="dot" style="background:${PLATFORMS[id].color}"></span>`;
const ago = (d) => (S.day - d <= 0 ? 'today' : `${S.day - d}d`);
const btn = (label, act, arg = '', cls = '', dis = false, title = '') => `<button class="btn ${cls}" data-act="${act}" data-arg="${esc(arg)}" ${dis ? 'disabled' : ''} ${title ? `title="${esc(title)}"` : ''}>${label}</button>`;
const chip = (label, act, arg, on, dis = false, extra = '') => `<button class="chip" data-act="${act}" data-arg="${esc(arg)}" aria-pressed="${on ? 'true' : 'false'}" ${dis ? 'disabled' : ''}>${label}${extra}</button>`;
function rich(t) {
  return esc(t).replace(/(^|[^&\w])(#[A-Za-z][A-Za-z0-9_]*)/g, '$1<span class="tag">$2</span>').replace(/(^|[^\w])(@[A-Za-z0-9_.]+)/g, '$1<span class="at">$2</span>');
}
function srand(seed) { let x = Math.abs(Math.round(seed * 9301 + 49297)) % 233280; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }
const parseTags = (t) => [...new Set((t.match(/#[A-Za-z0-9_]+/g) || []))].slice(0, 8);

/* Reads a caption and guesses its tone, the way players write in Status */
function detectTone(t) {
  const s = (t || '').toLowerCase();
  if (!s.trim()) return 'authentic';
  const caps = (t.match(/[A-Z]/g) || []).length / Math.max(1, (t.match(/[a-zA-Z]/g) || []).length);
  if (/unpopular opinion|fight me|overrated|worst|i hate|unfollow|trash|cope|stupid|ratio/.test(s)) return 'ragebait';
  if (/you won'?t believe|not clickbait|shocking|watch before|you'?re doing .* wrong|!!!/.test(s) || (caps > 0.6 && t.length > 12)) return 'clickbait';
  if (/new car|mansion|private jet|rolex|first class|designer|just bought|rich/.test(s)) return 'flex';
  if (/fit check|outfit|🔥|😮‍💨|thirst|soft launch|body/.test(s)) return 'thirst';
  if (/how to|guide|tips|step \d|learn|here'?s why|explained|thread|save this|mistakes/.test(s)) return 'educational';
  if (/grateful|thank|love you|blessed|proud|❤|💕|kindness|support/.test(s)) return 'wholesome';
  if (/lol|lmao|haha|pov|me when|nobody:|💀|😂|bro|i'?m crying/.test(s)) return 'funny';
  return 'authentic';
}
/* Reads a reply or DM and sorts it into a social move */
function classifyReply(t) {
  const s = (t || '').toLowerCase();
  if (/mid|trash|cringe|flop|fell off|ratio|who asked|overrated|worst|ugly|boring|fake|loser|clown|irrelevant/.test(s)) return 'troll';
  if (/check (out )?my|follow me|my (page|channel|profile|new)|link in bio|sub to|go watch/.test(s)) return 'promo';
  if (/lol|lmao|haha|💀|😂|dead|screaming|crying|bro|pov|🤣/.test(s)) return 'funny';
  return 'nice';
}

function toast(msg, cls = '') {
  const t = document.createElement('div'); t.className = 'toast ' + cls; t.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 3000);
  while ($('#toasts').children.length > 3) $('#toasts').firstChild.remove();
}
let chargeUntil = 0;
const chargedCls = () => (performance.now() < chargeUntil ? 'charged' : '');
/* ---------- @mention autocomplete ---------- */
let mentionState = null;
function mentionCandidates(q) {
  const out = [];
  q = q.toLowerCase();
  for (const [id, N] of Object.entries(NPCS)) {
    const h = N.handle.toLowerCase(), nm = N.name.toLowerCase();
    const score = !q ? 3 : h.startsWith(q) ? 0 : nm.split(/\s+/).some((w) => w.replace(/[^a-z]/g, '').startsWith(q)) ? 1 : (h.includes(q) || nm.includes(q)) ? 2 : -1;
    if (score >= 0) out.push({ kind: 'npc', id, handle: N.handle, score, sort: -(S.npcs[id].rel * 1e3) - Math.log10(S.npcs[id].followers) });
  }
  for (const [id, C] of Object.entries(COMPANIES)) {
    const h = C.handle.toLowerCase(), nm = C.name.toLowerCase();
    const score = !q ? 4 : h.startsWith(q) ? 0 : nm.startsWith(q) ? 1 : (h.includes(q) || nm.includes(q)) ? 2 : -1;
    if (score >= 0) out.push({ kind: 'co', id, handle: C.handle, score, sort: 0 });
  }
  return out.sort((a, b) => a.score - b.score || a.sort - b.sort).slice(0, 7);
}
function mentionBox() {
  let b = $('#mentionBox');
  if (!b) { b = document.createElement('div'); b.id = 'mentionBox'; b.className = 'mention-box'; b.setAttribute('role', 'listbox'); document.body.appendChild(b); }
  return b;
}
function hideMentions() { mentionState = null; const b = $('#mentionBox'); if (b) b.hidden = true; }
function renderMentions() {
  const st = mentionState, b = mentionBox();
  if (!st || !st.items.length) { b.hidden = true; return; }
  const r = st.el.getBoundingClientRect();
  b.style.left = Math.max(8, Math.min(window.innerWidth - 328, r.left)) + 'px';
  const below = r.bottom + 6, h = Math.min(st.items.length * 54 + 10, 390);
  b.style.top = (below + h > window.innerHeight && r.top > h ? r.top - h - 6 : below) + 'px';
  b.innerHTML = st.items.map((it, i) => {
    const isCo = it.kind === 'co';
    const name = isCo ? COMPANIES[it.id].name : NPCS[it.id].name;
    const tag = isCo ? `${CO_STYLES[coStyle(it.id)].name} · ${COMPANIES[it.id].cat}` : `${ARCHETYPES[archetype(it.id)].name} · ${STANCE[stanceOf(it.id)][0]}`;
    return `<div class="mention-item ${i === st.sel ? 'on' : ''}" role="option" data-i="${i}">${isCo ? coAv(it.id, 'sm') : npcAv(it.id, 'sm')}<div style="min-width:0;flex:1"><b style="display:flex;gap:4px;align-items:center">${esc(name)} ${isCo ? vb(true) : npcBadge(it.id)}</b><span class="small muted">@${it.handle}</span></div><span class="pill">${esc(tag)}</span></div>`;
  }).join('');
  b.hidden = false;
  b.querySelectorAll('.mention-item').forEach((n) => n.addEventListener('mousedown', (e) => { e.preventDefault(); applyMention(+n.dataset.i); }));
}
function applyMention(i) {
  const st = mentionState; if (!st) return;
  const it = st.items[i]; const el = st.el;
  const before = el.value.slice(0, st.start), after = el.value.slice(el.selectionStart);
  el.value = before + '@' + it.handle + ' ' + after.replace(/^\S*/, '');
  const pos = (before + '@' + it.handle + ' ').length;
  el.setSelectionRange(pos, pos); el.focus();
  hideMentions();
  el.dispatchEvent(new Event('input'));
}
function checkMention(el) {
  const v = el.value.slice(0, el.selectionStart);
  const m = v.match(/(^|\s)@([\w.]{0,20})$/);
  if (!m) { hideMentions(); return; }
  const items = mentionCandidates(m[2]);
  mentionState = { el, start: v.length - m[2].length - 1, items, sel: 0 };
  renderMentions();
}
function attachMentions(el) {
  el.addEventListener('keydown', (e) => {
    if (!mentionState || mentionState.el !== el || !mentionState.items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopImmediatePropagation(); const n = mentionState.items.length; mentionState.sel = (mentionState.sel + (e.key === 'ArrowDown' ? 1 : n - 1)) % n; renderMentions(); }
    else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); e.stopImmediatePropagation(); applyMention(mentionState.sel); }
    else if (e.key === 'Escape') { e.stopImmediatePropagation(); hideMentions(); }
  });
  el.addEventListener('input', () => checkMention(el));
  el.addEventListener('click', () => checkMention(el));
  el.addEventListener('blur', () => setTimeout(() => { if (mentionState && mentionState.el === el) hideMentions(); }, 150));
}

/* Energy rewards get their own gold pop-up so they feel like a win */
function energyBurst(n, reason) {
  const box = $('#deltas'); if (!box) return;
  const el = document.createElement('div'); el.className = 'delta energy';
  el.innerHTML = `<span class="pill gold">${ico('bolt')} +${n} energy</span><span class="why">${esc(reason)}</span>`;
  box.prepend(el); setTimeout(() => el.remove(), 3200);
  while (box.children.length > 4) box.lastChild.remove();
  chargeUntil = performance.now() + 400;
  sound('zap');
}
/* Floating stat changes after every action, like Status's aura pop-ups */
function statSnap() { return S ? { f: totalFollowers(), rep: S.rep, heat: S.heat, money: S.money, energy: S.energy, stress: S.stress } : null; }
function flashDelta(a, b) {
  if (!a || !b) return;
  const out = [];
  const df = Math.round(b.f - a.f); if (df) out.push([`${signed(df)} followers`, df > 0 ? 'good' : 'bad']);
  const dr = b.rep - a.rep; if (Math.abs(dr) >= 0.05) out.push([`${signed1(dr)} rep`, dr > 0 ? 'good' : 'bad']);
  const dh = b.heat - a.heat; if (Math.abs(dh) >= 0.5) out.push([`${signed1(dh)} heat`, dh > 0 ? 'warn' : 'good']);
  const dm = Math.round(b.money - a.money); if (dm) out.push([signedMoney(dm), dm > 0 ? 'gold' : 'bad']);
  const de = Math.round(b.energy - a.energy); if (de) out.push([`${de > 0 ? '+' : '−'}${Math.abs(de)} energy`, de > 0 ? 'blue' : '']);
  const ds = b.stress - a.stress; if (Math.abs(ds) >= 3) out.push([`${signed1(ds)} stress`, ds > 0 ? 'warn' : 'good']);
  if (!out.length) return;
  const el = document.createElement('div'); el.className = 'delta';
  el.innerHTML = out.map(([t, c]) => `<span class="pill ${c}">${esc(t)}</span>`).join('');
  $('#deltas').prepend(el); setTimeout(() => el.remove(), 2700);
  while ($('#deltas').children.length > 3) $('#deltas').lastChild.remove();
}

/* ======================================================================
   Frame
   ====================================================================== */
function renderAll() {
  if (!S) return;
  if (mentionState && !document.body.contains(mentionState.el)) hideMentions();
  applyTheme();
  // one broken panel should never take down the whole screen
  for (const f of [renderSidebar, renderTopbar, renderTabbar, renderCol, renderRail]) { try { f(); } catch (e) { console.error(`${f.name} failed`, e); } }
}
function badges() { return { notifs: S.notifs.filter((n) => !n.read).length, messages: S.inbox.filter((m) => !m.read && m.type !== 'me').length, deals: S.deals.filter((d) => d.status === 'active').length }; }

function renderSidebar() {
  const b = badges();
  const item = ([id, name, icon], sub) => `<button class="nav-item ${sub ? 'nav-sub' : ''}" data-act="go" data-arg="${id}" ${tab === id && !ui.view ? 'aria-current="page"' : ''} title="${name}">${ico(icon, sub ? 'ico' : 'ico-lg')}${b[id] ? `<span class="dotbadge">${b[id]}</span>` : ''}<span class="lbl">${name}</span></button>`;
  $('#sidebar').innerHTML = `<div class="brand">C<span class="full">lout</span><em>C<span class="full">haser</span></em></div>
    ${MAIN_TABS.map((t) => item(t)).join('')}<div class="nav-sep"></div>${HUBS.map((h) => { const bb = hubBadge(h, b); const on = h[3].includes(tab) && !ui.view; return `<button class="nav-item nav-sub hub-${h[0]}" data-act="go" data-arg="${h[0]}" ${on ? 'aria-current="page"' : ''} title="${h[1]}">${ico(h[2], 'ico')}${bb ? `<span class="dotbadge">${bb}</span>` : ''}<span class="lbl">${h[1]}</span></button>`; }).join('')}
    <button class="post-btn" data-act="compose" title="Post">${ico('feather')}<span class="lbl"> Post</span></button>
    <button class="btn big" data-act="endDay" title="Sleep to end the day">${ico('moon')}<span class="lbl">Sleep · Day ${S.day}</span></button>
    <button class="me-chip" data-act="go" data-arg="profile">${meAv()}<span class="grow" style="min-width:0"><b style="display:flex;gap:4px;align-items:center">${esc(S.name)} ${meBadge()}</b><span class="muted small">@${esc(S.handle)}</span></span></button>`;
}
function renderTopbar() {
  $('#topbar').innerHTML = `<button class="icon-btn" data-act="drawer" aria-label="Open menu">${meAv('sm')}</button>
    <div class="brand">Clout<em>Chaser</em></div>
    <button class="btn sm" data-act="endDay">${ico('moon')} Day ${S.day}</button>`;
}
function renderTabbar() {
  const b = badges();
  $('#tabbar').innerHTML = MAIN_TABS.map(([id, name, icon]) => `<button data-act="go" data-arg="${id}" aria-label="${name}" ${tab === id ? 'aria-current="page"' : ''} style="${tab === id ? '' : 'opacity:.65'}">${ico(icon, 'ico-lg')}${b[id] ? `<span class="dotbadge">${b[id]}</span>` : ''}</button>`).join('');
}
function head(title, sub = '', back = false, right = '') {
  return `<div class="col-title">${back ? `<button class="icon-btn" data-act="back" aria-label="Back">${ico('back')}</button>` : ''}<div style="flex:1;min-width:0"><h2 style="display:flex;align-items:center;gap:4px">${title}</h2>${sub ? `<div class="sub">${sub}</div>` : ''}</div>${right}</div>`;
}
function tabsBar(items, cur, act) { return `<div class="tabs" role="tablist">${items.map(([k, l]) => `<button role="tab" data-act="${act}" data-arg="${k}" aria-selected="${cur === k}">${l}<span class="bar"></span></button>`).join('')}</div>`; }

function statusStrip() {
  const me = maxEnergy();
  const sp = (l, v) => `<button class="sp" data-act="go" data-arg="profile"><span class="l">${l}</span>${v}</button>`;
  return `<div class="strip">${sp('Followers', fmt(totalFollowers()))}${sp('Rep', `<span class="${repClass()}">${Math.round(S.rep)}</span>`)}${sp('Heat', `<span class="${S.heat >= 60 ? 'bad' : S.heat >= 30 ? 'warn' : ''}">${Math.round(S.heat)}</span>`)}${sp(`${ico('bolt')} Energy`, `<span class="energy-val ${chargedCls()} ${S.energy > me ? 'gold' : 'blue'}">${Math.round(S.energy)}/${me}</span>`)}${S.streak ? sp(`${ico('fire')} Streak`, `<span class="gold">${S.streak}d</span>`) : ''}${sp('Cash', money(S.money))}${sp('Stress', `<span class="${S.stress >= 70 ? 'bad' : S.stress >= 40 ? 'warn' : 'good'}">${Math.round(S.stress)}</span>`)}${sp('Eng', engRate().toFixed(1) + '%')}${injured() ? sp('Injured', `<span class="bad">until day ${S.injuredUntil}</span>`) : ''}${(S.investigation || 0) >= 15 ? sp('Investigation', `<span class="${investigationLabel()[1]}">${investigationLabel()[0]}</span>`) : ''}</div>`;
}
function statGrid() {
  const cell = (k, v, sub, pct, cls) => `<div class="statcell"><div class="k"><span>${k}</span><span>${sub}</span></div><div class="v">${v}</div>${pct !== null ? `<div class="meter ${cls}"><i style="width:${clamp(pct, 0, 100)}%"></i></div>` : ''}</div>`;
  const ds = S.dayStart || snap();
  const df = totalFollowers() - ds.f;
  return `<div class="statgrid">
    ${cell('Followers', fmt(totalFollowers()), `<span class="${df >= 0 ? 'good' : 'bad'}">${signed(df)}</span>`, null)}
    ${cell('Reputation', Math.round(S.rep), repLabel(), S.rep, repClass())}
    ${cell('Heat', Math.round(S.heat), heatLabel(), S.heat, S.heat >= 60 ? 'bad' : S.heat >= 30 ? 'warn' : 'like')}
    ${cell('Money', money(S.money), '', null)}
    ${cell('Energy', `<span class="energy-val ${chargedCls()} ${S.energy > maxEnergy() ? 'gold' : ''}">${Math.round(S.energy)}</span>`, S.energy > maxEnergy() ? 'overcharged' : `of ${maxEnergy()}`, (S.energy / maxEnergy()) * 100, S.energy > maxEnergy() ? 'gold' : '')}
    ${cell('Stress', Math.round(S.stress), stressLabel(), S.stress, S.stress >= 70 ? 'bad' : S.stress >= 40 ? 'warn' : 'good')}
  </div>`;
}

/* Milestones: what's next, how close you are, and what you get */
function milestonesPanel() {
  const t = totalFollowers(), ti = tierIndex();
  const row = (icon, name, cur, goal, reward, fmtv = fmt, logScale = false) => {
    const pct = logScale && goal > 1 ? clamp(Math.log10(Math.max(cur, 1)) / Math.log10(goal) * 100, 0, 100) : clamp(cur / goal * 100, 0, 100);
    return `<div class="ms"><div class="row between" style="flex-wrap:nowrap"><span class="ms-n">${icon} ${name}</span><span class="small muted num">${fmtv(Math.max(0, Math.floor(cur)))} / ${fmtv(goal)}</span></div><div class="meter gold"><i style="width:${pct}%"></i></div><span class="small muted">${reward}</span></div>`;
  };
  const fm = FOLLOWER_MILESTONES.find((m) => m > t), mm = MONEY_MILESTONES.find((m) => m > S.money), sm = STREAK_MILESTONES.find((m) => m > (S.streak || 0)), nt = TIERS[ti + 1];
  const nextStam = 5 - ((S.day - 1) % 5);
  const locked = ACHIEVEMENTS.filter(([id]) => !(S.ach || {})[id] && !(S.achievements || {})[id]).slice(0, 2);
  return `<div class="panel ms-panel"><h3>Milestones</h3><div class="ms-list">
    ${fm ? row('👥', 'Followers', t, fm, '+2 max energy, +15 energy', fmt, true) : ''}
    ${nt ? row('👑', `${nt.name} tier`, t, nt.min, 'Energy refill, +5 max energy, confetti', fmt, true) : ''}
    ${mm ? row('💰', 'Bank balance', S.money, mm, '+10 energy', money, true) : ''}
    ${sm ? row('🔥', 'Posting streak', S.streak || 0, sm, '+3 max energy, +12 energy', (v) => v + 'd') : ''}
    ${S.pass ? row('🎟️', `Clout Pass S${S.pass.n}`, S.pass.tier, PASS_TIERS, `Tier rewards in Arena · ${S.pass.ends - S.day}d left`, (v) => 'T' + v) : ''}
    ${totalFollowers() >= 1e7 ? row('♾️', 'Legacy rebrand', totalFollowers(), LEGACY_MIN, `${legacyPoints()} Legacy points if you rebrand now`, fmt, true) : ''}
    ${stamina() < 150 ? row('⚡', 'Stamina', 5 - nextStam, 5, `+5 max energy in ${nextStam} day${nextStam > 1 ? 's' : ''}`, (v) => v + 'd') : ''}
    ${locked.length ? `<div class="ms"><span class="ms-n">🏆 Next trophies</span>${locked.map(([, n, d]) => `<span class="small"><b>${esc(n)}</b> <span class="muted">· ${esc(d)}</span></span>`).join('')}</div>` : ''}
  </div><button class="panel-foot" data-act="go" data-arg="trophies">All trophies</button></div>`;
}
function renderRail() {
  if (window.innerWidth <= 1060) { $('#rail').innerHTML = ''; return; }
  const follow = Object.entries(S.npcs).filter(([, n]) => !n.following).sort((a, b) => b[1].rel - a[1].rel || b[1].followers - a[1].followers).slice(0, 3);
  $('#rail').innerHTML = `
    <label class="search">${ico('search')}<input id="railSearch" placeholder="Search stars and trends" value="${esc(ui.q)}" aria-label="Search"></label>
    <div class="panel"><h3>Your status</h3>${statGrid()}<button class="panel-foot" data-act="go" data-arg="profile">Open profile</button></div>
    ${milestonesPanel()}
    <div class="panel"><h3>What's happening</h3>${S.trends.slice(0, 5).map((t, i) => trendRow(t, i)).join('')}<button class="panel-foot" data-act="go" data-arg="explore">Show more</button></div>
    <div class="panel"><h3>Who to follow</h3>${follow.map(([id]) => personRow(id)).join('')}<button class="panel-foot" data-act="go" data-arg="explore">Show more</button></div>
    <div class="panel"><h3>Algorithm today</h3>${unlockedIds().map((id) => { const a = S.algo[id] || 1; const [l, c] = algoLabel(a); return `<div class="panel-row row between" style="cursor:default">${pdot(id)}<span style="flex:1">${PLATFORMS[id].name}</span><span class="pill ${c}">${l} ×${a.toFixed(2)}</span></div>`; }).join('')}</div>
    <div class="panel"><h3>Activity</h3>${S.log.slice(0, 8).map((l) => `<div class="panel-row small" style="cursor:default"><span class="muted">Day ${l.d} · </span><span class="${l.c}">${esc(l.m)}</span></div>`).join('')}</div>`;
  const rs = $('#railSearch');
  rs.addEventListener('keydown', (e) => { if (e.key === 'Enter') { ui.q = rs.value; tab = 'explore'; ui.view = null; renderAll(); } });
}
function trendRow(t, i) {
  const fit = trendFits(t), fresh = trendFresh(t);
  const posts = Math.round(t.hot * fresh * 40000 * (1 + srand(t.tag.length + t.born)() * 3));
  return `<button class="panel-row" data-act="composeTag" data-arg="${esc(t.tag)}"><div class="trend-row"><div style="min-width:0"><span class="ctx">${i + 1} · Trending${fit ? ` in ${NICHES[S.niche].name}` : ''}${t.edgy ? ' · Edgy' : ''}</span><b>${esc(t.tag)}</b><span class="ctx">${fmt(posts)} posts · ${t.life - (S.day - t.born)}d left</span></div>${fit ? '<span class="pill good">Fits you</span>' : ''}</div></button>`;
}
function personRow(id) {
  const N = NPCS[id], n = S.npcs[id];
  return `<div class="list-row" data-act="open" data-arg="star:${id}" style="border:0">${npcAv(id)}<div class="grow"><b style="display:flex;gap:4px;align-items:center">${esc(N.name)} ${npcBadge(id)}</b><span class="muted small">@${N.handle}${n.followsYou ? ' · Follows you' : ''}</span></div>${btn(n.following ? 'Following' : 'Follow', 'follow', id, n.following ? 'sm' : 'sm primary')}</div>`;
}

/* ======================================================================
   Main column router
   ====================================================================== */
function renderCol() {
  let html;
  const v = ui.view;
  if (v && v.type === 'post') html = vThread(v.id, v.npc);
  else if (v && v.type === 'star') html = vStar(v.id);
  else if (v && v.type === 'dm') html = vDm(v.key);
  else html = ({ home: vHome, explore: vExplore, notifs: vNotifs, messages: vMessages, profile: vProfile, danger: vDanger, deals: vDeals, shop: vShop, money: vMoney, arena: vArena, legacy: vLegacy, hq: vHQ, friends: vFriends, quests: () => `<div class="col-head">${head('Daily quests', 'Three new quests every game day, plus a bonus chest')}</div><div class="sect">${questsCard(true)}</div>`, team: vTeam, empire: vEmpire, life: vLife, stats: vStats, tea: vTea, trophies: vTrophies, account: vAccount }[tab] || vHome)();
  $('#col').innerHTML = html.replace('<div class="col-head">', '<div class="col-head">' + hubBar());
  if ((tab === 'stats' || (tab === 'profile' && ui.profTab === 'analytics')) && !v) drawChart();
  animateFresh();
  const bio = $('#bioEdit'); if (bio) bio.addEventListener('input', () => { S.bio = bio.value.slice(0, 160); save(); });
  const rt = $('#replyText'); if (rt) attachMentions(rt);
  const dm = $('#dmInput'); if (dm) attachMentions(dm); if (dm) dm.addEventListener('keydown', (e) => { if (e.key === 'Enter' && dm.value.trim()) { e.preventDefault(); ACT_RUN('dmSend', dm.dataset.npc); } });
  const q = $('#exploreSearch'); if (q) q.addEventListener('input', () => { ui.q = q.value; const r = $('#exploreResults'); if (r) r.innerHTML = exploreResults(); });
}

/* animate counters on a freshly published post so engagement "rolls in" */
function animateFresh() {
  $$('[data-count]').forEach((el) => {
    const target = +el.dataset.count; const t0 = performance.now(); const dur = 1600;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur); el.textContent = fmt(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
  S.posts.forEach((p) => { p.fresh = false; });
}

/* ---------- post cards ---------- */
const subReply = (to) => (x) => `<div class="subreply">${x.npc ? npcAv(x.npc, 'xs') : x.co ? coAv(x.co, 'xs') : x.me ? meAv('xs') : avatar(x.who, '#44505E', 'xs')}<div><b>${x.npc ? esc(NPCS[x.npc].name) : x.co ? esc(COMPANIES[x.co].name) : x.me ? esc(S.name) : '@' + esc(x.who)}</b> ${x.npc ? npcBadge(x.npc) : x.co ? vb(true) : ''} <span class="muted">replying to @${esc(to)}</span><div>${esc(x.text)}</div></div></div>`;
function pollHtml(p) {
  if (!p.poll) return '';
  const tot = p.poll.votes.reduce((a, b) => a + b, 0) || 1, max = Math.max(...p.poll.votes);
  return `<div class="poll">${p.poll.opts.map((o, i) => { const pc = Math.round((p.poll.votes[i] / tot) * 100); return `<div class="poll-row ${p.poll.votes[i] === max ? 'win' : ''}"><i style="width:${pc}%"></i><span>${esc(o)}</span><b>${pc}%</b></div>`; }).join('')}<span class="small muted">${fmt(tot)} votes · final results</span></div>`;
}
function media(format, label, color, seed, look, x = {}) {
  const F = FORMATS[format]; if (!F) return '';
  if (format === 'take' || format === 'thread') return '';
  const r = srand(seed);
  const L = look && FILTERS[look];
  const art = x.img ? `<img class="scene" src="${x.img}" alt="" style="filter:${look ? LOOK_CSS[look] : 'none'}">` : sceneSvg({ seed, format, niche: x.niche || S.niche, look, caption: x.caption, label, color });
  const dur = F.video ? `${Math.floor(r() * (F.p === 'tube' ? 20 : 1)) + (F.p === 'tube' ? 8 : 0)}:${String(Math.floor(r() * 60)).padStart(2, '0')}` : '';
  return `<div class="tw-media">${art}${L ? `<span class="dur" style="left:auto;right:10px;top:10px;bottom:auto">${L.name}</span>` : ''}${F.video ? `<span class="play">${ico('live')}</span><span class="dur">${dur}</span><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="vprog" aria-hidden="true"><i></i></span>` : ''}${format === 'carousel' ? '<span class="dur">1/5</span>' : ''}</div>`;
}
function actions(o) {
  const c = (v, fresh) => fresh ? `<span data-count="${v}">0</span>` : fmt(v);
  return `<div class="tw-actions">
    <button class="act" data-act="${o.replyAct}" data-arg="${o.arg}" aria-label="Reply"><span class="ib">${ico('reply')}</span>${c(o.replies, o.fresh)}</button>
    <button class="act rp ${o.reposted ? 'on' : ''}" data-act="${o.repostAct || 'noop'}" data-arg="${o.id || o.arg}" aria-label="Repost"><span class="ib">${ico('repost')}</span>${c(o.reposts, o.fresh)}</button>
    <button class="act lk ${o.liked ? 'on' : ''}" data-act="${o.likeAct || 'noop'}" data-arg="${o.id || o.arg}" aria-label="Like"><span class="ib">${ico('heart')}</span>${c(o.likes, o.fresh)}</button>
    <button class="act" data-act="${o.replyAct}" data-arg="${o.arg}" aria-label="Views"><span class="ib">${ico('views')}</span>${c(o.views, o.fresh)}</button></div>`;
}
function myPostCard(p) {
  const P = PLATFORMS[p.platform];
  const ctx = p.viral ? `<div class="tw-ctx gold">${ico('fire')} Going viral</div>` : p.byMgr ? `<div class="tw-ctx">${ico('team')} Posted by your social media manager</div>` : p.sponsored ? `<div class="tw-ctx">${ico('brief')} Paid partnership</div>` : p.flop ? `<div class="tw-ctx">Low reach</div>` : '';
  const extra = p.tags.filter((t) => !p.caption.includes(t));
  return `<article class="tw ${p.fresh ? 'fresh' : ''}" data-act="open" data-arg="post:${p.id}">${ctx}${meAv()}<div class="tw-main">
    <div class="tw-head"><b>${esc(S.name)}</b>${meBadge()}<span class="h">@${esc(S.handle)} · ${ago(p.day)}</span><span class="pl">${pdot(p.platform)}${P.name}</span></div>
    <div class="tw-text">${rich(p.caption)}${extra.length ? ' ' + rich(extra.join(' ')) : ''}</div>${pollHtml(p)}${(() => { const sib = S.posts.filter((x) => x.crossOf === p.id); return sib.length ? `<div class="row small"><span class="pill blue">Also on ${sib.map((x) => PLATFORMS[x.platform].name).join(', ')}</span><span class="muted">+${fmt(sib.reduce((a, x) => a + x.views, 0))} views there</span></div>` : ''; })()}
    ${media(p.format, p.topic, P.color, p.id, p.filter, { caption: p.caption, img: p.img })}
    ${actions({ replyAct: 'open', arg: 'post:' + p.id, replies: p.comments, reposts: p.shares, likes: p.likes, views: p.views, fresh: p.fresh })}
    ${p.beef || p.pitch || p.deal ? `<div class="row small">${p.deal ? `<span class="pill gold">${esc(p.deal)}</span>` : ''}${p.pitch ? `<span class="pill blue">${esc(p.pitch)}</span>` : ''}${p.beef ? `<span class="pill bad">${esc(p.beef)}</span>` : ''}</div>` : ''}
    ${p.fresh ? `<div class="row small">${p.gain ? `<span class="pill ${p.gain > 0 ? 'good' : 'bad'}">${signed(p.gain)} followers</span>` : ''}<span class="pill ${p.rep >= 0 ? 'good' : 'bad'}">${signed1(p.rep)} rep</span>${p.cash > 0.5 ? `<span class="pill gold">${money(p.cash)} ads</span>` : ''}</div>` : ''}
  </div></article>`;
}
function coPostCard(f) {
  const C = COMPANIES[f.co];
  return `<article class="tw">${coAv(f.co)}<div class="tw-main">
    <div class="tw-head"><b>${esc(C.name)}</b>${vb(true)}<span class="h">@${C.handle} · ${ago(f.day)}</span><span class="pl">${esc(C.cat)}</span></div>
    <div class="tw-text">${rich(f.text)}</div>
    ${actions({ replyAct: 'composeAt', arg: C.handle, id: String(f.id), replies: f.comments, reposts: f.reposts || 0, likes: f.likes, views: f.views || 0, liked: f.liked, reposted: f.reposted, likeAct: f.liked ? 'noop' : 'like', repostAct: f.reposted ? 'noop' : 'repost' })}
  </div></article>`;
}
function npcPostCard(f) {
  if (f.co) return coPostCard(f);
  const N = NPCS[f.npc], n = S.npcs[f.npc];
  const r = srand(f.id);
  const hasMedia = r() < 0.35;
  const fmtK = ['photo', 'reel', 'carousel'][Math.floor(r() * 3)];
  const clash = f.clash && (S.clashes || []).find((c) => c.id === f.clash);
  return `<article class="tw" data-act="open" data-arg="npcpost:${f.id}">${clash ? `<div class="tw-ctx" style="color:var(--like)">${ico('fire')} ${esc(clash.kind)}: ${esc(firstName(clash.a))} vs ${esc(firstName(clash.b))}</div>` : n.feud ? `<div class="tw-ctx bad">${ico('fire')} Your rival</div>` : S.partner === f.npc ? `<div class="tw-ctx" style="color:var(--like)">${ico('heart')} Your partner</div>` : ''}
    <span data-act="open" data-arg="star:${f.npc}">${npcAv(f.npc)}</span><div class="tw-main">
    <div class="tw-head"><b>${esc(N.name)}</b>${npcBadge(f.npc)}<span class="h">@${N.handle} · ${ago(f.day)}</span></div>
    <div class="tw-text">${rich(f.text)}</div>
    ${hasMedia ? media(fmtK, N.type, N.color, f.id, null, { niche: N.niche, caption: f.text }) : ''}
    ${actions({ replyAct: 'open', arg: 'npcpost:' + f.id, id: String(f.id), replies: f.comments + (f.commented ? 1 : 0), reposts: f.reposts || 0, likes: f.likes, views: f.views || f.likes * 25, liked: f.liked, reposted: f.reposted, likeAct: f.liked ? 'noop' : 'like', repostAct: f.reposted ? 'noop' : 'repost' })}
  </div></article>`;
}

/* ---------- Clash and challenge cards ---------- */
function clashCard(c) {
  const pa = Math.round(c.votes * 100), left = c.ends - S.day;
  const side = (k) => `<button class="cv" data-act="open" data-arg="star:${k}">${npcAv(k, 'lg')}<b>${esc(NPCS[k].name)}</b><span class="small muted">${fmt(S.npcs[k].followers)}</span></button>`;
  const status = c.done ? (c.winner === 'truce' ? 'Ended in a truce' : `${esc(firstName(c.winner))} won`) : left > 0 ? `${left} day${left > 1 ? 's' : ''} left` : 'Final day';
  const mine = c.side === 'peace' ? 'You made peace' : c.side ? `You backed ${esc(firstName(c.side === 'a' ? c.a : c.b))}` : '';
  return `<div class="clash ${c.done ? 'done' : ''}">
    <div class="row between"><span class="pill like">${ico('fire')} ${esc(c.kind)}</span><span class="small muted">${status}</span></div>
    <div class="clash-vs">${side(c.a)}<span class="vs">VS</span>${side(c.b)}</div>
    <div class="clash-bar"><i style="width:${pa}%"></i></div><div class="row between small"><b>${pa}%</b><span class="muted">public vote</span><b>${100 - pa}%</b></div>
    ${mine ? `<div class="small gold">${mine}</div>` : ''}
    ${!c.done ? `<div class="row">${!c.side ? btn(`Team ${esc(firstName(c.a))} · 5`, 'clashSide', c.id + ':a', 'sm') + btn(`Team ${esc(firstName(c.b))} · 5`, 'clashSide', c.id + ':b', 'sm') + btn('Make peace · 15', 'clashPeace', c.id, 'sm') + btn('Stir the pot · 5', 'clashStir', c.id, 'sm danger') : ''}${btn(`${ico('feather')} Post about it`, 'clashMeme', c.id, 'sm blue')}</div>` : ''}
  </div>`;
}
/* Home hero: progress to the next tier plus one-tap shortcuts */
function heroCard() {
  const t = totalFollowers(), ti = tierIndex(), cur = TIERS[ti], nx = TIERS[ti + 1];
  const pct = nx ? clamp((Math.log10(Math.max(t, 1)) - Math.log10(Math.max(cur.min, 1))) / (Math.log10(nx.min) - Math.log10(Math.max(cur.min, 1))) * 100, 0, 100) : 100;
  const ds = S.dayStart || snap(), df = t - ds.f;
  const b = badges(), gigs = S.inbox.filter((m) => m.type === 'gig' && !m.done).length;
  const tile = (icon, label, act, arg, cls = '', badge = '') => `<button class="qt ${cls}" data-act="${act}" data-arg="${arg}">${ico(icon)}<span>${label}</span>${badge ? `<i class="qb">${badge}</i>` : ''}</button>`;
  return `<div class="hero"><div class="hero-top"><div style="min-width:0"><div class="small muted">${cur.name} creator${nx ? ` · next: <b style="color:var(--ink)">${nx.name}</b>` : ' · top tier'}</div>
      <div class="hero-n"><span class="num">${fmt(t)}</span>${nx ? `<span class="small muted num"> / ${fmt(nx.min)}</span>` : ''}<span class="small ${df >= 0 ? 'good' : 'bad'} num"> ${signed(df)} today</span></div></div>
      <div class="hero-cash"><span class="small muted">Cash</span><b class="num gold">${money(S.money)}</b></div></div>
    <div class="tierbar" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100" aria-label="Progress to next tier"><i style="width:${pct}%"></i></div>
    <div class="quick">${tile('feather', 'Post', 'compose', '', 'hot')}${S.platforms.live.unlocked ? tile('live', 'Go live', 'compose', 'live') : ''}${vaultOn() ? tile('lock', 'FanVault', 'compose', 'vault', 'vaultq') : ''}${tile('cash', 'Money', 'go', 'money', '', gigs || '')}${tile('dice', 'Arena', 'go', 'arena', 'arenaq', S.pass && S.pass.tier > S.pass.claimed.length ? S.pass.tier - S.pass.claimed.length : '')}${tile('mail', 'DMs', 'go', 'messages', '', b.messages || '')}${tile('bag', 'Shop', 'go', 'shop')}${tile('fire', 'Danger', 'go', 'danger')}</div></div>`;
}
/* Confetti for the big moments */
function celebrate(kind = 'gold') {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
  const cols = kind === 'viral' ? ['#F91880', '#1D9BF0', '#FFD400', '#00BA7C'] : ['#FFD400', '#FFAD1F', '#FFF3B0', '#F91880'];
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('i');
    p.style.cssText = `left:${Math.random() * 100}%;background:${pick(cols)};animation-delay:${(Math.random() * 0.4).toFixed(2)}s;animation-duration:${(1.6 + Math.random() * 1.4).toFixed(2)}s;--dx:${Math.round(Math.random() * 160 - 80)}px;--r:${Math.round(Math.random() * 720)}deg;${Math.random() < 0.4 ? 'border-radius:50%;' : ''}`;
    box.appendChild(p);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 3400);
}
function spinCard() {
  const done = S.flags.spinDay === S.day;
  return `<div class="spin-card"><div class="wheel" id="wheel" aria-hidden="true">${SPIN_PRIZES.map((p, i) => `<i style="transform:rotate(${i * 45}deg)"></i>`).join('')}<b>${ico('star')}</b></div><div style="flex:1;min-width:0"><div class="small muted">Daily spin</div><b>${done ? `You won: ${esc(S.flags.spinPrize || 'something')}` : 'Spin for energy, cash, followers, tea or chaos'}</b></div>${done ? '<span class="pill">Back tomorrow</span>' : btn('Spin', 'spin', '', 'sm primary')}</div>`;
}
function challengeCard() {
  const ch = S.challenge; if (!ch) return '';
  const rw = challengeReward(ch);
  const go = ch.req.stunt ? btn('Go', 'go', 'danger', 'sm blue') : ch.req.vault ? btn('Open', 'compose', 'vault', 'sm blue') : btn('Start', 'compose', '', 'sm blue');
  const label = `${ch.hard ? '<span class="pill like">Hard</span> ' : ''}${ch.food ? '<span class="pill warn">Food blog</span> ' : ''}Daily challenge · +${rw.e} energy, +${Math.round(rw.fp * 100)}% followers${rw.cash ? `, +${money(rw.cash)}` : ''}`;
  const reroll = !ch.done && S.flags.rerollDay !== S.day ? `<button class="btn sm" data-act="rerollChallenge" title="Swap for a different challenge (once a day)">${ico('dice')} 5</button>` : '';
  return `<div class="challenge ${ch.done ? 'done' : ''} ${ch.food ? 'food' : ''}">${ico(ch.done ? 'star' : 'sparkle', 'ico-lg')}<div style="flex:1;min-width:0"><div class="small muted">${label}</div><b>${esc(ch.text)}</b></div>${ch.done ? '<span class="pill good">Done</span>' : `<div class="row" style="flex-wrap:nowrap">${reroll}${go}</div>`}</div>`;
}


/* ---------- Home ---------- */
function vHome() {
  let items;
  const heads = S.posts.filter((p) => !p.crossOf);
  if (ui.feedTab === 'mine') items = heads.map((p) => ({ k: 'me', d: p.day, id: p.id, p }));
  else {
    const feed = ui.feedTab === 'following' ? S.feed.filter((f) => f.npc && S.npcs[f.npc].following) : S.feed;
    items = [...heads.map((p) => ({ k: 'me', d: p.day, id: p.id, p })), ...feed.map((f) => ({ k: 'npc', d: f.day, id: f.id, f }))];
  }
  items.sort((a, b) => b.d - a.d || b.id - a.id);
  const prompt = `<div class="reply-box" data-act="compose" style="cursor:text">${meAv()}<div><div class="muted" style="font-size:20px;padding:8px 0">What's happening?</div><div class="row between"><span class="small muted">${S.trends[0] ? `Trending: <span class="blue">${esc(S.trends[0].tag)}</span>` : ''}</span><span class="btn primary sm">Post</span></div></div></div>`;
  const empty = ui.feedTab === 'following' ? `<div class="empty"><h3>Follow some stars</h3><p>Posts from people you follow show up here. Find them in Explore.</p>${btn('Explore', 'go', 'explore', 'blue')}</div>`
    : `<div class="empty"><h3>Nothing yet</h3><p>Your posts show up here. Write your first one.</p>${btn('Post', 'compose', '', 'blue')}</div>`;
  return `<div class="col-head">${head('Home', `Day ${S.day} · ${weekday()} · ${tier().name} creator${S.streak ? ` · <span class="gold">${S.streak}-day streak</span>` : ''}`, false, `<button class="btn sm" data-act="endDay" title="Sleep to end the day">${ico('moon')} Sleep</button>`)}
    ${tabsBar([['foryou', 'For you'], ['following', 'Following'], ['mine', 'Your posts']], ui.feedTab, 'feedTab')}</div>
    ${ui.feedTab !== 'mine' ? storiesBar() + loginCard() + questsCard() : ''}
    ${statusStrip()}${ui.feedTab !== 'mine' ? heroCard() + (S.world && WORLD_EVENTS[S.world.id] ? `<button class="world-banner" data-act="go" data-arg="arena">${WORLD_EVENTS[S.world.id].icon} <b>${WORLD_EVENTS[S.world.id].name}</b> <span>${WORLD_EVENTS[S.world.id].desc}</span></button>` : '') : ''}${prompt}${ui.feedTab !== 'mine' ? spinCard() + challengeCard() + activeClashes().map(clashCard).join('') : ''}
    ${items.length ? items.slice(0, 50).map((it) => it.k === 'me' ? myPostCard(it.p) : npcPostCard(it.f)).join('') : empty}`;
}

/* ---------- Threads ---------- */
function vThread(id, isNpc) {
  if (isNpc) {
    const f = S.feed.find((x) => x.id === id); if (!f || f.co) return head('Post', '', true) + '<div class="empty">This post was deleted.</div>';
    const N = NPCS[f.npc];
    const r = srand(f.id * 7);
    const fans = Array.from({ length: 4 }, () => ({ who: HANDLE_A[Math.floor(r() * HANDLE_A.length)] + '.' + HANDLE_B[Math.floor(r() * HANDLE_B.length)], text: COMMENTS[r() < 0.7 ? 'pos' : 'fun'][Math.floor(r() * 7)], likes: Math.round(f.likes * r() * 0.01) }));
    for (let i = fans.length - 1; i > 0; i--) if (fans.slice(0, i).some((x) => x.text === fans[i].text)) fans.splice(i, 1);
    const fw = (f.text.match(/[A-Za-z]{5,}/g) || ['this'])[0].toLowerCase();
    const clash = f.clash && (S.clashes || []).find((c) => c.id === f.clash);
    const starIds = [];
    if (clash) starIds.push(clash.a === f.npc ? clash.b : clash.a);
    const pool = Object.keys(NPCS).filter((x) => x !== f.npc && !starIds.includes(x));
    for (let i = 0; i < 1 + Math.floor(r() * 2); i++) starIds.push(pool[Math.floor(r() * pool.length)]);
    const starReplies = starIds.map((id, i) => ({ npc: id, text: clash && i === 0 ? CLASH_LINES.defend[Math.floor(r() * CLASH_LINES.defend.length)].replace('{a}', N.handle) : (NPCS[id].lines && r() < 0.3 ? NPCS[id].lines[Math.floor(r() * NPCS[id].lines.length)] : STAR_VOICE[archetype(id)][Math.floor(r() * 5)].replace(/\{w\}/g, fw).replace(/\{f\}/g, fmt(S.npcs[f.npc].followers)).replace(/\{n\}/g, NICHES[N.niche].name.toLowerCase())) }));
    const coIds = Object.keys(COMPANIES); const coR = r() < 0.5 ? { co: coIds[Math.floor(r() * coIds.length)] } : null;
    if (coR) coR.text = COMPANIES[coR.co].replies[Math.floor(r() * COMPANIES[coR.co].replies.length)];
    return `<div class="col-head">${head('Post', '', true)}</div><div class="thread-main">
      <div class="row" style="flex-wrap:nowrap;cursor:pointer" data-act="open" data-arg="star:${f.npc}">${npcAv(f.npc)}<div style="min-width:0"><b style="display:flex;gap:4px;align-items:center">${esc(N.name)} ${npcBadge(f.npc)}</b><span class="muted">@${N.handle}</span></div></div>
      <div class="tw-text">${rich(f.text)}</div>
      <div class="thread-meta">Day ${f.day} · <b style="color:var(--ink)">${fmt(f.views || f.likes * 25)}</b> Views</div>
      <div class="thread-counts"><span><b>${fmt(f.reposts || 0)}</b> Reposts</span><span><b>${fmt(f.likes)}</b> Likes</span><span><b>${fmt(f.comments)}</b> Replies</span>${btn(`${ico('live')} Duet this`, 'duet', String(f.id), 'sm', false, 'Remix their post on your own feed')}</div>
      ${actions({ replyAct: 'noop', arg: String(f.id), id: String(f.id), replies: f.comments, reposts: f.reposts || 0, likes: f.likes, views: f.views || 0, liked: f.liked, reposted: f.reposted, likeAct: f.liked ? 'noop' : 'like', repostAct: f.reposted ? 'noop' : 'repost' })}</div>
      ${f.commented ? `<article class="tw" style="cursor:default">${meAv()}<div class="tw-main"><div class="tw-head"><b>${esc(S.name)}</b>${meBadge()}<span class="h">@${esc(S.handle)} · ${ago(f.day)}</span></div><div class="small muted">Replying to <span class="blue">@${N.handle}</span></div><div class="tw-text">${rich(f.myReply || '')}</div>${f.replyResult ? `<div class="row"><span class="pill ${f.replyResult.good ? 'good' : 'bad'}">${esc(f.replyResult.text)}</span></div>` : ''}${f.replyBack ? subReply(S.handle)({ npc: f.npc, text: f.replyBack }) : ''}${f.chime ? subReply(S.handle)(f.chime) : ''}</div></article>`
        : `<div class="reply-box">${meAv()}<div><div class="small muted">Replying to <span class="blue">@${N.handle}</span></div><textarea id="replyText" maxlength="200" placeholder="Post your reply" aria-label="Your reply"></textarea>
          <div class="row between"><span class="small muted">Compliments build friendships. Jokes can go big. Insults start fires.</span>${btn('Reply · 3', 'npcReply', String(f.id), 'blue sm')}</div></div></div>`}
      ${starReplies.map((x) => `<article class="tw" style="cursor:default"><span data-act="open" data-arg="star:${x.npc}" style="cursor:pointer">${npcAv(x.npc)}</span><div class="tw-main"><div class="tw-head"><b>${esc(NPCS[x.npc].name)}</b>${npcBadge(x.npc)}<span class="h">@${NPCS[x.npc].handle}</span></div><div class="small muted">Replying to <span class="blue">@${N.handle}</span></div><div class="tw-text">${rich(x.text)}</div></div></article>`).join('')}
      ${coR ? `<article class="tw" style="cursor:default">${coAv(coR.co)}<div class="tw-main"><div class="tw-head"><b>${esc(COMPANIES[coR.co].name)}</b>${vb(true)}<span class="h">@${COMPANIES[coR.co].handle}</span></div><div class="tw-text">${esc(coR.text)}</div></div></article>` : ''}
      ${fans.map((c) => `<article class="tw" style="cursor:default">${avatar(c.who, '#44505E')}<div class="tw-main"><div class="tw-head"><b>${esc(c.who)}</b><span class="h">@${esc(c.who)}</span></div><div class="tw-text">${esc(c.text)}</div></div></article>`).join('')}`;
  }
  const p = S.posts.find((x) => x.id === id); if (!p) return head('Post', '', true) + '<div class="empty">This post is gone.</div>';
  const P = PLATFORMS[p.platform];
  return `<div class="col-head">${head('Post', P.name, true)}</div><div class="thread-main">
    <div class="row" style="flex-wrap:nowrap">${meAv()}<div style="min-width:0"><b style="display:flex;gap:4px;align-items:center">${esc(S.name)} ${meBadge()}</b><span class="muted">@${esc(S.handle)}</span></div></div>
    <div class="tw-text">${rich(p.caption)}</div>${pollHtml(p)}
    ${media(p.format, p.topic, P.color, p.id, p.filter, { caption: p.caption, img: p.img })}
    <div class="thread-meta">Day ${p.day} · ${P.name} · ${FORMATS[p.format].name} · ${TONES[p.tone].name}${p.orig !== undefined ? ` · Originality ${p.orig}` : ''}${p.filter ? ` · ${FILTERS[p.filter].name} look${p.lookMatch ? ' (on trend)' : ''}` : ''} · <b style="color:var(--ink)">${fmt(p.views)}</b> Views</div>
    <div class="thread-counts"><span><b>${fmt(p.shares)}</b> Reposts</span><span><b>${fmt(p.likes)}</b> Likes</span><span><b>${fmt(p.comments)}</b> Replies</span><span class="${p.gain >= 0 ? 'good' : 'bad'}"><b style="color:inherit">${signed(p.gain)}</b> Followers</span><span class="${p.rep >= 0 ? 'good' : 'bad'}"><b style="color:inherit">${signed1(p.rep)}</b> Rep</span>${p.cash > 0.5 ? `<span><b>${money(p.cash)}</b> Ad revenue</span>` : ''}</div></div>
    <div class="hint" style="margin:12px 16px">Talk to your replies. Thanking fans builds engagement and reputation. Clapping back at haters gets attention but raises heat. 2 energy each.</div>
    ${p.comms.map((c, i) => {
      const who = c.npc ? NPCS[c.npc] : c.co ? COMPANIES[c.co] : null;
      const av = c.npc ? `<span data-act="open" data-arg="star:${c.npc}" style="cursor:pointer">${npcAv(c.npc)}</span>` : c.co ? coAv(c.co) : avatar(c.who, c.neg ? '#7A2E2E' : '#44505E');
      return `<article class="tw" style="cursor:default">${av}<div class="tw-main">
        <div class="tw-head"><b>${esc(who ? who.name : c.who)}</b>${c.npc ? npcBadge(c.npc) : c.co ? vb(true) : ''}${c.cc ? flag(c.cc) : ''}${c.sf ? `<span class="pill gold">${SUPERFAN_KINDS[c.sf].label}</span>` : ''}<span class="h">@${esc(c.who)}</span></div>
        <div class="small muted">Replying to <span class="blue">@${esc(S.handle)}</span></div>
        <div class="tw-text">${esc(c.text)}</div>
        ${c.mine ? (c.mine === '♥' ? `<div class="small" style="color:var(--like)">${ico('heart')} You liked this</div>` : `<div class="tw-text" style="margin-top:6px;padding-left:10px;border-left:2px solid var(--accent)"><b>You:</b> ${esc(c.mine)}</div>${c.back ? `<div class="subreply">${c.npc ? npcAv(c.npc, 'xs') : coAv(c.co, 'xs')}<div><b>${esc(c.npc ? NPCS[c.npc].name : COMPANIES[c.co].name)}</b> <span class="muted">replying to you</span><div>${esc(c.back)}</div></div></div>` : ''}`)
          : `<div class="row" style="margin-top:6px">${c.neg ? btn('Clap back', 'engage', `${p.id}:${i}:clap`, 'sm danger') + btn('Kill with kindness', 'engage', `${p.id}:${i}:kind`, 'sm') : btn('Thank them', 'engage', `${p.id}:${i}:thanks`, 'sm') + btn(`${ico('heart')} Like`, 'engage', `${p.id}:${i}:heart`, 'sm')}</div>`}
        <div class="small muted">${fmt(c.likes || 0)} likes</div>
        ${(c.sub || []).map(subReply(c.who)).join('')}</div></article>`;
    }).join('')}`;
}

/* ---------- Explore ---------- */
function exploreResults() {
  const q = ui.q.trim().toLowerCase();
  if (!q) return '';
  const people = Object.keys(NPCS).filter((id) => (NPCS[id].name + ' ' + NPCS[id].handle + ' ' + NPCS[id].type).toLowerCase().includes(q));
  const trends = S.trends.filter((t) => t.tag.toLowerCase().includes(q));
  return `<div class="sect"><h3>Results for "${esc(ui.q)}"</h3></div>${people.map((id) => personRow(id)).join('')}${trends.map((t, i) => trendRow(t, i)).join('')}${!people.length && !trends.length ? '<div class="empty">No matches.</div>' : ''}`;
}
function vExplore() {
  const rows = Object.entries(S.npcs).map(([id, n]) => ({ id, f: n.followers, name: NPCS[id].name }));
  rows.push({ id: 'you', f: totalFollowers(), name: S.name });
  rows.sort((a, b) => b.f - a.f);
  const follow = Object.keys(S.npcs).filter((id) => !S.npcs[id].following).sort((a, b) => (NPCS[b].niche === S.niche) - (NPCS[a].niche === S.niche) || S.npcs[b].rel - S.npcs[a].rel);
  return `<div class="col-head"><div class="col-title"><label class="search" style="flex:1">${ico('search')}<input id="exploreSearch" placeholder="Search stars and trends" value="${esc(ui.q)}" aria-label="Search"></label></div></div>
    <div id="exploreResults">${exploreResults()}</div>
    <div class="sect" style="border:0"><h3>Celebrity clashes</h3><span class="small muted">Pick a side, broker peace, stir the pot, or turn it into content. Backing the winner pays off.</span></div>
    ${activeClashes().length ? activeClashes().map(clashCard).join('') : '<div class="empty" style="padding:16px">No clashes right now. Give it a day.</div>'}
    ${(S.clashes || []).filter((c) => c.done).slice(0, 4).map((c) => `<div class="list-row" style="cursor:default">${npcAv(c.a, 'xs')}<span class="small">vs</span>${npcAv(c.b, 'xs')}<div class="grow"><span class="small">${esc(c.kind)}</span><span class="small muted">${c.winner === 'truce' ? 'Truce' : esc(NPCS[c.winner].name) + ' won'} · Day ${c.ends}</span></div></div>`).join('')}
    <div class="sect" style="padding-bottom:4px;border:0;border-top:1px solid var(--line)"><h3>Trends for you</h3><span class="small muted">Tap a trend to post about it. Fresh trends that fit your niche reach furthest.</span></div>
    ${S.trends.map((t, i) => trendRow(t, i)).join('')}
    <div class="sect" style="padding-bottom:4px;border:0;border-top:1px solid var(--line)"><h3>Who to follow</h3></div>${follow.slice(0, 6).map((id) => personRow(id)).join('')}
    <div class="sect" style="padding-bottom:4px;border:0;border-top:1px solid var(--line)"><h3>Brands on the timeline</h3><span class="small muted">Tag them with @ in a post. Some reply, some roast, some send deals.</span></div>
    ${Object.entries(COMPANIES).map(([id, C]) => `<div class="list-row" style="border:0">${coAv(id)}<div class="grow"><b style="display:flex;gap:4px;align-items:center">${esc(C.name)} ${vb(true)}</b><span class="muted small">@${C.handle} · ${esc(C.cat)}</span></div>${btn('Tag in a post', 'composeAt', C.handle, 'sm')}</div>`).join('')}
    <div class="sect" style="border-top:1px solid var(--line)"><h3>Leaderboard</h3><div class="table-wrap"><table class="lb"><tbody>${rows.map((r, i) => `<tr class="${r.id === 'you' ? 'you' : ''}" ${r.id !== 'you' ? `data-act="open" data-arg="star:${r.id}" style="cursor:pointer"` : ''}><td class="num muted">${i + 1}</td><td><div class="row" style="flex-wrap:nowrap">${r.id === 'you' ? meAv('xs') : npcAv(r.id, 'xs')}<span>${esc(r.name)}</span></div></td><td class="n">${fmt(r.f)}</td></tr>`).join('')}</tbody></table></div></div>`;
}

/* ---------- Star profile ---------- */
function vStar(id) {
  const N = NPCS[id], n = S.npcs[id];
  const relW = Math.abs(n.rel) / 2;
  const posts = S.feed.filter((f) => f.npc === id);
  const more = [];
  if (!n.feud) {
    more.push(btn(`Gift ${money(giftCost(id))}`, 'gift', id, 'sm', n.lastGift === S.day || S.money < giftCost(id)));
    more.push(btn('Ask to collab · 10', 'collab', id, 'sm', !!S.collab || n.rel < 15 || (n.lastAsk && S.day - n.lastAsk < 2), n.rel < 15 ? 'Needs 15+ relationship' : ''));
    more.push(btn('Ask for shoutout · 5', 'shout', id, 'sm', n.rel < 40 || (n.lastShout && S.day - n.lastShout < 3), n.rel < 40 ? 'Needs 40+ relationship' : ''));
    if (!S.partner && n.rel >= 65) more.push(btn('Ask on a date · 10', 'date', id, 'sm blue'));
    if (S.partner === id) more.push(btn('Break up', 'breakup', id, 'sm danger'));
    more.push(btn('Call out · 10', 'feud', id, 'sm danger'));
  } else more.push(btn('Make peace · 10', 'makeup', id, 'sm'));
  more.push(btn(`${ico('feather')} Pitch collab in a post`, 'postAbout', `npc:${id}:collab`, 'sm'), btn(`${ico('feather')} Shout them out`, 'postAbout', `npc:${id}:shout`, 'sm'), btn(`${ico('feather')} Diss them in a post`, 'postAbout', `npc:${id}:beef`, 'sm danger'));
  more.push(btn(`${ico('fire')} Clash battle · 20`, 'battle', id, 'sm danger', S.energy < 20, 'Three rounds, public vote. Starts a feud.'));
  return `<div class="col-head">${head(esc(N.name) + ' ' + npcBadge(id), `${posts.length} posts`, true)}</div>
    <div class="banner" style="background:linear-gradient(120deg, ${N.color}, #111)"></div>
    <div class="prof">${npcAv(id, 'xl')}
      <div class="prof-actions"><button class="icon-btn" style="border:1px solid var(--line)" data-act="openDm" data-arg="${id}" aria-label="Message">${ico('mail')}</button>${btn(n.following ? 'Following' : 'Follow', 'follow', id, n.following ? '' : 'primary')}</div>
      <h2>${esc(N.name)} ${npcBadge(id)}</h2><div class="handle">@${N.handle} ${n.followsYou ? '<span class="pill">Follows you</span>' : ''} ${N.lines ? '<span class="pill" title="Satirical character with a tweaked name. Everything they do in the game is invented.">Parody</span>' : ''}</div>
      <div class="bio">${esc(N.bio)}</div>
      <div class="meta"><span>${N.type}</span><span>${NICHES[N.niche].name}</span><span>${flag(NPC_COUNTRY[id])} ${COUNTRIES[NPC_COUNTRY[id]].name}</span><span>Public rep ${Math.round(n.rep)}</span></div>
      <div class="counts"><span><b>${fmt(n.followers)}</b> Followers</span></div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px"><div class="row between small"><b>${S.partner === id ? 'Dating' : n.feud ? 'Feuding' : relLabel(n.rel)}</b><span class="muted num">${Math.round(n.rel)} / 100</span></div>
        <div class="relbar"><i style="${n.rel >= 0 ? `left:50%;width:${relW}%;background:var(--good)` : `right:50%;width:${relW}%;background:var(--bad)`}"></i></div>
        <span class="small muted">Collab at 15, shoutout at 40, date at 65. Relationships fade without contact. Ego ${Math.round(N.ego * 10)}/10 · Drama ${Math.round(N.drama * 10)}/10</span></div>
      <div class="persona"><div class="row" style="gap:6px"><span class="pill blue">${ARCHETYPES[archetype(id)].name}</span><span class="pill ${STANCE[stanceOf(id)][1]}">${STANCE[stanceOf(id)][0]}</span><span class="pill">Mood: ${moodLabel(n.mood || 0)}</span>${n.cond && n.cond.until >= S.day ? `<span class="pill gold">Waiting on your ${n.cond.type === 'apology' ? 'public apology' : 'shoutout'} (${n.cond.until - S.day + 1}d)</span>` : ''}</div>
        <div class="small muted">${esc(ARCHETYPES[archetype(id)].desc)}</div>${memorySummary('npc', id).length ? `<div class="small">Remembers: ${esc(memorySummary('npc', id).join(' · '))}</div>` : ''}</div>
      <div class="row" style="margin-bottom:12px">${more.join('')}</div>
    </div>
    ${activeClashes().filter((c) => c.a === id || c.b === id).map(clashCard).join('')}
    ${tabsBar([['posts', 'Posts']], 'posts', 'noop')}
    ${posts.length ? posts.map(npcPostCard).join('') : '<div class="empty">No recent posts.</div>'}`;
}

/* ---------- Notifications ---------- */
function vNotifs() {
  const list = S.notifs.filter((n) => ui.notifTab === 'all' || (ui.notifTab === 'mentions' && n.type === 'reply') || (ui.notifTab === 'stars' && n.npc));
  const icon = { like: ['heart', 'var(--like)'], follow: ['user', 'var(--accent)'], repost: ['repost', 'var(--repost)'], reply: ['reply', 'var(--accent)'], viral: ['fire', 'var(--gold)'], system: ['sparkle', 'var(--accent)'] };
  const row = (n) => {
    const [ic, col] = icon[n.type] || icon.system;
    const whoName = n.npc ? NPCS[n.who].name : n.co && COMPANIES[n.who] ? COMPANIES[n.who].name : n.who ? '@' + n.who : '';
    const av = n.npc ? npcAv(n.who, 'sm') : n.co && COMPANIES[n.who] ? coAv(n.who, 'sm') : n.who ? avatar(n.who, '#44505E', 'sm') : '';
    const target = n.post ? `post:${n.post}` : n.npc ? `star:${n.who}` : '';
    if (n.type === 'reply') return `<article class="tw" data-act="open" data-arg="${target}" style="${n.read ? '' : 'background:var(--accent-soft)'}">${n.npc ? npcAv(n.who) : n.co && COMPANIES[n.who] ? coAv(n.who) : avatar(n.who, '#44505E')}<div class="tw-main"><div class="tw-head"><b>${esc(whoName)}</b>${n.npc ? npcBadge(n.who) : ''}<span class="h">· ${ago(n.d)}</span></div><div class="small muted">Replying to <span class="blue">@${esc(S.handle)}</span></div><div class="tw-text">${esc(n.text)}</div></div></article>`;
    return `<div class="nt ${n.read ? '' : 'unread'}" ${target ? `data-act="open" data-arg="${target}"` : ''}><div class="ni" style="color:${col}">${ico(ic, 'ico')}</div><div style="min-width:0">${av ? `<div class="row" style="margin-bottom:6px">${av}</div>` : ''}<div>${whoName ? `<b>${esc(whoName)}</b> ` : ''}${esc(n.text)}</div><div class="quote">Day ${n.d}</div></div></div>`;
  };
  return `<div class="col-head">${head('Notifications', '', false, btn('Mark all read', 'readNotifs', '', 'sm'))}${tabsBar([['all', 'All'], ['stars', 'Stars'], ['mentions', 'Replies']], ui.notifTab, 'notifTab')}</div>
    ${list.length ? list.slice(0, 60).map(row).join('') : '<div class="empty"><h3>Nothing to see here</h3><p>Likes, follows and replies show up here once you post.</p></div>'}`;
}

/* ---------- Messages ---------- */
function threadKey(m) { return m.npc ? 'npc:' + m.npc : m.type === 'deal' ? 'brand:' + m.brand : m.type === 'system' ? 'sys:' + m.from : 'u:' + m.from; }
function threads() {
  const map = new Map();
  for (const m of S.inbox) { const k = threadKey(m); if (!map.has(k)) map.set(k, []); map.get(k).push(m); }
  for (const id of Object.keys(S.npcs)) if (S.npcs[id].dmOpen && !map.has('npc:' + id)) map.set('npc:' + id, []);
  return [...map.entries()].map(([k, ms]) => ({ k, ms: ms.slice().sort((a, b) => a.id - b.id) })).sort((a, b) => (b.ms.length ? b.ms[b.ms.length - 1].id : 0) - (a.ms.length ? a.ms[a.ms.length - 1].id : 0));
}
function threadWho(k, ms) {
  const type = k.slice(0, k.indexOf(':')), id = k.slice(k.indexOf(':') + 1);
  if (type === 'npc') return { name: NPCS[id].name, handle: '@' + NPCS[id].handle, av: npcAv(id), badge: npcBadge(id) };
  if (type === 'brand') return { name: BRANDS[id].name, handle: COMPANIES[id] ? '@' + COMPANIES[id].handle : BRANDS[id].shady ? 'Unverified business' : 'Business account', av: COMPANIES[id] ? coAv(id) : `<span class="av" aria-hidden="true">${logoSvg(BRANDS[id].name, BRANDS[id].shady ? '#6B6B6B' : '#2C3E50')}</span>`, badge: BRANDS[id].shady ? '' : vb(true) };
  const m = ms[0] || {};
  const scam = m.type && m.type.startsWith('scam');
  return { name: id, handle: scam ? 'Unknown sender' : m.type === 'hater' ? 'Not following you' : m.type === 'fan' ? 'Follows you' : 'Official', av: avatar(id.replace('@', ''), m.type === 'hater' ? '#7A2E2E' : scam ? '#6B6B6B' : m.type === 'system' ? '#1D9BF0' : '#44505E'), badge: m.type === 'system' ? vb() : '' };
}
function vMessages() {
  const th = threads();
  return `<div class="col-head">${head('Messages', 'Stars, brands and fans')}</div>
    ${th.length ? th.map(({ k, ms }) => {
      const w = threadWho(k, ms); const last = ms[ms.length - 1];
      const unread = ms.some((m) => !m.read && m.type !== 'me');
      const pending = ms.some((m) => !m.done && msgActions(m).length);
      return `<button class="list-row" data-act="open" data-arg="dm:${esc(k)}">${w.av}<div class="grow"><span><b>${esc(w.name)}</b> ${w.badge} <span class="muted small">${esc(w.handle)}${last ? ' · ' + ago(last.day) : ''}</span></span><span class="${unread ? '' : 'muted'}" style="${unread ? 'font-weight:700' : ''}">${last ? (last.type === 'me' ? 'You: ' : '') + esc(last.body) : 'Start a conversation'}</span></div>${pending ? '<span class="pill blue">Reply needed</span>' : ''}${unread ? '<span class="dot" style="background:var(--accent)"></span>' : ''}</button>`;
    }).join('') : '<div class="empty"><h3>Welcome to your inbox</h3><p>DMs from stars, brand offers and fan mail land here.</p></div>'}`;
}
function msgActions(m) {
  switch (m.type) {
    case 'fan': return [['Reply warmly', 'reply'], ['Ignore', 'dismiss']];
    case 'hater': return [['Block', 'block'], ['Clap back', 'clap'], ['Kill with kindness', 'kind']];
    case 'deal': return [['Accept', 'accept'], ['Negotiate', 'negotiate'], ['Decline', 'decline']];
    case 'collab': return [['Let\'s do it', 'collabYes'], ['Not now', 'collabNo']];
    case 'counter': return m.cond === 'gift' ? [[`Send ${money(m.price)} gift`, 'acceptTerms'], ['Decline', 'declineTerms']] : [['Accept terms', 'acceptTerms'], ['Decline', 'declineTerms']];
    case 'scam_verify': return [['Verify my account', 'phish'], ['Report as phishing', 'report']];
    case 'gig': return [[`Accept · ${money(m.pay)}${m.e ? ` · ${m.e}⚡` : ''}`, 'gigYes'], ['Decline', 'gigNo']];
    case 'scam_invest': return [['Send $500', 'scamPay'], ['Delete', 'report']];
    default: return [];
  }
}
function vDm(k) {
  const th = threads().find((t) => t.k === k) || { k, ms: [] };
  th.ms.forEach((m) => { m.read = true; });
  const w = threadWho(k, th.ms);
  const npc = k.startsWith('npc:') ? k.slice(4) : null;
  const bubbles = th.ms.map((m) => {
    if (m.type === 'me') return `<div class="bub me">${esc(m.body)}</div><div class="bub-meta me">Day ${m.day}</div>`;
    const acts = m.done ? (m.outcome ? `<div class="bub-meta">${esc(m.outcome)}</div>` : '') : msgActions(m).length ? `<div class="bub-acts">${msgActions(m).map(([l, a], i) => btn(l, 'mact', m.id + ':' + a, i === 0 ? 'sm blue' : 'sm')).join('')}</div>` : '';
    if (m.type === 'deal') {
      const b = BRANDS[m.brand];
      return `<div class="offer"><b>${esc(m.subject)}</b><span>${esc(m.body)}</span><div class="row"><span class="pill gold">${money(m.pay)}</span><span class="pill">${m.req} post${m.req > 1 ? 's' : ''}</span><span class="pill">${m.days} days</span>${b.shady ? '<span class="pill bad">Sketchy brand</span>' : ''}${m.negotiated ? '<span class="pill good">Negotiated</span>' : ''}</div></div><div class="bub-meta">Day ${m.day}</div>${acts}`;
    }
    return `<div class="bub them">${m.subject && m.type !== 'npc' ? `<b>${esc(m.subject)}</b><br>` : ''}${esc(m.body)}</div><div class="bub-meta">Day ${m.day}</div>${acts}`;
  }).join('');
  const relLine = npc ? `<div class="small muted" style="text-align:center;margin-bottom:12px">${S.npcs[npc].feud ? 'Feuding' : relLabel(S.npcs[npc].rel)} · relationship ${Math.round(S.npcs[npc].rel)}</div>` : '';
  return `<div class="col-head">${head(`${esc(w.name)} ${w.badge}`, esc(w.handle), true, npc ? `<button class="icon-btn" data-act="open" data-arg="star:${npc}" aria-label="View profile">${ico('user')}</button>` : '')}</div>
    <div class="chat">${relLine}${bubbles || '<div class="empty">Say hi. Compliments work better than self-promo.</div>'}${ui.typing && ui.typing === npc ? '<div class="typing"><i></i><i></i><i></i></div>' : ''}</div>
    ${npc ? `<div class="dm-bar"><input id="dmInput" data-npc="${npc}" maxlength="200" placeholder="Start a message" aria-label="Message"><button class="icon-btn" data-act="dmSend" data-arg="${npc}" aria-label="Send" style="color:var(--accent)">${ico('send')}</button></div><div class="scroller" style="padding:0 12px 8px">${[['collab', 'Pitch a collab'], ['compliment', 'Compliment'], ['shout', 'Ask for a shoutout'], ['sorry', 'Apologize'], ['trash', 'Talk trash'], ...(S.npcs[npc].rel >= 65 && !S.partner ? [['date', 'Ask on a date']] : [])].map(([k, l]) => `<button class="chip ${k === 'trash' ? 'beefchip' : ''}" data-act="dmChip" data-arg="${npc}:${k}">${l}</button>`).join('')}</div><div class="small muted" style="padding:0 16px 12px">3 energy per message. ${ARCHETYPES[archetype(npc)].name}: ${esc(ARCHETYPES[archetype(npc)].desc)}</div>` : ''}`;
}

/* ---------- My profile ---------- */
function vProfile() {
  const t = totalFollowers();
  const following = Object.values(S.npcs).filter((n) => n.following).length;
  const body = ui.profTab === 'analytics' ? statsBody() : ui.profTab === 'trophies' ? trophiesBody() : (S.posts.length ? S.posts.filter((p) => !p.crossOf).slice(0, 30).map(myPostCard).join('') : `<div class="empty"><h3>No posts yet</h3>${btn('Write your first post', 'compose', '', 'blue')}</div>`);
  return `<div class="col-head">${head(`${esc(S.name)} ${meBadge()}`, `${S.stats.posts} posts`)}</div>
    <div class="banner" style="background:${S.banner && BANNERS[S.banner] ? BANNERS[S.banner].css : `linear-gradient(120deg, ${S.color}, #111)`}"></div>
    <div class="prof">${meAv('xl')}<div class="prof-actions">${btn(ui.editBio ? 'Done' : 'Edit profile', 'editBio', '', '')}</div>
      <h2>${esc(S.name)} ${meBadge()}</h2><div class="handle">@${esc(S.handle)}</div>
      ${ui.editBio ? `<textarea class="input" id="bioEdit" maxlength="160" rows="2" style="margin-top:12px" aria-label="Bio">${esc(S.bio)}</textarea>` : `<div class="bio">${esc(S.bio)}</div>`}
      <div class="meta"><span>${flag(S.country)} ${COUNTRIES[S.country].name}</span><span>${NICHES[S.niche].name} creator</span><span>${tier().name} tier</span><span>Joined day 1</span><span>${{ chill: 'Chill', normal: 'Normal', brutal: 'Unhinged' }[S.diff]} internet</span></div>
      ${(S.superfans || []).length ? `<div class="topfans"><span class="small muted">Top fans</span>${S.superfans.map((f) => `<span class="row" style="gap:6px;flex-wrap:nowrap">${avatar(f.handle, '#44505E', 'xs')}<span class="small"><b>@${esc(f.handle)}</b> <span class="muted">${SUPERFAN_KINDS[f.kind].label} · ${f.count} comments</span></span></span>`).join('')}</div>` : ''}
      <div class="counts"><span><b>${following}</b> Following</span><span><b>${fmt(t)}</b> Followers</span>${S.partner ? `<span style="color:var(--like)">Dating ${esc(npcName(S.partner))}</span>` : ''}</div>
    </div>
    <div style="margin:0 16px 12px;border-radius:16px;overflow:hidden">${statGrid()}</div>
    ${window.innerWidth <= 1060 ? `<div style="margin:0 16px 12px">${milestonesPanel()}</div>` : ''}
    <div class="scroller" style="padding:0 16px 12px">${Object.keys(PLATFORMS).map((id) => { const p = S.platforms[id]; return `<span class="pill" style="padding:6px 10px">${pdot(id)} ${PLATFORMS[id].name} ${p.unlocked ? `<b style="color:var(--ink)">${fmt(p.followers)}</b>` : ico('lock')}</span>`; }).join('')}</div>
    ${tabsBar([['posts', 'Posts'], ['analytics', 'Analytics'], ['trophies', 'Trophies']], ui.profTab, 'profTab')}${body}`;
}

/* ======================================================================
   Career screens
   ====================================================================== */
function vDanger() {
  const [il, ic] = investigationLabel();
  const odds = (p) => `<span class="pill ${p >= 0.4 ? 'bad' : p >= 0.2 ? 'warn' : 'good'}">${Math.round(p * 100)}% chance it goes wrong</span>`;
  return `<div class="col-head">${head('Danger Zone', 'High risk, high reward. Every choice here has consequences.')}</div>
    <div class="sect">${injured() ? `<div class="hint" style="border:1px solid var(--bad)">${ico('heartp')} Injured until day ${S.injuredUntil}: max energy is cut by 40%.</div>` : ''}
      <div class="row between"><h3>${ico('fire')} Stunts ${S.stuntStreak ? `<span class="pill gold">Daredevil streak ×${S.stuntStreak} · prizes ×${stuntStreakX().toFixed(2)}</span>` : ''}${stuntsToday() ? `<span class="pill warn">Stunt #${stuntsToday() + 1} today: prizes ×${stuntNumb().toFixed(2)}</span>` : ''}</h3><span class="small muted">Stress raises the odds of failure. A bodyguard and a lawyer lower them.</span></div>
      ${Object.entries(STUNT_TIERS).map(([tk, [tn, td]]) => `<div class="tier-h ${tk}"><b>${tn}</b><span class="small muted">${td}</span></div><div class="cards">${Object.entries(STUNTS).filter(([, st]) => st.tier === tk).map(([id, st]) => `<div class="card danger-card ${tk === 'extreme' ? 'extreme' : ''}"><div class="t"><span>${st.name}</span><span class="pill blue">${st.e} energy</span></div><span class="small muted">${esc(st.desc)}</span><div class="row">${odds(stuntOdds(id))}<span class="pill gold">Win ~${money(stuntPrize(id).cash)} · +${Math.round(stuntPrize(id).fp * 100)}% followers</span></div><span class="small gold">Viral: ×2.5 cash, ×2 followers · Jackpot (${Math.round((0.06 + st.risk * 0.12) * 100)}%): ×3 cash</span><span class="small">If it fails: ${{ injury: 'injury, hospital bill, low energy for days', food: st.tier === 'extreme' ? 'ambulance, 3 days of low energy' : 'food poisoning, a day of low energy', crash: 'crash, injury, massive backlash', arrest: 'arrest, fine, lost day', burnout: 'collapse, huge stress', backlash: 'public outrage, possible cancellation' }[st.harm]}</span>${btn('Do it', 'dzStunt', id, 'sm danger', S.energy < st.e || S.hackedUntil >= S.day)}</div>`).join('')}</div>`).join('')}</div>
    <div class="sect"><div class="row between"><h3>${ico('heartp')} Spicy moves</h3><span class="small muted">Celebrity-style drama for clout. Charisma and a PR agent improve the odds.</span></div>
      <div class="cards">${Object.entries(SPICY).map(([id, sp]) => `<div class="card danger-card spicy-card"><div class="t"><span>${sp.name}</span><span class="pill blue">${sp.e} energy</span></div><span class="small muted">${esc(sp.desc)}</span><div class="row">${odds(spicyOdds(id))}<span class="pill gold">${sp.pay}</span></div>${sp.min && totalFollowers() < sp.min ? `<span class="small muted row">${ico('lock')} Needs ${fmt(sp.min)} followers</span>` : btn('Do it', 'dzSpicy', id, 'sm danger', S.energy < sp.e || S.hackedUntil >= S.day)}</div>`).join('')}</div></div>
    <div class="sect"><div class="row between"><h3>${ico('brief')} Shady schemes</h3><span class="pill ${ic}">Investigation: ${il} (${Math.round(S.investigation || 0)})</span></div>
      <div class="hint">Schemes take money from your own fans. They pay right away, but every one raises the investigation meter, and getting exposed means refunds, fines, suspensions, mass unfollows and possibly getting cancelled. Scammed fans will be in your inbox. ${S.scamTake ? `So far you've taken ${money(S.scamTake)}.` : ''}</div>
      <div class="cards">${Object.entries(SCHEMES).map(([id, sc]) => `<div class="card danger-card"><div class="t"><span>${sc.name}</span><span class="pill blue">${sc.e} energy</span></div><span class="small muted">${esc(sc.desc)}</span><div class="row">${odds(schemeOdds(id))}<span class="pill gold">~${money(Math.max(40, totalFollowers() * realRatio() * sc.cut * clamp(S.rep / 60, 0.3, 1.4)))}</span></div>${btn('Run it', 'dzScheme', id, 'sm danger', S.energy < sc.e || S.hackedUntil >= S.day)}</div>`).join('')}</div></div>`;
}
function giftCost(id) { const f = S.npcs[id].followers; return f < 1e6 ? 100 : f < 1e7 ? 500 : f < 5e7 ? 2000 : 5000; }
function vDeals() {
  const active = S.deals.filter((d) => d.status === 'active');
  const past = S.deals.filter((d) => d.status !== 'active').slice(-12).reverse();
  const offers = S.inbox.filter((m) => m.type === 'deal' && !m.done);
  return `<div class="col-head">${head('Brand deals', `${S.stats.deals} completed · ${S.stats.dealsFailed} failed`)}</div>
    ${offers.length ? `<div class="sect"><h3>Offers waiting</h3>${offers.map((m) => `<div class="card"><div class="t"><span>${esc(BRANDS[m.brand].name)}</span><span class="gold">${money(m.pay)}</span></div><span class="small muted">${m.req} post${m.req > 1 ? 's' : ''} in ${m.days} days${BRANDS[m.brand].shady ? ' · sketchy brand' : ''}</span><div class="row">${btn('Accept', 'mact', m.id + ':accept', 'sm blue')}${btn('Negotiate', 'mact', m.id + ':negotiate', 'sm', !!m.negotiated)}${btn('Decline', 'mact', m.id + ':decline', 'sm')}</div></div>`).join('')}</div>` : ''}
    <div class="sect"><h3>Active contracts</h3>${active.length ? `<div class="cards">${active.map((d) => {
      const b = BRANDS[d.brand], left = d.deadline - S.day;
      return `<div class="card"><div class="t"><span>${esc(b.name)}</span>${b.shady ? '<span class="pill bad">Sketchy</span>' : '<span class="pill good">Reputable</span>'}</div>
        <div class="row between small"><span>${d.done}/${d.req} posts</span><span class="${left <= 1 ? 'bad' : 'muted'}">${left > 0 ? left + 'd left' : 'Due today'}</span></div>
        <div class="meter gold"><i style="width:${(d.done / d.req) * 100}%"></i></div>
        <div class="row between"><b class="gold">${money(d.pay)}</b>${btn('Post it', 'dealPost', d.id, 'sm blue')}</div></div>`;
    }).join('')}</div>` : '<p class="muted">No active deals. Offers arrive in Messages as you grow. A talent manager brings more.</p>'}</div>
    ${past.length ? `<div class="sect"><h3>History</h3><div class="table-wrap"><table class="lb"><tbody>${past.map((d) => `<tr><td>${esc(BRANDS[d.brand].name)}</td><td class="muted">Day ${d.day}</td><td><span class="pill ${d.status === 'done' ? 'good' : 'bad'}">${d.status === 'done' ? 'Paid' : 'Failed'}</span></td><td class="n">${money(d.pay)}</td></tr>`).join('')}</tbody></table></div></div>` : ''}
    <div class="sect"><div class="hint">Sketchy brands pay 60% more and can blow up later. Skipping #ad disclosure boosts engagement but risks a fine. More than 4 sponsored posts in your last 10 and fans call you a sellout.</div></div>`;
}
function vShop() {
  const item = (it) => `<div class="card ${S.owned[it.id] ? 'owned' : ''}"><div class="t"><span>${esc(it.name)}</span><span class="num">${money(it.price)}</span></div><span class="small muted">${esc(it.desc)}</span>${S.owned[it.id] ? '<span class="pill good">Owned</span>' : btn('Buy', 'buy', it.id, 'sm primary', S.money < it.price)}</div>`;
  const cons = CONSUMABLES.map((c) => `<div class="card"><div class="t"><span>${c.name}</span><span class="num">${money(c.price)}</span></div><span class="small muted">${c.desc}</span>${btn('Buy', 'consume', c.id, 'sm', S.money < c.price)}</div>`).join('');
  const growth = GROWTH.map((g) => `<div class="card"><div class="t"><span>${g.name}</span><span class="num">${money(g.price)}</span></div><span class="small muted">${g.desc}</span>${g.special === 'check' && S.flags.paidCheck ? '<span class="pill gold">Active</span>' : btn('Buy', 'growth', g.id, 'sm' + (g.n ? ' danger' : ''), S.money < g.price)}</div>`).join('');
  const courses = Object.entries(COURSES).map(([k, c]) => { const l = skillLvl(k); const price = Math.round(c.base * Math.pow(l, 1.6)); return `<div class="card"><div class="t"><span>${c.name}</span><span class="num">${l >= 10 ? 'Maxed' : money(price)}</span></div><span class="small muted">${k[0].toUpperCase() + k.slice(1)} ${l} → ${Math.min(10, l + 1)}. ${c.desc}</span>${btn('Enroll', 'course', k, 'sm', l >= 10 || S.money < price)}</div>`; }).join('');
  const style = (kind, k, f, prev) => { const own = (S[kind + 's'] || []).includes(k), on = S[kind] === k; return `<div class="card ${on ? 'owned' : ''}"><div class="t"><span class="row" style="gap:8px">${prev}${f.name}</span><span class="num">${own ? 'Owned' : money(f.price)}</span></div>${btn(on ? 'Take off' : own ? 'Wear it' : 'Buy', kind, k, 'sm' + (own ? '' : ' primary'), !own && S.money < f.price)}</div>`; };
  return `<div class="col-head">${head('Shop', `${money(S.money)} to spend`)}</div>
    <div class="sect"><h3>Gear</h3><div class="cards">${SHOP.filter((i) => i.cat === 'Gear').map(item).join('')}</div></div>
    <div class="sect"><h3>Lifestyle</h3><div class="cards">${SHOP.filter((i) => i.cat === 'Lifestyle').map(item).join('')}</div></div>
    <div class="sect"><h3>Property <span class="small muted">· pays rent every night</span></h3><div class="cards">${SHOP.filter((i) => i.cat === 'Property').map(item).join('')}</div></div>
    <div class="sect"><h3>Style <span class="small muted">· avatar frames and profile banners</span></h3><div class="cards">${Object.entries(FRAMES).filter(([k, f]) => !f.pass || (S.frames || []).includes(k)).map(([k, f]) => style('frame', k, f, `<span class="av sm" style="border:3px solid transparent;background:linear-gradient(${S.color}, ${S.color}) padding-box, ${f.css} border-box">${faceSvg(S.faceSeed || S.name)}</span>`)).join('')}${Object.entries(BANNERS).filter(([k, b]) => !b.pass || (S.banners || []).includes(k)).map(([k, b]) => style('banner', k, b, `<span class="swatch" style="background:${b.css}"></span>`)).join('')}</div></div>
    <div class="sect"><h3>Courses</h3><div class="cards">${courses}</div></div>
    <div class="sect"><h3>Boosts & recovery</h3><div class="cards">${cons}</div></div>
    <div class="sect"><h3>Growth hacks</h3><div class="cards">${growth}</div></div>`;
}
function vTeam() {
  const t = totalFollowers();
  let payroll = 0; Object.keys(S.team).forEach((k) => { if (S.team[k]) payroll += teamPay(k); });
  const due = (k) => Math.max(0, ((S.teamDue || {})[k] || S.day + 30) - S.day);
  return `<div class="col-head">${head('Your team', `Payroll ${money(payroll)}/month`)}</div>
    <div class="sect"><div class="hint">Salaries are monthly. Hiring pays the first month up front; after that each person is paid every 30 days. Upgrade people from Junior to Legend to double what they do. Hire 4+ people for a dream-team reach bonus (+1% per extra hire, up to +10%; now +${Math.round(Math.min(0.1, Math.max(0, teamSize() - 3) * 0.01) * 100)}%). Three days in debt and everyone quits.</div><div class="cards">${Object.entries(TEAM).map(([k, m]) => {
      const hired = !!S.team[k], locked = t < m.req;
      return `<div class="card ${hired ? 'owned' : ''}"><div class="t"><span>${m.name}</span><span class="num">${money(hired ? teamPay(k) : m.pay)}/mo</span></div><span class="small muted">${m.desc}</span>
        ${hired ? `<div class="row"><span class="pill good">${TEAM_LEVELS[teamLvl(k) - 1]} · Lv ${teamLvl(k)}</span><span class="small muted">Effect ×${tm(k).toFixed(2)} · next payday in ${due(k)} day${due(k) === 1 ? '' : 's'}</span>${teamLvl(k) < 5 ? btn(`Upgrade to ${TEAM_LEVELS[teamLvl(k)]} · ${money(teamUpCost(k))}`, 'teamUp', k, 'sm primary', S.money < teamUpCost(k), `Effect ×${(tm(k) + 0.25).toFixed(2)}, salary ${money(Math.round(m.pay * (1 + teamLvl(k) * 0.4)))}/mo`) : '<span class="pill gold">Max level</span>'}${btn('Let go', 'fire', k, 'sm danger')}</div>${k === 'socialmgr' ? mgrPanel() : k === 'investor' ? invPanel() : ''}` : locked ? `<span class="small muted row">${ico('lock')} Needs ${fmt(m.req)} followers</span>` : btn(`Hire · ${money(m.pay)} first month`, 'hire', k, 'sm primary', S.money < m.pay)}</div>`;
    }).join('')}</div></div>`;
}
function productName() { return `${S.handle} ${{ beauty: 'Cosmetics', gaming: 'Gear', fitness: 'Protein', comedy: 'Hot Sauce', tech: 'Audio', food: 'Snacks', music: 'Headphones', fashion: 'Studio', travel: 'Luggage', lifestyle: 'Home' }[S.niche]}`; }
function vEmpire() {
  const t = totalFollowers();
  const lockTxt = (n) => `<span class="small muted row">${ico('lock')} Unlocks at ${n} followers</span>`;
  const merch = S.merch ? `<div class="row"><span class="pill gold">Level ${S.merch.lvl}</span><span class="small muted">${fmt(S.merch.sold)} sold</span></div><div class="row">${btn('Drop a collection · 20', 'merchDrop', '', 'sm blue', S.energy < 20)}${S.merch.lvl < 5 ? btn(`Upgrade · ${money(5000 * S.merch.lvl ** 2)}`, 'merchUp', '', 'sm', S.money < 5000 * S.merch.lvl ** 2) : ''}</div>`
    : t >= 5000 ? btn('Launch merch · $3,000', 'merchLaunch', '', 'primary', S.money < 3000) : lockTxt('5K');
  const product = S.product ? `<b>${esc(S.product.name)}</b><span class="small muted">${fmt(S.product.sold)} sold · hype ×${(S.product.hype || 1).toFixed(1)}</span>${btn(`Marketing push · ${money(Math.round(2e4 + t * 0.01))}`, 'productPush', '', 'sm', S.money < 2e4 + t * 0.01)}`
    : t >= 2.5e5 ? btn(`Launch ${productName()} · $150K`, 'productLaunch', '', 'primary', S.money < 1.5e5) : lockTxt('250K');
  const guests = Object.entries(S.npcs).filter(([, n]) => n.rel >= 20 && !n.feud).map(([id]) => id);
  const done = S.podcast && S.podcast.last === S.day;
  const pod = S.podcast ? `<span class="small muted">${S.stats.episodes} episodes${done ? ' · one per day' : ''}</span><div class="row">${btn('Solo episode · 30', 'episode', '', 'sm', S.energy < 30 || done)}${guests.slice(0, 5).map((id) => btn(`with ${esc(NPCS[id].name.split(' ')[0])}`, 'episode', id, 'sm', S.energy < 30 || done)).join('')}</div>`
    : t >= 2e4 ? btn('Launch podcast · $2,000', 'podcastLaunch', '', 'primary', S.money < 2000) : lockTxt('20K');
  return `<div class="col-head">${head('Empire', `${money(S.money)} cash · ${money(S.savings)} saved`)}</div>
    <div class="sect"><div class="cards">
      <div class="card"><div class="t">Merch line</div><span class="small muted">Sales scale with real followers and reputation.</span>${merch}</div>
      <div class="card"><div class="t">Your own brand</div><span class="small muted">A real product with your name on it.</span>${product}</div>
      <div class="card"><div class="t">Podcast</div><span class="small muted">Interview friends. Grows ViewTube.</span>${pod}</div>
      <div class="card"><div class="t">Savings <span class="pill">0.06%/day</span></div><div class="row">${btn('Deposit 25%', 'deposit', '0.25', 'sm', S.money <= 0)}${btn('Deposit all', 'deposit', '1', 'sm', S.money <= 0)}${btn('Withdraw', 'withdraw', '', 'sm', S.savings <= 0)}</div></div>
      <div class="card"><div class="t">Charity <span class="pill">${money(S.stats.donated)} given</span></div><span class="small muted">Builds reputation and cools heat.</span><div class="row">${[0.01, 0.05, 0.2].map((p) => btn(`${Math.round(p * 100)}% · ${money(Math.max(50, S.money * p))}`, 'donate', String(p), 'sm', S.money < 50)).join('')}</div></div>
    </div></div>`;
}
const LIFE = [
  ['grass', 'Touch grass', 'Walk outside without your phone.', 10, '−12 stress'],
  ['gym', 'Hit the gym', 'Endorphins and a little charisma.', 15, '−8 stress, +charisma'],
  ['meditate', 'Meditate', 'Ten quiet minutes.', 5, '−8 stress'],
  ['family', 'Family dinner', 'Your mom made your favorite.', 10, '−15 stress'],
  ['replies', 'Reply to 10 comments', 'Answer up to 10 fan comments on your recent posts at once.', 10, '+engagement, +rep, +followers'],
  ['giveaway', 'Host a giveaway', 'Quick growth. Attracts bots.', 10, 'Costs 1% of followers in $'],
  ['meetup', 'Fan meetup', 'Meet fans in person (10K+).', 30, '$1,000, +rep'],
  ['party', 'Industry party', 'Mingle with stars (50K+).', 20, '$500, a star likes you more'],
];
function vLife() {
  const t = totalFollowers();
  const locked = (id) => (id === 'meetup' && t < 1e4) || (id === 'party' && t < 5e4);
  return `<div class="col-head">${head('Life & skills', `Stress ${Math.round(S.stress)} · Energy ${Math.round(S.energy)}`)}</div>
    <div class="sect"><div class="cards">${LIFE.map(([id, n, d, e, fx]) => `<div class="card"><div class="t"><span>${n}</span><span class="pill blue">${e} energy</span></div><span class="small muted">${d}</span><span class="small">${fx}</span>${btn('Do it', 'life', id, 'sm', S.energy < e || locked(id) || (S.flags['life_' + id] === S.day && id !== 'replies'))}</div>`).join('')}</div>
    <div class="hint">Stress above 80 cuts tomorrow's energy by 30% and hurts post quality. At 100 you burn out.</div>
    <div class="hint"><b>Getting energy back:</b> posts that land well refund energy, viral posts give +25, and every follower milestone, new tier, achievement, skill level, paid deal, collab, shoutout and star follow-back gives a burst. Milestones and tiers also raise your max energy for good. Post every day to build a streak for extra morning energy (+5 per day, up to +30). Rewards can overcharge you past your max.</div></div>
    <div class="sect"><h3>${ico('plane')} World tour</h3><span class="small muted">Travel for content: 25 energy, unlocks a trip topic for 3 days, grows your fans in that country, and you might run into a local star. Visited ${(S.visited || []).length} countries.</span>
      <div class="scroller" style="flex-wrap:wrap">${TRAVEL_SPOTS.filter((cc) => cc !== S.country).map((cc) => btn(`${COUNTRIES[cc].flag} ${COUNTRIES[cc].name} · ${money(travelCost(cc))}`, 'travel', cc, 'sm', S.money < travelCost(cc) || S.energy < 25 || S.travelUntil >= S.day)).join('')}</div>
      ${S.travelUntil >= S.day ? `<span class="small gold">You're in ${COUNTRIES[S.travelCountry || 'id'].name} ${COUNTRIES[S.travelCountry || 'id'].flag}. Post a trip topic before you fly home.</span>` : ''}</div>
    <div class="sect"><h3>${ico('tea')} Tea vault</h3><span class="small muted">Secrets you picked up at parties, collabs and in DMs. Spilling one gets huge reach and heat, and the star will not forget it.</span>
      ${(S.tea || []).length ? S.tea.map((t) => `<div class="card" style="flex-direction:row;align-items:center">${npcAv(t.npc, 'sm')}<div style="flex:1;min-width:0"><b>${esc(NPCS[t.npc].name)}</b><div class="small">${esc(t.text)}</div></div>${btn('Spill it', 'teaSpill', t.id, 'sm danger')}${btn('Keep it', 'teaDrop', t.id, 'sm')}</div>`).join('') : '<p class="small muted">Empty. Go to industry parties, collab, and get close to stars in DMs.</p>'}</div>
    <div class="sect"><h3>Skills</h3><div class="cards">${Object.entries(S.skills).map(([k, s]) => `<div class="card"><div class="t"><span>${k[0].toUpperCase() + k.slice(1)}</span><span class="pill ${s.lvl >= 10 ? 'gold' : ''}">Level ${s.lvl}</span></div><div class="meter"><i style="width:${s.lvl >= 10 ? 100 : (s.xp / (s.lvl * 60)) * 100}%"></i></div><span class="small muted">${COURSES[k].desc}</span>${btn('Practice · 15', 'practice', k, 'sm', S.energy < 15 || s.lvl >= 10)}</div>`).join('')}</div></div>`;
}
function statsBody() {
  const t = totalFollowers(), posts = S.posts;
  const avg = posts.length ? posts.reduce((a, p) => a + p.views, 0) / posts.length : 0;
  const maxF = Math.max(...unlockedIds().map((id) => S.platforms[id].followers), 1);
  const kpi = (l, v, cls = '') => `<div class="statcell"><div class="k">${l}</div><div class="v ${cls}">${v}</div></div>`;
  const top = posts.slice().sort((a, b) => b.views - a.views).slice(0, 5);
  return `<div class="sect"><div class="statgrid" style="border-radius:16px;overflow:hidden">${kpi('Real followers', fmt(t - S.fake))}${kpi('Avg views', fmt(avg))}${kpi('Best post', fmt(S.stats.bestViews))}${kpi('Viral hits', S.stats.viral, 'gold')}${kpi('Lifetime $', money(S.stats.earned), 'good')}${kpi('Deals', S.stats.deals)}${kpi('Collabs', S.stats.collabs)}${kpi('Streams', S.stats.streams)}${kpi('Energy earned', fmt(S.stats.energyEarned || 0), 'gold')}${kpi('Best streak', Math.max(S.stats.bestStreak || 0, S.streak || 0) + 'd')}${kpi('Cancellations', S.stats.cancels, S.stats.cancels ? 'bad' : '')}</div></div>
    <div class="sect"><div class="row between"><h3>History</h3><div class="scroller">${[['f', 'Followers'], ['rep', 'Rep'], ['m', 'Money'], ['e', 'Engagement'], ['h', 'Heat']].map(([k, l]) => chip(l, 'metric', k, ui.metric === k)).join('')}</div></div><div class="chart-box"><canvas id="chart" aria-label="History chart"></canvas></div></div>
    <div class="sect"><h3>Followers by platform</h3><div class="bars">${Object.keys(PLATFORMS).map((id) => { const p = S.platforms[id]; return `<div class="bar-row"><span>${pdot(id)} ${PLATFORMS[id].name}</span><div class="track"><i style="width:${p.unlocked ? (p.followers / maxF) * 100 : 0}%;background:${PLATFORMS[id].color}"></i></div><span class="n">${p.unlocked ? fmt(p.followers) : 'Locked'}</span></div>`; }).join('')}</div></div>
    <div class="sect"><h3>Audience by country</h3><div class="bars">${Object.entries(S.geo || {}).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cc, v]) => `<div class="bar-row"><span>${COUNTRIES[cc].flag} ${esc(COUNTRIES[cc].name)}</span><div class="track"><i style="width:${Math.round(v * 100)}%;background:var(--accent)"></i></div><span class="n">${Math.round(v * 100)}%</span></div>`).join('')}</div></div>
    <div class="sect"><h3>Top posts</h3>${top.length ? top.map((p) => `<div class="row between small" data-act="open" data-arg="post:${p.id}" style="cursor:pointer;flex-wrap:nowrap"><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.caption)}</span><b class="num">${fmt(p.views)}</b></div>`).join('') : '<p class="muted">No posts yet.</p>'}</div>`;
}
function vStats() { return `<div class="col-head">${head('Analytics', `Day ${S.day}`)}</div>` + statsBody(); }
function drawChart() {
  const cv = $('#chart'); if (!cv) return;
  const box = cv.parentElement, dpr = window.devicePixelRatio || 1, W = box.clientWidth, H = box.clientHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const css = getComputedStyle(document.documentElement), col = (n) => css.getPropertyValue(n).trim();
  const key = ui.metric, data = S.history.map((h) => ({ x: h.d, y: h[key] ?? 0 }));
  const color = { f: col('--accent'), rep: col('--good'), m: col('--gold'), e: col('--like'), h: col('--bad') }[key];
  const fmtY = key === 'm' ? money : key === 'e' ? (v) => v.toFixed(1) + '%' : key === 'f' ? fmt : (v) => Math.round(v);
  const pad = { l: 56, r: 12, t: 12, b: 24 };
  g.font = `12px ${col('--f-body')}`;
  if (data.length < 2) { g.fillStyle = col('--muted'); g.fillText('Sleep a night or two to see your history.', pad.l, H / 2); return; }
  let minY = Math.min(...data.map((d) => d.y)), maxY = Math.max(...data.map((d) => d.y));
  if (key === 'rep' || key === 'h') { minY = 0; maxY = 100; }
  if (key === 'f' || key === 'e') minY = Math.min(0, minY);
  if (maxY === minY) maxY = minY + 1;
  const x0 = data[0].x, x1 = data[data.length - 1].x;
  const X = (x) => pad.l + ((x - x0) / Math.max(1, x1 - x0)) * (W - pad.l - pad.r);
  const Y = (y) => pad.t + (1 - (y - minY) / (maxY - minY)) * (H - pad.t - pad.b);
  g.strokeStyle = col('--line'); g.fillStyle = col('--muted'); g.lineWidth = 1;
  for (let i = 0; i <= 4; i++) { const v = minY + ((maxY - minY) * i) / 4, y = Y(v); g.beginPath(); g.moveTo(pad.l, y); g.lineTo(W - pad.r, y); g.stroke(); g.textAlign = 'right'; g.fillText(fmtY(v), pad.l - 8, y + 4); }
  g.textAlign = 'center';
  const steps = Math.min(6, x1 - x0);
  for (let i = 0; i <= steps; i++) { const d = Math.round(x0 + ((x1 - x0) * i) / Math.max(1, steps)); g.fillText('D' + d, X(d), H - 6); }
  const grad = g.createLinearGradient(0, pad.t, 0, H - pad.b); grad.addColorStop(0, color + '55'); grad.addColorStop(1, color + '00');
  g.beginPath(); data.forEach((d, i) => (i ? g.lineTo(X(d.x), Y(d.y)) : g.moveTo(X(d.x), Y(d.y)))); g.lineTo(X(x1), Y(minY)); g.lineTo(X(x0), Y(minY)); g.closePath(); g.fillStyle = grad; g.fill();
  g.beginPath(); data.forEach((d, i) => (i ? g.lineTo(X(d.x), Y(d.y)) : g.moveTo(X(d.x), Y(d.y)))); g.strokeStyle = color; g.lineWidth = 2.4; g.lineJoin = 'round'; g.stroke();
  const last = data[data.length - 1]; g.beginPath(); g.arc(X(last.x), Y(last.y), 4.5, 0, Math.PI * 2); g.fillStyle = color; g.fill();
  g.textAlign = 'right'; g.fillStyle = col('--ink'); g.font = `700 13px ${col('--f-body')}`; g.fillText(fmtY(last.y), Math.min(W - pad.r, X(last.x) - 8), Math.max(pad.t + 12, Y(last.y) - 10));
}
function vTea() {
  return `<div class="col-head">${head('The Tea', 'What everyone is talking about')}</div>${S.news.slice(0, 40).map((n) => `<div class="news ${n.you ? 'you' : ''}">${n.you ? meAv('sm') : `<span class="av sm" style="background:var(--surface-2);color:var(--muted)">${ico('tea')}</span>`}<div style="min-width:0"><div class="small muted">Day ${n.d}${n.you ? ' · About you' : ''}</div><div class="nh">${esc(n.m)}</div></div></div>`).join('')}`;
}
function trophiesBody() {
  const t = totalFollowers(), ti = tierIndex(t);
  return `<div class="sect"><h3>Creator tier</h3><div class="ladder">${TIERS.map((x, i) => `<div class="rung ${i <= ti ? 'on' : ''}"><b>${x.name}</b><span class="muted">${fmt(x.min)}+</span></div>`).join('')}</div>
      ${ti < TIERS.length - 1 ? `<span class="small muted">${fmt(TIERS[ti + 1].min - t)} followers to ${TIERS[ti + 1].name}. Win: 100M followers with 60+ reputation.</span>` : '<span class="small gold">Top tier reached.</span>'}</div>
    ${(S.awards || []).length ? `<div class="sect"><h3>Clout Awards</h3><div class="row">${S.awards.map((a) => `<span class="pill gold">${esc(a.cat)} · Day ${a.d}</span>`).join('')}</div></div>` : ''}
    <div class="sect"><h3>Achievements · ${ACHIEVEMENTS.filter(([id]) => S.achievements[id]).length}/${ACHIEVEMENTS.length}</h3><div class="cards">${ACHIEVEMENTS.map(([id, name, desc]) => { const on = S.achievements[id]; return `<div class="card ach ${on ? 'on' : 'off'}" style="flex-direction:row"><span class="medal">${on ? ico('star') : ico('lock')}</span><div><b>${name}</b><div class="small muted">${desc}${on ? ` · Day ${on}` : ''}</div></div></div>`; }).join('')}</div></div>`;
}
function vTrophies() { return `<div class="col-head">${head('Trophies')}</div>` + trophiesBody(); }
function vAccount() {
  const th = S.settings.theme || 'system';
  return `<div class="col-head">${head('Settings')}</div>
    <div class="sect"><h3>Display</h3><div class="row">${[['system', 'Match device'], ['dark', 'Dark'], ['light', 'Light']].map(([k, l]) => chip(l, 'theme', k, th === k)).join('')}</div>
      <label class="row"><input type="checkbox" id="optSound" data-act="sound" ${S.settings.sound ? 'checked' : ''}> Sound effects</label></div>
    <div class="sect"><h3>Save</h3><p class="small muted">The game saves automatically in this browser. Copy a save code to move your progress to another device.</p>
      <div class="row">${btn('Generate save code', 'exportSave', '', 'sm')}${ui.exportCode ? btn('Copy code', 'copySave', '', 'sm blue') : ''}</div>
      ${ui.exportCode ? `<textarea class="input small" id="exportBox" readonly rows="3" style="font-family:var(--f-mono)">${esc(ui.exportCode)}</textarea>` : ''}
      <label class="label" for="importBox">Load a save code</label><textarea class="input small" id="importBox" rows="2" placeholder="Paste a save code" style="font-family:var(--f-mono)"></textarea><div>${btn('Load save', 'importSave', '', 'sm')}</div></div>
    <div class="sect"><h3>Start over</h3>${ui.confirmRestart ? `<p>This deletes your account for good.</p><div class="row">${btn('Yes, delete and restart', 'restart', 'yes', 'danger')}${btn('Cancel', 'restart', 'no')}</div>` : `<div>${btn('Delete account and restart', 'restart', '', 'danger')}</div>`}</div>
    <div class="sect"><h3>How to play</h3><div class="small" style="display:flex;flex-direction:column;gap:8px">
      <p><b>Post</b> by writing anything. The game reads your tone from your words (you can override it), picks up hashtags, and shows a forecast before you publish.</p>
      <p><b>Every action</b> changes your stats. Watch the pop-ups at the top of the screen.</p>
      <p><b>Energy</b> comes back when things go well: posts fans love, viral hits, milestones, new tiers, achievements, skill levels, deals, collabs and stars following you. Daily posting streaks add morning energy, and milestones raise your max for good.</p>
      <p><b>Sleep</b> to end the day: growth, income, salaries, trends, DMs and random events happen overnight.</p>
      <p><b>Heat</b> at 100 gets you cancelled. <b>Reputation</b> at 0 gets you deplatformed. <b>Stress</b> at 100 burns you out.</p>
      <p><b>Stars</b> answer DMs, reply to your posts, collab, date, and feud. Be nice, be funny, or be messy.</p>
      <p><b>Clashes</b>: stars feud with each other in public. Back a side (pay off if they win), broker peace, stir the pot, or post about it for huge reach. You can also challenge any star to a three-round clash battle from their profile.</p>
      <p><b>Creativity</b>: write your own words for a higher originality score (more reach and viral chance), pick a look for photos and videos (this week's trending look gets +12% reach), and complete the daily creative challenge.</p>
      <p class="muted">Parody stars and companies with tweaked names are satire. Everything they say and do here is invented.</p>
      <p><b>Spicy mode is always on</b>: the more famous you get, the more often scandals hit, fame costs money every day, three weak posts in a row start "did they fall off?" discourse, and you can collect and spill tea on stars.</p>
      <p><b>Win</b> with 100M followers and 60+ reputation. Keyboard: N opens the composer, Ctrl/Cmd+E sleeps.</p></div></div>`;
}
function applyTheme() {
  const th = S && S.settings.theme;
  if (th === 'dark' || th === 'light') document.documentElement.setAttribute('data-theme', th); else document.documentElement.removeAttribute('data-theme');
}

/* ======================================================================
   Compose sheet
   ====================================================================== */
function openCompose(preset = {}) {
  if (!S || modalBusy) return;
  const last = ui.c || {};
  ui.c = { platform: last.platform && S.platforms[last.platform] && S.platforms[last.platform].unlocked ? last.platform : 'pix', format: null, topic: 'niche', topicManual: false, toneMode: 'auto', effort: last.effort || 'normal', time: last.time || 'prime', text: '', disclose: true, opts: false, filter: last.filter === undefined ? null : last.filter, intents: {}, ...preset };
  $('#composeWrap').hidden = false;
  renderCompose(true);
}
function closeCompose() { $('#composeWrap').hidden = true; }
/* Same content on every unlocked platform, each in its best format */
function crossPlan(o) {
  const plats = [o.platform, ...unlockedIds().filter((p) => !SPECIAL_PLATS.has(p) && p !== o.platform)];
  return plats.map((pid, i) => {
    if (i === 0) return o;
    const format = CROSS_FORMAT[pid](o.format);
    const special = /^(deal:|collab|tea:|diss:|duet:)/.test(o.topic);
    return { ...o, platform: pid, format, topic: special ? 'niche' : o.topic, intents: {}, img: hasLook(format) ? o.img : null, poll: format === 'poll' ? o.poll : null };
  });
}
const CROSS_DISCOUNT = 0.65;
function composeMentions() {
  const t = (ui.c && ui.c.text) || '';
  return [...mentionedNpcs(t).slice(0, 2).map((id) => ({ kind: 'npc', id })), ...mentionedCompanies(t).slice(0, 2).map((id) => ({ kind: 'co', id }))];
}
function currentIntents() {
  const out = {}; const c = ui.c; if (!c) return out;
  for (const m of composeMentions()) out[m.kind + ':' + m.id] = (c.intents || {})[m.kind + ':' + m.id] || 'tag';
  return out;
}
function mentionPanel() {
  const ms = composeMentions(); if (!ms.length) return '';
  const ints = currentIntents();
  return `<div class="mention-panel">${ms.map((m) => {
    const key = m.kind + ':' + m.id, it = ints[key];
    const E = m.kind === 'co' ? COMPANIES[m.id] : NPCS[m.id];
    const label = m.kind === 'co' ? `${CO_STYLES[coStyle(m.id)].name} brand` : `${ARCHETYPES[archetype(m.id)].name} · ${STANCE[stanceOf(m.id)][0]}`;
    const opts = [['tag', 'Just tag'], ['shout', 'Shout out'], ['collab', m.kind === 'co' ? 'Pitch sponsorship' : 'Pitch collab'], ['beef', m.kind === 'co' ? 'Call them out' : 'Start beef']];
    return `<div class="mp-row">${m.kind === 'co' ? coAv(m.id, 'sm') : npcAv(m.id, 'sm')}<div style="flex:1;min-width:0"><div class="row" style="gap:6px"><b>${esc(E.name)}</b><span class="pill ${m.kind === 'npc' ? STANCE[stanceOf(m.id)][1] : ''}">${esc(label)}</span></div>
      <div class="scroller" style="margin-top:6px">${opts.map(([k, l]) => `<button class="chip ${k === 'beef' ? 'beefchip' : ''}" data-act="cIntent" data-arg="${key}|${k}" aria-pressed="${it === k}">${l}</button>`).join('')}</div>
      <div class="small muted" style="margin-top:4px">${esc(intentHint(m.kind, m.id, it) || '')}</div></div></div>`;
  }).join('')}</div>`;
}
function composeInput() {
  const c = ui.c;
  const tags = parseTags(c.text);
  if (!c.topicManual) {
    const low = c.text.toLowerCase();
    const tr = S.trends.find((t) => tags.includes(t.tag) || low.includes(t.tag.slice(1).toLowerCase()));
    const mention = Object.keys(S.npcs).find((id) => low.includes('@' + NPCS[id].handle));
    if (mention && S.npcs[mention].feud) c.topic = 'diss:' + mention;
    else if (mention && S.collab && S.collab.npc === mention) c.topic = 'collab';
    else if (tr) c.topic = 'trend:' + tr.tag;
    else if (S.partner && low.includes('@' + NPCS[S.partner].handle)) c.topic = 'couple';
    else c.topic = 'niche';
  }
  const tone = c.toneMode === 'auto' ? detectTone(c.text) : c.toneMode;
  return { platform: c.platform, format: c.format, topic: c.topic, tone, effort: c.effort, time: c.time, tags, caption: c.text, disclose: c.disclose, filter: c.filter, img: hasLook(c.format) ? c.img || null : null, intents: currentIntents(), affiliate: !!c.aff, poll: c.format === 'poll' || c.pollOn ? (c.poll || []).map((x) => x.trim()).filter(Boolean).slice(0, 4) : null };
}
function renderCompose(focus) {
  const c = ui.c; if (!c) return;
  if (!S.platforms[c.platform].unlocked) c.platform = 'pix';
  if (!SPECIAL_PLATS.has(c.platform) && (!c.format || FORMATS[c.format].p !== c.platform)) c.format = Object.keys(FORMATS).find((f) => FORMATS[f].p === c.platform && (!c.img || hasLook(f))) || Object.keys(FORMATS).find((f) => FORMATS[f].p === c.platform);
  const topics = topicsFor();
  if (!topics.some((t) => t.id === c.topic)) c.topic = 'niche';
  const plats = Object.entries(PLATFORMS).map(([id, p]) => {
    const ps = S.platforms[id];
    if (!ps.unlocked) return canUnlock(id) ? `<button class="chip" data-act="unlock" data-arg="${id}">${pdot(id)} Join ${p.name}</button>` : `<button class="chip" disabled title="Unlocks at ${fmt(p.unlock)} followers">${ico('lock')} ${p.name} · ${fmt(p.unlock)}</button>`;
    return `<button class="chip" data-act="cPlat" data-arg="${id}" aria-pressed="${c.platform === id}">${pdot(id)} ${p.name} <span class="cost">${fmt(ps.followers)}</span></button>`;
  }).join('');
  let body;
  if (c.platform === 'vault') body = vaultBody();
  else if (c.platform === 'live') {
    body = `<div class="opts" style="border-top:0"><b style="font-size:20px">Go live on Streamly</b><span class="muted">Chat throws surprises at you mid-stream: raids, celebrity drop-ins, sponsor moments. Earn donations, virtual gifts (🌹 to 🪐 Universe at $10K), PR packages and Streamly followers.</span>
      <span class="opt-lbl">Stream theme</span>
      <div class="scroller">${Object.entries(STREAM_THEMES).map(([id, t]) => { const locked = (t.min && totalFollowers() < t.min) || (t.need && !t.need()); return chip(`${t.icon} ${t.name}`, 'cTheme', id, (c.streamTheme || 'chat') === id, locked, locked ? ` <span class="cost">${t.need ? 'needs a star friend' : fmt(t.min) + '+'}</span>` : ''); }).join('')}</div>
      <span class="small muted">${STREAM_THEMES[c.streamTheme || 'chat'].desc} Every theme has its own chat moments, and no two streams in a row play the same ones.</span>
      <div class="cards">${Object.entries(STREAMS).map(([id, s]) => `<div class="card"><div class="t"><span>${s.name}</span><span class="pill blue">${s.e} energy</span></div><span class="small muted">${s.chats} chat moment${s.chats > 1 ? 's' : ''}${s.stress ? ' · extra stress' : ''}</span>${btn(`${ico('live')} Go live`, 'stream', id, 'blue sm', S.energy < s.e)}</div>`).join('')}</div>
      <span class="small muted">Expected viewers: ~${fmt((S.platforms.live.followers * 0.06 + totalFollowers() * 0.002 + 5) * (S.algo.live || 1))}</span></div>`;
  } else {
    const o = composeInput();
    const groups = {};
    topics.forEach((t) => { const g = t.group || 'General'; (groups[g] = groups[g] || []).push(t); });
    const tagSug = [...S.trends.map((t) => t.tag), ...NICHES[S.niche].tags].filter((t) => !o.tags.includes(t)).slice(0, 8);
    const cur = topics.find((t) => t.id === c.topic);
    body = `<div class="compose-body">${meAv()}<div>
        <textarea id="cText" maxlength="280" placeholder="What's happening?" aria-label="Post text">${esc(c.text)}</textarea>
        <div class="scroller" style="margin-bottom:8px">${tagSug.map((t) => `<button class="chip" data-act="cTag" data-arg="${esc(t)}" style="color:var(--accent)">${esc(t)}</button>`).join('')}</div>
        ${c.img ? `<div class="thumb"><img src="${c.img}" alt="Your photo" style="filter:${c.filter ? LOOK_CSS[c.filter] : 'none'}"><button class="icon-btn" data-act="cImgRemove" aria-label="Remove photo">${ico('x')}</button></div>` : ''}
        <div class="row" style="margin-bottom:6px"><label class="chip" style="color:var(--accent)">${ico('image')} ${c.img ? 'Change photo' : 'Add your photo'}<input type="file" id="cFile" accept="image/*" hidden></label>${c.format !== 'poll' ? `<button class="chip" data-act="cPoll" aria-pressed="${!!c.pollOn}" style="color:var(--accent)">${ico('chart')} ${c.pollOn ? 'Remove poll' : 'Add poll'}</button>` : ''}<button class="chip" data-act="cAff" aria-pressed="${!!c.aff}" style="color:var(--gold)" title="Earn a commission on views. Slightly lower engagement and reputation.">${ico('cash')} ${c.aff ? 'Affiliate link on' : 'Affiliate link'}</button><span class="small muted">Your own photo: +8 originality, +8% quality</span></div>
        ${c.format === 'poll' || c.pollOn ? `<div class="poll-edit">${[0, 1, 2, 3].map((i) => `<input class="input" id="pollOpt${i}" data-i="${i}" maxlength="28" placeholder="Option ${i + 1}${i > 1 ? ' (optional)' : ''}" value="${esc((c.poll || [])[i] || '')}">`).join('')}<span class="small muted">Polls get the most replies on Chirp. Fans vote and argue.</span></div>` : ''}
        <div id="cLive"></div>
        <div id="cMentions">${mentionPanel()}</div>
      </div></div>
      <div class="opts">
        ${hasLook(c.format) ? `<span class="opt-lbl">Look · this week everyone is posting <span class="gold">${FILTERS[S.aesthetic].name}</span></span><div class="scroller">${chip('None', 'cLook', '', !c.filter)}${Object.entries(FILTERS).map(([k, f]) => `<button class="chip" data-act="cLook" data-arg="${k}" aria-pressed="${c.filter === k}" title="${esc(f.desc)}"><span class="swatch-mini" style="background:linear-gradient(135deg, ${f.g[0]}, ${f.g[1]})"></span>${f.name}${k === S.aesthetic ? '<span class="cost">trending</span>' : ''}</button>`).join('')}</div>${c.filter ? `<span class="small muted">${esc(FILTERS[c.filter].desc)}${c.filter === S.aesthetic ? ' · on trend: +12% reach' : ''}</span>` : ''}` : ''}
        <div class="row between"><span class="opt-lbl">Tone ${c.toneMode === 'auto' ? '· read from your words' : '· set by you'}</span>${c.toneMode !== 'auto' ? `<button class="chip" data-act="cTone" data-arg="auto">Back to auto</button>` : ''}</div>
        <div class="scroller">${Object.entries(TONES).map(([id, t]) => `<button class="chip" data-act="cTone" data-arg="${id}" aria-pressed="${o.tone === id}" title="${esc(t.desc)}">${t.name}</button>`).join('')}</div>
        <span class="opt-lbl">About ${c.topicManual ? '· set by you' : '· picked from your hashtags and mentions'}</span>
        <div class="scroller">${Object.values(groups).flat().map((t) => `<button class="chip" data-act="cTopic" data-arg="${esc(t.id)}" aria-pressed="${c.topic === t.id}">${t.group && t.group !== 'Trend' ? `<span class="cost">${t.group}</span>` : ''}${esc(t.label)}</button>`).join('')}</div>
        ${cur && cur.deal ? `<label class="row small"><input type="checkbox" data-act="cDisclose" ${c.disclose ? 'checked' : ''}> Add #ad disclosure <span class="muted">(skipping it boosts engagement, risks a fine)</span></label>` : ''}
        <button class="chip" data-act="cOpts" style="align-self:flex-start">${c.opts ? 'Hide' : 'More'} post settings</button>
        ${c.opts ? `<span class="opt-lbl">Format</span><div class="scroller">${Object.entries(FORMATS).filter(([, f]) => f.p === c.platform).map(([id, f]) => chip(f.name, 'cFmt', id, c.format === id, false, `<span class="cost">${Math.round(f.e * EFFORT[c.effort].e * (f.video ? Math.max(0.5, 1 - 0.2 * tm('editor')) : 1))}</span>`)).join('')}</div>
          <span class="opt-lbl">Effort</span><div class="scroller">${Object.entries(EFFORT).map(([id, e]) => chip(e.name, 'cEffort', id, c.effort === id)).join('')}</div>
          <span class="opt-lbl">Post time</span><div class="scroller">${Object.entries(TIMES).map(([id, e]) => chip(e.name, 'cTime', id, c.time === id)).join('')}</div>` : `<span class="small muted">${FORMATS[c.format].name} · ${EFFORT[c.effort].name} effort · ${TIMES[c.time].name}</span>`}
      </div>`;
  }
  $('#compose').innerHTML = `<div class="sheet-head"><button class="icon-btn" data-act="closeCompose" aria-label="Close">${ico('x')}</button><span class="small muted">Day ${S.day} · ${Math.round(S.energy)} energy left</span>${SPECIAL_PLATS.has(c.platform) ? '<span style="width:36px"></span>' : `<button class="icon-btn" data-act="cSuggest" title="Write one for me" aria-label="Suggest a post">${ico('dice')}</button>`}</div>
    <div class="opts" style="border-top:0;padding-top:0"><span class="opt-lbl">Post to</span><div class="scroller">${!SPECIAL_PLATS.has(c.platform) && unlockedIds().filter((x) => !SPECIAL_PLATS.has(x)).length > 1 ? `<button class="chip allchip" data-act="cCross" aria-pressed="${!!c.cross}">${ico('repost')} All platforms</button>` : ''}${plats}</div>${c.cross && !SPECIAL_PLATS.has(c.platform) ? `<span class="small muted">Cross-posting: ${crossPlan({ platform: c.platform, format: c.format, topic: c.topic }).map((x) => `${PLATFORMS[x.platform].name} (${FORMATS[x.format].name})`).join(' · ')}. 35% energy discount. The platform you pick first gets your mentions, deals and special topics.</span>` : ''}</div>
    ${body}
    ${SPECIAL_PLATS.has(c.platform) ? '' : `<div class="compose-foot"><div class="forecast" id="cForecast"></div><button class="btn primary big" id="cPost" data-act="cPost">Post</button></div>`}`;
  $$('.poll-edit input').forEach((inp) => inp.addEventListener('input', () => { c.poll = c.poll || []; c.poll[+inp.dataset.i] = inp.value; updateComposeLive(); }));
  const fileIn = $('#cFile');
  if (fileIn) fileIn.addEventListener('change', async () => { const f = fileIn.files && fileIn.files[0]; if (!f) return; try { c.img = await resizeImage(f); if (!hasLook(c.format)) c.format = Object.keys(FORMATS).find((k) => FORMATS[k].p === c.platform && hasLook(k)); renderCompose(false); } catch (e) { toast('That file could not be read as an image.', 'bad'); } });
  const ta = $('#cText');
  if (ta) {
    attachMentions(ta);
    ta.addEventListener('input', () => { c.text = ta.value; updateComposeLive(); const mp = $('#cMentions'); const sig = composeMentions().map((m) => m.kind + m.id).join(); if (mp && mp.dataset.sig !== sig) { mp.dataset.sig = sig; mp.innerHTML = mentionPanel(); } });
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); ACT_RUN('cPost'); } });
    if (focus) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
  }
  updateComposeLive();
}
function updateComposeLive() {
  const c = ui.c; if (!c || SPECIAL_PLATS.has(c.platform)) return;
  const o = composeInput();
  const r = computePost(o, true);
  const T = TONES[o.tone];
  const useful = o.tags.filter((t) => tagValue(t) > 0).length;
  const live = $('#cLive');
  const meets = S.challenge && !S.challenge.done && c.text.trim() && challengeMet(S.challenge.req, o, r, { filter: hasLook(o.format) && o.filter ? o.filter : null, mentions: mentionedNpcs(o.caption) });
  if (live) live.innerHTML = `<div class="row small"><span class="pill ${r.orig >= 75 ? 'good' : r.orig < 40 ? 'bad' : 'warn'}" title="Your own words, questions, emoji and @mentions raise it. Repeating yourself or using the dice lowers it.">Originality ${r.orig}</span>${meets ? `<span class="pill gold">${ico('sparkle')} Completes today's challenge</span>` : ''}<span class="pill ${T.rep >= 1 ? 'good' : T.rep < 0 ? 'bad' : ''}">Tone: ${T.name}</span><span class="pill blue">${esc(r.topic.label)}</span>${useful ? `<span class="pill good">${useful} useful tag${useful > 1 ? 's' : ''}</span>` : ''}${o.tags.length > 4 ? '<span class="pill warn">Too many hashtags</span>' : ''}<span class="muted">${280 - c.text.length}</span></div>`;
  const fc = $('#cForecast');
  if (fc) fc.innerHTML = `<span><b>~${fmt(r.views)}</b> views</span><span><b class="${r.gain - r.loss >= 0 ? 'good' : 'bad'}">${signed(r.gain - r.loss)}</b> followers</span><span><b class="gold">+${r.refund}</b> energy back</span><span><b>${(r.viralP * 100).toFixed(1)}%</b> viral</span><span>Rep <b class="${r.rep >= 1 ? 'good' : r.rep <= -1 ? 'bad' : ''}">${r.rep >= 1 ? 'up' : r.rep <= -1 ? 'down' : 'flat'}</b></span><span>Heat <b class="${r.heat > 8 ? 'bad' : r.heat > 0 ? 'warn' : 'good'}">${r.heat > 8 ? 'spicy' : r.heat > 0 ? 'warm' : 'safe'}</b></span>${S.shadowbanUntil >= S.day ? '<span class="bad">Shadowbanned</span>' : ''}`;
  let need = r.energy;
  if (c.cross) {
    const rs = crossPlan(o).map((x) => computePost(x, true));
    need = Math.round(rs.reduce((a, x) => a + x.energy, 0) * CROSS_DISCOUNT);
    if (fc) fc.innerHTML = `<span><b>${rs.length}</b> platforms</span><span><b>~${fmt(rs.reduce((a, x) => a + x.views, 0))}</b> views</span><span><b class="good">${signed(rs.reduce((a, x) => a + x.gain - x.loss, 0))}</b> followers</span><span><b class="gold">+${rs.reduce((a, x) => a + x.refund, 0)}</b> energy back</span><span>Heat <b class="${r.heat > 8 ? 'bad' : r.heat > 0 ? 'warn' : 'good'}">${r.heat > 8 ? 'spicy' : r.heat > 0 ? 'warm' : 'safe'}</b></span>`;
  }
  if ((o.format === 'poll' || c.pollOn) && (!o.poll || o.poll.length < 2) && fc) fc.innerHTML += '<span class="warn">Add at least 2 poll options</span>';
  const pb = $('#cPost');
  if (pb) { pb.textContent = `Post${c.cross ? ' everywhere' : ''} · ${need}`; pb.disabled = S.energy < need || S.hackedUntil >= S.day || ((o.format === 'poll' || c.pollOn) && (!o.poll || o.poll.length < 2)); pb.title = S.energy < r.energy ? 'Not enough energy. Sleep to recharge.' : ''; }
  $$('[data-act="cTopic"]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.arg === c.topic));
  $$('[data-act="cTone"]').forEach((b) => { if (b.dataset.arg !== 'auto') b.setAttribute('aria-pressed', b.dataset.arg === o.tone); });
}

/* ======================================================================
   Drawer (phone career menu)
   ====================================================================== */
function openDrawer() {
  const following = Object.values(S.npcs).filter((n) => n.following).length;
  const b = badges();
  $('#drawer').innerHTML = `<div class="drawer" role="dialog" aria-label="Menu">
    <div style="padding:4px 12px 12px">${meAv('lg')}<div style="margin-top:8px"><b style="display:flex;gap:4px;align-items:center;font-size:17px">${esc(S.name)} ${meBadge()}</b><span class="muted">@${esc(S.handle)}</span></div>
      <div class="row small" style="margin-top:8px"><span><b>${following}</b> <span class="muted">Following</span></span><span><b>${fmt(totalFollowers())}</b> <span class="muted">Followers</span></span></div></div>
    ${HUBS.map(([id, name, icon, tabs]) => `<button class="nav-item" style="font-size:18px;width:100%" data-act="go" data-arg="${id}">${ico(icon, 'ico-lg')}<span>${name}<span class="small muted" style="display:block;font-size:12px">${tabs.map(careerName).join(' · ')}</span></span>${hubBadge([id, name, icon, tabs], b) ? `<span class="pill blue" style="margin-left:auto">${hubBadge([id, name, icon, tabs], b)}</span>` : ''}</button>`).join('')}
    <div class="nav-sep"></div><button class="btn big" data-act="endDay" style="margin:8px 12px">${ico('moon')} Sleep · end day ${S.day}</button></div>`;
  $('#drawer').hidden = false;
}

/* ======================================================================
   Actions
   ====================================================================== */
function needEnergy(n) { if (S.energy < n) { toast(`You need ${n} energy. Sleep to recharge.`, 'bad'); return false; } S.energy -= n; S.stress = clamp(S.stress + n * 0.08, 0, 100); return true; }
function once(key) { if (S.flags[key] === S.day) { toast('Already done today.', 'bad'); return false; } S.flags[key] = S.day; return true; }
function ratio(id) { return Math.min(1, totalFollowers() / S.npcs[id].followers); }
function openView(v) { ui.hist.push({ tab, view: ui.view }); ui.view = v; window.scrollTo({ top: 0 }); }

const ACT = {
  noop: () => 'norender',
  go: (a) => { const hb = HUBS.find((h) => h[0] === a); if (hb) a = (ui.hubLast && ui.hubLast[hb[0]]) || hb[3][0]; tab = a; ui.view = null; ui.hist = []; $('#drawer').hidden = true; window.scrollTo({ top: 0 }); if (a === 'notifs') setTimeout(() => { if (!S) return; S.notifs.forEach((n) => { n.read = true; }); renderSidebar(); renderTabbar(); save(); }, 1500); },
  back: () => { const h = ui.hist.pop(); if (h) { tab = h.tab; ui.view = h.view; } else ui.view = null; },
  open: (a) => {
    const i = a.indexOf(':'); if (i < 0) return 'norender';
    const type = a.slice(0, i), id = a.slice(i + 1);
    if (type === 'post') openView({ type: 'post', id: +id });
    else if (type === 'npcpost') openView({ type: 'post', id: +id, npc: true });
    else if (type === 'star') openView({ type: 'star', id });
    else if (type === 'dm') openView({ type: 'dm', key: id });
    else return 'norender';
  },
  openDm: (a) => { S.npcs[a].dmOpen = true; openView({ type: 'dm', key: 'npc:' + a }); },
  drawer: () => { openDrawer(); return 'norender'; },
  endDay: () => { $('#drawer').hidden = true; closeCompose(); endDay(); sound('click'); processQueue(); },
  feedTab: (a) => { ui.feedTab = a; }, notifTab: (a) => { ui.notifTab = a; }, profTab: (a) => { ui.profTab = a; }, metric: (a) => { ui.metric = a; },
  readNotifs: () => { S.notifs.forEach((n) => { n.read = true; }); },
  editBio: () => { ui.editBio = !ui.editBio; },
  compose: (a) => { openCompose(a && S.platforms[a] && S.platforms[a].unlocked ? { platform: a } : {}); return 'norender'; },
  composeTag: (a) => { const tr = S.trends.find((t) => t.tag === a); openCompose({ text: a + ' ', topic: tr ? 'trend:' + tr.tag : 'niche' }); return 'norender'; },
  closeCompose: () => { closeCompose(); return 'norender'; },
  cPlat: (a) => { ui.c.platform = a; ui.c.format = null; renderCompose(false); return 'norender'; },
  cFmt: (a) => { ui.c.format = a; renderCompose(false); return 'norender'; },
  cTopic: (a) => { ui.c.topic = a; ui.c.topicManual = true; renderCompose(false); return 'norender'; },
  cTone: (a) => { ui.c.toneMode = a; renderCompose(false); return 'norender'; },
  cEffort: (a) => { ui.c.effort = a; renderCompose(false); return 'norender'; },
  cTime: (a) => { ui.c.time = a; renderCompose(false); return 'norender'; },
  cOpts: () => { ui.c.opts = !ui.c.opts; renderCompose(false); return 'norender'; },
  cDisclose: () => { ui.c.disclose = !ui.c.disclose; renderCompose(false); return 'norender'; },
  cTag: (a) => { const c = ui.c; c.text = (c.text.trimEnd() + ' ' + a + ' ').trimStart(); renderCompose(true); return 'norender'; },
  cSuggest: () => {
    const c = ui.c;
    const ms = composeMentions();
    if (ms.length) {
      const m = ms[0], key = m.kind + ':' + m.id;
      let intent = currentIntents()[key];
      if (intent === 'tag') intent = pick(['tag', 'shout', 'collab']);
      let txt = genMentionText(m.kind, m.id, intent);
      for (const extra of ms.slice(1)) txt += ` @${(extra.kind === 'co' ? COMPANIES : NPCS)[extra.id].handle}`;
      c.text = txt; c.intents = { ...(c.intents || {}), [key]: intent };
      if (c.toneMode === 'auto' && INTENT_TONE[intent]) c.toneMode = INTENT_TONE[intent];
      renderCompose(true); return 'norender';
    }
    const topic = topicsFor().find((t) => t.id === c.topic) || topicsFor()[0];
    const tone = c.toneMode === 'auto' ? pick(['authentic', 'funny', 'wholesome', 'educational']) : c.toneMode;
    let txt = genCaption({ tone }, topic);
    if (topic.trend && !txt.includes(topic.trend)) txt += ' ' + topic.trend;
    else if (!topic.trend) txt += ' ' + pick(NICHES[S.niche].tags);
    c.text = txt; if (c.toneMode === 'auto') c.toneMode = tone; if (topic.id !== 'niche') c.topicManual = true;
    renderCompose(true); return 'norender';
  },
  cPost: () => {
    const c = ui.c; if (!c) return 'norender';
    if (!c.text.trim()) { toast('Write something first, or tap the dice for an idea.', 'bad'); return 'norender'; }
    const o = composeInput();
    let p;
    if (c.cross && !SPECIAL_PLATS.has(c.platform)) {
      const plan = crossPlan(o);
      const full = plan.reduce((a, x) => a + computePost(x, true).energy, 0), disc = Math.round(full * CROSS_DISCOUNT);
      if (S.energy < disc) { toast(`Cross-posting needs ${disc} energy.`, 'bad'); return 'norender'; }
      S.energy += full - disc;
      p = doPost(plan[0]);
      if (!p) { S.energy -= full - disc; return 'norender'; }
      for (const x of plan.slice(1)) doPost({ ...x, crossOf: p.id });
      log(`Cross-posted to ${plan.length} platforms.`, 'good');
    } else p = doPost(o);
    if (!p) return 'norender';
    closeCompose(); c.text = ''; c.img = null; c.intents = {}; c.poll = []; c.pollOn = false; c.toneMode = 'auto'; c.topicManual = false; c.topic = 'niche';
    tab = 'home'; ui.view = null; ui.hist = []; if (ui.feedTab === 'following') ui.feedTab = 'foryou';
    window.scrollTo({ top: 0 });
    processQueue();
  },
  unlock: (a) => { unlockPlatform(a); if (ui.c && !$('#composeWrap').hidden) { ui.c.platform = a; ui.c.format = null; renderCompose(false); } },
  stream: (a) => { const th = (ui.c && ui.c.streamTheme) || 'chat'; closeCompose(); startStream(a, th); },
  cTheme: (a) => { ui.c.streamTheme = a; renderCompose(false); return 'norender'; },
  dzStunt: (a) => { if (!needEnergy(STUNTS[a].e)) return 'norender'; doStunt(a); checkAll(); processQueue(); },
  dzSpicy: (a) => { const sp = SPICY[a]; if ((sp.min && totalFollowers() < sp.min) || !needEnergy(sp.e)) return 'norender'; doSpicy(a); checkAll(); processQueue(); },
  dzScheme: (a) => { if (!needEnergy(SCHEMES[a].e)) return 'norender'; doScheme(a); checkAll(); processQueue(); },
  rerollChallenge: () => { if (S.flags.rerollDay === S.day || !needEnergy(5)) return 'norender'; S.flags.rerollDay = S.day; const old = S.challenge.text; for (let i = 0; i < 8 && S.challenge.text === old; i++) newChallenge(); toast('New challenge rolled.'); },
  storyOpen: (a) => { openStory(a); return 'norender'; },
  cAff: () => { ui.c.aff = !ui.c.aff; renderCompose(false); return 'norender'; },
  cPoll: () => { ui.c.pollOn = !ui.c.pollOn; renderCompose(false); return 'norender'; },
  cCross: () => { ui.c.cross = !ui.c.cross; renderCompose(false); return 'norender'; },
  duet: (a) => {
    const f = S.feed.find((x) => x.id === +a); if (!f || !f.npc) return 'norender';
    S.duetTarget = f.id;
    const vid = S.platforms.clipz.unlocked ? ['clipz', 'short'] : ['pix', 'reel'];
    openCompose({ platform: vid[0], format: vid[1], topic: 'duet:' + f.id, topicManual: true, cross: false, text: `duet with @${NPCS[f.npc].handle} ` });
    return 'norender';
  },
  spin: () => {
    if (S.flags.spinDay !== S.day) if (typeof questEvent === 'function') questEvent('spin');
    if (S.flags.spinDay === S.day) return 'norender';
    S.flags.spinDay = S.day;
    const w = $('#wheel'); if (w) w.classList.add('spinning');
    const tot = SPIN_PRIZES.reduce((a, x) => a + x.w, 0); let x = Math.random() * tot; let prize = SPIN_PRIZES[0];
    for (const pz of SPIN_PRIZES) { x -= pz.w; if (x <= 0) { prize = pz; break; } }
    setTimeout(() => {
      const s0 = statSnap();
      const t = totalFollowers();
      if (prize.k === 'energy') gainEnergy(35, 'Daily spin');
      if (prize.k === 'money') applyFx({ money: Math.round(Math.max(150, t * 0.02) / 10) * 10 });
      if (prize.k === 'followers') applyFx({ fp: 0.03 });
      if (prize.k === 'boost') { const pid = pick(unlockedIds()); S.algo[pid] = +((S.algo[pid] || 1) * 1.5).toFixed(2); toast(`${PLATFORMS[pid].name} algorithm is hot for you today`, 'gold'); }
      if (prize.k === 'stress') applyFx({ stress: -25 });
      if (prize.k === 'tea') gainTea(pick(Object.keys(NPCS)), 'from a mysterious source');
      if (prize.k === 'mystery') { const pool = Object.entries(EVENTS).filter(([, e]) => e.random && (!e.when || e.when()) && !e.once); const [id, e] = pick(pool); S.queue.push({ ev: id, ctx: e.ctx ? e.ctx() : {} }); }
      if (prize.k === 'nothing') toast('The wheel says: touch grass.');
      S.flags.spinPrize = prize.label;
      checkAll(); save(); flashDelta(s0, statSnap()); renderAll(); processQueue();
    }, 1300);
    return 'norender';
  },
  cIntent: (a) => { const [key, it] = a.split('|'); ui.c.intents = { ...(ui.c.intents || {}), [key]: it }; if (INTENT_TONE[it] && (ui.c.toneMode === 'auto' || Object.values(INTENT_TONE).includes(ui.c.toneMode))) ui.c.toneMode = INTENT_TONE[it]; if (it === 'tag') ui.c.toneMode = 'auto'; renderCompose(false); return 'norender'; },
  dmChip: (a) => { const [id, kind] = a.split(':'); const inp = $('#dmInput'); if (inp) { inp.value = dmTemplate(id, kind); inp.focus(); } return 'norender'; },
  cImgRemove: () => { ui.c.img = null; renderCompose(false); return 'norender'; },
  composeAt: (a) => { openCompose({ text: '@' + a + ' ' }); return 'norender'; },
  travel: (a) => { if (!needEnergy(25)) return 'norender'; if (!travelTo(a)) { S.energy += 25; return 'norender'; } checkAll(); },
  teaSpill: (a) => { openCompose({ topic: 'tea:' + a, topicManual: true, text: 'not me finding out that ' }); return 'norender'; },
  teaDrop: (a) => { S.tea = S.tea.filter((t) => t.id !== +a); changeRep(0.5); toast('Some things stay in the group chat.'); },
  cLook: (a) => { ui.c.filter = a || null; renderCompose(false); return 'norender'; },
  clashSide: (a) => { const [id, side] = a.split(':'); const c = S.clashes.find((x) => x.id === +id); if (!c || c.done || c.side || !needEnergy(5)) return 'norender'; clashSide(c, side); checkAll(); processQueue(); },
  clashPeace: (a) => { const c = S.clashes.find((x) => x.id === +a); if (!c || c.done || c.side || !needEnergy(15)) return 'norender'; if (!clashPeace(c)) toast(`Nobody asked you, said both of them.`, 'bad'); else toast('You got them to hug it out!', 'gold'); checkAll(); },
  clashStir: (a) => { const c = S.clashes.find((x) => x.id === +a); if (!c || c.done || !needEnergy(5)) return 'norender'; clashStir(c); checkAll(); processQueue(); },
  clashMeme: (a) => { const c = S.clashes.find((x) => x.id === +a); if (!c) return 'norender'; openCompose({ topic: 'clash:' + c.id, topicManual: true, text: `@${NPCS[c.a].handle} vs @${NPCS[c.b].handle} ` }); return 'norender'; },
  battle: (a) => { if (!needEnergy(20)) return 'norender'; startBattle(a); processQueue(); },
  like: (a) => {
    const f = S.feed.find((x) => x.id === +a); if (!f || f.liked || !needEnergy(1)) return 'norender';
    f.liked = true; f.likes++; if (f.npc) changeRel(f.npc, 1.5);
  },
  repost: (a) => {
    const f = S.feed.find((x) => x.id === +a); if (!f || f.reposted || !needEnergy(2)) return 'norender';
    f.reposted = true; f.reposts = (f.reposts || 0) + 1; if (f.npc) { changeRel(f.npc, 2.5); addFollowers(Math.min(S.npcs[f.npc].followers * 0.000004, Math.max(20, totalFollowers() * 0.01))); }
  },
  npcReply: (a) => {
    const f = S.feed.find((x) => x.id === +a); if (!f || f.commented) return 'norender';
    const text = (($('#replyText') || {}).value || '').trim(); if (!text) { toast('Write a reply first.', 'bad'); return 'norender'; }
    if (!needEnergy(3)) return 'norender';
    f.commented = true; f.myReply = text;
    const kind = classifyReply(text), n = S.npcs[f.npc], N = NPCS[f.npc];
    const vis = Math.min(n.followers * 0.00002 * rnd(0.5, 2), Math.max(totalFollowers() * 0.2, 150));
    remember('npc', f.npc, kind === 'troll' ? 'troll' : kind === 'nice' ? 'praise' : 'dm', kind === 'troll' ? -0.3 : kind === 'nice' ? 0.12 : 0.03);
    if (chance(kind === 'troll' ? 0.7 : 0.6)) f.replyBack = pick(STAR_BACK[kind][archetype(f.npc)]);
    if (chance(0.3)) { const others = Object.keys(S.npcs).filter((x) => x !== f.npc && (S.npcs[x].rel >= 30 || S.npcs[x].feud)); if (others.length) { const o2 = pick(others); f.chime = { npc: o2, text: S.npcs[o2].feud ? pick(['of course they showed up here', 'nobody asked you', 'ratio']) : pick(['facts', 'this reply is everything', 'LMAO']) }; } }
    if (kind === 'nice') { changeRel(f.npc, 3); addFollowers(vis * 0.2); f.replyResult = { good: true, text: `${N.name.split(' ')[0]} liked your reply` }; gainEnergy(2, `${N.name.split(' ')[0]} liked your reply`); }
    if (kind === 'funny') {
      if (chance(0.3 + skillLvl('charisma') * 0.05)) { changeRel(f.npc, 4); addFollowers(vis * diffM()); addXp('charisma', 6); f.replyResult = { good: true, text: 'Top reply! Their fans found you.' }; gainEnergy(8, 'Your reply took off'); log(`Top reply on ${N.name}'s post.`, 'good'); notify('like', f.npc, 'liked your reply', { npc: true }); }
      else f.replyResult = { good: false, text: 'The joke got 3 likes. One was your mom.' };
    }
    if (kind === 'promo') { changeRel(f.npc, -3); addFollowers(vis * 0.4); changeRep(-0.3); f.replyResult = { good: false, text: 'Some clicks, lots of eye-rolls' }; }
    if (kind === 'troll') { changeRel(f.npc, -12); addFollowers(vis * 1.5 * diffM()); changeRep(-1.5 * sev()); S.heat = clamp(S.heat + 6, 0, 100); f.replyResult = { good: false, text: `${N.name.split(' ')[0]}'s fans are coming for you` }; if (chance(N.drama * 0.3)) S.queue.push({ ev: 'npc_callout', ctx: { npc: f.npc } }); }
    checkAll(); processQueue();
  },
  engage: (a) => {
    const [pid, i, kind] = a.split(':'); const p = S.posts.find((x) => x.id === +pid); const c = p && p.comms[+i];
    if (!c || c.mine) return 'norender';
    if (kind === 'heart') { c.likes = (c.likes || 0) + 1; c.mine = '♥'; unlockedIds().forEach((id) => { S.platforms[id].eng = clamp(S.platforms[id].eng + 0.02, 0.5, 30); }); if (c.npc) changeRel(c.npc, 1); return; }
    if (!needEnergy(2)) return 'norender';
    if (kind === 'thanks') { c.mine = pick(['thank you!! means a lot', 'love you for this', 'you are the best']); changeRep(0.3); gainEnergy(3, 'Fan love'); unlockedIds().forEach((id) => { S.platforms[id].eng = clamp(S.platforms[id].eng + 0.06, 0.5, 30); }); if (c.npc) changeRel(c.npc, 3); }
    if (kind === 'clap') { c.mine = pick(['and yet here you are', 'ratio + you fell off', 'imagine being this pressed']); changeRep(-0.8 * sev()); S.heat = clamp(S.heat + 4, 0, 100); addFollowers(Math.max(3, totalFollowers() * 0.002)); if (c.npc) changeRel(c.npc, -8); }
    if (kind === 'kind') { c.mine = pick(['sorry you feel that way, hope your day gets better', 'appreciate the feedback anyway!', 'sending love regardless']); changeRep(0.8); if (chance(0.3)) toast('They deleted their reply and followed you.'); }
    if (c.npc && chance(0.8)) { const k = kind === 'clap' ? 'troll' : 'nice'; c.back = pick(STAR_BACK[k][archetype(c.npc)]); remember('npc', c.npc, k === 'troll' ? 'troll' : 'praise', k === 'troll' ? -0.2 : 0.1); if (k === 'troll' && ['hothead', 'wildcard'].includes(archetype(c.npc)) && chance(0.3)) S.queue.push({ ev: 'npc_callout', ctx: { npc: c.npc } }); }
    if (c.co && chance(0.85)) { c.back = kind === 'clap' ? (COMPANIES[c.co].roast ? pick(['you replied to a brand account to lose an argument?', 'we have a team of 12 for this. you have you.', 'cute. anyway, buy our stuff']) : 'We hear you and appreciate your feedback.') : pick(['🫶', 'love this energy', 'you\'re one of the good ones', 'DM us 👀']); if (kind !== 'clap' && chance(0.12)) pitchBrand(c.co); }
    processQueue();
    checkAll();
  },
  follow: (a) => {
    const n = S.npcs[a]; n.following = !n.following;
    if (n.following) {
      if (!n.everFollowed) { changeRel(a, 2); n.everFollowed = true; }
      if (!n.followsYou && chance(clamp(0.05 + n.rel / 120 + ratio(a) * 0.6 - NPCS[a].ego * 0.2, 0.01, 0.9))) { n.followsYou = true; changeRel(a, 3); notify('follow', a, 'followed you back', { npc: true }); log(`${NPCS[a].name} followed you back.`, 'gold'); gainEnergy(8, `${NPCS[a].name} followed you back`); }
    }
  },
  dmSend: (a) => {
    const inp = $('#dmInput'); const text = (inp && inp.value || '').trim(); if (!text) return 'norender';
    if (ui.typing) return 'norender';
    if (!needEnergy(3)) return 'norender';
    const n = S.npcs[a], N = NPCS[a];
    n.dmOpen = true;
    const mine = mail({ type: 'me', npc: a, subject: '', body: text }); mine.read = true; mine.done = true;
    ui.typing = a; save(); renderAll();
    const s0 = statSnap();
    setTimeout(() => {
      if (!S) return;
      ui.typing = null;
      const kind = classifyReply(text), low = text.toLowerCase();
      let p = clamp(0.15 + n.rel / 150 + ratio(a) * 0.6 - N.ego * 0.25 + (S.rep - 50) / 200, 0.03, 0.95);
      const say = (body) => { const m = mail({ type: 'npc', npc: a, subject: '', body }); m.read = ui.view && ui.view.key === 'npc:' + a; };
      remember('npc', a, 'dm', kind === 'nice' ? 0.12 : kind === 'troll' ? -0.3 : 0.03);
      if (/sorry|apolog|my bad|i was wrong/.test(low) && (n.feud || n.rel < 0)) {
        const out = askStar(a, 'forgive', 'dm'); toast(out.msg, out.ok ? 'gold' : '');
      } else if (/collab|work together|film something/.test(low) && !n.feud) {
        n.lastAsk = S.day;
        const out = askStar(a, 'collab', 'dm'); toast(out.msg, out.ok ? 'gold' : '');
      } else if (/shout ?out|shout me|mention me/.test(low) && !n.feud) {
        n.lastShout = S.day;
        const out = askStar(a, 'shout', 'dm'); toast(out.msg, out.ok ? 'gold' : '');
      } else if (/\bdate\b|dinner|go out with me/.test(low) && n.rel >= 65 && !S.partner) {
        if (chance(clamp(0.3 + n.rel / 300 + ratio(a) * 0.3, 0.1, 0.9))) { S.partner = a; S.stats.dates++; applyFx({ fp: 0.05 }); news(`It's official: @${S.handle} and ${N.name} are dating`, true); say('I was hoping you would ask. Friday?'); toast(`You and ${N.name} are official!`, 'gold'); gainEnergy(20, 'Butterflies'); sound('viral'); }
        else { changeRel(a, -10); say('aw you are sweet but I think we are better as friends'); }
      } else if (kind === 'troll') {
        changeRel(a, -10); S.heat = clamp(S.heat + 3, 0, 100);
        if (n.rel <= -30 && !n.feud && chance(0.5)) { const res = provoke(a, 'troll'); toast(res.text, 'bad'); }
        if (chance(0.6)) say(pick(['wow ok. blocked.', 'screenshotting this', 'imagine sending this lol']));
        if (chance(N.drama * 0.4)) S.queue.push({ ev: 'npc_callout', ctx: { npc: a } });
      } else {
        if (kind === 'nice') p += 0.1; if (kind === 'promo') p *= 0.5;
        if (kind === 'funny') p += skillLvl('charisma') * 0.02;
        if (chance(p)) { changeRel(a, kind === 'promo' ? 1 : 5); if (kind !== 'promo') gainEnergy(4, `${N.name.split(' ')[0]} replied`); if (n.rel >= 30 && chance(0.15)) gainTea(randomNpc((x) => x !== a), `from ${N.name.split(' ')[0]} in DMs`); say(kind === 'promo' ? pick(['lol I will check it out', 'maybe!']) : kind === 'funny' ? pick(['LMAO', 'ok that was actually funny', 'you are unwell 😂']) : pick(['aw thank you!! that means a lot', 'appreciate you fr', 'omg hi, I actually watch your stuff', 'haha thanks, love what you are doing'])); }
        else { changeRel(a, kind === 'promo' ? -2 : 0); toast(`Seen by ${N.name.split(' ')[0]}`); }
      }
      checkAll(); save(); flashDelta(s0, statSnap()); renderAll(); processQueue();
    }, 900 + Math.random() * 700);
  },
  gift: (a) => { const n = S.npcs[a], cost = giftCost(a); if (!spend(cost)) { toast('Not enough money.', 'bad'); return 'norender'; } n.lastGift = S.day; remember('npc', a, 'gift', archetype(a) === 'diva' ? 0.35 : 0.2); const d = Math.round(rnd(6, 12) * (1 - NPCS[a].ego * 0.4)); changeRel(a, d); toast(`${NPCS[a].name.split(' ')[0]} loved the gift (+${d} relationship)`); },
  collab: (a) => {
    const n = S.npcs[a]; if (!needEnergy(10)) return 'norender'; n.lastAsk = S.day;
    const out = askStar(a, 'collab', 'button'); toast(out.msg, out.ok ? 'gold' : '');
  },
  shout: (a) => {
    const n = S.npcs[a]; if (!needEnergy(5)) return 'norender'; n.lastShout = S.day;
    const out = askStar(a, 'shout', 'button'); toast(out.msg, out.ok ? 'gold' : '');
  },
  feud: (a) => {
    if (!needEnergy(10)) return 'norender';
    const N = NPCS[a];
    applyFx({ fp: clamp(Math.log10(S.npcs[a].followers / Math.max(100, totalFollowers())) * 0.03, 0.01, 0.15), rep: -3, heat: 15 });
    const res = provoke(a, 'callout');
    news(`@${S.handle} calls out ${N.name}. ${res.text}`, true); log(`You called out ${N.name}. ${res.text}`, 'bad'); toast(res.text, 'bad');
    if (S.partner === a) S.queue.push({ ev: 'breakup', ctx: {} });
    checkAll(); processQueue();
  },
  makeup: (a) => {
    if (!needEnergy(10)) return 'norender';
    const out = askStar(a, 'forgive', 'button'); toast(out.msg, out.ok ? 'gold' : '');
    if (out.ok) changeRep(2);
  },
  postAbout: (a) => { const [kind, id, intent] = a.split(':'); const E = kind === 'co' ? COMPANIES[id] : NPCS[id]; openCompose({ text: genMentionText(kind, id, intent) + ' ', intents: { [kind + ':' + id]: intent }, toneMode: INTENT_TONE[intent] || 'auto' }); return 'norender'; },
  date: (a) => {
    const n = S.npcs[a], N = NPCS[a]; if (!needEnergy(10)) return 'norender';
    if (chance(clamp(0.3 + n.rel / 300 + ratio(a) * 0.3, 0.1, 0.9))) { S.partner = a; S.stats.dates++; applyFx({ fp: 0.05 }); news(`It's official: @${S.handle} and ${N.name} are dating`, true); log(`You're dating ${N.name}.`, 'gold'); toast(`You and ${N.name} are official!`, 'gold'); gainEnergy(20, 'Butterflies'); sound('viral'); }
    else { changeRel(a, -10); toast(`${N.name.split(' ')[0]} sees you as a friend.`); }
  },
  breakup: () => { S.queue.push({ ev: 'breakup', ctx: {} }); processQueue(); },
  mact: (a) => {
    const [id, act] = a.split(':'); const m = S.inbox.find((x) => x.id === +id); if (!m || m.done) return 'norender';
    m.read = true;
    const fin = (o) => { m.done = true; m.outcome = o; };
    switch (act) {
      case 'dismiss': fin('Archived'); break;
      case 'reply': if (!needEnergy(2)) return 'norender'; changeRep(0.3); unlockedIds().forEach((p) => { S.platforms[p].eng += 0.05; }); fin('You replied. They screenshotted it.'); break;
      case 'block': fin('Blocked'); break;
      case 'clap': changeRep(-0.8 * sev()); S.heat = clamp(S.heat + 4, 0, 100); addFollowers(totalFollowers() * 0.002); fin('Your clapback got more likes than your last post.'); break;
      case 'kind': changeRep(0.8); fin(chance(0.3) ? 'They apologized and followed you.' : 'No reply, but bystanders noticed.'); break;
      case 'accept': { const d = { id: uid(), brand: m.brand, pay: m.pay, req: m.req, done: 0, day: S.day, deadline: S.day + m.days, status: 'active' }; S.deals.push(d); fin(`Signed. ${m.req} post${m.req > 1 ? 's' : ''} due by day ${d.deadline}.`); toast(`Deal signed with ${BRANDS[m.brand].name}`, 'gold'); break; }
      case 'negotiate': {
        if (m.negotiated) { toast("They won't go higher.", 'bad'); return 'norender'; }
        if (chance(0.45 + skillLvl('business') * 0.05 + 0.15 * tm('manager'))) { m.pay = Math.round(m.pay * 1.3); m.negotiated = true; toast(`${BRANDS[m.brand].name} agreed to ${money(m.pay)}.`, 'gold'); addXp('business', 15); break; }
        fin('They walked away.'); toast('Negotiation failed. Offer withdrawn.', 'bad'); addXp('business', 8); break;
      }
      case 'decline': fin('Declined'); break;
      case 'gigYes': if (!acceptGig(m)) return 'norender'; fin(`Done. ${money(m.pay)} paid.`); toast(`Gig paid ${money(m.pay)}`, 'gold'); sound('cash'); break;
      case 'gigNo': fin('Declined'); break;
      case 'collabYes': if (S.collab) { toast('Finish your current collab first.', 'bad'); return 'norender'; } S.collab = { npc: m.npc, until: S.day + 4 }; changeRel(m.npc, 3); fin('Collab on! Mention them or pick the collab topic when you post.'); break;
      case 'collabNo': changeRel(m.npc, -3); fin('Declined'); break;
      case 'acceptTerms': {
        const n = S.npcs[m.npc];
        if (m.cond === 'gift') {
          if (!spend(m.price)) { toast('Not enough money.', 'bad'); return 'norender'; }
          remember('npc', m.npc, 'gift', 0.4);
          const out = resolveAsk(m.npc, m.ask, { res: 'yes', line: 'ok, now we\'re talking 💅' }); fin(out.msg); toast(out.msg, 'gold');
        } else {
          n.cond = { type: m.cond, ask: m.ask, until: S.day + 3 };
          fin(m.cond === 'apology' ? 'Post an apology that @mentions them (pick "Shout out") within 3 days.' : 'Post a shoutout that @mentions them (pick "Shout out") within 3 days.');
          openCompose({ text: genMentionText('npc', m.npc, 'shout') + ' ', intents: { ['npc:' + m.npc]: 'shout' }, toneMode: 'wholesome' });
        }
        break;
      }
      case 'declineTerms': remember('npc', m.npc, 'declined', -0.2); changeRel(m.npc, -2); fin('You turned down their terms.'); break;
      case 'phish': fin('You entered your password...'); S.queue.push({ ev: 'hacked_scam', ctx: {} }); processQueue(); break;
      case 'report': fin('Reported. Good catch.'); break;
      case 'scamPay': if (!spend(500)) { toast('Not enough money.', 'bad'); return 'norender'; } fin('The "prince" stopped replying. $500 gone.'); log('Lost $500 to a crypto scam.', 'bad'); break;
    }
  },
  dealPost: (a) => { const d = S.deals.find((x) => x.id === +a); openCompose({ topic: 'deal:' + a, topicManual: true, text: `Obsessed with ${BRANDS[d.brand].name} lately ` }); return 'norender'; },
  buy: (a) => { const it = SHOP.find((x) => x.id === a); if (S.owned[a]) return 'norender'; if (!spend(it.price)) { toast('Not enough money.', 'bad'); return 'norender'; } S.owned[a] = true; log(`Bought: ${it.name}.`, 'good'); toast(`Bought ${it.name}`); sound('cash'); if (it.cat === 'Lifestyle') news(`@${S.handle} shows off a new ${it.name.toLowerCase()}`, true); checkAll(); },
  consume: (a) => {
    const c = CONSUMABLES.find((x) => x.id === a); if (!spend(c.price)) { toast('Not enough money.', 'bad'); return 'norender'; }
    if (c.special === 'vacation') { S.day += 3; S.stress = 0; S.energy = maxEnergy(); S.travelUntil = S.day + 3; S.travelCountry = 'id'; S.lastPostDay = S.day - 1; S.stats.vacations++; addFollowersPct(-0.01); log('Back from Bali. Travel content ready to post.', 'good'); toast('Back from vacation, fully recharged', 'gold'); S.dayStart = snap(); }
    else if (c.special) consumeSpecial(c.special);
    else applyFx(c.fx);
    sound('cash');
  },
  growth: (a) => {
    const g = GROWTH.find((x) => x.id === a); if (!spend(g.price)) { toast('Not enough money.', 'bad'); return 'norender'; }
    if (g.n) { S.platforms.pix.followers += g.n; S.fake += g.n; S.stats.bought++; log(`Bought ${fmt(g.n)} bot followers.`, 'bad'); toast("They aren't real. Engagement will suffer."); }
    else if (g.special === 'check') { S.flags.paidCheck = true; changeRep(-2); toast('Paid badge active. People can tell.'); }
    else if (g.special === 'ads') { const n = Math.round(g.price * rnd(2, 5) * clamp(engRate() / 5, 0.5, 1.5)); addFollowers(n); log(`Ran an ad campaign: ${signed(n)} followers.`); }
    checkAll();
  },
  course: (a) => { const l = skillLvl(a); const price = Math.round(COURSES[a].base * Math.pow(l, 1.6)); if (l >= 10) return 'norender'; if (!spend(price)) { toast('Not enough money.', 'bad'); return 'norender'; } S.skills[a].lvl++; S.skills[a].xp = 0; toast(`${a[0].toUpperCase() + a.slice(1)} is now level ${l + 1}`, 'gold'); log(`Finished ${COURSES[a].name}.`, 'good'); checkAll(); },
  hire: (a) => { const m = TEAM[a]; if (!spend(m.pay)) { toast('Not enough money.', 'bad'); return 'norender'; } S.team[a] = true; S.teamDue = S.teamDue || {}; S.teamDue[a] = S.day + 30; if (a === 'assistant') S.energy += 20; log(`Hired a ${m.name.toLowerCase()}.`, 'good'); toast(`${m.name} hired`); checkAll(); },
  teamUp: (a) => { const c = teamUpCost(a); if (teamLvl(a) >= 5) { toast('Already at Legend level.'); return 'norender'; } if (!spend(c)) { toast('Not enough money.', 'bad'); return 'norender'; } S.teamLvl = S.teamLvl || {}; S.teamLvl[a] = teamLvl(a) + 1; toast(`${TEAM[a].name} is now ${TEAM_LEVELS[S.teamLvl[a] - 1]}`, 'gold'); log(`Upgraded your ${TEAM[a].name.toLowerCase()} to ${TEAM_LEVELS[S.teamLvl[a] - 1]}.`, 'good'); sound('cash'); if (S.teamLvl[a] === 5 && typeof celebrate === 'function') celebrate('gold'); },
  fire: (a) => { S.team[a] = false; if (S.teamDue) delete S.teamDue[a]; if (S.teamLvl) delete S.teamLvl[a]; log(`Let your ${TEAM[a].name.toLowerCase()} go.`); },
  merchLaunch: () => { if (!spend(3000)) return 'norender'; S.merch = { lvl: 1, sold: 0, boost: 2 }; log('Merch line launched.', 'gold'); news(`@${S.handle} drops a merch line`, true); toast('Merch is live. Sales arrive overnight.', 'gold'); checkAll(); },
  merchUp: () => { const c = 5000 * S.merch.lvl ** 2; if (!spend(c)) return 'norender'; S.merch.lvl++; toast(`Merch quality level ${S.merch.lvl}`); },
  merchDrop: () => { if (!needEnergy(20)) return 'norender'; S.merch.boost += 3; applyFx({ fp: 0.005 }); toast('New collection dropped. Expect a sales spike tonight.', 'gold'); log('Dropped a merch collection.'); },
  productLaunch: () => { if (!spend(1.5e5)) return 'norender'; S.product = { name: productName(), sold: 0, hype: 4 }; log(`Launched ${S.product.name}.`, 'gold'); news(`@${S.handle} launches ${S.product.name}`, true); toast('Your brand is live!', 'gold'); checkAll(); },
  productPush: () => { const c = Math.round(2e4 + totalFollowers() * 0.01); if (!spend(c)) return 'norender'; S.product.hype += 2; toast('Marketing push running.'); },
  podcastLaunch: () => { if (!spend(2000)) return 'norender'; S.podcast = { last: 0 }; S.platforms.tube.unlocked = true; log('Podcast launched on ViewTube.', 'gold'); toast('Podcast launched', 'gold'); checkAll(); },
  episode: (a) => {
    if (S.podcast.last === S.day || !needEnergy(30)) return 'norender'; S.podcast.last = S.day; S.stats.episodes++;
    const guest = a || null;
    let g = Math.max(50, totalFollowers() * 0.006) * (1 + skillLvl('charisma') * 0.05);
    if (guest) { g += Math.min(S.npcs[guest].followers * 0.0006, Math.max(totalFollowers() * 0.5, 1000)); changeRel(guest, 6); }
    g *= diffM(); S.platforms.tube.followers += g; addFollowers(g * 0.2);
    const cash = Math.round(totalFollowers() * 0.002 * (1 + skillLvl('business') * 0.05)); S.money += cash; S.stats.earned += cash; S.lastPostDay = S.day; addXp('charisma', 10);
    log(`Recorded a podcast episode${guest ? ' with ' + npcName(guest) : ''}.`, 'good'); checkAll();
  },
  deposit: (a) => { const amt = Math.floor(Math.max(0, S.money) * +a); S.money -= amt; S.savings += amt; },
  withdraw: () => { S.money += S.savings; S.savings = 0; },
  donate: (a) => {
    const amt = Math.round(Math.max(50, S.money * +a)); if (!spend(amt)) { toast('Not enough money.', 'bad'); return 'norender'; }
    const r = clamp(Math.log10(amt) * 1.1 - 1, 0.3, 7) * (S.flags.lastDonate === S.day ? 0.3 : 1); S.flags.lastDonate = S.day;
    changeRep(r); S.stats.donated += amt; S.heat = clamp(S.heat - r * 2, 0, 100); log(`Donated ${money(amt)} to charity.`, 'good');
    if (amt >= 1e5) news(`@${S.handle} quietly donates ${money(amt)} to charity`, true);
    checkAll();
  },
  life: (a) => {
    const def = LIFE.find((x) => x[0] === a); const e = def[3];
    if (a !== 'replies' && !once('life_' + a)) return 'norender';
    if ((a === 'meetup' && S.money < 1000) || (a === 'party' && S.money < 500) || (a === 'giveaway' && S.money < Math.max(100, totalFollowers() * 0.01))) { S.flags['life_' + a] = null; toast('Not enough money.', 'bad'); return 'norender'; }
    if (!needEnergy(e)) { S.flags['life_' + a] = null; return 'norender'; }
    let msg = '';
    switch (a) {
      case 'grass': S.stress = clamp(S.stress - 12, 0, 100); msg = 'Birds exist. Who knew.'; break;
      case 'gym': S.stress = clamp(S.stress - 8, 0, 100); addXp('charisma', 8); msg = 'Pump achieved.'; break;
      case 'meditate': S.stress = clamp(S.stress - 8, 0, 100); msg = 'Ommm.'; break;
      case 'family': S.stress = clamp(S.stress - 15, 0, 100); msg = 'Grandma asked what you do for work again.'; break;
      case 'replies': { const n = replyToComments(10); if (n.n) if (typeof questEvent === 'function') questEvent('reply'); msg = n.n ? `You replied to ${n.n} comment${n.n > 1 ? 's' : ''}${n.neg ? ` (clapped back at ${n.neg} hater${n.neg > 1 ? 's' : ''})` : ''}. Fans feel seen.` : 'No new comments to answer. Post something first.'; if (n.n >= 8) gainEnergy(4, 'Fans loved the replies'); break; }
      case 'giveaway': { const cost = Math.round(Math.max(100, totalFollowers() * 0.01)); S.money -= cost; const g = Math.max(80, totalFollowers() * 0.04) * diffM(); addFollowers(g); S.fake += g * 0.3; S.stats.giveaways++; msg = 'Some of the new followers are clearly bots.'; break; }
      case 'meetup': S.money -= 1000; changeRep(3); addFollowersPct(0.01); S.stats.meetups++; msg = 'Hugs, selfies, and one fan who cried.'; if (!S.team.bodyguard && chance(0.12)) S.queue.push({ ev: 'stalker', ctx: {} }); break;
      case 'party': { S.money -= 500; const id = randomNpc((x) => !S.npcs[x].feud); changeRel(id, 8); S.stress = clamp(S.stress - 10, 0, 100); msg = `You hit it off with ${npcName(id)}.`; if (chance(0.5)) gainTea(randomNpc((x) => x !== id), `from ${npcName(id).split(' ')[0]} at the party`); if (chance(0.15)) S.queue.push({ ev: 'paparazzi', ctx: {} }); break; }
    }
    toast(msg); checkAll(); processQueue();
  },
  practice: (a) => { if (!needEnergy(15)) return 'norender'; addXp(a, 25); },
  theme: (a) => { S.settings.theme = a; },
  sound: () => { S.settings.sound = !S.settings.sound; },
  exportSave: () => { try { ui.exportCode = btoa(unescape(encodeURIComponent(JSON.stringify(S)))); } catch (e) { toast('Could not create a save code.', 'bad'); } },
  copySave: () => {
    const box = $('#exportBox'); const fallback = () => { if (box) { box.focus(); box.select(); } toast('Select the code and copy it manually.'); };
    try { navigator.clipboard.writeText(ui.exportCode).then(() => toast('Save code copied'), fallback); } catch (e) { fallback(); }
    return 'norender';
  },
  importSave: () => {
    const v = ($('#importBox') || {}).value || '';
    try { const s = JSON.parse(decodeURIComponent(escape(atob(v.trim())))); if (!s || s.v !== 1 || !s.platforms) throw new Error('bad'); S = migrate(s); modalBusy = false; $('#modal').hidden = true; save(); toast('Save loaded', 'gold'); }
    catch (e) { toast('That code is not a valid save. Paste the whole code.', 'bad'); }
  },
  restart: (a) => { if (a === 'yes') { wipeSave(); S = null; ui.confirmRestart = false; showStart(); return 'norender'; } ui.confirmRestart = a !== 'no'; },
};
Object.assign(ACT, MONEY_ACT, VAULT_ACT, ENDGAME_ACT, EXTRA_ACT, QUEST_ACT, SOCIAL_ACT);

const NO_FLASH = new Set(['go', 'back', 'open', 'openDm', 'endDay', 'dmSend', 'noop']);
const SHEET_ONLY = new Set(['storyOpen', 'cTheme', 'vPrice', 'vLink', 'vDrop', 'cAff', 'cPoll', 'cCross', 'duet', 'spin', 'cIntent', 'dmChip', 'postAbout', 'cImgRemove', 'composeAt', 'teaSpill', 'cLook', 'clashMeme', 'compose', 'composeTag', 'drawer', 'noop', 'closeCompose', 'copySave', 'cPlat', 'cFmt', 'cTopic', 'cTone', 'cEffort', 'cTime', 'cOpts', 'cDisclose', 'cTag', 'cSuggest']);
function ACT_RUN(act, arg = '') {
  if (!S || !ACT[act]) return;
  const before = statSnap();
  let res;
  try { res = ACT[act](arg); } catch (e) { console.error(`Action ${act} failed`, e); toast('Something went wrong there. Your game is safe.', 'bad'); res = undefined; }
  if (!S) return;
  if (!NO_FLASH.has(act)) flashDelta(before, statSnap());
  save();
  if (res === 'norender' && SHEET_ONLY.has(act)) { renderSidebar(); renderTabbar(); return; }
  renderAll();
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'drawer') { $('#drawer').hidden = true; return; }
  if (e.target.id === 'composeWrap') { closeCompose(); return; }
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const act = el.dataset.act;
  if (act.startsWith('onb')) return;
  if (modalBusy && !el.closest('#modal')) return;
  if (el.tagName === 'ARTICLE' && String(window.getSelection ? window.getSelection() : '').length) return;
  if (el.type === 'checkbox') { ACT_RUN(act, el.dataset.arg || ''); return; }
  ACT_RUN(act, el.dataset.arg || '');
});

/* ======================================================================
   Onboarding (persona creation)
   ====================================================================== */
function showStart() {
  $('#app').hidden = true; $('#modal').hidden = true; $('#composeWrap').hidden = true; $('#drawer').hidden = true; modalBusy = false;
  document.documentElement.removeAttribute('data-theme');
  const o = ui.onb, saved = loadSave();
  const steps = `<div class="steps">${[1, 2, 3].map((i) => `<i class="${i <= o.step ? 'on' : ''}"></i>`).join('')}</div>`;
  let body;
  if (o.step === 0) {
    const top = Object.entries(NPCS).sort((a, b) => b[1].followers - a[1].followers).slice(0, 3);
    body = `<div><h1 class="logo">Clout<br><em>Chaser</em></h1><p class="muted" style="font-size:18px;margin-top:14px;max-width:44ch">Sims, but social media. Create a persona, post whatever you want, and see if the internet makes you famous or cancels you.</p></div>
      <div class="preview-card">${top.map(([id, n], i) => `<div class="tw" style="cursor:default${i === 2 ? ';border:0' : ''}">${avatar(n.name, n.color)}<div class="tw-main"><div class="tw-head"><b>${esc(n.name)}</b>${vb()}<span class="h">@${n.handle}</span></div><div class="tw-text">${rich(NPC_POSTS[n.niche][i % 3].replace('{trend}', '#MainCharacterWalk'))}</div><div class="small muted">${fmt(n.followers * 0.03)} likes</div></div></div>`).join('')}</div>
      <p class="small muted">Includes parody celebrities and companies with tweaked names. They are satire: everything they say and do in the game is invented.</p>
      ${saved ? `<button class="btn primary big" data-act="onbContinue">Continue as @${esc(saved.handle)} · Day ${saved.day}</button><button class="btn big" data-act="onbNext">Create a new persona</button>` : '<button class="btn primary big" data-act="onbNext">Create your persona</button>'}`;
  } else if (o.step === 1) {
    body = `${steps}<div><h2 style="font-size:28px">Who are you online?</h2><p class="muted">This is how you'll show up on everyone's timeline.</p></div>
      <div class="preview-card"><div style="height:80px;background:linear-gradient(120deg, ${o.color}, #111)"></div><div style="padding:0 16px 16px;margin-top:-24px">${avatar(o.name || 'You', o.color, 'lg', o.faceSeed || o.name)}<div style="margin-top:8px"><b style="font-size:18px" id="pvName">${esc(o.name || 'Your name')}</b><div class="muted" id="pvHandle">@${esc(o.handle || 'handle')}</div></div></div></div>
      <div class="row" style="align-items:flex-start;gap:12px"><label style="flex:1;min-width:180px;display:flex;flex-direction:column;gap:6px"><span class="label">Display name</span><input class="input" id="onbName" maxlength="24" value="${esc(o.name)}"></label>
      <label style="flex:1;min-width:180px;display:flex;flex-direction:column;gap:6px"><span class="label">Handle</span><input class="input" id="onbHandle" maxlength="20" value="${esc(o.handle)}"></label></div>
      <div class="row"><button class="btn" data-act="onbFace">${ico('dice')} New look</button><label style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:180px"><span class="label">Home country</span><select class="input" id="onbCountry">${Object.entries(COUNTRIES).map(([cc, C]) => `<option value="${cc}" ${cc === (o.country || 'us') ? 'selected' : ''}>${C.flag} ${esc(C.name)}</option>`).join('')}</select></label></div>
      <div><span class="label">Profile color</span><div class="row" style="margin-top:8px">${AVATAR_COLORS.map((c) => `<button class="swatch" style="background:${c}" data-act="onbColor" data-arg="${c}" aria-pressed="${o.color === c}" aria-label="Color ${c}"></button>`).join('')}</div></div>
      <div class="row between"><button class="btn big" data-act="onbBack">Back</button><button class="btn primary big" data-act="onbNext">Next</button></div>`;
  } else if (o.step === 2) {
    body = `${steps}<div><h2 style="font-size:28px">What do you post about?</h2><p class="muted">Your niche decides which trends, brands and stars fit you best.</p></div>
      <div class="pick-grid">${Object.entries(NICHES).map(([id, n]) => `<button class="pick" data-act="onbNiche" data-arg="${id}" aria-pressed="${o.niche === id}"><b>${n.name}</b><span>${NICHE_DESC[id]}</span></button>`).join('')}</div>
      <div class="row between"><button class="btn big" data-act="onbBack">Back</button><button class="btn primary big" data-act="onbNext">Next</button></div>`;
  } else {
    body = `${steps}<div><h2 style="font-size:28px">How dramatic is this internet?</h2><p class="muted">Sets how fast you grow and how hard scandals hit.</p></div>
      <div class="pick-grid" style="grid-template-columns:1fr">${[['chill', 'Chill', 'Wholesome internet. Faster growth, softer scandals.'], ['normal', 'Normal', 'The intended experience. Fair, occasionally brutal.'], ['brutal', 'Unhinged', 'Slow growth, vicious comment sections, scandals hit 40% harder.']].map(([id, n, d]) => `<button class="pick" data-act="onbDiff" data-arg="${id}" aria-pressed="${o.diff === id}"><b>${n}</b><span>${d}</span></button>`).join('')}</div>
      <div class="row between"><button class="btn big" data-act="onbBack">Back</button><button class="btn blue big" data-act="onbGo">Enter the timeline</button></div>`;
  }
  $('#start').hidden = false;
  $('#start').innerHTML = `<div class="onb"><div class="onb-card">${body}</div></div>`;
  const nm = $('#onbName'), hd = $('#onbHandle'), oc = $('#onbCountry');
  if (oc) oc.addEventListener('change', () => { o.country = oc.value; });
  const pv = () => { const a = $('#pvName'), b = $('#pvHandle'); if (a) a.textContent = o.name || 'Your name'; if (b) b.textContent = '@' + (o.handle || 'handle'); };
  if (nm) nm.addEventListener('input', () => { o.name = nm.value; if (!o.handleTouched) { o.handle = nm.value.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20); hd.value = o.handle; } pv(); });
  if (hd) hd.addEventListener('input', () => { o.handleTouched = true; o.handle = hd.value.replace(/[^a-zA-Z0-9_.]/g, '').slice(0, 20); pv(); });
}
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act^="onb"]'); if (!el) return;
  const o = ui.onb, a = el.dataset.arg, act = el.dataset.act;
  if (act === 'onbContinue') { S = loadSave(); if (S) enterGame(); return; }
  if (act === 'onbNext') o.step = Math.min(3, o.step + 1);
  if (act === 'onbBack') o.step = Math.max(0, o.step - 1);
  if (act === 'onbColor') o.color = a;
  if (act === 'onbNiche') o.niche = a;
  if (act === 'onbDiff') o.diff = a;
  if (act === 'onbFace') o.faceSeed = 'face' + Math.random().toString(36).slice(2, 8);
  if (act === 'onbGo') {
    newGame({ name: (o.name || '').trim() || 'New Creator', handle: (o.handle || '').trim() || 'newcreator' + ri(10, 99), niche: o.niche, diff: o.diff, color: o.color, country: o.country || 'us', faceSeed: o.faceSeed || o.name });
    tab = 'home'; ui.view = null; ui.hist = []; ui.c = null; o.step = 0;
    save(); enterGame(); sound('viral');
    setTimeout(() => openCompose(), 350);
    return;
  }
  showStart();
});

function enterGame() {
  $('#start').hidden = true; $('#start').innerHTML = '';
  $('#app').hidden = false;
  renderAll(); processQueue();
}

/* ---------- horizontal scrolling for chip rows: wheel, drag, edge fades ---------- */
const HSEL = '.scroller, .strip, .table-wrap';
function scrollHints() {
  document.querySelectorAll(HSEL).forEach((el) => {
    const max = el.scrollWidth - el.clientWidth;
    el.classList.toggle('more-l', max > 2 && el.scrollLeft > 2);
    el.classList.toggle('more-r', max > 2 && el.scrollLeft < max - 2);
  });
}
let hintQueued = false;
const queueHints = () => { if (hintQueued) return; hintQueued = true; requestAnimationFrame(() => { hintQueued = false; scrollHints(); }); };
new MutationObserver(queueHints).observe(document.body, { childList: true, subtree: true });
document.addEventListener('scroll', (e) => { if (e.target.matches && e.target.matches(HSEL)) queueHints(); }, true);
window.addEventListener('resize', queueHints);
document.addEventListener('wheel', (e) => {
  const el = e.target.closest && e.target.closest(HSEL);
  if (!el || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  const max = el.scrollWidth - el.clientWidth; if (max <= 2) return;
  const next = el.scrollLeft + e.deltaY;
  if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return; // at the end: let the page scroll
  e.preventDefault(); el.scrollLeft = next;
}, { passive: false });
let drag = null;
document.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return;
  const el = e.target.closest && e.target.closest(HSEL);
  if (!el || el.scrollWidth - el.clientWidth <= 2) return;
  drag = { el, x: e.clientX, left: el.scrollLeft, moved: false };
});
document.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (!drag.moved && Math.abs(dx) < 6) return;
  drag.moved = true; drag.el.classList.add('dragging');
  drag.el.scrollLeft = drag.left - dx;
});
document.addEventListener('pointerup', () => { if (drag && drag.moved) { const el = drag.el; el.classList.remove('dragging'); el.dataset.dragged = '1'; setTimeout(() => { delete el.dataset.dragged; }, 0); } drag = null; });
// a drag should not count as a click on the chip under the mouse
document.addEventListener('click', (e) => { const el = e.target.closest && e.target.closest(HSEL); if (el && el.dataset.dragged) { e.stopPropagation(); e.preventDefault(); } }, true);

/* ======================================================================
   Boot
   ====================================================================== */
let lastW = window.innerWidth;
window.addEventListener('resize', () => { if (!S) return; const w = window.innerWidth; if ((w > 1060) !== (lastW > 1060)) renderRail(); lastW = w; if (tab === 'stats' || ui.profTab === 'analytics') drawChart(); });
try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (S) drawChart(); }); } catch (e) { /* old browser */ }
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (!$('#composeWrap').hidden) closeCompose(); if (!$('#drawer').hidden) $('#drawer').hidden = true; return; }
  if (!S || modalBusy || /input|textarea/i.test(e.target.tagName) || !$('#composeWrap').hidden) return;
  if (e.key === 'e' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ACT_RUN('endDay'); }
  if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); openCompose(); }
});

try { window.claude?.hot?.snapshot?.(() => ({ S, tab, ui })); } catch (e) { /* not in a viewer */ }
function start(data) {
  if (data && data.S) { S = migrate(data.S); tab = data.tab || tab; if (data.ui) Object.assign(ui, data.ui, { typing: null }); modalBusy = false; enterGame(); return; }
  showStart();
}
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
