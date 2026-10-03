/* Clout Chaser — notifications.
   1. Heads-up banners that slide down while you play (milestones, viral posts, stars following you…).
   2. Phone notifications while the app is closed, scheduled through the Android bridge window.AndroidNotify:
      daily login reward ready, login streak about to break, and a nudge after a few days away.
   Each kind can be switched off in Settings. */
'use strict';

const ALERT_KINDS = {
  banners: ['In-game banners', 'Pop-ups while you play for milestones, viral posts and big moments'],
  daily:   ['Daily reward ready', 'A phone notification when your next login reward unlocks'],
  streak:  ['Streak reminder', 'An evening reminder if your login streak is about to break'],
  comeback: ['We miss you', 'One nudge after three days away'],
};
function alertsInit() {
  S.settings.alerts = S.settings.alerts || {};
  for (const k of Object.keys(ALERT_KINDS)) if (S.settings.alerts[k] === undefined) S.settings.alerts[k] = true;
  return S.settings.alerts;
}
const alertOn = (k) => !!alertsInit()[k];

/* ---------- heads-up banners ---------- */
let huQuiet = 0, huQueue = [], huBusy = false, huLast = 0;
function quietly(fn) { huQuiet++; try { return fn(); } finally { huQuiet--; } }
const HU_TYPES = new Set(['system', 'viral', 'follow']);
function headsUp(n) {
  if (!S || huQuiet || !alertOn('banners') || !HU_TYPES.has(n.type)) return;
  if (n.type === 'follow' && !(n.who && NPCS[n.who])) return; // only stars, not every fan
  if (huQueue.length >= 3) return;
  huQueue.push(n); pumpHeadsUp();
}
function pumpHeadsUp() {
  if (huBusy || !huQueue.length) return;
  const wait = Math.max(0, huLast + 900 - Date.now());
  huBusy = true;
  setTimeout(() => {
    const n = huQueue.shift(), box = document.getElementById('headsup');
    if (!box || !n) { huBusy = false; return; }
    const who = n.who && NPCS[n.who] ? npcAv(n.who, 'sm') : `<span class="hu-ico">${n.type === 'viral' ? '🔥' : n.type === 'follow' ? '⭐' : '🔔'}</span>`;
    box.innerHTML = `<button class="hu-card" data-act="huOpen">${who}<span class="hu-text"><b>${n.type === 'viral' ? 'You went viral!' : n.type === 'follow' && NPCS[n.who] ? esc(NPCS[n.who].name) : 'Clout Chaser'}</b><span>${esc(safe(n.text || ''))}</span></span></button>`;
    box.hidden = false; box.classList.remove('out'); void box.offsetWidth; box.classList.add('in');
    huLast = Date.now();
    setTimeout(() => { box.classList.remove('in'); box.classList.add('out'); setTimeout(() => { box.hidden = true; huBusy = false; pumpHeadsUp(); }, 300); }, 3200);
  }, wait);
}

/* ---------- phone notifications (Android app) ---------- */
const canNotify = () => !!(window.AndroidNotify && AndroidNotify.schedule);
function at(hour, dayOffset = 0) { const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(hour, 0, 0, 0); return d.getTime(); }
/* rebuilt every time the app goes to the background, so it always reflects the latest state */
function schedulePhoneAlerts() {
  if (!canNotify() || !S) return;
  try {
    AndroidNotify.cancelAll();
    const now = Date.now(), L = typeof loginState === 'function' ? loginState() : null;
    const streak = L ? L.streak || 0 : 0;
    if (alertOn('daily')) {
      // tomorrow morning: the next calendar reward
      AndroidNotify.schedule(1, '🎁 Your daily reward is ready', streak > 1 ? `Day ${streak + 1} of your streak is waiting. Don't break it!` : 'Open Clout Chaser to claim today\'s reward.', at(9, 1) - now);
    }
    if (alertOn('streak') && streak >= 2) {
      // tomorrow evening, only shown if they still have not opened the game (it is cancelled on open)
      AndroidNotify.schedule(2, `🔥 Your ${streak + 1}-day streak ends at midnight`, 'Claim your login reward to keep it alive.', at(19, 1) - now);
    }
    if (alertOn('comeback')) {
      AndroidNotify.schedule(3, `${S.name}, your fans miss you 👀`, `${fmt(totalFollowers())} followers are waiting for your next post.`, at(18, 3) - now);
    }
  } catch (e) { console.error('schedule alerts', e); }
}
function clearPhoneAlerts() { if (canNotify()) try { AndroidNotify.cancelAll(); } catch (e) { /* ignore */ } }
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (S) { save(); schedulePhoneAlerts(); } }
  else { clearPhoneAlerts(); if (S && typeof vipDaily === 'function') { vipDaily(); renderAll(); } }
});
window.addEventListener('pagehide', () => { if (S) schedulePhoneAlerts(); });

/* ask for notification permission once, after the first night, when reminders start to make sense */
function maybeAskNotify() {
  if (!canNotify() || !S || S.flags.askedNotify || S.day < 2) return;
  S.flags.askedNotify = true;
  try { AndroidNotify.requestPermission(); } catch (e) { /* older app */ }
}
function alertsSettings() {
  const a = alertsInit();
  return `<div class="sect"><h3>Notifications</h3>
    ${Object.entries(ALERT_KINDS).map(([k, [name, desc]]) => `<label class="row"><input type="checkbox" data-act="alertToggle" data-arg="${k}" ${a[k] ? 'checked' : ''}> ${name} <span class="small muted">${desc}</span></label>`).join('')}
    ${canNotify() ? `<div class="row">${btn('Send a test notification', 'alertTest', '', 'sm')}${AndroidNotify.enabled && !AndroidNotify.enabled() ? btn('Allow notifications', 'alertPerm', '', 'sm primary') : ''}</div>` : '<span class="small muted">Phone notifications work in the Android app.</span>'}</div>`;
}
const ALERT_ACT = {
  huOpen: () => { const box = document.getElementById('headsup'); if (box) box.hidden = true; return ACT.go('notifs'); },
  alertToggle: (a) => { const s = alertsInit(); s[a] = !s[a]; },
  alertTest: () => { if (canNotify()) { AndroidNotify.requestPermission(); AndroidNotify.schedule(9, '🔔 Notifications are on', 'This is what Clout Chaser reminders look like.', 3000); toast('A test notification arrives in 3 seconds. Close the app to see it.'); } },
  alertPerm: () => { if (canNotify()) AndroidNotify.requestPermission(); },
};
