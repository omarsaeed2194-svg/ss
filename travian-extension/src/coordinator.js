// The referee: every job a round has planned goes through here, so the
// brain's parts never pull against each other. One order of priority —
// defence, building, moving resources, troops, research and the hero, farms,
// then looking around — and the pairs that may not run together:
//   - a village that sends its army's part away this round doesn't also
//     train with it (supply comes first);
//   - no farms or raids from a village under attack (its troops are needed
//     at home), no resources sent from or to one;
//   - no looking at other players' profiles while any village is attacked;
//   - no adventure while the hero is dead (reviving comes first) or has
//     points to place.
// Returns the jobs to run, in order, and those held back with the reason.
// Pure.

const PRIORITY = {
  escape: 0, donate: 0, brainScout: 1, brainReinforce: 1,
  build: 2, settlers: 2,
  brainTransfer: 3,
  brainTrain: 4, train: 4, heal: 4, celebrate: 4, spend: 4,
  brainResearch: 5, heroRevive: 5, heroPoints: 5, heroBag: 5,
  adventure: 6, quest: 6,
  farmList: 7, farm: 7, raid: 7,
  reports: 8, scan: 8, profiles: 9,
};
const rank = (j) => (j.asked ? -1 : PRIORITY[j.type] ?? 6);

export function coordinate(jobs, data, now = Date.now()) {
  const villages = data.villages || {};
  const attacked = (id) => !!(villages[id] && villages[id].underAttack);
  const anyAttack = Object.values(villages).some((v) => v.underAttack);
  const hero = (data.account || {}).hero || {};
  const supplying = new Set(jobs.filter((j) => j.type === 'brainTransfer' && j.why === 'supply').map((j) => j.villageId));
  const heroFirst = jobs.some((j) => j.type === 'heroRevive' || j.type === 'heroPoints');
  const run = [];
  const held = [];
  for (const j of jobs) {
    let why = null;
    if (j.asked) why = null;
    else if (j.type === 'brainTrain' && supplying.has(j.villageId) && !attacked(j.villageId)) why = 'supplying';
    else if (j.type === 'farmList') {
      const list = (data.farms || []).find((l) => l.id === j.listId);
      if (list && attacked(list.villageId) && list.skipWhenAttacked !== false) why = 'attacked';
    } else if (j.type === 'raid' && j.rule && attacked(j.rule.villageId)) why = 'attacked';
    else if (j.type === 'brainTransfer' && (attacked(j.villageId) || attacked(j.targetId))) why = 'attacked';
    else if (j.type === 'profiles' && anyAttack) why = 'defenseFirst';
    else if (j.type === 'adventure' && (hero.dead || heroFirst)) why = hero.dead ? 'heroDead' : 'heroFirst';
    if (why) held.push({ type: j.type, label: j.label, villageId: j.villageId || null, why });
    else run.push(j);
  }
  // Stable: jobs of the same rank keep the order they were planned in.
  const order = run.map((j, i) => [rank(j), i, j]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => x[2]);
  return { run: order, held };
}
