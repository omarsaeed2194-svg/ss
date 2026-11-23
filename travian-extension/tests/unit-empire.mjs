// 2.12: players from profiles, farm tuning and loot, supply villages, the
// coordinator. Run from travian-extension/: node tests/unit-empire.mjs
import { playersToCheck, recordProfile, playersInfo } from '../src/players.js';
import { carryOf, lootOf, listLoot, tuneTargets, farmSuggestions, defaultTroops } from '../src/farmtune.js';
import { isSupplier, supplyPlan } from '../src/supply.js';
import { coordinate } from '../src/coordinator.js';
import { trainPick } from '../src/brain.js';
import { inactiveCandidates } from '../src/inactive.js';
import { applyReports } from '../src/reports.js';
import { mergeSettings } from '../src/shared.js';

let failed = 0;
const check = (name, ok, got) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` — got ${JSON.stringify(got)}`}`); if (!ok) failed++; };
const now = Date.now();
const H = 3600000;

// --- players from profiles
const own = { A: { id: 'A', x: 0, y: 0 }, B: { id: 'B', x: 50, y: 50 } };
const map = {
  '3|4': { x: 3, y: 4, did: 11, uid: 7, pop: null, seen: [] },
  '10|0': { x: 10, y: 0, did: 12, uid: 8, pop: null, seen: [] },
  '40|40': { x: 40, y: 40, did: 13, uid: 9, pop: null, seen: [] },
  '1|1': { x: 1, y: 1, did: 14, uid: 1, pop: 900, seen: [] },          // Natars
  '90|90': { x: 90, y: 90, did: 15, uid: 10, pop: 50, seen: [] },     // far away
};
let who = playersToCheck({ villages: own, mapVillages: map, players: {} }, now);
check('players to look up: near any village, nearest first, no Natars, not far ones', who.map((p) => p.uid).join() === '7,8,9', who);
who = playersToCheck({ villages: own, mapVillages: map, players: { 7: { checkedAt: now - H } } }, now);
check('a player looked at an hour ago waits', !who.some((p) => p.uid === 7), who);
let r = recordProfile({}, map, { uid: 7, name: 'Sleepy', pop: 250, villages: [{ x: 3, y: 4, pop: 150, name: 'Home' }, { x: 5, y: 6, pop: 100, name: 'Two' }] }, now - 25 * H);
check('profile: player history and their villages\' population on the map', r.players[7].seen.length === 1 && r.mapVillages['3|4'].pop === 150 && r.mapVillages['3|4'].did === 11 && r.mapVillages['5|6'].pop === 100, r.mapVillages['3|4']);
r = recordProfile(r.players, r.mapVillages, { uid: 7, name: 'Sleepy', pop: 250, villages: [{ x: 3, y: 4, pop: 150 }, { x: 5, y: 6, pop: 100 }] }, now);
const cand = inactiveCandidates(r.mapVillages, own.A, { now });
check('a day later, no growth: both villages are inactive candidates', cand.map((c) => `${c.x}|${c.y}`).sort().join() === '3|4,5|6', cand);
check('players info: 1 known, judged, standing still', JSON.stringify(playersInfo(r.players, now)) === JSON.stringify({ known: 1, judged: 1, still: 1 }));

// --- loot and tuning (Gauls: Phalanx 35, TT 75)
const tg = { id: 'g', name: 'Farm', x: 3, y: 4, troops: { t1: 10, t4: 2 }, stats: { raids: 4, full: 2, half: 2, empty: 0, losses: 0, firstAt: now - 10 * H, last: { result: 'won', carry: 'full' } } };
check('carry: 10×35 + 2×75 = 500', carryOf(tg.troops, 20) === 500);
const lo = lootOf(tg, 20, now);
check('loot: (2 full + 2 half) × 500 = 1500, 150 an hour', lo.loot === 1500 && lo.perHour === 150, lo);
check('list loot sums its targets', listLoot({ targets: [tg, { ...tg, id: 'h' }] }, 20, now).perHour === 300);
let tune = tuneTargets([{ name: 'L', targets: [{ ...tg }] }], now);
check('came back full: a quarter more troops', JSON.stringify(tune.lists[0].targets[0].troops) === '{"t1":13,"t4":3}' && tune.changes[0].what === 'more', tune.lists[0].targets[0].troops);
check('…once per report (no second change without a new raid)', tuneTargets(tune.lists, now).changes.length === 0);
const emptyTwice = { ...tg, troops: { t1: 10 }, stats: { ...tg.stats, raids: 6, emptyStreak: 2, last: { result: 'won', carry: 'empty' } } };
check('empty twice: a quarter fewer (never under one)', tuneTargets([{ name: 'L', targets: [emptyTwice] }], now).lists[0].targets[0].troops.t1 === 7);
const empty4 = { ...emptyTwice, stats: { ...emptyTwice.stats, emptyStreak: 4 } };
const t4 = tuneTargets([{ name: 'L', targets: [empty4] }], now).lists[0].targets[0];
check('empty four times: paused', t4.enabled === false && t4.pausedBy === 'empty');
let grown = { ...tg, troops: { t1: 10 } };
for (let i = 0; i < 12; i++) { grown = tuneTargets([{ name: 'L', targets: [{ ...grown, stats: { ...grown.stats, raids: 10 + i } }] }], now).lists[0].targets[0]; }
check('never past four times what the player set', grown.troops.t1 === 40, grown.troops);
check('a new target starts with the list\'s usual troops', JSON.stringify(defaultTroops({ targets: [{ troops: { t1: 5 } }, { troops: { t1: 5 } }, { troops: { t4: 2 } }] })) === '{"t1":5}');
const rep = applyReports([{ id: 'L', name: 'L', villageId: 'A', targets: [{ id: 'g', name: 'Farm', x: 3, y: 4, troops: { t1: 5 } }] }], { A: { id: 'A', name: 'Home' } },
  [{ id: 'r1', subject: 'Home raids Farm', result: 1, carry: 'half' }], [], now);
check('reports count half loads and the first raid', rep.farms[0].targets[0].stats.half === 1 && rep.farms[0].targets[0].stats.firstAt === now);

// --- suggestions
const data = { villages: own, mapVillages: r.mapVillages, farms: [{ id: 'L', villageId: 'A', targets: [{ x: 5, y: 6, troops: { t1: 5 } }] }], farmIgnore: [] };
let sug = farmSuggestions(data, { radius: 20, now });
check('suggestions: inactive villages not already in a list', sug.map((c) => `${c.x}|${c.y}`).join() === '3|4' && sug[0].from === 'A', sug);
check('…nor turned down', farmSuggestions({ ...data, farmIgnore: ['3|4'] }, { radius: 20, now }).length === 0);

// --- supply
const s = mergeSettings({ brain: { enabled: true, supply: true, villages: { E2: { supply: false } } } });
check('supplier: economy villages with the switch on, unless ticked off; never without an army village', isSupplier({ id: 'E1' }, 'economy', s, true) && !isSupplier({ id: 'E2' }, 'economy', s, true)
  && !isSupplier({ id: 'E1' }, 'military', s, true) && !isSupplier({ id: 'E1' }, 'economy', s, false));
const res = (n, cap = 10000) => ({ stock: { wood: n, clay: n, iron: n, crop: n }, capacity: { warehouse: cap, granary: cap }, production: { wood: 100, clay: 100, iron: 100, crop: 100 } });
const market = [{ slot: 30, gid: 17, level: 5 }];
const V = {
  M: { id: 'M', order: 0, x: 0, y: 0, resources: res(2000), resourcesAt: now, buildings: [] },
  E1: { id: 'E1', order: 1, x: 5, y: 0, resources: res(8000), resourcesAt: now, buildings: market, lanes: { pct: 30, at: now, build: { wood: 5000, clay: 5000, iron: 5000, crop: 5000 } } },
};
let sp = supplyPlan({ villages: V }, s, { M: 'military', E1: 'economy' }, 20, now);
// Army part 3000 each, keep 5 % (500): 2500; room at M: 9000 − 2000 = 7000.
check('supply: the army part (less a little) to the army village', sp.length === 1 && sp[0].from === 'E1' && sp[0].to === 'M' && sp[0].amounts.wood === 2500 && sp[0].why === 'supply', sp);
check('…not when the army village has reached its targets', supplyPlan({ villages: { ...V, M: { ...V.M, troops: [{ unit: 'u21', count: 50 }] } } }, mergeSettings({ brain: { supply: true, villages: { M: { inf: 10 } } } }), { M: 'military', E1: 'economy' }, 20, now).length === 0);
check('…nor from a village under attack', supplyPlan({ villages: { ...V, E1: { ...V.E1, underAttack: true } } }, s, { M: 'military', E1: 'economy' }, 20, now).length === 0);
const fields5 = Array.from({ length: 18 }, (_, i) => ({ slot: i + 1, gid: [1, 2, 3, 4][i % 4], level: 5 }));
const e1 = { ...V.E1, fields: fields5, buildings: [...market, { slot: 19, gid: 19, level: 5 }] };
check('a supplier doesn\'t train itself', trainPick(e1, 'economy', 20, s, now, { hasArmy: true }).skip === 'supplies');
check('…but does when attacked', !trainPick({ ...e1, underAttack: true }, 'economy', 20, s, now, { hasArmy: true }).skip);
check('…and does with no army village', !trainPick(e1, 'economy', 20, s, now, { hasArmy: false }).skip);
const gb = { ...V.M, fields: fields5, resources: res(8000), lanes: null, buildings: [{ slot: 19, gid: 19, level: 10 }, { slot: 20, gid: 29, level: 1 }] };
const tpg = trainPick(gb, 'military', 20, mergeSettings({ brain: { enabled: true, villages: { M: { inf: 500 } } } }), now, { hasArmy: true });
check('great barracks trains too, sharing the target', tpg.builds && tpg.builds.map((b) => b.gid).join() === '19,29' && tpg.builds.every((b) => b.cat === 'inf' && b.left === 500), tpg.builds);

// --- coordinator
const jobs = [
  { type: 'farmList', listId: 'LA', label: 'farm A' },
  { type: 'brainTrain', villageId: 'E1', label: 'train E1' },
  { type: 'build', villageId: 'M', label: 'build M' },
  { type: 'brainTransfer', villageId: 'E1', targetId: 'M', why: 'supply', label: 'supply E1→M' },
  { type: 'profiles', label: 'profiles' },
  { type: 'adventure', label: 'adventure' },
  { type: 'heroPoints', label: 'hero points' },
  { type: 'brainScout', villageId: 'A', label: 'scout A' },
  { type: 'farmList', listId: 'LB', asked: true, label: 'farm B (asked)' },
];
const cdata = { villages: { A: { id: 'A', underAttack: true }, E1: { id: 'E1' }, M: { id: 'M' } }, farms: [{ id: 'LA', villageId: 'A' }, { id: 'LB', villageId: 'A' }], account: { hero: {} } };
const c = coordinate(jobs, cdata, now);
check('coordinator order: asked, defence, build, resources, hero, …', c.run.map((j) => j.label).join(' | ') === 'farm B (asked) | scout A | build M | supply E1→M | hero points', c.run.map((j) => j.label));
const why = Object.fromEntries(c.held.map((h) => [h.label, h.why]));
check('held: farms from an attacked village, training in a supplying village, scouting during an attack, adventure before hero points',
  why['farm A'] === 'attacked' && why['train E1'] === 'supplying' && why.profiles === 'defenseFirst' && why.adventure === 'heroFirst', c.held);
const c2 = coordinate([{ type: 'adventure', label: 'adv' }, { type: 'farmList', listId: 'LA', label: 'farm' }], { ...cdata, villages: { A: { id: 'A' } }, account: { hero: { dead: true } } }, now);
check('a dead hero: no adventure; a calm village farms', c2.run.map((j) => j.label).join() === 'farm' && c2.held[0].why === 'heroDead');

console.log(failed ? `${failed} FAILED` : 'ALL PASS');
process.exit(failed ? 1 : 0);
