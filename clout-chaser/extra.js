/* Clout Chaser — more team, the upgradable HQ, and the daily login calendar */
'use strict';

/* ---------- more people to hire (monthly pay) ---------- */
Object.assign(TEAM, {
  photographer: { name: 'Photographer', pay: 180, req: 1500, desc: '+8% quality on Pixgram posts. Every photo looks expensive.' },
  chef:         { name: 'Personal chef', pay: 150, req: 3000, desc: '+8 energy every morning. You eat like an athlete now.' },
  trainer:      { name: 'Personal trainer', pay: 160, req: 6000, desc: '+10 max energy and −4 stress every day.' },
  producer:     { name: 'Stream producer', pay: 260, req: 12000, desc: 'Livestream gifts +25% and +15% new viewers that stick.' },
  scout:        { name: 'Talent scout', pay: 220, req: 20000, desc: 'Networks for you: two stars warm up to you every day.' },
  cyber:        { name: 'Cybersecurity expert', pay: 240, req: 30000, desc: 'Blocks hacks, deepfakes, impersonators and scam bot swarms.' },
});
const CYBER_BLOCKS = ['hacked', 'scam_bots', 'impersonator', 'deepfake'];

/* ---------- HQ: rooms you upgrade with money for permanent boosts ---------- */
const HQ_ROOMS = {
  studio:  { name: 'Content studio', icon: '🎬', base: 3000,  desc: '+4% quality on every post per level' },
  editbay: { name: 'Editing bay',    icon: '🎞️', base: 5000,  desc: '−5% energy cost of video posts per level' },
  server:  { name: 'Data room',      icon: '🛰️', base: 12000, desc: '+3% reach on every post per level' },
  gym:     { name: 'Home gym',       icon: '🏋️', base: 4000,  desc: '+5 max energy per level' },
  lounge:  { name: 'Chill lounge',   icon: '🛋️', base: 2500,  desc: '−3 stress every day per level' },
  trophy:  { name: 'Trophy hall',    icon: '🏆', base: 9000,  desc: '+0.15 reputation every day per level' },
};
const HQ_MAX = 5;
const HQ_NAMES = ['Bedroom setup', 'Apartment studio', 'Creator loft', 'Creator house', 'Agency HQ', 'Media tower', 'Clout Empire campus'];
const hqLvl = (k) => (S && S.hq && S.hq[k]) || 0;
const hqTotal = () => Object.keys(HQ_ROOMS).reduce((a, k) => a + hqLvl(k), 0);
const hqCost = (k) => Math.round(HQ_ROOMS[k].base * Math.pow(4, hqLvl(k)) / 10) * 10;
const hqName = () => HQ_NAMES[Math.min(HQ_NAMES.length - 1, Math.floor(hqTotal() / 5))];

/* the building grows as you upgrade */
function hqArt() {
  const t = hqTotal(), floors = 1 + Math.floor(t / 3), w = Math.min(220, 90 + t * 5);
  const x0 = 200 - w / 2, fh = Math.max(12, Math.min(22, 110 / floors));
  const top = 150 - floors * fh;
  let win = '';
  for (let f = 0; f < floors; f++) for (let c = 0; c < Math.floor(w / 22); c++) win += `<rect class="hq-win" style="animation-delay:${((f * 7 + c * 3) % 10) / 4}s" x="${x0 + 8 + c * 22}" y="${top + f * fh + 4}" width="12" height="${fh - 8}" rx="1.5" fill="#FFE08A"/>`;
  const sign = esc(hqName());
  return `<svg viewBox="0 0 400 170" class="hq-art" aria-hidden="true"><defs><linearGradient id="hqsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B1464"/><stop offset="1" stop-color="#F91880" stop-opacity=".55"/></linearGradient></defs>
    <rect width="400" height="170" fill="url(#hqsky)"/>${[30, 90, 160, 260, 330, 370].map((x, i) => `<circle class="v-twinkle" style="animation-delay:${i * 0.3}s" cx="${x}" cy="${12 + (i * 17) % 40}" r="1.4" fill="#fff"/>`).join('')}
    <rect x="0" y="150" width="400" height="20" fill="#0b0b18"/>
    <rect x="${x0}" y="${top}" width="${w}" height="${floors * fh}" fill="#2A2D45" stroke="#4B4F75"/>${win}
    <rect x="${x0 - 6}" y="${top - 18}" width="${w + 12}" height="16" rx="3" fill="#F91880"/><text x="200" y="${top - 6}" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="10" fill="#fff">${sign.toUpperCase()}</text>
    ${hqLvl('server') ? `<path d="M${x0 + w - 20} ${top - 18} V${top - 40}" stroke="#ccc" stroke-width="2"/><circle class="v-pulse v-anim" cx="${x0 + w - 20}" cy="${top - 42}" r="3" fill="#21D4FD"/>` : ''}
    ${hqLvl('gym') ? `<text x="${x0 - 30}" y="146" font-size="18">🏋️</text>` : ''}${hqLvl('trophy') ? `<text x="${x0 + w + 8}" y="146" font-size="18">🏆</text>` : ''}
    ${hqLvl('lounge') ? '<text x="40" y="146" font-size="18">🌴</text>' : ''}${hqLvl('studio') ? `<text class="v-bob v-anim" x="${x0 + w / 2 - 9}" y="${top - 24}" font-size="16">🎬</text>` : ''}
  </svg>`;
}

/* ---------- daily login calendar (real days, not game days) ---------- */
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const yesterdayKey = () => { const d = new Date(Date.now() - 864e5); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function loginReward(day) {
  const base = Math.round(Math.max(250, totalFollowers() * 0.003) / 10) * 10;
  return [
    { icon: '💵', text: money(base), fx: () => { S.money += base; } },
    { icon: '🔋', text: '+30 energy', fx: () => gainEnergy(30, 'Daily login') },
    { icon: '🎟️', text: '+150 Pass XP', fx: () => typeof passXP === 'function' && passXP(150) },
    { icon: '🍀', text: 'Lucky charm today', fx: () => consumeSpecial('lucky') },
    { icon: '📈', text: '+2% followers', fx: () => addFollowersPct(0.02) },
    { icon: '💰', text: money(base * 3), fx: () => { S.money += base * 3; } },
    { icon: '🎁', text: `Mega chest: ${money(base * 6)}, +2 max energy, photographer`, fx: () => { S.money += base * 6; S.bonusMaxE = (S.bonusMaxE || 0) + 2; consumeSpecial('photo'); } },
  ][(day - 1) % 7];
}
function loginState() {
  S.login = S.login || { streak: 0, last: '', claimed: '' };
  return S.login;
}
const loginReady = () => { const L = loginState(); return L.claimed !== todayKey(); };
function loginCard() {
  if (!loginReady()) return '';
  const L = loginState();
  const next = L.last === yesterdayKey() ? L.streak + 1 : 1;
  const week = Math.floor((next - 1) / 7) * 7;
  return `<div class="login-card"><div class="row between"><b>🎁 Daily login reward</b><span class="small muted">${next > 1 ? `${next}-day streak` : 'Come back every day for bigger rewards'}</span></div>
    <div class="login-days">${[1, 2, 3, 4, 5, 6, 7].map((i) => { const d = week + i, rw = loginReward(d); return `<div class="lday ${d < next ? 'got' : d === next ? 'today' : ''}"><span class="small">Day ${d}</span><span class="li">${rw.icon}</span></div>`; }).join('')}</div>
    <div class="row between"><span class="small">Today: <b>${esc(loginReward(next).text)}</b></span>${btn('Claim', 'loginClaim', '', 'sm primary')}</div></div>`;
}

/* ---------- daily effects ---------- */
function extraTick(lines) {
  if (S.team.trainer) S.stress = clamp(S.stress - 4 * tm('trainer'), 0, 100);
  const lounge = hqLvl('lounge') * 3;
  if (lounge) S.stress = clamp(S.stress - lounge, 0, 100);
  if (hqLvl('trophy')) changeRep(0.15 * hqLvl('trophy'));
  if (S.team.scout) {
    const ids = shuffle(Object.keys(S.npcs).filter((id) => !S.npcs[id].feud)).slice(0, 2);
    ids.forEach((id) => changeRel(id, Math.round(2 * tm('scout'))));
    if (ids.length) lines.push([`Talent scout networked with ${ids.map((id) => npcName(id).split(' ')[0]).join(' and ')}`, 0]);
  }
}

/* ---------- screens ---------- */
function vHQ() {
  return `<div class="col-head">${head('Headquarters', `${hqName()} · level ${hqTotal()} of ${Object.keys(HQ_ROOMS).length * HQ_MAX}`)}</div>
    <div class="sect">${hqArt()}<span class="small muted">Every room upgrade is permanent and your building grows. Rebrands keep your HQ.</span></div>
    <div class="sect"><div class="cards">${Object.entries(HQ_ROOMS).map(([k, R]) => { const lv = hqLvl(k);
      return `<div class="card ${lv ? 'owned' : ''}"><div class="t"><span>${R.icon} ${R.name}</span><span class="pill gold">Lv ${lv}/${HQ_MAX}</span></div><span class="small muted">${R.desc}</span>
        <div class="meter gold"><i style="width:${lv / HQ_MAX * 100}%"></i></div>
        ${lv >= HQ_MAX ? '<span class="pill good">Maxed</span>' : btn(`Upgrade · ${money(hqCost(k))}`, 'hqUp', k, 'sm primary', S.money < hqCost(k))}</div>`; }).join('')}</div></div>`;
}

const EXTRA_ACT = {
  hqUp: (a) => { if (hqLvl(a) >= HQ_MAX) return 'norender'; const c = hqCost(a); if (!spend(c)) { toast('Not enough money.', 'bad'); return 'norender'; } S.hq = S.hq || {}; const before = hqName(); S.hq[a] = hqLvl(a) + 1; toast(`${HQ_ROOMS[a].name} is now level ${S.hq[a]}`, 'gold'); sound('cash'); if (hqName() !== before) { celebrate('gold'); news(`@${S.handle} moves into a ${hqName().toLowerCase()}`, true); notify('system', null, `Your HQ is now a ${hqName()}!`); } checkAll(); },
  loginClaim: () => {
    if (!loginReady()) return 'norender';
    const L = loginState();
    L.streak = L.last === yesterdayKey() ? L.streak + 1 : 1; L.last = todayKey(); L.claimed = todayKey();
    const rw = loginReward(L.streak); rw.fx();
    S.stats.bestLogin = Math.max(S.stats.bestLogin || 0, L.streak);
    toast(`Day ${L.streak} reward: ${rw.text}`, 'gold'); sound('cash'); if (L.streak % 7 === 0) celebrate('gold');
  },
};

ACHIEVEMENTS.push(
  ['hq10', 'Moving up', 'Reach HQ level 10', () => hqTotal() >= 10],
  ['hqmax', 'Campus life', 'Max out every HQ room', () => hqTotal() >= Object.keys(HQ_ROOMS).length * HQ_MAX],
  ['login7', 'Loyal', 'Claim a 7-day login streak', () => (S.stats.bestLogin || 0) >= 7],
  ['fullteam', 'Dream team', 'Have 10 people on your team at once', () => teamSize() >= 10],
);
