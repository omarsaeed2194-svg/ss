// Troop escape: when an attack is on its way, send the village's troops as
// reinforcement to another of the player's villages shortly before it lands,
// so nobody is home when it hits. Pure decisions only; the background
// worker does the sending.
import { distance } from './autopilot.js';
import { fmtClock, fmtDuration } from './shared.js';
import { t } from './i18n.js';

// Time the bot needs to open the village, fill the rally point and confirm.
export const PREP_MS = 45 * 1000;
// Closer than this to the landing there's no point starting.
export const TOO_LATE_MS = 10 * 1000;
const MAX_TRIES = 2;

// Arrival of the first incoming attack still to land, or null.
export function firstAttack(v, now = Date.now()) {
  const times = (v.movements || []).filter((m) => m.kind === 'att1' && m.arriveAt > now).map((m) => m.arriveAt);
  return times.length ? Math.min(...times) : null;
}

// When troops should leave for the first attack: `leaveAt` is the player's
// "n seconds before it lands", `startAt` is when the bot starts working.
export function escapeTiming(v, plan, now = Date.now()) {
  const first = firstAttack(v, now);
  if (!first) return null;
  const leaveAt = first - Math.max(30, plan.leadSeconds || 120) * 1000;
  return { first, leaveAt, startAt: leaveAt - PREP_MS };
}

// Already handled for this attack (or given up on): nothing more to do.
export function escapeDone(v, first) {
  const st = v.escape || {};
  if (st.forAttack !== first) return false;
  return st.status === 'sent' || st.status === 'nothing' || (st.status === 'failed' && (st.tries || 0) >= MAX_TRIES);
}

// Timing when an escape should run now, else null. `force`: the player
// asked to go now (e.g. from Telegram), whatever the lead time says.
export function escapeDue(v, plan, now = Date.now(), force = false) {
  if (!plan || plan.enabled === false) return null;
  const tm = escapeTiming(v, plan, now);
  if (!tm || (!force && now < tm.startAt) || tm.first - now < TOO_LATE_MS || escapeDone(v, tm.first)) return null;
  return tm;
}

// Where to go: the chosen village, unless it is under attack itself; then
// (or when none was chosen) the nearest of the player's villages that isn't.
export function escapeTarget(v, plan, villages) {
  const safe = (o) => o && o.id !== v.id && !o.underAttack && o.x != null && o.y != null;
  const chosen = plan.targetVillageId ? villages[plan.targetVillageId] : null;
  if (safe(chosen)) return { village: chosen, fallback: false };
  const others = Object.values(villages || {}).filter(safe).sort((a, b) => distance(v, a) - distance(v, b));
  return others.length ? { village: others[0], fallback: !!plan.targetVillageId } : null;
}

// Which troops leave, from what the rally point says is at home: every unit
// (or only the chosen ones), and the hero if the plan says so.
export function escapeTroops(plan, available) {
  const out = {};
  for (const [f, n] of Object.entries(available || {})) {
    if (!(n > 0)) continue;
    if (f === 't11') { if (plan.hero) out[f] = 1; continue; }
    if (!Array.isArray(plan.units) || plan.units.includes(f)) out[f] = n;
  }
  return out;
}

// What the escape plan of a village is doing, for the popup, tips and the
// Troops tab. Null without an active plan.
export function escapeStatus(v, plan, villages, now = Date.now()) {
  if (!plan || plan.enabled === false) return null;
  const st = v.escape || {};
  const name = (id) => (villages[id] || {}).name || '—';
  const tm = escapeTiming(v, plan, now);
  if (tm && st.forAttack === tm.first) {
    if (st.status === 'sent') return { tone: 'good', text: t('escape.st.sent', { to: name(st.to), clock: fmtClock(st.at) }) };
    if (st.status === 'nothing') return { tone: 'muted', text: t('escape.st.nothing') };
    if (st.status === 'failed') return { tone: 'bad', text: t('escape.st.failed', { reason: st.reason || '' }) };
  }
  if (tm) {
    const dest = escapeTarget(v, plan, villages);
    if (!dest) return { tone: 'bad', text: t('escape.st.noTarget') };
    return { tone: 'warn', text: t('escape.st.planned', { to: dest.village.name, clock: fmtClock(Math.max(now, tm.leaveAt)), t: fmtDuration(Math.max(0, tm.leaveAt - now)) }) };
  }
  if (v.underAttack) return { tone: 'warn', text: t('escape.st.unknown') };
  if (st.status === 'sent' && !firstAttack(v, now) && now - (st.at || 0) < 6 * 3600000) return { tone: 'warn', text: t('escape.st.away', { to: name(st.to) }) };
  return { tone: 'muted', text: t('escape.st.ready') };
}
