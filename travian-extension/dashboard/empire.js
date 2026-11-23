// Empire page: the whole account on one page — what the villages make,
// the army and its targets, what the farms bring, supply and the hero —
// and what the coordinator ran this round and held back, with the reason.
import { esc } from '../src/ui.js';
import { RESOURCES, fmtNum, fmtAgo, buildingName, goalText, resLabel } from '../src/shared.js';
import { brainPlan } from '../src/brain.js';
import { armyNow, targetsOf, purses } from '../src/budget.js';
import { listLoot, farmSuggestions, lootText } from '../src/farmtune.js';
import { playersInfo } from '../src/players.js';
import { tribeBase } from '../src/units.js';
import { t } from '../src/i18n.js';

const $ = (id) => document.getElementById(id);
const KINDS = ['inf', 'cav', 'siege'];

const card = (title, body, sub = '') => `<div class="emp-card"><div class="muted small">${esc(title)}</div><div class="emp-big">${body}</div>${sub ? `<div class="muted small">${sub}</div>` : ''}</div>`;

export function renderEmpire(data, now) {
  const s = data.settings;
  const villages = Object.values(data.villages || {});
  const base = tribeBase(data.villages);
  const plan = brainPlan(data, s, now, base);

  // What the villages make and hold.
  const prod = Object.fromEntries(RESOURCES.map((k) => [k, villages.reduce((n, v) => n + (((v.resources || {}).production || {})[k] || 0), 0)]));
  const prodTotal = RESOURCES.reduce((n, k) => n + Math.max(0, prod[k]), 0);
  // The army and its targets.
  const army = { inf: 0, cav: 0, siege: 0 };
  const want = { inf: 0, cav: 0, siege: 0 };
  const have = { inf: 0, cav: 0, siege: 0 };
  for (const v of villages) {
    const a = armyNow(v, base, now);
    for (const k of KINDS) army[k] += a[k];
    const tg = targetsOf(v, s, base, now);
    for (const k of Object.keys(tg)) { want[k] += tg[k].want; have[k] += Math.min(tg[k].have, tg[k].want); }
  }
  // Farms.
  const loot = (data.farms || []).reduce((n, l) => n + listLoot(l, base, now).perHour, 0);
  const lists = (data.farms || []).length;
  const sugg = s.farmTune.enabled ? farmSuggestions(data, { radius: s.farmTune.radius, now }).length : 0;
  const pi = playersInfo(data.players, now);
  // Supply and the hero.
  const suppliers = plan.filter((p) => p.supplies).length;
  const pending = villages.filter((v) => v.transferPending && v.transferPending.until > now).length;
  const hero = (data.account || {}).hero || {};
  const heroText = hero.dead ? t('emp.hero.dead') : hero.home ? t('emp.hero.home') : t('emp.hero.away');

  $('empCards').innerHTML = [
    card(t('emp.prod'), `${fmtNum(prodTotal)}<small>/${esc(t('emp.hour'))}</small>`, RESOURCES.map((k) => `${esc(resLabel(k))} ${fmtNum(prod[k])}`).join(' · ')),
    card(t('emp.army'), KINDS.map((k) => `${fmtNum(army[k])} <small>${esc(t(`brain.kind.${k}`))}</small>`).join(' · '),
      Object.values(want).some(Boolean) ? esc(t('emp.targets', { list: KINDS.filter((k) => want[k]).map((k) => `${t(`brain.kind.${k}`)} ${fmtNum(have[k])}/${fmtNum(want[k])}`).join(' · ') })) : esc(t('emp.noTargets'))),
    card(t('emp.farms'), `${lootText(loot)}<small>/${esc(t('emp.hour'))}</small>`, esc(t('emp.farmsSub', { lists, sugg }))),
    card(t('emp.supply'), `${suppliers}`, esc(t('emp.supplySub', { pending }))),
    card(t('emp.hero'), esc(heroText), esc(hero.levelUp ? t('emp.hero.points', { how: t(`hero.points.${s.hero.points}`) }) : t('emp.hero.adventures', { n: hero.adventures ?? 0 }))),
    card(t('emp.players'), `${pi.still}`, esc(t('emp.playersSub', { known: pi.known, judged: pi.judged }))),
  ].join('');

  // This round, as the coordinator decided.
  const e = data.empire;
  $('empRound').innerHTML = !e ? `<li class="muted">${esc(t('emp.noRound'))}</li>`
    : [...(e.run || []).map((j) => `<li>✓ ${esc(j.label || j.type)}</li>`),
      ...(e.held || []).map((j) => `<li class="muted">⏸ ${esc(j.label || j.type)} — ${esc(t(`emp.why.${j.why}`))}</li>`)].join('') || `<li class="muted">${esc(t('emp.idle'))}</li>`;
  $('empRoundAt').textContent = e ? fmtAgo(e.at, now) : '';

  // Village by village.
  const head = ['th.village', 'brain.th.role', 'emp.th.build', 'emp.th.troops', 'emp.th.split', 'emp.th.state'].map((k) => `<th>${esc(t(k))}</th>`).join('');
  $('empTable').innerHTML = `<tr>${head}</tr>` + plan.map((p) => {
    const v = p.v;
    const b = p.build && p.build.step;
    const build = b ? `${buildingName(b.gid)} → ${b.level + 1}${b.forGid ? ` <small class="muted">(${esc(t('brain.needFor', { b: buildingName(b.forGid), n: b.forLevel }))})</small>` : ` <small class="muted">${esc(goalText(p.build.goal))}</small>`}` : '—';
    const tr = p.train;
    const troops = tr.skip ? `<span class="muted">${esc(t(`brain.skip.${tr.skip}`, { pct: tr.fill != null ? Math.round(tr.fill * 100) : null }))}</span>`
      : esc((tr.builds || []).map((x) => buildingName(x.gid)).join(' + '));
    const pu = purses(v, now);
    const split = `${100 - (v.lanes ? v.lanes.pct : 0)}% / ${v.lanes ? v.lanes.pct : 0}%${pu ? ` <small class="muted">(${fmtNum(RESOURCES.reduce((n, k) => n + pu.build[k], 0))} · ${fmtNum(RESOURCES.reduce((n, k) => n + pu.army[k], 0))})</small>` : ''}`;
    const state = [v.underAttack ? `⚔ ${t('emp.attacked')}` : '', p.supplies ? `🚚 ${t('emp.supplier')}` : '', v.transferPending && v.transferPending.until > now ? `📦 ${t('emp.incoming')}` : ''].filter(Boolean).join(' · ') || '—';
    return `<tr><td>${esc(v.name)}</td><td>${esc(t(`brain.role.${p.role}`))}</td><td class="small">${build}</td><td class="small">${troops}</td><td class="small mono">${split}</td><td class="small">${esc(state)}</td></tr>`;
  }).join('');
}
