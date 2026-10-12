// Background service worker: stores what the content script reports, raises
// alerts, and drives a dedicated "bot tab" to run queued actions.
import {
  RESOURCES, RESOURCE_LABELS, FIELD_RESOURCE, TRAINING_BUILDINGS, mergeSettings, capacityFor,
  estimateStock, fmtDuration, fmtClock, withinActiveHours, sortedVillages, taskLabel, buildingName,
} from './shared.js';

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
const getSettings = async () => mergeSettings((await read(['settings'])).settings);

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
  if (failed.length) await log('error', `Remote notification failed: ${failed.join(', ')}`);
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
    d.status = d.status || {};
    d.alertMemo = d.alertMemo || {};
    if (!fromWorker) d.status.userActiveUntil = now + s.pauseMinutes * 60000;

    if (state.type === 'login') {
      if (!d.status.loggedOut) {
        alerts.push({ kind: 'loggedOut', title: 'Logged out of Travian', body: 'Automation is paused until you log in again.', sticky: true });
      }
      d.status.loggedOut = true;
      return;
    }
    d.status.loggedOut = false;
    d.status.lastPageAt = now;

    if (s.server !== state.server) {
      if (s.server) {
        d.villages = {};
        notes.push(`Switched to server ${state.server}`);
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
        attackAlerts[vi.id] = { kind: 'attacks', sticky: true, title: `Incoming attack on ${vi.name}`, body: `(${vi.x}|${vi.y}) is under attack. Open Travian to check arrival times.` };
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
            title: `${count} incoming attack${count > 1 ? 's' : ''} on ${v.name}`,
            body: first ? `First one lands in ${fmtDuration(first - now)} (at ${fmtClock(first)}).` : `(${v.x}|${v.y}) is under attack.`,
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
              filling.push(`${RESOURCE_LABELS[k]} ${hours <= 0 ? 'is full' : `full in ${fmtDuration(hours * 3600000)}`}`);
            }
          }
          if (k === 'crop' && prod < 0 && stock != null) {
            const hours = stock / -prod;
            const key = `starve:${v.id}`;
            if (hours <= 3 && now - (d.alertMemo[key] || 0) > STORAGE_REALERT_MS) {
              d.alertMemo[key] = now;
              alerts.push({ kind: 'starvation', title: `Troops starving soon in ${v.name}`, body: `Crop runs out in ${fmtDuration(hours * 3600000)} (${prod}/h).`, sticky: true });
            }
          }
        }
        if (filling.length) {
          alerts.push({ kind: 'storage', title: `Storage filling up in ${v.name}`, body: `${filling.join(', ')}. Spend or send resources.` });
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
  return { worker: fromWorker };
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
      timer: setTimeout(() => { waiters.delete(tabId); reject(new Error('Page did not load in time')); }, timeout),
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
  if (state.type === 'login') throw Object.assign(new Error('Logged out of Travian'), { loggedOut: true });
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
      res = { ok: false, reason: 'Travian page is not loaded in the bot tab' };
    } else {
      // The page navigated away before answering; treat the click as done.
      res = { ok: true, navigating: true, lost: true };
    }
  }
  if (!res || !res.ok) {
    if (page) page.cancel();
    return { res: res || { ok: false, reason: 'No response from page' } };
  }
  return { res, page: page ? await page : null };
}

async function ensureWorkerTab(server) {
  const { workerTabId } = await chrome.storage.session.get('workerTabId');
  if (workerTabId != null) {
    try {
      const t = await chrome.tabs.get(workerTabId);
      const url = t.url || t.pendingUrl || '';
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
  if (w) { waiters.delete(tabId); clearTimeout(w.timer); w.reject(new Error('Bot tab was closed')); }
});

// ------------------------------------------------------------------ jobs ---
function earliestQueueFinish(v, now) {
  return (v.buildQueue || []).map((b) => b.finishAt).filter((t) => t && t > now).sort((a, b) => a - b)[0] || null;
}

function buildReady(v, s, now) {
  if (!v) return false;
  if (now < (v.buildRetryAt || 0)) return false;
  const active = (v.buildQueue || []).filter((b) => !b.finishAt || b.finishAt > now);
  return active.length < s.maxQueue;
}

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
    d.tasks[villageId] = (d.tasks[villageId] || []).filter((t) => t.id !== taskId);
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
        await log('success', `Done: ${taskLabel(task, v)}`, vid);
        return;
      }
      slot = field.slot;
    }

    const page = await navigate(tabId, `${s.server}/build.php?newdid=${encodeURIComponent(vid)}&id=${slot}`);
    const bp = page.buildPage;
    if (!bp) throw new Error('Build page did not load');
    const now = Date.now();

    if (task.kind === 'upgrade' && ((bp.level != null && bp.level >= task.targetLevel) || (bp.nextLevel != null && bp.nextLevel > task.targetLevel))) {
      await removeTask(vid, task.id);
      await log('success', `Done: ${taskLabel(task, v)}`, vid);
      return;
    }
    if (bp.maxLevel) {
      await removeTask(vid, task.id);
      await log('info', `${bp.title || `Slot ${slot}`} is at max level — removed task`, vid);
      return;
    }
    if (!bp.canUpgrade) {
      const queueFree = earliestQueueFinish(v, now);
      const waitMs = bp.secondsUntilResources ? bp.secondsUntilResources * 1000 + 20000
        : queueFree ? queueFree - now + 20000 : 10 * 60000;
      const attempts = (task.attempts || 0) + 1;
      if (!bp.secondsUntilResources && !queueFree && attempts >= MAX_BUILD_ATTEMPTS) {
        await removeTask(vid, task.id);
        await log('error', `Gave up on ${taskLabel(task, v)}: ${bp.blockedReason || 'no upgrade button (is something built in that slot?)'}`, vid);
        return;
      }
      await update(['tasks'], (d) => {
        const t = ((d.tasks || {})[vid] || []).find((x) => x.id === task.id);
        if (t) t.attempts = attempts;
      });
      await patchVillage(vid, { buildRetryAt: now + waitMs });
      await log('info', `${bp.title || `Slot ${slot}`}: ${bp.blockedReason || 'cannot upgrade yet'} — retrying in ${fmtDuration(waitMs)}`, vid);
      return;
    }

    const { res, page: after } = await act(tabId, { kind: 'upgrade' }, true);
    if (!res.ok || !after || after.type === 'build') {
      await patchVillage(vid, { buildRetryAt: Date.now() + 5 * 60000 });
      await log('error', `Upgrade click failed for ${bp.title || `slot ${slot}`}: ${res.reason || 'still on build page'}`, vid);
      return;
    }
    const name = (bp.title || '').replace(/\s*\S*\s*\d+\s*$/, '') || `Slot ${slot}`;
    await log('success', `Upgrading ${name} to level ${bp.nextLevel ?? '?'}`, vid);
    await update(['tasks'], (d) => {
      const t = ((d.tasks || {})[vid] || []).find((x) => x.id === task.id);
      if (t) t.attempts = 0;
    });
    if (task.kind === 'upgrade' && bp.nextLevel != null && bp.nextLevel >= task.targetLevel) {
      await removeTask(vid, task.id);
      await log('success', `Queued final level: ${taskLabel(task, v)}`, vid);
    }
  },

  async train(tabId, job, s) {
    const rule = job.rule;
    const { villages = {} } = await read(['villages']);
    const vname = villages[rule.villageId] ? villages[rule.villageId].name : rule.villageId;
    const bname = TRAINING_BUILDINGS[rule.gid] || buildingName(rule.gid);
    const page = await navigate(tabId, `${s.server}/build.php?newdid=${encodeURIComponent(rule.villageId)}&gid=${rule.gid}`);
    const unit = page.buildPage && page.buildPage.trainable.find((t) => t.field === rule.troop);
    let next = jittered(rule.everyMinutes * 60000, s.jitterPercent);
    if (!unit) {
      await log('error', `${bname} in ${vname}: troop ${rule.troop} cannot be trained there`, rule.villageId);
    } else {
      const amount = Math.min(rule.amount, unit.max);
      if (amount < 1) {
        next = Math.min(next, 15 * 60000);
        await log('info', `${bname} in ${vname}: not enough resources for ${unit.name || rule.troop} — retrying in ${fmtDuration(next)}`, rule.villageId);
      } else {
        const { res } = await act(tabId, { kind: 'train', field: rule.troop, amount }, true);
        if (res.ok) await log('success', `Training ${amount} × ${unit.name || rule.troop} in ${vname}`, rule.villageId);
        else await log('error', `Training failed in ${vname}: ${res.reason}`, rule.villageId);
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
    if (res.ok) await log('success', `Farm lists sent (${res.started === 'all' ? 'all lists' : `${res.started} list(s)`})`);
    else await log('info', `Farm lists: ${res.reason}`);
    await patchSchedule({ farmAt: Date.now() + jittered(s.farm.intervalMinutes * 60000, s.jitterPercent) });
  },

  async adventure(tabId, job, s) {
    await navigate(tabId, `${s.server}/hero/adventures`);
    const { res } = await act(tabId, { kind: 'adventure' }, false);
    if (res.ok) await log('success', `Hero sent on an adventure${res.detail ? ` to ${res.detail}` : ''}`);
    else await log('info', `Adventure: ${res.reason}`);
    await patchSchedule({ adventureAt: Date.now() + jittered(15 * 60000, s.jitterPercent) });
    // Pick up the hero's new status for the dashboard.
    await sleep(rand(1500, 3000));
    await navigate(tabId, `${s.server}/dorf1.php`);
  },
};

function planJobs(s, data, now, force) {
  const { villages = {}, tasks = {}, training = [], schedule = {}, account = {} } = data;
  const jobs = [];
  const watching = s.watchEnabled || s.botEnabled || force;

  if (watching && (force || now >= (schedule.refreshAt || 0))) {
    jobs.push({ type: 'refresh', label: 'Checking villages' });
  } else if (watching) {
    const ids = Object.values(villages).filter((v) => v.needsRefresh).map((v) => v.id);
    if (ids.length) jobs.push({ type: 'refresh', villageIds: ids, label: 'Checking attacked villages' });
  }
  if (!s.botEnabled || !withinActiveHours(s.activeHours, new Date(now))) return jobs;

  for (const v of sortedVillages(villages)) {
    if ((tasks[v.id] || []).length && buildReady(v, s, now)) jobs.push({ type: 'build', villageId: v.id, label: `Building in ${v.name}` });
  }
  for (const rule of training) {
    if (rule.enabled !== false && villages[rule.villageId] && now >= (rule.nextAt || 0)) {
      jobs.push({ type: 'train', rule, label: `Training in ${villages[rule.villageId].name}` });
    }
  }
  if (s.farm.enabled && now >= (schedule.farmAt || 0)) jobs.push({ type: 'farm', label: 'Sending farm lists' });
  const hero = account.hero || {};
  if (s.adventure.enabled && hero.adventures > 0 && hero.home && now >= (schedule.adventureAt || 0)) {
    jobs.push({ type: 'adventure', label: 'Sending hero on adventure' });
  }
  return jobs;
}

let running = false;
async function tick(force = false) {
  if (running) return { busy: true };
  running = true;
  try {
    const data = await read(['settings', 'villages', 'tasks', 'training', 'schedule', 'account', 'status']);
    const s = mergeSettings(data.settings);
    const status = data.status || {};
    const now = Date.now();
    if (!s.server) {
      await setStatus({ state: 'idle', note: 'Open your Travian server once so the extension can find it' });
      return {};
    }
    if (status.loggedOut && !force) {
      await setStatus({ state: 'blocked', note: 'Logged out — log in to Travian to resume' });
      return {};
    }
    if (!force && s.pauseWhenPlaying && (status.userActiveUntil || 0) > now) {
      await setStatus({ state: 'paused', note: 'Paused while you play' });
      return {};
    }
    const jobs = planJobs(s, data, now, force);
    if (!jobs.length) {
      await setStatus({ state: 'idle', note: '' });
      return {};
    }

    const tabId = await ensureWorkerTab(s.server);
    for (const job of jobs) {
      await setStatus({ state: 'working', note: job.label });
      try {
        await JOBS[job.type](tabId, job, s);
      } catch (e) {
        if (e.loggedOut) break; // processPage already alerted
        await log('error', `${job.label}: ${e.message}`);
        if (s.alerts.botErrors) {
          const { alertMemo = {} } = await read(['alertMemo']);
          const key = `err:${job.type}`;
          if (Date.now() - (alertMemo[key] || 0) > 3600000) {
            await update(['alertMemo'], (d) => { d.alertMemo = { ...(d.alertMemo || {}), [key]: Date.now() }; });
            await sendAlert({ kind: 'botErrors', title: 'Travian Helper hit a problem', body: `${job.label}: ${e.message}` });
          }
        }
      }
      const { status: st = {} } = await read(['status']);
      if (st.loggedOut) break;
      if (!force && s.pauseWhenPlaying && (st.userActiveUntil || 0) > Date.now()) break;
      await sleep(rand(1200, 3500));
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
    await patchVillage(villageId, { buildRetryAt: 0 });
  },
  async removeTask({ villageId, taskId }) { await removeTask(villageId, taskId); },
  async moveTask({ villageId, taskId, delta }) {
    await update(['tasks'], (d) => {
      const list = (d.tasks || {})[villageId] || [];
      const i = list.findIndex((t) => t.id === taskId);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
    });
    await patchVillage(villageId, { buildRetryAt: 0 });
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
    tick(true);
  },
  async testAlert() {
    const s = await getSettings();
    if (s.alerts.desktop) {
      chrome.notifications.create(`tvh-test-${uid()}`, {
        type: 'basic', iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'Travian Helper test', message: 'Desktop notifications are working.',
      });
    }
    return sendRemote(s, 'Travian Helper test — notifications are working.');
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
