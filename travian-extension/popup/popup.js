import { loadAll, command, villageCard, statusLine, esc } from '../src/ui.js';
import { sortedVillages, fmtNum } from '../src/shared.js';
import { t, applyI18n } from '../src/i18n.js';

const $ = (id) => document.getElementById(id);
let data = null;
let lang = null;

function render() {
  if (!data) return;
  const now = Date.now();
  const s = data.settings;
  if (lang !== s.language) {
    lang = s.language;
    applyI18n();
    document.title = t('app.name');
  }
  $('server').textContent = s.server ? new URL(s.server).host : t('server.none');
  $('gold').textContent = data.account.gold != null ? t('gold', { n: fmtNum(data.account.gold) }) : '';
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
    : `<div class="empty muted">${esc(t(s.server ? 'popup.emptyNoVillages' : 'popup.emptyNoServer'))}</div>`;
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
