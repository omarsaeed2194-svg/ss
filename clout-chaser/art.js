/* Clout Chaser — generated art: face avatars, company logos, post illustrations, photo uploads */
'use strict';

const SKINS = ['#F6D3B8', '#EBBE98', '#D9A177', '#BC8257', '#965F3D', '#6B3F28', '#4A2B1C'];
const HAIRS = ['#1C1714', '#3A2A1F', '#5E3B22', '#8A5A33', '#C8A06A', '#E8DDC8', '#B83280', '#3F51B5', '#D45A2A', '#6C6C6C'];
const SHIRTS = ['#2E3A59', '#8A2B4B', '#1F6F5C', '#C58B2A', '#4B3B8F', '#B7472A', '#2B6CB0', '#333333', '#E2E8F0'];
const hashStr = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); };
const faceCache = new Map();

/* faceSvg and logoSvg live in faces.js */

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
  return `<svg class="scene" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="g${seed}" gradientTransform="rotate(${ang} .5 .5)"><stop offset="0" stop-color="${g0}"/><stop offset="1" stop-color="${g1}"/></linearGradient></defs><rect width="400" height="225" fill="url(#g${seed})"/>${blob}${sparkles}${typeof scenery === 'function' ? scenery(niche, r, !!(FORMATS[format] && FORMATS[format].video)) : ''}<g class="v-fg${FORMATS[format] && FORMATS[format].video ? ' v-anim' : ''}">${fg}</g></svg>`;
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
