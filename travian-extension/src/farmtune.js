// Farm lists that look after themselves: new targets from inactive players
// near the villages (added only when the player says so), troops per
// target from how its raids came back, and what each target and list
// brings in. Pure.
import { inactiveCandidates } from './inactive.js';
import { cleanTroops } from './autopilot.js';

// What each unit carries, t1..t10, per tribe (approximate for the newer tribes).
export const CARRY = {
  0: [50, 20, 50, 0, 100, 70, 0, 0, 0, 3000],     // Romans
  10: [60, 40, 50, 0, 110, 80, 0, 0, 0, 3000],    // Teutons
  20: [35, 45, 0, 75, 35, 65, 0, 0, 0, 3000],     // Gauls
  50: [15, 50, 45, 0, 50, 70, 0, 0, 0, 3000],     // Egyptians
  60: [50, 30, 0, 115, 105, 80, 0, 0, 0, 3000],   // Huns
  70: [60, 0, 40, 70, 100, 90, 0, 0, 0, 3000],    // Spartans
};
export const carryOf = (troops, base) => Object.entries(cleanTroops(troops))
  .reduce((n, [f, k]) => n + k * ((CARRY[base] || CARRY[0])[Number(f.slice(1)) - 1] || 0), 0);

// Loot so far and per hour, estimated from the reports: a raid that came
// back full carried all it could, a half one half (the game shows how
// full, not how much).
export function lootOf(tg, base, now = Date.now()) {
  const st = tg.stats;
  if (!st || !st.raids) return null;
  const per = carryOf(tg.troops, base);
  const loot = per * ((st.full || 0) + 0.5 * (st.half || 0));
  const hours = Math.max(1, (now - (st.firstAt || now)) / 3600000);
  return { per, loot: Math.round(loot), perHour: Math.round(loot / hours), raids: st.raids };
}

export function listLoot(list, base, now = Date.now()) {
  let loot = 0, perHour = 0, raids = 0;
  for (const tg of list.targets || []) {
    const l = lootOf(tg, base, now);
    if (!l) continue;
    loot += l.loot; perHour += l.perHour; raids += l.raids;
  }
  return { loot, perHour, raids };
}

// Troops for the next raids, from the reports since the last change: back
// full → a quarter more (up to four times what the player set); back
// empty twice running → a quarter less (never under one of each kind);
// empty four times running → the target is paused. Returns the lists and
// what changed.
export function tuneTargets(lists, now = Date.now()) {
  const out = structuredClone(lists || []);
  const changes = [];
  for (const l of out) {
    for (const tg of l.targets || []) {
      const st = tg.stats;
      if (!st || !st.last || !(st.raids > (tg.tunedAt || 0)) || tg.enabled === false) continue;
      tg.tunedAt = st.raids;
      const troops = cleanTroops(tg.troops);
      if (!Object.keys(troops).length) continue;
      tg.setTroops = tg.setTroops || troops;
      if (st.emptyStreak >= 4) {
        tg.enabled = false;
        tg.pausedBy = 'empty';
        changes.push({ list: l.name, target: tg.name, x: tg.x, y: tg.y, what: 'paused' });
        continue;
      }
      let f = 1;
      if (st.last.carry === 'full' && st.last.result === 'won') f = 1.25;
      else if (st.emptyStreak >= 2) f = 0.75;
      if (f === 1) continue;
      const next = {};
      for (const [k, n] of Object.entries(troops)) {
        const cap = (tg.setTroops[k] || n) * 4;
        next[k] = Math.max(1, Math.min(cap, f > 1 ? Math.ceil(n * f) : Math.floor(n * f)));
      }
      if (JSON.stringify(next) === JSON.stringify(troops)) continue;
      tg.troops = next;
      changes.push({ list: l.name, target: tg.name, x: tg.x, y: tg.y, what: f > 1 ? 'more' : 'less', troops: next });
    }
  }
  return { lists: out, changes };
}

// New targets to suggest: villages of inactive players near the player's
// villages, not in a list already and not turned down, nearest first.
export function farmSuggestions(data, { radius = 20, max = 30, now = Date.now() } = {}) {
  const inList = new Set((data.farms || []).flatMap((l) => (l.targets || []).map((tg) => `${tg.x}|${tg.y}`)));
  const ignored = new Set(data.farmIgnore || []);
  const best = new Map();
  for (const o of Object.values(data.villages || {})) {
    if (o.x == null) continue;
    for (const c of inactiveCandidates(data.mapVillages, o, { maxDistance: radius, now })) {
      const key = `${c.x}|${c.y}`;
      if (inList.has(key) || ignored.has(key)) continue;
      const was = best.get(key);
      if (!was || c.distance < was.distance) best.set(key, { x: c.x, y: c.y, name: c.name || '', player: c.player || '', pop: c.pop, distance: Math.round(c.distance * 10) / 10, from: o.id, since: c.since });
    }
  }
  return [...best.values()].sort((a, b) => a.distance - b.distance).slice(0, max);
}

// Troops a new target starts with: the list's most used set, else none
// (the player picks).
export function defaultTroops(list) {
  const counts = new Map();
  for (const tg of list.targets || []) {
    const t = JSON.stringify(cleanTroops(tg.setTroops || tg.troops));
    if (t !== '{}') counts.set(t, (counts.get(t) || 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return top ? JSON.parse(top[0]) : {};
}

export const lootText = (n) => (n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(Math.round(n)));
