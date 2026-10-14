// Rendering helpers shared by the popup and the dashboard.
import {
  RESOURCES, resLabel, mergeSettings, estimateStock, hoursUntilLimit, capacityFor,
  fmtDuration, fmtAgo, fmtNum, fmtClock, buildStatus,
} from './shared.js';
import { t, setLanguage, coords, ltr } from './i18n.js';

export const STORAGE_KEYS = ['settings', 'villages', 'account', 'tasks', 'training', 'schedule', 'status', 'log', 'device', 'syncState'];

export async function loadAll() {
  const data = await chrome.storage.local.get(STORAGE_KEYS);
  data.settings = mergeSettings(data.settings);
  setLanguage(data.settings.language);
  data.villages = data.villages || {};
  data.account = data.account || {};
  data.tasks = data.tasks || {};
  data.training = data.training || [];
  data.schedule = data.schedule || {};
  data.status = data.status || {};
  data.log = data.log || [];
  try {
    data.lease = (await chrome.storage.sync.get('lease')).lease || null;
  } catch (e) {
    data.lease = null;
  }
  return data;
}

export async function command(name, args) {
  const res = await chrome.runtime.sendMessage({ type: 'COMMAND', name, args });
  if (!res || !res.ok) throw new Error((res && res.error) || 'No response from background');
  return res.result;
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export function statusLine(data, now = Date.now()) {
  const { settings: s, status, schedule } = data;
  if (!s.server) return { tone: 'muted', text: t('status.noServer') };
  if (status.loggedOut) return { tone: 'bad', text: t('status.loggedOut') };
  if (status.state === 'otherDevice') return { tone: 'warn', text: t('status.otherDevice', { name: status.note }) };
  if (status.state === 'working') return { tone: 'good', text: t('status.working', { note: status.note }) };
  if (status.state === 'paused') return { tone: 'warn', text: t('status.paused') };
  if (!s.watchEnabled && !s.botEnabled) return { tone: 'muted', text: t('status.off') };
  const next = schedule.refreshAt ? Math.max(0, schedule.refreshAt - now) : 0;
  const last = status.lastRunAt ? t('status.last', { ago: fmtAgo(status.lastRunAt, now) }) : '';
  return { tone: 'good', text: t('status.next', { t: fmtDuration(next) }) + last };
}

export function villageCard(v, data, now = Date.now()) {
  const est = estimateStock(v, now);
  const tasks = (data.tasks[v.id] || []).length;
  const trains = data.training.filter((r) => r.villageId === v.id && r.enabled !== false).length;
  const prod = v.resources && v.resources.production;

  const resRows = est ? RESOURCES.map((k) => {
    const cap = capacityFor(v.resources, k) || 1;
    const pct = Math.min(100, Math.round((est[k] / cap) * 100));
    const hrs = hoursUntilLimit(v, k, now);
    const p = prod ? prod[k] : null;
    const parts = [];
    if (p != null) parts.push(ltr(t('card.perHour', { n: `${p > 0 ? '+' : ''}${fmtNum(p)}` })));
    let tone = pct >= 95 ? 'bad' : pct >= 80 ? 'warn' : '';
    if (p > 0 && hrs != null) parts.push(hrs <= 0 ? t('card.full') : t('card.fullIn', { t: fmtDuration(hrs * 3600000) }));
    if (p < 0 && hrs != null) { parts.push(t('card.emptyIn', { t: fmtDuration(hrs * 3600000) })); tone = 'bad'; }
    return `<div class="res res-${k}">
      <span class="res-name">${resLabel(k)}</span>
      <span class="res-val"><span dir="ltr">${fmtNum(est[k])}<small> / ${fmtNum(cap)}</small></span></span>
      <div class="bar"><i class="${tone}" style="width:${pct}%"></i></div>
      <span class="res-sub ${tone}">${esc(parts.join(' · '))}</span>
    </div>`;
  }).join('') : `<p class="muted small">${esc(t('card.noData'))}</p>`;

  const active = (v.buildQueue || []).filter((b) => !b.finishAt || b.finishAt > now);
  const queue = active.length
    ? `<ul class="queue">${active.map((b) => `<li><span>${esc(b.name)} <b>${b.level != null ? esc(t('card.level', { n: b.level })) : ''}</b></span><span class="mono">${b.finishAt ? fmtDuration(b.finishAt - now) : ''}</span></li>`).join('')}</ul>`
    : v.buildQueue ? `<p class="small warn-text">${esc(t('card.idle'))}</p>` : '';

  let attack = '';
  if (v.underAttack) {
    const firsts = (v.movements || []).filter((m) => m.kind === 'att1' && m.arriveAt && m.arriveAt > now).map((m) => m.arriveAt).sort((a, b) => a - b);
    const n = v.incomingAttacks || 0;
    const first = firsts[0] ? esc(t('card.firstIn', { t: '\u0000', clock: fmtClock(firsts[0]) })).replace('\u0000', `<b class="mono">${fmtDuration(firsts[0] - now)}</b>`) : '';
    attack = `<div class="attack">⚔ ${esc(n ? t('card.attacks', { n }) : t('card.attack'))}${first}</div>`;
  }

  const why = buildStatus(v, data, now);
  const chips = [];
  if (tasks) chips.push(t('card.buildTasks', { n: tasks }));
  if (trains) chips.push(t('card.trainRules', { n: trains }));

  return `<article class="village${v.underAttack ? ' attacked' : ''}">
    <header>
      <h3>${esc(v.name)} <span class="muted">${coords(v.x, v.y)}</span></h3>
      <span class="muted small">${esc(fmtAgo(v.updatedAt, now))}</span>
    </header>
    ${attack}
    <div class="res-grid">${resRows}</div>
    ${queue}
    ${chips.length ? `<p class="chips">${chips.map((c) => `<span>${esc(c)}</span>`).join('')}</p>` : ''}
    ${why ? `<p class="build-why ${why.tone}">${esc(why.text)}</p>` : ''}
  </article>`;
}
