/* Clout Chaser — detailed cartoon faces and designed brand logos.
   Parody stars get signature caricature traits (hair, beard, shades, chains) so they're recognizable
   as characters; they're cartoons, not likenesses. Parody brands get their own designed marks. */
'use strict';

const FACE_SKINS = ['#FBE0CC', '#F2CBA8', '#E3AE85', '#C98E62', '#A86F48', '#7E4E31', '#5A3522'];
const FACE_HAIRS = ['#16110E', '#2E2119', '#4A2F1D', '#6E4527', '#A87444', '#D9B47A', '#ECD9B0', '#B5B5B5', '#C2185B', '#3949AB', '#D84315', '#1B5E20'];
const FACE_SHIRTS = ['#24324F', '#8A2B4B', '#1F6F5C', '#C58B2A', '#4B3B8F', '#B7472A', '#2B6CB0', '#262626', '#E2E8F0', '#0E7C86'];
const IRIS = ['#3B2416', '#5B3A1E', '#2E5E8C', '#3D7A4A', '#6B6B6B'];
const HAIR_STYLES = ['crop', 'side', 'slick', 'bangs', 'long', 'curly', 'afro', 'buzz', 'bun', 'pony', 'spiky', 'swoop', 'braids', 'bob', 'bald', 'wavy'];

/* Signature caricature traits for the parody cast */
const CELEB_LOOK = {
  taylor:     { skin: 0, hair: '#E8C77A', style: 'bangs', lips: '#C8102E', shirt: '#7B2CF5' },
  elon:       { skin: 0, hair: '#3A2A20', style: 'crop', shirt: '#111', brows: 'flat' },
  zuck:       { skin: 0, hair: '#5B3A22', style: 'crop', shirt: '#6B7280', eyes: 'wide' },
  kym:        { skin: 1, hair: '#0E0B0A', style: 'long', lips: '#9C4A3C', shirt: '#C9A27E' },
  kylie:      { skin: 1, hair: '#1A1210', style: 'long', lips: '#B5305A', shirt: '#E0A6B6' },
  ronaldough: { skin: 2, hair: '#1A120D', style: 'slick', shirt: '#C8102E', brows: 'arched', smile: 'grin' },
  messy:      { skin: 1, hair: '#5A3A22', style: 'side', beard: 'full', shirt: '#75AADB' },
  mrfeast:    { skin: 0, hair: '#5B3A22', style: 'side', shirt: '#29B6F6', smile: 'grin' },
  drayke:     { skin: 3, hair: '#120D0A', style: 'buzz', beard: 'full', shirt: '#111', chain: true },
  kendrik:    { skin: 5, hair: '#120D0A', style: 'braids', beard: 'goatee', shirt: '#2F2F2F' },
  rihannah:   { skin: 4, hair: '#7A1010', style: 'long', lips: '#8E1B3A', shirt: '#111', earrings: true },
  beyonslay:  { skin: 4, hair: '#C99540', style: 'wavy', lips: '#A64B4B', shirt: '#D4AF37', earrings: true },
  beaver:     { skin: 0, hair: '#D9B47A', style: 'swoop', shirt: '#F2F2F2', hat: 'beanie', hatColor: '#3C3C3C' },
  venti:      { skin: 1, hair: '#5A3420', style: 'pony', lips: '#C25B7A', shirt: '#E8D9F2', earrings: true },
  pebble:     { skin: 3, style: 'bald', beard: 'goatee', shirt: '#111', brows: 'raised' },
  loganp:     { skin: 0, hair: '#E3C37A', style: 'side', shirt: '#1E88E5' },
  jakep:      { skin: 0, hair: '#E8CC85', style: 'spiky', shirt: '#E53935', chain: true },
  senate:     { skin: 5, hair: '#111', style: 'buzz', shirt: '#7E57C2', hat: 'durag', hatColor: '#111' },
  snoop:      { skin: 5, hair: '#111', style: 'braids', beard: 'goatee', shades: true, shirt: '#2E7D32' },
  eyelash:    { skin: 0, hair: '#111', style: 'long', streak: '#7CFC00', shirt: '#7CFC00' },
  badbunni:   { skin: 2, hair: '#2B1B12', style: 'crop', beard: 'stubble', shades: true, shirt: '#FF8FB1' },
  selina:     { skin: 1, hair: '#2B1B12', style: 'long', lips: '#B23A48', shirt: '#F48FB1' },
  zendayah:   { skin: 3, hair: '#3B2416', style: 'wavy', lips: '#9C4A3C', shirt: '#2E7D6B' },
  oprah:      { skin: 4, hair: '#2B1B12', style: 'curly', lips: '#9C3A3A', shirt: '#7B1FA2', earrings: true },
  khaby:      { skin: 5, hair: '#111', style: 'buzz', beard: 'stubble', shirt: '#F5F5F5', brows: 'raised', smile: 'flat' },
  lebrawn:    { skin: 5, hair: '#111', style: 'buzz', beard: 'full', shirt: '#FDB927', hat: 'headband', hatColor: '#fff' },
  shakirra:   { skin: 1, hair: '#D9A44E', style: 'curly', lips: '#B5305A', shirt: '#E65100', earrings: true },
  charlie:    { skin: 0, hair: '#3B2416', style: 'long', shirt: '#F8BBD0' },
  doja:       { skin: 4, hair: '#C2185B', style: 'bob', lips: '#7B1FA2', shirt: '#111' },
  cardi:      { skin: 2, hair: '#E06A2B', style: 'long', lips: '#D81B60', shirt: '#FFD54F', earrings: true },
  nicki:      { skin: 3, hair: '#F06292', style: 'bangs', lips: '#EC407A', shirt: '#FFEB3B' },
  sped:       { skin: 5, hair: '#111', style: 'buzz', shirt: '#FFD600', smile: 'grin', brows: 'raised' },
  gordon:     { skin: 0, hair: '#E8C77A', style: 'spiky', shirt: '#F5F5F5', brows: 'angry', smile: 'flat' },
  nova:       { skin: 1, hair: '#2B2B2B', style: 'slick', shirt: '#4B5563', glasses: true },
};

function faceSvg(seed) {
  if (faceCache.has(seed)) return faceCache.get(seed);
  const r = srand(hashStr(seed) % 100000 + 7);
  const p = (a) => a[Math.floor(r() * a.length)];
  const id = String(seed).startsWith('npc:') ? String(seed).slice(4) : null;
  const L = (id && CELEB_LOOK[id]) || {};
  const skin = L.skin !== undefined ? FACE_SKINS[L.skin] : p(FACE_SKINS);
  const hair = L.hair || p(FACE_HAIRS), shirt = L.shirt || p(FACE_SHIRTS), iris = p(IRIS);
  const fem = L.lips || L.earrings ? true : r() < 0.5;
  const style = L.style || p(fem ? ['long', 'bangs', 'bob', 'bun', 'pony', 'wavy', 'curly', 'braids', 'afro'] : ['crop', 'side', 'slick', 'buzz', 'spiky', 'swoop', 'curly', 'afro', 'bald']);
  const dark = shade(skin, -0.18), lip = L.lips || (fem ? shade(skin, -0.32) : shade(skin, -0.38));
  const hairD = shade(hair, -0.25);
  const beard = L.beard || (!fem && r() < 0.28 ? p(['stubble', 'full', 'goatee', 'stache']) : null);
  const shades = L.shades || (!L.glasses && r() < 0.1);
  const glasses = L.glasses || (!shades && r() < 0.12);
  const smile = L.smile || p(['smile', 'smile', 'grin', 'flat', 'smirk']);
  const brows = L.brows || 'soft';
  const earrings = L.earrings || (fem && r() < 0.3);
  const hat = L.hat || (r() < 0.07 ? p(['cap', 'beanie']) : null);
  const hatColor = L.hatColor || p(FACE_SHIRTS);

  // back hair (behind head)
  const back = {
    long: `<path d="M13 28 Q11 52 16 64 L48 64 Q53 52 51 28 Q48 12 32 11 Q16 12 13 28Z" fill="${hair}"/>`,
    wavy: `<path d="M12 28 Q8 44 13 52 Q9 58 14 64 L50 64 Q55 58 51 52 Q56 44 52 28 Q48 11 32 10 Q16 11 12 28Z" fill="${hair}"/>`,
    braids: `<path d="M14 26 Q12 50 15 63 L21 63 L22 34Z M50 26 Q52 50 49 63 L43 63 L42 34Z" fill="${hair}"/>${[16, 19, 45, 48].map((x) => `<path d="M${x} 36 V62" stroke="${hairD}" stroke-width="1.2" stroke-dasharray="2 2"/>`).join('')}`,
    bob: `<path d="M13 28 Q12 46 17 50 L47 50 Q52 46 51 28 Q48 12 32 11 Q16 12 13 28Z" fill="${hair}"/>`,
    pony: `<path d="M44 14 Q60 18 56 44 Q54 54 50 58 Q52 40 46 24Z" fill="${hair}"/>`,
    curly: `<g fill="${hair}">${[[16, 26, 8], [48, 26, 8], [14, 38, 7], [50, 38, 7], [18, 48, 6], [46, 48, 6]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}"/>`).join('')}</g>`,
    afro: `<circle cx="32" cy="24" r="21" fill="${hair}"/>`,
  }[style] || '';
  // front hair
  const front = {
    crop: `<path d="M17 27 Q17 12 32 12 Q47 12 47 27 Q44 19 38 18 Q30 21 20 20 Q18 23 17 27Z" fill="${hair}"/>`,
    side: `<path d="M16 28 Q15 11 33 11 Q48 12 48 27 Q45 17 34 18 Q24 17 19 22 Q17 25 16 28Z" fill="${hair}"/><path d="M34 12 Q30 17 22 19" stroke="${hairD}" stroke-width="1" fill="none"/>`,
    slick: `<path d="M17 26 Q18 10 32 10 Q46 10 47 26 Q44 15 32 15 Q22 15 17 26Z" fill="${hair}"/><path d="M22 15 Q32 11 43 16 M24 18 Q33 13 44 19" stroke="${hairD}" stroke-width=".9" fill="none"/>`,
    bangs: `<path d="M15 30 Q14 10 32 10 Q50 10 49 30 Q47 22 44 21 L40 24 L37 20 L33 24 L29 20 L25 24 L22 21 Q18 23 15 30Z" fill="${hair}"/>`,
    long: `<path d="M15 30 Q15 10 32 10 Q49 10 49 30 Q46 18 33 17 Q22 17 18 26Z" fill="${hair}"/>`,
    wavy: `<path d="M14 31 Q13 9 32 9 Q51 9 50 31 Q47 17 38 16 Q36 21 28 19 Q20 19 17 26Z" fill="${hair}"/>`,
    curly: `<g fill="${hair}">${[[20, 18, 6], [27, 13, 6.5], [35, 12, 6.5], [42, 15, 6], [46, 22, 5], [17, 24, 5]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}"/>`).join('')}</g>`,
    afro: '',
    buzz: `<path d="M17.5 27 Q17 13 32 13 Q47 13 46.5 27 Q45 18 32 17 Q19 18 17.5 27Z" fill="${hair}" opacity=".85"/>`,
    bun: `<circle cx="32" cy="7" r="6" fill="${hair}"/><path d="M16 28 Q16 11 32 11 Q48 11 48 28 Q45 17 32 16 Q20 17 16 28Z" fill="${hair}"/>`,
    pony: `<path d="M16 28 Q16 11 32 11 Q48 11 48 28 Q45 17 32 16 Q20 17 16 28Z" fill="${hair}"/>`,
    spiky: `<path d="M17 26 L16 15 L21 18 L22 10 L27 15 L30 8 L34 14 L38 8 L40 15 L45 10 L44 18 L48 16 L47 26 Q44 19 32 18 Q20 19 17 26Z" fill="${hair}"/>`,
    swoop: `<path d="M16 28 Q14 12 30 10 Q46 9 49 22 Q50 26 47 27 Q44 18 36 18 Q30 22 22 22 Q18 24 16 28Z" fill="${hair}"/><path d="M48 22 Q40 14 28 16" stroke="${hairD}" stroke-width="1" fill="none"/>`,
    braids: `<path d="M16 28 Q16 11 32 11 Q48 11 48 28 Q44 18 32 17 Q20 18 16 28Z" fill="${hair}"/>${[22, 27, 32, 37, 42].map((x) => `<path d="M${x} 12 V20" stroke="${hairD}" stroke-width="1"/>`).join('')}`,
    bob: `<path d="M15 30 Q15 10 32 10 Q49 10 49 30 Q46 20 40 19 Q32 22 24 19 Q18 21 15 30Z" fill="${hair}"/>`,
    bald: `<ellipse cx="25" cy="17" rx="6" ry="3" fill="#fff" opacity=".18"/>`,
  }[style] || '';
  const streak = L.streak ? `<path d="M22 13 Q20 22 18 30" stroke="${L.streak}" stroke-width="3" fill="none" stroke-linecap="round"/>` : '';
  // eyes, brows, nose, mouth
  const ey = 31 + r() * 1.5;
  const eye = (x) => shades ? '' : `<ellipse cx="${x}" cy="${ey}" rx="3.1" ry="${L.eyes === 'wide' ? 2.8 : 2.4}" fill="#fff"/><circle cx="${x + 0.3}" cy="${ey + 0.2}" r="1.7" fill="${iris}"/><circle cx="${x + 0.3}" cy="${ey + 0.2}" r=".8" fill="#111"/><circle cx="${x + 0.9}" cy="${ey - 0.5}" r=".55" fill="#fff"/>${fem ? `<path d="M${x - 3.3} ${ey - 1.2} Q${x} ${ey - 3.4} ${x + 3.4} ${ey - 1.6}" stroke="#111" stroke-width=".9" fill="none"/>` : ''}`;
  const by = ey - 5;
  const brow = (x, m) => ({
    soft: `<path d="M${x - 3.5} ${by + 0.5} Q${x} ${by - 1.3} ${x + 3.5} ${by + 0.3}" stroke="${hairD}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
    flat: `<path d="M${x - 3.5} ${by} H${x + 3.5}" stroke="${hairD}" stroke-width="1.6" stroke-linecap="round"/>`,
    arched: `<path d="M${x - 3.6} ${by + 0.8} Q${x} ${by - 2.4} ${x + 3.6} ${by}" stroke="${hairD}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
    raised: m < 0 ? `<path d="M${x - 3.5} ${by - 1.5} Q${x} ${by - 3.6} ${x + 3.5} ${by - 1.8}" stroke="${hairD}" stroke-width="1.7" fill="none" stroke-linecap="round"/>` : `<path d="M${x - 3.5} ${by + 0.4} Q${x} ${by - 0.8} ${x + 3.5} ${by + 0.4}" stroke="${hairD}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`,
    angry: `<path d="M${x - 3.5} ${by + (m < 0 ? -1 : 1.2)} L${x + 3.5} ${by + (m < 0 ? 1.2 : -1)}" stroke="${hairD}" stroke-width="1.8" stroke-linecap="round"/>`,
  }[brows]);
  const browCol = style === 'bald' ? shade(skin, -0.5) : hairD;
  const nose = `<path d="M32 33 Q30.5 38 32.5 38.6 Q34 38.8 34.6 37.8" stroke="${dark}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  const my = 43;
  const mouth = {
    smile: `<path d="M27.5 ${my} Q32 ${my + 4.2} 36.5 ${my}" stroke="${lip}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
    grin: `<path d="M26.5 ${my - 0.5} Q32 ${my + 6} 37.5 ${my - 0.5} Z" fill="#5A1E1E"/><path d="M27.5 ${my} Q32 ${my + 1.8} 36.5 ${my}" stroke="#fff" stroke-width="1.6" fill="none"/>`,
    flat: `<path d="M28.5 ${my + 0.6} H35.5" stroke="${lip}" stroke-width="1.8" stroke-linecap="round"/>`,
    smirk: `<path d="M28 ${my + 0.8} Q32 ${my + 2} 36.5 ${my - 0.8}" stroke="${lip}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  }[smile];
  const lipsFill = L.lips ? `<path d="M27.8 ${my} Q30 ${my - 1.6} 32 ${my - 0.6} Q34 ${my - 1.6} 36.2 ${my} Q32 ${my + 3.6} 27.8 ${my}Z" fill="${L.lips}"/>` : '';
  const beardSvg = !beard ? '' : {
    stubble: `<path d="M19 38 Q20 52 32 54 Q44 52 45 38 Q42 47 32 48 Q22 47 19 38Z" fill="${hair}" opacity=".35"/>`,
    full: `<path d="M18 33 Q18 54 32 56 Q46 54 46 33 Q44 46 38 46 Q32 44 26 46 Q20 46 18 33Z" fill="${hair}"/><path d="M27 ${my - 1.5} Q32 ${my - 3.5} 37 ${my - 1.5}" stroke="${hair}" stroke-width="2.6" fill="none"/>`,
    goatee: `<path d="M27 46 Q32 55 37 46 Q32 49 27 46Z" fill="${hair}"/><path d="M27.5 ${my - 1.5} Q32 ${my - 3.4} 36.5 ${my - 1.5}" stroke="${hair}" stroke-width="2.2" fill="none"/>`,
    stache: `<path d="M26.5 ${my - 1.2} Q32 ${my - 4.5} 37.5 ${my - 1.2} Q32 ${my - 2} 26.5 ${my - 1.2}Z" fill="${hair}"/>`,
  }[beard];
  const shadesSvg = shades ? `<path d="M18.5 ${ey - 3} H45.5 L44.5 ${ey + 1.5} Q43 ${ey + 4} 38.5 ${ey + 4} Q34.5 ${ey + 4} 33.5 ${ey + 0.5} H30.5 Q29.5 ${ey + 4} 25.5 ${ey + 4} Q21 ${ey + 4} 19.5 ${ey + 1.5}Z" fill="#111"/><path d="M22 ${ey - 1.5} L25 ${ey - 1.5}" stroke="#fff" stroke-width=".8" opacity=".6"/>` : '';
  const glassesSvg = glasses ? `<rect x="20.5" y="${ey - 3.4}" width="9" height="6.6" rx="2" fill="none" stroke="#222" stroke-width="1.2"/><rect x="34.5" y="${ey - 3.4}" width="9" height="6.6" rx="2" fill="none" stroke="#222" stroke-width="1.2"/><path d="M29.5 ${ey - 1} H34.5" stroke="#222" stroke-width="1.2"/>` : '';
  const ear = earrings ? `<circle cx="17.5" cy="38" r="1.5" fill="#F2C94C"/><circle cx="46.5" cy="38" r="1.5" fill="#F2C94C"/>` : '';
  const hatSvg = !hat ? '' : {
    cap: `<path d="M15 24 Q16 8 32 8 Q48 8 49 24 Z" fill="${hatColor}"/><path d="M44 23 Q55 22 58 26 L46 26Z" fill="${shade(hatColor, -0.2)}"/>`,
    beanie: `<path d="M15 25 Q15 6 32 6 Q49 6 49 25 Z" fill="${hatColor}"/><rect x="14" y="21" width="36" height="6" rx="3" fill="${shade(hatColor, -0.2)}"/>`,
    durag: `<path d="M15 27 Q15 8 32 8 Q49 8 49 27 Q44 20 32 20 Q20 20 15 27Z" fill="${hatColor}"/><path d="M47 24 Q52 34 50 44" stroke="${hatColor}" stroke-width="3" fill="none"/>`,
    headband: `<rect x="16" y="19" width="32" height="4.5" rx="2" fill="${hatColor}"/>`,
  }[hat];
  const chain = L.chain ? `<path d="M22 54 Q32 62 42 54" stroke="#F2C94C" stroke-width="2" fill="none" stroke-dasharray="2 1"/>` : '';
  const collar = `<path d="M26 51 L32 57 L38 51" fill="none" stroke="${shade(shirt, -0.25)}" stroke-width="1.4"/>`;
  const svg = `<svg viewBox="0 0 64 64" aria-hidden="true">
    ${back}
    <path d="M8 64 Q10 51 24 49 L40 49 Q54 51 56 64Z" fill="${shirt}"/>${collar}
    <path d="M27 42 H37 V51 Q32 54 27 51Z" fill="${dark}"/>
    <ellipse cx="17.5" cy="33" rx="2.8" ry="3.8" fill="${skin}"/><ellipse cx="46.5" cy="33" rx="2.8" ry="3.8" fill="${skin}"/>
    <path d="M17.5 30 Q17 14 32 13.5 Q47 14 46.5 30 Q46.5 44 40 49 Q32 53 24 49 Q17.5 44 17.5 30Z" fill="${skin}"/>
    <ellipse cx="23" cy="39" rx="3" ry="1.8" fill="#E57373" opacity="${fem ? 0.28 : 0.12}"/><ellipse cx="41" cy="39" rx="3" ry="1.8" fill="#E57373" opacity="${fem ? 0.28 : 0.12}"/>
    ${beardSvg}${lipsFill}${mouth}${nose}
    ${eye(25)}${eye(39)}
    ${brow(25, -1).replace(new RegExp(hairD, 'g'), browCol)}${brow(39, 1).replace(new RegExp(hairD, 'g'), browCol)}
    ${front}${streak}${hatSvg}${shadesSvg}${glassesSvg}${ear}${chain}
  </svg>`;
  faceCache.set(seed, svg);
  return svg;
}
function shade(hex, k) {
  const h = hex.replace('#', ''); const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16); let rr = (n >> 16) & 255, gg = (n >> 8) & 255, bb = n & 255;
  const f = (c) => Math.max(0, Math.min(255, Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k)));
  return `#${[f(rr), f(gg), f(bb)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/* ---------- logos ---------- */
const CO_LOGOS = {
  windys:    (c) => `<rect width="64" height="64" rx="14" fill="#fff"/><circle cx="32" cy="27" r="14" fill="#F2C3A0"/><path d="M18 22 Q18 10 32 10 Q46 10 46 22 Q40 16 32 16 Q24 16 18 22Z" fill="#D7263D"/><path d="M17 24 Q10 30 14 38 M47 24 Q54 30 50 38" stroke="#D7263D" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="27" cy="27" r="1.6" fill="#222"/><circle cx="37" cy="27" r="1.6" fill="#222"/><text x="32" y="56" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="11" fill="#D7263D">Windy's</text>`,
  mcdougals: () => `<rect width="64" height="64" rx="14" fill="#DA291C"/><path d="M20 22 L23 50 H41 L44 22Z" fill="#FFC72C"/>${[24, 28, 32, 36, 40].map((x, i) => `<rect x="${x - 1.6}" y="${10 + (i % 2) * 3}" width="3.2" height="16" rx="1" fill="#FFE58A"/>`).join('')}<path d="M26 34 Q32 40 38 34" stroke="#DA291C" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  nikey:     () => `<rect width="64" height="64" rx="14" fill="#111"/><path d="M12 40 Q22 44 50 22 Q34 38 26 40 Q18 42 12 40Z" fill="#fff"/><circle cx="48" cy="19" r="3" fill="#fff"/><text x="32" y="56" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="9" fill="#fff" letter-spacing="1">NIKEY</text>`,
  pear:      () => `<rect width="64" height="64" rx="14" fill="#F5F5F7"/><path d="M32 18 Q38 18 39 26 Q47 33 44 44 Q41 54 32 54 Q23 54 20 44 Q17 33 25 26 Q26 18 32 18Z" fill="#1D1D1F"/><path d="M32 18 Q33 12 38 10" stroke="#1D1D1F" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M33 13 Q40 9 42 15 Q36 17 33 13Z" fill="#34C759"/>`,
  tezla: () => `<rect width="64" height="64" rx="14" fill="#111"/><path d="M16 14 H48 V20 H36 L30 32 H38 L24 54 L28 36 H20 L26 20 H16Z" fill="#E31937"/>`,
  netflux: () => `<rect width="64" height="64" rx="14" fill="#141414"/><rect x="12" y="16" width="40" height="28" rx="5" fill="#E50914"/><path d="M28 23 L39 30 L28 37Z" fill="#fff"/><text x="32" y="56" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="8" fill="#E50914" letter-spacing="1">NETFLUX</text>`,
  starbux:   () => `<rect width="64" height="64" rx="14" fill="#fff"/><circle cx="32" cy="32" r="24" fill="#00704A"/><circle cx="32" cy="32" r="16" fill="#fff"/><path d="M32 20 L35 28 L43 28 L37 33 L39 41 L32 36 L25 41 L27 33 L21 28 L29 28Z" fill="#00704A"/><text x="32" y="15.5" text-anchor="middle" font-family="Arial" font-weight="700" font-size="5" fill="#fff" letter-spacing="1">STARBUX</text>`,
  redbully:  () => `<rect width="64" height="64" rx="14" fill="#1E3264"/><circle cx="32" cy="30" r="9" fill="#FFC906"/><path d="M8 40 Q14 30 22 32 L26 36 L22 42 Q14 44 8 40Z M56 40 Q50 30 42 32 L38 36 L42 42 Q50 44 56 40Z" fill="#DB0A40"/><text x="32" y="56" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="8" fill="#fff">RED BULLY</text>`,
  cocakola: () => `<rect width="64" height="64" rx="14" fill="#E41E2B"/>${[[14, 46, 3], [22, 52, 2], [48, 48, 3.5], [40, 54, 2]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="#fff" opacity=".5"/>`).join('')}<text x="32" y="34" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="13" fill="#fff">Coca-Kola</text>`,
  amazin:    () => `<rect width="64" height="64" rx="14" fill="#fff"/><text x="32" y="34" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="15" fill="#111">amazin'</text><path d="M14 40 Q32 34 48 40" stroke="#FF9900" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M45 36 L50 41 L44 43" stroke="#FF9900" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  gucchi: () => `<rect width="64" height="64" rx="14" fill="#0F3B2E"/><circle cx="32" cy="27" r="14" fill="none" stroke="#D4AF37" stroke-width="2"/><text x="32" y="33" text-anchor="middle" font-family="Didot, Georgia, serif" font-size="18" fill="#D4AF37">G</text><text x="32" y="55" text-anchor="middle" font-family="Didot, Georgia, serif" font-size="9" fill="#D4AF37" letter-spacing="2">GUCCHI</text>`,
  duolinguo: () => `<rect width="64" height="64" rx="14" fill="#58CC02"/><ellipse cx="32" cy="36" rx="18" ry="19" fill="#89E219"/><circle cx="25" cy="31" r="7" fill="#fff"/><circle cx="39" cy="31" r="7" fill="#fff"/><circle cx="26" cy="32" r="3.5" fill="#111"/><circle cx="38" cy="32" r="3.5" fill="#111"/><path d="M29 39 L32 43 L35 39Z" fill="#FFC800"/><path d="M18 20 L24 26 M46 20 L40 26" stroke="#58A700" stroke-width="3" stroke-linecap="round"/>`,
};
/* Designed marks for sponsor brands: shape + monogram + accent, stable per name */
function logoSvg(name, color) {
  const coId = Object.keys(CO_LOGOS).find((k) => COMPANIES[k] && COMPANIES[k].name === name);
  if (coId) return `<svg viewBox="0 0 64 64" aria-hidden="true">${CO_LOGOS[coId](color)}</svg>`;
  const r = srand(hashStr(name) % 100000 + 11);
  const words = name.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean);
  const mono = esc(words.length > 1 ? words[0][0] + words[1][0] : (words[0] || '?').slice(0, 2));
  const PAL = ['#E63946', '#1D9BF0', '#00A86B', '#7B2CF5', '#FF8A00', '#0E7C86', '#D81B60', '#3949AB', '#C58B2A', '#111827'];
  const c = !color || color === '#2C3E50' ? PAL[hashStr(name) % PAL.length] : color, c2 = shade(c, 0.35), c3 = shade(c, -0.3);
  const shape = Math.floor(r() * 5);
  const mark = [
    `<circle cx="32" cy="27" r="15" fill="${c2}"/><circle cx="32" cy="27" r="15" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>`,
    `<path d="M32 10 L47 18.5 V35.5 L32 44 L17 35.5 V18.5Z" fill="${c2}"/>`,
    `<path d="M32 10 L48 16 V28 Q48 40 32 46 Q16 40 16 28 V16Z" fill="${c2}"/>`,
    `<rect x="17" y="12" width="30" height="30" rx="8" fill="${c2}" transform="rotate(45 32 27)"/>`,
    `<path d="M14 36 Q22 10 50 14 Q38 18 34 30 Q30 40 14 36Z" fill="${c2}"/><circle cx="44" cy="34" r="5" fill="#fff" opacity=".85"/>`,
  ][shape];
  const word = esc((words[0] || name).toUpperCase().slice(0, 9));
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lg${hashStr(name)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c3}"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#lg${hashStr(name)})"/>${mark}<text x="32" y="${shape === 4 ? 30 : 32}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${mono.length > 1 ? 12 : 16}" fill="#fff">${mono}</text><text x="32" y="57" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${word.length > 7 ? 6 : 7.5}" fill="#fff" letter-spacing=".6" opacity=".95">${word}</text></svg>`;
}
