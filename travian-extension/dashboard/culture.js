// Culture tab: progress towards the next village, culture points per
// village, celebrations, and what the autopilot would build for culture.
import { esc } from '../src/ui.js';
import { sortedVillages, buildingName, fmtNum, fmtDuration, fmtClock, estimateStock, RESOURCES } from '../src/shared.js';
import { t, dateLocale } from '../src/i18n.js';
import { villageCp, bestCpUpgrade, savingFor, expansionEta, CELEBRATIONS } from '../src/culture.js';

const $ = (id) => document.getElementById(id);
let last = '';

const when = (ts) => new Date(ts).toLocaleString(dateLocale(), { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const thLevel = (v) => Math.max(0, ...(v.buildings || []).filter((b) => b.gid === 24).map((b) => b.level || 0));

function celebrationText(v, data, now) {
  const kind = data.settings.culture.celebrate;
  const th = thLevel(v);
  if (!v.buildings) return { tone: 'muted', text: t('build.notScannedBuildings') };
  if (!th) return { tone: 'muted', text: t('culture.noTownHall') };
  if ((v.celebrationUntil || 0) > now) return { tone: 'good', text: t('culture.running', { clock: fmtClock(v.celebrationUntil) }) };
  if (!kind || kind === 'off') return { tone: 'muted', text: t('culture.celebrateOff') };
  if ((v.celebrationFailAt || 0) > now - 12 * 3600000) return { tone: 'bad', text: t('culture.failed') };
  const save = savingFor(v, kind, now);
  if (!save) return { tone: 'muted', text: '—' };
  if (save.tooSmall) return { tone: 'warn', text: t('culture.tooSmall', { kind: t(`culture.kind.${save.kind}`) }) };
  const est = estimateStock(v, now);
  const pct = est ? Math.min(100, Math.round(Math.min(...RESOURCES.map((k) => est[k] / save.cost[k])) * 100)) : 0;
  if (pct >= 100) return { tone: 'good', text: t('culture.ready', { kind: t(`culture.kind.${save.kind}`) }) };
  return { tone: 'warn', text: t('culture.saving', { kind: t(`culture.kind.${save.kind}`), pct }) };
}

export function renderCulture(data, now) {
  const villages = sortedVillages(data.villages);
  const ex = data.account.expansion;
  const eta = expansionEta(data.account.cpHistory, now);
  const totalCp = villages.reduce((n, v) => n + villageCp(v), 0);
  const cu = data.settings.culture;

  // Next village.
  let head;
  if (!ex || ex.total == null) head = `<p class="muted">${esc(t('culture.noSlots'))}</p>`;
  else {
    const free = ex.used < ex.total;
    head = `<div class="cu-slots${free ? ' free' : ''}">
        <div><small class="muted">${esc(t('culture.villages'))}</small><b class="mono">${ex.used}/${ex.total}</b></div>
        <div class="cu-bar" role="progressbar" aria-valuenow="${ex.pct ?? 0}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.min(100, ex.pct ?? 0)}%"></i></div>
        <div><small class="muted">${esc(t('culture.toNext'))}</small><b class="mono">${ex.pct != null ? `${Math.round(ex.pct)}%` : '—'}</b></div>
      </div>
      <p class="${free ? 'good-text' : 'muted'} small">${esc(free ? t('culture.freeSlot') : eta
        ? t('culture.eta', { when: when(eta.at), t: fmtDuration(eta.at - now), pace: (eta.perHour * 24).toFixed(1) })
        : t('culture.etaUnknown'))}</p>`;
  }
  $('cuHead').innerHTML = `${head}<p class="small">${esc(t('culture.totalCp', { n: fmtNum(totalCp) }))}</p>`;

  // Per village.
  const rows = villages.map((v) => {
    const cel = celebrationText(v, data, now);
    const pick = v.buildings ? bestCpUpgrade(v) : null;
    const next = pick ? `${buildingName(pick.gid)} → ${pick.level + 1} <small class="muted">(+${pick.gain} · ${fmtNum(RESOURCES.reduce((n, k) => n + pick.cost[k], 0))})</small>` : '—';
    return `<tr>
      <td>${esc(v.name)}</td>
      <td class="mono">${v.buildings ? fmtNum(villageCp(v)) : '—'}</td>
      <td class="mono">${thLevel(v) || '—'}</td>
      <td class="${cel.tone === 'bad' ? 'bad' : cel.tone === 'good' ? 'good-text' : cel.tone === 'warn' ? 'warn' : 'muted'}">${esc(cel.text)}</td>
      <td>${next}</td>
    </tr>`;
  }).join('');
  const html = `<tr>${['th.village', 'culture.cpDay', 'culture.townHall', 'culture.celebration', 'culture.nextBuild'].map((k) => `<th>${esc(t(k))}</th>`).join('')}</tr>${rows}`;
  if (html !== last) { last = html; $('cuTable').innerHTML = html; }

  const c = CELEBRATIONS[cu.celebrate] || null;
  $('cuCelebrateInfo').textContent = c ? t('culture.celebrateInfo', {
    cost: RESOURCES.map((k) => fmtNum(c.cost[k])).join(' / '), cp: c.cp, th: c.townHall,
  }) : '';
}
