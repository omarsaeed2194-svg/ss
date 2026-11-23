// Players near the villages, from their profiles: how each one's
// population moves. Servers whose map gives no population (only ids) get
// it here, and a whole account standing still is a surer sign of an
// inactive player than one village. Feeds the map store, so the inactive
// finder (src/inactive.js) judges as before. Pure.
import { distance } from './autopilot.js';
import { recordMapVillages } from './inactive.js';

export const CHECK_MS = 12 * 3600000;  // each player looked at twice a day at most
export const RADIUS = 25;               // owners of villages this close to one of the player's

// Players to look up now: owners of villages near the player's own (from
// the map), never looked at or not for 12 hours, nearest first. Never the
// Natars (player 1).
export function playersToCheck(data, now = Date.now(), max = 4, radius = RADIUS) {
  const own = Object.values(data.villages || {}).filter((v) => v.x != null);
  if (!own.length) return [];
  const best = {};
  for (const m of Object.values(data.mapVillages || {})) {
    const uid = Number(m.uid);
    if (!(uid > 1)) continue;
    const d = Math.min(...own.map((o) => distance(o, m)));
    if (!(d <= radius)) continue;
    if (best[uid] == null || d < best[uid]) best[uid] = d;
  }
  const players = data.players || {};
  return Object.entries(best)
    .filter(([uid]) => !players[uid] || now - (players[uid].checkedAt || 0) > CHECK_MS)
    .sort((a, b) => a[1] - b[1])
    .slice(0, max)
    .map(([uid, d]) => ({ uid: Number(uid), distance: d }));
}

// One profile read: the player's population history, and each of their
// villages' population in the map store (by its spot).
export function recordProfile(players, mapVillages, profile, now = Date.now()) {
  if (!profile || !(profile.uid > 0)) return { players, mapVillages };
  const prev = (players || {})[profile.uid] || {};
  const seen = [...(prev.seen || [])];
  const last = seen[seen.length - 1];
  if (profile.pop != null && (!last || last[1] !== profile.pop || now - last[0] > 3600000)) seen.push([now, profile.pop]);
  const kept = seen.length > 8 ? [seen[0], ...seen.slice(-7)] : seen;
  const next = { ...(players || {}), [profile.uid]: { uid: profile.uid, name: profile.name || prev.name || '', pop: profile.pop ?? prev.pop ?? null, seen: kept, checkedAt: now, villages: (profile.villages || []).length } };
  const list = (profile.villages || []).filter((v) => v.pop != null).map((v) => {
    const was = (mapVillages || {})[`${v.x}|${v.y}`] || {};
    return { x: v.x, y: v.y, did: was.did ?? `${v.x}|${v.y}`, uid: profile.uid, aid: was.aid || 0, name: v.name || was.name || '', player: profile.name || was.player || '', alliance: was.alliance || '', pop: v.pop };
  });
  return { players: next, mapVillages: recordMapVillages(mapVillages, list, now, []) };
}

// How tracking goes: players known, looked at, and found standing still.
export function playersInfo(players, now = Date.now(), span = 20 * 3600000) {
  const list = Object.values(players || {});
  const judged = list.filter((p) => (p.seen || []).length >= 2 && p.seen[p.seen.length - 1][0] - p.seen[0][0] >= span);
  return { known: list.length, judged: judged.length, still: judged.filter((p) => p.seen[p.seen.length - 1][1] <= p.seen[0][1]).length };
}
