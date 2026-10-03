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
  r = await p.evaluate(() => {
    ACT_RUN('go', 'home');
    const today = document.querySelector('.sect.today'), stories = !!document.querySelector('.stories');
    const folded = today && today.classList.contains('folded') && getComputedStyle(today.querySelector('.today-head')).display !== 'none';
    ACT_RUN('fold', 'home:today'); const opened = !!document.querySelector('.today-body');
    ACT_RUN('fold', 'home:today');
    ACT_RUN('go', 'money'); const k = document.querySelector('#col .fold-btn').dataset.arg; ACT_RUN('fold', k); ACT_RUN('go', 'home'); ACT_RUN('go', 'money');
    const kept = document.querySelector(`[data-fold="${k}"]`).classList.contains('folded'); ACT_RUN('fold', k);
    const dock = document.querySelectorAll('#tabbar .dock-page').length, sidebar = getComputedStyle(document.getElementById('sidebar')).display;
    return { stories, folded, opened, kept, dock, sidebar };
  });
  check('home has no stories row and a folded Today panel', !r.stories && r.folded && r.opened, JSON.stringify(r));
  check('section folds are remembered', r.kept);
  check('bottom dock with two pages replaces the sidebar', r.dock === 2 && r.sidebar === 'none');
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

  // Gem Store: test mode, a mock Google Play bridge, delivery exactly once
  const g = await page(b);
  await newGame(g);
  r = await g.evaluate(() => {
    const out = {};
    out.noProvider = Pay.provider() === null;
    ACT_RUN('iapTest'); out.test = Pay.provider() === 'test';
    const g0 = gems(); ACT_RUN('iapBuy', 'gems_550'); out.testGems = gems() - g0; out.testOrder = storeInit().orders[0].test === true;
    ACT_RUN('iapTest');
    // mock Google Play: buy → purchase callback → consume
    const calls = [];
    window.AndroidBilling = { available: () => true, query: () => calls.push('query'), restore: () => calls.push('restore'), buy: (id) => calls.push('buy:' + id), consume: (t) => calls.push('consume:' + t), acknowledge: (t) => calls.push('ack:' + t) };
    out.play = Pay.provider() === 'play';
    ACT_RUN('iapBuy', 'gems_1200');
    const before = gems();
    onBillingPurchase(JSON.stringify({ productId: 'gems_1200', orderId: 'GPA.1', token: 'tok1' }));
    onBillingPurchase(JSON.stringify({ productId: 'gems_1200', orderId: 'GPA.1', token: 'tok1' })); // duplicate callback
    out.playGems = gems() - before;
    onBillingPurchase(JSON.stringify({ productId: 'vip_month', orderId: 'GPA.2', token: 'tok2' }));
    out.vip = vipOn(); out.vipEnergy = maxEnergy();
    onBillingPurchase(JSON.stringify({ productId: 'starter_pack', orderId: 'GPA.3', token: 'tok3' }));
    out.calls = calls;
    onBillingProducts(JSON.stringify([{ id: 'gems_100', price: '€1.09' }])); out.localPrice = Pay.price('gems_100');
    const c0 = gems(); ACT_RUN('gemSpend', 'refill'); out.spent = c0 - gems();
    ACT_RUN('go', 'store'); out.screen = !!document.querySelector('.card.iap');
    delete window.AndroidBilling;
    return out;
  });
  check('store needs a real provider (no free purchases by default)', r.noProvider);
  check('test mode delivers and marks the order as a test', r.test && r.testGems === 550 && r.testOrder, JSON.stringify(r));
  check('Google Play purchase is delivered exactly once and consumed', r.play && r.playGems === 1200 && r.calls.filter((c) => c === 'consume:tok1').length >= 1, r.calls.join(','));
  check('VIP and starter pack are acknowledged, not consumed', r.vip && r.calls.includes('ack:tok2') && r.calls.includes('ack:tok3') && !r.calls.includes('consume:tok2'));
  check('localized Play prices show in the store', r.localPrice === '€1.09');
  check('Gems can be spent', r.spent === 25 && r.screen);

  // notifications: banners while playing, phone reminders when the app goes to the background
  r = await g.evaluate(async () => {
    const sched = [];
    window.AndroidNotify = { schedule: (id, t, body, ms) => sched.push([id, t, Math.round(ms / 36e5)]), cancelAll: () => sched.push('cancel'), enabled: () => true, requestPermission: () => sched.push('perm') };
    loginState().streak = 4;
    huQueue = []; huBusy = false; huLast = 0;
    notify('system', null, 'Test milestone');
    await new Promise((res) => setTimeout(res, 1200));
    const banner = !document.getElementById('headsup').hidden && document.getElementById('headsup').textContent.includes('Test milestone');
    quietly(() => notify('system', null, 'Quiet one'));
    schedulePhoneAlerts();
    S.settings.alerts.comeback = false; const before = sched.length; schedulePhoneAlerts(); const withoutComeback = sched.slice(before);
    S.day = 2; S.flags.askedNotify = false; maybeAskNotify();
    delete window.AndroidNotify;
    return { banner, sched, withoutComeback, asked: sched.includes('perm') };
  });
  check('heads-up banner shows while playing', r.banner);
  check('phone reminders are scheduled (daily, streak, comeback)', [1, 2, 3].every((id) => r.sched.some((x) => x[0] === id)), JSON.stringify(r.sched));
  check('switching a reminder off stops it', !r.withoutComeback.some((x) => x[0] === 3));
  check('notification permission is asked after the first night', r.asked);
  check('no errors in store and notifications', !g.errors.length, g.errors.slice(0, 3).join(' | '));

  // avatar and lifestyle scene
  r = await g.evaluate(() => {
    const out = {};
    ACT_RUN('go', 'avatar'); out.screen = !!document.querySelector('.look-preview .life-scene');
    ACT_RUN('lookSet', 'hair:afro'); out.hair = S.look.hair === 'afro';
    S.money = 0; storeInit().gems = 0; ACT_RUN('lookSet', 'hat:crown'); out.lockedPiece = S.look.hat !== 'crown' && ui.lookBuy === 'hat:crown';
    S.money = 2e6; ACT_RUN('lookBuy', 'cash'); out.bought = S.look.hat === 'crown' && S.wardrobe.includes('hat:crown') && S.money === 1e6;
    S.owned.car = true; S.owned.jet = true; S.owned.island = true; S.owned.pet = true;
    const svg = lifestyleScene(); out.scene = sceneKey() === 'island' && svg.includes('#E0245E') && svg.includes('av-fly');
    ACT_RUN('sceneSet', 'room'); out.picked = sceneKey() === 'room';
    ACT_RUN('sceneSet', 'space'); out.lockedScene = sceneKey() === 'room';
    ACT_RUN('go', 'home'); out.hero = !!document.querySelector('.hero-scene svg');
    out.meAv = meAv('sm').includes('viewBox="30 4 140 140"');
    return out;
  });
  check('avatar customizer changes the character', r.screen && r.hair, JSON.stringify(r));
  check('premium pieces must be bought first, then stay owned', r.lockedPiece && r.bought);
  check('lifestyle scene shows owned home, car, jet and pet', r.scene && r.hero);
  check('scenes unlock with what you own', r.picked && r.lockedScene);
  check('your custom character is your avatar everywhere', r.meAv);
  check('no errors in avatar run', !g.errors.length, g.errors.slice(0, 3).join(' | '));

  // an old save loads, upgrades and keeps playing
  const o = await page(b);
  await oldGame(o);
  r = await o.evaluate(() => { for (let i = 0; i < 5; i++) { endDay(); S.queue = []; } renderAll(); return { day: S.day, goal: S.career ? S.career.i : -1 }; });
  check('old save upgrades and plays on', r.day > 5 && r.goal >= 0, JSON.stringify(r));
  check('no errors with the old save', !o.errors.length, o.errors.slice(0, 3).join(' | '));
  await b.close(); done();
})();
