/* Clout Chaser — rendering, player actions, boot */
'use strict';

let tab = 'studio';
const ui = {
  studio: { platform: 'pix', format: 'photo', topic: 'niche', tone: 'authentic', effort: 'normal', time: 'prime', tags: [], caption: '', disclose: true },
  lastPost: null, feedView: 'stars', starsView: 'cards', metric: 'f', inboxFilter: 'all', confirmRestart: false, exportCode: '',
  setup: { name: 'Jordan Vale', handle: 'jordanvale', niche: 'lifestyle', diff: 'normal', color: AVATAR_COLORS[0] },
};
const TABS = [['studio', 'Studio'], ['feed', 'Feed'], ['stars', 'Stars'], ['inbox', 'Inbox'], ['deals', 'Deals'], ['shop', 'Shop'], ['team', 'Team'],
  ['empire', 'Empire'], ['life', 'Life'], ['stats', 'Analytics'], ['tea', 'The Tea'], ['trophies', 'Trophies'], ['account', 'Account']];

const CHECK_SVG = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.2l2.3 2.3 4.7-5"/></svg>';
const verified = (paid) => `<span class="check ${paid ? 'paid' : ''}" title="${paid ? 'Paid badge' : 'Verified'}">${CHECK_SVG}</span>`;
const avatar = (name, color, size = '') => `<span class="av ${size}" style="background:${color}" aria-hidden="true">${esc(initials(name))}</span>`;
const npcAv = (id, size = '') => avatar(NPCS[id].name, NPCS[id].color, size);
const meAv = (size = '') => avatar(S.name, S.color, size);
const meBadge = () => S.flags.verified ? verified() : S.flags.paidCheck ? verified(true) : '';
const npcBadge = (id) => NPCS[id].followers >= 1e5 ? verified() : '';
const pdot = (id) => `<span class="dot" style="background:${PLATFORMS[id].color}"></span>`;
const btn = (label, act, arg = '', cls = '', dis = false, title = '') => `<button class="btn ${cls}" data-act="${act}" data-arg="${esc(arg)}" ${dis ? 'disabled' : ''} ${title ? `title="${esc(title)}"` : ''}>${label}</button>`;
const chip = (label, act, arg, on, dis = false, extra = '') => `<button class="chip" data-act="${act}" data-arg="${esc(arg)}" aria-pressed="${on ? 'true' : 'false'}" ${dis ? 'disabled' : ''}>${label}${extra}</button>`;

function toast(msg, cls = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + cls; t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 3200);
  while ($('#toasts').children.length > 4) $('#toasts').firstChild.remove();
}

/* ======================================================================
   Render
   ====================================================================== */
function renderAll() {
  if (!S) return;
  renderHUD(); renderNav(); renderMain(); renderSide();
  const h = $('#hud').offsetHeight; document.documentElement.style.setProperty('--hud-h', h + 'px');
}

function renderHUD() {
  const t = totalFollowers(), ds = S.dayStart || snap();
  const df = t - ds.f, dm = S.money - ds.money;
  const me = maxEnergy();
  const stat = (label, v, d = '', meter = '', sub = '') => `<div class="stat"><div class="label">${label}</div><div class="v">${v}</div>${meter}${d ? `<div class="d">${d}</div>` : ''}${sub ? `<div class="sub">${sub}</div>` : ''}</div>`;
  const m = (pct, cls) => `<div class="meter ${cls}"><i style="width:${clamp(pct, 0, 100)}%"></i></div>`;
  $('#hud').innerHTML = `
    <div class="me">${meAv('lg')}<div style="min-width:0"><div class="me-name">${esc(S.name)} ${meBadge()}</div><div class="me-sub">@${esc(S.handle)} · ${tier().name} · ${NICHES[S.niche].name}</div></div></div>
    <div class="stats">
      ${stat('Followers', fmt(t), `<span class="${df >= 0 ? 'good' : 'bad'}">${signed(df)} today</span>`)}
      ${stat('Engagement', engRate().toFixed(1) + '%', '', '', S.fake > 0 ? `${Math.round((1 - realRatio()) * 100)}% bots` : 'average')}
      ${stat('Reputation', Math.round(S.rep), '', m(S.rep, repClass()), repLabel())}
      ${stat('Heat', Math.round(S.heat), '', m(S.heat, S.heat >= 60 ? 'bad' : S.heat >= 30 ? 'warn' : 'info'), heatLabel())}
      ${stat('Money', money(S.money), dm ? `<span class="${dm >= 0 ? 'good' : 'bad'}">${signedMoney(dm)} today</span>` : '')}
      ${stat('Energy', `${Math.round(S.energy)}<span class="muted" style="font-size:.7em">/${me}</span>`, '', m((S.energy / me) * 100, 'gold'))}
      ${stat('Stress', Math.round(S.stress), '', m(S.stress, S.stress >= 70 ? 'bad' : S.stress >= 40 ? 'warn' : 'good'), stressLabel())}
    </div>
    <div class="day"><div style="text-align:right"><div class="day-n">Day ${S.day}</div><div class="me-sub">${weekday()}${S.day % 30 >= 27 ? ' · awards soon' : ''}</div></div>${btn('End day', 'endDay', '', 'primary')}</div>`;
}

function renderNav() {
  const unread = S.inbox.filter((m) => !m.read).length;
  const active = S.deals.filter((d) => d.status === 'active').length;
  const badges = { inbox: unread, deals: active };
  $('#nav').innerHTML = TABS.map(([id, name]) => `<button data-act="tab" data-arg="${id}" ${tab === id ? 'aria-current="page"' : ''}><span>${name}</span>${badges[id] ? `<span class="badge">${badges[id]}</span>` : ''}</button>`).join('');
}

function renderMain() {
  const fn = { studio: vStudio, feed: vFeed, stars: vStars, inbox: vInbox, deals: vDeals, shop: vShop, team: vTeam, empire: vEmpire, life: vLife, stats: vStats, tea: vTea, trophies: vTrophies, account: vAccount }[tab] || vStudio;
  $('#main').innerHTML = fn();
  if (tab === 'stats') drawChart();
  if (tab === 'studio') bindCaption();
}

function renderSide() {
  const trends = S.trends.map((t) => {
    const fresh = trendFresh(t), fit = trendFits(t);
    const flames = '▲'.repeat(Math.max(1, Math.round(fresh * t.hot * 2.2)));
    return `<div class="trend"><div style="min-width:0"><b>${esc(t.tag)}</b><div class="row" style="gap:4px;margin-top:2px">${fit ? '<span class="pill good">Fits your niche</span>' : ''}${t.edgy ? '<span class="pill warn">Edgy</span>' : ''}<span class="pill">${t.life - (S.day - t.born)}d left</span></div></div><span class="flames" title="Heat of trend">${flames}</span></div>`;
  }).join('');
  const algo = unlockedIds().map((id) => { const [l, c] = algoLabel(S.algo[id]); return `<div class="row between small">${pdot(id)}<span style="flex:1">${PLATFORMS[id].name}</span><span class="pill ${c}">${l} ×${S.algo[id].toFixed(2)}</span></div>`; }).join('');
  const status = [];
  if (S.shadowbanUntil >= S.day) status.push('<span class="pill bad">Shadowbanned</span>');
  if (S.hackedUntil >= S.day) status.push('<span class="pill bad">Account locked</span>');
  if (S.collab) status.push(`<span class="pill accent">Collab with ${esc(npcName(S.collab.npc).split(' ')[0])} · ${S.collab.until - S.day + 1}d</span>`);
  if (S.partner) status.push(`<span class="pill accent">Dating ${esc(npcName(S.partner).split(' ')[0])}</span>`);
  Object.entries(S.npcs).forEach(([id, n]) => { if (n.feud) status.push(`<span class="pill warn">Feud: ${esc(NPCS[id].name.split(' ')[0])}</span>`); });
  if (S.travelUntil >= S.day) status.push('<span class="pill good">Travel content ready</span>');
  $('#side').innerHTML = `
    <div class="card stack tight"><div class="section-head"><h3>Trending now</h3><span class="label">Day ${S.day}</span></div>${trends}</div>
    <div class="card stack tight"><h3>Algorithm mood</h3>${algo}${status.length ? `<hr class="sep"><div class="row">${status.join('')}</div>` : ''}</div>
    <div class="card stack tight"><h3>Activity</h3><div class="log">${S.log.slice(0, 25).map((l) => `<div class="li ${l.c}"><span class="t">D${l.d}</span><span class="m">${esc(l.m)}</span></div>`).join('')}</div></div>`;
}

/* ---------- Studio ---------- */
function vStudio() {
  const st = ui.studio;
  if (!S.platforms[st.platform].unlocked) st.platform = 'pix';
  if (st.platform !== 'live' && FORMATS[st.format].p !== st.platform) st.format = Object.keys(FORMATS).find((f) => FORMATS[f].p === st.platform);
  const topics = topicsFor();
  if (!topics.some((t) => t.id === st.topic)) st.topic = 'niche';
  const plats = Object.entries(PLATFORMS).map(([id, p]) => {
    const ps = S.platforms[id];
    if (!ps.unlocked) {
      const can = canUnlock(id);
      return `<div class="plat locked"><span class="pn">${pdot(id)}${p.name}</span><span class="small muted">${p.kind}</span>${can ? btn('Join now', 'unlock', id, 'sm primary') : `<span class="small muted">Unlocks at ${fmt(p.unlock)} followers</span>`}</div>`;
    }
    const [l, c] = algoLabel(S.algo[id]);
    return `<button class="plat" data-act="plat" data-arg="${id}" aria-pressed="${st.platform === id}"><span class="pn">${pdot(id)}${p.name}</span><span class="pf num">${fmt(ps.followers)}</span><span class="small muted">${ps.eng.toFixed(1)}% eng · <span class="${c}">${l}</span></span></button>`;
  }).join('');

  let composer;
  if (st.platform === 'live') {
    composer = `<div class="card stack">
      <div class="section-head"><h3>Go live on Streamly</h3><span class="label">Chat decides how it goes</span></div>
      <p class="muted">Streams earn donations and Streamly followers. Chat throws surprises at you mid-stream: raids, celebrity drop-ins, sponsor moments.</p>
      <div class="grid">${Object.entries(STREAMS).map(([id, s]) => `<div class="card stack tight"><b>${s.name}</b><span class="small muted">${s.chats} chat moment${s.chats > 1 ? 's' : ''} · ${s.e} energy${s.stress ? ' · +stress' : ''}</span>${btn('Go live', 'stream', id, 'primary', S.energy < s.e)}</div>`).join('')}</div>
      <div class="hint">Estimated viewers: ~${fmt((S.platforms.live.followers * 0.06 + totalFollowers() * 0.002 + 5) * (S.algo.live || 1))}. A streaming PC, mic and higher charisma all help.</div></div>`;
  } else {
    const formats = Object.entries(FORMATS).filter(([, f]) => f.p === st.platform).map(([id, f]) => chip(f.name, 'fmt', id, st.format === id, false, `<span class="cost">${Math.round(f.e * EFFORT[st.effort].e * (S.team.editor && f.video ? 0.8 : 1))}⚡</span>`)).join('');
    const groups = {};
    topics.forEach((t) => { const g = t.group || 'General'; (groups[g] = groups[g] || []).push(t); });
    const topicHtml = Object.entries(groups).map(([g, ts]) => `<div class="row"><span class="label" style="min-width:56px">${g}</span>${ts.map((t) => chip(esc(t.label), 'topic', t.id, st.topic === t.id)).join('')}</div>`).join('');
    const tones = Object.entries(TONES).map(([id, t]) => `<button class="chip" data-act="tone" data-arg="${id}" aria-pressed="${st.tone === id}" title="${esc(t.desc)}">${t.name}</button>`).join('');
    const tags = [...S.trends.map((t) => t.tag), ...NICHES[S.niche].tags, ...GENERIC_TAGS].filter((v, i, a) => a.indexOf(v) === i);
    const cur = topics.find((t) => t.id === st.topic);
    composer = `<div class="composer">
      <div class="card stack">
        <div class="opt-group"><span class="label">Format</span><div class="row">${formats}</div></div>
        <div class="opt-group"><span class="label">Topic</span>${topicHtml}</div>
        <div class="opt-group"><span class="label">Tone</span><div class="row">${tones}</div><span class="small muted">${esc(TONES[st.tone].desc)}</span></div>
        <div class="row" style="gap:18px;align-items:flex-start">
          <div class="opt-group"><span class="label">Effort</span><div class="row">${Object.entries(EFFORT).map(([id, e]) => chip(e.name, 'effort', id, st.effort === id)).join('')}</div></div>
          <div class="opt-group"><span class="label">Post time</span><div class="row">${Object.entries(TIMES).map(([id, e]) => chip(e.name, 'time', id, st.time === id)).join('')}</div></div>
        </div>
        <div class="opt-group"><span class="label">Hashtags (${st.tags.length}/5 · more than 4 looks spammy)</span><div class="row">${tags.map((tg) => chip(esc(tg), 'tag', tg, st.tags.includes(tg), !st.tags.includes(tg) && st.tags.length >= 5)).join('')}</div></div>
        <div class="field"><label class="label" for="caption">Caption (optional, we'll write one if blank)</label><textarea class="input" id="caption" maxlength="220" placeholder="Write your caption. Mentioning a trending topic helps.">${esc(st.caption)}</textarea></div>
        ${cur && cur.deal ? `<label class="row small"><input type="checkbox" id="disclose" data-act="disclose" ${st.disclose ? 'checked' : ''}> Add #ad disclosure <span class="muted">(skipping it boosts engagement but risks a fine)</span></label>` : ''}
      </div>
      <div class="forecast" id="forecast">${forecastHtml()}</div>
    </div>`;
  }
  return `<div class="page-head"><div><div class="label">Creator studio</div><h2>What are we posting?</h2></div><span class="small muted">${S.stats.posts} posts published</span></div>
    <div class="plats">${plats}</div>${composer}${ui.lastPost ? resultHtml(ui.lastPost) : ''}`;
}

function forecastHtml() {
  const st = ui.studio;
  const o = { ...st, caption: ($('#caption') && $('#caption').value) || st.caption };
  const r = computePost(o, true);
  const cur = r.topic;
  const heatTxt = r.heat > 8 ? '<span class="bad">Spicy</span>' : r.heat > 0 ? '<span class="warn">Warm</span>' : '<span class="good">Safe</span>';
  const repTxt = r.rep >= 1 ? '<span class="good">Up</span>' : r.rep <= -1 ? '<span class="bad">Down</span>' : 'Flat';
  const plat = PLATFORMS[st.platform];
  const caption = o.caption.trim() || `${TONES[st.tone].name} post about ${cur.phrase || cur.label}`;
  return `<div class="phone-preview"><div class="post-head">${meAv('sm')}<div class="who small"><b>${esc(S.handle)} ${meBadge()}</b></div><span class="pill">${plat.name}</span></div>
      <div class="ph-media" style="background:${plat.color}">${esc(FORMATS[st.format].name)}<br>${esc(cur.label)}</div>
      <div class="small" style="overflow-wrap:anywhere">${esc(caption)}</div></div>
    <div class="fc-row"><span>Energy cost</span><b class="${S.energy < r.energy ? 'bad' : ''}">${r.energy} / ${Math.round(S.energy)}</b></div>
    <div class="fc-row"><span>Expected views</span><b>~${fmt(r.views)}</b></div>
    <div class="fc-row"><span>Expected followers</span><b>~${signed(r.gain - r.loss)}</b></div>
    <div class="fc-row"><span>Viral chance</span><b>${(r.viralP * 100).toFixed(1)}%</b></div>
    <div class="fc-row"><span>Reputation</span><b>${repTxt}</b></div>
    <div class="fc-row"><span>Heat</span><b>${heatTxt}</b></div>
    ${r.cash > 0.5 ? `<div class="fc-row"><span>Ad revenue</span><b>~${money(r.cash)}</b></div>` : ''}
    ${S.shadowbanUntil >= S.day ? '<div class="pill bad">Shadowbanned: reach cut 75%</div>' : ''}
    ${r.sellout ? '<div class="pill bad">Too many ads lately</div>' : ''}
    <button class="btn primary big" data-act="post" ${S.energy < r.energy || S.hackedUntil >= S.day ? 'disabled' : ''}>Publish</button>
    <span class="small muted">Results vary. Quality, trends, timing and luck all matter.</span>`;
}
function bindCaption() {
  const c = $('#caption'); if (!c) return;
  c.addEventListener('input', () => { ui.studio.caption = c.value; const f = $('#forecast'); if (f) f.innerHTML = forecastHtml(); });
}

function resultHtml(p) {
  return `<div class="card post ${p.viral ? 'viral' : ''}">
    <div class="section-head"><h3>Latest post results</h3><span class="label">${PLATFORMS[p.platform].name} · ${FORMATS[p.format].name}</span></div>
    ${p.viral ? '<div class="banner-viral">IT WENT VIRAL</div>' : ''}${p.flop ? '<div class="banner-flop">It flopped. The algorithm said no.</div>' : ''}
    <div class="post-body">"${esc(p.caption)}"</div>
    <div class="result">
      <div class="kpi"><div class="label">Views</div><div class="v">${fmt(p.views)}</div></div>
      <div class="kpi"><div class="label">Likes</div><div class="v">${fmt(p.likes)}</div></div>
      <div class="kpi"><div class="label">Followers</div><div class="v ${p.gain >= 0 ? 'good' : 'bad'}">${signed(p.gain)}</div></div>
      <div class="kpi"><div class="label">Reputation</div><div class="v ${p.rep >= 0 ? 'good' : 'bad'}">${signed1(p.rep)}</div></div>
    </div>
    <div class="post-metrics"><span><b>${fmt(p.comments)}</b> comments</span><span><b>${fmt(p.shares)}</b> shares</span>${p.cash ? `<span><b>${money(p.cash)}</b> ad revenue</span>` : ''}<span>Quality <b>${Math.round(p.q * 100)}%</b></span></div>
    ${commentsHtml(p)}</div>`;
}
function commentsHtml(p) {
  return `<div class="comments">${p.comms.map((c) => `<div class="cm ${c.npc ? 'celeb' : ''}">${c.npc ? npcAv(c.npc, 'sm') : ''}<div><b>@${esc(c.who)}</b> ${c.npc ? npcBadge(c.npc) : ''} ${esc(c.text)}</div></div>`).join('')}</div>`;
}

/* ---------- Feed ---------- */
function vFeed() {
  const head = `<div class="page-head"><div><div class="label">Timeline</div><h2>Feed</h2></div><div class="row">${chip('Stars', 'feedView', 'stars', ui.feedView === 'stars')}${chip('Your posts', 'feedView', 'mine', ui.feedView === 'mine')}</div></div>`;
  if (ui.feedView === 'mine') {
    if (!S.posts.length) return head + '<div class="card empty">You haven\'t posted yet. Head to the Studio.</div>';
    return head + S.posts.slice(0, 30).map((p) => `<div class="card post ${p.viral ? 'viral' : ''}">
      <div class="post-head">${meAv()}<div class="who"><b>${esc(S.name)} ${meBadge()}</b><span class="small muted">Day ${p.day} · ${pdot(p.platform)} ${PLATFORMS[p.platform].name} · ${FORMATS[p.format].name} · ${esc(TONES[p.tone].name)}</span></div>${p.viral ? '<span class="pill gold">Viral</span>' : p.flop ? '<span class="pill">Flop</span>' : ''}${p.sponsored ? '<span class="pill info">#ad</span>' : ''}</div>
      <div class="post-body">${esc(p.caption)} ${p.tags.map((t) => `<span class="muted">${esc(t)}</span>`).join(' ')}</div>
      <div class="post-metrics"><span><b>${fmt(p.views)}</b> views</span><span><b>${fmt(p.likes)}</b> likes</span><span><b>${fmt(p.comments)}</b> comments</span><span class="${p.gain >= 0 ? 'good' : 'bad'}"><b>${signed(p.gain)}</b> followers</span></div>
      ${commentsHtml(p)}</div>`).join('');
  }
  return head + `<div class="hint">Likes and comments on stars' posts build relationships. A funny comment on a mega-star's post can put you in front of millions. Trolling gets attention too, at a cost.</div>` +
    S.feed.slice(0, 24).map((f) => {
      const n = NPCS[f.npc], st = S.npcs[f.npc];
      return `<div class="card post"><div class="post-head">${npcAv(f.npc)}<div class="who"><b>${esc(n.name)} ${npcBadge(f.npc)}</b><span class="small muted">@${n.handle} · ${n.type} · Day ${f.day}</span></div><span class="pill ${st.rel >= 35 ? 'good' : st.rel <= -25 ? 'bad' : ''}">${relLabel(st.rel)}</span></div>
      <div class="post-body">${esc(f.text)}</div>
      <div class="post-metrics"><span><b>${fmt(f.likes)}</b> likes</span><span><b>${fmt(f.comments)}</b> comments</span></div>
      <div class="row">${btn(f.liked ? 'Liked' : 'Like · 1⚡', 'like', f.id, 'sm', f.liked)}${f.commented ? '<span class="small muted">You commented.</span>' : ['nice:Supportive', 'funny:Funny', 'promo:Self-promo', 'troll:Troll'].map((k) => { const [a, l] = k.split(':'); return btn(l + ' · 3⚡', 'cmt', f.id + ':' + a, 'sm' + (a === 'troll' ? ' danger' : '')); }).join('')}</div></div>`;
    }).join('');
}

/* ---------- Stars ---------- */
function giftCost(id) { const f = S.npcs[id].followers; return f < 1e6 ? 100 : f < 1e7 ? 500 : f < 5e7 ? 2000 : 5000; }
function vStars() {
  const head = `<div class="page-head"><div><div class="label">Influencers & celebrities</div><h2>Stars</h2></div><div class="row">${chip('Relationships', 'starsView', 'cards', ui.starsView === 'cards')}${chip('Leaderboard', 'starsView', 'board', ui.starsView === 'board')}</div></div>`;
  if (ui.starsView === 'board') {
    const rows = Object.entries(S.npcs).map(([id, n]) => ({ id, name: NPCS[id].name, handle: NPCS[id].handle, f: n.followers, type: NPCS[id].type, rep: n.rep }));
    rows.push({ id: 'you', name: S.name, handle: S.handle, f: totalFollowers(), type: `You · ${tier().name}`, rep: S.rep });
    rows.sort((a, b) => b.f - a.f);
    return head + `<div class="card table-wrap"><table class="lb"><thead><tr><th>#</th><th>Creator</th><th>Type</th><th style="text-align:right">Followers</th><th style="text-align:right">Rep</th></tr></thead><tbody>
      ${rows.map((r, i) => `<tr class="${r.id === 'you' ? 'you' : ''}"><td class="num">${i + 1}</td><td><div class="row" style="flex-wrap:nowrap">${r.id === 'you' ? meAv('sm') : npcAv(r.id, 'sm')}<span>${esc(r.name)}</span></div></td><td class="muted">${esc(r.type)}</td><td class="n">${fmt(r.f)}</td><td class="n">${Math.round(r.rep)}</td></tr>`).join('')}
      </tbody></table></div>`;
  }
  const you = totalFollowers();
  const cards = Object.entries(S.npcs).sort((a, b) => b[1].followers - a[1].followers).map(([id, n]) => {
    const N = NPCS[id];
    const relW = Math.abs(n.rel) / 2;
    const bar = `<div class="rel-bar"><i style="${n.rel >= 0 ? `left:50%;width:${relW}%;background:var(--good)` : `right:50%;width:${relW}%;background:var(--bad)`}"></i></div>`;
    const acts = [];
    acts.push(btn(n.following ? 'Unfollow' : 'Follow', 'follow', id, 'sm'));
    acts.push(btn('DM · 5⚡', 'dm', id, 'sm', n.lastDm === S.day));
    acts.push(btn(`Gift · ${money(giftCost(id))}`, 'gift', id, 'sm', n.lastGift === S.day || S.money < giftCost(id)));
    if (!n.feud) {
      acts.push(btn('Ask to collab · 10⚡', 'collab', id, 'sm', !!S.collab || n.rel < 15 || (n.lastAsk && S.day - n.lastAsk < 2), n.rel < 15 ? 'Needs Acquaintance (15+)' : ''));
      acts.push(btn('Ask for shoutout · 5⚡', 'shout', id, 'sm', n.rel < 40 || (n.lastShout && S.day - n.lastShout < 3), n.rel < 40 ? 'Needs Friend (40+)' : ''));
      if (!S.partner && n.rel >= 65) acts.push(btn('Ask on a date', 'date', id, 'sm primary'));
      if (S.partner === id) acts.push(btn('Break up', 'breakup', id, 'sm danger'));
      acts.push(btn('Call out · 10⚡', 'feud', id, 'sm danger'));
    } else acts.push(btn('Make peace · 10⚡', 'makeup', id, 'sm'));
    return `<div class="card person">
      <div class="top">${npcAv(id, 'lg')}<div style="flex:1"><b class="row" style="gap:4px">${esc(N.name)} ${npcBadge(id)}</b><span class="small muted">@${N.handle} · ${N.type}</span></div><div style="text-align:right"><div class="num" style="font-weight:600">${fmt(n.followers)}</div><span class="small muted">rep ${Math.round(n.rep)}</span></div></div>
      <p class="small muted">${esc(N.bio)}</p>
      <div class="rel"><span class="small" style="width:90px">${S.partner === id ? 'Partner' : n.feud ? 'Feuding' : relLabel(n.rel)}</span>${bar}<span class="num small" style="width:34px;text-align:right">${Math.round(n.rel)}</span></div>
      <div class="row">${n.followsYou ? '<span class="pill good">Follows you</span>' : ''}${N.niche === S.niche ? '<span class="pill accent">Same niche</span>' : ''}${you >= n.followers ? '<span class="pill gold">You\'re bigger</span>' : ''}</div>
      <div class="row">${acts.join('')}</div></div>`;
  }).join('');
  return head + `<div class="hint">Relationships fade without contact. Collabs need Acquaintance (15+), shoutouts need Friend (40+), dates need Bestie (65+). Big stars with big egos ignore small accounts, so grow first or charm them.</div><div class="grid wide">${cards}</div>`;
}

/* ---------- Inbox ---------- */
function msgActions(m) {
  switch (m.type) {
    case 'fan': return [['Reply warmly', 'reply'], ['Ignore', 'dismiss']];
    case 'hater': return [['Block', 'block'], ['Clap back', 'clap'], ['Kill with kindness', 'kind']];
    case 'deal': return [['Accept', 'accept'], ['Negotiate', 'negotiate'], ['Decline', 'decline']];
    case 'collab': return [['Accept collab', 'collabYes'], ['Decline', 'collabNo']];
    case 'npc': return [['Reply', 'npcReply'], ['Leave on read', 'dismiss']];
    case 'scam_verify': return [['Verify my account', 'phish'], ['Report as phishing', 'report']];
    case 'scam_invest': return [['Send $500', 'scamPay'], ['Delete', 'report']];
    default: return [['Archive', 'dismiss']];
  }
}
function vInbox() {
  const f = ui.inboxFilter;
  const groups = { all: () => true, offers: (m) => m.type === 'deal' || m.type === 'collab', fans: (m) => m.type === 'fan' || m.type === 'hater', dms: (m) => m.type === 'npc' || m.type === 'system' || m.type.startsWith('scam') };
  const list = S.inbox.filter(groups[f]);
  const open = list.filter((m) => !m.done), done = list.filter((m) => m.done).slice(0, 10);
  const card = (m) => {
    const from = m.npc ? NPCS[m.npc].name : m.from;
    const av = m.npc ? npcAv(m.npc) : avatar(from.replace('@', ''), m.type === 'deal' ? '#44505E' : m.type === 'hater' ? '#9B2C2C' : m.type.startsWith('scam') ? '#6B6B6B' : '#1C8AB8');
    const extra = m.type === 'deal' ? `<div class="row"><span class="pill gold">${money(m.pay)}</span><span class="pill">${m.req} post${m.req > 1 ? 's' : ''}</span><span class="pill">${m.days} days</span>${BRANDS[m.brand].shady ? '<span class="pill bad">Sketchy brand</span>' : ''}</div>` : '';
    return `<div class="card msg ${m.read ? '' : 'unread'}"><div class="from">${av}<div><b>${esc(from)}</b> ${m.npc ? npcBadge(m.npc) : ''}<div class="small muted">${esc(m.subject)} · Day ${m.day}</div></div>${m.type === 'deal' ? '<span class="pill info">Offer</span>' : m.type === 'hater' ? '<span class="pill bad">Hate</span>' : m.type === 'fan' ? '<span class="pill good">Fan</span>' : ''}</div>
      <p>${esc(m.body)}</p>${extra}
      ${m.done ? `<span class="small muted">${esc(m.outcome || 'Handled')}</span>` : `<div class="row">${msgActions(m).map(([l, a], i) => btn(l, 'mact', m.id + ':' + a, i === 0 ? 'sm primary' : 'sm')).join('')}</div>`}</div>`;
  };
  return `<div class="page-head"><div><div class="label">Messages</div><h2>Inbox</h2></div><div class="row">${[['all', 'All'], ['offers', 'Offers'], ['fans', 'Fans & haters'], ['dms', 'DMs']].map(([k, l]) => chip(l, 'inboxFilter', k, f === k)).join('')}${btn('Mark all read', 'readAll', '', 'sm')}</div></div>
    ${open.length ? open.map(card).join('') : '<div class="card empty">Inbox zero. New messages arrive each morning.</div>'}
    ${done.length ? `<h3 style="margin-top:8px">Handled</h3>${done.map(card).join('')}` : ''}`;
}

/* ---------- Deals ---------- */
function vDeals() {
  const active = S.deals.filter((d) => d.status === 'active');
  const past = S.deals.filter((d) => d.status !== 'active').slice(-12).reverse();
  const offers = S.inbox.filter((m) => m.type === 'deal' && !m.done).length;
  return `<div class="page-head"><div><div class="label">Sponsorships</div><h2>Brand deals</h2></div><span class="small muted">${S.stats.deals} completed · ${S.stats.dealsFailed} failed</span></div>
    ${offers ? `<div class="hint">You have ${offers} open offer${offers > 1 ? 's' : ''} in your inbox. ${btn('Open inbox', 'tab', 'inbox', 'sm')}</div>` : ''}
    <div class="grid wide">${active.length ? active.map((d) => {
      const b = BRANDS[d.brand], left = d.deadline - S.day;
      return `<div class="card stack tight"><div class="row between"><b>${esc(b.name)}</b>${b.shady ? '<span class="pill bad">Sketchy</span>' : '<span class="pill good">Reputable</span>'}</div>
        <div class="row between small"><span>${d.done}/${d.req} posts</span><span class="${left <= 1 ? 'bad' : ''}">${left > 0 ? left + ' day' + (left > 1 ? 's' : '') + ' left' : 'Due today'}</span></div>
        <div class="meter gold"><i style="width:${(d.done / d.req) * 100}%"></i></div>
        <div class="row between"><span class="num gold">${money(d.pay)}</span>${btn('Make sponsored post', 'dealPost', d.id, 'sm primary')}</div></div>`;
    }).join('') : '<div class="card empty">No active deals. Offers show up in your inbox as you grow. A talent manager brings more.</div>'}</div>
    ${past.length ? `<div class="card table-wrap"><h3>History</h3><table class="lb"><thead><tr><th>Brand</th><th>Day</th><th>Status</th><th style="text-align:right">Pay</th></tr></thead><tbody>${past.map((d) => `<tr><td>${esc(BRANDS[d.brand].name)}</td><td class="num">${d.day}</td><td><span class="pill ${d.status === 'done' ? 'good' : 'bad'}">${d.status === 'done' ? 'Paid' : 'Failed'}</span></td><td class="n">${money(d.pay)}</td></tr>`).join('')}</tbody></table></div>` : ''}
    <div class="hint">Sketchy brands pay 60% more but can blow up in your face later. Skipping #ad disclosure boosts engagement but can trigger a fine. More than 4 sponsored posts in your last 10 makes fans call you a sellout.</div>`;
}

/* ---------- Shop ---------- */
function vShop() {
  const item = (it) => `<div class="card stack tight"><div class="row between"><b>${esc(it.name)}</b><span class="num">${money(it.price)}</span></div><span class="small muted">${esc(it.desc)}</span>
    ${S.owned[it.id] ? '<span class="pill good">Owned</span>' : btn('Buy', 'buy', it.id, 'sm primary', S.money < it.price)}</div>`;
  const cons = CONSUMABLES.map((c) => `<div class="card stack tight"><div class="row between"><b>${c.name}</b><span class="num">${money(c.price)}</span></div><span class="small muted">${c.desc}</span>${btn('Buy', 'consume', c.id, 'sm', S.money < c.price)}</div>`).join('');
  const growth = GROWTH.map((g) => `<div class="card stack tight"><div class="row between"><b>${g.name}</b><span class="num">${money(g.price)}</span></div><span class="small muted">${g.desc}</span>${g.special === 'check' && S.flags.paidCheck ? '<span class="pill gold">Active</span>' : btn('Buy', 'growth', g.id, 'sm' + (g.n ? ' danger' : ''), S.money < g.price)}</div>`).join('');
  const courses = Object.entries(COURSES).map(([k, c]) => { const l = skillLvl(k); const price = Math.round(c.base * Math.pow(l, 1.6)); return `<div class="card stack tight"><div class="row between"><b>${c.name}</b><span class="num">${l >= 10 ? 'Maxed' : money(price)}</span></div><span class="small muted">${k[0].toUpperCase() + k.slice(1)} ${l} → ${Math.min(10, l + 1)}. ${c.desc}</span>${btn('Enroll', 'course', k, 'sm', l >= 10 || S.money < price)}</div>`; }).join('');
  return `<div class="page-head"><div><div class="label">Spend it</div><h2>Shop</h2></div><span class="num">${money(S.money)} available</span></div>
    <h3>Gear</h3><div class="grid">${SHOP.filter((i) => i.cat === 'Gear').map(item).join('')}</div>
    <h3>Lifestyle</h3><div class="grid">${SHOP.filter((i) => i.cat === 'Lifestyle').map(item).join('')}</div>
    <h3>Courses</h3><div class="grid">${courses}</div>
    <h3>Energy & recovery</h3><div class="grid">${cons}</div>
    <h3>Growth hacks</h3><div class="grid">${growth}</div>`;
}

/* ---------- Team ---------- */
function vTeam() {
  const t = totalFollowers();
  let payroll = 0; Object.keys(S.team).forEach((k) => { if (S.team[k]) payroll += TEAM[k].pay; });
  return `<div class="page-head"><div><div class="label">Staff</div><h2>Your team</h2></div><span class="small muted">Payroll ${money(payroll)}/day</span></div>
    <div class="hint">Hiring costs 3 days of salary up front. If you're in debt for 3 days, everyone quits.</div>
    <div class="grid wide">${Object.entries(TEAM).map(([k, m]) => {
      const hired = !!S.team[k], locked = t < m.req;
      return `<div class="card stack tight"><div class="row between"><b>${m.name}</b><span class="num">${money(m.pay)}/day</span></div><span class="small muted">${m.desc}</span>
        ${hired ? `<div class="row"><span class="pill good">On the team</span>${btn('Let go', 'fire', k, 'sm danger')}</div>` : locked ? `<span class="small muted">Won't work with you until ${fmt(m.req)} followers</span>` : btn(`Hire (${money(m.pay * 3)} up front)`, 'hire', k, 'sm primary', S.money < m.pay * 3)}</div>`;
    }).join('')}</div>`;
}

/* ---------- Empire ---------- */
function vEmpire() {
  const t = totalFollowers();
  const merch = S.merch ? `<div class="stack tight"><div class="row"><span class="pill gold">Level ${S.merch.lvl}</span><span class="small muted">${fmt(S.merch.sold)} units sold</span></div>
      <div class="row">${btn('Drop a new collection · 20⚡', 'merchDrop', '', 'sm primary', S.energy < 20)}${S.merch.lvl < 5 ? btn(`Upgrade quality (${money(5000 * S.merch.lvl ** 2)})`, 'merchUp', '', 'sm', S.money < 5000 * S.merch.lvl ** 2) : ''}</div></div>`
    : t >= 5000 ? btn('Launch merch ($3,000)', 'merchLaunch', '', 'primary', S.money < 3000) : '<span class="small muted">Unlocks at 5K followers.</span>';
  const product = S.product ? `<div class="stack tight"><b>${esc(S.product.name)}</b><span class="small muted">${fmt(S.product.sold)} sold · hype ×${(S.product.hype || 1).toFixed(1)}</span>${btn(`Marketing push (${money(Math.round(2e4 + t * 0.01))})`, 'productPush', '', 'sm', S.money < 2e4 + t * 0.01)}</div>`
    : t >= 2.5e5 ? btn(`Launch ${productName()} ($150K)`, 'productLaunch', '', 'primary', S.money < 1.5e5) : '<span class="small muted">Unlocks at 250K followers.</span>';
  const guests = Object.entries(S.npcs).filter(([, n]) => n.rel >= 20 && !n.feud).map(([id]) => id);
  const pod = S.podcast ? `<div class="stack tight"><span class="small muted">${S.stats.episodes} episodes recorded</span><div class="row">${btn('Solo episode · 30⚡', 'episode', '', 'sm', S.energy < 30 || S.podcast.last === S.day)}${guests.slice(0, 6).map((id) => btn(`with ${esc(NPCS[id].name.split(' ')[0])}`, 'episode', id, 'sm', S.energy < 30 || S.podcast.last === S.day)).join('')}</div>${S.podcast.last === S.day ? '<span class="small muted">One episode a day.</span>' : ''}${!guests.length ? '<span class="small muted">Friends (20+ relationship) can guest.</span>' : ''}</div>`
    : t >= 2e4 ? btn('Launch podcast ($2,000)', 'podcastLaunch', '', 'primary', S.money < 2000) : '<span class="small muted">Unlocks at 20K followers.</span>';
  return `<div class="page-head"><div><div class="label">Business</div><h2>Empire</h2></div><span class="num">${money(S.money)} cash · ${money(S.savings)} saved</span></div>
    <div class="grid wide">
      <div class="card stack"><div class="section-head"><h3>Merch line</h3><span class="label">Daily sales</span></div><p class="small muted">Hoodies, hats, tote bags. Sales scale with real followers and reputation.</p>${merch}</div>
      <div class="card stack"><div class="section-head"><h3>Your own brand</h3><span class="label">Daily sales</span></div><p class="small muted">A real product with your name on it. Big money, big risk.</p>${product}</div>
      <div class="card stack"><div class="section-head"><h3>Podcast</h3><span class="label">ViewTube growth</span></div><p class="small muted">Interview friends, grow your long-form audience, earn ad reads.</p>${pod}</div>
      <div class="card stack"><div class="section-head"><h3>Savings</h3><span class="label">0.06% daily</span></div><p class="small muted">Park cash where your lifestyle can't touch it.</p>
        <div class="row">${btn('Deposit 25%', 'deposit', '0.25', 'sm', S.money <= 0)}${btn('Deposit all', 'deposit', '1', 'sm', S.money <= 0)}${btn('Withdraw all', 'withdraw', '', 'sm', S.savings <= 0)}</div></div>
      <div class="card stack"><div class="section-head"><h3>Charity</h3><span class="label">${money(S.stats.donated)} given</span></div><p class="small muted">Donations build reputation. Bigger gifts matter more.</p>
        <div class="row">${[0.01, 0.05, 0.2].map((p) => btn(`Give ${Math.round(p * 100)}% (${money(Math.max(50, S.money * p))})`, 'donate', String(p), 'sm', S.money < 50)).join('')}</div></div>
    </div>`;
}
function productName() { return `${S.handle} ${{ beauty: 'Cosmetics', gaming: 'Gear', fitness: 'Protein', comedy: 'Hot Sauce', tech: 'Audio', food: 'Snacks', music: 'Headphones', fashion: 'Studio', travel: 'Luggage', lifestyle: 'Home' }[S.niche]}`; }

/* ---------- Life ---------- */
const LIFE = [
  ['grass', 'Touch grass', 'Walk outside without your phone.', 10, '−12 stress'],
  ['gym', 'Hit the gym', 'Endorphins and a little charisma.', 15, '−8 stress, +charisma XP'],
  ['meditate', 'Meditate', 'Ten quiet minutes.', 5, '−8 stress'],
  ['family', 'Family dinner', 'Your mom made your favorite.', 10, '−15 stress'],
  ['replies', 'Reply to comments', 'Talk to your community.', 10, '+engagement, +rep'],
  ['giveaway', 'Host a giveaway', 'Quick growth. Attracts bots.', 10, 'Costs 1% of followers in $'],
  ['meetup', 'Fan meetup', 'Meet fans in person (10K+).', 30, '$1,000, +rep'],
  ['party', 'Industry party', 'Mingle with stars (50K+).', 20, '$500, random star +rel'],
];
function vLife() {
  const t = totalFollowers();
  const locked = (id) => (id === 'meetup' && t < 1e4) || (id === 'party' && t < 5e4);
  return `<div class="page-head"><div><div class="label">Offline</div><h2>Life & skills</h2></div><span class="small muted">Stress ${Math.round(S.stress)} · Energy ${Math.round(S.energy)}</span></div>
    <div class="grid">${LIFE.map(([id, n, d, e, fx]) => `<div class="card stack tight"><b>${n}</b><span class="small muted">${d}</span><span class="small">${fx} · ${e}⚡</span>${btn('Do it', 'life', id, 'sm', S.energy < e || locked(id) || (S.flags['life_' + id] === S.day && id !== 'replies'))}</div>`).join('')}</div>
    <div class="hint">Stress above 80 cuts tomorrow's energy by 30% and lowers post quality. At 100 you burn out. Most life actions can be done once a day.</div>
    <h3>Skills</h3>
    <div class="grid">${Object.entries(S.skills).map(([k, s]) => `<div class="card stack tight"><div class="row between"><b>${k[0].toUpperCase() + k.slice(1)}</b><span class="pill ${s.lvl >= 10 ? 'gold' : ''}">Level ${s.lvl}</span></div>
      <div class="meter info"><i style="width:${s.lvl >= 10 ? 100 : (s.xp / (s.lvl * 60)) * 100}%"></i></div><span class="small muted">${COURSES[k].desc}</span>${btn('Practice · 15⚡', 'practice', k, 'sm', S.energy < 15 || s.lvl >= 10)}</div>`).join('')}</div>`;
}

/* ---------- Stats ---------- */
function vStats() {
  const t = totalFollowers();
  const posts = S.posts;
  const avg = posts.length ? posts.reduce((a, p) => a + p.views, 0) / posts.length : 0;
  const top = posts.slice().sort((a, b) => b.views - a.views).slice(0, 6);
  const maxF = Math.max(...unlockedIds().map((id) => S.platforms[id].followers), 1);
  const kpi = (l, v, cls = '') => `<div class="kpi"><div class="label">${l}</div><div class="v ${cls}">${v}</div></div>`;
  const metrics = [['f', 'Followers'], ['rep', 'Reputation'], ['m', 'Money'], ['e', 'Engagement'], ['h', 'Heat']];
  return `<div class="page-head"><div><div class="label">Creator analytics</div><h2>Analytics</h2></div><span class="small muted">Day ${S.day}</span></div>
    <div class="grid kpi">${kpi('Followers', fmt(t))}${kpi('Real followers', fmt(t - S.fake))}${kpi('Posts', S.stats.posts)}${kpi('Avg views (recent)', fmt(avg))}${kpi('Best post', fmt(S.stats.bestViews))}${kpi('Viral hits', S.stats.viral, 'gold')}${kpi('Lifetime earnings', money(S.stats.earned), 'good')}${kpi('Brand deals', S.stats.deals)}${kpi('Collabs', S.stats.collabs)}${kpi('Streams', S.stats.streams)}${kpi('Scandals', S.stats.cancels, S.stats.cancels ? 'bad' : '')}${kpi('Awards', S.stats.awards, 'gold')}</div>
    <div class="card stack"><div class="section-head"><h3>History</h3><div class="row">${metrics.map(([k, l]) => chip(l, 'metric', k, ui.metric === k)).join('')}</div></div>
      <div class="chart-box"><canvas id="chart" aria-label="History chart"></canvas></div></div>
    <div class="grid wide">
      <div class="card stack"><h3>Followers by platform</h3><div class="bars">${Object.keys(PLATFORMS).map((id) => { const p = S.platforms[id]; return `<div class="bar-row"><span>${pdot(id)} ${PLATFORMS[id].name}</span><div class="track"><i style="width:${p.unlocked ? (p.followers / maxF) * 100 : 0}%;background:${PLATFORMS[id].color}"></i></div><span class="n">${p.unlocked ? fmt(p.followers) : 'Locked'}</span></div>`; }).join('')}</div></div>
      <div class="card stack"><h3>Engagement by platform</h3><div class="bars">${unlockedIds().map((id) => { const p = S.platforms[id]; return `<div class="bar-row"><span>${pdot(id)} ${PLATFORMS[id].name}</span><div class="track"><i style="width:${clamp(p.eng * realRatio() / 20 * 100, 0, 100)}%;background:${PLATFORMS[id].color}"></i></div><span class="n">${(p.eng * realRatio()).toFixed(1)}%</span></div>`; }).join('')}</div></div>
    </div>
    <div class="card table-wrap"><h3>Top posts</h3>${top.length ? `<table class="lb"><thead><tr><th>Day</th><th>Post</th><th>Platform</th><th style="text-align:right">Views</th><th style="text-align:right">Followers</th></tr></thead><tbody>${top.map((p) => `<tr><td class="num">${p.day}</td><td>${esc(p.caption.slice(0, 60))}${p.caption.length > 60 ? '…' : ''} ${p.viral ? '<span class="pill gold">Viral</span>' : ''}</td><td>${PLATFORMS[p.platform].name}</td><td class="n">${fmt(p.views)}</td><td class="n">${signed(p.gain)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">No posts yet.</p>'}</div>`;
}

function drawChart() {
  const cv = $('#chart'); if (!cv) return;
  const box = cv.parentElement; const dpr = window.devicePixelRatio || 1;
  const W = box.clientWidth, H = box.clientHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const css = getComputedStyle(document.documentElement);
  const col = (n) => css.getPropertyValue(n).trim();
  const key = ui.metric;
  const data = S.history.map((h) => ({ x: h.d, y: h[key] ?? 0 }));
  const color = { f: col('--accent'), rep: col('--good'), m: col('--gold'), e: col('--info'), h: col('--bad') }[key];
  const fmtY = key === 'm' ? money : key === 'e' ? (v) => v.toFixed(1) + '%' : key === 'f' ? fmt : (v) => Math.round(v);
  const pad = { l: 58, r: 14, t: 12, b: 26 };
  g.clearRect(0, 0, W, H);
  g.font = `11px ${col('--f-mono') || 'monospace'}`;
  if (data.length < 2) { g.fillStyle = col('--muted'); g.fillText('End a day or two to see your history.', pad.l, H / 2); return; }
  let minY = Math.min(...data.map((d) => d.y)), maxY = Math.max(...data.map((d) => d.y));
  if (key === 'rep' || key === 'h') { minY = 0; maxY = 100; }
  if (key === 'f' || key === 'e') minY = Math.min(0, minY);
  if (maxY === minY) maxY = minY + 1;
  const x0 = data[0].x, x1 = data[data.length - 1].x;
  const X = (x) => pad.l + ((x - x0) / Math.max(1, x1 - x0)) * (W - pad.l - pad.r);
  const Y = (y) => pad.t + (1 - (y - minY) / (maxY - minY)) * (H - pad.t - pad.b);
  g.strokeStyle = col('--line'); g.fillStyle = col('--muted'); g.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const v = minY + ((maxY - minY) * i) / 4, y = Y(v);
    g.beginPath(); g.moveTo(pad.l, y); g.lineTo(W - pad.r, y); g.stroke();
    g.textAlign = 'right'; g.fillText(fmtY(v), pad.l - 8, y + 4);
  }
  g.textAlign = 'center';
  const steps = Math.min(6, x1 - x0);
  for (let i = 0; i <= steps; i++) { const d = Math.round(x0 + ((x1 - x0) * i) / Math.max(1, steps)); g.fillText('D' + d, X(d), H - 8); }
  const grad = g.createLinearGradient(0, pad.t, 0, H - pad.b);
  grad.addColorStop(0, color + '55'); grad.addColorStop(1, color + '00');
  g.beginPath(); data.forEach((d, i) => (i ? g.lineTo(X(d.x), Y(d.y)) : g.moveTo(X(d.x), Y(d.y))));
  g.lineTo(X(x1), Y(minY)); g.lineTo(X(x0), Y(minY)); g.closePath(); g.fillStyle = grad; g.fill();
  g.beginPath(); data.forEach((d, i) => (i ? g.lineTo(X(d.x), Y(d.y)) : g.moveTo(X(d.x), Y(d.y))));
  g.strokeStyle = color; g.lineWidth = 2.2; g.lineJoin = 'round'; g.stroke();
  const last = data[data.length - 1];
  g.beginPath(); g.arc(X(last.x), Y(last.y), 4.5, 0, Math.PI * 2); g.fillStyle = color; g.fill();
  g.textAlign = 'right'; g.fillStyle = col('--ink'); g.font = `600 12px ${col('--f-mono') || 'monospace'}`;
  g.fillText(fmtY(last.y), Math.min(W - pad.r, X(last.x) - 8), Math.max(pad.t + 12, Y(last.y) - 10));
}

/* ---------- Tea ---------- */
function vTea() {
  return `<div class="page-head"><div><div class="label">Gossip</div><h2>The Tea</h2></div><span class="small muted">What everyone's talking about</span></div>
    <div class="card">${S.news.slice(0, 40).map((n) => `<div class="news ${n.you ? 'you' : ''}"><span class="nd">Day ${n.d}</span><div class="nh">${esc(n.m)}</div></div>`).join('')}</div>`;
}

/* ---------- Trophies ---------- */
function vTrophies() {
  const t = totalFollowers(), ti = tierIndex(t);
  const got = ACHIEVEMENTS.filter(([id]) => S.achievements[id]).length;
  return `<div class="page-head"><div><div class="label">Progress</div><h2>Trophies</h2></div><span class="small muted">${got}/${ACHIEVEMENTS.length} achievements</span></div>
    <div class="card stack"><h3>Creator tier</h3><div class="ladder">${TIERS.map((x, i) => `<div class="rung ${i <= ti ? 'on' : ''}"><b>${x.name}</b><span class="muted">${fmt(x.min)}+</span></div>`).join('')}</div>
      ${ti < TIERS.length - 1 ? `<span class="small muted">${fmt(TIERS[ti + 1].min - t)} followers to ${TIERS[ti + 1].name}. Win: 100M followers with 60+ reputation.</span>` : '<span class="small gold">Top tier reached.</span>'}</div>
    ${(S.awards || []).length ? `<div class="card stack"><h3>Clout Awards</h3><div class="row">${S.awards.map((a) => `<span class="pill gold">${esc(a.cat)} · Day ${a.d}</span>`).join('')}</div></div>` : ''}
    <div class="grid">${ACHIEVEMENTS.map(([id, name, desc]) => { const on = S.achievements[id]; return `<div class="card ach ${on ? 'on' : 'off'}"><span class="medal">${on ? '★' : '·'}</span><div><b>${name}</b><div class="small muted">${desc}${on ? ` · Day ${on}` : ''}</div></div></div>`; }).join('')}</div>`;
}

/* ---------- Account ---------- */
function vAccount() {
  return `<div class="page-head"><div><div class="label">Settings</div><h2>Account</h2></div></div>
    <div class="card stack"><div class="row">${meAv('xl')}<div><h3>${esc(S.name)} ${meBadge()}</h3><span class="muted">@${esc(S.handle)} · ${NICHES[S.niche].name} · ${S.diff[0].toUpperCase() + S.diff.slice(1)} difficulty</span></div></div></div>
    <div class="card stack"><h3>Settings</h3><label class="row"><input type="checkbox" id="optSound" data-act="sound" ${S.settings.sound ? 'checked' : ''}> Sound effects</label></div>
    <div class="card stack"><h3>Save</h3><p class="small muted">The game saves automatically in this browser. Copy a save code to move your progress to another device.</p>
      <div class="row">${btn('Generate save code', 'exportSave', '', 'sm')}${ui.exportCode ? btn('Copy code', 'copySave', '', 'sm primary') : ''}</div>
      ${ui.exportCode ? `<textarea class="input mono small" id="exportBox" readonly rows="3">${esc(ui.exportCode)}</textarea>` : ''}
      <label class="label" for="importBox">Load a save code</label><textarea class="input mono small" id="importBox" rows="2" placeholder="Paste a save code"></textarea>${btn('Load save', 'importSave', '', 'sm')}</div>
    <div class="card stack"><h3>Start over</h3>${ui.confirmRestart ? `<p>This deletes your current account for good.</p><div class="row">${btn('Yes, delete and restart', 'restart', 'yes', 'danger')}${btn('Cancel', 'restart', 'no')}</div>` : btn('Restart game', 'restart', '', 'danger')}</div>
    <div class="card stack"><h3>How to play</h3><div class="small stack tight">
      <p><b>Each day</b> you have energy for posts and actions. Hit <b>End day</b> to sleep: growth, income, salaries, trends, messages and random events all happen overnight.</p>
      <p><b>Posts</b> combine platform, format, topic, tone, effort, timing and hashtags. Trends that fit your niche and fresh trends reach further. Rage bait and controversial takes reach the most but burn reputation and raise heat.</p>
      <p><b>Heat</b> at 100 gets you cancelled. <b>Reputation</b> at 0 gets you deplatformed. <b>Stress</b> at 100 burns you out.</p>
      <p><b>Stars</b> can collab, shout you out, date you, or feud with you. Relationships fade without contact.</p>
      <p><b>Win</b> by reaching 100M followers with 60+ reputation. Or just chase every trophy.</p></div></div>`;
}

/* ======================================================================
   Actions
   ====================================================================== */
function needEnergy(n) { if (S.energy < n) { toast(`You need ${n} energy. End the day to recharge.`, 'bad'); return false; } S.energy -= n; S.stress = clamp(S.stress + n * 0.08, 0, 100); return true; }
function once(key) { if (S.flags[key] === S.day) { toast('Already done today.', 'bad'); return false; } S.flags[key] = S.day; return true; }
function ratio(id) { return Math.min(1, totalFollowers() / S.npcs[id].followers); }

const ACT = {
  tab: (a) => { tab = a; if (a === 'inbox') setTimeout(() => { S.inbox.forEach((m) => { m.read = true; }); renderNav(); save(); }, 1200); window.scrollTo({ top: 0 }); },
  endDay: () => { ui.lastPost = null; endDay(); sound('click'); processQueue(); },
  plat: (a) => { ui.studio.platform = a; },
  unlock: (a) => { unlockPlatform(a); ui.studio.platform = a; },
  fmt: (a) => { ui.studio.format = a; },
  topic: (a) => { ui.studio.topic = a; },
  tone: (a) => { ui.studio.tone = a; },
  effort: (a) => { ui.studio.effort = a; },
  time: (a) => { ui.studio.time = a; },
  tag: (a) => { const t = ui.studio.tags; const i = t.indexOf(a); if (i >= 0) t.splice(i, 1); else if (t.length < 5) t.push(a); },
  disclose: () => { ui.studio.disclose = !ui.studio.disclose; },
  post: () => {
    const c = $('#caption'); if (c) ui.studio.caption = c.value;
    const p = doPost({ ...ui.studio, tags: [...ui.studio.tags] });
    if (p) { ui.lastPost = p; ui.studio.caption = ''; processQueue(); }
  },
  stream: (a) => startStream(a),
  feedView: (a) => { ui.feedView = a; },
  starsView: (a) => { ui.starsView = a; },
  inboxFilter: (a) => { ui.inboxFilter = a; },
  metric: (a) => { ui.metric = a; },
  like: (a) => {
    const f = S.feed.find((x) => x.id === +a); if (!f || f.liked || !needEnergy(1)) return;
    f.liked = true; f.likes++; changeRel(f.npc, 1.5);
  },
  cmt: (a) => {
    const [id, kind] = a.split(':'); const f = S.feed.find((x) => x.id === +id); if (!f || f.commented || !needEnergy(3)) return;
    f.commented = true; const n = S.npcs[f.npc], N = NPCS[f.npc];
    const vis = Math.min(n.followers * 0.00002 * rnd(0.5, 2), Math.max(totalFollowers() * 0.2, 150));
    if (kind === 'nice') { changeRel(f.npc, 3); addFollowers(vis * 0.2); toast(`${N.name.split(' ')[0]} liked your comment`); }
    if (kind === 'funny') {
      if (chance(0.3 + skillLvl('charisma') * 0.05)) { changeRel(f.npc, 4); addFollowers(vis * diffM()); addXp('charisma', 6); toast(`Your comment is the top reply. ${signed(vis)} followers`, 'gold'); log(`Top comment on ${N.name}'s post.`, 'good'); }
      else toast('Your joke got 3 likes. One was your mom.');
    }
    if (kind === 'promo') { changeRel(f.npc, -3); addFollowers(vis * 0.4); changeRep(-0.3); toast('Some clicks, some eye-rolls.'); }
    if (kind === 'troll') { changeRel(f.npc, -12); addFollowers(vis * 1.5 * diffM()); changeRep(-1.5 * sev()); S.heat = clamp(S.heat + 6, 0, 100); toast(`${N.name.split(' ')[0]}'s fans are coming for you.`, 'bad'); if (chance(N.drama * 0.25)) S.queue.push({ ev: 'npc_callout', ctx: { npc: f.npc } }); }
    checkAll(); processQueue();
  },
  follow: (a) => {
    const n = S.npcs[a]; n.following = !n.following;
    if (n.following) { if (!n.everFollowed) { changeRel(a, 2); n.everFollowed = true; } if (!n.followsYou && chance(clamp(0.05 + n.rel / 120 + ratio(a) * 0.6 - NPCS[a].ego * 0.2, 0.01, 0.9))) { n.followsYou = true; changeRel(a, 3); toast(`${NPCS[a].name} followed you back!`, 'gold'); log(`${NPCS[a].name} followed you back.`, 'gold'); } }
  },
  dm: (a) => {
    const n = S.npcs[a], N = NPCS[a]; if (!needEnergy(5)) return; n.lastDm = S.day;
    const p = clamp(0.15 + n.rel / 150 + ratio(a) * 0.6 - N.ego * 0.25 + (S.rep - 50) / 200, 0.03, 0.95);
    if (chance(p)) { changeRel(a, 5); mail({ type: 'npc', npc: a, subject: 'Re: hey', body: pick(['haha thanks for reaching out! love what you are doing', 'appreciate you! let\'s link sometime', 'omg hi, I actually watch your stuff', 'sure, what did you have in mind?']) }); toast(`${N.name} replied. Check your inbox.`, 'gold'); }
    else { toast(`Seen by ${N.name.split(' ')[0]}. No reply.`); }
  },
  gift: (a) => {
    const n = S.npcs[a], cost = giftCost(a); if (!spend(cost)) return toast('Not enough money.', 'bad');
    n.lastGift = S.day; const d = Math.round(rnd(6, 12) * (1 - NPCS[a].ego * 0.4)); changeRel(a, d); toast(`${NPCS[a].name.split(' ')[0]} loved the gift (+${d})`);
  },
  collab: (a) => {
    const n = S.npcs[a], N = NPCS[a]; if (!needEnergy(10)) return; n.lastAsk = S.day;
    const p = clamp(0.1 + n.rel / 120 + ratio(a) * 0.8 - N.ego * 0.3 + (S.rep - 50) / 150 - (S.heat > 60 ? 0.2 : 0), 0.02, 0.92);
    if (chance(p)) { S.collab = { npc: a, until: S.day + 4 }; changeRel(a, 4); toast(`${N.name} said yes! Post the collab within 4 days.`, 'gold'); log(`${N.name} agreed to collab.`, 'gold'); }
    else { changeRel(a, -2); toast(`${N.name.split(' ')[0]}'s team: "not a fit right now".`); }
  },
  shout: (a) => {
    const n = S.npcs[a], N = NPCS[a]; if (!needEnergy(5)) return; n.lastShout = S.day;
    const p = clamp(n.rel / 150 + ratio(a) * 0.5 - N.ego * 0.2 + 0.1, 0.05, 0.8);
    if (chance(p)) { const g = Math.min(n.followers * 0.0015 * rnd(0.5, 1.5), Math.max(totalFollowers() * 0.6, 2000)) * diffM(); addFollowers(g); changeRel(a, -3); toast(`${N.name} shouted you out: ${signed(g)} followers`, 'gold'); log(`${N.name} shouted you out (${signed(g)}).`, 'gold'); }
    else { changeRel(a, -4); toast(`${N.name.split(' ')[0]} politely passed.`); }
  },
  feud: (a) => {
    const n = S.npcs[a], N = NPCS[a]; if (!needEnergy(10)) return;
    n.feud = true; S.stats.feuds++;
    const boost = clamp(Math.log10(n.followers / Math.max(100, totalFollowers())) * 0.03, 0.01, 0.15);
    const chips = applyFx({ fp: boost, rep: -4, heat: 18, rel: { [a]: -40 } });
    news(`@${S.handle} calls out ${N.name}. The internet grabs popcorn.`, true);
    log(`You called out ${N.name}. ${chips.map((c) => c[0] + ' ' + c[1]).join(', ')}`, 'bad');
    if (S.partner === a) S.queue.push({ ev: 'breakup', ctx: {} });
    if (chance(0.4 + N.drama * 0.4)) S.queue.push({ ev: 'diss_reply', ctx: { npc: a } });
    checkAll(); processQueue();
  },
  makeup: (a) => {
    const n = S.npcs[a], N = NPCS[a]; if (!needEnergy(10)) return;
    if (chance(0.3 + N.kind * 0.4 + n.rel / 200)) { n.feud = false; changeRel(a, 25); changeRep(2); toast(`You and ${N.name.split(' ')[0]} squashed the beef.`, 'gold'); news(`@${S.handle} and ${N.name} end their feud`, true); }
    else { changeRel(a, -5); S.heat = clamp(S.heat + 3, 0, 100); toast(`${N.name.split(' ')[0]} isn't ready to forgive.`, 'bad'); }
  },
  date: (a) => {
    const n = S.npcs[a], N = NPCS[a]; if (!needEnergy(10)) return;
    if (chance(clamp(0.3 + n.rel / 300 + ratio(a) * 0.3, 0.1, 0.9))) {
      S.partner = a; S.stats.dates++;
      applyFx({ fp: 0.05 }); news(`It's official: @${S.handle} and ${N.name} are dating`, true); log(`You're dating ${N.name}.`, 'gold'); toast(`You and ${N.name} are official!`, 'gold'); sound('viral');
    } else { changeRel(a, -10); toast(`${N.name.split(' ')[0]} sees you as a friend.`); }
  },
  breakup: () => { S.queue.push({ ev: 'breakup', ctx: {} }); processQueue(); },
  mact: (a) => {
    const [id, act] = a.split(':'); const m = S.inbox.find((x) => x.id === +id); if (!m || m.done) return;
    m.read = true;
    const fin = (o) => { m.done = true; m.outcome = o; };
    switch (act) {
      case 'dismiss': fin('Archived'); break;
      case 'reply': if (!needEnergy(2)) return; changeRep(0.3); unlockedIds().forEach((p) => { S.platforms[p].eng += 0.05; }); fin('You replied. They screenshotted it.'); break;
      case 'block': fin('Blocked.'); break;
      case 'clap': changeRep(-0.8 * sev()); S.heat = clamp(S.heat + 4, 0, 100); addFollowers(totalFollowers() * 0.002); fin('Your clapback got more likes than your last post.'); break;
      case 'kind': changeRep(0.8); fin(chance(0.3) ? 'They apologized and followed you.' : 'No reply, but bystanders noticed.'); break;
      case 'accept': {
        const d = { id: uid(), brand: m.brand, pay: m.pay, req: m.req, done: 0, day: S.day, deadline: S.day + m.days, status: 'active' };
        S.deals.push(d); fin(`Accepted. ${m.req} post${m.req > 1 ? 's' : ''} due by day ${d.deadline}.`); toast(`Deal signed with ${BRANDS[m.brand].name}`, 'gold'); break;
      }
      case 'negotiate': {
        if (chance(0.45 + skillLvl('business') * 0.05 + (S.team.manager ? 0.15 : 0))) { m.pay = Math.round(m.pay * 1.3); toast(`${BRANDS[m.brand].name} agreed to ${money(m.pay)}.`, 'gold'); m.negotiated = true; addXp('business', 15); return renderAll(); }
        fin('They walked away.'); toast('Negotiation failed. Offer withdrawn.', 'bad'); addXp('business', 8); break;
      }
      case 'decline': fin('Declined.'); break;
      case 'collabYes': if (S.collab) return toast('Finish your current collab first.', 'bad'); S.collab = { npc: m.npc, until: S.day + 4 }; changeRel(m.npc, 3); fin('Collab on! Post it from the Studio within 4 days.'); break;
      case 'collabNo': changeRel(m.npc, -3); fin('Declined.'); break;
      case 'npcReply': changeRel(m.npc, 3); fin('Replied.'); break;
      case 'phish': fin('You entered your password...'); S.queue.push({ ev: 'hacked_scam', ctx: {} }); processQueue(); break;
      case 'report': fin('Reported. Good catch.'); break;
      case 'scamPay': if (!spend(500)) return toast('Not enough money.', 'bad'); fin('The "prince" stopped replying. $500 gone.'); log('Lost $500 to a crypto scam.', 'bad'); break;
    }
  },
  readAll: () => { S.inbox.forEach((m) => { m.read = true; }); },
  dealPost: (a) => { ui.studio.topic = 'deal:' + a; tab = 'studio'; },
  buy: (a) => {
    const it = SHOP.find((x) => x.id === a); if (S.owned[a]) return; if (!spend(it.price)) return toast('Not enough money.', 'bad');
    S.owned[a] = true; log(`Bought: ${it.name}.`, 'good'); toast(`Bought ${it.name}`); sound('cash');
    if (it.cat === 'Lifestyle') news(`@${S.handle} shows off a new ${it.name.toLowerCase()}`, true);
    checkAll();
  },
  consume: (a) => {
    const c = CONSUMABLES.find((x) => x.id === a); if (!spend(c.price)) return toast('Not enough money.', 'bad');
    if (c.special === 'vacation') {
      S.day += 3; S.stress = 0; S.energy = maxEnergy(); S.travelUntil = S.day + 3; S.lastPostDay = S.day - 1; S.stats.vacations++;
      addFollowersPct(-0.01); log('Back from Bali. Travel content ready to post.', 'good'); toast('Back from vacation, fully recharged', 'gold'); S.dayStart = snap();
    } else { const chips = applyFx(c.fx); toast(`${c.name}: ${chips.map((x) => x[0] + ' ' + x[1]).join(', ')}`); }
  },
  growth: (a) => {
    const g = GROWTH.find((x) => x.id === a); if (!spend(g.price)) return toast('Not enough money.', 'bad');
    if (g.n) { S.platforms.pix.followers += g.n; S.fake += g.n; S.stats.bought++; log(`Bought ${fmt(g.n)} bot followers.`, 'bad'); toast(`${signed(g.n)} followers. They aren't real.`); }
    else if (g.special === 'check') { S.flags.paidCheck = true; changeRep(-2); toast('Paid badge active. People can tell.'); }
    else if (g.special === 'ads') { const n = Math.round(g.price * rnd(2, 5) * clamp(engRate() / 5, 0.5, 1.5)); addFollowers(n); toast(`Ad campaign brought ${signed(n)} followers`); log(`Ran an ad campaign: ${signed(n)} followers.`); }
    checkAll();
  },
  course: (a) => {
    const l = skillLvl(a); const price = Math.round(COURSES[a].base * Math.pow(l, 1.6)); if (l >= 10) return; if (!spend(price)) return toast('Not enough money.', 'bad');
    S.skills[a].lvl++; S.skills[a].xp = 0; toast(`${a[0].toUpperCase() + a.slice(1)} is now level ${l + 1}`, 'gold'); log(`Finished ${COURSES[a].name}.`, 'good'); checkAll();
  },
  hire: (a) => { const m = TEAM[a]; if (!spend(m.pay * 3)) return toast('Not enough money.', 'bad'); S.team[a] = true; if (a === 'assistant') S.energy += 20; log(`Hired a ${m.name.toLowerCase()}.`, 'good'); toast(`${m.name} hired`); checkAll(); },
  fire: (a) => { S.team[a] = false; log(`Let your ${TEAM[a].name.toLowerCase()} go.`); },
  merchLaunch: () => { if (!spend(3000)) return; S.merch = { lvl: 1, sold: 0, boost: 2 }; log('Merch line launched.', 'gold'); news(`@${S.handle} drops a merch line`, true); toast('Merch is live. Sales arrive daily.', 'gold'); checkAll(); },
  merchUp: () => { const c = 5000 * S.merch.lvl ** 2; if (!spend(c)) return; S.merch.lvl++; toast(`Merch quality level ${S.merch.lvl}`); },
  merchDrop: () => { if (!needEnergy(20)) return; S.merch.boost += 3; const chips = applyFx({ fp: 0.005 }); toast('New collection dropped. Expect a sales spike tonight.', 'gold'); log('Dropped a merch collection.' + (chips.length ? ' ' + chips[0][1] + ' followers.' : '')); },
  productLaunch: () => { if (!spend(1.5e5)) return; S.product = { name: productName(), sold: 0, hype: 4 }; log(`Launched ${S.product.name}.`, 'gold'); news(`@${S.handle} launches ${S.product.name}`, true); toast('Your brand is live!', 'gold'); checkAll(); },
  productPush: () => { const c = Math.round(2e4 + totalFollowers() * 0.01); if (!spend(c)) return; S.product.hype += 2; toast('Marketing push running. Sales up for a few days.'); },
  podcastLaunch: () => { if (!spend(2000)) return; S.podcast = { last: 0 }; S.platforms.tube.unlocked = true; log('Podcast launched on ViewTube.', 'gold'); toast('Podcast launched', 'gold'); checkAll(); },
  episode: (a) => {
    if (S.podcast.last === S.day) return; if (!needEnergy(30)) return; S.podcast.last = S.day; S.stats.episodes++;
    const guest = a || null;
    let g = Math.max(50, totalFollowers() * 0.006) * (1 + skillLvl('charisma') * 0.05);
    if (guest) { g += Math.min(S.npcs[guest].followers * 0.0006, Math.max(totalFollowers() * 0.5, 1000)); changeRel(guest, 6); }
    g *= diffM();
    S.platforms.tube.followers += g; addFollowers(g * 0.2);
    const cash = Math.round(totalFollowers() * 0.002 * (1 + skillLvl('business') * 0.05));
    S.money += cash; S.stats.earned += cash; S.lastPostDay = S.day; addXp('charisma', 10);
    toast(`Episode out: ${signed(g * 1.2)} followers, ${money(cash)} ad reads`, 'gold');
    log(`Recorded a podcast episode${guest ? ' with ' + npcName(guest) : ''}.`, 'good'); checkAll();
  },
  deposit: (a) => { const amt = Math.floor(Math.max(0, S.money) * +a); S.money -= amt; S.savings += amt; toast(`Deposited ${money(amt)}`); },
  withdraw: () => { S.money += S.savings; toast(`Withdrew ${money(S.savings)}`); S.savings = 0; },
  donate: (a) => {
    const amt = Math.round(Math.max(50, S.money * +a)); if (!spend(amt)) return toast('Not enough money.', 'bad');
    const r = clamp(Math.log10(amt) * 1.1 - 1, 0.3, 7) * (S.flags.lastDonate === S.day ? 0.3 : 1); S.flags.lastDonate = S.day;
    changeRep(r); S.stats.donated += amt; S.heat = clamp(S.heat - r * 2, 0, 100);
    toast(`Donated ${money(amt)}. Reputation +${r.toFixed(1)}`, 'gold'); log(`Donated ${money(amt)} to charity.`, 'good');
    if (amt >= 1e5) news(`@${S.handle} quietly donates ${money(amt)} to charity`, true);
    checkAll();
  },
  life: (a) => {
    const def = LIFE.find((x) => x[0] === a); const e = def[3];
    if (a !== 'replies' && !once('life_' + a)) return;
    if (a === 'meetup' && S.money < 1000) return toast('Meetups cost $1,000.', 'bad');
    if (a === 'party' && S.money < 500) return toast('The party costs $500.', 'bad');
    if (a === 'giveaway' && S.money < Math.max(100, totalFollowers() * 0.01)) return toast('Not enough money for prizes.', 'bad');
    if (!needEnergy(e)) { S.flags['life_' + a] = null; return; }
    let msg = '';
    switch (a) {
      case 'grass': S.stress = clamp(S.stress - 12, 0, 100); msg = 'Birds exist. Who knew.'; break;
      case 'gym': S.stress = clamp(S.stress - 8, 0, 100); addXp('charisma', 8); msg = 'Pump achieved.'; break;
      case 'meditate': S.stress = clamp(S.stress - 8, 0, 100); msg = 'Ommm.'; break;
      case 'family': S.stress = clamp(S.stress - 15, 0, 100); msg = 'Grandma asked what you do for work again.'; break;
      case 'replies': unlockedIds().forEach((p) => { S.platforms[p].eng = clamp(S.platforms[p].eng + 0.25, 0.5, 30); }); changeRep(0.4); msg = 'Fans feel seen.'; break;
      case 'giveaway': { const cost = Math.round(Math.max(100, totalFollowers() * 0.01)); S.money -= cost; const g = Math.max(80, totalFollowers() * 0.04) * diffM(); addFollowers(g); S.fake += g * 0.3; S.stats.giveaways++; msg = `${signed(g)} followers. Some are clearly bots.`; break; }
      case 'meetup': { S.money -= 1000; changeRep(3); addFollowersPct(0.01); S.stats.meetups++; msg = 'Hugs, selfies, and one fan who cried.'; if (!S.team.bodyguard && chance(0.12)) S.queue.push({ ev: 'stalker', ctx: {} }); break; }
      case 'party': { S.money -= 500; const id = randomNpc((x) => !S.npcs[x].feud); changeRel(id, 8); S.stress = clamp(S.stress - 10, 0, 100); msg = `You hit it off with ${npcName(id)}.`; if (chance(0.15)) S.queue.push({ ev: 'paparazzi', ctx: {} }); break; }
    }
    toast(msg); checkAll(); processQueue();
  },
  practice: (a) => { if (!needEnergy(15)) return; addXp(a, 25); toast(`Practiced ${a}.`); },
  sound: () => { S.settings.sound = !S.settings.sound; },
  exportSave: () => { try { ui.exportCode = btoa(unescape(encodeURIComponent(JSON.stringify(S)))); } catch (e) { toast('Could not create a save code.', 'bad'); } },
  copySave: () => {
    const box = $('#exportBox');
    const fallback = () => { if (box) { box.focus(); box.select(); } toast('Select the code and copy it manually.'); };
    try { navigator.clipboard.writeText(ui.exportCode).then(() => toast('Save code copied'), fallback); } catch (e) { fallback(); }
    return 'norender';
  },
  importSave: () => {
    const v = ($('#importBox') || {}).value || '';
    try { const s = JSON.parse(decodeURIComponent(escape(atob(v.trim())))); if (!s || s.v !== 1 || !s.platforms) throw new Error('bad'); S = s; modalBusy = false; $('#modal').hidden = true; save(); toast('Save loaded', 'gold'); }
    catch (e) { toast('That code is not a valid save. Paste the whole code.', 'bad'); }
  },
  restart: (a) => {
    if (a === 'yes') { wipeSave(); S = null; ui.confirmRestart = false; showStart(); return 'norender'; }
    ui.confirmRestart = a !== 'no';
  },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const act = el.dataset.act;
  if (act.startsWith('setup')) return; // handled by start screen
  if (!S || !ACT[act]) return;
  if (modalBusy && !el.closest('#modal')) return;
  const res = ACT[act](el.dataset.arg || '', el);
  if (res === 'norender') return;
  if (S) { save(); renderAll(); }
});

/* ======================================================================
   Start screen
   ====================================================================== */
function showStart() {
  $('#hud').hidden = true; $('#shell').hidden = true; $('#modal').hidden = true; modalBusy = false;
  const saved = loadSave();
  const st = ui.setup;
  const top = Object.entries(NPCS).sort((a, b) => b[1].followers - a[1].followers).slice(0, 6);
  const gossip = shuffle(NEWS_NPC).slice(0, 6).map((h) => h.replace('{npc}', pick(Object.values(NPCS)).name).replace('{npc2}', pick(Object.values(NPCS)).name)).join('   ·   ');
  $('#start').hidden = false;
  $('#start').innerHTML = `<div class="start">
    <div class="stack" style="gap:20px">
      <div><div class="label">A social media life sim</div><h1 class="logo">Clout<br><em>Chaser</em></h1>
      <p class="tagline">Start with 210 followers and a phone. Post, collab, feud, sell out, apologize, and climb from nobody to icon across five platforms.</p></div>
      ${saved ? `<div class="card row between"><div class="row">${avatar(saved.name, saved.color, 'lg')}<div><b>${esc(saved.name)}</b><div class="small muted">@${esc(saved.handle)} · Day ${saved.day} · ${fmt(Object.values(saved.platforms).reduce((a, p) => a + (p.unlocked ? p.followers : 0), 0))} followers</div></div></div><button class="btn primary" data-act="setupContinue">Continue</button></div>` : ''}
      <div class="card stack">
        <h3>${saved ? 'Or start a new account' : 'Create your account'}</h3>
        <div class="row" style="align-items:flex-start;gap:12px">
          <div class="field" style="flex:1;min-width:180px"><label class="label" for="suName">Display name</label><input class="input" id="suName" maxlength="24" value="${esc(st.name)}"></div>
          <div class="field" style="flex:1;min-width:180px"><label class="label" for="suHandle">Handle</label><input class="input" id="suHandle" maxlength="20" value="${esc(st.handle)}"></div>
        </div>
        <div class="field"><span class="label">Niche</span><div class="row">${Object.entries(NICHES).map(([id, n]) => `<button class="chip" data-act="setupNiche" data-arg="${id}" aria-pressed="${st.niche === id}">${n.name}</button>`).join('')}</div></div>
        <div class="field"><span class="label">Difficulty</span><div class="row">${[['chill', 'Chill', 'Faster growth, softer scandals'], ['normal', 'Normal', 'The intended experience'], ['brutal', 'Brutal', 'Slow growth, harsh internet']].map(([id, n, d]) => `<button class="chip" data-act="setupDiff" data-arg="${id}" aria-pressed="${st.diff === id}" title="${d}">${n}</button>`).join('')}</div></div>
        <div class="field"><span class="label">Avatar color</span><div class="row">${AVATAR_COLORS.map((c) => `<button class="swatch" style="background:${c}" data-act="setupColor" data-arg="${c}" aria-pressed="${st.color === c}" aria-label="Color ${c}"></button>`).join('')}</div></div>
        <div class="row"><button class="btn primary big" data-act="setupGo">Start posting</button></div>
      </div>
    </div>
    <div class="stack">
      <div class="card stack"><div class="section-head"><h3>Who runs the internet</h3><span class="label">Followers</span></div>
        ${top.map(([id, n], i) => `<div class="row" style="flex-wrap:nowrap"><span class="num muted" style="width:18px">${i + 1}</span>${npcAv(id)}<div style="flex:1;min-width:0"><b>${esc(n.name)}</b><div class="small muted">${n.type}</div></div><span class="num">${fmt(n.followers)}</span></div>`).join('')}
        <div class="row" style="flex-wrap:nowrap;opacity:.8"><span class="num muted" style="width:18px">21</span>${avatar(st.name || 'You', st.color)}<div style="flex:1;min-width:0"><b>You</b><div class="small muted">Nobody (for now)</div></div><span class="num">210</span></div>
      </div>
      <div class="card stack tight"><h3>What's in the game</h3><div class="small muted stack tight">
        <span>5 platforms, 14 post formats, 8 tones, live trends and algorithm moods</span>
        <span>20 stars to befriend, collab with, date, or feud with</span>
        <span>Brand deals, merch, your own product line, podcast, savings, charity</span>
        <span>Livestreams with chat events, 40+ random events, scandals and cancellations</span>
        <span>Team hires, gear, lifestyle, skills, awards season, 50+ achievements</span></div></div>
      <div class="ticker" aria-hidden="true"><span>${esc(gossip)}   ·   ${esc(gossip)}   ·   </span></div>
    </div></div>`;
  const nameEl = $('#suName'), handleEl = $('#suHandle');
  nameEl.addEventListener('input', () => { st.name = nameEl.value; if (!st.handleTouched) { st.handle = nameEl.value.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20); handleEl.value = st.handle; } });
  handleEl.addEventListener('input', () => { st.handleTouched = true; st.handle = handleEl.value.replace(/[^a-zA-Z0-9_.]/g, '').slice(0, 20); });
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act^="setup"]'); if (!el) return;
  const st = ui.setup, a = el.dataset.arg, act = el.dataset.act;
  if (act === 'setupNiche') st.niche = a;
  if (act === 'setupDiff') st.diff = a;
  if (act === 'setupColor') st.color = a;
  if (act === 'setupContinue') { S = loadSave(); if (S) enterGame(); return; }
  if (act === 'setupGo') {
    const name = (st.name || '').trim() || 'New Creator';
    const handle = (st.handle || '').trim() || 'newcreator' + ri(10, 99);
    newGame({ name, handle, niche: st.niche, diff: st.diff, color: st.color });
    ui.lastPost = null; tab = 'studio'; ui.studio.topic = 'niche'; ui.studio.platform = 'pix'; ui.studio.format = 'photo';
    save(); enterGame(); sound('viral');
    return;
  }
  showStart();
});

function enterGame() {
  $('#start').hidden = true; $('#start').innerHTML = '';
  $('#hud').hidden = false; $('#shell').hidden = false;
  renderAll();
  processQueue();
}

/* ======================================================================
   Boot
   ====================================================================== */
window.addEventListener('resize', () => { if (S && tab === 'stats') drawChart(); if (S) document.documentElement.style.setProperty('--hud-h', $('#hud').offsetHeight + 'px'); });
try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (S && tab === 'stats') drawChart(); }); } catch (e) { /* old browser */ }
document.addEventListener('keydown', (e) => {
  if (!S || modalBusy || /input|textarea/i.test(e.target.tagName)) return;
  if (e.key === 'e' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ACT.endDay(); save(); renderAll(); }
});

try { window.claude?.hot?.snapshot?.(() => ({ S, tab, ui })); } catch (e) { /* not in a viewer */ }
function start(data) {
  if (data && data.S) { S = data.S; tab = data.tab || tab; if (data.ui) Object.assign(ui, data.ui); modalBusy = false; enterGame(); return; }
  showStart();
}
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
