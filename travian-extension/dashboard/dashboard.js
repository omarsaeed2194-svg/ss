import { loadAll, command, villageCard, statusLine, esc } from '../src/ui.js';
import {
  sortedVillages, taskLabel, buildingName, fmtDuration, fmtAgo, fmtNum, TRAINING_BUILDINGS,
} from '../src/shared.js';

const $ = (id) => document.getElementById(id);
let data = null;
let buildVillageId = null;

// ------------------------------------------------------------------ tabs ---
function showTab() {
  const name = (location.hash || '#overview').slice(1);
  for (const a of document.querySelectorAll('.tabs a')) a.classList.toggle('active', a.dataset.tab === name);
  for (const s of document.querySelectorAll('.tab')) s.classList.toggle('active', s.id === `tab-${name}`);
}
window.addEventListener('hashchange', showTab);

// -------------------------------------------------------------- helpers ---
function fillSelect(sel, options, selected) {
  const sig = JSON.stringify(options);
  if (sel.dataset.sig !== sig) {
    const keep = selected ?? sel.value;
    sel.innerHTML = options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
    sel.dataset.sig = sig;
    if (options.some(([v]) => String(v) === String(keep))) sel.value = keep;
  } else if (selected != null && options.some(([v]) => String(v) === String(selected))) {
    sel.value = selected;
  }
}

const villageOptions = () => sortedVillages(data.villages).map((v) => [v.id, `${v.name} (${v.x}|${v.y})`]);
const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

// ------------------------------------------------------------- settings ---
function fillSettings() {
  for (const el of document.querySelectorAll('[data-setting]')) {
    if (el === document.activeElement && el.type !== 'checkbox') continue;
    const v = getPath(data.settings, el.dataset.setting);
    if (el.type === 'checkbox') el.checked = !!v;
    else el.value = v ?? '';
  }
}

async function saveSetting(el) {
  const path = el.dataset.setting.split('.');
  let value = el.type === 'checkbox' ? el.checked : el.value;
  if (el.type === 'number' || el.dataset.setting === 'maxQueue') {
    value = Number(value);
    if (!Number.isFinite(value)) return;
  }
  const top = path[0];
  const patch = path.length === 1 ? { [top]: value } : { [top]: { ...data.settings[top], [path[1]]: value } };
  data.settings = { ...data.settings, ...patch };
  await command('saveSettings', { settings: patch });
}

for (const el of document.querySelectorAll('[data-setting]')) {
  el.addEventListener('change', () => saveSetting(el));
}

// ------------------------------------------------------------- overview ---
function renderOverview(now) {
  const villages = sortedVillages(data.villages);
  const attacked = villages.filter((v) => v.underAttack).length;
  const hero = data.account.hero || {};
  const s = data.settings;
  const stats = [
    [villages.length, 'villages'],
    [attacked, 'under attack'],
    [fmtNum(data.account.gold), 'gold'],
    [fmtNum(data.account.silver), 'silver'],
    [hero.adventures ?? '—', `adventures · hero ${hero.home ? 'home' : 'away'}`],
  ];
  if (s.botEnabled && s.farm.enabled) stats.push([fmtDuration(Math.max(0, (data.schedule.farmAt || now) - now)), 'until farm lists']);
  $('summary').innerHTML = stats.map(([b, span]) => `<div class="stat"><b>${esc(b)}</b><span>${esc(span)}</span></div>`).join('');
  villages.sort((a, b) => Number(!!b.underAttack) - Number(!!a.underAttack));
  $('villageGrid').innerHTML = villages.length
    ? villages.map((v) => villageCard(v, data, now)).join('')
    : '<div class="panel muted">No villages yet. Log in to Travian in this browser, or press “Check now”.</div>';
}

// ---------------------------------------------------------------- build ---
function upgradeTable(items, v, kind) {
  if (!items || !items.length) {
    return `<tr><td class="muted">${kind === 'fields' ? 'Not scanned yet.' : 'Not scanned yet — runs automatically every few hours, or press “Check now”.'}</td></tr>`;
  }
  const rows = items.slice().sort((a, b) => a.slot - b.slot).map((b) => {
    const name = buildingName(b.gid, b.name);
    const tag = b.underConstruction ? '<span class="tag busy">upgrading</span>' : b.maxLevel ? '<span class="tag">max</span>' : '';
    return `<tr>
      <td class="muted">${b.slot}</td>
      <td>${esc(name)} ${tag}</td>
      <td class="mono">${b.level}</td>
      <td class="actions">${b.maxLevel ? '' : `to <input type="number" class="num" min="${b.level + 1}" max="21" value="${b.level + 1}" data-target="${b.slot}">
        <button class="btn small" data-add-slot="${b.slot}" data-name="${esc(name)}">Queue</button>`}</td>
    </tr>`;
  }).join('');
  return `<tr><th>Slot</th><th>${kind === 'fields' ? 'Field' : 'Building'}</th><th>Level</th><th></th></tr>${rows}`;
}

function renderBuild(now) {
  fillSelect($('buildVillage'), villageOptions(), buildVillageId);
  buildVillageId = $('buildVillage').value || null;
  const v = data.villages[buildVillageId];
  if (!v) {
    $('taskList').innerHTML = '<li class="empty muted">No villages yet.</li>';
    $('fieldTable').innerHTML = '';
    $('buildingTable').innerHTML = '';
    return;
  }
  const tasks = data.tasks[v.id] || [];
  const retry = v.buildRetryAt && v.buildRetryAt > now ? ` · next try in ${fmtDuration(v.buildRetryAt - now)}` : '';
  $('buildScan').textContent = `Fields ${fmtAgo(v.fieldsAt, now)} · buildings ${fmtAgo(v.buildingsAt, now)}${retry}`;
  $('taskList').innerHTML = tasks.length
    ? tasks.map((t) => `<li>
        <span class="label">${esc(taskLabel(t, v))}</span>
        ${t.attempts ? '<span class="tag busy">waiting</span>' : ''}
        <button class="btn small" data-move="-1" data-task="${t.id}" title="Move up">↑</button>
        <button class="btn small" data-move="1" data-task="${t.id}" title="Move down">↓</button>
        <button class="btn small danger" data-remove-task="${t.id}" title="Remove">✕</button>
      </li>`).join('')
    : '<li class="empty muted">Nothing queued. Pick upgrades from the tables, or add an auto-upgrade below.</li>';

  if (!$('fieldTable').contains(document.activeElement)) $('fieldTable').innerHTML = upgradeTable(v.fields, v, 'fields');
  const buildings = (v.buildings || []).filter((b) => b.gid > 0);
  if (!$('buildingTable').contains(document.activeElement)) $('buildingTable').innerHTML = upgradeTable(v.buildings ? buildings : null, v, 'buildings');
}

$('buildVillage').addEventListener('change', (e) => { buildVillageId = e.target.value; render(); });
$('addFieldsTask').addEventListener('click', () => {
  if (!buildVillageId) return;
  const targetLevel = Number($('fieldsLevel').value);
  if (!(targetLevel >= 1)) return;
  command('addTask', { villageId: buildVillageId, task: { kind: 'fields', resource: $('fieldsResource').value, targetLevel } });
});
document.getElementById('tab-build').addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t || !buildVillageId) return;
  if (t.dataset.addSlot) {
    const slot = Number(t.dataset.addSlot);
    const input = t.parentElement.querySelector(`[data-target="${slot}"]`);
    const targetLevel = Number(input && input.value);
    if (!(targetLevel >= 1)) return;
    command('addTask', { villageId: buildVillageId, task: { kind: 'upgrade', slot, targetLevel, name: t.dataset.name } });
  } else if (t.dataset.move) {
    command('moveTask', { villageId: buildVillageId, taskId: t.dataset.task, delta: Number(t.dataset.move) });
  } else if (t.dataset.removeTask) {
    command('removeTask', { villageId: buildVillageId, taskId: t.dataset.removeTask });
  }
});

// --------------------------------------------------------------- troops ---
function unitOptions(v, gid) {
  const known = v && v.units && v.units[gid];
  if (known && known.length) return known.map((u) => [u.field, `${u.name || u.field} (${u.field})`]);
  return Array.from({ length: 10 }, (_, i) => [`t${i + 1}`, `Unit ${i + 1} (t${i + 1})`]);
}

function unitName(rule) {
  const v = data.villages[rule.villageId];
  const u = v && v.units && v.units[rule.gid] && v.units[rule.gid].find((x) => x.field === rule.troop);
  return u && u.name ? u.name : `Unit ${rule.troop.slice(1)}`;
}

function renderTroops(now) {
  fillSelect($('trainVillage'), villageOptions());
  fillSelect($('trainBuilding'), Object.entries(TRAINING_BUILDINGS).map(([gid, n]) => [gid, n]));
  const v = data.villages[$('trainVillage').value];
  fillSelect($('trainUnit'), unitOptions(v, $('trainBuilding').value));

  const rules = data.training;
  $('trainTable').innerHTML = rules.length
    ? `<tr><th>Village</th><th>Building</th><th>Unit</th><th>Amount</th><th>Every</th><th>Next run</th><th>On</th><th></th></tr>` +
      rules.map((r) => {
        const village = data.villages[r.villageId];
        const next = r.nextAt && r.nextAt > now ? fmtDuration(r.nextAt - now) : 'due';
        return `<tr>
          <td>${esc(village ? village.name : '(gone)')}</td>
          <td>${esc(TRAINING_BUILDINGS[r.gid] || buildingName(r.gid))}</td>
          <td>${esc(unitName(r))}</td>
          <td class="mono">${r.amount}</td>
          <td class="mono">${r.everyMinutes} min</td>
          <td class="mono">${r.enabled === false ? '—' : next}</td>
          <td><label class="switch"><input type="checkbox" data-toggle-rule="${r.id}" ${r.enabled === false ? '' : 'checked'}></label></td>
          <td class="actions"><button class="btn small danger" data-remove-rule="${r.id}">✕</button></td>
        </tr>`;
      }).join('')
    : '<tr><td class="muted">No training rules yet.</td></tr>';
}

$('trainVillage').addEventListener('change', render);
$('trainBuilding').addEventListener('change', render);
$('addTrain').addEventListener('click', () => {
  const rule = {
    villageId: $('trainVillage').value,
    gid: Number($('trainBuilding').value),
    troop: $('trainUnit').value,
    amount: Number($('trainAmount').value),
    everyMinutes: Number($('trainEvery').value),
  };
  if (!rule.villageId || !(rule.amount >= 1) || !(rule.everyMinutes >= 5)) return;
  command('addTraining', { rule });
});
$('trainTable').addEventListener('change', (e) => {
  const id = e.target.dataset.toggleRule;
  if (id) command('updateTraining', { id, patch: { enabled: e.target.checked, nextAt: 0 } });
});
$('trainTable').addEventListener('click', (e) => {
  const b = e.target.closest('[data-remove-rule]');
  if (b) command('removeTraining', { id: b.dataset.removeRule });
});

// ---------------------------------------------------------- farms & hero ---
function renderRaids(now) {
  fillSelect($('farmVillage'), [['', 'Whichever village is active'], ...villageOptions()], data.settings.farm.villageId);
  const lists = data.account.farmLists || [];
  const chosen = new Set((data.settings.farm.listIds || []).map(String));
  $('farmLists').innerHTML = lists.length
    ? lists.map((l) => `<label class="switch"><input type="checkbox" data-farm-list="${esc(l.id)}" ${chosen.has(String(l.id)) ? 'checked' : ''}> <span>${esc(l.name || `List ${l.id}`)}</span></label>`).join('')
    : '<p class="muted small">No farm lists seen yet.</p>';

  const hero = data.account.hero || {};
  const items = [
    ['Status', hero.home ? 'Home' : 'Away / moving'],
    ['Adventures available', hero.adventures ?? '—'],
    ['Last seen', fmtAgo(data.account.updatedAt, now)],
  ];
  if (data.settings.adventure.enabled) items.push(['Next check', fmtDuration(Math.max(0, (data.schedule.adventureAt || now) - now))]);
  $('heroInfo').innerHTML = items.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
}

$('farmLists').addEventListener('change', () => {
  const ids = Array.from(document.querySelectorAll('[data-farm-list]:checked')).map((el) => el.dataset.farmList);
  const farm = { ...data.settings.farm, listIds: ids };
  data.settings = { ...data.settings, farm };
  command('saveSettings', { settings: { farm } });
});

// -------------------------------------------------------------- alerts ---
$('testAlert').addEventListener('click', async () => {
  $('testResult').textContent = 'Sending…';
  try {
    const r = await command('testAlert');
    if (!r.sent) $('testResult').textContent = 'Desktop test sent. Add Telegram or Discord details to test phone alerts.';
    else if (r.failed.length) $('testResult').textContent = `Failed: ${r.failed.join(', ')}`;
    else $('testResult').textContent = `Sent to ${r.sent} phone channel${r.sent > 1 ? 's' : ''}.`;
  } catch (e) {
    $('testResult').textContent = e.message;
  }
});

// ------------------------------------------------------------ settings ---
$('resetData').addEventListener('click', () => {
  if (confirm('Forget all stored village data? Your build queue, training rules and settings are kept.')) command('resetData');
});

// ------------------------------------------------------------------ log ---
function renderLog() {
  const names = Object.fromEntries(Object.values(data.villages).map((v) => [v.id, v.name]));
  $('logList').innerHTML = data.log.length
    ? data.log.map((e) => `<li>
        <span class="muted mono">${new Date(e.t).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        <span class="lvl ${esc(e.level)}">${esc(e.level)}</span>
        <span>${e.villageId && names[e.villageId] ? `<b>${esc(names[e.villageId])}:</b> ` : ''}${esc(e.msg)}</span>
      </li>`).join('')
    : '<li class="muted">Nothing yet.</li>';
}
$('clearLog').addEventListener('click', () => command('clearLog'));

// --------------------------------------------------------------- render ---
$('checkNow').addEventListener('click', async (e) => {
  e.target.disabled = true;
  await command('runNow');
  setTimeout(() => { e.target.disabled = false; }, 3000);
});

function renderTicking(now) {
  const st = statusLine(data, now);
  $('status').className = `status ${st.tone}`;
  $('status').textContent = st.text;
  renderOverview(now);
}

function render() {
  if (!data) return;
  const now = Date.now();
  $('server').textContent = data.settings.server ? new URL(data.settings.server).host : 'No server yet';
  $('serverFull').textContent = data.settings.server || 'Not detected yet';
  renderTicking(now);
  renderBuild(now);
  renderTroops(now);
  renderRaids(now);
  renderLog();
  fillSettings();
}

async function reload() {
  data = await loadAll();
  render();
}

chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local') reload(); });
setInterval(() => { if (data) renderTicking(Date.now()); }, 1000);
showTab();
reload();
