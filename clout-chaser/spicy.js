/* Clout Chaser — spicier events, hot seat interviews, tea fallout, world tours */
'use strict';

/* Events that hurt get more frequent as you get more famous */
['old_post', 'paparazzi', 'stalker', 'shadowban', 'copyright', 'hacked', 'hater_campaign', 'impersonator', 'merch_quality', 'product_recall', 'kenzie_video'].forEach((k) => { if (EVENTS[k]) EVENTS[k].neg = true; });

const friendlyStar = () => randomNpc((id) => S.npcs[id].rel >= 15 && !S.npcs[id].feud);
const anyParody = () => pick(Object.keys(PARODY_NPCS));

const HOT_SEAT = [
  { q: 'Is it true you buy your followers?', a: [['Laugh and deny it', { rep: 1 }, 'Smooth.'], ['"Everyone does it"', { rep: -4, heat: 8, fp: 0.01 }, 'Honest-ish. The clip is everywhere.'], ['Walk off set', { heat: 12, fp: 0.015, rep: -2 }, 'Iconic or unhinged, depending who you ask.']] },
  { q: 'Who is the most overrated creator right now?', a: [['Name a big star', { heat: 14, fp: 0.025, rep: -3 }, 'The headline writes itself.'], ['"Me, honestly"', { rep: 2, fp: 0.01 }, 'Self-deprecating. People loved it.'], ['Refuse to answer', {}, 'Boring but safe.']] },
  { q: 'What do you really think of your fans?', a: [['"They\'re my family"', { rep: 2 }, 'Fans are crying in the comments.'], ['"Some of them need to log off"', { heat: 9, fp: 0.015, rep: -2 }, 'Half your fans are mad. The other half agree.'], ['Tell a wholesome fan story', { rep: 3, stress: -5 }, 'Clips of this went viral for the right reasons.']] },
  { q: 'Have you ever lied in a sponsored post?', a: [['"Never"', { rep: 0.5 }, 'Nobody believes you, but nobody can prove it.'], ['"Once, and I regret it"', { rep: 3, heat: 3 }, 'Rare honesty. Respect.'], ['"Define lie"', { heat: 10, fp: 0.02, rep: -3 }, 'Instant meme.']] },
  { q: 'Who would you date from the A-list?', a: [['Name a parody A-lister', { fp: 0.03, heat: 6 }, 'The internet is shipping you already.'], ['"I\'m focused on my career"', { rep: 1 }, 'Diplomatic.'], ['"Your mom"', { fp: 0.02, heat: 8, rep: -2 }, 'The host did not laugh. Everyone else did.']] },
  { q: 'What\'s the worst thing you\'ve ever posted?', a: [['Tell the truth', { rep: 2, heat: 5, fp: 0.01 }, 'Relatable and a little chaotic.'], ['"Nothing, I\'m perfect"', { rep: -2, heat: 4 }, 'Arrogant. The receipts hunt begins.'], ['Read it out loud', { fp: 0.03, heat: 10, rep: -1 }, 'Brave. Very brave.']] },
];

Object.assign(EVENTS, {
  leaked_dms: {
    random: true, neg: true, w: 1.5, when: () => T() >= 5000 && !!friendlyStar(), ctx: () => ({ npc: friendlyStar() }),
    title: (c) => `Your DMs with ${NPCS[c.npc].name} leaked`,
    text: (c) => `Screenshots of your private chats with ${NPCS[c.npc].name} are on every gossip account. Nothing illegal, just extremely embarrassing emoji use.`,
    choices: (c) => [
      { label: 'Own it with a joke', sub: `Charisma ${skillLvl('charisma')}`, fn: () => chance(0.35 + skillLvl('charisma') * 0.06) ? R('"Yes I use 14 crying emoji per message, and?" Instant classic.', { fp: 0.03, rep: 2, rel: { [c.npc]: 5 } }) : R('The joke did not land. The screenshots keep spreading.', { heat: 10, rep: -2 }) },
      { label: 'Say they were edited', fn: () => chance(0.4) ? R('People bought it.', { heat: -5 }) : R(`${NPCS[c.npc].name.split(' ')[0]} confirmed they were real. Ouch.`, { rep: -6, heat: 14, rel: { [c.npc]: -15 } }) },
      { label: `Apologize to ${NPCS[c.npc].name.split(' ')[0]} publicly`, fn: () => R('Mature move. The friendship survives.', { rep: 2, rel: { [c.npc]: 8 } }) },
    ],
  },
  ex_tell_all: {
    random: true, neg: true, w: 1.2, when: () => T() >= 2e4, title: () => 'Your ex is doing a tell-all',
    text: () => 'Your ex just announced a 2-hour podcast episode titled "The Truth About Them". The trailer has 3 million views.',
    choices: () => [
      { label: 'Release your side first', sub: '−20 energy', fn: () => chance(0.55) ? R('You controlled the story. Their episode flopped.', { energy: -20, fp: 0.02, rep: 1 }) : R('Looked defensive. Both videos went viral.', { energy: -20, fp: 0.03, heat: 12, rep: -3 }) },
      { label: 'Say nothing', fn: () => R('The episode was mostly about your cooking. You survive.', { heat: 6, rep: -1 }) },
      { label: 'Go on their podcast together', sub: 'Chaos option', fn: () => chance(0.5) ? R('Wholesome closure on camera. 10 million views.', { fp: 0.05, rep: 3 }) : R('It turned into a screaming match. 20 million views.', { fp: 0.07, rep: -6, heat: 18 }) },
    ],
  },
  deepfake: {
    random: true, neg: true, w: 1, when: () => T() >= 5e4, title: () => 'A deepfake of you is going viral',
    text: () => 'A fake video shows "you" endorsing a sketchy crypto coin. Fans are losing money.',
    choices: () => [
      { label: 'Report and warn everyone', sub: '−15 energy', fn: () => R('Platforms took it down. Fans thanked you.', { energy: -15, rep: 2 }) },
      { label: 'Sue the creators', sub: S.team.lawyer ? 'Your lawyer is on it' : 'Expensive', fn: () => S.team.lawyer ? R('Won. Precedent set.', { rep: 4, money: 5000 }) : R('Legal fees hurt, but the takedown worked.', { money: -8000, rep: 2, legal: true }) },
      { label: 'Make a parody of the deepfake', fn: () => R('Funny, but some people now think the original was real.', { fp: 0.03, heat: 8, rep: -2 }) },
    ],
  },
  lipsync: {
    random: true, neg: true, w: 1, when: () => T() >= 1e5 && (S.niche === 'music' || chance(0.3)), title: () => 'Caught lip-syncing',
    text: () => 'At a live festival set, your mic cut out but your voice kept going. 40 million people saw it.',
    choices: () => [
      { label: 'Admit it, then sing live on stream', sub: '−25 energy', fn: () => R('Your live vocals were... okay. People respected the effort.', { energy: -25, rep: 3, fp: 0.01 }) },
      { label: 'Blame the sound engineer', fn: () => R('The sound engineer posted a 12-part thread.', { rep: -7, heat: 15 }) },
      { label: 'Lean into it with a lip-sync series', fn: () => R('Self-aware. It became a trend.', { fp: 0.04, rep: 1 }) },
    ],
  },
  plagiarism: {
    random: true, neg: true, w: 1.3, when: () => S.stats.posts >= 10, title: () => 'Accused of stealing an idea',
    text: () => 'A creator with 3,000 followers says your recent post copied their video frame by frame. Side-by-sides are trending.',
    choices: () => [
      { label: 'Credit them and shout them out', fn: () => R('Their account blew up. So did your goodwill.', { rep: 4, heat: -6 }) },
      { label: 'Deny it', fn: () => chance(0.5) ? R('It turned out to be a coincidence. Mostly.', { heat: 3 }) : R('More receipts surfaced.', { rep: -7, heat: 16 }) },
      { label: 'Offer them a collab', sub: '−15 energy', fn: () => R('Turned drama into content. Big win.', { energy: -15, fp: 0.02, rep: 3 }) },
    ],
  },
  three_am: {
    random: true, neg: true, w: 1, when: () => S.stats.posts >= 5, title: () => 'The 3 AM post',
    text: () => 'You posted "honestly everyone in this industry is fake" at 3 AM and fell asleep. It has 2 million views.',
    choices: () => [
      { label: 'Delete it and apologize', fn: () => R('Quick cleanup. Screenshots exist.', { heat: 5, rep: -1 }) },
      { label: 'Double down with names', sub: 'Big reach, big fire', fn: () => R('You named three stars. All three responded.', { fp: 0.05, heat: 22, rep: -6 }) },
      { label: '"My cat walked on my phone"', fn: () => chance(0.5) ? R('The cat became a meme. Saved.', { fp: 0.02 }) : R('You do not own a cat. People checked.', { rep: -4, heat: 10 }) },
    ],
  },
  star_subtweet: {
    random: true, neg: true, w: 1.3, when: () => T() >= 3e4, ctx: () => ({ npc: anyParody() }), title: (c) => `${NPCS[c.npc].name} subtweeted you`,
    text: (c) => `${NPCS[c.npc].name} posted "some new creators think one viral post makes them a star 🙄" right after your last hit. Everyone knows it's about you.`,
    choices: (c) => [
      { label: 'Quote it with a comeback', sub: `Charisma ${skillLvl('charisma')}`, fn: () => chance(0.3 + skillLvl('charisma') * 0.06) ? R('Your comeback got more likes than their post.', { fp: 0.05, rel: { [c.npc]: -10 } }) : R('Their fans ate you alive.', { heat: 12, rep: -3, rel: { [c.npc]: -10 } }) },
      { label: 'Challenge them to a clash battle', sub: 'Three rounds, public vote', fn: () => { startBattle(c.npc); return R('It\'s on.'); } },
      { label: 'Post "thank you for noticing me"', fn: () => R('Humble and funny. Even their fans laughed.', { fp: 0.02, rep: 2, rel: { [c.npc]: 3 } }) },
    ],
  },
  company_roast: {
    random: true, neg: true, w: 1.2, when: () => T() >= 1e4, ctx: () => ({ co: pick(Object.keys(COMPANIES).filter((k) => COMPANIES[k].roast)) }),
    title: (c) => `${COMPANIES[c.co].name} roasted you`, text: (c) => `@${COMPANIES[c.co].handle} quote-posted your latest: "${pick(['we have seen better content on a receipt', 'this post is our new crying-in-the-walk-in-freezer playlist', 'blink twice if your manager is holding you hostage'])}". 4 million likes.`,
    choices: (c) => [
      { label: 'Roast them back', sub: `Charisma ${skillLvl('charisma')}`, fn: () => chance(0.35 + skillLvl('charisma') * 0.05) ? R('You won the exchange. They sent you a gift card as a white flag.', { fp: 0.05, money: 500 }) : R('Never fight a brand social team. They are paid to do this.', { heat: 8, rep: -2 }) },
      { label: 'Laugh it off', fn: () => R('Good sport. Their followers started following you.', { fp: 0.02, rep: 1 }) },
      { label: 'Ask them for a sponsorship', fn: () => { const b = BRANDS[c.co]; mail({ type: 'deal', brand: c.co, pay: dealPay(b), req: 1, days: 5, from: b.name, subject: 'Fine. Let\'s work together.', body: `${b.name} respects the hustle.` }); return R('They said yes, somehow. Check your messages.'); } },
    ],
  },
  tax_audit: {
    random: true, neg: true, w: 1, when: () => S.money >= 1e5, title: () => 'Tax audit',
    text: () => 'The tax office has questions about your "business expenses", including 400 ring lights.',
    choices: () => [
      { label: 'Hire an accountant', sub: `${money(Math.round(S.money * 0.03))}`, fn: () => R('Clean books. Nothing found.', { money: -Math.round(S.money * 0.03) }) },
      { label: 'Wing it', fn: () => chance(0.5) ? R('You got lucky.', {}) : R('Fined for creative accounting.', { money: -Math.round(S.money * 0.12), rep: -2, legal: true }) },
    ],
  },
  country_ban: {
    random: true, neg: true, w: 1, when: () => S.heat >= 45 && T() >= 1e5, ctx: () => ({ cc: geoPick(true) }),
    title: (c) => `Restricted in ${COUNTRIES[c.cc].name} ${COUNTRIES[c.cc].flag}`,
    text: (c) => `After the latest controversy, your account was temporarily restricted for users in ${COUNTRIES[c.cc].name}. That's ${Math.round((S.geo[c.cc] || 0.02) * 100)}% of your audience.`,
    choices: (c) => [
      { label: 'Apologize in their language', sub: '−20 energy', fn: () => { geoAdd(c.cc, 0.02); return R('The restriction was lifted and local fans loved the effort.', { energy: -20, rep: 3 }); } },
      { label: 'Ignore it', fn: () => { const share = S.geo[c.cc] || 0.02; geoAdd(c.cc, -share * 0.7); return R('You lost most of that audience.', { fp: -share * 0.6 }); } },
      { label: 'Post about censorship', fn: () => R('It went viral everywhere except there.', { fp: 0.02, heat: 10 }) },
    ],
  },
  hot_seat_invite: {
    random: true, w: 1.2, when: () => T() >= 1e4, title: () => 'Hot seat interview',
    text: () => 'A viral interview show wants you in the hot seat: three rapid-fire questions, no editing, no PR team.',
    choices: () => [
      { label: 'Take the hot seat', sub: 'Three spicy questions', fn: () => { S.queue.unshift({ ev: '_hotseat', ctx: { qs: shuffle(HOT_SEAT.map((_, i) => i)).slice(0, 3), i: 0 } }); return R('Lights. Camera. Sweat.'); } },
      { label: 'Decline', fn: () => R('Your PR team breathes again.') },
    ],
  },
  _hotseat: {
    eyebrow: (c) => `Hot seat · Question ${c.i + 1} of 3`,
    title: (c) => HOT_SEAT[c.qs[c.i]].q,
    text: () => 'The host leans in. The audience goes quiet.',
    choices: (c) => HOT_SEAT[c.qs[c.i]].a.map(([label, fx, txt]) => ({ label, fn: () => {
      c.i++;
      if (c.i < 3) S.queue.unshift({ ev: '_hotseat', ctx: c });
      else { S.stats.hotseats = (S.stats.hotseats || 0) + 1; gainEnergy(12, 'Survived the hot seat'); news(`@${S.handle}'s hot seat interview is the most-watched clip of the day`, true); }
      return R(txt, fx);
    } })),
  },
  fell_off: {
    title: () => '"Did they fall off?"',
    text: () => 'Three weak posts in a row. A thread called "the fall of @' + esc(S.handle) + '" is trending, with your view counts charted.',
    choices: () => [
      { label: 'Announce a comeback era', sub: '−15 energy, next posts get a boost', fn: () => { S.algoBoost[pick(unlockedIds())] = 1.4; return R('The tease worked. People are watching what you post next.', { energy: -15, heat: 4 }); } },
      { label: 'Take a short break', fn: () => R('Mysterious. Some fans left, the rest got curious.', { fp: -0.02, stress: -20 }) },
      { label: 'Clap back at the thread', fn: () => R('Engagement up. Respect down.', { fp: 0.01, heat: 10, rep: -3 }) },
    ],
  },
  tea_fallout: {
    title: (c) => `${NPCS[c.npc].name} responded to the tea`,
    text: (c) => `${NPCS[c.npc].name} saw your post. Their team is drafting something.`,
    choices: (c) => {
      const ego = NPCS[c.npc].ego;
      return [
        { label: 'Stand by it', fn: () => chance(ego * 0.5) ? R(`${NPCS[c.npc].name.split(' ')[0]}'s lawyers sent a cease and desist. It's silly, but it costs money.`, { money: -Math.max(1000, Math.round(S.money * 0.05)), heat: 8, legal: true }) : R('They posted "lol ok" and the internet ate it up.', { fp: 0.03, heat: 6 }) },
        { label: 'Say it was a joke', fn: () => R('Half-believed. The tea still spread.', { rep: -1, heat: -4 }) },
        { label: 'Apologize privately', fn: () => R('They appreciated it. Somewhat.', { rel: { [c.npc]: 15 }, heat: -6 }) },
      ];
    },
  },
});

/* ---------- world tour ---------- */
function travelCost(cc) { return cc === S.country ? 300 : 1200 + (hashStr(cc) % 9) * 350; }
function travelTo(cc) {
  const cost = travelCost(cc);
  if (!spend(cost)) { toast('Not enough money for that trip.', 'bad'); return false; }
  S.travelUntil = S.day + 2; S.travelCountry = cc;
  if (!S.visited.includes(cc)) S.visited.push(cc);
  geoAdd(cc, 0.05);
  addFollowersPct(0.008 * diffM());
  S.stress = clamp(S.stress - 12, 0, 100);
  const locals = Object.keys(NPCS).filter((id) => NPC_COUNTRY[id] === cc);
  if (locals.length && chance(0.6)) { const id = pick(locals); changeRel(id, 10); notify('system', null, `You ran into ${NPCS[id].name} in ${COUNTRIES[cc].name}. They followed you for the trip.`); log(`Met ${NPCS[id].name} in ${COUNTRIES[cc].name}.`, 'gold'); }
  news(`@${S.handle} lands in ${COUNTRIES[cc].name} ${COUNTRIES[cc].flag}`, true);
  gainEnergy(10, `Jet-set energy: ${COUNTRIES[cc].name}`);
  return true;
}
