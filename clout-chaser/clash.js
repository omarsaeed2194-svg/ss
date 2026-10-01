/* Clout Chaser — celebrity clashes (stars vs stars) and clash battles (you vs a star) */
'use strict';

const activeClashes = () => (S.clashes || []).filter((c) => !c.done);
const firstName = (id) => NPCS[id].name.replace(/^Dwayne "The Pebble" Johnson$/, 'The Pebble').split(' ')[0];

/* ---------- world clashes ---------- */
function startClash(quiet) {
  const live = activeClashes();
  if (live.length >= 2) return null;
  const busy = new Set(live.flatMap((c) => [c.a, c.b]));
  let r = null;
  const rivals = RIVALRIES.filter((x) => !busy.has(x.a) && !busy.has(x.b) && !(S.clashes || []).some((c) => c.a === x.a && c.b === x.b && S.day - c.day < 12));
  if (rivals.length && chance(0.7)) r = pick(rivals);
  if (!r) {
    const ids = Object.keys(NPCS).filter((id) => !busy.has(id));
    const a = pick(ids.filter((id) => NPCS[id].drama >= 0.5)) || pick(ids);
    const b = pick(ids.filter((id) => id !== a && NPCS[id].niche === NPCS[a].niche)) || pick(ids.filter((id) => id !== a));
    r = { a, b, ...pick([
      { kind: 'Subtweet war', verbA: 'posted a subtweet everyone knows is about them', verbB: 'liked a meme roasting them back' },
      { kind: 'Unfollow drama', verbA: 'unfollowed them out of nowhere', verbB: 'unfollowed back and archived every photo together' },
      { kind: 'Copycat accusations', verbA: 'accused them of copying their whole aesthetic', verbB: 'posted side-by-side receipts' },
      { kind: 'Collab gone wrong', verbA: 'said the collab was "their idea"', verbB: 'leaked the group chat' },
    ]) };
  }
  const c = { id: uid(), a: r.a, b: r.b, kind: r.kind, verbA: r.verbA, verbB: r.verbB, day: S.day, ends: S.day + ri(3, 5), votes: +(0.5 + rnd(-0.1, 0.1)).toFixed(3), side: null, done: false, winner: null, playerPosts: 0 };
  S.clashes = [c, ...(S.clashes || [])].slice(0, 14);
  clashPost(c, 'a'); clashPost(c, 'b');
  news(`${NPCS[c.a].name} ${c.verbA}. ${NPCS[c.b].name} ${c.verbB}. The internet is picking sides.`);
  if (!quiet) {
    notify('system', null, `New clash: ${NPCS[c.a].name} vs ${NPCS[c.b].name} (${c.kind}). Pick a side, play peacemaker, or make content about it.`);
    log(`Clash started: ${NPCS[c.a].name} vs ${NPCS[c.b].name}.`, 'gold');
    const friend = [c.a, c.b].find((id) => S.npcs[id].rel >= 25 && !S.npcs[id].feud);
    if (friend) S.queue.push({ ev: 'clash_pull', ctx: { id: c.id, friend } });
  }
  return c;
}
function clashPost(c, who) {
  const me = who === 'a' ? c.a : c.b, other = who === 'a' ? c.b : c.a;
  const text = pick(who === 'a' ? CLASH_LINES.attack : CLASH_LINES.defend).replace('{b}', NPCS[other].handle).replace('{a}', NPCS[other].handle);
  npcPost(me);
  S.feed[0].text = text; S.feed[0].clash = c.id;
  S.feed[0].likes = Math.round(S.feed[0].likes * 1.8); S.feed[0].comments = Math.round(S.feed[0].comments * 3);
}
const playerWeight = (c) => clamp(totalFollowers() / (S.npcs[c.a].followers + S.npcs[c.b].followers) * 6, 0.01, 0.18);
function tickClashes() {
  for (const c of activeClashes()) {
    let drift = rnd(-0.07, 0.07) + (S.npcs[c.a].rep - S.npcs[c.b].rep) / 2000;
    if (c.side === 'a') drift += playerWeight(c) * 0.4;
    if (c.side === 'b') drift -= playerWeight(c) * 0.4;
    c.votes = clamp(c.votes + drift, 0.05, 0.95);
    if (chance(0.7)) clashPost(c, chance(0.5) ? 'a' : 'b');
    if (S.day >= c.ends) resolveClash(c);
  }
}
function resolveClash(c, truce = false) {
  c.done = true;
  if (truce) { c.winner = 'truce'; news(`${NPCS[c.a].name} and ${NPCS[c.b].name} end the ${c.kind.toLowerCase()} with a group hug. Thanks, @${S.handle}.`); return; }
  const w = c.votes >= 0.5 ? c.a : c.b, l = w === c.a ? c.b : c.a;
  c.winner = w;
  S.npcs[w].followers *= 1.02; S.npcs[w].rep = clamp(S.npcs[w].rep + 3, 5, 95);
  S.npcs[l].rep = clamp(S.npcs[l].rep - 2, 5, 95);
  news(`${NPCS[w].name} wins the ${c.kind.toLowerCase()} with ${Math.round(Math.max(c.votes, 1 - c.votes) * 100)}% of the internet behind them. ${NPCS[l].name}'s fans are in shambles.`);
  if (c.side === 'a' || c.side === 'b') S.queue.push({ ev: '_clashEnd', ctx: { id: c.id } });
}

/* ---------- player moves in a world clash ---------- */
function clashSide(c, side) {
  if (c.side) return false;
  const pickId = side === 'a' ? c.a : c.b, otherId = side === 'a' ? c.b : c.a;
  c.side = side;
  c.votes = clamp(c.votes + (side === 'a' ? 1 : -1) * playerWeight(c), 0.05, 0.95);
  const fans = Math.min(S.npcs[pickId].followers * 0.00003, Math.max(totalFollowers() * 0.08, 40));
  applyFx({ f: fans, heat: 6, rel: { [pickId]: 12, [otherId]: -15 } });
  news(`@${S.handle} picks Team ${firstName(pickId)} in the ${c.kind.toLowerCase()}`, true);
  log(`You sided with ${NPCS[pickId].name} against ${NPCS[otherId].name}.`, 'gold');
  return true;
}
function clashPeace(c) {
  const ok = chance(clamp(0.2 + skillLvl('charisma') * 0.05 + S.rep / 400 - (NPCS[c.a].drama + NPCS[c.b].drama) * 0.12, 0.05, 0.8));
  if (ok) {
    c.side = 'peace'; S.stats.truces = (S.stats.truces || 0) + 1;
    applyFx({ rep: 4, fp: 0.02, rel: { [c.a]: 10, [c.b]: 10 } });
    resolveClash(c, true);
    log(`You brokered peace between ${NPCS[c.a].name} and ${NPCS[c.b].name}.`, 'gold');
    gainEnergy(15, 'You ended a celebrity clash');
  } else applyFx({ rel: { [c.a]: -3, [c.b]: -3 } });
  return ok;
}
function clashStir(c) {
  c.stirred = true;
  c.votes = clamp(c.votes + rnd(-0.12, 0.12), 0.05, 0.95);
  applyFx({ fp: 0.02, heat: 10, rep: -2, rel: { [c.a]: -6, [c.b]: -6 } });
  log(`You stirred the pot in ${NPCS[c.a].name} vs ${NPCS[c.b].name}.`, 'bad');
}

/* ---------- clash battle: you vs a star, three rounds ---------- */
const MOVES = {
  roast:    { name: 'Roast them',          skill: 'charisma',   beats: 'meme',     npc: 'roasted your outfit, your voice, and your mom\'s Chirp account' },
  receipts: { name: 'Drop receipts',       skill: 'business',   beats: 'roast',    npc: 'posted screenshots of your cringiest old posts' },
  meme:     { name: 'Turn them into a meme', skill: 'creativity', beats: 'receipts', npc: 'turned your face into a reaction meme' },
  highroad: { name: 'Take the high road',  npc: 'posted "wishing everyone peace 🙏" with a smug selfie' },
  army:     { name: 'Call in your fan army', npc: 'sent their entire fan army into your replies' },
};
function npcMove(id) {
  const N = NPCS[id];
  const w = { roast: 1 + N.drama * 2, receipts: 1 + N.ego, meme: 1.2, highroad: 0.4 + N.kind * 1.5, army: 0.5 + Math.min(2, Math.log10(S.npcs[id].followers / Math.max(100, totalFollowers()))) };
  let r = Math.random() * Object.values(w).reduce((a, b) => a + b, 0);
  for (const [k, v] of Object.entries(w)) { r -= v; if (r <= 0) return k; }
  return 'roast';
}
function startBattle(id) {
  const n = S.npcs[id];
  if (!n.feud) { n.feud = true; S.stats.feuds++; changeRel(id, -20); }
  news(`@${S.handle} challenges ${NPCS[id].name} to a public clash. Popcorn sales spike.`, true);
  S.queue.unshift({ ev: '_battle', ctx: { npc: id, round: 1, vote: 50, hist: [] } });
}
function battleRound(c, move) {
  const them = npcMove(c.npc), M = MOVES[move], T = MOVES[them];
  const ratio = Math.log10(Math.max(100, totalFollowers()) / Math.max(100, S.npcs[c.npc].followers));
  let d = 0, note = '';
  if (move === 'highroad') {
    d = them === 'roast' || them === 'army' ? 16 : -4; changeRep(1);
    note = them === 'roast' || them === 'army' ? 'Next to their meltdown, you look like the adult in the room.' : 'Classy, but nobody shares "classy".';
  } else if (move === 'army') {
    d = clamp((ratio + 1) * 14, -22, 22); note = d > 0 ? 'Your fans flooded the replies and won the ratio.' : 'Their fanbase is bigger. Your army got swarmed.';
    if (them === 'highroad') { d -= 8; note += ' Sending an army at someone being nice looked bad.'; }
  } else if (them === 'highroad') {
    d = -12; note = 'Attacking someone who took the high road made you look petty.';
  } else if (them === 'army') {
    d = clamp((ratio + 1) * 14, -22, 22) * -1 + (skillLvl(M.skill) - 3) * 2; note = 'Their fans piled on, but your move still landed with some people.';
  } else if (M.beats === them) {
    d = 20 + skillLvl(M.skill) * 1.5; note = `Your ${M.name.toLowerCase()} countered them perfectly.`;
  } else if (T.beats === move) {
    d = -20 + skillLvl(M.skill); note = 'They saw it coming and countered.';
  } else { d = rnd(-6, 6) + (skillLvl(M.skill) - 3) * 2; note = 'Same energy on both sides. The crowd is split.'; }
  c.vote = Math.round(clamp(c.vote + d * rnd(0.85, 1.15), 5, 95));
  c.hist.push({ move, them, d: Math.round(d) });
  return `${NPCS[c.npc].name} ${T.npc}. ${note} Public vote: ${c.vote}% for you.`;
}

Object.assign(EVENTS, {
  clash_pull: {
    title: (c) => `${NPCS[c.friend].name} wants your support`,
    text: (c) => { const k = S.clashes.find((x) => x.id === c.id); return `${firstName(c.friend)} DM'd you about the ${k ? k.kind.toLowerCase() : 'clash'}: "you've got my back, right?"`; },
    choices: (c) => {
      const k = S.clashes.find((x) => x.id === c.id);
      if (!k || k.done || k.side) return [{ label: 'Okay', fn: () => null }];
      const side = k.a === c.friend ? 'a' : 'b';
      const other = side === 'a' ? k.b : k.a;
      return [
        { label: `Back ${firstName(c.friend)} publicly`, sub: `${firstName(other)} will not forget this`, fn: () => { clashSide(k, side); return R('You posted your support. Their fans are showing you love.', { rel: { [c.friend]: 5 } }); } },
        { label: 'Support them privately', fn: () => R('"Appreciate you" came back with a heart.', { rel: { [c.friend]: 3 } }) },
        { label: 'Stay out of it', fn: () => R('They noticed you went quiet.', { rel: { [c.friend]: -6 } }) },
      ];
    },
  },
  _clashEnd: {
    eyebrow: () => 'Clash over',
    title: (c) => { const k = S.clashes.find((x) => x.id === c.id); return k ? `${NPCS[k.winner].name} wins the ${k.kind.toLowerCase()}` : 'The clash is over'; },
    text: (c) => { const k = S.clashes.find((x) => x.id === c.id); if (!k) return ''; const mine = k.side === 'a' ? k.a : k.b; return mine === k.winner ? `You backed ${NPCS[mine].name} and called it right. Their fans remember who showed up.` : `You backed ${NPCS[mine].name}, and they lost. ${NPCS[k.winner].name}'s fans have screenshots.`; },
    choices: (c) => {
      const k = S.clashes.find((x) => x.id === c.id);
      if (!k) return [{ label: 'Okay', fn: () => null }];
      const mine = k.side === 'a' ? k.a : k.b;
      if (mine === k.winner) return [{ label: 'Victory lap', fn: () => { S.stats.sideWins = (S.stats.sideWins || 0) + 1; gainEnergy(15, 'Your side won the clash'); return R('Team spirit pays.', { fp: 0.03, rel: { [mine]: 10 } }); } }];
      return [
        { label: 'Congratulate the winner', fn: () => R('Gracious in defeat. Some respect earned.', { rep: 2, rel: { [k.winner]: 8 } }) },
        { label: 'Claim it was rigged', fn: () => R('Messy, but it got engagement.', { fp: 0.01, heat: 8, rel: { [k.winner]: -10 } }) },
      ];
    },
  },
  _battle: {
    eyebrow: (c) => `Clash battle · Round ${c.round} of 3 · ${c.vote}% for you`,
    title: (c) => `You vs ${NPCS[c.npc].name}`,
    text: (c) => `<div class="battle"><div class="bside">${typeof npcAv === 'function' ? avatar(S.name, S.color, 'lg') : ''}<b>You</b></div><div class="bmeter"><i style="width:${c.vote}%"></i></div><div class="bside">${typeof npcAv === 'function' ? npcAv(c.npc, 'lg') : ''}<b>${esc(firstName(c.npc))}</b></div></div>
      <p class="small muted" style="margin-top:10px">Roast beats meme, meme beats receipts, receipts beat roast. The high road wins against attacks. Fan armies depend on who has more followers.</p>
      ${c.hist.length ? `<div class="small" style="margin-top:8px">${c.hist.map((h, i) => `Round ${i + 1}: ${MOVES[h.move].name} vs ${MOVES[h.them].name} <b class="${h.d >= 0 ? 'good' : 'bad'}">${h.d >= 0 ? '+' : ''}${h.d}</b>`).join('<br>')}</div>` : ''}`,
    choices: (c) => Object.entries(MOVES).map(([k, m]) => ({
      label: m.name, sub: m.skill ? `${m.skill[0].toUpperCase() + m.skill.slice(1)} ${skillLvl(m.skill)} · beats ${MOVES[m.beats].name.toLowerCase()}` : k === 'army' ? `You have ${fmt(totalFollowers())} followers, they have ${fmt(S.npcs[c.npc].followers)}` : 'Wins if they attack, loses ground if they stay calm',
      fn: () => { const txt = battleRound(c, k); c.round++; S.queue.unshift(c.round > 3 ? { ev: '_battleEnd', ctx: c } : { ev: '_battle', ctx: c }); return R(txt); },
    })),
  },
  _battleEnd: {
    eyebrow: () => 'Clash battle over',
    title: (c) => c.vote > 50 ? `You beat ${NPCS[c.npc].name}` : `${NPCS[c.npc].name} won this one`,
    text: (c) => c.vote > 50 ? `The internet called it for you with ${c.vote}% of the vote. Clips of the best round are everywhere.` : `Only ${c.vote}% backed you. The replies are rough.`,
    choices: (c) => {
      const id = c.npc;
      if (c.vote > 50) return [
        { label: 'Victory post', fn: () => {
          S.stats.battleWins = (S.stats.battleWins || 0) + 1;
          const g = Math.min(S.npcs[id].followers * 0.002, Math.max(totalFollowers() * 0.5, 1000));
          news(`@${S.handle} wins the clash against ${NPCS[id].name}`, true); log(`You won a clash battle against ${NPCS[id].name}.`, 'gold');
          gainEnergy(20, 'You won the clash');
          S.npcs[id].followers *= 0.995;
          return R('New fans are pouring in.', { f: g, rep: 2, heat: 10, rel: { [id]: -10 } });
        } },
        { label: 'Offer a handshake', sub: 'End the feud on top', fn: () => {
          S.stats.battleWins = (S.stats.battleWins || 0) + 1;
          const g = Math.min(S.npcs[id].followers * 0.0012, Math.max(totalFollowers() * 0.3, 600));
          gainEnergy(20, 'You won the clash');
          if (chance(0.4 + NPCS[id].kind * 0.4)) { S.npcs[id].feud = false; return R('They accepted. Winning gracefully is the best look there is.', { f: g, rep: 5, rel: { [id]: 35 } }); }
          return R('They left you on read, but everyone saw you offer.', { f: g, rep: 3 });
        } },
      ];
      return [
        { label: 'Take the L gracefully', fn: () => R('Respectable. Some people respect you more now.', { rep: -1, fp: -0.005, heat: 3 }) },
        { label: 'Demand a rematch', fn: () => R('Bold. The rematch talk keeps you in the conversation.', { rep: -4, fp: 0.005, heat: 8 }) },
      ];
    },
  },
});
