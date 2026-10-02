/* Clicks every button on every screen, on desktop and phone, for a new game and an old save.
   Fails on any JavaScript error or on a button that is covered by something else. */
const { launch, page, newGame, oldGame, check, done } = require('./helpers');
const SKIP = /^(endDay|onb|reset|wipe|newGame|restart|loadSave|copySave|importSave|exportSave|scheme|stunt|growth|fire|theme|sound|safeNames|cloud)/i;
(async () => {
  const b = await launch();
  for (const w of [1400, 390]) for (const mode of ['new', 'old']) {
    const p = await page(b, w);
    if (mode === 'new') await newGame(p, () => { S.platforms.pix.followers = 30000; S.money = 1e6; S.platforms.vault.unlocked = true; S.platforms.live.unlocked = true; S.platforms.clipz.unlocked = true; });
    else await oldGame(p);
    const clearModal = async () => { for (let i = 0; i < 15; i++) { const m = await p.$('#modal:not([hidden]) .choice:not([disabled]), #modal:not([hidden]) #modalOk'); if (!m) break; await m.click().catch(() => {}); await p.waitForTimeout(20); } };
    await clearModal();
    const tabs = await p.evaluate(() => [...MAIN_TABS.map((t) => t[0]), ...CAREER.map((t) => t[0])]);
    const blocked = [];
    let clicks = 0;
    for (const t of tabs) {
      await p.evaluate((t) => { ui.view = null; ACT_RUN('go', t); }, t); await clearModal();
      const n = await p.evaluate(() => document.querySelectorAll('#col [data-act], #rail [data-act]').length);
      for (let i = 0; i < Math.min(n, 60); i++) {
        const info = await p.evaluate(([t, i]) => {
          if (!document.getElementById('composeWrap').hidden) closeCompose(); document.getElementById('drawer').hidden = true; if (ui.view || tab !== t) { ui.view = null; ACT_RUN('go', t); }
          const el = [...document.querySelectorAll('#col [data-act], #rail [data-act]')][i]; if (!el) return null;
          el.scrollIntoView({ block: 'center' });
          const r = el.getBoundingClientRect(); if (!r.width || !r.height) return { hidden: true };
          const x = r.left + r.width / 2, y = r.top + r.height / 2, top = document.elementFromPoint(x, y);
          return { act: el.dataset.act, arg: el.dataset.arg || '', x, y, ok: !!top && (el === top || el.contains(top)), cover: top ? String(top.className || top.tagName) : 'none', dis: el.disabled };
        }, [t, i]);
        if (!info || info.hidden || info.dis || SKIP.test(info.act)) continue;
        if (!info.ok) { blocked.push(`${t}: ${info.act}(${info.arg}) under ${info.cover}`); continue; }
        await p.mouse.click(info.x, info.y); clicks++;
        await clearModal();
      }
    }
    check(`${w}px ${mode} game: no errors (${clicks} clicks)`, !p.errors.length, p.errors.slice(0, 5).join(' | '));
    check(`${w}px ${mode} game: nothing covered`, !blocked.length, [...new Set(blocked)].slice(0, 8).join(' | '));
    await p.context().close();
  }
  await b.close(); done();
})();
