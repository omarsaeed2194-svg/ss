/* Clout Chaser — your character and your life on screen.
   1. A full-body avatar you customize (face, hair, outfit, accessories), drawn as SVG.
   2. A lifestyle scene: your character in front of your home, with the cars, jet, yacht and
      helicopter you own, your pet, your cash, and billboards for your companies. */
'use strict';

/* ======================================================================
   Options
   ====================================================================== */
const SKIN_TONES = ['#FFE0C7', '#F6D0B1', '#EBB58F', '#D89A6A', '#B97A4F', '#8F5A35', '#6B3E22', '#4A2A17'];
const HAIR_COLORS = ['#1B1B1B', '#3B2416', '#6A4024', '#A0612F', '#D9A55B', '#F2D9A0', '#B8B8B8', '#C2362F', '#E35C9F', '#4A7BE0', '#7C4DDB', '#2FB36E'];
const EYE_COLORS = ['#3B2416', '#1E6FB8', '#2E8B57', '#6B6B6B', '#8A5A2B'];
const CLOTH = ['#111111', '#FFFFFF', '#E0245E', '#1D9BF0', '#00BA7C', '#FFD400', '#7856FF', '#FF7A00', '#8B98A5', '#6B3E22', '#0F3D5E', '#F4B6C2'];
const LOOK_OPTS = {
  face:    ['round', 'oval', 'square'],
  hair:    ['short', 'buzz', 'quiff', 'sidepart', 'spiky', 'pixie', 'curly', 'waves', 'afro', 'bun', 'buns', 'long', 'ponytail', 'bob', 'braids', 'dreads', 'mohawk', 'bald'],
  eyes:    ['round', 'smile', 'sharp', 'lashes', 'sleepy'],
  brows:   ['soft', 'bold', 'arched', 'angry'],
  mouth:   ['smile', 'grin', 'smirk', 'open', 'pout', 'neutral'],
  beard:   ['none', 'stubble', 'mustache', 'goatee', 'full'],
  glasses: ['none', 'round', 'square', 'shades', 'aviator', 'heart', 'star'],
  hat:     ['none', 'cap', 'beanie', 'bucket', 'beret', 'bandana', 'headband', 'cowboy', 'tiara', 'crown', 'halo'],
  top:     ['tee', 'tank', 'hoodie', 'sweater', 'tracksuit', 'varsity', 'puffer', 'jacket', 'leather', 'suit', 'kimono', 'jersey', 'crop', 'dress', 'gown', 'fur'],
  bottom:  ['jeans', 'joggers', 'track', 'cargo', 'shorts', 'skirt', 'flare', 'leather', 'slacks'],
  shoes:   ['sneakers', 'hightops', 'boots', 'loafers', 'heels', 'platform', 'slides', 'gold'],
  neck:    ['none', 'scarf', 'bowtie', 'choker', 'chain', 'pearls', 'diamond'],
  ears:    ['none', 'studs', 'hoops', 'headphones'],
};
const LOOK_LABEL = { face: 'Face', hair: 'Hair', eyes: 'Eyes', brows: 'Brows', mouth: 'Mouth', beard: 'Facial hair', glasses: 'Glasses', hat: 'Hat', top: 'Top', bottom: 'Bottoms', shoes: 'Shoes', neck: 'Necklace', ears: 'Ears' };
/* premium pieces: buy once with cash or Gems, then wear forever */
const LOOK_PRICE = {
  'hat:crown': { cash: 1e6, gems: 200 }, 'top:fur': { cash: 250000, gems: 120 }, 'shoes:gold': { cash: 100000, gems: 80 },
  'neck:diamond': { cash: 500000, gems: 150 }, 'neck:chain': { cash: 15000, gems: 30 }, 'glasses:star': { cash: 20000, gems: 40 },
  'top:suit': { cash: 8000, gems: 20 }, 'top:gown': { cash: 300000, gems: 120 }, 'hat:tiara': { cash: 400000, gems: 150 }, 'hat:halo': { cash: 2e6, gems: 250 },
  'top:leather': { cash: 30000, gems: 40 }, 'shoes:platform': { cash: 20000, gems: 30 }, 'glasses:aviator': { cash: 10000, gems: 20 }, 'top:kimono': { cash: 50000, gems: 50 }, 'neck:choker': { cash: 25000, gems: 30 }, 'neck:pearls': { cash: 12000, gems: 25 }, 'ears:hoops': { cash: 5000, gems: 15 },
};
const ownsPiece = (k, v) => !LOOK_PRICE[`${k}:${v}`] || (S.wardrobe || []).includes(`${k}:${v}`);

function randomLook(seed) {
  const r = srand(hashStr(String(seed || Math.random())) % 100000 + 7);
  const pk = (a) => a[Math.floor(r() * a.length)];
  return {
    skin: pk(SKIN_TONES), face: pk(LOOK_OPTS.face), hair: pk(['short', 'quiff', 'curly', 'bun', 'long', 'ponytail', 'bob', 'afro', 'braids']), hairColor: pk(HAIR_COLORS.slice(0, 6)),
    eyes: pk(['round', 'smile', 'lashes']), eyeColor: pk(EYE_COLORS), brows: pk(['soft', 'bold', 'arched']), mouth: pk(['smile', 'grin', 'smirk']),
    beard: 'none', glasses: r() < 0.2 ? 'round' : 'none', hat: 'none', top: pk(['tee', 'hoodie', 'jacket']), topColor: pk(CLOTH), bottom: pk(['jeans', 'joggers', 'shorts']),
    bottomColor: pk(['#0F3D5E', '#111111', '#8B98A5', '#6B3E22']), shoes: pk(['sneakers', 'boots', 'slides']), neck: 'none', ears: 'none',
  };
}
function lookInit() { if (!S.look) S.look = randomLook(S.faceSeed || S.name); return S.look; }

/* ======================================================================
   Drawing (viewBox 0 0 200 380; the head sits at 100,92)
   ====================================================================== */
const avShade = (hex, f) => { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.max(0, Math.min(255, Math.round(v * f))); return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`; };
function hairBack(L) {
  const c = L.hairColor;
  return {
    long: `<path d="M46 90 Q40 200 60 215 L140 215 Q160 200 154 90 Q150 40 100 36 Q50 40 46 90Z" fill="${c}"/>`,
    braids: `<path d="M48 90 Q44 150 56 160 L144 160 Q156 150 152 90 Q148 40 100 36 Q52 40 48 90Z" fill="${c}"/>${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="58" cy="${168 + i * 12}" rx="7" ry="7" fill="${c}"/><ellipse cx="142" cy="${168 + i * 12}" rx="7" ry="7" fill="${c}"/>`).join('')}`,
    bob: `<path d="M44 92 Q42 150 62 152 L138 152 Q158 150 156 92 Q150 38 100 36 Q50 38 44 92Z" fill="${c}"/>`,
    ponytail: `<path d="M140 60 Q178 70 170 150 Q164 120 146 100Z" fill="${c}"/>`,
    bun: `<circle cx="100" cy="30" r="20" fill="${c}"/>`,
    afro: `<circle cx="100" cy="78" r="76" fill="${c}"/>`,
    dreads: `<path d="M46 90 Q44 40 100 36 Q156 40 154 90Z" fill="${c}"/>${[52, 62, 72, 128, 138, 148].map((x, i) => `<path d="M${x} 90 L${x + (i < 3 ? -4 : 4)} ${170 + (i % 3) * 14}" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`).join('')}`,
    waves: `<path d="M44 92 Q36 170 56 186 Q70 176 74 190 Q90 180 100 192 Q110 180 126 190 Q130 176 144 186 Q164 170 156 92 Q150 38 100 36 Q50 38 44 92Z" fill="${c}"/>`,
    buns: `<circle cx="62" cy="40" r="18" fill="${c}"/><circle cx="138" cy="40" r="18" fill="${c}"/>`,
  }[L.hair] || '';
}
function hairFront(L) {
  const c = L.hairColor, hi = avShade(c, 1.35);
  const cap = 'M48 96 Q44 34 100 32 Q156 34 152 96 Q146 66 128 60 Q100 72 72 60 Q54 68 48 96Z';
  return {
    short: `<path d="${cap}" fill="${c}"/><path d="M70 46 Q100 38 128 46" stroke="${hi}" stroke-width="3" fill="none" opacity=".5"/>`,
    buzz: `<path d="M50 90 Q50 38 100 36 Q150 38 150 90 Q140 58 100 56 Q60 58 50 90Z" fill="${c}" opacity=".85"/>`,
    quiff: `<path d="${cap}" fill="${c}"/><path d="M62 58 Q72 8 146 24 Q138 48 104 58Z" fill="${c}"/><path d="M80 30 Q110 18 136 28" stroke="${hi}" stroke-width="3" fill="none" opacity=".5"/>`,
    curly: `${[[56, 70], [66, 50], [84, 38], [100, 34], [116, 38], [134, 50], [144, 70], [50, 92], [150, 92]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${c}"/>`).join('')}`,
    afro: `${[[60, 60], [80, 44], [100, 40], [120, 44], [140, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="${c}"/>`).join('')}`,
    bun: `<path d="M48 92 Q46 38 100 36 Q154 38 152 92 Q140 54 100 52 Q60 54 48 92Z" fill="${c}"/>`,
    long: `<path d="M48 110 Q40 36 100 32 Q160 36 152 110 Q146 62 112 54 Q96 70 64 64 Q52 80 48 110Z" fill="${c}"/>`,
    ponytail: `<path d="M48 96 Q44 34 100 32 Q156 34 152 96 Q140 56 100 50 Q64 54 48 96Z" fill="${c}"/>`,
    bob: `<path d="M46 104 Q42 34 100 32 Q158 34 154 104 Q148 64 100 62 Q52 64 46 104Z" fill="${c}"/>`,
    braids: `<path d="M48 96 Q46 36 100 34 Q154 36 152 96 Q146 60 100 56 Q54 60 48 96Z" fill="${c}"/><path d="M100 36 L100 56" stroke="${avShade(c, 0.6)}" stroke-width="2"/>`,
    sidepart: `<path d="M48 96 Q44 34 100 32 Q156 34 152 96 Q150 62 132 56 Q104 50 80 66 Q60 70 48 96Z" fill="${c}"/><path d="M80 40 Q76 52 80 66" stroke="${avShade(c, 0.6)}" stroke-width="2" fill="none"/><path d="M90 42 Q120 36 142 52" stroke="${hi}" stroke-width="3" fill="none" opacity=".5"/>`,
    spiky: `<path d="M48 94 L46 56 L60 64 L62 30 L78 50 L88 18 L100 44 L114 16 L122 48 L140 28 L140 62 L154 56 L152 94 Q140 64 100 62 Q60 64 48 94Z" fill="${c}"/>`,
    pixie: `<path d="M48 100 Q42 36 100 32 Q158 36 152 92 Q140 60 112 58 Q84 74 58 70 Q50 84 48 100Z" fill="${c}"/><path d="M58 70 Q66 86 62 98" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
    waves: `<path d="M46 106 Q40 36 100 32 Q160 36 154 106 Q148 66 120 58 Q96 72 70 62 Q52 76 46 106Z" fill="${c}"/><path d="M64 48 Q80 40 96 48 Q112 40 128 48" stroke="${hi}" stroke-width="3" fill="none" opacity=".45"/>`,
    buns: `<path d="M48 94 Q46 36 100 34 Q154 36 152 94 Q144 58 100 54 Q56 58 48 94Z" fill="${c}"/><path d="M100 36 L100 54" stroke="${avShade(c, 0.6)}" stroke-width="2"/>`,
    dreads: `<path d="M48 96 Q46 36 100 34 Q154 36 152 96 Q144 60 100 56 Q56 60 48 96Z" fill="${c}"/>${[64, 80, 96, 112, 128].map((x) => `<path d="M${x} 52 L${x - 2} 70" stroke="${avShade(c, 0.75)}" stroke-width="6" stroke-linecap="round"/>`).join('')}`,
    mohawk: `<path d="M88 64 Q86 14 100 6 Q114 14 112 64Z" fill="${c}"/><path d="M50 92 Q50 50 88 46 M150 92 Q150 50 112 46" stroke="${c}" stroke-width="4" fill="none" opacity=".35"/>`,
    bald: '<path d="M74 52 Q90 44 104 46" stroke="#fff" stroke-width="4" fill="none" opacity=".35" stroke-linecap="round"/>',
  }[L.hair] || '';
}
function faceShape(L, fill) {
  return { oval: `<ellipse cx="100" cy="94" rx="47" ry="57" fill="${fill}"/>`, square: `<rect x="53" y="38" width="94" height="110" rx="32" fill="${fill}"/>` }[L.face] || `<ellipse cx="100" cy="94" rx="51" ry="54" fill="${fill}"/>`;
}
function eyesSvg(L) {
  const e = (x) => {
    const iris = `<circle cx="${x}" cy="100" r="6" fill="${L.eyeColor}"/><circle cx="${x}" cy="100" r="3" fill="#111"/><circle cx="${x + 2}" cy="97.5" r="1.8" fill="#fff"/>`;
    return {
      smile: `<path d="M${x - 9} 102 Q${x} 92 ${x + 9} 102" stroke="#222" stroke-width="3.2" fill="none" stroke-linecap="round"/>`,
      sharp: `<path d="M${x - 10} 100 Q${x} 92 ${x + 10} 99 Q${x} 106 ${x - 10} 100Z" fill="#fff"/>${iris}<path d="M${x - 10} 100 Q${x} 92 ${x + 10} 99" stroke="#222" stroke-width="2.4" fill="none"/>`,
      lashes: `<ellipse cx="${x}" cy="100" rx="9" ry="10" fill="#fff"/>${iris}<path d="M${x - 9} 96 Q${x} 88 ${x + 9} 96" stroke="#222" stroke-width="2.6" fill="none"/><path d="M${x + 8} 94 l5 -4 M${x + 5} 91 l3 -5" stroke="#222" stroke-width="2" stroke-linecap="round"/>`,
      sleepy: `<ellipse cx="${x}" cy="101" rx="9" ry="8" fill="#fff"/>${iris}<path d="M${x - 10} 99 Q${x} 92 ${x + 10} 99 L${x + 10} 96 Q${x} 88 ${x - 10} 96Z" fill="${L.skin}"/><path d="M${x - 10} 99 Q${x} 94 ${x + 10} 99" stroke="#222" stroke-width="2.4" fill="none"/>`,
    }[L.eyes] || `<ellipse cx="${x}" cy="100" rx="9" ry="10" fill="#fff"/>${iris}<path d="M${x - 9} 96 Q${x} 89 ${x + 9} 96" stroke="#222" stroke-width="2" fill="none"/>`;
  };
  return e(80) + e(120);
}
function browsSvg(L) {
  const c = avShade(L.hairColor === '#F2D9A0' || L.hairColor === '#B8B8B8' ? '#8A6A40' : L.hairColor, 0.8);
  const w = L.brows === 'bold' ? 5.5 : 3.5;
  const p = { arched: ['M70 86 Q80 76 90 84', 'M110 84 Q120 76 130 86'], angry: ['M70 82 L90 88', 'M110 88 L130 82'] }[L.brows] || ['M70 85 Q80 80 90 84', 'M110 84 Q120 80 130 85'];
  return p.map((d) => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`).join('');
}
function mouthSvg(L) {
  const lip = avShade(L.skin, 0.62);
  return {
    grin: '<path d="M84 124 Q100 142 116 124 Z" fill="#7A2030"/><path d="M86 125 L114 125 L112 130 L88 130Z" fill="#fff"/>',
    smirk: `<path d="M88 128 Q104 134 116 122" stroke="${lip}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
    open: '<ellipse cx="100" cy="128" rx="9" ry="8" fill="#7A2030"/><ellipse cx="100" cy="132" rx="5" ry="3" fill="#E36A7E"/>',
    pout: '<ellipse cx="100" cy="128" rx="7" ry="5" fill="#C9506A"/><path d="M93 127 L107 127" stroke="#8E2E45" stroke-width="1.4"/>',
    neutral: `<path d="M90 128 L110 128" stroke="${lip}" stroke-width="3.5" stroke-linecap="round"/>`,
  }[L.mouth] || `<path d="M86 124 Q100 138 114 124" stroke="${lip}" stroke-width="3.8" fill="none" stroke-linecap="round"/>`;
}
function beardSvg(L) {
  const c = L.hairColor;
  return {
    stubble: `<path d="M58 110 Q62 150 100 154 Q138 150 142 110 Q130 140 100 142 Q70 140 58 110Z" fill="${c}" opacity=".28"/>`,
    mustache: `<path d="M84 120 Q92 114 100 119 Q108 114 116 120 Q108 124 100 121 Q92 124 84 120Z" fill="${c}"/>`,
    goatee: `<path d="M90 136 Q100 154 110 136 Q100 142 90 136Z" fill="${c}"/><path d="M86 120 Q100 114 114 120 Q100 123 86 120Z" fill="${c}"/>`,
    full: `<path d="M54 104 Q56 158 100 160 Q144 158 146 104 Q140 128 120 134 Q100 122 80 134 Q60 128 54 104Z" fill="${c}"/><path d="M86 125 Q100 133 114 125" stroke="${avShade(c, 0.5)}" stroke-width="3" fill="none"/>`,
  }[L.beard] || '';
}
function glassesSvg(L) {
  return {
    round: '<g fill="none" stroke="#222" stroke-width="3"><circle cx="80" cy="100" r="13"/><circle cx="120" cy="100" r="13"/><path d="M93 100 L107 100"/></g>',
    square: '<g fill="none" stroke="#222" stroke-width="3.4"><rect x="64" y="89" width="32" height="22" rx="4"/><rect x="104" y="89" width="32" height="22" rx="4"/><path d="M96 98 L104 98"/></g>',
    shades: '<g><path d="M62 92 L98 92 L95 110 Q80 116 66 108Z M102 92 L138 92 L134 108 Q120 116 105 110Z" fill="#111"/><path d="M98 95 L102 95" stroke="#111" stroke-width="3"/><path d="M68 96 L78 96" stroke="#fff" stroke-width="2" opacity=".5"/></g>',
    aviator: '<g><path d="M62 92 L96 92 Q98 112 80 114 Q62 112 62 92Z M104 92 L138 92 Q138 112 120 114 Q102 112 104 92Z" fill="#C9A227" opacity=".55" stroke="#B8860B" stroke-width="2.4"/><path d="M96 95 L104 95" stroke="#B8860B" stroke-width="2.4"/></g>',
    heart: `<g fill="#F91880" opacity=".9">${[80, 120].map((x) => `<path d="M${x} 112 L${x - 15} 97 Q${x - 18} 86 ${x - 8} 86 Q${x - 2} 86 ${x} 92 Q${x + 2} 86 ${x + 8} 86 Q${x + 18} 86 ${x + 15} 97Z"/>`).join('')}<path d="M92 96 L108 96" stroke="#F91880" stroke-width="3"/></g>`,
    star: `<g fill="#F91880" stroke="#fff" stroke-width="1.5">${[80, 120].map((x) => `<path d="M${x} 85 L${x + 5} 95 L${x + 16} 96 L${x + 8} 104 L${x + 10} 115 L${x} 109 L${x - 10} 115 L${x - 8} 104 L${x - 16} 96 L${x - 5} 95Z"/>`).join('')}</g>`,
  }[L.glasses] || '';
}
function hatSvg(L) {
  const c = L.topColor === '#FFFFFF' ? '#1D9BF0' : L.topColor;
  return {
    cap: `<path d="M48 70 Q50 26 100 24 Q150 26 152 70Z" fill="${c}"/><path d="M48 70 Q20 72 14 80 Q50 82 100 72Z" fill="${avShade(c, 0.75)}"/><circle cx="100" cy="25" r="4" fill="${avShade(c, 0.7)}"/>`,
    beanie: `<path d="M46 76 Q46 18 100 16 Q154 18 154 76Z" fill="${c}"/><rect x="44" y="64" width="112" height="18" rx="8" fill="${avShade(c, 0.8)}"/><circle cx="100" cy="14" r="10" fill="${avShade(c, 1.2)}"/>`,
    bucket: `<path d="M56 64 Q58 22 100 20 Q142 22 144 64Z" fill="${c}"/><path d="M36 74 Q100 54 164 74 L150 62 Q100 50 50 62Z" fill="${avShade(c, 0.8)}"/>`,
    cowboy: '<path d="M64 60 Q66 14 100 12 Q134 14 136 60Z" fill="#8B5A2B"/><path d="M20 62 Q100 42 180 62 Q170 76 100 70 Q30 76 20 62Z" fill="#6E4420"/><rect x="64" y="50" width="72" height="8" fill="#3B2416"/>',
    beret: `<ellipse cx="96" cy="40" rx="56" ry="20" fill="${c}"/><path d="M48 46 Q100 64 150 46" stroke="${avShade(c, 0.7)}" stroke-width="4" fill="none"/><circle cx="96" cy="20" r="4" fill="${avShade(c, 0.7)}"/>`,
    bandana: `<path d="M46 64 Q50 30 100 28 Q150 30 154 64 Q100 54 46 64Z" fill="${c}"/>${[64, 84, 104, 124, 140].map((x) => `<circle cx="${x}" cy="44" r="3" fill="#fff" opacity=".8"/>`).join('')}<path d="M150 60 L168 72 L156 78Z" fill="${c}"/>`,
    headband: `<path d="M48 66 Q100 44 152 66" stroke="${c}" stroke-width="9" fill="none"/>`,
    tiara: '<path d="M64 46 Q100 30 136 46 L130 34 L118 40 L110 24 L100 36 L90 24 L82 40 L70 34Z" fill="#E8E8F0" stroke="#B9F2FF" stroke-width="2"/><circle cx="100" cy="30" r="4" fill="#7FDBFF"/><circle cx="84" cy="38" r="2.5" fill="#F4B6C2"/><circle cx="116" cy="38" r="2.5" fill="#F4B6C2"/>',
    halo: '<ellipse cx="100" cy="14" rx="42" ry="10" fill="none" stroke="#FFE27A" stroke-width="6" class="av-glow"/>',
    crown: '<path d="M60 56 L64 18 L82 40 L100 10 L118 40 L136 18 L140 56Z" fill="#FFD400" stroke="#C99A00" stroke-width="3"/><circle cx="100" cy="36" r="5" fill="#E0245E"/><circle cx="76" cy="44" r="4" fill="#1D9BF0"/><circle cx="124" cy="44" r="4" fill="#00BA7C"/>',
  }[L.hat] || '';
}
function earsSvg(L, behind) {
  if (behind) return `<circle cx="50" cy="100" r="11" fill="${L.skin}"/><circle cx="150" cy="100" r="11" fill="${L.skin}"/>`;
  return {
    studs: '<circle cx="48" cy="110" r="3.5" fill="#E8F6FF" stroke="#7FDBFF"/><circle cx="152" cy="110" r="3.5" fill="#E8F6FF" stroke="#7FDBFF"/>',
    hoops: '<circle cx="47" cy="118" r="8" fill="none" stroke="#FFD400" stroke-width="3"/><circle cx="153" cy="118" r="8" fill="none" stroke="#FFD400" stroke-width="3"/>',
    headphones: '<path d="M42 96 Q40 22 100 20 Q160 22 158 96" stroke="#222" stroke-width="8" fill="none"/><rect x="34" y="84" width="20" height="32" rx="9" fill="#E0245E"/><rect x="146" y="84" width="20" height="32" rx="9" fill="#E0245E"/>',
  }[L.ears] || '';
}
function topSvg(L) {
  const c = L.topColor, d = avShade(c, 0.78), torso = 'M50 262 L54 186 Q58 160 100 158 Q142 160 146 186 L150 262Z';
  const sleeves = (len) => `<path d="M58 172 L${len ? 42 : 50} ${len ? 248 : 204}" stroke="${c}" stroke-width="22" stroke-linecap="round"/><path d="M142 172 L${len ? 158 : 150} ${len ? 248 : 204}" stroke="${c}" stroke-width="22" stroke-linecap="round"/>`;
  const map = {
    tee: `${sleeves(false)}<path d="${torso}" fill="${c}"/><path d="M84 160 Q100 176 116 160" stroke="${d}" stroke-width="3" fill="none"/>`,
    hoodie: `${sleeves(true)}<path d="M64 168 Q100 196 136 168 Q130 150 100 150 Q70 150 64 168Z" fill="${d}"/><path d="${torso}" fill="${c}"/><path d="M76 214 L124 214 L120 244 L80 244Z" fill="${d}"/><path d="M92 170 L90 200 M108 170 L110 200" stroke="#fff" stroke-width="2.5"/>`,
    jacket: `${sleeves(true)}<path d="${torso}" fill="${c}"/><path d="M84 160 L100 230 L116 160 Q100 168 84 160Z" fill="#fff"/><path d="M84 160 L96 210 L78 196Z M116 160 L104 210 L122 196Z" fill="${d}"/><path d="M100 230 L100 262" stroke="${d}" stroke-width="2"/>`,
    suit: `${sleeves(true)}<path d="${torso}" fill="${c === '#FFFFFF' ? '#1B1B1B' : c}"/><path d="M84 160 L100 222 L116 160 Q100 168 84 160Z" fill="#fff"/><path d="M97 166 L103 166 L105 210 L100 218 L95 210Z" fill="#E0245E"/><path d="M84 160 L97 214 L76 194Z M116 160 L103 214 L124 194Z" fill="${avShade(c === '#FFFFFF' ? '#1B1B1B' : c, 0.7)}"/>`,
    jersey: `${sleeves(false)}<path d="${torso}" fill="${c}"/><path d="M50 186 L150 186" stroke="#fff" stroke-width="5" opacity=".7"/><text x="100" y="240" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="40" fill="#fff" opacity=".9">1</text>`,
    crop: `${sleeves(false)}<path d="M54 222 L56 186 Q60 160 100 158 Q140 160 144 186 L146 222Z" fill="${c}"/><path d="M56 222 L144 222 L148 262 L52 262Z" fill="${L.skin}"/>`,
    dress: `${sleeves(false)}<path d="M54 230 L56 186 Q60 160 100 158 Q140 160 144 186 L146 230 L162 318 L38 318Z" fill="${c}"/><path d="M56 232 L144 232" stroke="${d}" stroke-width="5"/>`,
    tank: `<path d="M64 262 L66 190 Q70 166 84 160 Q100 172 116 160 Q130 166 134 190 L136 262Z" fill="${c}"/><path d="M50 262 L54 190 Q56 172 66 166 L64 262Z M150 262 L146 190 Q144 172 134 166 L136 262Z" fill="${L.skin}"/>`,
    sweater: `${sleeves(true)}<path d="${torso}" fill="${c}"/><path d="M80 160 Q100 178 120 160" stroke="${d}" stroke-width="7" fill="none"/>${[196, 216, 236].map((y) => `<path d="M56 ${y} L144 ${y}" stroke="${d}" stroke-width="3" stroke-dasharray="6 4"/>`).join('')}<rect x="50" y="252" width="100" height="10" fill="${d}"/>`,
    tracksuit: `${sleeves(true)}<path d="${torso}" fill="${c}"/><path d="M100 160 L100 262" stroke="#ccc" stroke-width="3"/><path d="M58 174 L44 246 M142 174 L156 246" stroke="#fff" stroke-width="4"/><path d="M84 158 L100 172 L116 158" stroke="#fff" stroke-width="4" fill="none"/>`,
    varsity: `${sleeves(true).split(`stroke="${c}"`).join('stroke="#F4F1E8"')}<path d="${torso}" fill="${c}"/><path d="M84 160 L100 180 L116 160" stroke="#F4F1E8" stroke-width="6" fill="none"/><text x="78" y="210" font-family="Arial Black,Arial" font-weight="900" font-size="26" fill="#F4F1E8">C</text>${[200, 218, 236].map((y) => `<circle cx="106" cy="${y}" r="2.5" fill="#F4F1E8"/>`).join('')}`,
    puffer: `<path d="M58 172 L42 248" stroke="${c}" stroke-width="28" stroke-linecap="round"/><path d="M142 172 L158 248" stroke="${c}" stroke-width="28" stroke-linecap="round"/><path d="M44 266 L48 184 Q54 154 100 152 Q146 154 152 184 L156 266Z" fill="${c}"/>${[180, 204, 228, 252].map((y) => `<path d="M48 ${y} Q100 ${y + 8} 152 ${y}" stroke="${d}" stroke-width="3" fill="none"/>`).join('')}<path d="M100 152 L100 266" stroke="${d}" stroke-width="3"/><path d="M76 152 Q100 140 124 152 L120 166 Q100 158 80 166Z" fill="${d}"/>`,
    leather: `${sleeves(true).split(`stroke="${c}"`).join('stroke="#1B1B1B"')}<path d="${torso}" fill="#1B1B1B"/><path d="M84 160 L100 226 L116 160 Q100 168 84 160Z" fill="${c}"/><path d="M84 160 L96 206 L72 192Z M116 160 L104 206 L128 192Z" fill="#333"/><path d="M118 176 L132 200" stroke="#bbb" stroke-width="2"/><circle cx="66" cy="230" r="2" fill="#bbb"/><circle cx="134" cy="230" r="2" fill="#bbb"/>`,
    kimono: `${sleeves(true)}<path d="M36 200 L58 176 L58 236 Z M164 200 L142 176 L142 236Z" fill="${c}"/><path d="${torso}" fill="${c}"/><path d="M84 160 L116 228 M116 160 L92 214" stroke="#fff" stroke-width="5"/><rect x="50" y="222" width="100" height="16" fill="${d}"/>${[70, 110, 130].map((x, i) => `<circle cx="${x}" cy="${192 + i * 12}" r="4" fill="#fff" opacity=".6"/>`).join('')}`,
    gown: `<path d="M62 226 L62 182 Q66 166 84 162 Q100 170 116 162 Q134 166 138 182 L138 226 L176 350 L24 350Z" fill="${c}"/><path d="M62 226 L138 226" stroke="${d}" stroke-width="4"/>${[40, 70, 100, 130, 160].map((x) => `<circle cx="${x}" cy="${300 + (x % 3) * 12}" r="2" fill="#fff" opacity=".7"/>`).join('')}<path d="M52 186 L62 182 L62 200 Z M148 186 L138 182 L138 200Z" fill="${L.skin}"/>`,
    fur: `${sleeves(true)}<path d="${torso}" fill="#fff"/><path d="M40 170 Q30 200 44 260 L60 262 L62 180Z M160 170 Q170 200 156 260 L140 262 L138 180Z" fill="${c}"/>${[60, 76, 92, 108, 124, 140].map((x) => `<circle cx="${x}" cy="166" r="12" fill="${c}"/>`).join('')}`,
  };
  return map[L.top] || map.tee;
}
function bottomSvg(L) {
  const c = L.bottomColor, d = avShade(c, 0.75), skin = L.skin;
  const legs = (to) => `<rect x="68" y="${to}" width="26" height="${344 - to}" rx="10" fill="${skin}"/><rect x="106" y="${to}" width="26" height="${344 - to}" rx="10" fill="${skin}"/>`;
  if (L.top === 'dress') return legs(300);
  if (L.top === 'gown') return '';
  return {
    track: `<path d="M52 258 L148 258 L136 340 L104 340 L100 290 L96 340 L64 340Z" fill="${c}"/><path d="M60 262 L66 340 M140 262 L134 340" stroke="#fff" stroke-width="4"/>`,
    cargo: `<path d="M52 258 L148 258 L140 344 L104 344 L100 284 L96 344 L60 344Z" fill="${c}"/><rect x="56" y="290" width="22" height="22" rx="3" fill="${d}"/><rect x="122" y="290" width="22" height="22" rx="3" fill="${d}"/>`,
    flare: `<path d="M54 258 L146 258 L140 300 L152 344 L104 344 L100 284 L96 344 L48 344 L60 300Z" fill="${c}"/>`,
    leather: `<path d="M52 258 L148 258 L138 344 L104 344 L100 284 L96 344 L62 344Z" fill="#1B1B1B"/><path d="M70 270 Q76 300 72 340 M130 270 Q124 300 128 340" stroke="#444" stroke-width="2" fill="none"/>`,
    shorts: `${legs(290)}<path d="M52 258 L148 258 L146 298 L102 298 L100 280 L98 298 L54 298Z" fill="${c}"/>`,
    skirt: `${legs(296)}<path d="M52 258 L148 258 L160 308 L40 308Z" fill="${c}"/>`,
    joggers: `<path d="M52 258 L148 258 L136 340 L104 340 L100 290 L96 340 L64 340Z" fill="${c}"/><rect x="64" y="330" width="32" height="10" rx="4" fill="${d}"/><rect x="104" y="330" width="32" height="10" rx="4" fill="${d}"/>`,
    slacks: `<path d="M52 258 L148 258 L138 344 L104 344 L100 280 L96 344 L62 344Z" fill="${c}"/><path d="M80 268 L80 344 M120 268 L120 344" stroke="${d}" stroke-width="1.5"/>`,
  }[L.bottom] || `<path d="M52 258 L148 258 L138 344 L104 344 L100 284 L96 344 L62 344Z" fill="${c}"/><path d="M66 268 Q76 274 88 268 M112 268 Q124 274 134 268" stroke="${d}" stroke-width="2" fill="none"/><path d="M100 262 L100 284" stroke="${d}" stroke-width="2"/>`;
}
function shoesSvg(L) {
  const pair = (fn) => fn(80) + fn(120);
  return {
    boots: pair((x) => `<path d="M${x - 14} 322 L${x + 12} 322 L${x + 14} 352 L${x + 24} 356 L${x + 24} 364 L${x - 16} 364Z" fill="#6E4420"/>`),
    heels: pair((x) => `<path d="M${x - 12} 344 Q${x} 340 ${x + 18} 356 L${x + 18} 362 L${x - 10} 360Z" fill="#E0245E"/><rect x="${x - 12}" y="352" width="4" height="12" fill="#E0245E"/>`),
    slides: pair((x) => `<ellipse cx="${x + 2}" cy="358" rx="18" ry="6" fill="#222"/><rect x="${x - 12}" y="344" width="26" height="9" rx="4" fill="#fff"/>`),
    hightops: pair((x) => `<path d="M${x - 14} 330 L${x + 8} 330 L${x + 10} 346 Q${x + 22} 350 ${x + 22} 362 L${x - 16} 362Z" fill="#fff" stroke="#ccc"/><path d="M${x - 10} 336 L${x + 6} 336 M${x - 10} 342 L${x + 6} 342" stroke="${L.topColor === '#FFFFFF' ? '#E0245E' : L.topColor}" stroke-width="2.5"/><rect x="${x - 16}" y="358" width="38" height="4" fill="#E0245E"/>`),
    loafers: pair((x) => `<path d="M${x - 14} 348 Q${x} 340 ${x + 20} 352 L${x + 20} 360 L${x - 14} 360Z" fill="#5A3A1E"/><path d="M${x - 4} 348 L${x + 10} 350" stroke="#C99A00" stroke-width="2"/>`),
    platform: pair((x) => `<path d="M${x - 14} 342 Q${x} 336 ${x + 18} 346 L${x + 18} 354 L${x - 14} 354Z" fill="#111"/><rect x="${x - 16}" y="352" width="36" height="12" rx="3" fill="#E35C9F"/>`),
    gold: pair((x) => `<path d="M${x - 16} 346 Q${x} 336 ${x + 20} 350 L${x + 22} 362 L${x - 16} 362Z" fill="#FFD400" stroke="#C99A00" stroke-width="2"/><circle cx="${x + 2}" cy="350" r="2" fill="#fff"/>`),
  }[L.shoes] || pair((x) => `<path d="M${x - 16} 346 Q${x} 336 ${x + 20} 350 L${x + 22} 362 L${x - 16} 362Z" fill="#fff" stroke="#ccc"/><path d="M${x - 8} 350 L${x + 12} 352" stroke="${L.topColor === '#FFFFFF' ? '#1D9BF0' : L.topColor}" stroke-width="3"/><rect x="${x - 16}" y="358" width="38" height="4" fill="#ddd"/>`);
}
function neckSvg(L) {
  return {
    chain: '<path d="M78 162 Q100 206 122 162" stroke="#FFD400" stroke-width="4" fill="none" stroke-dasharray="5 2"/><circle cx="100" cy="190" r="7" fill="#FFD400" stroke="#C99A00" stroke-width="2"/>',
    scarf: `<path d="M74 154 Q100 176 126 154 L128 168 Q100 190 72 168Z" fill="${L.topColor === '#E0245E' ? '#FFD400' : '#E0245E'}"/><path d="M114 172 L120 214 L108 214 L106 176Z" fill="${L.topColor === '#E0245E' ? '#FFD400' : '#E0245E'}"/>`,
    bowtie: '<path d="M100 164 L84 156 L84 172Z M100 164 L116 156 L116 172Z" fill="#111"/><circle cx="100" cy="164" r="4" fill="#333"/>',
    choker: '<path d="M86 150 Q100 158 114 150" stroke="#111" stroke-width="5" fill="none"/><circle cx="100" cy="157" r="3" fill="#B9F2FF"/>',
    pearls: `${Array.from({ length: 9 }, (_, i) => { const t = i / 8, x = 80 + t * 40, y = 164 + Math.sin(t * Math.PI) * 22; return `<circle cx="${x}" cy="${y}" r="3.6" fill="#FFF8F0" stroke="#E8DCCB"/>`; }).join('')}`,
    diamond: '<path d="M76 162 Q100 214 124 162" stroke="#DFF6FF" stroke-width="5" fill="none"/><path d="M100 186 L110 198 L100 214 L90 198Z" fill="#B9F2FF" stroke="#fff" stroke-width="2"/><path d="M104 190 l6 -6 M96 190 l-6 -6" stroke="#fff" stroke-width="1.5"/>',
  }[L.neck] || '';
}
/* the whole character as SVG content (no wrapper), cached because it is drawn in many places */
const _lookCache = new Map();
function avatarBody(L) {
  const key = JSON.stringify(L);
  if (_lookCache.has(key)) return _lookCache.get(key);
  const skin = L.skin, sd = avShade(skin, 0.86);
  const hatHidesHair = ['cap', 'beanie', 'bucket', 'cowboy', 'bandana'].includes(L.hat);
  const out = `${hairBack(L)}${bottomSvg(L)}${shoesSvg(L)}
    <path d="M58 172 L44 250" stroke="${skin}" stroke-width="18" stroke-linecap="round"/><path d="M142 172 L156 250" stroke="${skin}" stroke-width="18" stroke-linecap="round"/>
    ${topSvg(L)}<circle cx="43" cy="255" r="10" fill="${skin}"/><circle cx="157" cy="255" r="10" fill="${skin}"/>
    <rect x="86" y="136" width="28" height="28" rx="10" fill="${sd}"/>${neckSvg(L)}
    ${earsSvg(L, true)}${faceShape(L, skin)}<ellipse cx="72" cy="118" rx="8" ry="5" fill="#FF7A8A" opacity=".25"/><ellipse cx="128" cy="118" rx="8" ry="5" fill="#FF7A8A" opacity=".25"/>
    ${hatHidesHair && L.hair !== 'long' && L.hair !== 'braids' ? '' : hairFront(L)}${browsSvg(L)}${eyesSvg(L)}
    <path d="M97 106 Q100 116 104 113" stroke="${avShade(skin, 0.7)}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    ${mouthSvg(L)}${beardSvg(L)}${glassesSvg(L)}${earsSvg(L, false)}${hatSvg(L)}`;
  if (_lookCache.size > 200) _lookCache.clear();
  _lookCache.set(key, out);
  return out;
}
const avatarFull = (L, cls = '') => `<svg class="${cls}" viewBox="0 0 200 380" aria-hidden="true">${avatarBody(L)}</svg>`;
const avatarHead = (L) => `<svg viewBox="30 4 140 140" aria-hidden="true">${avatarBody(L)}</svg>`;

/* ======================================================================
   Garage: every car has a body style; the scene shows up to three
   ====================================================================== */
const CARS = {
  hatch:    { name: 'Hatchback',           price: 12000,  style: 'hatch',    col: '#1D9BF0', reach: 0.01 },
  pickup:   { name: 'Lifted pickup',       price: 55000,  style: 'pickup',   col: '#2E8B57', reach: 0.02, upkeep: 60 },
  electric: { name: 'Electric sedan',      price: 60000,  style: 'electric', col: '#F4F6F8', reach: 0.02, upkeep: 30 },
  muscle:   { name: 'Muscle car',          price: 70000,  style: 'muscle',   col: '#FF7A00', reach: 0.03, upkeep: 90 },
  car:      { name: 'Supercar',            price: 90000,  style: 'sport',    col: '#E0245E' },
  suv:      { name: 'Luxury SUV',          price: 180000, style: 'suv',      col: '#1B1B1B', reach: 0.03, upkeep: 200 },
  classic:  { name: 'Classic convertible', price: 450000, style: 'classic',  col: '#7FD1B9', reach: 0.04, upkeep: 300 },
  limo:     { name: 'Stretch limo',        price: 900000, style: 'limo',     col: '#111111', reach: 0.04, upkeep: 600 },
  hyper:    { name: 'Hypercar',            price: 2.5e6,  style: 'hyper',    col: '#FFD400' },
  f1:       { name: 'Race car',            price: 1.2e7,  style: 'f1',       col: '#E0245E', reach: 0.07, upkeep: 8000 },
};
/* every car is also a Shop item (the supercar and hypercar already are) */
for (const [k, C] of Object.entries(CARS)) if (!SHOP.some((it) => it.id === k)) SHOP.push({ id: k, cat: 'Garage', name: C.name, price: C.price, reach: C.reach || 0, upkeep: C.upkeep || 0, desc: `+${Math.round((C.reach || 0) * 100)}% reach${C.upkeep ? `. ${money(C.upkeep)}/day upkeep` : ''}. Parks in your scene.` });
function garageSection() {
  const list = SHOP.filter((it) => it.cat === 'Garage').sort((a, b) => a.price - b.price);
  return `<div class="sect"><h3>🚗 Garage <span class="small muted">· pick which cars show in your scene in Me → Your look</span></h3><div class="cards">${list.map((it) => `<div class="card garage ${S.owned[it.id] ? 'owned' : ''}"><svg viewBox="-6 -10 140 52" class="car-thumb" aria-hidden="true">${carSvg(it.id, 0, 0, 1)}</svg><div class="t"><span>${esc(it.name)}</span><span class="num">${money(it.price)}</span></div><span class="small muted">${esc(it.desc)}</span>${S.owned[it.id] ? '<span class="pill good">In your garage</span>' : btn('Buy', 'buy', it.id, 'sm primary', S.money < it.price)}</div>`).join('')}</div></div>`;
}
const ownedCars = () => Object.keys(CARS).filter((k) => S.owned[k]).sort((a, b) => CARS[b].price - CARS[a].price);
const featuredCars = () => { const own = ownedCars(); const pick = (S.garage || []).filter((k) => own.includes(k)); return (pick.length ? pick : own).slice(0, 3); };
function carSvg(k, x, y, scale) {
  const C = CARS[k], c = C.col, d = avShade(c === '#111111' || c === '#1B1B1B' ? '#555555' : c, 0.75), glass = '#9ED8F5';
  const wheel = (cx, r = 10, white) => `<circle cx="${cx}" cy="30" r="${r}" fill="#111"/>${white ? `<circle cx="${cx}" cy="30" r="${r - 3}" fill="#eee"/>` : ''}<circle cx="${cx}" cy="30" r="${r * 0.4}" fill="#bbb"/>`;
  const body = {
    sport: [126, `<path d="M0 26 Q4 8 30 6 L56 0 Q80 -2 96 10 L118 14 Q126 18 124 28 L0 30Z" fill="${c}"/><path d="M40 6 L58 -4 Q76 -4 88 8Z" fill="${glass}"/>${wheel(26)}${wheel(100)}<rect x="116" y="18" width="8" height="4" fill="#FFE08A"/>`],
    hyper: [126, `<path d="M0 26 Q4 8 30 6 L56 0 Q80 -2 96 10 L118 14 Q126 18 124 28 L0 30Z" fill="${c}"/><path d="M40 6 L58 -4 Q76 -4 88 8Z" fill="${glass}"/><path d="M0 8 L14 4 L16 10 L2 12Z" fill="#111"/>${wheel(26)}${wheel(100)}<rect x="116" y="18" width="8" height="4" fill="#FFE08A"/>`],
    hatch: [108, `<path d="M8 28 Q8 10 30 6 L68 4 Q88 4 94 16 L104 18 Q108 22 106 28Z" fill="${c}"/><path d="M34 10 L52 8 L52 16 L30 17Z M56 8 L72 8 Q82 9 86 16 L56 16Z" fill="${glass}"/>${wheel(28, 9)}${wheel(86, 9)}`],
    pickup: [130, `<path d="M0 30 L0 14 L60 14 L62 0 L92 0 Q100 0 104 12 L126 14 Q130 18 128 30Z" fill="${c}"/><path d="M66 4 L88 4 L96 13 L66 13Z" fill="${glass}"/><rect x="2" y="10" width="56" height="4" fill="${d}"/>${wheel(26, 12)}${wheel(104, 12)}`],
    electric: [126, `<path d="M0 28 Q6 10 40 4 Q70 -2 100 10 L122 16 Q128 20 126 28Z" fill="${c}" stroke="#ccd" stroke-width="1.5"/><path d="M42 8 Q70 0 96 12 L42 14Z" fill="#1B1B1B"/><rect x="104" y="18" width="20" height="2" fill="#7FDBFF"/>${wheel(28)}${wheel(100)}`],
    muscle: [128, `<path d="M0 28 Q2 12 22 12 L44 10 L58 0 L86 0 L96 10 L124 14 Q128 18 126 28Z" fill="${c}"/><path d="M62 4 L84 4 L90 10 L60 10Z" fill="${glass}"/><path d="M4 18 L124 18 M4 22 L124 22" stroke="#fff" stroke-width="2.5"/>${wheel(26, 11)}${wheel(102, 11)}`],
    suv: [128, `<path d="M0 30 L4 8 Q8 0 24 0 L86 0 Q98 0 104 12 L124 16 Q128 20 126 30Z" fill="${c}"/><path d="M12 4 L40 4 L40 13 L8 13Z M44 4 L84 4 Q94 5 98 13 L44 13Z" fill="${glass}"/><rect x="2" y="-3" width="90" height="3" fill="#888"/>${wheel(26, 12)}${wheel(102, 12)}`],
    classic: [128, `<path d="M0 26 Q2 14 20 12 L40 10 Q50 2 62 2 L64 10 L118 14 Q128 18 126 28 L0 30Z" fill="${c}"/><path d="M50 4 L62 2 L62 10 L44 10Z" fill="${glass}"/><path d="M2 24 L126 24" stroke="#E8E8E8" stroke-width="3"/>${wheel(26, 10, true)}${wheel(100, 10, true)}`],
    limo: [172, `<path d="M0 28 Q2 12 20 10 L40 8 L52 0 L140 0 L150 8 Q166 10 170 28Z" fill="${c}"/>${[56, 78, 100, 122].map((x) => `<rect x="${x}" y="3" width="18" height="7" fill="#333"/>`).join('')}<path d="M2 20 L168 20" stroke="#999" stroke-width="1.5"/>${wheel(26)}${wheel(146)}`],
    f1: [140, `<path d="M0 28 L18 22 L58 20 L74 10 L90 10 L96 20 L134 22 L136 28Z" fill="${c}"/><rect x="128" y="10" width="8" height="14" fill="${d}"/><rect x="0" y="18" width="14" height="4" fill="${d}"/><circle cx="82" cy="12" r="5" fill="#FFD400"/><path d="M60 22 L120 22" stroke="#fff" stroke-width="3"/>${wheel(22, 13)}${wheel(116, 13)}`],
  }[C.style];
  return `<g transform="translate(${x} ${y}) scale(${(scale * 126) / body[0]})">${body[1]}</g>`;
}

/* ======================================================================
   Lifestyle scene
   ====================================================================== */
const ownsProp = (...ks) => S.bank && ks.some((k) => S.bank.props[k]);
const BACKDROPS = {
  room:      { name: 'Bedroom studio', ok: () => true },
  apartment: { name: 'City balcony', ok: () => S.owned.studio_apt || S.owned.condo || ownsProp('loft', 'duplex') },
  mansion:   { name: 'Hillside mansion', ok: () => S.owned.mansion },
  beach:     { name: 'Beach house', ok: () => S.owned.villa || ownsProp('beach') },
  penthouse: { name: 'Penthouse rooftop', ok: () => S.owned.tower || ownsProp('block', 'hotel', 'plaza', 'tower') },
  island:    { name: 'Private island', ok: () => S.owned.island },
  cabin:     { name: 'Mountain cabin', ok: () => S.owned.cabin },
  loft:      { name: 'Industrial loft', ok: () => S.owned.loft },
  lake:      { name: 'Lake house', ok: () => S.owned.lakehouse },
  desert:    { name: 'Desert palace', ok: () => S.owned.palace },
  castle:    { name: 'Castle estate', ok: () => S.owned.castle },
  space:     { name: 'Orbit', ok: () => !!(S.prestige && S.prestige.space) },
};
const RANK = ['space', 'island', 'castle', 'penthouse', 'desert', 'lake', 'mansion', 'beach', 'loft', 'cabin', 'apartment', 'room'];
function sceneKey() { const k = S.scene; return k && BACKDROPS[k] && BACKDROPS[k].ok() ? k : RANK.find((x) => x !== 'space' && BACKDROPS[x].ok()); }
const palm = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 Q4 -40 -2 -80" stroke="#8B5A2B" stroke-width="7" fill="none"/>${[[-40, -70], [40, -72], [-30, -96], [34, -98], [0, -104]].map(([dx, dy]) => `<path d="M-2 -80 Q${dx / 2} ${dy - 14} ${dx} ${dy}" stroke="#2E8B57" stroke-width="8" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
function backdropSvg(k) {
  const sky = (a, b) => `<defs><linearGradient id="sky-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="250" fill="url(#sky-${k})"/>`;
  const sea = (y) => `<rect y="${y}" width="400" height="${250 - y}" fill="#1E90C8"/><path d="M0 ${y + 8} Q20 ${y + 4} 40 ${y + 8} T80 ${y + 8} T120 ${y + 8} T160 ${y + 8} T200 ${y + 8} T240 ${y + 8} T280 ${y + 8} T320 ${y + 8} T360 ${y + 8} T400 ${y + 8}" stroke="#fff" stroke-width="2" fill="none" opacity=".35" class="av-wave"/>`;
  const skyline = (y, col, lit) => [20, 52, 84, 120, 160, 196, 236, 270, 306, 344, 376].map((x, i) => { const h = 40 + ((i * 37) % 70); return `<rect x="${x}" y="${y - h}" width="${26 + (i % 3) * 6}" height="${h}" fill="${col}"/>${lit ? Array.from({ length: 6 }, (_, j) => `<rect x="${x + 5 + (j % 2) * 10}" y="${y - h + 8 + Math.floor(j / 2) * 12}" width="5" height="6" fill="#FFE08A" opacity="${(i + j) % 3 ? 0.85 : 0.3}"/>`).join('') : ''}`; }).join('');
  return {
    room: `<rect width="400" height="250" fill="#2B1B4A"/><rect x="0" y="200" width="400" height="50" fill="#3A2A5E"/><rect x="250" y="34" width="120" height="96" rx="6" fill="#0B1A3A" stroke="#4A3A7E" stroke-width="6"/>${[262, 284, 306, 330, 348].map((x, i) => `<rect x="${x}" y="${130 - 26 - (i * 17) % 40}" width="16" height="${26 + (i * 17) % 40}" fill="#1B2B5A"/>`).join('')}<circle cx="335" cy="62" r="10" fill="#FFF3C4"/><text x="60" y="80" font-family="Arial Black,Arial" font-weight="900" font-size="30" fill="#F91880" opacity=".9" class="av-neon">clout</text>${S.owned.ring ? '<circle cx="40" cy="120" r="26" fill="none" stroke="#fff" stroke-width="7" opacity=".9"/><path d="M40 146 L40 210" stroke="#555" stroke-width="4"/>' : ''}${S.owned.pc ? '<rect x="290" y="150" width="70" height="44" rx="4" fill="#111"/><rect x="295" y="155" width="60" height="34" fill="#7856FF"/><rect x="280" y="194" width="90" height="8" fill="#5A4A8E"/>' : ''}`,
    apartment: `${sky('#FF9A8B', '#FFD3A5')}${skyline(205, '#6A4C93', false)}<rect y="205" width="400" height="45" fill="#D9D2E9"/><rect y="186" width="400" height="6" fill="#ffffff" opacity=".7"/>${[0, 80, 160, 240, 320].map((x) => `<rect x="${x}" y="186" width="4" height="30" fill="#fff" opacity=".7"/>`).join('')}`,
    mansion: `${sky('#7EC8F2', '#DFF3FF')}<path d="M0 150 Q120 110 230 140 Q330 120 400 150 L400 250 L0 250Z" fill="#8FC77E"/><rect x="190" y="70" width="190" height="90" fill="#FAFAFA"/><rect x="170" y="60" width="230" height="12" fill="#E8E8E8"/>${[205, 245, 285, 325].map((x) => `<rect x="${x}" y="88" width="30" height="50" fill="#9ED8F5" stroke="#ddd" stroke-width="2"/>`).join('')}<rect y="196" width="400" height="54" fill="#E9E2D4"/><rect x="200" y="204" width="190" height="34" rx="6" fill="#3EC1F3"/><path d="M210 214 Q240 210 270 214 T330 214 T380 214" stroke="#fff" stroke-width="2" fill="none" opacity=".6" class="av-wave"/>${palm(30, 200, 0.9)}`,
    beach: `${sky('#5BC0F8', '#FFF4D6')}<circle cx="70" cy="60" r="26" fill="#FFE27A"/>${sea(140)}<path d="M0 190 Q200 170 400 190 L400 250 L0 250Z" fill="#F4D9A0"/><rect x="250" y="96" width="130" height="80" fill="#FFF"/><path d="M240 100 L315 60 L390 100Z" fill="#E07A5F"/><rect x="270" y="120" width="34" height="56" fill="#9ED8F5"/>${palm(220, 196)}${palm(380, 200, 0.8)}`,
    penthouse: `${sky('#0B1033', '#3A1C71')}${[30, 90, 150, 330, 370].map((x, i) => `<circle class="v-twinkle" style="animation-delay:${i * 0.4}s" cx="${x}" cy="${20 + (i * 13) % 40}" r="1.5" fill="#fff"/>`).join('')}<circle cx="340" cy="40" r="16" fill="#F5F3CE"/>${skyline(200, '#1B1F4B', true)}<rect y="200" width="400" height="50" fill="#2A2D44"/><rect y="194" width="400" height="6" fill="#88A" opacity=".6"/><circle cx="330" cy="226" r="22" fill="none" stroke="#FFD400" stroke-width="3"/><text x="330" y="233" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="20" fill="#FFD400">H</text>`,
    island: `${sky('#3FB6F2', '#C9F1FF')}<circle cx="60" cy="50" r="22" fill="#FFF1A8"/>${sea(120)}<ellipse cx="200" cy="225" rx="230" ry="50" fill="#F2D49B"/><ellipse cx="200" cy="225" rx="230" ry="50" fill="none" stroke="#7FE0F5" stroke-width="6" opacity=".6"/><rect x="260" y="130" width="110" height="60" fill="#FFF"/><path d="M250 134 L315 100 L380 134Z" fill="#C8A26B"/>${palm(230, 205)}${palm(70, 210, 1.1)}${palm(380, 205, 0.8)}`,
    cabin: `${sky('#9CC9F0', '#EAF4FF')}<path d="M0 150 L70 60 L140 150Z M100 150 L190 40 L280 150Z M240 150 L320 70 L400 150Z" fill="#7A8CA8"/><path d="M50 86 L70 60 L90 86 L80 80 L70 90 L60 80Z M168 66 L190 40 L212 66 L200 60 L190 72 L180 60Z M302 92 L320 70 L338 92 L328 86 L320 96 L312 86Z" fill="#fff"/><rect y="150" width="400" height="100" fill="#F4F8FF"/>${[20, 60, 340, 380].map((x) => `<path d="M${x} 200 L${x - 16} 200 L${x} 150 L${x + 16} 200Z" fill="#2E6B4F"/>`).join('')}<rect x="250" y="120" width="120" height="76" fill="#8B5A2B"/><path d="M240 124 L310 84 L380 124Z" fill="#5A3A1E"/><path d="M240 124 L310 84 L380 124" stroke="#fff" stroke-width="6" fill="none"/>${[132, 146, 160, 174, 188].map((y) => `<path d="M250 ${y} L370 ${y}" stroke="#6E4420" stroke-width="2"/>`).join('')}<rect x="300" y="150" width="22" height="46" fill="#3B2416"/><rect x="266" y="140" width="22" height="20" fill="#FFD27A"/><rect x="336" y="140" width="22" height="20" fill="#FFD27A"/>`,
    loft: `<rect width="400" height="250" fill="#8E4B3A"/>${Array.from({ length: 12 }, (_, r) => Array.from({ length: 9 }, (_, c) => `<rect x="${c * 46 + (r % 2) * 23 - 10}" y="${r * 18}" width="42" height="15" fill="#A0573F" opacity=".55"/>`).join('')).join('')}<rect x="200" y="20" width="180" height="150" fill="#1B2B5A"/><g stroke="#222" stroke-width="5">${[245, 290, 335].map((x) => `<path d="M${x} 20 L${x} 170"/>`).join('')}<path d="M200 95 L380 95"/></g><rect x="200" y="20" width="180" height="150" fill="none" stroke="#222" stroke-width="8"/>${[214, 252, 300, 340].map((x, i) => `<rect x="${x}" y="${110 - i * 12}" width="24" height="${60 + i * 12}" fill="#2C3E70"/>`).join('')}<rect y="200" width="400" height="50" fill="#6B5B4B"/>${[20, 80, 140].map((x) => `<path d="M${x} 0 L${x} 40" stroke="#222" stroke-width="2"/><circle cx="${x}" cy="46" r="7" fill="#FFE08A"/>`).join('')}`,
    lake: `${sky('#8EC5FC', '#E0C3FC')}<path d="M0 130 L80 70 L150 120 L230 50 L320 120 L400 80 L400 140 L0 140Z" fill="#6A8CAF"/>${sea(138).replace('#1E90C8', '#3E86B8')}<path d="M0 200 Q200 180 400 200 L400 250 L0 250Z" fill="#7FB069"/><rect x="40" y="168" width="120" height="8" fill="#8B5A2B"/>${[50, 90, 130].map((x) => `<rect x="${x}" y="168" width="5" height="22" fill="#6E4420"/>`).join('')}<rect x="250" y="110" width="130" height="80" fill="#E8DCC8"/><path d="M240 114 L315 70 L390 114Z" fill="#4A6B8A"/><rect x="262" y="128" width="104" height="30" fill="#9ED8F5" opacity=".9"/>${palm(-40, 0, 0)}`,
    desert: `${sky('#FFB86C', '#FFE8C2')}<circle cx="320" cy="58" r="30" fill="#FFF1B8"/><path d="M0 160 Q100 120 200 160 Q300 130 400 160 L400 250 L0 250Z" fill="#E7B66B"/><path d="M0 200 Q150 170 300 200 Q360 210 400 196 L400 250 L0 250Z" fill="#D9A04F"/><rect x="220" y="96" width="160" height="80" fill="#F6E7CF"/>${[240, 300, 360].map((x) => `<path d="M${x - 18} 100 Q${x} 56 ${x + 18} 100Z" fill="#E9C46A"/><rect x="${x - 7}" y="130" width="14" height="30" rx="7" fill="#C9A26B"/>`).join('')}<rect x="384" y="74" width="10" height="102" fill="#F6E7CF"/><circle cx="389" cy="70" r="7" fill="#E9C46A"/>${palm(100, 196, 0.8)}<rect x="120" y="200" width="120" height="16" rx="8" fill="#3EC1F3"/>`,
    castle: `${sky('#A1C4FD', '#C2E9FB')}<path d="M0 170 Q120 120 240 160 Q330 130 400 160 L400 250 L0 250Z" fill="#6FAF5E"/>${[220, 300, 360].map((x, i) => `<rect x="${x}" y="${60 + i * 10}" width="34" height="${130 - i * 10}" fill="#B8B2A7"/><path d="M${x - 4} ${60 + i * 10} L${x + 17} ${24 + i * 10} L${x + 38} ${60 + i * 10}Z" fill="#4A5D8A"/><rect x="${x + 12}" y="${86 + i * 10}" width="10" height="16" rx="5" fill="#3B3B4F"/>`).join('')}<rect x="250" y="110" width="110" height="80" fill="#C9C3B8"/>${Array.from({ length: 7 }, (_, i) => `<rect x="${250 + i * 16}" y="102" width="10" height="10" fill="#C9C3B8"/>`).join('')}<path d="M290 190 L290 156 Q305 140 320 156 L320 190Z" fill="#5A3A1E"/><path d="M237 24 L237 4 L254 10 L237 16" fill="#E0245E"/>`,
    space: `<rect width="400" height="250" fill="#05051A"/>${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 97) % 400}" cy="${(i * 53) % 250}" r="${i % 5 ? 1 : 1.8}" fill="#fff" opacity=".8"/>`).join('')}<circle cx="320" cy="300" r="190" fill="#1E6FB8"/><path d="M180 250 Q240 170 330 160 Q300 200 360 230" fill="#2E8B57" opacity=".8"/><circle cx="320" cy="300" r="194" fill="none" stroke="#7FDBFF" stroke-width="6" opacity=".4"/>`,
  }[k];
}
const hasWater = (k) => k === 'beach' || k === 'island' || k === 'lake';
function propsSvg(k) {
  let back = '', front = '';
  if (S.owned.jet) back += `<g class="av-fly"><path d="M250 46 L330 40 Q348 40 352 46 Q348 52 330 52 L250 50Z" fill="#fff" stroke="#ccd" stroke-width="1.5"/><path d="M296 44 L280 22 L292 22 L314 44Z M296 50 L282 66 L294 66 L314 50Z M252 46 L246 32 L256 32 L264 46Z" fill="#dde"/>${[310, 318, 326].map((x) => `<circle cx="${x}" cy="45" r="2" fill="#4A90D9"/>`).join('')}<path d="M246 47 L170 50" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/></g>`;
  if (S.prestige && S.prestige.space && k !== 'space') back += '<g transform="translate(186 16) rotate(25) scale(.8)"><path d="M0 0 Q8 -24 16 0 L16 30 L0 30Z" fill="#fff"/><circle cx="8" cy="10" r="4" fill="#1D9BF0"/><path d="M0 30 L-6 40 L0 36Z M16 30 L22 40 L16 36Z" fill="#E0245E"/><path d="M4 32 Q8 50 12 32" fill="#FF7A00"/></g>';
  if (S.owned.heli) back += k === 'penthouse' ? '<g transform="translate(300 196)"><ellipse cx="30" cy="0" rx="30" ry="14" fill="#E0245E"/><path d="M58 -2 L96 -8 L98 -2 L60 4Z" fill="#E0245E"/><path d="M-6 -16 L66 -16" stroke="#333" stroke-width="3"/><rect x="28" y="-16" width="4" height="4" fill="#333"/><ellipse cx="18" cy="-2" rx="10" ry="7" fill="#9ED8F5"/><path d="M10 14 L50 14" stroke="#333" stroke-width="3"/></g>'
    : '<g class="av-heli"><g transform="translate(120 92) scale(.55)"><ellipse cx="30" cy="0" rx="30" ry="14" fill="#E0245E"/><path d="M58 -2 L96 -8 L98 -2 L60 4Z" fill="#E0245E"/><path d="M-6 -16 L66 -16" stroke="#333" stroke-width="3"/><ellipse cx="18" cy="-2" rx="10" ry="7" fill="#9ED8F5"/></g></g>';
  if (S.owned.yacht && hasWater(k)) back += `<g transform="translate(20 150)"><path d="M0 20 L120 20 L104 36 L14 36Z" fill="#fff" stroke="#ccd"/><rect x="24" y="8" width="64" height="12" rx="3" fill="#fff" stroke="#ccd"/><rect x="40" y="0" width="34" height="8" rx="2" fill="#fff" stroke="#ccd"/>${[30, 44, 58, 72].map((x) => `<rect x="${x}" y="11" width="8" height="5" fill="#2A4B7C"/>`).join('')}</g>`;
  if (S.acq && Object.keys(S.acq.own).length && k !== 'space') {
    const icons = Object.keys(S.acq.own).slice(0, 4).map((c) => BIZ[c].icon).join(' ');
    back += `<g transform="translate(20 20)"><rect width="${30 + Object.keys(S.acq.own).slice(0, 4).length * 26}" height="38" rx="6" fill="#111" opacity=".85"/><text x="10" y="26" font-size="20">${icons}</text><rect x="${12 + Object.keys(S.acq.own).slice(0, 4).length * 13}" y="38" width="4" height="30" fill="#555"/></g>`;
  }
  // ground layer: vehicles take slots around the character, never in front of them
  const slots = [[262, 182, 1], [10, 182, 1], [300, 168, 0.7], [40, 168, 0.7]].filter((sl, i) => !(k === 'penthouse' && S.owned.heli && i % 2 === 0));
  const placed = featuredCars().map((c, i) => [slots[i], c]).filter(([sl]) => sl);
  placed.filter(([sl]) => sl[2] < 1).reverse().forEach(([sl, c]) => { front = carSvg(c, sl[0], sl[1], sl[2]) + front; });
  placed.filter(([sl]) => sl[2] === 1).forEach(([sl, c]) => { front += carSvg(c, sl[0], sl[1], 1); });
  if (S.money >= 1e8) front += `<g transform="translate(124 216) scale(.72)">${[0, 1, 2].map((r) => [0, 1, 2 - r].map((c) => `<path d="M${c * 22 + r * 11} ${-r * 10} l20 0 l-4 -8 l-12 0Z" fill="#FFD400" stroke="#C99A00"/>`).join('')).join('')}</g>`;
  else if (S.money >= 1e6) front += `<g transform="translate(128 212)">${[0, 1, 2, 3].map((i) => `<rect x="${(i % 2) * 20}" y="${-Math.floor(i / 2) * 8}" width="18" height="7" rx="1" fill="#3DAA5C" stroke="#1E7A3C"/>`).join('')}</g>`;
  if (S.owned.pet) front += '<g transform="translate(236 204) scale(.85)"><ellipse cx="20" cy="16" rx="18" ry="11" fill="#E0A458" stroke="#8A5A2B" stroke-width="1.5"/><circle cx="38" cy="6" r="10" fill="#E0A458" stroke="#8A5A2B" stroke-width="1.5"/><ellipse cx="44" cy="2" rx="4" ry="7" fill="#B9782F"/><circle cx="41" cy="5" r="1.8" fill="#111"/><circle cx="47" cy="8" r="2" fill="#111"/><path d="M2 12 Q-8 4 -4 -4" stroke="#E0A458" stroke-width="5" fill="none" stroke-linecap="round" class="av-wag"/><rect x="8" y="22" width="5" height="10" fill="#E0A458"/><rect x="28" y="22" width="5" height="10" fill="#E0A458"/></g>';
  return { back, front };
}
const _sceneCache = new Map();
function lifestyleScene(opts = {}) {
  const k = opts.scene || sceneKey(), L = opts.look || lookInit();
  /* scenes are drawn often (Home, profile, the picker), so cache them by everything they show */
  const sig = [k, JSON.stringify(L), featuredCars().join(), S.owned.jet, S.owned.yacht, S.owned.heli, S.owned.pet, S.owned.ring, S.owned.pc, S.money >= 1e8 ? 2 : S.money >= 1e6 ? 1 : 0, S.acq ? Object.keys(S.acq.own).slice(0, 4).join() : '', !!(S.prestige && S.prestige.space), S.name].join('|');
  if (_sceneCache.has(sig)) return _sceneCache.get(sig);
  if (_sceneCache.size > 40) _sceneCache.clear();
  const p = propsSvg(k);
  const out = `<svg class="life-scene" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(S.name)} at the ${BACKDROPS[k].name.toLowerCase()}">${backdropSvg(k)}${p.back}<ellipse cx="200" cy="236" rx="40" ry="7" fill="#000" opacity=".2"/><svg x="152" y="${k === 'space' ? 50 : 66}" width="96" height="182" viewBox="0 0 200 380">${k === 'space' ? '<rect x="40" y="0" width="120" height="150" rx="60" fill="#fff" opacity=".18" stroke="#fff" stroke-width="4"/>' : ''}${avatarBody(L)}</svg>${p.front}</svg>`;
  _sceneCache.set(sig, out);
  return out;
}

/* ======================================================================
   Customizer screen
   ====================================================================== */
const COLOR_OF = { hair: ['hairColor', HAIR_COLORS], eyes: ['eyeColor', EYE_COLORS], top: ['topColor', CLOTH], bottom: ['bottomColor', CLOTH] };
const LOOK_TABS = [['face', 'Face', ['skin', 'face', 'eyes', 'brows', 'mouth', 'beard']], ['hair', 'Hair', ['hair']], ['outfit', 'Outfit', ['top', 'bottom', 'shoes']], ['extras', 'Extras', ['glasses', 'hat', 'neck', 'ears']], ['scene', 'Scene', []]];
function vAvatar() {
  const L = lookInit(), tabK = ui.lookTab || 'face';
  const tabs = LOOK_TABS.find((t) => t[0] === tabK) || LOOK_TABS[0];
  const optRow = (k) => {
    if (k === 'skin') return `<span class="opt-lbl">Skin tone</span><div class="swatches">${SKIN_TONES.map((c) => `<button class="sw ${L.skin === c ? 'on' : ''}" style="background:${c}" data-act="lookSet" data-arg="skin:${c}" aria-label="Skin tone"></button>`).join('')}</div>`;
    const color = COLOR_OF[k];
    return `<span class="opt-lbl">${LOOK_LABEL[k]}</span><div class="look-opts">${LOOK_OPTS[k].map((v) => { const t = { ...L, [k]: v }, price = LOOK_PRICE[`${k}:${v}`], own = ownsPiece(k, v);
      return `<button class="look-opt ${L[k] === v ? 'on' : ''}" data-act="lookSet" data-arg="${k}:${v}" aria-label="${LOOK_LABEL[k]} ${v}">${['top', 'bottom', 'shoes', 'neck'].includes(k) ? `<svg viewBox="20 130 160 240">${avatarBody(t)}</svg>` : avatarHead(t)}<span>${v === 'none' ? 'None' : v[0].toUpperCase() + v.slice(1)}</span>${price && !own ? `<i class="lk-price">💎${price.gems}</i>` : ''}</button>`; }).join('')}</div>
      ${color ? `<div class="swatches">${color[1].map((c) => `<button class="sw ${L[color[0]] === c ? 'on' : ''}" style="background:${c}" data-act="lookSet" data-arg="${color[0]}:${c}" aria-label="${LOOK_LABEL[k]} color"></button>`).join('')}</div>` : ''}`;
  };
  const pending = ui.lookBuy && LOOK_PRICE[ui.lookBuy];
  const sceneTab = `<div class="cards">${Object.entries(BACKDROPS).map(([k, B]) => { const ok = B.ok();
    return `<button class="scene-pick ${sceneKey() === k ? 'on' : ''}" data-act="${ok ? 'sceneSet' : 'noop'}" data-arg="${k}" ${ok ? '' : 'disabled'}>${ok ? lifestyleScene({ scene: k }) : '<div class="scene-lock">🔒</div>'}<span>${B.name}${ok ? '' : ` · ${{ cabin: 'buy the mountain cabin', loft: 'buy the industrial loft', lake: 'buy the lake house', desert: 'buy the desert palace', castle: 'buy the castle', apartment: 'buy an apartment', mansion: 'buy the mansion', beach: 'buy a beach house', penthouse: 'own a tower or big building', island: 'buy the island', space: 'fly to space (Prestige)' }[k]}`}</span></button>`; }).join('')}</div>
    ${ownedCars().length ? `<span class="opt-lbl">Cars in your scene (up to 3)</span><div class="scroller" style="flex-wrap:wrap">${ownedCars().map((c) => chip(CARS[c].name, 'garagePick', c, featuredCars().includes(c))).join('')}</div>` : `<span class="small muted">No cars yet. The Shop's Garage has ten, from a $12K hatchback to a $12M race car.</span>`}
    <span class="small muted">Everything you own shows up in your scene: supercars, the jet, the yacht, the helicopter, your dog, your cash, gold bars, and billboards for your companies.</span>`;
  return `<div class="col-head">${head('Your look', 'Customize your character and your scene')}</div>
    <div class="sect look-preview">${lifestyleScene()}<div class="row">${btn('🎲 Randomize', 'lookRandom', '', 'sm')}${btn('Show on profile', 'go', 'profile', 'sm')}</div></div>
    ${pending ? `<div class="sect"><div class="hint warn-hint">${LOOK_LABEL[ui.lookBuy.split(':')[0]]} "${ui.lookBuy.split(':')[1]}" is a premium piece. Buy it once and it's yours forever.<div class="row" style="margin-top:8px">${btn(`Buy for ${money(pending.cash)}`, 'lookBuy', 'cash', 'sm primary', S.money < pending.cash)}${btn(`Buy for 💎 ${pending.gems}`, 'lookBuy', 'gems', 'sm blue', gems() < pending.gems)}${btn('Cancel', 'lookBuy', 'cancel', 'sm')}</div></div></div>` : ''}
    <div class="sect">${tabsBar(LOOK_TABS.map(([k, l]) => [k, l]), tabK, 'lookTab').replace('class="tabs"', 'class="tabs scroll"')}
      <div class="look-panel">${tabK === 'scene' ? sceneTab : tabs[2].map(optRow).join('')}</div></div>`;
}
const AVATAR_ACT = {
  lookTab: (a) => { ui.lookTab = a; },
  lookSet: (a) => {
    const i = a.indexOf(':'), k = a.slice(0, i), v = a.slice(i + 1), L = lookInit();
    if (LOOK_OPTS[k] && !ownsPiece(k, v)) { ui.lookBuy = `${k}:${v}`; return; }
    L[k] = v; ui.lookBuy = null;
    if (k === 'top' && v === 'dress') L.bottom = L.bottom || 'jeans';
  },
  lookBuy: (a) => {
    const id = ui.lookBuy, P = LOOK_PRICE[id]; if (a === 'cancel' || !P) { ui.lookBuy = null; return; }
    if (a === 'cash') { if (!spend(P.cash)) return toast('Not enough money.', 'bad'); }
    else { const st = storeInit(); if (st.gems < P.gems) { toast('Not enough Gems.', 'bad'); return; } st.gems -= P.gems; }
    S.wardrobe = S.wardrobe || []; S.wardrobe.push(id);
    const [k, v] = id.split(':'); lookInit()[k] = v; ui.lookBuy = null;
    toast(`✨ Yours forever: ${v}`, 'gold'); sound('cash'); celebrate('gold');
  },
  lookRandom: () => { const L = randomLook(Math.random()); for (const k of Object.keys(L)) if (LOOK_OPTS[k] && !ownsPiece(k, L[k])) delete L[k]; S.look = { ...lookInit(), ...L }; },
  sceneSet: (a) => { if (BACKDROPS[a] && BACKDROPS[a].ok()) S.scene = a; },
  garagePick: (a) => { let g = featuredCars().slice(); if (g.includes(a)) g = g.filter((x) => x !== a); else { g.unshift(a); g = g.slice(0, 3); } S.garage = g.length ? g : null; },
};
