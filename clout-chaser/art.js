/* Clout Chaser — generated art: face avatars, company logos, post illustrations, photo uploads */
'use strict';

const SKINS = ['#F6D3B8', '#EBBE98', '#D9A177', '#BC8257', '#965F3D', '#6B3F28', '#4A2B1C'];
const HAIRS = ['#1C1714', '#3A2A1F', '#5E3B22', '#8A5A33', '#C8A06A', '#E8DDC8', '#B83280', '#3F51B5', '#D45A2A', '#6C6C6C'];
const SHIRTS = ['#2E3A59', '#8A2B4B', '#1F6F5C', '#C58B2A', '#4B3B8F', '#B7472A', '#2B6CB0', '#333333', '#E2E8F0'];
const hashStr = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); };
const faceCache = new Map();

/* A small illustrated face, deterministic from a seed string */
function faceSvg(seed) {
  if (faceCache.has(seed)) return faceCache.get(seed);
  const r = srand(hashStr(seed) % 100000 + 7);
  const p = (a) => a[Math.floor(r() * a.length)];
  const skin = p(SKINS), hair = p(HAIRS), shirt = p(SHIRTS);
  const style = Math.floor(r() * 7), extra = r();
  const eyeY = 30 + r() * 2, mouth = Math.floor(r() * 3);
  const back = style === 2 || style === 5 ? `<path d="M15 30 Q14 52 22 60 L42 60 Q50 52 49 30 Z" fill="${hair}"/>` : '';
  const top = [
    `<path d="M18 28 Q19 12 32 12 Q46 12 46 28 Q42 19 32 19 Q23 19 18 28Z" fill="${hair}"/>`,
    `<path d="M18 27 Q18 13 32 13 Q46 13 46 27 L44 22 Q38 18 26 21 Q21 22 18 27Z" fill="${hair}"/>`,
    `<path d="M17 30 Q16 11 32 11 Q48 11 47 30 Q44 18 32 17 Q22 18 17 30Z" fill="${hair}"/>`,
    `<g fill="${hair}"><circle cx="21" cy="19" r="6"/><circle cx="29" cy="14" r="6.5"/><circle cx="37" cy="14" r="6.5"/><circle cx="44" cy="20" r="6"/><circle cx="17" cy="26" r="4.5"/><circle cx="47" cy="27" r="4.5"/></g>`,
    `<path d="M19 26 Q20 16 32 16 Q44 16 45 26 Q40 21 32 21 Q24 21 19 26Z" fill="${hair}" opacity=".85"/>`,
    `<g fill="${hair}"><path d="M17 30 Q16 12 32 12 Q48 12 47 30 Q43 20 32 19 Q21 20 17 30Z"/><circle cx="32" cy="9" r="6"/></g>`,
    `<path d="M28 20 L32 6 L36 20 Q32 18 28 20Z" fill="${hair}"/>`,
  ][style];
  const acc = extra < 0.18 ? `<rect x="20" y="${eyeY - 3}" width="10" height="6" rx="2" fill="#111"/><rect x="34" y="${eyeY - 3}" width="10" height="6" rx="2" fill="#111"/><rect x="29" y="${eyeY - 1}" width="6" height="1.5" fill="#111"/>`
    : extra < 0.3 ? `<circle cx="25" cy="${eyeY}" r="4.2" fill="none" stroke="#222" stroke-width="1.4"/><circle cx="39" cy="${eyeY}" r="4.2" fill="none" stroke="#222" stroke-width="1.4"/><path d="M29 ${eyeY} H35" stroke="#222" stroke-width="1.4"/>` : '';
  const cap = extra > 0.9 ? `<path d="M16 22 Q18 9 32 9 Q46 9 48 22 Z" fill="${shirt}"/><path d="M40 21 Q50 21 54 24 L46 24Z" fill="${shirt}"/>` : '';
  const eyes = extra < 0.18 ? '' : `<circle cx="25" cy="${eyeY}" r="1.9" fill="#1A1A1A"/><circle cx="39" cy="${eyeY}" r="1.9" fill="#1A1A1A"/>`;
  const m = [`<path d="M26 40 Q32 45 38 40" stroke="#5A2A1E" stroke-width="1.8" fill="none" stroke-linecap="round"/>`, `<path d="M27 40 Q32 47 37 40 Z" fill="#5A2A1E"/>`, `<path d="M28 41 H36" stroke="#5A2A1E" stroke-width="1.8" stroke-linecap="round"/>`][mouth];
  const svg = `<svg viewBox="0 0 64 64" aria-hidden="true">${back}<path d="M10 64 Q12 50 32 49 Q52 50 54 64Z" fill="${shirt}"/><rect x="27" y="42" width="10" height="9" fill="${skin}"/><ellipse cx="32" cy="31" rx="14" ry="16" fill="${skin}"/><ellipse cx="18" cy="32" rx="2.5" ry="3.5" fill="${skin}"/><ellipse cx="46" cy="32" rx="2.5" ry="3.5" fill="${skin}"/>${top}${cap}${eyes}${acc}${m}<ellipse cx="22" cy="37" rx="2.6" ry="1.6" fill="#E46A6A" opacity=".25"/><ellipse cx="42" cy="37" rx="2.6" ry="1.6" fill="#E46A6A" opacity=".25"/></svg>`;
  faceCache.set(seed, svg);
  return svg;
}
function logoSvg(name, color) {
  const letter = esc(name.replace(/[^A-Za-z]/g, '')[0] || '?');
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="${color}"/><circle cx="48" cy="16" r="9" fill="#fff" opacity=".18"/><text x="32" y="44" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="34" fill="#fff">${letter}</text></svg>`;
}

/* Post illustration: background in the post's look, motif emoji, layout per format, memes get real top/bottom text */
function sceneSvg({ seed, format, niche, look, caption, label, color }) {
  const r = srand(hashStr(String(seed)) % 100000 + 3);
  const L = look && FILTERS[look];
  const g0 = L ? L.g[0] : color, g1 = L ? L.g[1] : '#111';
  const em = (NICHE_EMOJI[niche] || NICHE_EMOJI.lifestyle);
  const main = em[Math.floor(r() * em.length)], side = em[(Math.floor(r() * 3) + 1) % em.length];
  const ang = Math.floor(r() * 360);
  const sparkles = Array.from({ length: 7 }, () => `<circle cx="${(r() * 400).toFixed(0)}" cy="${(r() * 225).toFixed(0)}" r="${(1 + r() * 3).toFixed(1)}" fill="#fff" opacity="${(0.25 + r() * 0.5).toFixed(2)}"/>`).join('');
  const blob = `<circle cx="${(60 + r() * 280).toFixed(0)}" cy="${(40 + r() * 140).toFixed(0)}" r="${(60 + r() * 50).toFixed(0)}" fill="#fff" opacity=".08"/>`;
  const ink = L && L.ink ? L.ink : '#fff';
  let fg;
  if (format === 'meme') {
    const words = (caption || label || '').replace(/[#@]\S+/g, '').trim().toUpperCase().split(/\s+/).filter(Boolean);
    const mid = Math.ceil(words.length / 2);
    const top = words.slice(0, mid).join(' ').slice(0, 34), bot = words.slice(mid).join(' ').slice(0, 34);
    const t = (s, y) => `<text x="200" y="${y}" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-size="${s.length > 24 ? 20 : 26}" fill="#fff" stroke="#000" stroke-width="4" paint-order="stroke" letter-spacing="1">${esc(s)}</text>`;
    fg = `<text x="200" y="138" text-anchor="middle" font-size="84">${main}</text>${t(top, 40)}${t(bot, 210)}`;
  } else if (format === 'story' || format === 'dance' || format === 'short' || format === 'reel') {
    fg = `<rect x="140" y="12" width="120" height="201" rx="16" fill="#000" opacity=".22"/><text x="200" y="128" text-anchor="middle" font-size="72">${main}</text><text x="232" y="62" font-size="26">${side}</text><rect x="160" y="196" width="80" height="4" rx="2" fill="#fff" opacity=".6"/>`;
  } else if (format === 'reaction') {
    fg = `<rect x="16" y="16" width="230" height="193" rx="12" fill="#000" opacity=".25"/><text x="131" y="128" text-anchor="middle" font-size="70">${main}</text><circle cx="320" cy="150" r="52" fill="#000" opacity=".25"/><text x="320" y="168" text-anchor="middle" font-size="54">😱</text>`;
  } else if (format === 'carousel') {
    fg = `<rect x="70" y="30" width="220" height="165" rx="14" fill="#fff" opacity=".12" transform="rotate(-6 180 112)"/><rect x="110" y="30" width="220" height="165" rx="14" fill="#fff" opacity=".18"/><text x="220" y="135" text-anchor="middle" font-size="72">${main}</text><g fill="#fff">${[0, 1, 2, 3, 4].map((i) => `<circle cx="${180 + i * 10}" cy="212" r="3" opacity="${i ? 0.45 : 1}"/>`).join('')}</g>`;
  } else if (format === 'doc' || format === 'tutorial' || format === 'vlog') {
    fg = `<text x="120" y="140" text-anchor="middle" font-size="90">${main}</text><text x="250" y="96" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="17" fill="${ink}">${esc((label || '').toUpperCase().slice(0, 13))}</text><text x="250" y="120" font-family="Arial, sans-serif" font-size="14" fill="${ink}" opacity=".8">${esc(FORMATS[format].name)}</text><text x="300" y="185" font-size="34">${side}</text>`;
  } else {
    fg = `<rect x="128" y="22" width="144" height="181" rx="6" fill="#fff" opacity=".92" transform="rotate(${(r() * 8 - 4).toFixed(1)} 200 112)"/><rect x="138" y="32" width="124" height="128" rx="3" fill="${g0}" transform="rotate(${(r() * 8 - 4).toFixed(1)} 200 112)"/><text x="200" y="118" text-anchor="middle" font-size="64">${main}</text><text x="296" y="70" font-size="28">${side}</text>`;
  }
  return `<svg class="scene" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="g${seed}" gradientTransform="rotate(${ang} .5 .5)"><stop offset="0" stop-color="${g0}"/><stop offset="1" stop-color="${g1}"/></linearGradient></defs><rect width="400" height="225" fill="url(#g${seed})"/>${blob}${sparkles}${fg}</svg>`;
}

/* CSS filters that mimic each look on uploaded photos */
const LOOK_CSS = { clean: 'brightness(1.08) contrast(1.05)', neon: 'saturate(1.8) hue-rotate(-12deg) contrast(1.1)', vintage: 'sepia(.55) contrast(.95) brightness(1.03)', chaotic: 'saturate(2.2) contrast(1.3)', cinematic: 'contrast(1.2) saturate(.85) brightness(.92)', lofi: 'grayscale(.35) contrast(.9) brightness(1.05)' };

/* Shrinks an uploaded image so saves stay small */
function resizeImage(file, max = 420) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('read'));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode'));
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.62));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}
