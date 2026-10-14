// The Overview tab: account totals, alerts, what's coming up, a table of all
// villages, construction, troop movements and recent activity.
import { villageCard, esc } from '../src/ui.js';
import {
  RESOURCES, resLabel, sortedVillages, estimateStock, hoursUntilLimit, capacityFor, buildStatus,
  taskLabel, fmtDuration, fmtAgo, fmtNum, fmtClock,
} from '../src/shared.js';
import { t, coords, ltr } from '../src/i18n.js';
import { leaseIsFresh } from '../src/sync.js';

const $ = (id) => document.getElementById(id);
const SOON_HOURS = 3; // storage warnings show this far ahead

const MOVE_KEYS = { att1: 'move.att1', att2: 'move.att2', att3: 'move.att3', def1: 'move.def1', def2: 'move.def2', def3: 'move.def3', adventure: 'move.adventure', hero_on_adventure: 'move.adventure' };
const moveLabel = (kind) => t(MOVE_KEYS[kind] || (/settler/i.test(kind) ? 'move.settlers' : 'move.other'));

function automationText(data, now) {
  const s = data.settings;
  if (!s.botEnabled && !s.watchEnabled) return t('ov.autoOff');
  const lease = data.lease;
  if (leaseIsFresh(lease, now) && data.device && lease.deviceId !== data.device.id) return t('ov.autoOther', { name: lease.deviceName });
  return s.botEnabled ? t('ov.autoHere') : t('ov.watchHere');
}

function renderSummary(villages, data, now) {
  const hero = data.account.hero || {};
  let prod = 0, crop = 0, stock = 0;
  for (const v of villages) {
    const p = v.resources && v.resources.production;
    if (p) { prod += (p.wood || 0) + (p.clay || 0) + (p.iron || 0) + Math.max(0, p.crop || 0); crop += p.crop || 0; }
    const est = estimateStock(v, now);
    if (est) stock += RESOURCES.reduce((n, k) => n + est[k], 0);
  }
  const attacked = villages.filter((v) => v.underAttack).length;
  const tiles = [
    [villages.length, t('ov.villages'), ''],
    [attacked, t('ov.underAttack'), attacked ? 'bad' : ''],
    [fmtNum(stock), t('ov.stockTotal'), ''],
    [ltr(`+${fmtNum(prod)}`), t('ov.prodHour'), ''],
    [ltr(`${crop >= 0 ? '+' : ''}${fmtNum(crop)}`), t('ov.netCrop'), crop < 0 ? 'bad' : ''],
    [fmtNum(data.account.gold), t('ov.gold'), ''],
    [fmtNum(data.account.silver), t('ov.silver'), ''],
    [hero.adventures ?? '—', t('ov.adventures', { status: t(hero.home ? 'ov.heroHome' : 'ov.heroAway') }), ''],
    [automationText(data, now), t('ov.automation'), data.settings.botEnabled ? 'good' : ''],
  ];
  $('summary').innerHTML = tiles.map(([b, label, tone]) => `<div class="stat ${tone}"><b>${esc(b)}</b><span>${esc(label)}</span></div>`).join('');
}

function renderAlerts(villages, data, now) {
  const items = [];
  if (data.status.loggedOut) items.push({ tone: 'bad', order: -1, text: t('status.loggedOut') });
  for (const v of villages) {
    if (v.underAttack) {
      const first = (v.movements || []).filter((m) => m.kind === 'att1' && m.arriveAt > now).map((m) => m.arriveAt).sort((a, b) => a - b)[0];
      const n = v.incomingAttacks || 0;
      items.push({
        tone: 'bad', order: first ? (first - now) / 3600000 - 1000 : -500,
        text: `⚔ ${t('alert.attack.title', { v: v.name })}${n ? ` — ${t('card.attacks', { n })}` : ''}${first ? t('card.firstIn', { t: fmtDuration(first - now), clock: fmtClock(first) }) : ''}`,
      });
    }
    if (!v.resources) continue;
    const full = [];
    for (const k of RESOURCES) {
      const hrs = hoursUntilLimit(v, k, now);
      const prod = v.resources.production ? v.resources.production[k] : 0;
      if (hrs == null || hrs > SOON_HOURS) continue;
      if (prod < 0) items.push({ tone: 'bad', order: hrs - 100, text: t('ov.starve', { v: v.name, t: fmtDuration(hrs * 3600000) }) });
      else if (hrs <= 0) full.push(resLabel(k));
      else items.push({ tone: hrs <= 0.25 ? 'bad' : 'warn', order: hrs, text: t('ov.fullIn', { res: resLabel(k), v: v.name, t: fmtDuration(hrs * 3600000) }) });
    }
    if (full.length) items.push({ tone: 'bad', order: 0, text: t('ov.full', { res: full.join(t('list.sep')), v: v.name }) });
    const active = (v.buildQueue || []).filter((b) => !b.finishAt || b.finishAt > now);
    if (v.buildQueue && !active.length) items.push({ tone: 'muted', order: 50, text: t('ov.idle', { v: v.name }) });
  }
  items.sort((a, b) => a.order - b.order);
  $('ovAlerts').innerHTML = items.length
    ? `<ul class="alert-list">${items.slice(0, 12).map((i) => `<li class="${i.tone}">${esc(i.text)}</li>`).join('')}</ul>`
    : `<p class="good-text">✓ ${esc(t('ov.allGood'))}</p>`;
}

function renderNext(villages, data, now) {
  const s = data.settings;
  const sched = data.schedule;
  const rows = [];
  const left = (at) => (at && at > now ? fmtDuration(at - now) : t('ov.now'));
  if (s.watchEnabled || s.botEnabled) rows.push([t('ov.nextCheck'), left(sched.refreshAt)]);
  for (const v of villages) {
    const list = data.tasks[v.id] || [];
    if (!list.length) continue;
    const why = buildStatus(v, data, now);
    rows.push([t('ov.nextBuild', { v: v.name }), `${taskLabel(list[0], v)}${why ? ` — ${why.text}` : ''}`]);
  }
  const rules = data.training.filter((r) => r.enabled !== false && data.villages[r.villageId]);
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

function renderTable(villages, data, now) {
  if (!villages.length) { $('ovTable').innerHTML = `<tr><td class="muted">${esc(t('ov.empty'))}</td></tr>`; return; }
  const head = [t('th.village'), ...RESOURCES.map(resLabel), t('th.netCrop'), t('th.firstFull'), t('th.buildingNow'), t('th.queued'), t('th.status')];
  const rows = villages.map((v) => {
    const est = estimateStock(v, now);
    const prod = v.resources && v.resources.production;
    const cells = RESOURCES.map((k) => {
      if (!est) return '<td class="muted">—</td>';
      const pct = est[k] / (capacityFor(v.resources, k) || 1);
      const tone = pct >= 0.95 ? 'bad' : pct >= 0.8 ? 'warn' : '';
      return `<td class="num ${tone}"><span dir="ltr">${fmtNum(est[k])}</span><small dir="ltr">${prod ? `+${fmtNum(Math.max(0, prod[k]))}` : ''}</small></td>`;
    });
    const crop = prod ? prod.crop : null;
    let first = null;
    for (const k of RESOURCES) {
      const h = hoursUntilLimit(v, k, now);
      if (h != null && (prod ? prod[k] > 0 : true) && (!first || h < first.h)) first = { k, h };
    }
    const active = (v.buildQueue || []).filter((b) => !b.finishAt || b.finishAt > now);
    const building = active.length
      ? active.map((b) => `${esc(b.name)} ${b.level != null ? esc(t('card.level', { n: b.level })) : ''} <span class="mono muted">${b.finishAt ? fmtDuration(b.finishAt - now) : ''}</span>`).join('<br>')
      : `<span class="muted">${esc(v.buildQueue ? t('card.idle') : '—')}</span>`;
    const tasks = data.tasks[v.id] || [];
    const why = buildStatus(v, data, now);
    return `<tr class="${v.underAttack ? 'attacked' : ''}">
      <td><b>${v.underAttack ? '⚔ ' : ''}${esc(v.name)}</b><br><small class="muted">${coords(v.x, v.y)} · ${esc(fmtAgo(v.updatedAt, now))}</small></td>
      ${cells.join('')}
      <td class="num ${crop < 0 ? 'bad' : ''}"><span dir="ltr">${crop == null ? '—' : `${crop >= 0 ? '+' : ''}${fmtNum(crop)}`}</span></td>
      <td>${first ? `${esc(resLabel(first.k))}<br><small class="mono ${first.h < 1 ? 'bad' : 'muted'}">${first.h <= 0 ? esc(t('card.full')) : fmtDuration(first.h * 3600000)}</small>` : '<span class="muted">—</span>'}</td>
      <td>${building}</td>
      <td>${tasks.length ? `${tasks.length}<br><small class="muted">${esc(taskLabel(tasks[0], v))}</small>` : '<span class="muted">0</span>'}</td>
      <td>${why ? `<small class="${why.tone}">${esc(why.text)}</small>` : '<span class="muted">—</span>'}</td>
    </tr>`;
  });
  $('ovTable').innerHTML = `<tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${rows.join('')}`;
}

function renderQueues(villages, now) {
  const rows = [];
  for (const v of villages) {
    for (const b of v.buildQueue || []) {
      if (b.finishAt && b.finishAt <= now) continue;
      rows.push({ v, b, at: b.finishAt || Infinity });
    }
  }
  rows.sort((a, b) => a.at - b.at);
  $('ovQueues').innerHTML = rows.length
    ? `<tr><th>${esc(t('th.village'))}</th><th>${esc(t('th.building'))}</th><th>${esc(t('th.level'))}</th><th>${esc(t('th.endsIn'))}</th><th>${esc(t('th.at'))}</th></tr>` +
      rows.map(({ v, b }) => `<tr><td>${esc(v.name)}</td><td>${esc(b.name)}</td><td class="mono">${b.level ?? ''}</td>
        <td class="mono">${b.finishAt ? fmtDuration(b.finishAt - now) : '—'}</td><td class="mono muted">${b.finishAt ? fmtClock(b.finishAt) : ''}</td></tr>`).join('')
    : `<tr><td class="muted">${esc(t('ov.noQueues'))}</td></tr>`;
}

function renderMoves(villages, now) {
  const rows = [];
  for (const v of villages) {
    for (const m of v.movements || []) {
      if (!m.arriveAt || m.arriveAt <= now) continue;
      rows.push({ v, m });
    }
  }
  rows.sort((a, b) => a.m.arriveAt - b.m.arriveAt);
  $('ovMoves').innerHTML = rows.length
    ? `<tr><th>${esc(t('th.village'))}</th><th>${esc(t('th.type'))}</th><th>${esc(t('th.count'))}</th><th>${esc(t('th.arrives'))}</th><th>${esc(t('th.at'))}</th></tr>` +
      rows.map(({ v, m }) => `<tr class="${m.kind === 'att1' ? 'attacked' : ''}"><td>${esc(v.name)}</td><td>${esc(moveLabel(m.kind))}</td>
        <td class="mono">${m.count || 1}</td><td class="mono">${fmtDuration(m.arriveAt - now)}</td><td class="mono muted">${fmtClock(m.arriveAt)}</td></tr>`).join('')
    : `<tr><td class="muted">${esc(t('ov.noMoves'))}</td></tr>`;
}

function renderActivity(data, now) {
  const names = Object.fromEntries(Object.values(data.villages).map((v) => [v.id, v.name]));
  const entries = data.log.slice(0, 6);
  $('ovActivity').innerHTML = entries.length
    ? entries.map((e) => `<li>
        <span class="muted mono">${esc(fmtAgo(e.t, now))}</span>
        <span class="lvl ${esc(e.level)}">${esc(t(`level.${e.level}`))}</span>
        <span>${e.villageId && names[e.villageId] ? `<b>${esc(names[e.villageId])}:</b> ` : ''}${esc(e.msg)}</span>
      </li>`).join('')
    : `<li class="muted">${esc(t('log.empty'))}</li>`;
}

export function renderOverview(data, now) {
  const villages = sortedVillages(data.villages);
  renderSummary(villages, data, now);
  renderAlerts(villages, data, now);
  renderNext(villages, data, now);
  renderTable(villages, data, now);
  renderQueues(villages, now);
  renderMoves(villages, now);
  renderActivity(data, now);
  const cards = villages.slice().sort((a, b) => Number(!!b.underAttack) - Number(!!a.underAttack));
  $('villageGrid').innerHTML = cards.map((v) => villageCard(v, data, now)).join('');
  $('ovCardsTitle').hidden = !cards.length;
}
