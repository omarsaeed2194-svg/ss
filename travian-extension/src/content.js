// Runs on every Travian page. Reports what the page shows to the background
// worker, and performs clicks the background asks for on the bot tab.
(() => {
  'use strict';
  const P = globalThis.TravianParser;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);

  async function waitFor(fn, timeout = 8000, step = 250) {
    const end = Date.now() + timeout;
    for (;;) {
      const v = fn();
      if (v || Date.now() > end) return v;
      await sleep(step);
    }
  }

  async function report() {
    const url = new URL(location.href);
    // These two pages are rendered client-side after load.
    if (url.pathname.startsWith('/hero/adventures')) {
      await waitFor(() => document.querySelector('#heroAdventure tbody tr'));
    }
    if (url.searchParams.get('tt') === '99') {
      await waitFor(() => document.querySelector('#rallyPointFarmList .farmListHeader'));
    }
    const state = P.parsePage(document, location.href);
    if (state.type === 'unknown') return;
    try {
      const res = await chrome.runtime.sendMessage({ type: 'PAGE', state });
      if (res && res.worker) showWorkerBadge(res.badge);
    } catch (e) {
      // Extension reloaded or worker unavailable; nothing to do.
    }
  }

  // Only real clicks and key presses mean the player is here. Page loads
  // don't: the game reloads itself whenever a build or troop timer ends.
  let lastActivePing = 0;
  function onUserInput(e) {
    if (!e.isTrusted || Date.now() - lastActivePing < 20000) return;
    lastActivePing = Date.now();
    chrome.runtime.sendMessage({ type: 'USER_ACTIVE' }).catch(() => {});
  }
  window.addEventListener('pointerdown', onUserInput, { capture: true, passive: true });
  window.addEventListener('keydown', onUserInput, { capture: true, passive: true });

  function showWorkerBadge(label) {
    if (document.getElementById('tvh-worker-badge')) return;
    const el = document.createElement('div');
    el.id = 'tvh-worker-badge';
    el.textContent = label || 'Travian Helper';
    el.style.cssText = 'position:fixed;inset-inline-start:12px;bottom:12px;z-index:99999;padding:6px 10px;border-radius:6px;' +
      'background:#1f2937;color:#fff;font:12px/1.3 system-ui,sans-serif;opacity:.85;pointer-events:none';
    document.body.appendChild(el);
  }

  const usable = (b) => b && !b.disabled && !b.classList.contains('disabled');

  function setValue(input, value) {
    input.focus();
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // The game version the map API expects in its X-Version header.
  function gameVersion() {
    for (const s of document.querySelectorAll('script:not([src])')) {
      const m = s.textContent.match(/Travian\.Game\.version\s*=\s*['"]([^'"]+)['"]/) ||
        s.textContent.match(/["']?gameVersion["']?\s*[:=]\s*['"]([^'"]+)['"]/);
      if (m) return m[1];
    }
    return null;
  }

  const troopInput = (root, field) =>
    Array.from(root.querySelectorAll('input[name^="troop["], input[name^="troops["]'))
      .find((i) => i.type !== 'hidden' && i.getAttribute('name').endsWith(`[${field}]`));

  const actions = {
    async upgrade() {
      const btn = document.querySelector('.upgradeButtonsContainer .section1 button.build') ||
        document.querySelector('.upgradeButtonsContainer button.green.build');
      if (!usable(btn)) return { ok: false, code: 'noUpgradeButton' };
      setTimeout(() => btn.click(), 50);
      return { ok: true, navigating: true };
    },

    async train({ field, amount }) {
      if (!/^t\d+$/.test(field)) return { ok: false, code: 'badField' };
      const input = document.querySelector(`.troop:not(.empty) .cta input.text[name="${field}"]`);
      const submit = document.getElementById('s1');
      if (!input || !usable(submit)) return { ok: false, code: 'noTrainForm' };
      setValue(input, amount);
      await sleep(rand(300, 800));
      setTimeout(() => submit.click(), 50);
      return { ok: true, navigating: true };
    },

    async farm({ ids }) {
      const root = await waitFor(() => document.getElementById('rallyPointFarmList'));
      if (!root) return { ok: false, code: 'noFarmPage' };
      let buttons;
      let startedAll = false;
      if (ids && ids.length) {
        buttons = ids.map((id) => {
          const marker = root.querySelector(`[data-list="${CSS.escape(String(id))}"]`);
          const header = marker && marker.closest('.farmListHeader');
          return header && header.querySelector('button.startFarmList');
        });
      } else {
        const all = root.querySelector('button.startAllFarmLists');
        startedAll = usable(all);
        buttons = startedAll ? [all] : Array.from(root.querySelectorAll('button.startFarmList'));
      }
      buttons = buttons.filter(usable);
      if (!buttons.length) return { ok: false, code: 'noFarmStart' };
      for (const b of buttons) {
        b.click();
        await sleep(rand(900, 1800));
      }
      await sleep(1500);
      return { ok: true, started: startedAll ? 'all' : buttons.length };
    },

    // Rally point: fill the "send troops" form as a raid and press Send.
    async raidForm({ x, y, field, amount }) {
      if (!/^t\d+$/.test(field) || !Number.isInteger(x) || !Number.isInteger(y) || !(amount >= 1)) return { ok: false, code: 'badField' };
      const input = troopInput(document, field);
      const form = input && input.closest('form');
      if (!form || input.disabled) return { ok: false, code: 'noUnitInput' };
      const xIn = form.querySelector('input[name="x"], #xCoordInput');
      const yIn = form.querySelector('input[name="y"], #yCoordInput');
      if (!xIn || !yIn) return { ok: false, code: 'noCoordInput' };
      const raid = form.querySelector('input[type="radio"][name="eventType"][value="4"], input[type="radio"][name="c"][value="4"]');
      if (!raid) return { ok: false, code: 'noRaidOption' };
      // Only the chosen unit goes; clear anything else that was pre-filled.
      for (const other of form.querySelectorAll('input[name^="troop["], input[name^="troops["]')) {
        if (other !== input && other.type !== 'hidden' && other.value) setValue(other, '');
      }
      setValue(input, amount);
      await sleep(rand(200, 500));
      setValue(xIn, x);
      setValue(yIn, y);
      raid.click();
      if (!raid.checked) { raid.checked = true; raid.dispatchEvent(new Event('change', { bubbles: true })); }
      const btn = form.querySelector('button#ok, button#btn_ok, button[type="submit"][name="ok"], button[type="submit"][name="s1"]') ||
        form.querySelector('button[type="submit"]');
      if (!usable(btn)) return { ok: false, code: 'noSendButton' };
      await sleep(rand(400, 900));
      setTimeout(() => btn.click(), 50);
      return { ok: true, navigating: true };
    },

    // Confirmation page: only confirm when it names our target and is a raid.
    async raidConfirm({ x, y }) {
      const info = P.parseSendPage(document);
      if (info.stage !== 'confirm') return { ok: false, code: 'noConfirmPage' };
      if (!info.targets.some((p) => p.x === x && p.y === y)) return { ok: false, code: 'targetMismatch' };
      if (info.eventType != null && info.eventType !== 4) return { ok: false, code: 'notRaid' };
      const details = document.querySelector('table.troop_details');
      const form = details && details.closest('form');
      const btn = document.querySelector('#confirmSendTroops, button#btn_ok, button.rallyPointConfirm, .rallyPointConfirm button[type="submit"]') ||
        (form && form.querySelector('button[type="submit"]'));
      if (!usable(btn)) return { ok: false, code: 'noConfirmButton' };
      await sleep(rand(500, 1200));
      setTimeout(() => btn.click(), 50);
      return { ok: true, navigating: true };
    },

    // Oases around a point, from the same map API the game's map uses.
    async scanMap({ x, y }) {
      const headers = { 'Content-Type': 'application/json; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' };
      const version = gameVersion();
      if (version) headers['X-Version'] = version;
      let res;
      try {
        res = await fetch('/api/v1/map/position', {
          method: 'POST', credentials: 'same-origin', headers,
          body: JSON.stringify({ data: { x, y, zoomLevel: 3, ignorePositions: [] } }),
        });
      } catch (e) {
        return { ok: false, code: 'mapApi' };
      }
      if (!res.ok) return { ok: false, code: 'mapApi', status: res.status };
      const json = await res.json().catch(() => null);
      const tiles = (json && (json.tiles || (json.response && json.response.tiles))) || [];
      return { ok: true, tiles: tiles.length, oases: P.oasesFromTiles(tiles) };
    },

    async adventure() {
      const btn = await waitFor(() => document.querySelector('#heroAdventure tbody tr button:not([disabled])'));
      if (!btn) return { ok: false, code: 'noAdventure' };
      const cells = btn.closest('tr') ? btn.closest('tr').querySelectorAll('td') : [];
      const where = cells[1] ? cells[1].textContent.replace(/[‪-‮]/g, '').trim() : '';
      btn.click();
      const cont = await waitFor(() => document.querySelector('button.continue'), 3000);
      if (cont) cont.click();
      await sleep(1000);
      return { ok: true, detail: where };
    },
  };

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || msg.type !== 'ACTION') return undefined;
    const fn = actions[msg.action && msg.action.kind];
    if (!fn) {
      sendResponse({ ok: false, code: 'unknownAction' });
      return undefined;
    }
    sleep(rand(400, 1200))
      .then(() => fn(msg.action))
      .then(sendResponse, (e) => sendResponse({ ok: false, reason: e.message }));
    return true;
  });

  report();
})();
