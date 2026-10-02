/* Clout Chaser — daily quests (three a day plus a bonus chest) and a fresh batch of random events */
'use strict';

/* ---------- daily quests ---------- */
const QUEST_POOL = [
  { id: 'posts', text: (n) => `Publish ${n} posts`, n: [3, 4, 5], kind: 'post' },
  { id: 'viral', text: () => 'Go viral once', n: [1], kind: 'viral', hard: true },
  { id: 'stream', text: () => 'Go live on Streamly', n: [1], kind: 'stream', need: () => S.platforms.live.unlocked },
  { id: 'replies', text: () => 'Reply to your comments', n: [1], kind: 'reply' },
  { id: 'bet', text: () => 'Win a sports bet', n: [1], kind: 'betwin' },
  { id: 'casino', text: (n) => `Play ${n} casino games`, n: [3, 5], kind: 'casino' },
  { id: 'stunt', text: () => 'Land a stunt in the Danger Zone', n: [1], kind: 'stunt' },
  { id: 'challenge', text: () => 'Complete the daily challenge', n: [1], kind: 'challenge' },
  { id: 'spin', text: () => 'Use the daily spin', n: [1], kind: 'spin' },
  { id: 'gain', text: (n) => `Gain ${fmt(n)} followers today`, n: [0], kind: 'gain', dyn: () => Math.max(50, Math.round(totalFollowers() * 0.03 / 10) * 10) },
  { id: 'earn', text: (n) => `Earn ${money(n)} today`, n: [0], kind: 'earn', dyn: () => Math.max(200, Math.round(Math.max(S.money, 1000) * 0.15 / 10) * 10) },
  { id: 'gift', text: () => 'Send a gift to a friend', n: [1], kind: 'gift', need: () => typeof Cloud !== 'undefined' && Cloud.mode },
  { id: 'vault', text: () => 'Drop something on FanVault', n: [1], kind: 'vault', need: () => S.platforms.vault && S.platforms.vault.unlocked },
  { id: 'deal', text: () => 'Finish a brand deal', n: [1], kind: 'deal', need: () => S.deals.some((d) => d.status === 'active') },
  { id: 'story', text: () => 'Watch a star\'s story', n: [1], kind: 'story' },
];
function newQuests() {
  const pool = shuffle(QUEST_POOL.filter((q) => !q.need || q.need()));
  const picked = [];
  for (const q of pool) { if (picked.length >= 3) break; if (q.hard && picked.some((p) => p.hard)) continue; picked.push(q); }
  S.quests = { day: S.day, chest: false, list: picked.map((q) => { const n = q.dyn ? q.dyn() : pick(q.n); return { id: q.id, kind: q.kind, n, have: 0, text: q.text(n), done: false, claimed: false, hard: !!q.hard }; }) };
  S.quests.base = { f: totalFollowers(), earned: S.stats.earned };
}
function questsInit() { if (!S.quests || S.quests.day !== S.day) newQuests(); return S.quests; }
function questEvent(kind, amount = 1) {
  if (!S) return;
  const Q = questsInit();
  for (const q of Q.list) {
    if (q.done || q.kind !== kind) continue;
    q.have = Math.min(q.n, q.have + amount);
    if (q.have >= q.n) { q.done = true; notify('system', null, `Quest complete: ${q.text}. Claim your reward!`); toast(`✅ Quest done: ${q.text}`, 'gold'); }
  }
}
function questTrack() {
  // followers and money are measured, not counted
  const Q = questsInit();
  for (const q of Q.list) {
    if (q.done) continue;
    if (q.kind === 'gain') q.have = Math.max(0, Math.min(q.n, Math.round(totalFollowers() - Q.base.f)));
    if (q.kind === 'earn') q.have = Math.max(0, Math.min(q.n, Math.round(S.stats.earned - Q.base.earned)));
    if (q.have >= q.n) { q.done = true; toast(`✅ Quest done: ${q.text}`, 'gold'); }
  }
}
const questReward = (q) => { const base = Math.max(150, totalFollowers() * 0.002); return { cash: Math.round(base * (q.hard ? 3 : 1) / 10) * 10, xp: q.hard ? 120 : 60, e: q.hard ? 20 : 10 }; };
function questsCard(full) {
  const Q = questsInit(); questTrack();
  const all = Q.list.every((q) => q.claimed);
  const chest = Math.round(Math.max(500, totalFollowers() * 0.008) / 10) * 10;
  return `<div class="quests ${full ? 'full' : ''}"><div class="row between"><b>📋 Daily quests</b><span class="small muted">${Q.list.filter((q) => q.done).length}/3 · new quests every day</span></div>
    ${Q.list.map((q, i) => { const rw = questReward(q); return `<div class="quest ${q.done ? 'done' : ''}"><div style="flex:1;min-width:0"><span class="small">${q.hard ? '<span class="pill like">Hard</span> ' : ''}${esc(q.text)}</span><div class="meter ${q.done ? 'good' : 'gold'}"><i style="width:${(q.have / q.n) * 100}%"></i></div><span class="small muted">${q.kind === 'earn' ? money(q.have) : fmt(q.have)} / ${q.kind === 'earn' ? money(q.n) : fmt(q.n)} · ${money(rw.cash)}, +${rw.e}⚡, +${rw.xp} Pass XP</span></div>
      ${q.claimed ? '<span class="pill good">✓</span>' : q.done ? btn('Claim', 'questClaim', i, 'sm primary') : ''}</div>`; }).join('')}
    <div class="row between"><span class="small">🎁 Finish all three: <b>${money(chest)}</b> + 1 max energy</span>${Q.chest ? '<span class="pill good">Opened</span>' : all ? btn('Open chest', 'questChest', '', 'sm primary') : `<span class="small muted">${Q.list.filter((q) => q.claimed).length}/3 claimed</span>`}</div></div>`;
}
const QUEST_ACT = {
  questClaim: (a) => { const q = questsInit().list[+a]; if (!q || !q.done || q.claimed) return 'norender'; q.claimed = true; const rw = questReward(q); S.money += rw.cash; S.stats.earned += 0; gainEnergy(rw.e, 'Quest reward'); if (typeof passXP === 'function') passXP(rw.xp); S.stats.quests = (S.stats.quests || 0) + 1; toast(`Quest reward: ${money(rw.cash)}`, 'gold'); sound('cash'); },
  questChest: () => { const Q = questsInit(); if (Q.chest || !Q.list.every((q) => q.claimed)) return 'norender'; Q.chest = true; const v = Math.round(Math.max(500, totalFollowers() * 0.008) / 10) * 10; S.money += v; S.bonusMaxE = (S.bonusMaxE || 0) + 1; S.stats.chests = (S.stats.chests || 0) + 1; toast(`Chest opened: ${money(v)} and +1 max energy!`, 'gold'); celebrate('gold'); sound('cash'); },
};
ACHIEVEMENTS.push(
  ['quest10', 'Quest grinder', 'Claim 10 daily quests', () => (S.stats.quests || 0) >= 10],
  ['chest7', 'Treasure hunter', 'Open 7 daily quest chests', () => (S.stats.chests || 0) >= 7],
);

/* ---------- more random events ---------- */
const anyStar = () => pick(Object.keys(NPCS));
Object.assign(EVENTS, {
  meme_global: { random: true, w: 1.2, when: () => T() >= 2000, title: () => 'You became a meme',
    text: () => 'A screenshot of your face mid-sneeze is now the internet\'s favorite reaction image. It\'s in 40 languages.',
    choices: () => [
      { label: 'Embrace it: post the original', fn: () => R('Self-aware king/queen behavior. The meme now has your handle on it.', { fp: 0.03, rep: 1 }) },
      { label: 'Sell meme merch', sub: '+money', fn: () => R('The sneeze hoodie sold out in a day.', { money: Math.round(Math.max(800, T() * 0.02)), fp: 0.01 }) },
      { label: 'Ask people to stop', fn: () => R('They did not stop. They used it on your request post.', { heat: 4 }) }] },
  fan_tattoo: { random: true, w: 1, when: () => T() >= 5000, title: () => 'A fan tattooed your face on their arm',
    text: () => '@' + fanHandle() + ' posted a fresh tattoo of your face. It\'s… 70% accurate.',
    choices: () => [
      { label: 'Repost it with love', fn: () => R('The tattoo artist is now booked for a year. Fans adore you.', { rep: 2, fp: 0.01 }) },
      { label: 'Roast the likeness (gently)', fn: () => chance(0.6) ? R('Everyone laughed, including the fan.', { fp: 0.015 }) : R('The fan cried. The internet sided with them.', { rep: -3, heat: 8 }) }] },
  ai_clone: { random: true, neg: true, w: 1, when: () => T() >= 20000, title: () => 'An AI clone of you is posting',
    text: () => 'An account is posting AI videos of "you" selling miracle pills. Your DMs are full of confused fans.',
    choices: () => [
      { label: 'Expose it on a livestream', sub: '−15 energy', fn: () => R('You debunked it live. Fans now spot fakes for you.', { energy: -15, rep: 2, fp: 0.01 }) },
      { label: 'Report and move on', fn: () => S.team.cyber ? R('Your cybersecurity expert had it taken down in an hour.', { rep: 1 }) : R('Took a week to remove. Some fans bought the pills.', { rep: -3 }) }] },
  airport_paps: { random: true, w: 1.1, when: () => T() >= 10000, title: () => 'Airport paparazzi ambush',
    text: () => 'You landed looking like a raccoon after a 14-hour flight. Cameras everywhere.',
    choices: () => [
      { label: 'Strike a pose anyway', fn: () => R('"Airport fit of the year" trends. Comfort brands want you.', { fp: 0.02, money: Math.round(Math.max(300, T() * 0.004)) }) },
      { label: 'Hide behind your hoodie', fn: () => R('The blurry hoodie photo became a meme anyway.', { fp: 0.008 }) }] },
  celeb_dm: { random: true, w: 1, when: () => T() >= 30000, ctx: () => ({ n: anyStar() }), title: (c) => `${npcName(c.n)} slid into your DMs`,
    text: (c) => `"hey 👀 your last post was crazy" — @${NPCS[c.n].handle}. It\'s 2 AM.`,
    choices: (c) => [
      { label: 'Reply smooth', sub: `Charisma ${skillLvl('charisma')}`, fn: () => chance(0.4 + skillLvl('charisma') * 0.05) ? R('They want to collab. And maybe brunch.', { rel: { [c.n]: 15 }, fp: 0.01 }) : R('You sent a GIF. They left you on read.', { rel: { [c.n]: -3 } }) },
      { label: 'Screenshot it for clout', fn: () => R('Clout acquired. Relationship ruined.', { fp: 0.025, heat: 10, rel: { [c.n]: -25 } }) },
      { label: 'Leave them on read', fn: () => R('Power move. They followed you a day later.', { rel: { [c.n]: 5 }, rep: 1 }) }] },
  ripped_pants: { random: true, neg: true, w: 0.9, when: () => S.stats.posts >= 10, title: () => 'Your pants ripped on camera',
    text: () => 'Mid-dance, a loud RIIIP. You kept going. The clip has 9 million views.',
    choices: () => [
      { label: 'Own it: "new pants who dis"', fn: () => R('Relatable icon. A jeans brand sent you 40 pairs.', { fp: 0.025, rep: 1 }) },
      { label: 'Delete the clip', fn: () => R('Too late. It\'s been reposted 30,000 times.', { heat: 6, stress: 8 }) }] },
  death_rumor: { random: true, neg: true, w: 0.6, when: () => T() >= 1e5, title: () => 'The internet thinks you died',
    text: () => 'A fake news account says you "passed away peacefully". Tributes are pouring in.',
    choices: () => [
      { label: 'Post "I\'m alive lol"', fn: () => R('The comeback post got more likes than the tributes.', { fp: 0.02 }) },
      { label: 'Read the nicest tributes on stream', fn: () => R('Wholesome and hilarious. Peak content.', { rep: 2, fp: 0.015, energy: -10 }) }] },
  baby_name: { random: true, w: 0.8, when: () => T() >= 50000, title: () => 'A fan named their baby after you',
    text: () => () => '', choices: () => [
      { label: 'Send a gift basket', sub: '−$500', disabled: () => S.money < 500, fn: () => R('The family\'s post went viral. You look like a saint.', { money: -500, rep: 3, fp: 0.01 }) },
      { label: 'Post about it', fn: () => R('Half the comments: cute. Half: concerning.', { fp: 0.01, heat: 3 }) }] },
  teacher: { random: true, neg: true, w: 0.8, when: () => T() >= 20000, title: () => 'Your old teacher posted about you',
    text: () => '"I always knew they\'d be famous. They still owe me a book report." Your 8th grade photo is attached.',
    choices: () => [
      { label: 'Finally turn in the book report', fn: () => R('You did it live. Grade: B-. The internet cheered.', { rep: 2, fp: 0.015 }) },
      { label: 'Laugh it off', fn: () => R('The glow-up comparisons are trending.', { fp: 0.01 }) }] },
  podcast: { random: true, w: 1.2, when: () => T() >= 15000, title: () => 'Podcast invite',
    text: () => 'The "Two Guys Talking" podcast (12M listeners) wants you for a 3-hour episode.',
    choices: () => [
      { label: 'Go on and be honest', sub: '−20 energy', fn: () => R('Great episode. Clips everywhere for a week.', { energy: -20, fp: 0.03, rep: 1 }) },
      { label: 'Go on and be controversial', sub: '−20 energy', fn: () => chance(0.5) ? R('The hottest episode of the year.', { energy: -20, fp: 0.05, heat: 15 }) : R('The clip got taken out of context. Everywhere.', { energy: -20, fp: 0.02, heat: 25, rep: -5 }) },
      { label: 'Decline', fn: () => R('They booked your rival instead.') }] },
  gala: { random: true, w: 0.8, when: () => T() >= 2e5, title: () => 'Invited to the Glitz Gala',
    text: () => 'The fashion event of the year. The theme is "Chrome Fantasy". Everyone will be judging.',
    choices: () => [
      { label: 'Go all out', sub: '$5,000 outfit', disabled: () => S.money < 5000, fn: () => chance(0.65) ? R('Best dressed lists everywhere. Brands are calling.', { money: -5000, fp: 0.04, rep: 3 }) : R('Worst dressed lists everywhere. Still trending though.', { money: -5000, fp: 0.025, heat: 10 }) },
      { label: 'Ignore the theme on purpose', fn: () => R('Bold. Divisive. Memorable.', { fp: 0.02, heat: 8 }) },
      { label: 'Skip it', fn: () => R('FOMO hits hard at 11 PM.', { stress: 6 }) }] },
  trend_started: { random: true, w: 1, when: () => S.stats.posts >= 15, title: () => 'You accidentally started a trend',
    text: () => 'A random move from your last video is now a dance trend. Your name is on 200,000 videos.',
    choices: () => [
      { label: 'Do a tutorial', sub: '−10 energy', fn: () => R('The tutorial is your most-watched post ever.', { energy: -10, fp: 0.04 }) },
      { label: 'Claim credit loudly', fn: () => R('The trend is yours forever now. A few people find it cringe.', { fp: 0.025, heat: 5 }) }] },
  salary_leak: { random: true, neg: true, w: 0.7, when: () => S.stats.earned >= 1e5, title: () => 'Your earnings leaked',
    text: () => `A spreadsheet claims you made ${money(S.stats.earned)} so far. Everyone has opinions.`,
    choices: () => [
      { label: 'Confirm and donate 5%', disabled: () => S.money < S.stats.earned * 0.05, fn: () => R('Respect from everyone. Mostly.', { money: -Math.round(S.stats.earned * 0.05), rep: 5 }) },
      { label: '"It\'s actually more"', fn: () => R('Flex of the year. Also hate of the year.', { fp: 0.02, heat: 15, rep: -3 }) },
      { label: 'Say nothing', fn: () => R('It blew over in three days.', { heat: 4 }) }] },
});
EVENTS.baby_name.text = () => `${pick(['A couple in Ohio', 'Twins in Manila', 'A family in São Paulo', 'A dad in Lagos'])} named their newborn after you. The birth announcement tagged you.`;
