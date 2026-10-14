// Autopilot decisions, kept free of browser APIs so they can be tested:
// which upgrade to start next when the player queued nothing, and which
// oases a raid rule may hit.
import { RESOURCES, FIELD_RESOURCE, capacityFor, estimateStock } from './shared.js';

const MAP_SIZE = 401; // standard Travian map, -200..200

// u21 (Phalanx) → t1: every tribe has a block of ten unit numbers.
export function unitField(unit) {
  if (unit === 'hero') return 't11';
  const n = Number(String(unit || '').replace(/^u/, ''));
  return n > 0 ? `t${((n - 1) % 10) + 1}` : null;
}

// Troops at home by form field (t1..t10); the hero is never counted.
export function troopsHome(v) {
  const out = {};
  for (const tr of v.troops || []) {
    const field = unitField(tr.unit);
    if (field && field !== 't11') out[field] = (out[field] || 0) + tr.count;
  }
  return out;
}

// Distance on a map that wraps around at the edges.
export function distance(a, b) {
  const wrap = (d) => Math.min(Math.abs(d), MAP_SIZE - Math.abs(d));
  return Math.hypot(wrap(a.x - b.x), wrap(a.y - b.y));
}

export const oasisKey = (x, y) => `${x}|${y}`;

const lowest = (list) => list.slice().sort((a, b) => a.level - b.level)[0] || null;

// The next upgrade for a village with nothing queued, or null. In order:
// a storage that is nearly full, crop when the village is close to
// starving, the Main Building when it lags behind the fields, then the
// lowest resource field (favouring the resource produced least).
export function pickAutoUpgrade(v, s, now = Date.now()) {
  const ap = s.autopilot;
  const skip = v.autoSkip && v.autoSkip.until > now ? v.autoSkip.slots || [] : [];
  const free = (b) => b && !b.underConstruction && !b.maxLevel && !skip.includes(b.slot);
  const fields = (v.fields || []).filter(free);
  const buildings = (v.buildings || []).filter(free);
  const prod = (v.resources && v.resources.production) || {};
  const est = estimateStock(v, now);

  // 1. Storage almost full: more production would be thrown away.
  if (est) {
    for (const k of RESOURCES) {
      const cap = capacityFor(v.resources, k);
      if (!cap || est[k] / cap < 0.9) continue;
      const store = lowest(buildings.filter((b) => b.gid === (k === 'crop' ? 11 : 10) && b.level < 20));
      if (store) return { slot: store.slot, gid: store.gid, level: store.level, why: 'storage', res: k };
    }
  }

  const below = (f) => f.level < ap.fieldsMax;
  // 2. Crop margin too thin to keep troops fed.
  const total = (prod.wood || 0) + (prod.clay || 0) + (prod.iron || 0) + Math.max(0, prod.crop || 0);
  if (prod.crop != null && prod.crop < Math.max(5, total * 0.05)) {
    const crop = lowest(fields.filter((f) => FIELD_RESOURCE[f.gid] === 'crop' && below(f)));
    if (crop) return { slot: crop.slot, gid: crop.gid, level: crop.level, why: 'crop' };
  }

  // 3. Main Building keeps pace with the fields (it speeds up all building).
  const all = v.fields || [];
  const avg = all.length ? all.reduce((n, f) => n + f.level, 0) / all.length : 0;
  const main = lowest(buildings.filter((b) => b.gid === 15));
  if (main && main.level < Math.min(10, Math.floor(avg))) return { slot: main.slot, gid: 15, level: main.level, why: 'main' };

  // 4. Lowest field; among equals, the resource with the lowest production.
  const candidates = fields.filter(below);
  candidates.sort((a, b) => a.level - b.level ||
    (prod[FIELD_RESOURCE[a.gid]] || 0) - (prod[FIELD_RESOURCE[b.gid]] || 0) || a.slot - b.slot);
  const f = candidates[0];
  return f ? { slot: f.slot, gid: f.gid, level: f.level, why: 'fields' } : null;
}

// Oases a raid rule may hit now, nearest first: inside its radius, not owned,
// no animals seen at the last check, and not raided within the cool-down.
export function raidTargets(v, rule, oases, now = Date.now()) {
  const cooldown = Math.max(rule.everyMinutes || 30, 30) * 60000;
  const out = [];
  const seen = new Set();
  const add = (o) => {
    const key = oasisKey(o.x, o.y);
    if (seen.has(key)) return;
    seen.add(key);
    const d = distance(v, o);
    if (d > rule.radius && !o.manual) return;
    if (o.owned || o.notOasis) return;
    if (o.raidedAt && now - o.raidedAt < cooldown) return;
    // Animals seen recently: leave it for a while (they don't leave by themselves).
    if (o.animals > 0 && o.checkedAt && now - o.checkedAt < 3 * 3600000) return;
    out.push({ ...o, key, distance: d });
  };
  for (const tgt of rule.targets || []) add({ ...(oases[oasisKey(tgt.x, tgt.y)] || {}), x: tgt.x, y: tgt.y, manual: true });
  for (const o of Object.values(oases || {})) add(o);
  return out.sort((a, b) => a.distance - b.distance);
}
