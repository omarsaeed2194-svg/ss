/* Feature checks: finance, staff, FanVault, Arena, career path, unlocks, store-safe names, economy and save upgrades. */
const { launch, page, newGame, oldGame, check, done } = require('./helpers');
(async () => {
  const b = await launch();
  const p = await page(b);

  // new player: a guided path and a short menu
  await newGame(p);
  let r = await p.evaluate(() => ({ hubs: HUBS.filter(hubOpen).map((h) => h[0]), goal: careerGoal().t, bank: featureOn('bank') }));
  check('new game starts on the first career goal', r.goal === 'Make your first post', r.goal);
  check('advanced screens start locked', !r.bank && !r.hubs.includes('play'), r.hubs.join(','));
  r = await p.evaluate(() => { S.stats.posts = 1; const m = S.money; ACT_RUN('careerClaim'); return { paid: S.money - m, next: careerGoal().t }; });
  check('claiming a goal pays and advances', r.paid === 50 && r.next === 'Reach 100 followers', JSON.stringify(r));
  r = await p.evaluate(() => { S.platforms.pix.followers = 6000; checkAll(); return ['invest', 'team', 'arena', 'bank', 'acquire'].every(featureOn); });
  check('screens unlock as followers grow', r);

  // finance, staff, FanVault and Arena over several nights
  r = await p.evaluate(() => {
    S.platforms.pix.followers = 2e7; S.money = 5e7; S.platforms.vault.unlocked = true; S.platforms.vault.followers = 3000;
    ACT_RUN('loanTake', String(Math.min(50000, loanLimit()))); ACT_RUN('propBuy', 'loft:1'); ACT_RUN('propBuy', 'block:0');
    ACT_RUN('acqBuy', 'cafe:1.00:0'); ACT_RUN('acqBuy', 'records:0.51:1'); ACT_RUN('shortOpen', 'dogb:10000'); ACT_RUN('buy$', 'bond:100000');
    ['ceo', 'cfo', 'fundmgr', 'risk'].forEach((k) => ACT_RUN('hire', k)); ACT_RUN('hireDept', 'care');
    ACT_RUN('fvTier', 'vip'); ACT_RUN('fvPromo', 'bundle'); ACT_RUN('fvMass', '1');
    for (let i = 0; i < 10; i++) { endDay(); S.queue = []; }
    const f = S.book.fx.filter((x) => !x.done); ACT_RUN('parlayAdd', f[0].id + ':h'); ACT_RUN('parlayAdd', f[1].id + ':o'); ACT_RUN('parlayPlace', '1000');
    const fb = fightCard().bouts[0]; ACT_RUN('fightBet', fb.id + ':a:1000'); ACT_RUN('horsePick', '1'); ACT_RUN('horseBet', '1000');
    ACT_RUN('bjDeal', '1000'); if (S.bj.state === 'play') ACT_RUN('bjStand'); ACT_RUN('scrBuy', '0'); ACT_RUN('scrAll');
    endDay(); S.queue = [];
    return { loans: S.bank.loans.length, props: Object.keys(S.bank.props).length, cos: Object.keys(S.acq.own).length, staff: teamSize(), vhist: S.vault.hist.length, bets: (S.betLog || []).length, nw: netWorth() };
  });
  check('bank, property and companies work', r.loans >= 2 && r.props === 2 && r.cos === 2, JSON.stringify(r));
  check('enterprise staff hire', r.staff >= 9, 'staff ' + r.staff);
  check('FanVault keeps daily analytics', r.vhist >= 10, 'days ' + r.vhist);
  check('every Arena game logs to bet history', r.bets >= 5, 'bets ' + r.bets);

  // house edges stay where they should be
  r = await p.evaluate(() => {
    S.money = 1e10; let s = 0, back = 0;
    for (let i = 0; i < 20000; i++) { buyScratch(0); S.scratch.open.forEach((o, k) => scratchCell(k)); s += 5; back += S.scratch.price * S.scratch.mult; }
    let bs = 0, bb = 0; for (let i = 0; i < 20000; i++) { bjDeal(100); while (S.bj.state === 'play' && handVal(S.bj.p) < 17) ACT.bjHit(); if (S.bj.state === 'play') bjFinish(); bs += S.bj.bet; bb += S.bj.ret; }
    return { scratch: back / s, bj: bb / bs };
  });
  check('scratch cards return 60–95%', r.scratch > 0.6 && r.scratch < 0.95, r.scratch.toFixed(3));
  check('blackjack returns 90–100%', r.bj > 0.9 && r.bj < 1, r.bj.toFixed(3));

  // the late-game economy should grow, but not explode
  r = await p.evaluate(() => {
    S.money = 2e8; S.team = {}; ['duplex', 'beach', 'hotel'].forEach((k) => buyProp(k, false)); ['salon', 'kicks', 'gym', 'club', 'agency'].forEach((k) => buyStake(k, 1, false)); buyAsset('c500', 2e7);
    const a = netWorth(); for (let d = 0; d < 90; d++) { endDay(); S.queue = []; } return netWorth() / a;
  });
  check('idle fortune grows 0–60% in 90 days', r > 1 && r < 1.6, r.toFixed(3));
  check('no errors in feature run', !p.errors.length, p.errors.slice(0, 5).join(' | '));

  // store-safe names: no parody names anywhere on screen
  const q = await page(b);
  await newGame(q, () => { setSafeNames(true); });
  await q.reload(); const c = await q.$('[data-act="onbContinue"]'); if (c) await c.click();
  r = await q.evaluate(() => {
    closeCompose(); S.queue = []; S.platforms.pix.followers = 3e6; for (let i = 0; i < 4; i++) { endDay(); S.queue = []; }
    const bad = ['Taylor Shift', 'Elon Tusk', 'Kardashion', 'Ronaldough', 'Starbux', 'Gucchi', 'Netflux', 'Tezla', 'Real Madrip', 'Paramountain'];
    const hits = new Set();
    for (const t of [...MAIN_TABS.map((x) => x[0]), ...CAREER.map((x) => x[0])]) { ACT_RUN('go', t); for (const n of bad) if (document.body.innerText.includes(n)) hits.add(`${n} on ${t}`); }
    for (const id of Object.keys(NPCS)) { ACT_RUN('open', 'star:' + id); for (const n of bad) if (document.body.innerText.includes(n)) hits.add(`${n} on ${id}`); }
    setSafeNames(false); return [...hits];
  });
  check('store-safe names hide every parody', !r.length, r.slice(0, 5).join(', '));
  check('no errors in safe-names run', !q.errors.length, q.errors.slice(0, 3).join(' | '));

  // an old save loads, upgrades and keeps playing
  const o = await page(b);
  await oldGame(o);
  r = await o.evaluate(() => { for (let i = 0; i < 5; i++) { endDay(); S.queue = []; } renderAll(); return { day: S.day, goal: S.career ? S.career.i : -1 }; });
  check('old save upgrades and plays on', r.day > 5 && r.goal >= 0, JSON.stringify(r));
  check('no errors with the old save', !o.errors.length, o.errors.slice(0, 3).join(' | '));
  await b.close(); done();
})();
