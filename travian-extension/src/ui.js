// Rendering helpers shared by the popup and the dashboard.
import {
  RESOURCES, RESOURCE_LABELS, mergeSettings, estimateStock, hoursUntilLimit, capacityFor,
  fmtDuration, fmtAgo, fmtNum, fmtClock,
} from './shared.js';

export const STORAGE_KEYS = ['settings', 'villages', 'account', 'tasks', 'training', 'schedule', 'status', 'log'];

export async function loadAll() {
  const data = await chrome.storage.local.get(STORAGE_KEYS);
  data.settings = mergeSettings(data.settings);
  data.villages = data.villages || {};
  data.account = data.account || {};
  data.tasks = data.tasks || {};
  data.training = data.training || [];
  data.schedule = data.schedule || {};
  data.status = data.status || {};
  data.log = data.log || [];
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
  if (!s.server) return { tone: 'muted', text: 'Open your Travian server in a tab to get started.' };
  if (status.loggedOut) return { tone: 'bad', text: 'Logged out of Travian — log in again to resume.' };
  if (status.state === 'working') return { tone: 'good', text: `Working: ${status.note}` };
  if (status.state === 'paused') return { tone: 'warn', text: 'Paused while you play.' };
  if (!s.watchEnabled && !s.botEnabled) return { tone: 'muted', text: 'Watching is off — data updates only when you open Travian.' };
  const next = schedule.refreshAt ? Math.max(0, schedule.refreshAt - now) : 0;
  return { tone: 'good', text: `Next check in ${fmtDuration(next)}${status.lastRunAt ? ` · last ${fmtAgo(status.lastRunAt, now)}` : ''}` };
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
    let sub = p != null ? `${p > 0 ? '+' : ''}${fmtNum(p)}/h` : '';
    let tone = pct >= 95 ? 'bad' : pct >= 80 ? 'warn' : '';
    if (p > 0 && hrs != null) sub += hrs <= 0 ? ' · full' : ` · full in ${fmtDuration(hrs * 3600000)}`;
    if (p < 0 && hrs != null) { sub += ` · empty in ${fmtDuration(hrs * 3600000)}`; tone = 'bad'; }
    return `<div class="res res-${k}">
      <span class="res-name">${RESOURCE_LABELS[k]}</span>
      <span class="res-val">${fmtNum(est[k])}<small> / ${fmtNum(cap)}</small></span>
      <div class="bar"><i class="${tone}" style="width:${pct}%"></i></div>
      <span class="res-sub ${tone}">${esc(sub)}</span>
    </div>`;
  }).join('') : '<p class="muted small">No resource data yet — the next check will fill this in.</p>';

  const active = (v.buildQueue || []).filter((b) => !b.finishAt || b.finishAt > now);
  const queue = active.length
    ? `<ul class="queue">${active.map((b) => `<li><span>${esc(b.name)} <b>${b.level != null ? `L${b.level}` : ''}</b></span><span class="mono">${b.finishAt ? fmtDuration(b.finishAt - now) : ''}</span></li>`).join('')}</ul>`
    : v.buildQueue ? '<p class="small warn-text">Builders are idle</p>' : '';

  let attack = '';
  if (v.underAttack) {
    const firsts = (v.movements || []).filter((m) => m.kind === 'att1' && m.arriveAt && m.arriveAt > now).map((m) => m.arriveAt).sort((a, b) => a - b);
    const n = v.incomingAttacks || 0;
    attack = `<div class="attack">⚔ ${n ? `${n} incoming attack${n > 1 ? 's' : ''}` : 'Incoming attack'}${firsts[0] ? ` — first in <b class="mono">${fmtDuration(firsts[0] - now)}</b> (${fmtClock(firsts[0])})` : ''}</div>`;
  }

  const chips = [];
  if (tasks) chips.push(`${tasks} build task${tasks > 1 ? 's' : ''}`);
  if (trains) chips.push(`${trains} training rule${trains > 1 ? 's' : ''}`);

  return `<article class="village${v.underAttack ? ' attacked' : ''}">
    <header>
      <h3>${esc(v.name)} <span class="muted">(${v.x ?? '?'}|${v.y ?? '?'})</span></h3>
      <span class="muted small">${fmtAgo(v.updatedAt, now)}</span>
    </header>
    ${attack}
    <div class="res-grid">${resRows}</div>
    ${queue}
    ${chips.length ? `<p class="chips">${chips.map((c) => `<span>${c}</span>`).join('')}</p>` : ''}
  </article>`;
}
