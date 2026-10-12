import { loadAll, command, villageCard, statusLine, esc } from '../src/ui.js';
import { sortedVillages, fmtNum } from '../src/shared.js';

const $ = (id) => document.getElementById(id);
let data = null;

function render() {
  if (!data) return;
  const now = Date.now();
  const s = data.settings;
  $('server').textContent = s.server ? new URL(s.server).host : 'No server yet';
  $('gold').textContent = data.account.gold != null ? `${fmtNum(data.account.gold)} gold` : '';
  $('watch').checked = s.watchEnabled;
  $('bot').checked = s.botEnabled;
  const st = statusLine(data, now);
  $('status').className = `status ${st.tone}`;
  $('status').textContent = st.text;

  const villages = sortedVillages(data.villages);
  // Attacked villages first.
  villages.sort((a, b) => Number(!!b.underAttack) - Number(!!a.underAttack));
  $('villages').innerHTML = villages.length
    ? villages.map((v) => villageCard(v, data, now)).join('')
    : `<div class="empty muted">${esc(s.server ? 'No villages seen yet. Click “Check now”.' : 'Log in to Travian in this browser — your villages will appear here.')}</div>`;
}

async function reload() {
  data = await loadAll();
  render();
}

$('watch').addEventListener('change', (e) => command('saveSettings', { settings: { watchEnabled: e.target.checked } }));
$('bot').addEventListener('change', (e) => command('saveSettings', { settings: { botEnabled: e.target.checked } }));
$('checkNow').addEventListener('click', async (e) => {
  e.target.disabled = true;
  await command('runNow');
  setTimeout(() => { e.target.disabled = false; }, 3000);
});
$('openDashboard').addEventListener('click', () => chrome.runtime.openOptionsPage());
$('openGame').addEventListener('click', () => {
  const url = data && data.settings.server ? `${data.settings.server}/dorf1.php` : 'https://www.travian.com/';
  chrome.tabs.create({ url });
});

chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local') reload(); });
setInterval(render, 1000);
reload();
