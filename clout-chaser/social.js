/* Clout Chaser — accounts, cloud saves, friends, gifts and duo collabs.
   Two backends behind one interface:
   - "claude": the published claude.ai page (signed-in viewer, db capability, room presence). No setup.
   - "supabase": email + password accounts for the Android app or any web host. Fill in cloud-config.js
     (URL + anon key) and run android/supabase-schema.sql once. Without either, the game stays local. */
'use strict';

const CLOUD_CHUNK = 100000; // characters per save chunk (db documents are capped at 256 KiB)
const realDay = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

/* ---------- backend: claude.ai capabilities ---------- */
function claudeBackend(db, user, room) {
  let uid = null;
  const playersCol = () => db.collection('players');
  return {
    mode: 'claude', label: 'your Claude account', canSignOut: false,
    async init() { uid = await user.id(); return !!uid; },
    me: () => uid,
    async saveGame(json) {
      const parts = Math.ceil(json.length / CLOUD_CHUNK);
      for (let i = 0; i < parts; i++) await db.doc(`data/users/${uid}/save${i}`).set({ d: json.slice(i * CLOUD_CHUNK, (i + 1) * CLOUD_CHUNK) });
      await db.doc(`data/users/${uid}/savemeta`).set({ parts, savedAt: Date.now(), day: S ? S.day : 0, gameId: S ? S.gameId : '' });
    },
    async loadMeta() { const m = await db.doc(`data/users/${uid}/savemeta`).get(); return m.exists ? m.data() : null; },
    async loadGame() {
      const m = await this.loadMeta(); if (!m) return null;
      let json = '';
      for (let i = 0; i < m.parts; i++) { const d = await db.doc(`data/users/${uid}/save${i}`).get(); if (!d.exists) return null; json += d.data().d; }
      return { json, savedAt: m.savedAt, day: m.day };
    },
    async putProfile(p) { await playersCol().doc(uid).set({ ...p, friends: (Cloud.cache.friends || []), updated: Date.now() }); },
    async getProfiles(ids) { const out = {}; for (const id of ids) { const d = await playersCol().doc(id).get(); if (d.exists) out[id] = d.data(); } return out; },
    async listPlayers() { const q = await playersCol().orderBy('updated', 'desc').limit(60).get(); const out = {}; q.docs.forEach((d) => { out[d.id] = d.data(); }); return out; },
    async searchPlayers(q) { const all = await this.listPlayers(); const s = q.toLowerCase().replace('@', ''); return Object.fromEntries(Object.entries(all).filter(([, p]) => (p.handle || '').toLowerCase().includes(s) || (p.name || '').toLowerCase().includes(s))); },
    async getFriends() { const d = await playersCol().doc(uid).get(); return d.exists ? d.data().friends || [] : []; },
    async setFriends(list) { await playersCol().doc(uid).update({ friends: list }); },
    async sendGift(to, g) { await db.collection('gifts').add({ to, from: uid, ...g, claimed: false, at: Date.now() }); },
    async listGifts() { const q = await db.collection('gifts').where('to', '==', uid).where('claimed', '==', false).limit(50).get(); return q.docs.map((d) => ({ id: d.id, ...d.data() })); },
    async claimGift(id) { await db.doc(`gifts/${id}`).update({ claimed: true }); },
    online(cb) { if (!room) return; room.presence({ uid, handle: S ? S.handle : '' }).catch(() => {}); room.onPeers((ch) => cb(ch.peers.map((p) => p.presence && p.presence.uid).filter(Boolean))); },
  };
}

/* ---------- backend: Supabase (email + password) over plain fetch ---------- */
function supabaseBackend(url, key) {
  const TK = 'clout-chaser-auth';
  let session = null;
  try { session = JSON.parse(localStorage.getItem(TK) || 'null'); } catch (e) { session = null; }
  const keep = (s) => { session = s; try { s ? localStorage.setItem(TK, JSON.stringify(s)) : localStorage.removeItem(TK); } catch (e) { /* ignore */ } };
  const hdr = (auth = true) => ({ apikey: key, 'Content-Type': 'application/json', ...(auth && session ? { Authorization: `Bearer ${session.access_token}` } : {}) });
  async function call(path, opts = {}, retry = true) {
    const r = await fetch(url + path, { ...opts, headers: { ...hdr(opts.auth !== false), ...(opts.headers || {}) } });
    if (r.status === 401 && retry && session && session.refresh_token) { await refresh(); return call(path, opts, false); }
    const txt = await r.text(); let body = null; try { body = txt ? JSON.parse(txt) : null; } catch (e) { body = txt; }
    if (!r.ok) throw new Error((body && (body.msg || body.message || body.error_description || body.error)) || `HTTP ${r.status}`);
    return body;
  }
  async function refresh() {
    try { const s = await call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', auth: false, body: JSON.stringify({ refresh_token: session.refresh_token }) }, false); keep(s); }
    catch (e) { keep(null); throw e; }
  }
  const uid = () => session && session.user && session.user.id;
  return {
    mode: 'supabase', label: 'email', canSignOut: true, needsLogin: true,
    async init() { if (!session) return false; try { await refresh(); return !!uid(); } catch (e) { return false; } },
    me: uid,
    email: () => session && session.user && session.user.email,
    async signUp(email, password) {
      const s = await call('/auth/v1/signup', { method: 'POST', auth: false, body: JSON.stringify({ email, password }) });
      if (s && s.access_token) { keep(s); return 'in'; }
      return 'confirm'; // the project requires email confirmation
    },
    async signIn(email, password) { const s = await call('/auth/v1/token?grant_type=password', { method: 'POST', auth: false, body: JSON.stringify({ email, password }) }); keep(s); return true; },
    async signOut() { try { await call('/auth/v1/logout', { method: 'POST' }); } catch (e) { /* ignore */ } keep(null); },
    async resetPassword(email) { await call('/auth/v1/recover', { method: 'POST', auth: false, body: JSON.stringify({ email }) }); },
    async saveGame(json) { await call('/rest/v1/saves?on_conflict=user_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify({ user_id: uid(), data: json, day: S ? S.day : 0, saved_at: Date.now(), game_id: S ? S.gameId : '' }) }); },
    async loadMeta() { const r = await call(`/rest/v1/saves?user_id=eq.${uid()}&select=day,saved_at,game_id`); return r && r[0] ? { day: r[0].day, savedAt: +r[0].saved_at, gameId: r[0].game_id } : null; },
    async loadGame() { const r = await call(`/rest/v1/saves?user_id=eq.${uid()}&select=data,day,saved_at`); return r && r[0] ? { json: r[0].data, day: r[0].day, savedAt: +r[0].saved_at } : null; },
    async putProfile(p) { await call('/rest/v1/players?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify({ id: uid(), handle: p.handle, profile: p, updated_at: Date.now() }) }); },
    async getProfiles(ids) { if (!ids.length) return {}; const r = await call(`/rest/v1/players?id=in.(${ids.join(',')})&select=id,profile`); return Object.fromEntries((r || []).map((x) => [x.id, x.profile])); },
    async listPlayers() { const r = await call('/rest/v1/players?select=id,profile&order=updated_at.desc&limit=60'); return Object.fromEntries((r || []).map((x) => [x.id, x.profile])); },
    async searchPlayers(q) { const s = encodeURIComponent(`*${q.replace(/[@*,()]/g, '')}*`); const r = await call(`/rest/v1/players?handle=ilike.${s}&select=id,profile&limit=20`); return Object.fromEntries((r || []).map((x) => [x.id, x.profile])); },
    async getFriends() { const r = await call(`/rest/v1/friends?user_id=eq.${uid()}&select=friend_id`); return (r || []).map((x) => x.friend_id); },
    async setFriends(list) {
      const cur = await this.getFriends();
      for (const f of list.filter((x) => !cur.includes(x))) await call('/rest/v1/friends', { method: 'POST', body: JSON.stringify({ user_id: uid(), friend_id: f }) });
      for (const f of cur.filter((x) => !list.includes(x))) await call(`/rest/v1/friends?user_id=eq.${uid()}&friend_id=eq.${f}`, { method: 'DELETE' });
    },
    async sendGift(to, g) { await call('/rest/v1/gifts', { method: 'POST', body: JSON.stringify({ to_id: to, from_id: uid(), kind: g.kind, amount: g.amount, note: g.note || '', from_handle: g.fromHandle || '' }) }); },
    async listGifts() { const r = await call(`/rest/v1/gifts?to_id=eq.${uid()}&claimed=eq.false&select=*&limit=50`); return (r || []).map((x) => ({ id: x.id, from: x.from_id, kind: x.kind, amount: x.amount, note: x.note, fromHandle: x.from_handle })); },
    async claimGift(id) { await call(`/rest/v1/gifts?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ claimed: true }) }); },
    online() { /* presence needs realtime; friends show "last seen" instead */ },
  };
}

/* ---------- the shared layer the game talks to ---------- */
const Cloud = {
  be: null, mode: null, signedIn: false, status: 'local', lastSync: 0, error: '', cache: { friends: [], profiles: {}, gifts: [], online: [], players: {} },
  async start() {
    try {
      const cfg = window.CLOUD_CONFIG || {};
      if (window.claude && typeof window.claude.use === 'function') {
        const [db, user, room] = await Promise.all([window.claude.use('db'), window.claude.use('user'), window.claude.use('room')]);
        if (db && user) this.be = claudeBackend(db, user, room);
      }
      if (!this.be && cfg.supabaseUrl && cfg.supabaseKey) this.be = supabaseBackend(cfg.supabaseUrl.replace(/\/$/, ''), cfg.supabaseKey);
      if (!this.be) { this.status = 'local'; return; }
      this.mode = this.be.mode;
      this.signedIn = await this.be.init();
      this.status = this.signedIn ? 'online' : 'signed-out';
      if (this.signedIn) await this.afterSignIn();
    } catch (e) { this.error = String(e.message || e); this.status = 'error'; }
    if (S) renderAll();
  },
  async afterSignIn() {
    this.cache.friends = await this.be.getFriends().catch(() => []);
    await this.refresh();
    this.be.online((ids) => { this.cache.online = ids; if (S && tab === 'friends') renderCol(); });
    const meta = await this.be.loadMeta().catch(() => null);
    // never overwrite a different cloud game without asking
    if (!meta) { this.ok = true; if (S) this.push(); return; }
    if (!S) return offerCloudSave(meta);
    if (meta.gameId && meta.gameId === S.gameId && (S.savedAt || 0) >= meta.savedAt) { this.ok = true; this.push(); return; }
    if (meta.gameId && meta.gameId === S.gameId) { this.ok = true; return offerCloudSave(meta); }
    this.ok = false; S.queue.unshift({ ev: '_cloudPick', ctx: meta }); processQueue();
  },
  async refresh() {
    if (!this.signedIn) return;
    const ids = this.cache.friends;
    this.cache.profiles = await this.be.getProfiles(ids).catch(() => ({}));
    this.cache.gifts = await this.be.listGifts().catch(() => []);
    if (S) renderAll();
  },
  async push(force) {
    if (!this.signedIn || !S || (!this.ok && !force)) return;
    try {
      await this.be.saveGame(JSON.stringify(S));
      await this.be.putProfile(myProfile());
      this.lastSync = Date.now(); this.status = 'online'; this.error = '';
    } catch (e) { this.error = String(e.message || e); this.status = 'error'; }
  },
};
function myProfile() {
  return { handle: S.handle, name: S.name, faceSeed: S.faceSeed || S.name, color: S.color, niche: S.niche, followers: Math.round(totalFollowers()), tier: tier().name, day: S.day, era: (S.legacy && S.legacy.rank || 0) + 1, hq: typeof hqName === 'function' ? hqName() : '', verified: !!S.flags.verified };
}
let cloudTimer = null;
function cloudSaveSoon() { if (!Cloud.signedIn) return; clearTimeout(cloudTimer); cloudTimer = setTimeout(() => Cloud.push(), 4000); }
let S_pendingCloud = null;
function offerCloudSave(meta) {
  S_pendingCloud = meta;
  if (!S) { const st = document.getElementById('start'); if (st && !st.hidden) { const b = document.createElement('div'); b.className = 'cloud-offer'; b.innerHTML = `<b>☁️ Cloud save found</b><span class="small">Day ${meta.day}, saved ${new Date(meta.savedAt).toLocaleString()}</span><button class="btn primary" id="cloudContinue">Continue from cloud</button>`; st.prepend(b); document.getElementById('cloudContinue').onclick = loadCloudGame; } return; }
  toast(`☁️ Your cloud save is newer (day ${meta.day}). Open Friends to load it.`, 'gold');
}
async function loadCloudGame() {
  Cloud.ok = true;
  const g = await Cloud.be.loadGame().catch((e) => { toast('Could not load cloud save: ' + e.message, 'bad'); return null; });
  if (!g) return;
  try { const s = JSON.parse(g.json); S = migrate(s); save(); S_pendingCloud = null; modalBusy = false; $('#modal').hidden = true; enterGame(); toast(`Loaded cloud save: day ${S.day}`, 'gold'); }
  catch (e) { toast('Cloud save is damaged.', 'bad'); }
}

/* ---------- friends: gifts and duo collabs ---------- */
const GIFT_KINDS = {
  energy: { name: '⚡ Energy drink', desc: '+20 energy', apply: () => gainEnergy(20, 'Gift from a friend') },
  cash:   { name: '💵 Cash', desc: 'Money, scaled to the sender', apply: (g) => { S.money += g.amount; } },
  xp:     { name: '🎟️ Pass XP', desc: '+120 Clout Pass XP', apply: () => typeof passXP === 'function' && passXP(120) },
  collab: { name: '🤝 Duo collab', desc: '+1.5% followers for both', apply: () => addFollowersPct(0.015) },
};
function sentToday(id, kind) { const k = `${realDay()}:${id}:${kind}`; return (S.flags.sent || {})[k]; }
async function sendGiftTo(id, kind) {
  if (!Cloud.signedIn) return;
  if (sentToday(id, kind)) return toast('Already sent today. Come back tomorrow!', 'bad');
  const g = { kind, amount: kind === 'cash' ? Math.round(Math.max(200, totalFollowers() * 0.002) / 10) * 10 : 0, fromHandle: S.handle };
  try {
    await Cloud.be.sendGift(id, g);
    S.flags.sent = S.flags.sent || {}; S.flags.sent[`${realDay()}:${id}:${kind}`] = 1;
    if (kind === 'collab') { addFollowersPct(0.015); log(`Duo collab with @${(Cloud.cache.profiles[id] || {}).handle || 'a friend'}.`, 'good'); }
    if (typeof questEvent === 'function') questEvent('gift');
    S.stats.giftsSent = (S.stats.giftsSent || 0) + 1;
    toast(`${GIFT_KINDS[kind].name} sent!`, 'gold'); sound('cash'); save(); renderAll();
  } catch (e) { toast('Could not send: ' + e.message, 'bad'); }
}

/* ---------- Friends screen ---------- */
const friendAv = (p, size = '') => avatar(p.name || p.handle || '?', p.color || '#445', size, p.faceSeed || p.handle);
function vFriends() {
  const C = Cloud, sub = ui.socTab || 'friends';
  const status = C.status === 'online' ? `<span class="pill good">● Synced${C.lastSync ? ' ' + new Date(C.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>` : C.status === 'error' ? `<span class="pill bad">Sync error</span>` : C.status === 'signed-out' ? '<span class="pill warn">Signed out</span>' : '<span class="pill">Local only</span>';
  let body = '';
  if (!C.be) body = `<div class="sect"><div class="hint">☁️ <b>Cloud saves and friends aren't connected in this copy of the game.</b> Your progress is saved on this device. When the game is opened from its shared claude.ai link, or the app is set up with an account server, you'll be able to sign in, keep progress across devices, and add friends.</div></div>`;
  else if (!C.signedIn && C.be.needsLogin) body = loginForm();
  else if (!C.signedIn) body = `<div class="sect"><div class="hint">Sign in to claude.ai to use cloud saves and friends.</div></div>`;
  else {
    const friends = C.cache.friends;
    const gifts = C.cache.gifts;
    body = `<div class="sect"><div class="row between"><span class="small">Signed in with ${esc(C.be.label)}${C.be.email ? ` · ${esc(C.be.email() || '')}` : ''}</span><div class="row">${btn('Save to cloud now', 'cloudSave', '', 'sm')}${btn('Load cloud save', 'cloudLoad', '', 'sm')}${C.be.canSignOut ? btn('Sign out', 'cloudOut', '', 'sm danger') : ''}</div></div>
      ${C.error ? `<span class="small bad">${esc(C.error)}</span>` : ''}${C.ok === false ? '<div class="hint">⏸️ Cloud sync is paused because your cloud save is a different game. Use <b>Load cloud save</b> to switch to it, or <b>Save to cloud now</b> to replace it with this game.</div>' : ''}</div>
      ${gifts.length ? `<div class="sect"><h3>🎁 Gifts for you</h3>${gifts.map((g) => `<div class="row between gift-row"><span>${esc((GIFT_KINDS[g.kind] || {}).name || g.kind)}${g.kind === 'cash' ? ` ${money(g.amount)}` : ''} <span class="small muted">from @${esc(g.fromHandle || (C.cache.profiles[g.from] || {}).handle || 'a friend')}</span></span>${btn('Claim', 'giftClaim', g.id, 'sm primary')}</div>`).join('')}</div>` : ''}
      <div class="sect"><div class="row between"><h3>Your friends</h3><span class="small muted">${friends.length} friends</span></div>
      ${friends.length ? friends.map((id) => friendRow(id)).join('') : '<span class="small muted">No friends yet. Find people below and add them.</span>'}</div>
      <div class="sect"><h3>🏆 Friends leaderboard</h3>${leaderboard()}</div>
      <div class="sect"><h3>Find players</h3><div class="row" style="flex-wrap:nowrap"><input class="input" id="friendSearch" placeholder="Search by @handle" value="${esc(ui.fq || '')}">${btn('Search', 'friendSearch', '', 'sm primary')}</div>
      ${Object.keys(C.cache.players).length ? Object.entries(C.cache.players).filter(([id]) => id !== C.be.me()).map(([id, p]) => `<div class="row between friend-row">${friendAv(p, 'sm')}<span style="flex:1;min-width:0"><b>${esc(p.name || '')}</b> <span class="muted small">@${esc(p.handle || '')} · ${fmt(p.followers || 0)} followers</span></span>${friends.includes(id) ? '<span class="pill good">Friend</span>' : btn('Add', 'friendAdd', id, 'sm primary')}</div>`).join('') : `<span class="small muted">${C.mode === 'claude' ? 'Tap search with an empty box to see everyone playing this game.' : 'Search for your friends\' handles.'}</span>`}</div>`;
  }
  return `<div class="col-head">${head('Friends', 'Cloud saves, friends, gifts and duo collabs', false, status)}</div>${body}`;
}
function friendRow(id) {
  const p = Cloud.cache.profiles[id] || { handle: '…', name: 'Loading', followers: 0 };
  const on = Cloud.cache.online.includes(id);
  return `<div class="friend"><div class="row" style="flex-wrap:nowrap;gap:10px">${friendAv(p)}${on ? '<i class="online-dot" title="Online now"></i>' : ''}<div style="flex:1;min-width:0"><b>${esc(p.name || p.handle)}</b> ${p.verified ? vb() : ''}<div class="small muted">@${esc(p.handle)} · ${fmt(p.followers || 0)} followers · ${esc(p.tier || '')} · day ${p.day || 1}${p.era > 1 ? ` · era ${p.era}` : ''}</div></div>${btn('Remove', 'friendDel', id, 'sm')}</div>
    <div class="row">${Object.entries(GIFT_KINDS).map(([k, g]) => btn(g.name, 'giftSend', `${id}:${k}`, 'sm' + (k === 'collab' ? ' blue' : ''), !!sentToday(id, k), g.desc)).join('')}</div></div>`;
}
function leaderboard() {
  const rows = [{ id: 'me', p: myProfile(), me: true }, ...Cloud.cache.friends.map((id) => ({ id, p: Cloud.cache.profiles[id] })).filter((x) => x.p)];
  rows.sort((a, b) => (b.p.followers || 0) - (a.p.followers || 0));
  return `<div class="lgt">${rows.map((r, i) => `<div class="row between ${r.me ? 'lb-me' : ''}"><span>${['🥇', '🥈', '🥉'][i] || i + 1 + '.'} @${esc(r.p.handle)}${r.me ? ' (you)' : ''}</span><b>${fmt(r.p.followers || 0)}</b></div>`).join('')}</div>`;
}
function loginForm() {
  const mode = ui.authMode || 'in';
  return `<div class="sect auth"><h3>${mode === 'up' ? 'Create your account' : 'Sign in'}</h3>
    <span class="small muted">Keep your progress in the cloud, play on any device, and add friends.</span>
    <input class="input" id="authEmail" type="email" autocomplete="email" placeholder="Email">
    <input class="input" id="authPass" type="password" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}" placeholder="Password (6+ characters)">
    ${Cloud.error ? `<span class="small bad">${esc(Cloud.error)}</span>` : ''}
    <div class="row">${btn(mode === 'up' ? 'Create account' : 'Sign in', 'authGo', '', 'primary')}${btn(mode === 'up' ? 'I have an account' : 'Create an account', 'authMode', mode === 'up' ? 'in' : 'up', '')}${mode === 'in' ? btn('Forgot password', 'authReset', '', 'sm') : ''}</div></div>`;
}
const SOCIAL_ACT = {
  authMode: (a) => { ui.authMode = a; Cloud.error = ''; },
  authGo: () => {
    const email = ($('#authEmail') || {}).value || '', pass = ($('#authPass') || {}).value || '';
    if (!/^\S+@\S+\.\S+$/.test(email) || pass.length < 6) { Cloud.error = 'Enter a valid email and a password of 6+ characters.'; return; }
    (async () => {
      try {
        if ((ui.authMode || 'in') === 'up') { const r = await Cloud.be.signUp(email, pass); if (r === 'confirm') { Cloud.error = 'Check your email to confirm your account, then sign in.'; ui.authMode = 'in'; renderAll(); return; } }
        else await Cloud.be.signIn(email, pass);
        Cloud.signedIn = true; Cloud.status = 'online'; Cloud.error = '';
        toast('Signed in. Your progress now syncs to the cloud.', 'gold');
        await Cloud.afterSignIn(); renderAll();
      } catch (e) { Cloud.error = String(e.message || e); renderAll(); }
    })();
    return 'norender';
  },
  authReset: () => { const email = ($('#authEmail') || {}).value || ''; if (!email) { Cloud.error = 'Type your email first.'; return; } Cloud.be.resetPassword(email).then(() => toast('Password reset email sent.'), (e) => toast(e.message, 'bad')); return 'norender'; },
  cloudOut: () => { Cloud.be.signOut().then(() => { Cloud.signedIn = false; Cloud.status = 'signed-out'; Cloud.cache = { friends: [], profiles: {}, gifts: [], online: [], players: {} }; renderAll(); }); return 'norender'; },
  cloudSave: () => { Cloud.ok = true; Cloud.push(true).then(() => { toast(Cloud.status === 'online' ? 'Saved to the cloud ☁️' : 'Cloud save failed', Cloud.status === 'online' ? 'gold' : 'bad'); renderAll(); }); return 'norender'; },
  cloudLoad: () => { if (!ui.confirmCloud) { ui.confirmCloud = true; toast('Tap "Load cloud save" again to replace this game with your cloud save.', 'bad'); return 'norender'; } ui.confirmCloud = false; loadCloudGame(); return 'norender'; },
  friendSearch: () => { ui.fq = ($('#friendSearch') || {}).value || ''; const q = ui.fq.trim(); (q ? Cloud.be.searchPlayers(q) : Cloud.be.listPlayers()).then((r) => { Cloud.cache.players = r; renderAll(); }, (e) => toast(e.message, 'bad')); return 'norender'; },
  friendAdd: (a) => { if (Cloud.cache.friends.includes(a)) return 'norender'; const list = [...Cloud.cache.friends, a]; Cloud.be.setFriends(list).then(() => { Cloud.cache.friends = list; Cloud.cache.profiles[a] = Cloud.cache.players[a]; S.stats.friends = list.length; toast('Friend added!', 'gold'); save(); renderAll(); }, (e) => toast(e.message, 'bad')); return 'norender'; },
  friendDel: (a) => { const list = Cloud.cache.friends.filter((x) => x !== a); Cloud.be.setFriends(list).then(() => { Cloud.cache.friends = list; renderAll(); }); return 'norender'; },
  giftSend: (a) => { const [id, k] = a.split(':'); sendGiftTo(id, k); return 'norender'; },
  giftClaim: (a) => { const g = Cloud.cache.gifts.find((x) => String(x.id) === a); if (!g) return 'norender'; Cloud.be.claimGift(g.id).then(() => { (GIFT_KINDS[g.kind] || { apply() {} }).apply(g); Cloud.cache.gifts = Cloud.cache.gifts.filter((x) => x !== g); S.stats.giftsGot = (S.stats.giftsGot || 0) + 1; toast(`Gift claimed: ${(GIFT_KINDS[g.kind] || {}).name || g.kind}`, 'gold'); sound('cash'); save(); renderAll(); }, (e) => toast(e.message, 'bad')); return 'norender'; },
};
ACHIEVEMENTS.push(
  ['friend1', 'Squad up', 'Add your first friend', () => (S.stats.friends || 0) >= 1],
  ['gift10', 'Generous', 'Send 10 gifts to friends', () => (S.stats.giftsSent || 0) >= 10],
);
setTimeout(() => Cloud.start(), 300);
setInterval(() => { if (Cloud.signedIn) Cloud.refresh(); }, 60000);

EVENTS._cloudPick = {
  eyebrow: () => 'Cloud save', title: () => 'You have a different game in the cloud',
  text: (m) => `Your account has a saved game from <b>day ${m.day}</b> (saved ${new Date(m.savedAt).toLocaleString()}). This device is playing a different game on <b>day ${S.day}</b>. Which one do you want to keep?`,
  choices: (m) => [
    { label: `Load the cloud game (day ${m.day})`, sub: 'This device switches to your cloud progress', fn: () => { loadCloudGame(); return null; } },
    { label: `Keep this device's game (day ${S.day})`, sub: 'Replaces the cloud save with this one', fn: () => { Cloud.ok = true; Cloud.push(true); return R('This game is now your cloud save.'); } },
    { label: 'Decide later', sub: 'Cloud sync stays paused until you choose in Friends', fn: () => null },
  ],
};
