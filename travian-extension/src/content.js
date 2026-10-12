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
      input.focus();
      input.value = String(amount);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
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
