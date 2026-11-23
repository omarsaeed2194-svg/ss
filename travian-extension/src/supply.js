// Supply villages: an economy village that supplies sends its army's part
// of the stores (see src/budget.js) to the army village instead of training
// troops itself, so the army village's queues don't run dry. Its buildings'
// purse stays its own. Pure.
import { RESOURCES, capacityFor, estimateStock, sortedVillages } from './shared.js';
import { distance } from './autopilot.js';
import { purses, villageCfg, targetsOf } from './budget.js';

const hasMarket = (v) => (v.buildings || []).some((b) => b.gid === 17 && b.level > 0);

// Does this village supply? The player's tick per village, else the
// brain's switch for every economy village (only while an army village
// exists to receive).
export function isSupplier(v, role, s, hasArmyVillage = true) {
  if (role !== 'economy' || !hasArmyVillage) return false;
  const set = villageCfg(s, v.id).supply;
  if (set === true || set === false) return set;
  return !!((s && s.brain) || {}).supply;
}

// Transfers to make now: from each supplier with enough in its army's part
// to the nearest army village that still trains (targets not reached) and
// has room, never from or to a village under attack, none while a transfer
// is on its way to the receiver. { from, to, amounts, why: 'supply' }.
export function supplyPlan(data, s, roles, base, now = Date.now()) {
  const list = sortedVillages(data.villages || {});
  const armies = list.filter((v) => roles[v.id] === 'military' && !v.underAttack && v.x != null && v.resources)
    .filter((v) => {
      const tg = targetsOf(v, s, base, now);
      return !Object.keys(tg).length || Object.values(tg).some((x) => x.left > 0);
    })
    .filter((v) => !(v.transferPending && v.transferPending.until > now));
  if (!armies.length) return [];
  const out = [];
  for (const v of list) {
    if (!isSupplier(v, roles[v.id], s, true) || v.underAttack || !hasMarket(v) || (v.transferAt || 0) > now || v.x == null) continue;
    const p = purses(v, now);
    const est = estimateStock(v, now);
    if (!p || !est) continue;
    const cap = RESOURCES.reduce((n, k) => n + (capacityFor(v.resources, k) || 0), 0);
    const part = RESOURCES.reduce((n, k) => n + p.army[k], 0);
    if (part < 0.1 * cap) continue; // not worth the merchants yet
    const to = armies.slice().sort((a, b) => distance(v, a) - distance(v, b))[0];
    const tEst = estimateStock(to, now);
    if (!tEst) continue;
    const amounts = {};
    for (const k of RESOURCES) {
      const room = Math.max(0, 0.9 * (capacityFor(to.resources, k) || 0) - tEst[k]);
      const give = Math.floor(Math.min(p.army[k] - 0.05 * (capacityFor(v.resources, k) || 0), room) / 100) * 100;
      if (give >= 100) amounts[k] = give;
    }
    if (Object.keys(amounts).length) out.push({ from: v.id, to: to.id, amounts, why: 'supply', distance: distance(v, to) });
  }
  return out.sort((a, b) => RESOURCES.reduce((n, k) => n + (b.amounts[k] || 0), 0) - RESOURCES.reduce((n, k) => n + (a.amounts[k] || 0), 0));
}
