// Background service worker: stores what the content script reports, raises
// alerts, and drives a dedicated "bot tab" to run queued actions.
import {
  RESOURCES, resLabel, FIELD_RESOURCE, mergeSettings, capacityFor,
  estimateStock, fmtDuration, fmtClock, withinActiveHours, sortedVillages, taskLabel, buildingName,
  buildBlock,
} from './shared.js';
import { t, setLanguage, coords, ltr } from './i18n.js';

const LOG_LIMIT = 300;
const PAGE_TIMEOUT_MS = 45000;
const BUILDINGS_RESCAN_MS = 3 * 3600 * 1000;
const STORAGE_REALERT_MS = 6 * 3600 * 1000;
const MAX_BUILD_ATTEMPTS = 6;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const jittered = (ms, pct) => Math.round(ms * (1 + ((Math.random() * 2 - 1) * pct) / 100));
const uid = () => Math.random().toString(36).slice(2, 10);

// ---------------------------------------------------------------- storage --
// Every read-modify-write of chrome.storage goes through this queue so the
// bot loop, page reports and dashboard edits never overwrite each other.
// Never call update() (or log()) from inside an update callback.
let queue = Promise.resolve();
function update(keys, fn) {
  const run = queue.then(async () => {
    const data = await chrome.storage.local.get(keys);
    const result = await fn(data);
    await chrome.storage.local.set(data);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}
const read = (keys) => chrome.storage.local.get(keys);
async function getSettings() {
  const s = mergeSettings((await read(['settings'])).settings);
  setLanguage(s.language);
  return s;
}

// Failure text from the content script: a reason code, or a raw message.
const reasonText = (res) => (res.code ? t(`reason.${res.code}`) : res.reason || '');

async function log(level, msg, villageId) {
  await update(['log'], (d) => {
    d.log = d.log || [];
    d.log.unshift({ t: Date.now(), level, msg, villageId: villageId || null });
    if (d.log.length > LOG_LIMIT) d.log.length = LOG_LIMIT;
  });
}

async function setStatus(patch) {
  await update(['status'], (d) => { d.status = { ...(d.status || {}), ...patch }; });
}

// ----------------------------------------------------------------- alerts --
async function sendAlert({ title, body, kind, sticky }) {
  const s = await getSettings();
  if (kind && s.alerts[kind] === false) return;
  await log('alert', `${title} — ${body}`);
  if (s.alerts.desktop) {
    chrome.notifications.create(`tvh-${Date.now()}-${uid()}`, {
      type: 'basic', iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title, message: body, priority: 2, requireInteraction: !!sticky,
    });
  }
  await sendRemote(s, `${title}\n${body}`);
}

async function sendRemote(s, text) {
  const jobs = [];
  if (s.telegram.token && s.telegram.chatId) {
    jobs.push(fetch(`https://api.telegram.org/bot${encodeURIComponent(s.telegram.token)}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: s.telegram.chatId, text }),
    }).then((r) => { if (!r.ok) throw new Error(`Telegram HTTP ${r.status}`); }));
  }
  if (/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//.test(s.discord.webhookUrl || '')) {
    jobs.push(fetch(s.discord.webhookUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    }).then((r) => { if (!r.ok) throw new Error(`Discord HTTP ${r.status}`); }));
  }
  const results = await Promise.allSettled(jobs);
  const failed = results.filter((r) => r.status === 'rejected').map((r) => r.reason.message);
  if (failed.length) await log('error', t('log.remoteFailed', { e: failed.join(', ') }));
  return { sent: jobs.length, failed };
}

async function refreshBadge() {
  const { villages = {}, status = {}, settings } = await read(['villages', 'status', 'settings']);
  const s = mergeSettings(settings);
  const attacked = Object.values(villages).filter((v) => v.underAttack).length;
  let text = '', color = '#16a34a';
  if (attacked) { text = String(attacked); color = '#dc2626'; }
  else if (status.loggedOut) { text = '!'; color = '#ea580c'; }
  else if (s.botEnabled) { text = 'ON'; }
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });
}

// ------------------------------------------------------- page processing --
async function processPage(state, tabId) {
  const now = Date.now();
  const { workerTabId } = await chrome.storage.session.get('workerTabId');
  const fromWorker = tabId != null && tabId === workerTabId;
  const alerts = [];
  const notes = [];

  await update(['settings', 'villages', 'account', 'status', 'alertMemo'], (d) => {
    const s = mergeSettings(d.settings);
    setLanguage(s.language);
    d.status = d.status || {};
    d.alertMemo = d.alertMemo || {};

    if (state.type === 'login') {
      if (!d.status.loggedOut) {
        alerts.push({ kind: 'loggedOut', title: t('alert.loggedOut.title'), body: t('alert.loggedOut.body'), sticky: true });
      }
      d.status.loggedOut = true;
      return;
    }
    d.status.loggedOut = false;
    d.status.lastPageAt = now;

    if (s.server !== state.server) {
      if (s.server) {
        d.villages = {};
        notes.push(t('log.serverSwitch', { s: state.server }));
      }
      s.server = state.server;
      d.settings = s;
    }

    d.villages = d.villages || {};
    const listed = state.villages || [];
    const attackAlerts = {};
    listed.forEach((vi, order) => {
      const v = d.villages[vi.id] || (d.villages[vi.id] = { id: vi.id });
      const wasAttacked = !!v.underAttack;
      Object.assign(v, { name: vi.name, x: vi.x, y: vi.y, order, underAttack: vi.underAttack });
      if (vi.underAttack && !wasAttacked) {
        v.needsRefresh = true; // fetch arrival times on the next tick
        attackAlerts[vi.id] = { kind: 'attacks', sticky: true, title: t('alert.attack.title', { v: vi.name }), body: t('alert.attack.body', { xy: coords(vi.x, vi.y) }) };
      }
      if (!vi.underAttack) v.incomingAttacks = 0;
    });
    if (listed.length) {
      const ids = new Set(listed.map((v) => v.id));
      for (const id of Object.keys(d.villages)) if (!ids.has(id)) delete d.villages[id];
    }

    const v = state.villageId && d.villages[state.villageId];
    if (v) {
      if (state.resources) {
        v.resources = state.resources;
        v.resourcesAt = now;
      }
      if (state.type === 'dorf1' || state.type === 'dorf2') {
        v.queueAt = now;
        v.buildQueue = (state.buildQueue || []).map((b) => ({
          name: b.name, level: b.level, finishAt: b.secondsLeft != null ? now + b.secondsLeft * 1000 : null,
        }));
      }
      if (state.fields) { v.fields = state.fields; v.fieldsAt = now; }
      if (state.buildings) { v.buildings = state.buildings; v.buildingsAt = now; }
      const trainable = state.buildPage && state.buildPage.trainable;
      if (trainable && trainable.length) {
        const slotBuilding = (v.buildings || []).find((b) => b.slot === state.buildPage.slot);
        const gid = Number(new URL(state.url).searchParams.get('gid')) || (slotBuilding && slotBuilding.gid);
        if (gid) v.units = { ...(v.units || {}), [gid]: trainable.map(({ field, name }) => ({ field, name })) };
      }
      if (state.movements) {
        v.movements = state.movements.map((m) => ({ ...m, arriveAt: m.secondsLeft != null ? now + m.secondsLeft * 1000 : null }));
        v.movementsAt = now;
        const incoming = v.movements.filter((m) => m.kind === 'att1');
        const count = incoming.reduce((n, m) => n + (m.count || 1), 0);
        if (count > (v.incomingAttacks || 0)) {
          const first = incoming.map((m) => m.arriveAt).filter(Boolean).sort((a, b) => a - b)[0];
          attackAlerts[v.id] = {
            kind: 'attacks', sticky: true,
            title: t('alert.attacks.title', { n: count, v: v.name }),
            body: first ? t('alert.attacks.first', { t: fmtDuration(first - now), clock: fmtClock(first) }) : t('alert.attacks.noTime', { xy: coords(v.x, v.y) }),
          };
        }
        v.incomingAttacks = count;
        v.needsRefresh = false;
      }
      v.updatedAt = now;

      if (state.resources && state.resources.production) {
        const res = state.resources;
        const filling = [];
        for (const k of RESOURCES) {
          const prod = res.production[k];
          const stock = res.stock[k];
          const cap = capacityFor(res, k);
          if (prod > 0 && cap && stock != null) {
            const hours = (cap - stock) / prod;
            const key = `full:${v.id}:${k}`;
            if (hours <= s.alerts.storageHours && now - (d.alertMemo[key] || 0) > STORAGE_REALERT_MS) {
              d.alertMemo[key] = now;
              filling.push(hours <= 0 ? t('alert.storage.full', { res: resLabel(k) }) : t('alert.storage.fullIn', { res: resLabel(k), t: fmtDuration(hours * 3600000) }));
            }
          }
          if (k === 'crop' && prod < 0 && stock != null) {
            const hours = stock / -prod;
            const key = `starve:${v.id}`;
            if (hours <= 3 && now - (d.alertMemo[key] || 0) > STORAGE_REALERT_MS) {
              d.alertMemo[key] = now;
              alerts.push({ kind: 'starvation', title: t('alert.starve.title', { v: v.name }), body: t('alert.starve.body', { t: fmtDuration(hours * 3600000), p: ltr(prod) }), sticky: true });
            }
          }
        }
        if (filling.length) {
          alerts.push({ kind: 'storage', title: t('alert.storage.title', { v: v.name }), body: t('alert.storage.body', { list: filling.join(t('list.sep')) }) });
        }
      }
    }
    alerts.push(...Object.values(attackAlerts));

    d.account = d.account || {};
    if (state.account) {
      d.account.gold = state.account.gold;
      d.account.silver = state.account.silver;
      d.account.hero = state.account.hero;
    }
    if (state.farmLists) d.account.farmLists = state.farmLists;
    d.account.updatedAt = now;
  });

  for (const n of notes) await log('info', n);
  for (const a of alerts) await sendAlert(a);
  await refreshBadge();
  return fromWorker ? { worker: true, badge: t('badge.worker') } : { worker: false };
}

// ------------------------------------------------------------- bot tab ----
const waiters = new Map(); // tabId -> { resolve, reject, timer }

function waitForPage(tabId, timeout = PAGE_TIMEOUT_MS) {
  const prev = waiters.get(tabId);
  if (prev) { clearTimeout(prev.timer); prev.reject(new Error('Superseded')); }
  let entry;
  const promise = new Promise((resolve, reject) => {
    entry = {
      resolve, reject,
      timer: setTimeout(() => { waiters.delete(tabId); reject(new Error(t('err.timeout'))); }, timeout),
    };
  });
  waiters.set(tabId, entry);
  promise.cancel = () => {
    if (waiters.get(tabId) === entry) { clearTimeout(entry.timer); waiters.delete(tabId); }
  };
  promise.catch(() => {});
  return promise;
}

function resolvePage(tabId, state) {
  const w = waiters.get(tabId);
  if (!w) return;
  waiters.delete(tabId);
  clearTimeout(w.timer);
  w.resolve(state);
}

async function navigate(tabId, url) {
  const page = waitForPage(tabId);
  await chrome.tabs.update(tabId, { url });
  const state = await page;
  if (state.type === 'login') throw Object.assign(new Error(t('err.loggedOut')), { loggedOut: true });
  return state;
}

// Ask the content script to click something. If the click navigates, wait
// for the next page and return it alongside the content script's answer.
async function act(tabId, action, expectNavigation) {
  const page = expectNavigation ? waitForPage(tabId) : null;
  let res;
  try {
    res = await chrome.tabs.sendMessage(tabId, { type: 'ACTION', action });
  } catch (e) {
    if (/Receiving end does not exist/i.test(e.message)) {
      res = { ok: false, code: 'notLoaded' };
    } else {
      // The page navigated away before answering; treat the click as done.
      res = { ok: true, navigating: true, lost: true };
    }
  }
  if (!res || !res.ok) {
    if (page) page.cancel();
    return { res: res || { ok: false, code: 'noResponse' } };
  }
  return { res, page: page ? await page : null };
}

async function ensureWorkerTab(server) {
  const { workerTabId } = await chrome.storage.session.get('workerTabId');
  if (workerTabId != null) {
    try {
      const existing = await chrome.tabs.get(workerTabId);
      const url = existing.url || existing.pendingUrl || '';
      if (url.startsWith(server)) return workerTabId;
    } catch (e) { /* closed */ }
  }
  const tab = await chrome.tabs.create({ url: 'about:blank', active: false, pinned: true });
  await chrome.storage.session.set({ workerTabId: tab.id });
  try { await chrome.tabs.update(tab.id, { autoDiscardable: false }); } catch (e) { /* older Chrome */ }
  await navigate(tab.id, `${server}/dorf1.php`);
  return tab.id;
}

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const { workerTabId } = await chrome.storage.session.get('workerTabId');
  if (tabId === workerTabId) await chrome.storage.session.remove('workerTabId');
  const w = waiters.get(tabId);
  if (w) { waiters.delete(tabId); clearTimeout(w.timer); w.reject(new Error(t('err.tabClosed'))); }
});

// ------------------------------------------------------------------ jobs ---
function pickField(v, task) {
  const stock = estimateStock(v) || {};
  const candidates = (v.fields || []).filter((f) =>
    !f.underConstruction && !f.maxLevel && f.level < task.targetLevel &&
    (!task.resource || task.resource === 'all' || FIELD_RESOURCE[f.gid] === task.resource));
  candidates.sort((a, b) => a.level - b.level || (stock[FIELD_RESOURCE[a.gid]] || 0) - (stock[FIELD_RESOURCE[b.gid]] || 0));
  return candidates[0] || null;
}

async function removeTask(villageId, taskId) {
  await update(['tasks'], (d) => {
    d.tasks = d.tasks || {};
    d.tasks[villageId] = (d.tasks[villageId] || []).filter((x) => x.id !== taskId);
  });
}

async function patchVillage(villageId, patch) {
  await update(['villages'], (d) => {
    if (d.villages && d.villages[villageId]) Object.assign(d.villages[villageId], patch);
  });
}

async function patchSchedule(patch) {
  await update(['schedule'], (d) => { d.schedule = { ...(d.schedule || {}), ...patch }; });
}

const JOBS = {
  async refresh(tabId, job, s) {
    let { villages = {} } = await read(['villages']);
    let ids = job.villageIds || sortedVillages(villages).map((v) => v.id);
    if (!ids.length) {
      const first = await navigate(tabId, `${s.server}/dorf1.php`);
      ids = (first.villages || []).map((v) => v.id).filter((id) => id !== first.villageId);
    }
    for (const id of ids) {
      await navigate(tabId, `${s.server}/dorf1.php?newdid=${encodeURIComponent(id)}`);
      ({ villages = {} } = await read(['villages']));
      const v = villages[id];
      if (v && (!v.buildingsAt || Date.now() - v.buildingsAt > BUILDINGS_RESCAN_MS)) {
        await sleep(rand(1200, 3000));
        await navigate(tabId, `${s.server}/dorf2.php?newdid=${encodeURIComponent(id)}`);
      }
      await sleep(rand(1500, 4000));
    }
    if (!job.villageIds) await patchSchedule({ refreshAt: Date.now() + jittered(s.refreshMinutes * 60000, s.jitterPercent) });
  },

  async build(tabId, job, s) {
    const vid = job.villageId;
    let { villages = {}, tasks = {} } = await read(['villages', 'tasks']);
    let v = villages[vid];
    const task = (tasks[vid] || [])[0];
    if (!v || !task) return;

    let slot = task.slot;
    if (task.kind === 'fields') {
      if (!v.fields || !v.fieldsAt) {
        await navigate(tabId, `${s.server}/dorf1.php?newdid=${encodeURIComponent(vid)}`);
        ({ villages = {} } = await read(['villages']));
        v = villages[vid];
      }
      const field = pickField(v, task);
      if (!field) {
        await removeTask(vid, task.id);
        await log('success', t('log.done', { task: taskLabel(task, v) }), vid);
        return;
      }
      slot = field.slot;
    }

    const page = await navigate(tabId, `${s.server}/build.php?newdid=${encodeURIComponent(vid)}&id=${slot}`);
    const bp = page.buildPage;
    if (!bp) throw new Error(t('err.noBuildPage'));
    const title = bp.title || t('task.slot', { n: slot });
    const now = Date.now();

    if (task.kind === 'upgrade' && ((bp.level != null && bp.level >= task.targetLevel) || (bp.nextLevel != null && bp.nextLevel > task.targetLevel))) {
      await removeTask(vid, task.id);
      await log('success', t('log.done', { task: taskLabel(task, v) }), vid);
      return;
    }
    if (bp.maxLevel) {
      await removeTask(vid, task.id);
      await log('info', t('log.maxLevel', { name: title }), vid);
      return;
    }
    if (!bp.canUpgrade) {
      if (bp.secondsUntilResources) {
        // Not enough resources: the game says when there will be. Retry
        // then, or sooner if a later snapshot shows the cost is covered.
        const waitMs = bp.secondsUntilResources * 1000 + 20000;
        await patchVillage(vid, { buildWait: { reason: 'resources', at: now, until: now + waitMs, cost: bp.cost, text: bp.blockedReason } });
        await log('info', t('log.waiting', { name: title, reason: bp.blockedReason || t('reason.cannotYet'), t: fmtDuration(waitMs) }), vid);
        return;
      }
      // No timer usually means the builders are busy and our queue info was
      // stale. Re-read the village's build queue before deciding.
      await navigate(tabId, `${s.server}/dorf1.php?newdid=${encodeURIComponent(vid)}`);
      ({ villages = {} } = await read(['villages']));
      const fresh = villages[vid];
      const busy = fresh && buildBlock({ ...fresh, buildWait: null }, s, Date.now());
      if (busy && busy.reason === 'queue') {
        await patchVillage(vid, { buildWait: null });
        await log('info', busy.until ? t('log.busy', { t: fmtDuration(busy.until - Date.now()) }) : t('log.busyUnknown'), vid);
        return;
      }
      // Something else blocks it (storage too small, missing requirement…).
      const attempts = (task.attempts || 0) + 1;
      if (attempts >= MAX_BUILD_ATTEMPTS) {
        await removeTask(vid, task.id);
        await patchVillage(vid, { buildWait: null });
        await log('error', t('log.gaveUp', { task: taskLabel(task, v), reason: bp.blockedReason || t('reason.noUpgradeSlot') }), vid);
        return;
      }
      await update(['tasks'], (d) => {
        const saved = ((d.tasks || {})[vid] || []).find((x) => x.id === task.id);
        if (saved) saved.attempts = attempts;
      });
      const waitMs = 10 * 60000;
      await patchVillage(vid, { buildWait: { reason: 'blocked', at: Date.now(), until: Date.now() + waitMs, text: bp.blockedReason } });
      await log('info', t('log.waiting', { name: title, reason: bp.blockedReason || t('reason.cannotYet'), t: fmtDuration(waitMs) }), vid);
      return;
    }

    const { res, page: after } = await act(tabId, { kind: 'upgrade' }, true);
    if (!res.ok || !after || after.type === 'build') {
      await patchVillage(vid, { buildWait: { reason: 'blocked', at: Date.now(), until: Date.now() + 5 * 60000, text: t('reason.stillOnBuild') } });
      await log('error', t('log.clickFailed', { name: title, reason: res.ok ? t('reason.stillOnBuild') : reasonText(res) }), vid);
      return;
    }
    // Title reads "<name> Level N" in the server's language; drop the level part.
    const name = (bp.title || '').replace(/\s*\S*\s*\d+\s*$/, '') || title;
    await log('success', t('log.upgrading', { name, n: bp.nextLevel ?? '?' }), vid);
    await patchVillage(vid, { buildWait: null });
    await update(['tasks'], (d) => {
      const saved = ((d.tasks || {})[vid] || []).find((x) => x.id === task.id);
      if (saved) saved.attempts = 0;
    });
    if (task.kind === 'upgrade' && bp.nextLevel != null && bp.nextLevel >= task.targetLevel) {
      await removeTask(vid, task.id);
      await log('success', t('log.finalQueued', { task: taskLabel(task, v) }), vid);
    }
  },

  async train(tabId, job, s) {
    const rule = job.rule;
    const { villages = {} } = await read(['villages']);
    const vname = villages[rule.villageId] ? villages[rule.villageId].name : rule.villageId;
    const bname = buildingName(rule.gid);
    const page = await navigate(tabId, `${s.server}/build.php?newdid=${encodeURIComponent(rule.villageId)}&gid=${rule.gid}`);
    const unit = page.buildPage && page.buildPage.trainable.find((u) => u.field === rule.troop);
    let next = jittered(rule.everyMinutes * 60000, s.jitterPercent);
    if (!unit) {
      await log('error', t('log.trainNotThere', { b: bname, v: vname, u: rule.troop }), rule.villageId);
    } else {
      const amount = Math.min(rule.amount, unit.max);
      if (amount < 1) {
        next = Math.min(next, 15 * 60000);
        await log('info', t('log.trainNoRes', { b: bname, v: vname, u: unit.name || rule.troop, t: fmtDuration(next) }), rule.villageId);
      } else {
        const { res } = await act(tabId, { kind: 'train', field: rule.troop, amount }, true);
        if (res.ok) await log('success', t('log.training', { n: amount, u: unit.name || rule.troop, v: vname }), rule.villageId);
        else await log('error', t('log.trainFailed', { v: vname, reason: reasonText(res) }), rule.villageId);
      }
    }
    await update(['training'], (d) => {
      const r = (d.training || []).find((x) => x.id === rule.id);
      if (r) r.nextAt = Date.now() + next;
    });
  },

  async farm(tabId, job, s) {
    const prefix = s.farm.villageId ? `newdid=${encodeURIComponent(s.farm.villageId)}&` : '';
    await navigate(tabId, `${s.server}/build.php?${prefix}gid=16&tt=99`);
    const { res } = await act(tabId, { kind: 'farm', ids: s.farm.listIds || [] }, false);
    if (res.ok) await log('success', t('log.farmSent', { what: res.started === 'all' ? t('log.farmAll') : t('log.farmCount', { n: res.started }) }));
    else await log('info', t('log.farmInfo', { reason: reasonText(res) }));
    await patchSchedule({ farmAt: Date.now() + jittered(s.farm.intervalMinutes * 60000, s.jitterPercent) });
  },

  async adventure(tabId, job, s) {
    await navigate(tabId, `${s.server}/hero/adventures`);
    const { res } = await act(tabId, { kind: 'adventure' }, false);
    if (res.ok) await log('success', t('log.heroSent', { to: res.detail ? t('log.heroTo', { where: ltr(res.detail) }) : '' }));
    else await log('info', t('log.adventureInfo', { reason: reasonText(res) }));
    await patchSchedule({ adventureAt: Date.now() + jittered(15 * 60000, s.jitterPercent) });
    // Pick up the hero's new status for the dashboard.
    await sleep(rand(1500, 3000));
    await navigate(tabId, `${s.server}/dorf1.php`);
  },
};

function planRefresh(s, data, now, force) {
  const { villages = {}, schedule = {} } = data;
  if (!(s.watchEnabled || s.botEnabled || force)) return [];
  if (force || now >= (schedule.refreshAt || 0)) return [{ type: 'refresh', label: t('job.refresh') }];
  const ids = Object.values(villages).filter((v) => v.needsRefresh).map((v) => v.id);
  return ids.length ? [{ type: 'refresh', villageIds: ids, label: t('job.refreshAttacked') }] : [];
}

// Planned after any refresh, so decisions use what the game shows right now.
function planActions(s, data, now) {
  const { villages = {}, tasks = {}, training = [], schedule = {}, account = {} } = data;
  const jobs = [];
  if (!s.botEnabled || !withinActiveHours(s.activeHours, new Date(now))) return jobs;

  for (const v of sortedVillages(villages)) {
    if ((tasks[v.id] || []).length && !buildBlock(v, s, now)) jobs.push({ type: 'build', villageId: v.id, label: t('job.build', { v: v.name }) });
  }
  for (const rule of training) {
    if (rule.enabled !== false && villages[rule.villageId] && now >= (rule.nextAt || 0)) {
      jobs.push({ type: 'train', rule, label: t('job.train', { v: villages[rule.villageId].name }) });
    }
  }
  if (s.farm.enabled && now >= (schedule.farmAt || 0)) jobs.push({ type: 'farm', label: t('job.farm') });
  const hero = account.hero || {};
  if (s.adventure.enabled && hero.adventures > 0 && hero.home && now >= (schedule.adventureAt || 0)) {
    jobs.push({ type: 'adventure', label: t('job.adventure') });
  }
  return jobs;
}

// Runs jobs in order; returns false when the run should stop (logged out,
// or the player started clicking around in the game).
async function runJobs(tabId, jobs, s, force) {
  for (const job of jobs) {
    await setStatus({ state: 'working', note: job.label });
    try {
      await JOBS[job.type](tabId, job, s);
    } catch (e) {
      if (e.loggedOut) return false; // processPage already alerted
      await log('error', `${job.label}: ${e.message}`);
      if (s.alerts.botErrors) {
        const { alertMemo = {} } = await read(['alertMemo']);
        const key = `err:${job.type}`;
        if (Date.now() - (alertMemo[key] || 0) > 3600000) {
          await update(['alertMemo'], (d) => { d.alertMemo = { ...(d.alertMemo || {}), [key]: Date.now() }; });
          await sendAlert({ kind: 'botErrors', title: t('alert.botError.title'), body: `${job.label}: ${e.message}` });
        }
      }
    }
    const { status: st = {} } = await read(['status']);
    if (st.loggedOut) return false;
    if (!force && s.pauseWhenPlaying && (st.userActiveUntil || 0) > Date.now()) return false;
    await sleep(rand(1200, 3500));
  }
  return true;
}

const DATA_KEYS = ['settings', 'villages', 'tasks', 'training', 'schedule', 'account', 'status'];
let running = false;
async function tick(force = false) {
  if (running) return { busy: true };
  running = true;
  try {
    const data = await read(DATA_KEYS);
    const s = mergeSettings(data.settings);
    setLanguage(s.language);
    const status = data.status || {};
    const now = Date.now();
    if (!s.server) {
      await setStatus({ state: 'idle', note: '' });
      return {};
    }
    if (status.loggedOut && !force) {
      await setStatus({ state: 'blocked', note: '' });
      return {};
    }
    if (!force && s.pauseWhenPlaying && (status.userActiveUntil || 0) > now) {
      await setStatus({ state: 'paused', note: '' });
      return {};
    }
    const refreshJobs = planRefresh(s, data, now, force);
    if (!refreshJobs.length && !planActions(s, data, now).length) {
      await setStatus({ state: 'idle', note: '' });
      return {};
    }

    const tabId = await ensureWorkerTab(s.server);
    if (await runJobs(tabId, refreshJobs, s, force)) {
      const fresh = await read(DATA_KEYS);
      await runJobs(tabId, planActions(s, fresh, Date.now()), s, force);
    }
    await setStatus({ state: 'idle', note: '', lastRunAt: Date.now() });
    return {};
  } finally {
    running = false;
    await refreshBadge();
  }
}

// ------------------------------------------------------ dashboard commands --
const COMMANDS = {
  async saveSettings({ settings }) {
    await update(['settings'], (d) => { d.settings = mergeSettings({ ...mergeSettings(d.settings), ...settings }); });
    await refreshBadge();
  },
  async addTask({ villageId, task }) {
    await update(['tasks'], (d) => {
      d.tasks = d.tasks || {};
      (d.tasks[villageId] = d.tasks[villageId] || []).push({ ...task, id: uid(), attempts: 0 });
    });
    await patchVillage(villageId, { buildWait: null });
  },
  async removeTask({ villageId, taskId }) { await removeTask(villageId, taskId); },
  async moveTask({ villageId, taskId, delta }) {
    await update(['tasks'], (d) => {
      const list = (d.tasks || {})[villageId] || [];
      const i = list.findIndex((x) => x.id === taskId);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
    });
    await patchVillage(villageId, { buildWait: null });
  },
  async addTraining({ rule }) {
    await update(['training'], (d) => { (d.training = d.training || []).push({ ...rule, id: uid(), nextAt: 0, enabled: true }); });
  },
  async updateTraining({ id, patch }) {
    await update(['training'], (d) => {
      const r = (d.training || []).find((x) => x.id === id);
      if (r) Object.assign(r, patch);
    });
  },
  async removeTraining({ id }) {
    await update(['training'], (d) => { d.training = (d.training || []).filter((x) => x.id !== id); });
  },
  async runNow() {
    await patchSchedule({ refreshAt: 0 });
    // "Check now" should retry builds immediately, not after a scheduled wait.
    await update(['villages'], (d) => {
      for (const v of Object.values(d.villages || {})) { delete v.buildWait; delete v.buildRetryAt; }
    });
    tick(true);
  },
  async testAlert() {
    const s = await getSettings();
    if (s.alerts.desktop) {
      chrome.notifications.create(`tvh-test-${uid()}`, {
        type: 'basic', iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: t('test.title'), message: t('test.desktop'),
      });
    }
    return sendRemote(s, t('test.remote'));
  },
  async clearLog() { await update(['log'], (d) => { d.log = []; }); },
  async resetData() {
    await update(['villages', 'account', 'schedule', 'alertMemo', 'status'], (d) => {
      d.villages = {}; d.account = {}; d.schedule = {}; d.alertMemo = {}; d.status = {};
    });
    await refreshBadge();
  },
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return undefined;
  if (msg.type === 'USER_ACTIVE') {
    getSettings().then((st) => setStatus({ userActiveUntil: Date.now() + st.pauseMinutes * 60000 }));
    return undefined;
  }
  if (msg.type === 'PAGE') {
    const tabId = sender.tab ? sender.tab.id : null;
    processPage(msg.state, tabId)
      .then((r) => { resolvePage(tabId, msg.state); sendResponse(r); })
      .catch((e) => { resolvePage(tabId, msg.state); sendResponse({ error: e.message }); });
    return true;
  }
  const fromExtensionPage = (sender.url || '').startsWith(chrome.runtime.getURL(''));
  if (msg.type === 'COMMAND' && COMMANDS[msg.name] && fromExtensionPage) {
    Promise.resolve(COMMANDS[msg.name](msg.args || {}))
      .then((r) => sendResponse({ ok: true, result: r }), (e) => sendResponse({ ok: false, error: e.message }));
    return true;
  }
  return undefined;
});

// ------------------------------------------------------------- lifecycle --
async function setup() {
  await chrome.alarms.create('tick', { periodInMinutes: 1 });
  await refreshBadge();
}
chrome.runtime.onInstalled.addListener(setup);
chrome.runtime.onStartup.addListener(setup);
chrome.alarms.onAlarm.addListener((a) => { if (a.name === 'tick') tick(); });
chrome.notifications.onClicked.addListener(async () => {
  const s = await getSettings();
  if (s.server) chrome.tabs.create({ url: `${s.server}/dorf1.php` });
});
