/* Clout Chaser — more Arena: parlays, influencer fight night, horse racing, blackjack,
   scratch cards and a full bet history. Game money only. */
'use strict';

/* ---------- bet history across every game ---------- */
function betLog(game, desc, stake, ret) {
  S.betLog = S.betLog || [];
  S.betLog.unshift({ d: S.day, g: game, t: desc, s: Math.round(stake), r: Math.round(ret) });
  if (S.betLog.length > 60) S.betLog.length = 60;
  S.stats.betNet = (S.stats.betNet || 0) + Math.round(ret - stake);
}
function arenaWin(stake, ret, label) {
  if (ret > stake) { S.stats.earned += ret - stake; sound('cash'); } else sound('bad');
  if (ret >= stake * 20) { celebrate('gold'); news(`@${S.handle} hits a ${label} jackpot`, true); S.stats.jackpots = (S.stats.jackpots || 0) + 1; }
  if (ret > stake && typeof passXP === 'function') passXP(10);
  if (typeof questEvent === 'function') questEvent('casino');
}

/* ---------- parlays: combine picks from different matches, odds multiply ---------- */
function parlayOdds(legs) { const o = legs.reduce((a, l) => a * l.odds, 1); return +(o * (legs.length >= 3 ? 1.05 : 1)).toFixed(2); }
function parlayToggle(fid, pk) {
  ui.parlay = ui.parlay || [];
  const i = ui.parlay.findIndex((l) => l.fid === fid);
  if (i >= 0 && ui.parlay[i].pick === pk) { ui.parlay.splice(i, 1); return; }
  const f = S.book.fx.find((x) => x.id === fid); if (!f || f.done) return;
  const leg = { fid, pick: pk, odds: f.odds[pk] };
  if (i >= 0) ui.parlay[i] = leg; else if (ui.parlay.length < 6) ui.parlay.push(leg); else toast('Six legs max.', 'bad');
}
function placeParlay(stake) {
  const legs = (ui.parlay || []).filter((l) => { const f = S.book.fx.find((x) => x.id === l.fid); return f && !f.done && !f.live; });
  if (legs.length < 2) return toast('A parlay needs at least two matches.', 'bad');
  if (!spend(stake)) return toast('Not enough cash.', 'bad');
  S.book.parlays = S.book.parlays || [];
  S.book.parlays.push({ id: uid(), legs, stake, odds: parlayOdds(legs), status: 'open', day: S.day });
  S.stats.bets = (S.stats.bets || 0) + 1;
  toast(`Parlay placed: ${legs.length} legs @ ${parlayOdds(legs)}×`, 'gold'); sound('post');
  ui.parlay = [];
}
function settleParlays() {
  let net = 0;
  for (const p of (S.book.parlays || []).filter((x) => x.status === 'open')) {
    const fs = p.legs.map((l) => S.book.fx.find((f) => f.id === l.fid));
    if (fs.some((f) => f && !f.done)) continue;
    const won = fs.every((f, i) => f && betWins(p.legs[i], f));
    if (won) {
      const pay = Math.round(p.stake * p.odds * worldMult('bets'));
      S.money += pay; S.book.won += pay - p.stake; net += pay - p.stake; p.status = 'won'; p.pay = pay;
      arenaWin(p.stake, pay, `${p.legs.length}-leg parlay`);
      if (p.odds >= 10) news(`@${S.handle} lands a ${p.odds}× parlay`, true);
      S.stats.parlayWins = (S.stats.parlayWins || 0) + 1;
    } else { p.status = 'lost'; S.book.lost += p.stake; net -= p.stake; }
    betLog('⚽', `${p.legs.length}-leg parlay @ ${p.odds}`, p.stake, p.pay || 0);
  }
  S.book.parlays = (S.book.parlays || []).filter((p) => p.status === 'open' || p.day >= S.day - 2).slice(-20);
  return net;
}
function parlaySlip() {
  const legs = ui.parlay || [];
  const open = (S.book.parlays || []).filter((p) => p.day >= S.day - 1);
  if (!legs.length && !open.length) return '<span class="small muted">Tip: tap “+ Parlay” on two or more matches to combine them. Odds multiply (5% bonus on 3+ legs), but every leg has to win.</span>';
  return `${legs.length ? `<div class="betslip parlay"><b>Parlay slip · ${legs.length} leg${legs.length > 1 ? 's' : ''} · ${parlayOdds(legs)}×</b>
    ${legs.map((l) => { const f = S.book.fx.find((x) => x.id === l.fid); return f ? `<span class="small">${esc(PICK_LABEL(f, l.pick))} @ ${l.odds} <button class="chip" data-act="parlayAdd" data-arg="${l.fid}:${l.pick}">✕</button></span>` : ''; }).join('')}
    ${legs.length >= 2 ? stakeBtns('parlayPlace', '') : '<span class="small muted">Add one more match.</span>'}</div>` : ''}
    ${open.length ? `<div class="mybets">${open.map((p) => `<span class="pill ${p.status === 'won' ? 'good' : p.status === 'lost' ? 'bad' : 'blue'}">Parlay ${p.legs.length} legs ${money(p.stake)} @ ${p.odds}${p.status === 'won' ? ` → ${money(p.pay)}` : p.status === 'lost' ? ' ✗' : ''}</span>`).join('')}</div>` : ''}`;
}

/* ---------- fight night: influencer boxing ---------- */
const FIGHT_MOVES = ['lands a stiff jab', 'swings wild and misses', 'connects with a big right hand', 'goes to the body', 'dances around the ring for the cameras', 'clinches and gets a warning', 'lands a clean uppercut', 'gets caught with a hook', 'taunts the crowd', 'throws a flurry of punches'];
function fightCard() {
  if (S.fights && S.fights.day === S.day) return S.fights;
  const ids = shuffle(Object.keys(NPCS)).slice(0, 6);
  const bouts = [0, 1, 2].map((i) => {
    const a = ids[i * 2], b = ids[i * 2 + 1];
    const sa = rnd(0, 3) + Math.log10(1 + NPCS[a].followers || 1) * 0.15, sb = rnd(0, 3) + Math.log10(1 + NPCS[b].followers || 1) * 0.15;
    const pa = clamp(1 / (1 + Math.exp(-(sa - sb))), 0.12, 0.88);
    return { id: uid(), a, b, pa, odds: { a: +(0.92 / pa).toFixed(2), b: +(0.92 / (1 - pa)).toFixed(2), ko: 2.4 }, done: false };
  });
  S.fights = { day: S.day, bouts };
  return S.fights;
}
function runFight(id, pk, stake) {
  const f = fightCard().bouts.find((x) => x.id === id);
  if (!f || f.done) return toast('This fight is over. New card tomorrow.', 'bad');
  if (!spend(stake)) return toast('Not enough cash.', 'bad');
  const aWins = chance(f.pa), ko = chance(0.4), koRound = ri(1, 6);
  const W = aWins ? f.a : f.b, Lo = aWins ? f.b : f.a;
  const nm = (x) => NPCS[x].name.split(' ')[0];
  const rounds = [];
  for (let r = 1; r <= (ko ? koRound : 6); r++) {
    const last = ko && r === koRound;
    rounds.push(last ? `R${r}: ${nm(W)} lands a monster hook. ${nm(Lo)} is DOWN. It's over! 💥` : `R${r}: ${nm(chance(0.55) ? W : Lo)} ${pick(FIGHT_MOVES)}.`);
  }
  if (!ko) rounds.push(`Judges' decision: ${nm(W)} wins on points.`);
  const won = (pk === 'a' && aWins) || (pk === 'b' && !aWins) || (pk === 'ko' && ko);
  const pay = won ? Math.round(stake * f.odds[pk]) : 0;
  S.money += pay; f.done = true; f.res = { W, ko, rounds, pk, stake, pay };
  ui.fightShow = f.id;
  arenaWin(stake, pay, 'fight night');
  betLog('🥊', `${pk === 'ko' ? 'KO' : nm(pk === 'a' ? f.a : f.b) + ' to win'} (${nm(f.a)} vs ${nm(f.b)})`, stake, pay);
  if (won) S.stats.fightWins = (S.stats.fightWins || 0) + 1;
  news(`Influencer Fight Night: ${NPCS[W].name} beats ${NPCS[Lo].name}${ko ? ' by KO' : ''}`);
}
function fightBody() {
  const C = fightCard(), sel = ui.fightSel;
  return `<div class="sect"><h3>🥊 Influencer Fight Night</h3><span class="small muted">Creators settle beef in the ring. Pick a winner, or bet that it ends by knockout. New card every day.</span>
    ${C.bouts.map((f) => `<div class="match fight ${f.done ? 'done' : ''}"><div class="teams"><span class="row">${npcAv(f.a, 'sm')}<b>${esc(NPCS[f.a].name)}</b></span><span class="muted">vs</span><span class="row"><b>${esc(NPCS[f.b].name)}</b>${npcAv(f.b, 'sm')}</span></div>
      ${f.done ? `<div class="rounds">${f.res.rounds.map((r, i) => `<span class="small rnd" style="animation-delay:${ui.fightShow === f.id ? i * 0.45 : 0}s">${esc(r)}</span>`).join('')}<b class="rnd ${f.res.pay ? 'good' : 'bad'}" style="animation-delay:${ui.fightShow === f.id ? f.res.rounds.length * 0.45 : 0}s">${f.res.pay ? `You won ${money(f.res.pay)}! 🏆` : `You lost ${money(f.res.stake)}.`}</b></div>`
        : `<div class="odds">${[['a', NPCS[f.a].name.split(' ')[0]], ['ko', 'By KO'], ['b', NPCS[f.b].name.split(' ')[0]]].map(([k, l]) => `<button class="odd ${sel && sel.id === f.id && sel.pick === k ? 'on' : ''}" data-act="fightPick" data-arg="${f.id}:${k}"><span>${esc(l)}</span><b>${f.odds[k].toFixed(2)}</b></button>`).join('')}</div>
        ${sel && sel.id === f.id ? `<div class="betslip"><span class="small">Stake, then the bell rings:</span>${stakeBtns('fightBet', `${f.id}:${sel.pick}:`)}</div>` : ''}`}</div>`).join('')}</div>`;
}

/* ---------- horse racing ---------- */
const HORSE_NAMES = ['Viral Velocity', 'Clout Runner', 'Algorithm Annie', 'Hashtag Hero', 'Ratio King', 'Main Character', 'Glow Up Gal', 'Sponsored Sprint', 'Blue Check Blitz', 'Engagement Bait', 'Story Time', 'For You Page', 'Night Shift', 'Paywall Pony', 'Duet Dancer', 'Reply Guy'];
const SILKS = ['#F91880', '#1D9BF0', '#00BA7C', '#FFD400', '#7856FF', '#FF7A00'];
function raceCard() {
  if (S.race && S.race.horses) return S.race;
  const names = shuffle(HORSE_NAMES).slice(0, 6);
  const raw = names.map(() => rnd(0.6, 2.2));
  const tot = raw.reduce((a, b) => a + b, 0);
  const horses = names.map((n, i) => ({ n, p: raw[i] / tot, c: SILKS[i] }));
  horses.forEach((h) => { h.odds = +Math.max(1.3, 0.88 / h.p).toFixed(1); });
  S.race = { horses, no: ((S.race && S.race.no) || 0) + 1, last: S.race && S.race.last };
  return S.race;
}
function runRace(i, stake) {
  const R = raceCard(); const h = R.horses[i]; if (!h) return;
  if (!spend(stake)) return toast('Not enough cash.', 'bad');
  // pick the winner by strength, then the rest of the order
  let pool = R.horses.map((x, k) => k), order = [];
  while (pool.length) { const tot = pool.reduce((a, k) => a + R.horses[k].p, 0); let r = Math.random() * tot; let pickK = pool[0]; for (const k of pool) { r -= R.horses[k].p; if (r <= 0) { pickK = k; break; } } order.push(pickK); pool = pool.filter((k) => k !== pickK); }
  const times = []; order.forEach((k, pos) => { times[k] = +(3.2 + pos * rnd(0.18, 0.45) + rnd(0, 0.1)).toFixed(2); });
  const pay = order[0] === i ? Math.round(stake * h.odds) : 0;
  S.money += pay;
  R.last = { horses: R.horses, order, times, pick: i, stake, pay, fresh: true };
  R.horses = null; // a new field lines up for the next race
  arenaWin(stake, pay, 'horse race');
  betLog('🏇', `${h.n} to win @ ${h.odds}`, stake, pay);
  if (pay) S.stats.raceWins = (S.stats.raceWins || 0) + 1;
  setTimeout(() => { if (S.race && S.race.last) S.race.last.fresh = false; }, 5000);
}
function raceBody() {
  const R = raceCard(), L = R.last, sel = ui.horseSel;
  const track = L ? `<div class="track-race">${L.horses.map((h, k) => `<div class="lane"><span class="hname small">${k + 1}. ${esc(h.n)}</span><span class="horse ${L.fresh ? 'run' : 'done'}" style="--t:${L.times[k]}s;color:${h.c}">🏇</span><span class="finish"></span></div>`).join('')}
    <b class="race-res rnd ${L.pay ? 'good' : 'bad'}" style="animation-delay:${L.fresh ? Math.max(...L.times) : 0}s">${L.pay ? `🏆 ${esc(L.horses[L.pick].n)} won! You collect ${money(L.pay)}` : `${esc(L.horses[L.order[0]].n)} won. Your horse came ${L.order.indexOf(L.pick) + 1}${['st', 'nd', 'rd'][L.order.indexOf(L.pick)] || 'th'}.`}</b></div>` : '';
  return `<div class="sect"><h3>🏇 Clout Downs · Race ${R.no}</h3>${track}
    <span class="small muted">Pick a horse, choose your stake, and watch them run. Favorites win more often; longshots pay big.</span>
    <div class="odds horses">${R.horses.map((h, i) => `<button class="odd ${sel === i ? 'on' : ''}" data-act="horsePick" data-arg="${i}"><span><i class="dot" style="background:${h.c}"></i> ${esc(h.n)}</span><b>${h.odds.toFixed(1)}</b></button>`).join('')}</div>
    ${sel != null && R.horses[sel] ? `<div class="betslip"><span class="small">${esc(R.horses[sel].n)} to win @ ${R.horses[sel].odds}</span>${stakeBtns('horseBet', '')}</div>` : ''}</div>`;
}

/* ---------- blackjack ---------- */
const SUITS = ['♠', '♥', '♦', '♣'], RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
function drawCard() { return [pick(RANKS), pick(SUITS)]; }
function handVal(h) { let v = 0, a = 0; for (const [r] of h) { if (r === 'A') { a++; v += 11; } else v += ['J', 'Q', 'K'].includes(r) ? 10 : +r; } while (v > 21 && a) { v -= 10; a--; } return v; }
const cardHtml = ([r, s], hide) => hide ? '<span class="pcard back">🂠</span>' : `<span class="pcard ${s === '♥' || s === '♦' ? 'red' : ''}">${r}<small>${s}</small></span>`;
function bjDeal(bet) {
  if (S.bj && S.bj.state === 'play') return;
  if (!spend(bet)) return toast('Not enough cash.', 'bad');
  S.bj = { bet, p: [drawCard(), drawCard()], d: [drawCard(), drawCard()], state: 'play' };
  if (handVal(S.bj.p) === 21) bjFinish();
}
function bjFinish() {
  const B = S.bj; while (handVal(B.d) < 17) B.d.push(drawCard());
  const p = handVal(B.p), d = handVal(B.d), natural = p === 21 && B.p.length === 2;
  let ret = 0, msg;
  if (p > 21) msg = 'Bust.';
  else if (natural && !(d === 21 && B.d.length === 2)) { ret = Math.round(B.bet * 2.5); msg = 'Blackjack! Pays 3:2.'; }
  else if (d > 21 || p > d) { ret = B.bet * 2; msg = d > 21 ? 'Dealer busts. You win!' : 'You win!'; }
  else if (p === d) { ret = B.bet; msg = 'Push. Bet returned.'; }
  else msg = 'Dealer wins.';
  S.money += ret; B.state = 'done'; B.ret = ret; B.msg = msg;
  arenaWin(B.bet, ret, 'blackjack');
  betLog('🃏', `Blackjack ${p} vs ${d}`, B.bet, ret);
  if (ret > B.bet) S.stats.bjWins = (S.stats.bjWins || 0) + 1;
}
function bjBody() {
  const B = S.bj;
  return `<div class="sect"><h3>🃏 Blackjack</h3><span class="small muted">Get closer to 21 than the dealer. Dealer stands on 17. Blackjack pays 3:2.</span>
    ${B ? `<div class="bj"><div><span class="small muted">Dealer ${B.state === 'done' ? handVal(B.d) : ''}</span><div class="hand">${B.d.map((c, i) => cardHtml(c, B.state === 'play' && i === 1)).join('')}</div></div>
      <div><span class="small muted">You ${handVal(B.p)}</span><div class="hand">${B.p.map((c) => cardHtml(c)).join('')}</div></div>
      ${B.state === 'play' ? `<div class="row">${btn('Hit', 'bjHit', '', 'primary')}${btn('Stand', 'bjStand', '', '')}${B.p.length === 2 ? btn(`Double · ${money(B.bet)}`, 'bjDouble', '', 'sm', S.money < B.bet) : ''}</div>` : `<b class="${B.ret > B.bet ? 'good' : B.ret === B.bet ? '' : 'bad'}">${esc(B.msg)} ${B.ret ? `(${money(B.ret)})` : ''}</b>`}</div>` : ''}
    ${!B || B.state === 'done' ? `<span class="opt-lbl">Deal a hand</span>${stakeBtns('bjDeal', '')}` : ''}</div>`;
}

/* ---------- scratch cards ---------- */
const SCRATCH = [[5, 'Lucky Dip', '#00BA7C'], [50, 'Gold Rush', '#FFD400'], [500, 'Diamond Mine', '#1D9BF0'], [5000, 'Mogul Millions', '#F91880']];
const SCR_SYMS = ['🍀', '💎', '⭐', '🍒', '🔔', '👑', '💰', '🎁'];
const SCR_PRIZES = [[1000, 0.0001], [50, 0.002], [10, 0.012], [5, 0.03], [2, 0.08], [1, 0.15]]; // ~78% return
function buyScratch(i) {
  if (S.scratch && S.scratch.open.some((o) => !o)) return toast('Finish scratching your card first.', 'bad');
  const [price, name] = SCRATCH[i];
  if (!spend(price)) return toast('Not enough cash.', 'bad');
  let mult = 0, r = Math.random();
  for (const [m, p] of SCR_PRIZES) { if (r < p) { mult = m; break; } r -= p; }
  const win = mult ? SCR_SYMS[SCR_PRIZES.findIndex(([m]) => m === mult)] : null;
  // winners get exactly one triple; no other symbol ever shows three times
  const cells = win ? [win, win, win, ...shuffle(SCR_SYMS.filter((x) => x !== win)).slice(0, 6)] : shuffle(SCR_SYMS).concat(shuffle(SCR_SYMS)).slice(0, 9);
  S.scratch = { tier: i, price, name, cells: shuffle(cells), open: Array(9).fill(false), mult, paid: false };
}
function scratchCell(k) {
  const C = S.scratch; if (!C || C.open[k]) return;
  C.open[k] = true;
  if (C.open.every(Boolean) && !C.paid) {
    C.paid = true; const ret = C.price * C.mult; S.money += ret;
    arenaWin(C.price, ret, 'scratch card'); betLog('🎟️', `${C.name} scratch card`, C.price, ret);
    toast(ret ? `Three of a kind! You won ${money(ret)}` : 'No match this time.', ret ? 'gold' : '');
  }
}
function scratchBody() {
  const C = S.scratch;
  return `<div class="sect"><h3>🎟️ Scratch cards</h3><span class="small muted">Match three symbols to win up to 1,000× the ticket. Tap each square to scratch.</span>
    ${C ? `<div class="scratch" style="--sc:${SCRATCH[C.tier][2]}"><b class="small">${esc(C.name)} · ${money(C.price)}</b><div class="scr-grid">${C.cells.map((s, k) => `<button class="scr ${C.open[k] ? 'open' : ''}" data-act="scr" data-arg="${k}" aria-label="Scratch">${C.open[k] ? s : '?'}</button>`).join('')}</div>
      ${C.open.every(Boolean) ? `<b class="${C.mult ? 'good' : 'bad'}">${C.mult ? `Winner! ${C.mult}× = ${money(C.price * C.mult)}` : 'No win.'}</b>` : btn('Scratch all', 'scrAll', '', 'sm')}</div>` : ''}
    <div class="row">${SCRATCH.map(([p, n], i) => btn(`${n} · ${money(p)}`, 'scrBuy', i, 'sm primary', S.money < p || (C && C.open.some((o) => !o)))).join('')}</div></div>`;
}

/* ---------- bet history ---------- */
function historyBody() {
  const L = S.betLog || [];
  const tot = L.reduce((a, x) => a + x.r - x.s, 0), wins = L.filter((x) => x.r > x.s).length;
  return `<div class="sect"><h3>📜 Bet history</h3><div class="wallet"><div><div class="small muted">Bets shown</div><div class="big">${L.length}</div></div><div><div class="small muted">Win rate</div><div class="big">${L.length ? Math.round((wins / L.length) * 100) : 0}%</div></div><div><div class="small muted">Net (shown)</div><div class="big ${tot >= 0 ? 'good' : 'bad'}">${tot >= 0 ? '+' : '−'}${money(Math.abs(tot))}</div></div><div><div class="small muted">All-time net</div><div class="big ${(S.stats.betNet || 0) >= 0 ? 'good' : 'bad'}">${money(S.stats.betNet || 0)}</div></div></div>
    ${L.length ? `<div class="lgt">${L.map((x) => `<div class="row between small"><span>${x.g} Day ${x.d} · ${esc(x.t)}</span><span>${money(x.s)} → <b class="${x.r > x.s ? 'good' : x.r === x.s ? '' : 'bad'}">${money(x.r)}</b></span></div>`).join('')}</div>` : '<p class="small muted">No bets yet.</p>'}
    <span class="small muted">It's play money, but the house edge is real. Set yourself a limit.</span></div>`;
}

const ARENA_ACT = {
  parlayAdd: (a) => { const [f, p] = a.split(':'); parlayToggle(+f, p); },
  parlayPlace: (a) => { placeParlay(+a); },
  fightPick: (a) => { const [id, p] = a.split(':'); ui.fightSel = ui.fightSel && ui.fightSel.id === +id && ui.fightSel.pick === p ? null : { id: +id, pick: p }; },
  fightBet: (a) => { const [id, p, v] = a.split(':'); runFight(+id, p, +v); ui.fightSel = null; },
  horsePick: (a) => { ui.horseSel = ui.horseSel === +a ? null : +a; },
  horseBet: (a) => { if (ui.horseSel == null) return; runRace(ui.horseSel, +a); ui.horseSel = null; },
  bjDeal: (a) => { bjDeal(+a); },
  bjHit: () => { const B = S.bj; if (!B || B.state !== 'play') return; B.p.push(drawCard()); if (handVal(B.p) >= 21) bjFinish(); },
  bjStand: () => { if (S.bj && S.bj.state === 'play') bjFinish(); },
  bjDouble: () => { const B = S.bj; if (!B || B.state !== 'play' || !spend(B.bet)) return; B.bet *= 2; B.p.push(drawCard()); bjFinish(); },
  scrBuy: (a) => { buyScratch(+a); },
  scr: (a) => { scratchCell(+a); },
  scrAll: () => { if (S.scratch) S.scratch.open.forEach((o, k) => scratchCell(k)); },
};

ACHIEVEMENTS.push(
  ['parlay', 'Parlay prophet', 'Win a parlay', () => (S.stats.parlayWins || 0) >= 1],
  ['fight', 'Ringside', 'Win a Fight Night bet', () => (S.stats.fightWins || 0) >= 1],
  ['race', 'Photo finish', 'Win a horse race bet', () => (S.stats.raceWins || 0) >= 1],
  ['bj', 'Card shark', 'Win a hand of blackjack', () => (S.stats.bjWins || 0) >= 1],
);
