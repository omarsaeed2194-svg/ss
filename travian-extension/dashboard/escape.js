// Troops tab: escape plans — which village's troops leave when an attack
// comes, where to, and how long before it lands.
import { command, esc, fillSelect, escapeStatus } from '../src/ui.js';
import { sortedVillages } from '../src/shared.js';
import { unitField } from '../src/autopilot.js';
import { t, coords } from '../src/i18n.js';

const $ = (id) => document.getElementById(id);
const FIELDS = Array.from({ length: 10 }, (_, i) => `t${i + 1}`);
let data = null;
let formVillage = null; // village whose plan the form shows

const planOf = (vid) => (data.escapes || []).find((p) => p.villageId === vid) || null;

function unitNames(v) {
  const names = {};
  for (const x of (v && v.troops) || []) { const f = unitField(x.unit); if (f && f !== 't11') names[f] = x.name; }
  for (const list of Object.values((v && v.units) || {})) for (const u of list) if (!names[u.field] && u.name) names[u.field] = u.name;
  return names;
}
const unitLabel = (names, f) => names[f] || t('troops.unitN', { n: f.slice(1) });

function renderTable(now) {
  const head = ['escape.village', 'escape.to', 'escape.units', 'escape.leadShort', 'th.status', 'th.on'].map((k) => `<th>${esc(t(k))}</th>`).join('');
  const rows = (data.escapes || []).map((p) => {
    const v = data.villages[p.villageId];
    if (!v) return '';
    const names = unitNames(v);
    const st = escapeStatus(v, p, data.villages, now) || { tone: 'muted', text: t('escape.st.off') };
    const to = p.targetVillageId && data.villages[p.targetVillageId] ? data.villages[p.targetVillageId].name : t('escape.nearest');
    const units = Array.isArray(p.units) ? p.units.map((f) => unitLabel(names, f)).join(t('list.sep')) : t('escape.allUnits');
    return `<tr class="${p.enabled === false ? 'off' : ''}">
      <td>${v.underAttack ? '⚔ ' : ''}${esc(v.name)}</td>
      <td>${esc(to)}</td>
      <td>${esc(units)}${p.hero ? ` <span class="tag">${esc(t('escape.heroTag'))}</span>` : ''}</td>
      <td class="mono">${esc(t('escape.leadValue', { n: p.leadSeconds }))}</td>
      <td class="${st.tone === 'bad' ? 'bad' : st.tone === 'good' ? 'good-text' : st.tone === 'warn' ? 'warn' : 'muted'}">${esc(st.text)}</td>
      <td><label class="switch"><input type="checkbox" data-esc-toggle="${esc(p.id)}" ${p.enabled === false ? '' : 'checked'}></label></td>
      <td class="actions">
        <button class="btn small" data-esc-edit="${esc(p.villageId)}" title="${esc(t('farm.edit'))}">✎</button>
        <button class="btn small danger" data-esc-remove="${esc(p.id)}" title="${esc(t('build.remove'))}">✕</button>
      </td>
    </tr>`;
  }).join('');
  if (!$('escapeTable').contains(document.activeElement)) {
    $('escapeTable').innerHTML = rows ? `<tr>${head}<th></th></tr>${rows}` : `<tr><td class="muted">${esc(t('escape.none'))}</td></tr>`;
  }
}

// Show a village's plan (or defaults) in the form.
function loadForm(vid) {
  formVillage = vid;
  const p = planOf(vid);
  $('escLead').value = p ? p.leadSeconds : 120;
  $('escHero').checked = !!(p && p.hero);
  $('escAll').checked = !p || !Array.isArray(p.units);
  $('escTarget').dataset.want = p ? p.targetVillageId : '';
  $('escUnits').dataset.want = p && Array.isArray(p.units) ? p.units.join(',') : '';
  $('escUnits').dataset.sig = '';
}

function renderForm() {
  const villages = sortedVillages(data.villages);
  fillSelect($('escVillage'), villages.map((v) => [v.id, `${v.name} ${coords(v.x, v.y)}`]), formVillage);
  const vid = $('escVillage').value;
  if (vid !== formVillage) loadForm(vid);
  const v = data.villages[vid];
  fillSelect($('escTarget'), [['', t('escape.nearest')], ...villages.filter((o) => o.id !== vid).map((o) => [o.id, `${o.name} ${coords(o.x, o.y)}`])], $('escTarget').dataset.want);
  $('escTarget').dataset.want = $('escTarget').value;
  $('escFormTitle').textContent = planOf(vid) ? t('escape.editTitle', { v: v ? v.name : '' }) : t('escape.add');

  // Unit choice, only when "all units" is off.
  $('escUnits').hidden = $('escAll').checked;
  const names = unitNames(v);
  const sig = JSON.stringify([vid, names, data.settings.language]);
  if ($('escUnits').dataset.sig !== sig) {
    const want = new Set(($('escUnits').dataset.want || Array.from(document.querySelectorAll('#escUnits input:checked')).map((el) => el.value).join(',')).split(',').filter(Boolean));
    $('escUnits').dataset.sig = sig;
    $('escUnits').innerHTML = FIELDS.map((f) => `<label class="switch"><input type="checkbox" value="${f}" ${want.has(f) ? 'checked' : ''}> <span>${esc(unitLabel(names, f))}</span></label>`).join('');
  }

  // Escapes need the village checks running.
  const warns = [];
  if (!data.settings.watchEnabled) warns.push(t('escape.warnWatch'));
  if (villages.length < 2) warns.push(t('escape.warnOneVillage'));
  $('escWarn').hidden = !warns.length;
  $('escWarn').textContent = warns.join(' ');
}

export function renderEscapes(d, now) {
  data = d;
  renderTable(now);
  renderForm();
}

const rerender = () => window.dispatchEvent(new CustomEvent('tvh:rerender-all'));
const msg = (text, tone) => { $('escMsg').textContent = text; $('escMsg').className = `small ${tone === 'bad' ? 'bad' : tone === 'good' ? 'good-text' : 'muted'}`; };

$('escVillage').addEventListener('change', () => { loadForm($('escVillage').value); msg(''); rerender(); });
$('escTarget').addEventListener('change', () => { $('escTarget').dataset.want = $('escTarget').value; });
$('escAll').addEventListener('change', () => { $('escUnits').hidden = $('escAll').checked; });

$('escSave').addEventListener('click', async () => {
  const plan = {
    villageId: $('escVillage').value,
    targetVillageId: $('escTarget').value,
    leadSeconds: Number($('escLead').value),
    hero: $('escHero').checked,
    units: $('escAll').checked ? 'all' : Array.from(document.querySelectorAll('#escUnits input:checked')).map((el) => el.value),
    enabled: true,
  };
  try {
    await command('saveEscape', { plan });
    msg(t('ov.done'), 'good');
  } catch (err) {
    msg(err.message, 'bad');
  }
});

$('escapeTable').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.escEdit) { loadForm(b.dataset.escEdit); $('escVillage').value = b.dataset.escEdit; rerender(); }
  else if (b.dataset.escRemove) command('removeEscape', { id: b.dataset.escRemove });
});
$('escapeTable').addEventListener('change', (e) => {
  const id = e.target.dataset.escToggle;
  if (id) command('updateEscape', { id, patch: { enabled: e.target.checked } });
});
