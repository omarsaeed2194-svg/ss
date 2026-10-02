/* Clout Chaser — visuals: animated post scenery and "video" posts, Stories with auto-playing clips,
   illustrated event banners, a live-stream stage, reaction bursts, and casino/match animations.
   Everything is drawn in SVG/CSS, so it works offline and in the Android app. */
'use strict';

/* ---------- niche scenery behind every post illustration ---------- */
function scenery(niche, r, video) {
  const a = video ? ' v-anim' : '';
  const x = () => (r() * 400).toFixed(0);
  switch (niche) {
    case 'food': return `<ellipse cx="200" cy="190" rx="150" ry="26" fill="#000" opacity=".18"/><ellipse cx="200" cy="176" rx="118" ry="30" fill="#fff" opacity=".9"/><ellipse cx="200" cy="172" rx="88" ry="20" fill="#FFE8C2"/>
      ${[0, 1, 2].map((i) => `<path class="v-steam${a}" style="animation-delay:${i * 0.6}s" d="M${170 + i * 30} 140 q-10 -18 0 -36 q10 -18 0 -36" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>`).join('')}`;
    case 'travel': return `<circle class="v-pulse${a}" cx="320" cy="60" r="28" fill="#FFD166" opacity=".9"/><path d="M0 225 L90 120 L160 190 L240 100 L330 175 L400 130 L400 225Z" fill="#000" opacity=".22"/><path d="M0 225 L60 170 L130 205 L220 150 L300 200 L400 165 L400 225Z" fill="#000" opacity=".25"/>
      <g class="v-drift${a}"><ellipse cx="80" cy="50" rx="34" ry="11" fill="#fff" opacity=".55"/><ellipse cx="250" cy="34" rx="26" ry="8" fill="#fff" opacity=".4"/></g><text class="v-fly${a}" x="40" y="80" font-size="22">✈️</text>`;
    case 'fitness': return `<rect x="0" y="180" width="400" height="45" fill="#000" opacity=".2"/>${[0, 1, 2, 3, 4].map((i) => `<rect class="v-eq${a}" style="animation-delay:${i * 0.15}s" x="${30 + i * 18}" y="${120 - i * 12}" width="10" height="${60 + i * 12}" rx="3" fill="#fff" opacity=".25"/>`).join('')}`;
    case 'gaming': return `${Array.from({ length: 8 }, (_, i) => `<path d="M${-200 + i * 100} 225 L200 120" stroke="#fff" stroke-opacity=".14"/>`).join('')}${[140, 165, 190, 215].map((y) => `<path d="M0 ${y} H400" stroke="#fff" stroke-opacity=".12"/>`).join('')}<circle class="v-pulse${a}" cx="330" cy="50" r="10" fill="#21D4FD" opacity=".7"/><circle class="v-pulse${a}" style="animation-delay:.5s" cx="60" cy="70" r="6" fill="#FF2E9A" opacity=".7"/>`;
    case 'beauty': return `${Array.from({ length: 6 }, (_, i) => `<text class="v-twinkle${a}" style="animation-delay:${(i * 0.4).toFixed(1)}s" x="${x()}" y="${(20 + r() * 180).toFixed(0)}" font-size="${12 + Math.floor(r() * 12)}">✨</text>`).join('')}<circle cx="70" cy="160" r="46" fill="#fff" opacity=".1"/><circle cx="340" cy="60" r="30" fill="#fff" opacity=".12"/>`;
    case 'fashion': return `<path d="M60 225 L160 110 L240 110 L340 225Z" fill="#fff" opacity=".1"/>${[0, 1].map((i) => `<path class="v-spot${a}" style="animation-delay:${i}s" d="M${100 + i * 200} 0 L${60 + i * 200} 225 L${140 + i * 200} 225Z" fill="#fff" opacity=".1"/>`).join('')}`;
    case 'tech': return `${Array.from({ length: 6 }, () => { const y = (20 + r() * 180).toFixed(0); return `<path d="M0 ${y} H${(40 + r() * 80).toFixed(0)} l12 -12 H${(180 + r() * 120).toFixed(0)}" stroke="#fff" stroke-opacity=".16" fill="none"/>`; }).join('')}<circle class="v-pulse${a}" cx="40" cy="40" r="5" fill="#B6FF3B" opacity=".8"/>`;
    case 'music': return `<g class="v-spin${a}" style="transform-origin:330px 170px"><circle cx="330" cy="170" r="58" fill="#111" opacity=".75"/><circle cx="330" cy="170" r="40" fill="none" stroke="#fff" stroke-opacity=".15"/><circle cx="330" cy="170" r="14" fill="#F91880"/></g>${['🎵', '🎶', '🎵'].map((n, i) => `<text class="v-rise${a}" style="animation-delay:${i * 0.7}s" x="${40 + i * 40}" y="200" font-size="22">${n}</text>`).join('')}`;
    case 'comedy': return `<path class="v-spot${a}" d="M200 0 L120 225 L280 225Z" fill="#fff" opacity=".14"/><path d="M0 200 Q100 170 200 200 T400 200 V225 H0Z" fill="#7a0f1c" opacity=".6"/>`;
    default: return `<rect x="30" y="150" width="70" height="75" fill="#000" opacity=".15"/><rect x="300" y="120" width="70" height="105" fill="#000" opacity=".15"/><g class="v-drift${a}"><circle cx="90" cy="50" r="18" fill="#fff" opacity=".18"/></g><text class="v-bob${a}" x="320" y="105" font-size="26">🪴</text>`;
  }
}

/* ---------- autoplay: only animate media on screen ---------- */
let mediaObs = null;
function observeMedia() {
  if (!('IntersectionObserver' in window)) { document.querySelectorAll('.tw-media').forEach((m) => m.classList.add('inview')); return; }
  mediaObs = mediaObs || new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('inview', e.isIntersecting)), { threshold: 0.4 });
  document.querySelectorAll('.tw-media:not([data-obs])').forEach((m) => { m.dataset.obs = '1'; mediaObs.observe(m); });
}
new MutationObserver(() => { if (document.querySelector('.tw-media:not([data-obs])')) requestAnimationFrame(observeMedia); }).observe(document.body, { childList: true, subtree: true });

/* ---------- Stories: tap a star to watch their clips ---------- */
function storyStars() {
  const ids = Object.keys(S.npcs);
  const followed = ids.filter((id) => S.npcs[id].following);
  const rest = ids.filter((id) => !S.npcs[id].following).sort((a, b) => S.npcs[b].rel - S.npcs[a].rel || NPCS[b].followers - NPCS[a].followers);
  return [...followed, ...rest].slice(0, 14);
}
function storiesBar() {
  const seen = S.flags.storySeen || {};
  const me = S.posts[0];
  return `<div class="stories scroller">
    <button class="story-chip" data-act="${me ? 'storyOpen' : 'compose'}" data-arg="me"><span class="sring ${me && me.day === S.day ? '' : 'seen'}">${meAv('lg')}</span><span>${me ? 'Your story' : 'Add story'}</span></button>
    ${storyStars().map((id) => `<button class="story-chip" data-act="storyOpen" data-arg="${id}"><span class="sring ${seen[id] === S.day ? 'seen' : ''}">${npcAv(id, 'lg')}</span><span>${esc(NPCS[id].name.split(' ')[0])}</span></button>`).join('')}</div>`;
}
const STORY_TEXT = ['day {d} of pretending I have it together', 'POV: you said "one episode"', 'new era loading…', 'not me crying at this', 'guess where I am 👀', 'the outfit chose me', 'behind the scenes, unfiltered', 'say less', 'tag someone who needs this', 'rate this 1–10'];
const STORY_FMT = ['dance', 'story', 'reel', 'short', 'vlog'];
let storyTimer = null;
function storySlides(id) {
  if (id === 'me') return S.posts.slice(0, 3).map((p, i) => ({ seed: p.id * 13 + i, niche: S.niche, text: p.caption, format: STORY_FMT[i % STORY_FMT.length], look: p.filter, img: p.img }));
  const N = NPCS[id], posts = S.feed.filter((f) => f.npc === id).slice(0, 2);
  const r = srand(hashStr(id + S.day));
  return [0, 1, 2].map((i) => ({ seed: hashStr(id) + S.day * 7 + i, niche: N.niche || 'lifestyle', text: posts[i] ? posts[i].text : STORY_TEXT[Math.floor(r() * STORY_TEXT.length)].replace('{d}', S.day), format: STORY_FMT[(i + Math.floor(r() * 5)) % STORY_FMT.length], look: pick(Object.keys(FILTERS)) }));
}
function openStory(id, slide = 0) {
  if (slide === 0 && id !== 'me') if (typeof questEvent === 'function') questEvent('story');
  closeStory(false);
  const slides = storySlides(id); if (!slides.length) return;
  const queue = id === 'me' ? ['me'] : storyStars();
  const s = slides[slide];
  S.flags.storySeen = S.flags.storySeen || {}; if (id !== 'me') S.flags.storySeen[id] = S.day;
  const who = id === 'me' ? { av: meAv('sm'), name: S.name } : { av: npcAv(id, 'sm'), name: NPCS[id].name };
  const el = document.createElement('div'); el.className = 'story-view'; el.id = 'storyView';
  const art = s.img ? `<img class="scene" src="${s.img}" alt="">` : sceneSvg({ seed: s.seed, format: s.format, niche: s.niche, look: s.look, caption: s.text, label: '', color: '#333' });
  el.innerHTML = `<div class="story-card"><div class="story-bars">${slides.map((_, i) => `<i class="${i < slide ? 'done' : i === slide ? 'run' : ''}"><b></b></i>`).join('')}</div>
    <div class="story-head">${who.av}<b>${esc(who.name)}</b><span class="small" style="opacity:.75">${slide === 0 ? 'now' : slide + 'h'}</span><button class="icon-btn" data-story="close" aria-label="Close" style="margin-left:auto;color:#fff">${ico('x')}</button></div>
    <div class="story-media tw-media inview">${art}</div>
    <div class="story-cap">${esc(String(s.text).slice(0, 120))}</div>
    ${id !== 'me' ? `<div class="story-react">${['❤️', '🔥', '😂', '😮', '👏'].map((e) => `<button data-story="react" data-e="${e}">${e}</button>`).join('')}</div>` : ''}
    <button class="story-nav prev" data-story="prev" aria-label="Previous"></button><button class="story-nav next" data-story="next" aria-label="Next"></button></div>`;
  document.body.appendChild(el);
  const next = () => {
    if (slide + 1 < slides.length) return openStory(id, slide + 1);
    const qi = queue.indexOf(id);
    if (qi >= 0 && qi + 1 < queue.length) return openStory(queue[qi + 1], 0);
    closeStory();
  };
  storyTimer = setTimeout(next, 4200);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-story]'); if (!b) { if (e.target === el) closeStory(); return; }
    const k = b.dataset.story;
    if (k === 'close') closeStory();
    else if (k === 'next') { clearTimeout(storyTimer); next(); }
    else if (k === 'prev') { clearTimeout(storyTimer); openStory(id, Math.max(0, slide - 1)); }
    else if (k === 'react') {
      burst(e.clientX, e.clientY, b.dataset.e, 9);
      if (id !== 'me' && !(S.flags.storyReact || {})[id + S.day]) { S.flags.storyReact = S.flags.storyReact || {}; S.flags.storyReact[id + S.day] = 1; changeRel(id, 2); if (chance(0.25)) { gainEnergy(3, `${NPCS[id].name.split(' ')[0]} liked your reaction`); } save(); }
    }
  });
}
function closeStory(rerender = true) {
  clearTimeout(storyTimer);
  const el = document.getElementById('storyView'); if (el) el.remove();
  if (rerender && S) renderAll();
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.getElementById('storyView')) closeStory(); });

/* ---------- reaction bursts ---------- */
function burst(x, y, emoji, n = 8) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div'); box.className = 'burst'; box.setAttribute('aria-hidden', 'true');
  box.style.left = x + 'px'; box.style.top = y + 'px';
  const list = Array.isArray(emoji) ? emoji : [emoji];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.textContent = list[i % list.length];
    const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5, d = 40 + Math.random() * 60;
    s.style.setProperty('--x', `${Math.cos(ang) * d}px`); s.style.setProperty('--y', `${Math.sin(ang) * d - 40}px`);
    s.style.animationDelay = `${Math.random() * 0.08}s`;
    box.appendChild(s);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 1100);
}
document.addEventListener('click', (e) => {
  const t = e.target.closest && e.target.closest('[data-act]'); if (!t || t.disabled) return;
  const a = t.dataset.act;
  if (a === 'like' || a === 'myLike') burst(e.clientX, e.clientY, ['❤️', '💖', '💗'], 8);
  else if (a === 'repost') burst(e.clientX, e.clientY, ['🔁', '✨'], 6);
  else if (a === 'cPost') burst(e.clientX, e.clientY, [...(NICHE_EMOJI[S.niche] || ['✨']), '✨', '🔥'], 14);
  else if (a === 'spin' || a === 'slots' || a === 'roulette') burst(e.clientX, e.clientY, ['🪙', '✨'], 6);
  else if (a === 'passClaim' || a === 'buy' || a === 'teamUp') burst(e.clientX, e.clientY, ['🎉', '✨', '💫'], 10);
}, true);

/* ---------- illustrated, animated banners for event pop-ups ---------- */
const EV_THEMES = [
  ['stream', /live|stream|chat|raid|subathon|gift battle|hype train/i],
  ['sports', /match|goal|cup|bet|league|halftime/i],
  ['money', /paid|\$|deal|money|cash|gig|offer|dividend|investor|budget|sponsor|whale|tip/i],
  ['scandal', /leak|cancel|expos|scandal|drama|beef|clash|feud|hater|lawsuit|subpoena|hoax|backlash|burner|unmask|fake/i],
  ['danger', /stunt|hospital|crash|arrest|injur|security|police|tackl|ambulance|hurt/i],
  ['love', /date|dating|partner|showmance|love|villa|breakup|couple|crush/i],
  ['award', /award|gala|trophy|ceremony|premiere|red carpet|tier|milestone/i],
  ['viral', /viral|trend|record|blowing up|famous|million|fyp/i],
];
function evTheme(text) { for (const [k, re] of EV_THEMES) if (re.test(text)) return k; return 'default'; }
function eventArt(title, eyebrow) {
  const k = evTheme(`${eyebrow} ${title}`);
  const r = srand(hashStr(title));
  const pos = (n, f) => Array.from({ length: n }, (_, i) => f(i, (r() * 400).toFixed(0), (r() * 140).toFixed(0))).join('');
  const bg = { stream: ['#2a0845', '#6441A5'], sports: ['#0B3D1E', '#1F7A3A'], money: ['#3a2a00', '#B8860B'], scandal: ['#3b0000', '#1a0033'], danger: ['#2b2b00', '#7a4a00'], love: ['#5b0f3a', '#F91880'], award: ['#1b1b3a', '#6A3093'], viral: ['#3a0a00', '#F94144'], default: ['#0f2027', '#2c5364'] }[k];
  let fg = '';
  if (k === 'stream') fg = `${[80, 320].map((x, i) => `<path class="ev-sweep" style="animation-delay:${i * 0.8}s;transform-origin:${x}px 0" d="M${x} 0 L${x - 60} 140 L${x + 60} 140Z" fill="#fff" opacity=".12"/>`).join('')}
    <foreignObject x="165" y="28" width="70" height="70"><div xmlns="http://www.w3.org/1999/xhtml" class="ev-face">${faceSvg(S.faceSeed || S.name)}</div></foreignObject>
    <rect x="18" y="14" width="44" height="18" rx="4" fill="#F4212E"/><text x="40" y="27" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" font-family="Arial">LIVE</text>
    ${pos(7, (i, x) => `<text class="ev-float" style="animation-delay:${(i * 0.35).toFixed(2)}s" x="${300 + (i % 3) * 25}" y="135" font-size="18">${['❤️', '🔥', '😂', '💖', '🚀', '👑', '🌹'][i]}</text>`)}
    <g class="ev-chat">${['lets gooo 🔥', 'W stream', 'HI MOM', '🐐🐐🐐'].map((t, i) => `<text x="18" y="${70 + i * 18}" font-size="11" fill="#fff" opacity=".8" font-family="Arial">${t}</text>`).join('')}</g>`;
  else if (k === 'sports') fg = `<rect x="20" y="15" width="360" height="110" rx="6" fill="none" stroke="#fff" stroke-opacity=".5"/><path d="M200 15 V125" stroke="#fff" stroke-opacity=".5"/><circle cx="200" cy="70" r="20" fill="none" stroke="#fff" stroke-opacity=".5"/><rect x="20" y="45" width="30" height="50" fill="none" stroke="#fff" stroke-opacity=".5"/><rect x="350" y="45" width="30" height="50" fill="none" stroke="#fff" stroke-opacity=".5"/><text class="ev-ball" x="190" y="78" font-size="20">⚽</text>`;
  else if (k === 'money') fg = pos(14, (i, x) => `<text class="ev-fall" style="animation-delay:${(i * 0.18).toFixed(2)}s" x="${x}" y="-10" font-size="${16 + (i % 3) * 6}">${['🪙', '💵', '💰', '💎'][i % 4]}</text>`) + '<text x="200" y="95" text-anchor="middle" font-size="54">🤑</text>';
  else if (k === 'scandal') fg = `<rect class="ev-siren" width="200" height="140" fill="#F4212E" opacity=".35"/><rect class="ev-siren b" x="200" width="200" height="140" fill="#1D9BF0" opacity=".35"/><text x="200" y="92" text-anchor="middle" font-size="58">🚨</text>${pos(5, (i, x, y) => `<text class="ev-shake" style="animation-delay:${i * 0.1}s" x="${x}" y="${20 + +y * 0.8}" font-size="16">📸</text>`)}`;
  else if (k === 'danger') fg = `${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 40 - 40} 140 L${i * 40} 100 L${i * 40 + 20} 100 L${i * 40 - 20} 140Z" fill="#FFD400" opacity=".7"/>`).join('')}<text class="ev-shake" x="200" y="80" text-anchor="middle" font-size="56">⚠️</text>`;
  else if (k === 'love') fg = pos(12, (i, x) => `<text class="ev-float" style="animation-delay:${(i * 0.25).toFixed(2)}s" x="${x}" y="150" font-size="${14 + (i % 4) * 6}">${['❤️', '💕', '💘', '💖'][i % 4]}</text>`) + '<text x="200" y="90" text-anchor="middle" font-size="52">💞</text>';
  else if (k === 'award') fg = `${[60, 200, 340].map((x, i) => `<path class="ev-sweep" style="animation-delay:${i * 0.5}s;transform-origin:${x}px 0" d="M${x} 0 L${x - 50} 140 L${x + 50} 140Z" fill="#FFD400" opacity=".12"/>`).join('')}<text class="ev-pop" x="200" y="98" text-anchor="middle" font-size="60">🏆</text>${pos(8, (i, x, y) => `<text class="ev-twinkle" style="animation-delay:${(i * 0.3).toFixed(1)}s" x="${x}" y="${y}" font-size="14">✨</text>`)}`;
  else if (k === 'viral') fg = `<text class="ev-pop" x="200" y="98" text-anchor="middle" font-size="60">🔥</text>${pos(9, (i, x) => `<text class="ev-float" style="animation-delay:${(i * 0.22).toFixed(2)}s" x="${x}" y="150" font-size="18">${['🚀', '📈', '🔥'][i % 3]}</text>`)}`;
  else fg = `<text class="ev-pop" x="200" y="96" text-anchor="middle" font-size="56">${pick(NICHE_EMOJI[S.niche] || ['✨'])}</text>${pos(8, (i, x, y) => `<text class="ev-twinkle" style="animation-delay:${(i * 0.3).toFixed(1)}s" x="${x}" y="${y}" font-size="14">✨</text>`)}`;
  return `<div class="ev-art ev-${k}"><svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="evg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs><rect width="400" height="140" fill="url(#evg)"/>${fg}</svg></div>`;
}

/* ---------- casino and match animations ---------- */
function rouletteSvg(n, spin) {
  const order = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  const seg = 360 / order.length;
  const idx = Math.max(0, order.indexOf(n));
  const rot = -(idx * seg) - seg / 2 + (spin ? -1440 : 0);
  const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  const paths = order.map((v, i) => {
    const a0 = (i * seg - 90) * Math.PI / 180, a1 = ((i + 1) * seg - 90) * Math.PI / 180;
    const p = (a, rr) => `${(60 + rr * Math.cos(a)).toFixed(2)} ${(60 + rr * Math.sin(a)).toFixed(2)}`;
    return `<path d="M60 60 L${p(a0, 58)} A58 58 0 0 1 ${p(a1, 58)}Z" fill="${v === 0 ? '#00A86B' : RED.has(v) ? '#D7263D' : '#1b1b1b'}" stroke="#d4af37" stroke-width=".4"/>`;
  }).join('');
  return `<div class="rwheel"><svg viewBox="0 0 120 120" aria-hidden="true"><g class="${spin ? 'rw-spin' : ''}" style="transform-origin:60px 60px;transform:rotate(${rot}deg)">${paths}<circle cx="60" cy="60" r="22" fill="#5a3b12" stroke="#d4af37"/></g><path d="M60 0 L55 9 L65 9Z" fill="#fff"/><circle cx="60" cy="60" r="6" fill="#d4af37"/></svg></div>`;
}
function pitchSvg(f) {
  const bx = 30 + ((f.min * 37) % 340), by = 20 + ((f.min * 53) % 80);
  const goal = f.feed && f.feed[0] && /GOAL/.test(f.feed[0]) && f.feed[0].startsWith(f.min + "'");
  return `<svg class="pitch ${goal ? 'goal' : ''}" viewBox="0 0 400 120" aria-hidden="true"><rect width="400" height="120" rx="8" fill="#1F7A3A"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${i * 50}" width="25" height="120" fill="#fff" opacity=".04"/>`).join('')}
    <rect x="10" y="8" width="380" height="104" rx="4" fill="none" stroke="#fff" stroke-opacity=".6"/><path d="M200 8 V112" stroke="#fff" stroke-opacity=".6"/><circle cx="200" cy="60" r="18" fill="none" stroke="#fff" stroke-opacity=".6"/>
    <rect x="10" y="35" width="28" height="50" fill="none" stroke="#fff" stroke-opacity=".6"/><rect x="362" y="35" width="28" height="50" fill="none" stroke="#fff" stroke-opacity=".6"/>
    <circle cx="${bx}" cy="${by}" r="5" fill="#fff" stroke="#000" stroke-width="1"/>${goal ? '<text x="200" y="72" text-anchor="middle" font-size="34" font-weight="900" fill="#FFD400" font-family="Arial Black, Arial" stroke="#000" stroke-width="2" paint-order="stroke">GOAL!</text>' : ''}</svg>`;
}
