/* Clout Chaser — more of your life on screen: pets, special scenes you unlock by doing things,
   and real photos. Any scene, pet or (original) character can use a photo from the photo pack
   (images/manifest.js); without one, the drawn version is used. */
'use strict';

/* ---------- photo pack ---------- */
const PHOTOS = Object.assign({ scenes: {}, pets: {}, npcs: {} }, window.PHOTO_PACK || {});
const photoScene = (k) => PHOTOS.scenes[k];
/* real-looking portraits only ever go to the game's original characters, never to parodies of real people */
const photoNpc = (id) => (typeof SAFE_NPCS !== 'undefined' && SAFE_NPCS[id] ? null : PHOTOS.npcs[id]);

/* ======================================================================
   Pets
   ====================================================================== */
const PETS = {
  pet:     { name: 'Golden retriever', price: 1500,  stress: 3, reach: 0.02 },
  cat:     { name: 'Ginger cat',       price: 800,   stress: 3, reach: 0.02 },
  bunny:   { name: 'Lop bunny',        price: 300,   stress: 2, reach: 0.01 },
  frenchie:{ name: 'French bulldog',   price: 4000,  stress: 3, reach: 0.03 },
  parrot:  { name: 'Macaw parrot',     price: 2500,  stress: 2, reach: 0.03 },
  husky:   { name: 'Husky',            price: 3000,  stress: 3, reach: 0.03 },
  pig:     { name: 'Mini pig',         price: 2000,  stress: 3, reach: 0.03 },
  llama:   { name: 'Llama',            price: 12000, stress: 2, reach: 0.04 },
  horse:   { name: 'Show horse',       price: 80000, stress: 4, reach: 0.05, upkeep: 120 },
};
for (const [k, P] of Object.entries(PETS)) {
  const it = SHOP.find((x) => x.id === k);
  if (it) it.cat = 'Pets';
  else SHOP.push({ id: k, cat: 'Pets', name: P.name, price: P.price, reach: P.reach, upkeep: P.upkeep || 0, desc: `Pet content gets big engagement. −${P.stress} stress a day. Shows up in your scene.` });
}
const ownedPets = () => Object.keys(PETS).filter((k) => S.owned[k]).sort((a, b) => PETS[b].price - PETS[a].price);
const hasPet = () => ownedPets().length > 0;
const shownPets = () => { const own = ownedPets(); const p = (S.petsShown || []).filter((k) => own.includes(k)); return (p.length ? p : own).slice(0, 2); };
function petDraw(k) {
  const tail = (d, col) => `<path d="${d}" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round" class="av-wag"/>`;
  const legs = (col, xs, y = 22, h = 10) => xs.map((x) => `<rect x="${x}" y="${y}" width="5" height="${h}" rx="2" fill="${col}"/>`).join('');
  return {
    pet: `${tail('M2 12 Q-8 4 -4 -4', '#E0A458')}<ellipse cx="20" cy="16" rx="18" ry="11" fill="#E0A458" stroke="#8A5A2B" stroke-width="1.5"/>${legs('#E0A458', [8, 28])}<circle cx="38" cy="6" r="10" fill="#E0A458" stroke="#8A5A2B" stroke-width="1.5"/><ellipse cx="44" cy="2" rx="4" ry="7" fill="#B9782F"/><circle cx="41" cy="5" r="1.8" fill="#111"/><circle cx="47" cy="8" r="2" fill="#111"/>`,
    cat: `<path d="M2 16 Q-10 10 -6 -6" stroke="#E07A2F" stroke-width="5" fill="none" stroke-linecap="round" class="av-sway"/><ellipse cx="18" cy="18" rx="15" ry="10" fill="#E07A2F" stroke="#8A4A1A" stroke-width="1.2"/>${legs('#E07A2F', [8, 24], 24, 8)}<circle cx="34" cy="8" r="9" fill="#E07A2F" stroke="#8A4A1A" stroke-width="1.2"/><path d="M27 2 L28 -8 L33 0Z M36 0 L41 -8 L42 2Z" fill="#E07A2F"/><circle cx="31" cy="7" r="1.5" fill="#2E8B57"/><circle cx="37" cy="7" r="1.5" fill="#2E8B57"/><path d="M14 12 L18 22 M20 12 L24 22" stroke="#B85A1F" stroke-width="2"/>`,
    bunny: `<ellipse cx="16" cy="20" rx="13" ry="10" fill="#F2EDE8" stroke="#bbb"/><circle cx="4" cy="20" r="4" fill="#fff"/><circle cx="28" cy="12" r="8" fill="#F2EDE8" stroke="#bbb"/><ellipse cx="22" cy="10" rx="3" ry="10" fill="#E8DCD0" transform="rotate(-30 22 10)"/><ellipse cx="33" cy="10" rx="3" ry="10" fill="#E8DCD0" transform="rotate(20 33 10)"/><circle cx="31" cy="12" r="1.4" fill="#111"/><circle cx="35" cy="15" r="1.4" fill="#F4A6B8"/>`,
    frenchie: `<ellipse cx="18" cy="18" rx="15" ry="10" fill="#B9A58C" stroke="#6E5A44" stroke-width="1.2"/>${legs('#B9A58C', [8, 24])}<circle cx="34" cy="8" r="11" fill="#B9A58C" stroke="#6E5A44" stroke-width="1.2"/><path d="M26 0 L24 -10 L31 -3Z M40 -3 L46 -10 L44 2Z" fill="#B9A58C" stroke="#6E5A44"/><ellipse cx="37" cy="12" rx="6" ry="4" fill="#3B2F25"/><circle cx="30" cy="6" r="1.8" fill="#111"/><circle cx="40" cy="6" r="1.8" fill="#111"/>`,
    parrot: `<g class="av-bob"><path d="M10 30 L10 46" stroke="#6E4420" stroke-width="3"/><path d="M-6 46 L30 46" stroke="#6E4420" stroke-width="4"/><ellipse cx="12" cy="14" rx="9" ry="15" fill="#E0245E"/><path d="M8 26 L2 44 L14 28Z" fill="#1D9BF0"/><path d="M14 4 Q24 6 22 14 L16 12Z" fill="#FFD400"/><circle cx="12" cy="2" r="7" fill="#E0245E"/><path d="M16 0 Q24 2 18 8Z" fill="#333"/><circle cx="11" cy="0" r="1.6" fill="#fff"/><circle cx="11" cy="0" r=".8" fill="#111"/></g>`,
    husky: `${tail('M2 10 Q-8 0 0 -6', '#6B7280')}<ellipse cx="20" cy="16" rx="18" ry="11" fill="#6B7280" stroke="#374151" stroke-width="1.2"/><ellipse cx="22" cy="20" rx="12" ry="6" fill="#F3F4F6"/>${legs('#6B7280', [8, 28])}<circle cx="38" cy="6" r="10" fill="#6B7280" stroke="#374151" stroke-width="1.2"/><path d="M31 0 L32 -10 L37 -2Z M40 -2 L45 -10 L45 1Z" fill="#6B7280"/><path d="M33 8 Q38 16 46 8 Q42 4 38 6 Q34 4 33 8Z" fill="#F3F4F6"/><circle cx="35" cy="4" r="1.8" fill="#4FA3E0"/><circle cx="42" cy="4" r="1.8" fill="#4FA3E0"/><circle cx="47" cy="9" r="2" fill="#111"/>`,
    pig: `<ellipse cx="18" cy="18" rx="16" ry="11" fill="#F4A6B8" stroke="#C97A90" stroke-width="1.2"/>${legs('#F4A6B8', [8, 24], 24, 8)}<circle cx="34" cy="12" r="9" fill="#F4A6B8" stroke="#C97A90" stroke-width="1.2"/><ellipse cx="41" cy="14" rx="4" ry="3" fill="#E68AA0"/><circle cx="40" cy="14" r=".9" fill="#8E3E55"/><circle cx="42.5" cy="14" r=".9" fill="#8E3E55"/><circle cx="34" cy="9" r="1.4" fill="#111"/><path d="M28 4 L30 -2 L33 4Z" fill="#E68AA0"/><path d="M2 14 q-4 -2 -2 -6 q4 0 2 4" stroke="#C97A90" stroke-width="2" fill="none" class="av-wag"/>`,
    llama: `<ellipse cx="18" cy="22" rx="16" ry="11" fill="#F2E3C6" stroke="#B89E70" stroke-width="1.2"/>${legs('#F2E3C6', [6, 12, 22, 28], 28, 14)}<rect x="28" y="-8" width="9" height="30" rx="4" fill="#F2E3C6" stroke="#B89E70" stroke-width="1.2"/><ellipse cx="36" cy="-10" rx="8" ry="6" fill="#F2E3C6" stroke="#B89E70" stroke-width="1.2"/><path d="M30 -16 L31 -24 L34 -16Z M36 -16 L38 -24 L40 -16Z" fill="#F2E3C6" stroke="#B89E70"/><circle cx="38" cy="-11" r="1.4" fill="#111"/><path d="M6 16 Q18 10 30 16" stroke="#E0245E" stroke-width="4" fill="none"/>`,
    horse: `<path d="M-4 6 Q-10 20 -6 34" stroke="#3B2416" stroke-width="5" fill="none" class="av-sway"/><ellipse cx="22" cy="18" rx="24" ry="13" fill="#7A4A2A" stroke="#3B2416" stroke-width="1.2"/>${legs('#7A4A2A', [2, 10, 32, 40], 26, 22)}<path d="M38 12 L50 -14 L60 -10 L50 16Z" fill="#7A4A2A" stroke="#3B2416" stroke-width="1.2"/><ellipse cx="58" cy="-12" rx="9" ry="6" fill="#7A4A2A" stroke="#3B2416" stroke-width="1.2"/><path d="M40 10 L50 -16 L46 -16 L36 8Z" fill="#3B2416"/><circle cx="57" cy="-14" r="1.5" fill="#111"/><path d="M50 -20 L52 -26 L54 -19Z" fill="#7A4A2A"/>`,
  }[k] || '';
}
const PET_SLOTS = [[236, 204, 0.85], [56, 214, 0.75]];
function petSvgFor(k) {
  return shownPets().map((p, i) => { const [x, y, sc] = PET_SLOTS[i]; const s = p === 'horse' || p === 'llama' ? sc * 0.85 : sc;
    if (PHOTOS.pets[p]) return `<image href="${PHOTOS.pets[p]}" x="${x - 6}" y="${y - 30}" width="64" height="64" preserveAspectRatio="xMidYMid meet"/>`;
    return `<g transform="translate(${x} ${y - (p === 'horse' ? 28 : p === 'llama' ? 14 : 0)}) scale(${s})">${petDraw(p)}</g>`; }).join('');
}
function petsSection() {
  const list = SHOP.filter((it) => it.cat === 'Pets').sort((a, b) => a.price - b.price);
  return `<div class="sect"><h3>🐾 Pets <span class="small muted">· two can join you in your scene</span></h3><div class="cards">${list.map((it) => `<div class="card garage ${S.owned[it.id] ? 'owned' : ''}"><svg viewBox="${it.id === 'horse' ? '-14 -34 80 80' : it.id === 'llama' ? '-6 -30 56 60' : '-12 -14 66 50'}" class="car-thumb" aria-hidden="true">${petDraw(it.id)}</svg><div class="t"><span>${esc(it.name)}</span><span class="num">${money(it.price)}</span></div><span class="small muted">${esc(it.desc)}</span>${S.owned[it.id] ? '<span class="pill good">Part of the family</span>' : btn('Adopt', 'buy', it.id, 'sm primary', S.money < it.price)}</div>`).join('')}</div></div>`;
}

/* ======================================================================
   Special scenes you unlock by doing things
   ====================================================================== */
const been = (cc) => (S.visited || []).includes(cc);
Object.assign(BACKDROPS, {
  yachtdeck: { name: 'Superyacht deck', ok: () => S.owned.yacht, how: 'buy the superyacht' },
  studio:    { name: 'Creator studio', ok: () => typeof hqTotal === 'function' && hqTotal() >= 10, how: 'reach HQ level 10' },
  club:      { name: 'VIP nightclub', ok: () => S.acq && S.acq.own.club, how: 'buy a stake in Club Neon' },
  stadium:   { name: 'Your stadium', ok: () => !!(S.prestige && S.prestige.stadium), how: 'name a stadium (Prestige)' },
  nyc:       { name: 'New York', ok: () => been('us'), how: 'visit the US' },
  paris:     { name: 'Paris', ok: () => been('fr'), how: 'visit France' },
  tokyo:     { name: 'Tokyo', ok: () => been('jp'), how: 'visit Japan' },
  dubai:     { name: 'Dubai', ok: () => been('ae'), how: 'visit the UAE' },
  rio:       { name: 'Rio', ok: () => been('br'), how: 'visit Brazil' },
});
const skyG = (id, a, b) => `<defs><linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="250" fill="url(#sky-${id})"/>`;
const towers = (y, col, n, seed, lit) => Array.from({ length: n }, (_, i) => { const w = 22 + ((i * seed) % 18), h = 50 + ((i * seed * 7) % 90), x = (i * 400) / n; return `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${col}"/>${lit ? Array.from({ length: 4 }, (_, j) => `<rect x="${x + 5}" y="${y - h + 8 + j * 14}" width="${w - 10}" height="4" fill="#FFE08A" opacity="${(i + j) % 3 ? 0.75 : 0.25}"/>`).join('') : ''}`; }).join('');
const EXTRA_BACKDROPS = {
  yachtdeck: () => `${skyG('yd', '#4FC3F7', '#E1F5FE')}<rect y="120" width="400" height="80" fill="#1E88C8"/><path d="M0 132 Q50 126 100 132 T200 132 T300 132 T400 132" stroke="#fff" stroke-width="2" fill="none" opacity=".4" class="av-wave"/><path d="M0 196 L400 180 L400 250 L0 250Z" fill="#C8A26B"/>${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 30} 250 L${i * 30 + 12} 186" stroke="#A0804F" stroke-width="2"/>`).join('')}<path d="M0 176 L400 160" stroke="#fff" stroke-width="5"/>${[40, 120, 200, 280, 360].map((x) => `<path d="M${x} ${176 - x * 0.04} L${x} ${196 - x * 0.04}" stroke="#fff" stroke-width="3"/>`).join('')}<rect x="300" y="196" width="70" height="20" rx="4" fill="#fff"/><rect x="306" y="190" width="58" height="8" rx="3" fill="#F4F6F8"/>`,
  studio: () => `<rect width="400" height="250" fill="#141824"/><rect y="200" width="400" height="50" fill="#1F2533"/><circle cx="60" cy="90" r="34" fill="none" stroke="#fff" stroke-width="8" opacity=".9"/><path d="M60 124 L60 200" stroke="#555" stroke-width="4"/><rect x="290" y="60" width="90" height="56" rx="4" fill="#0B0B0B" stroke="#333" stroke-width="3"/><rect x="296" y="66" width="78" height="44" fill="#E0245E" opacity=".8"/><text x="335" y="94" text-anchor="middle" font-family="Arial Black,Arial" font-size="14" fill="#fff">ON AIR</text><path d="M330 116 L330 200" stroke="#555" stroke-width="3"/><rect x="100" y="40" width="200" height="8" fill="#333"/>${[120, 160, 240, 280].map((x) => `<path d="M${x} 48 L${x - 10} 70 L${x + 10} 70Z" fill="#FFE08A" opacity=".9"/><path d="M${x - 10} 70 L${x - 50} 200 L${x + 50} 200 L${x + 10} 70Z" fill="#FFE08A" opacity=".06"/>`).join('')}`,
  club: () => `<rect width="400" height="250" fill="#120024"/>${[['#F91880', 60], ['#1D9BF0', 200], ['#7856FF', 340]].map(([c, x], i) => `<path d="M${x} 0 L${x - 70} 250 L${x + 70} 250Z" fill="${c}" opacity=".18" class="av-sweep" style="animation-delay:${i * 0.6}s"/>`).join('')}<circle cx="200" cy="40" r="20" fill="#ccc"/>${Array.from({ length: 16 }, (_, i) => `<rect x="${186 + (i % 4) * 7}" y="${26 + Math.floor(i / 4) * 7}" width="6" height="6" fill="#fff" opacity="${i % 3 ? 0.9 : 0.5}"/>`).join('')}<rect y="196" width="400" height="54" fill="#1E0A33"/><rect x="250" y="150" width="140" height="50" rx="20" fill="#4A0E4E"/><text x="60" y="120" font-family="Arial Black,Arial" font-weight="900" font-size="26" fill="#F91880" class="av-neon">VIP</text>`,
  stadium: () => `${skyG('st', '#0B1033', '#24305E')}${[40, 360].map((x) => `<path d="M${x} 0 L${x} 60" stroke="#888" stroke-width="4"/><rect x="${x - 20}" y="0" width="40" height="14" fill="#fff"/><path d="M${x - 20} 14 L${x - 120} 250 L${x + 120} 250 L${x + 20} 14Z" fill="#fff" opacity=".07"/>`).join('')}<path d="M0 90 Q200 60 400 90 L400 150 L0 150Z" fill="#2A2F4A"/>${Array.from({ length: 80 }, (_, i) => `<circle cx="${(i * 37) % 400}" cy="${96 + (i % 5) * 10}" r="2" fill="${['#E0245E', '#1D9BF0', '#FFD400', '#fff'][i % 4]}" opacity=".7"/>`).join('')}<rect y="150" width="400" height="100" fill="#2E8B3A"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${i * 80}" y="150" width="40" height="100" fill="#349A42"/>`).join('')}<path d="M200 150 L200 250 M120 250 Q200 200 280 250" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/><rect x="120" y="66" width="160" height="20" fill="#111"/><text x="200" y="81" text-anchor="middle" font-family="Arial Black,Arial" font-size="13" fill="#FFD400">${esc((S.handle || '').toUpperCase())} ARENA</text>`,
  nyc: () => `${skyG('ny', '#FDB99B', '#CF8BF3')}${towers(205, '#5B4B8A', 14, 7, true)}<path d="M290 205 L290 70 L300 40 L310 70 L310 205Z" fill="#3E3470"/><rect y="205" width="400" height="45" fill="#3A3A48"/><rect x="40" y="215" width="90" height="16" fill="#FFD400"/><rect x="300" y="214" width="80" height="18" fill="#FFD400"/><text x="85" y="228" text-anchor="middle" font-family="Arial" font-weight="700" font-size="10" fill="#111">TAXI</text>`,
  paris: () => `${skyG('pa', '#A8C0FF', '#FDE2E4')}${towers(210, '#C7B8D8', 12, 5, false)}<g transform="translate(300 30)"><path d="M0 180 L30 0 L60 180 L48 180 L30 70 L12 180Z" fill="#5A4A3A"/><path d="M8 120 L52 120 M14 80 L46 80 M20 40 L40 40" stroke="#5A4A3A" stroke-width="4"/><path d="M14 180 Q30 140 46 180" fill="#A8C0FF"/></g><rect y="210" width="400" height="40" fill="#D9CFC1"/>${[30, 90, 150].map((x) => `<circle cx="${x}" cy="200" r="14" fill="#6A994E"/><rect x="${x - 2}" y="200" width="4" height="12" fill="#5A3A1E"/>`).join('')}`,
  tokyo: () => `${skyG('tk', '#0F0C29', '#302B63')}${towers(210, '#1E1A4A', 13, 9, true)}${[[30, '#F91880', 'ラーメン'], [330, '#1D9BF0', 'クラウト']].map(([x, c, t]) => `<rect x="${x}" y="70" width="32" height="110" fill="#111" stroke="${c}" stroke-width="3"/><text x="${x + 16}" y="92" text-anchor="middle" font-size="18" fill="${c}" writing-mode="tb" class="av-neon">${t}</text>`).join('')}<rect y="210" width="400" height="40" fill="#2A2A3A"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${40 + i * 48}" y="222" width="30" height="5" fill="#fff" opacity=".8"/>`).join('')}<path d="M180 130 Q200 110 220 130 L216 160 L184 160Z" fill="#F4B6C2" opacity=".0"/>`,
  dubai: () => `${skyG('db', '#F6D365', '#FDA085')}<circle cx="80" cy="70" r="24" fill="#FFF1B8"/>${towers(210, '#C98B5E', 10, 11, false)}<path d="M300 210 L306 40 L310 10 L314 40 L320 210Z" fill="#9DB4C0"/><path d="M296 210 L304 120 L316 120 L324 210Z" fill="#9DB4C0"/><rect y="210" width="400" height="40" fill="#E7B66B"/>${palm(30, 240, 0.7)}${palm(380, 240, 0.7)}`,
  rio: () => `${skyG('ri', '#56CCF2', '#E0F7FA')}<path d="M0 150 Q60 60 120 140 Q170 40 230 130 Q280 90 330 140 L400 150 L400 250 L0 250Z" fill="#2E7D4F"/><path d="M160 60 L168 60 L168 70 L182 70 L182 76 L168 76 L168 96 L160 96 L160 76 L146 76 L146 70 L160 70Z" fill="#F5F5F5"/>${sea(170)}<path d="M0 200 Q200 186 400 204 L400 250 L0 250Z" fill="#F4D9A0"/>${[50, 130, 330].map((x, i) => `<path d="M${x} 230 L${x} 190" stroke="#888" stroke-width="2"/><path d="M${x - 20} 196 Q${x} 176 ${x + 20} 196Z" fill="${['#E0245E', '#FFD400', '#1D9BF0'][i]}"/>`).join('')}`,
};
function extraBackdrop(k) { return EXTRA_BACKDROPS[k] ? EXTRA_BACKDROPS[k]() : null; }
/* the sea helper lives in avatar.js's backdrop closure; this is the same wave strip for the new scenes */
function sea(y) { return `<rect y="${y}" width="400" height="${250 - y}" fill="#1E90C8"/><path d="M0 ${y + 8} Q20 ${y + 4} 40 ${y + 8} T80 ${y + 8} T120 ${y + 8} T160 ${y + 8} T200 ${y + 8} T240 ${y + 8} T280 ${y + 8} T320 ${y + 8} T360 ${y + 8} T400 ${y + 8}" stroke="#fff" stroke-width="2" fill="none" opacity=".35" class="av-wave"/>`; }

const LIFE_ACT = {
  petPick: (a) => { let g = shownPets().slice(); if (g.includes(a)) g = g.filter((x) => x !== a); else { g.unshift(a); g = g.slice(0, 2); } S.petsShown = g.length ? g : null; },
};
