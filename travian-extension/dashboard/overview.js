// The Overview dashboard: a village filter, headline numbers, tips worked
// out from the village's state, resources, a 24-hour chart, field levels,
// and side panels for what's coming up, construction, movements and activity.
import { command, esc } from '../src/ui.js';
import {
  RESOURCES, FIELD_RESOURCE, resLabel, sortedVillages, estimateStock, hoursUntilLimit, capacityFor, buildStatus,
  buildingName, taskLabel, fmtDuration, fmtAgo, fmtNum, fmtClock,
} from '../src/shared.js';
import { t, coords, ltr } from '../src/i18n.js';
import { leaseIsFresh } from '../src/sync.js';
import { adviseAll } from '../src/advisor.js';
import { renderStockChart } from './chart.js';

const $ = (id) => document.getElementById(id);
const ALL = 'all';
const TIP_LIMIT = 8;
const KEY_BUILDINGS = [15, 10, 11, 23, 16, 17, 19, 20, 25, 26];
const WALLS = [31, 32, 33, 42, 43];
const ICONS = { attack: '⚔', shield: '🛡', crop: '🌾', storage: '📦', build: '🏗', balance: '⚖', bonus: '⭐', clock: '🕒', alert: '🔔', hero: '🧭', farm: '🐎' };
const MOVE_KEYS = { att1: 'move.att1', att2: 'move.att2', att3: 'move.att3', def1: 'move.def1', def2: 'move.def2', def3: 'move.def3', adventure: 'move.adventure', hero_on_adventure: 'move.adventure' };
const moveLabel = (kind) => t(MOVE_KEYS[kind] || (/settler/i.test(kind) ? 'move.settlers' : 'move.other'));

let filter = (() => { try { return localStorage.getItem('tvh.ovFilter') || ALL; } catch (e) { return ALL; } })();
let showAllTips = false;
let chartKey = '';
let lastTips = [];
let forceTips = false;

function setFilter(value) {
  filter = value;
  try { localStorage.setItem('tvh.ovFilter', value); } catch (e) { /* private mode */ }
}

// ---------------------------------------------------------------- filter ---
function renderFilter(villages, data) {
  const bar = $('ovFilterBar');
  bar.hidden = villages.length < 2;
  const options = [[ALL, t('ov.allVillages'), false], ...villages.map((v) => [v.id, v.name, v.underAttack])];
  const sig = JSON.stringify([options, filter]);
  if ($('ovFilter').dataset.sig !== sig) {
    $('ovFilter').innerHTML = options.map(([id, name, attacked]) => `<button type="button" class="chip-btn${id === filter ? ' on' : ''}" data-filter="${esc(id)}" aria-pressed="${id === filter}">${attacked ? '<span class="dot-bad" aria-hidden="true"></span>' : ''}${esc(name)}</button>`).join('');
    $('ovFilter').dataset.sig = sig;
  }
  const hero = data.account.hero || {};
  const lease = data.lease;
  const other = leaseIsFresh(lease) && data.device && lease.deviceId !== data.device.id;
  const auto = !data.settings.botEnabled && !data.settings.watchEnabled ? t('ov.autoOff')
    : other ? t('ov.autoOther', { name: lease.deviceName }) : data.settings.botEnabled ? t('ov.autoHere') : t('ov.watchHere');
  $('ovAccount').innerHTML = [
    [t('ov.gold'), fmtNum(data.account.gold)],
    [t('ov.silver'), fmtNum(data.account.silver)],
    [t('ov.adventuresShort'), hero.adventures ?? '—'],
    [t('ov.automation'), auto],
  ].map(([k, v]) => `<span><small>${esc(k)}</small> <b>${esc(v)}</b></span>`).join('');
}

// ------------------------------------------------------------------ KPIs ---
function renderKpis(scope, data, now) {
  let stock = 0, prod = 0, crop = 0, attacks = 0, busy = 0, idle = 0, hasRes = false;
  let first = null;
  for (const v of scope) {
    const est = estimateStock(v, now);
    const p = v.resources && v.resources.production;
    if (est) { hasRes = true; stock += RESOURCES.reduce((n, k) => n + est[k], 0); }
    if (p) {
      prod += (p.wood || 0) + (p.clay || 0) + (p.iron || 0) + Math.max(0, p.crop || 0);
      crop += p.crop || 0;
      for (const k of RESOURCES) {
        if (!(p[k] > 0)) continue;
        const h = hoursUntilLimit(v, k, now);
        if (h != null && (!first || h < first.h)) first = { h, k, v };
      }
    }
    if (v.underAttack) attacks += Math.max(1, v.incomingAttacks || 0);
    const active = (v.buildQueue || []).filter((b) => !b.finishAt || b.finishAt > now).length;
    busy += active;
    if (v.buildQueue && !active) idle += 1;
  }
  const tiles = [
    { label: t('ov.stockTotal'), value: hasRes ? fmtNum(stock) : '—' },
    { label: t('ov.prodHour'), value: hasRes ? ltr(`+${fmtNum(prod)}`) : '—' },
    { label: t('ov.netCrop'), value: hasRes ? ltr(`${crop >= 0 ? '+' : ''}${fmtNum(crop)}`) : '—', sev: crop < 0 ? 'critical' : '' },
    {
      label: t('ov.fillsFirst'),
      value: first ? (first.h <= 0 ? t('card.full') : fmtDuration(first.h * 3600000)) : '—',
      text: !!first && first.h <= 0,
      sub: first ? (scope.length > 1 ? `${resLabel(first.k)} · ${first.v.name}` : resLabel(first.k)) : '',
      sev: first && first.h <= 0.5 ? 'critical' : first && first.h <= 2 ? 'warning' : '',
    },
    { label: t('ov.incoming'), value: String(attacks), sev: attacks ? 'critical' : '', icon: attacks ? '⚔' : '' },
    { label: t('ov.builders'), value: idle ? t('ov.buildersIdle', { n: idle }) : busy ? t('ov.buildersBusy', { n: busy }) : '—', sev: idle ? 'warning' : '', text: true },
  ];
  $('summary').innerHTML = tiles.map((x) => `<div class="kpi ${x.sev || ''}">
      <span class="kpi-label">${x.icon ? `<span aria-hidden="true">${x.icon}</span> ` : ''}${esc(x.label)}</span>
      <b class="kpi-value${x.text ? ' text' : ''}">${esc(x.value)}</b>
      ${x.sub ? `<span class="kpi-sub">${esc(x.sub)}</span>` : ''}
    </div>`).join('');
}

// ------------------------------------------------------------------ tips ---
const SEV_LABEL = { critical: 'sev.critical', warning: 'sev.warning', info: 'sev.info', good: 'sev.good' };

function renderTips(scope, data, now) {
  if (!forceTips && $('ovTips').matches(':hover')) return; // don't move buttons under the pointer
  forceTips = false;
  const tips = adviseAll(data, scope.map((v) => v.id), now);
  lastTips = tips;
  const multi = scope.length > 1;
  const counts = tips.reduce((c, x) => ({ ...c, [x.sev]: (c[x.sev] || 0) + 1 }), {});
  $('ovTipsMeta').textContent = ['critical', 'warning', 'info'].filter((k) => counts[k]).map((k) => `${counts[k]} ${t(SEV_LABEL[k])}`).join(' · ');
  if (!tips.length) {
    $('ovTips').innerHTML = `<li class="tip good"><span class="sev-badge good"><span aria-hidden="true">✓</span> ${esc(t('sev.good'))}</span><span class="tip-text">${esc(t('tip.allGood'))}</span></li>`;
    $('ovTipsMore').hidden = true;
    return;
  }
  const shown = showAllTips ? tips : tips.slice(0, TIP_LIMIT);
  $('ovTips').innerHTML = shown.map((tip, i) => {
    const village = multi && tip.villageId ? `<b>${esc(data.villages[tip.villageId].name)}:</b> ` : '';
    return `<li class="tip ${tip.sev}">
      <span class="sev-badge ${tip.sev}"><span aria-hidden="true">${ICONS[tip.icon] || '•'}</span> ${esc(t(SEV_LABEL[tip.sev]))}</span>
      <span class="tip-text">${village}${esc(tip.text)}</span>
      ${tip.action ? `<button type="button" class="btn small" data-tip="${i}">${esc(tip.action.label)}</button>` : ''}
    </li>`;
  }).join('');
  $('ovTipsMore').hidden = tips.length <= TIP_LIMIT;
  $('ovTipsMore').textContent = showAllTips ? t('ov.tipsLess') : t('ov.tipsMore', { n: tips.length - TIP_LIMIT });
}

async function runTipAction(tip) {
  const a = tip.action;
  if (a.type === 'addTask') await command('addTask', { villageId: a.villageId, task: a.task });
  else if (a.type === 'addFields') await command('addTask', { villageId: a.villageId, task: { kind: 'fields', resource: a.resource, targetLevel: a.targetLevel } });
  else if (a.type === 'setting') await command('saveSettings', { settings: a.patch });
  else if (a.type === 'tab') {
    if (a.villageId) window.dispatchEvent(new CustomEvent('tvh:select-village', { detail: a.villageId }));
    location.hash = `#${a.tab}`;
    return;
  }
  forceTips = true;
  toast(t('ov.done'));
}

function toast(text) {
  const el = $('ovToast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { el.hidden = true; }, 2500);
}

// ------------------------------------------------------------- resources ---
function renderResources(scope, data, now) {
  if (scope.length !== 1) {
    $('ovResTitle').textContent = t('ov.villagesTitle');
    renderTable(scope, data, now);
    return;
  }
  const v = scope[0];
  $('ovResTitle').textContent = t('ov.resourcesTitle');
  const est = estimateStock(v, now);
  if (!est) { $('ovRes').innerHTML = `<p class="muted">${esc(t('card.noData'))}</p>`; return; }
  const prod = v.resources.production || {};
  $('ovRes').innerHTML = `<div class="meters">${RESOURCES.map((k) => {
    const cap = capacityFor(v.resources, k) || 1;
    const pct = Math.min(100, (est[k] / cap) * 100);
    const sev = pct >= 95 ? 'critical' : pct >= 80 ? 'warning' : '';
    const hrs = hoursUntilLimit(v, k, now);
    const p = prod[k];
    const when = p > 0 && hrs != null ? (hrs <= 0 ? t('card.full') : t('card.fullIn', { t: fmtDuration(hrs * 3600000) }))
      : p < 0 && hrs != null ? t('card.emptyIn', { t: fmtDuration(hrs * 3600000) }) : '';
    return `<div class="meter-row ${sev}">
      <span class="meter-name">${esc(resLabel(k))}</span>
      <div class="meter" role="meter" aria-valuemin="0" aria-valuemax="${cap}" aria-valuenow="${Math.round(est[k])}" aria-label="${esc(resLabel(k))}"><i style="inline-size:${pct.toFixed(1)}%"></i></div>
      <span class="meter-val" dir="ltr">${fmtNum(est[k])} <small>/ ${fmtNum(cap)}</small></span>
      <span class="meter-rate" dir="ltr">${p != null ? `${p >= 0 ? '+' : ''}${fmtNum(p)}` : ''}</span>
      <span class="meter-when ${sev || (p < 0 ? 'critical' : '')}">${esc(when)}</span>
    </div>`;
  }).join('')}</div>`;
}

function renderTable(villages, data, now) {
  const head = [t('th.village'), ...RESOURCES.map(resLabel), t('th.netCrop'), t('th.firstFull'), t('th.buildingNow'), t('th.status')];
  const rows = villages.map((v) => {
    const est = estimateStock(v, now);
    const prod = v.resources && v.resources.production;
    const cells = RESOURCES.map((k) => {
      if (!est) return '<td class="muted">—</td>';
      const pct = est[k] / (capacityFor(v.resources, k) || 1);
      const sev = pct >= 0.95 ? 'critical' : pct >= 0.8 ? 'warning' : '';
      return `<td class="num"><span dir="ltr">${fmtNum(est[k])}</span><span class="cell-bar ${sev}"><i style="inline-size:${Math.min(100, pct * 100).toFixed(0)}%"></i></span></td>`;
    });
    const crop = prod ? prod.crop : null;
    let first = null;
    for (const k of RESOURCES) {
      const h = prod && prod[k] > 0 ? hoursUntilLimit(v, k, now) : null;
      if (h != null && (!first || h < first.h)) first = { k, h };
    }
    const active = (v.buildQueue || []).filter((b) => !b.finishAt || b.finishAt > now);
    const why = buildStatus(v, data, now);
    return `<tr class="${v.underAttack ? 'attacked' : ''}" data-village="${esc(v.id)}">
      <td><button type="button" class="link" data-filter="${esc(v.id)}">${v.underAttack ? '⚔ ' : ''}${esc(v.name)}</button><br><small class="muted">${coords(v.x, v.y)}</small></td>
      ${cells.join('')}
      <td class="num ${crop < 0 ? 'neg' : ''}"><span dir="ltr">${crop == null ? '—' : `${crop >= 0 ? '+' : ''}${fmtNum(crop)}`}</span></td>
      <td>${first ? `${esc(resLabel(first.k))} <small class="mono">${first.h <= 0 ? esc(t('card.full')) : fmtDuration(first.h * 3600000)}</small>` : '<span class="muted">—</span>'}</td>
      <td>${active.length ? active.map((b) => `${esc(b.name)} <small class="mono muted">${b.finishAt ? fmtDuration(b.finishAt - now) : ''}</small>`).join('<br>') : `<span class="muted">${esc(v.buildQueue ? t('card.idle') : '—')}</span>`}</td>
      <td>${why ? `<small>${esc(why.text)}</small>` : '<span class="muted">—</span>'}</td>
    </tr>`;
  });
  $('ovRes').innerHTML = `<div class="table-wrap"><table class="list ov-table"><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${rows.join('')}</table></div>`;
}

// ------------------------------------------------------------------ chart ---
function renderChart(scope, data) {
  const single = scope.length === 1;
  $('ovChartPanel').hidden = !single;
  if (!single) { chartKey = ''; return; }
  const points = (data.history || {})[scope[0].id] || [];
  const key = `${scope[0].id}|${points.length}|${points.length ? points[points.length - 1].t : 0}|${$('ovChart').clientWidth}|${data.settings.language}`;
  if (key === chartKey) return;
  chartKey = key;
  renderStockChart($('ovChart'), points);
}

// ----------------------------------------------------------- field levels ---
function renderFields(scope) {
  const single = scope.length === 1;
  $('ovFieldsPanel').hidden = !single;
  if (!single) return;
  const v = scope[0];
  if (!v.fields) { $('ovFields').innerHTML = `<p class="muted">${esc(t('build.notScannedFields'))}</p>`; return; }
  const rows = RESOURCES.map((k) => {
    const fields = v.fields.filter((f) => FIELD_RESOURCE[f.gid] === k).sort((a, b) => b.level - a.level);
    const avg = fields.length ? fields.reduce((n, f) => n + f.level, 0) / fields.length : 0;
    return `<div class="lv-row">
      <span class="lv-name">${esc(resLabel(k))}</span>
      <span class="lv-cells">${fields.map((f) => `<span class="lv lv${Math.min(10, f.level)}${f.underConstruction ? ' busy' : ''}" title="${esc(buildingName(f.gid))} · ${esc(t('card.level', { n: f.level }))}">${f.level}</span>`).join('')}</span>
      <span class="lv-avg">${esc(t('ov.avgLevel', { n: avg.toFixed(1) }))}</span>
    </div>`;
  }).join('');
  const key = (v.buildings || []).filter((b) => b.gid && (KEY_BUILDINGS.includes(b.gid) || WALLS.includes(b.gid)))
    .sort((a, b) => KEY_BUILDINGS.indexOf(a.gid) - KEY_BUILDINGS.indexOf(b.gid));
  const buildings = v.buildings
    ? `<ul class="key-buildings">${key.map((b) => `<li><span>${esc(buildingName(b.gid, b.name))}</span><b class="mono">${b.level}</b></li>`).join('') || `<li class="muted">—</li>`}</ul>`
    : `<p class="muted small">${esc(t('build.notScannedBuildings'))}</p>`;
  $('ovFields').innerHTML = `<div class="fields-grid"><div>${rows}<p class="muted small lv-legend">${esc(t('ov.levelLegend'))}</p></div><div><h3>${esc(t('ov.keyBuildings'))}</h3>${buildings}</div></div>`;
}

// ------------------------------------------------------------- side panels ---
function renderNext(scope, data, now) {
  const s = data.settings;
  const sched = data.schedule;
  const ids = new Set(scope.map((v) => v.id));
  const rows = [];
  const left = (at) => (at && at > now ? fmtDuration(at - now) : t('ov.now'));
  if (s.watchEnabled || s.botEnabled) rows.push([t('ov.nextCheck'), left(sched.refreshAt)]);
  for (const v of scope) {
    const list = data.tasks[v.id] || [];
    if (!list.length) continue;
    const why = buildStatus(v, data, now);
    rows.push([scope.length > 1 ? t('ov.nextBuild', { v: v.name }) : t('ov.nextBuildOne'), `${taskLabel(list[0], v)}${why ? ` — ${why.text}` : ''}`]);
  }
  const rules = data.training.filter((r) => r.enabled !== false && ids.has(r.villageId));
  if (rules.length && s.botEnabled) {
    const r = rules.slice().sort((a, b) => (a.nextAt || 0) - (b.nextAt || 0))[0];
    const v = data.villages[r.villageId];
    const unit = (v.units && v.units[r.gid] && (v.units[r.gid].find((u) => u.field === r.troop) || {}).name) || t('troops.unitN', { n: r.troop.slice(1) });
    rows.push([t('ov.nextTrain'), t('ov.trainIn', { u: `${r.amount} × ${unit}`, v: v.name, t: left(r.nextAt) })]);
  }
  if (s.botEnabled && s.farm.enabled) rows.push([t('ov.nextFarm'), left(sched.farmAt)]);
  if (s.botEnabled && s.adventure.enabled) rows.push([t('ov.nextAdventure'), left(sched.adventureAt)]);
  $('ovNext').innerHTML = rows.length
    ? rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')
    : `<dd class="muted">${esc(t('ov.nothingPlanned'))}</dd>`;
}

function renderQueues(scope, now) {
  const rows = [];
  for (const v of scope) for (const b of v.buildQueue || []) if (!b.finishAt || b.finishAt > now) rows.push({ v, b });
  rows.sort((a, b) => (a.b.finishAt || Infinity) - (b.b.finishAt || Infinity));
  $('ovQueues').innerHTML = rows.length
    ? rows.map(({ v, b }) => `<li><span>${scope.length > 1 ? `<small class="muted">${esc(v.name)}</small><br>` : ''}${esc(b.name)} <small class="muted">${b.level != null ? esc(t('card.level', { n: b.level })) : ''}</small></span>
        <span class="feed-time"><b class="mono">${b.finishAt ? fmtDuration(b.finishAt - now) : '—'}</b><small class="muted">${b.finishAt ? fmtClock(b.finishAt) : ''}</small></span></li>`).join('')
    : `<li class="muted">${esc(t('ov.noQueues'))}</li>`;
}

function renderMoves(scope, now) {
  const rows = [];
  for (const v of scope) for (const m of v.movements || []) if (m.arriveAt && m.arriveAt > now) rows.push({ v, m });
  rows.sort((a, b) => a.m.arriveAt - b.m.arriveAt);
  $('ovMoves').innerHTML = rows.length
    ? rows.map(({ v, m }) => `<li class="${m.kind === 'att1' ? 'bad' : ''}"><span>${m.kind === 'att1' ? '⚔ ' : ''}${esc(moveLabel(m.kind))} <small class="muted">× ${m.count || 1}${scope.length > 1 ? ` · ${esc(v.name)}` : ''}</small></span>
        <span class="feed-time"><b class="mono">${fmtDuration(m.arriveAt - now)}</b><small class="muted">${fmtClock(m.arriveAt)}</small></span></li>`).join('')
    : `<li class="muted">${esc(t('ov.noMoves'))}</li>`;
}

function renderActivity(scope, data, now) {
  const ids = new Set(scope.map((v) => v.id));
  const single = scope.length === 1;
  const names = Object.fromEntries(Object.values(data.villages).map((v) => [v.id, v.name]));
  const entries = data.log.filter((e) => (single ? ids.has(e.villageId) : true)).slice(0, 8);
  $('ovActivity').innerHTML = entries.length
    ? entries.map((e) => `<li class="lvl-${esc(e.level)}">
        <span>${!single && e.villageId && names[e.villageId] ? `<b>${esc(names[e.villageId])}:</b> ` : ''}${esc(e.msg)}</span>
        <span class="feed-time"><small class="muted">${esc(fmtAgo(e.t, now))}</small></span>
      </li>`).join('')
    : `<li class="muted">${esc(t('log.empty'))}</li>`;
}

// ---------------------------------------------------------------- render ---
export function renderOverview(data, now) {
  const villages = sortedVillages(data.villages);
  if (filter !== ALL && !data.villages[filter]) setFilter(ALL);
  const scope = villages.length === 1 ? villages : filter === ALL ? villages : [data.villages[filter]];
  $('ovEmpty').hidden = villages.length > 0;
  $('ovBody').hidden = villages.length === 0;
  renderFilter(villages, data);
  if (!villages.length) return;
  $('ovScopeTitle').textContent = scope.length === 1 ? `${scope[0].name} ${coords(scope[0].x, scope[0].y)}` : t('ov.allVillages');
  $('ovScopeSub').textContent = scope.length === 1 ? t('ov.updated', { ago: fmtAgo(scope[0].updatedAt, now) }) : t('ov.villageCount', { n: scope.length });
  renderKpis(scope, data, now);
  renderTips(scope, data, now);
  renderResources(scope, data, now);
  renderChart(scope, data);
  renderFields(scope);
  renderNext(scope, data, now);
  renderQueues(scope, now);
  renderMoves(scope, now);
  renderActivity(scope, data, now);
}

// Clicks: filter chips, village names in the table, tip actions, "show more".
document.addEventListener('click', (e) => {
  const f = e.target.closest('[data-filter]');
  if (f && f.closest('#tab-overview')) {
    setFilter(f.dataset.filter);
    window.dispatchEvent(new CustomEvent('tvh:rerender'));
    return;
  }
  const b = e.target.closest('[data-tip]');
  if (b) {
    const tip = lastTips[Number(b.dataset.tip)];
    if (tip && tip.action) {
      b.disabled = true;
      runTipAction(tip).catch((err) => toast(err.message)).finally(() => { b.disabled = false; });
    }
    return;
  }
  if (e.target.closest('#ovTipsMore')) {
    showAllTips = !showAllTips;
    window.dispatchEvent(new CustomEvent('tvh:rerender'));
  }
});
window.addEventListener('resize', () => { chartKey = ''; });
