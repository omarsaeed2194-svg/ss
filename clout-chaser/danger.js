/* Clout Chaser — the Danger Zone: risky stunts and shady schemes, with real consequences */
'use strict';

/* Stunts: big viral upside, real downside. risk = base chance something goes wrong. */
const STUNTS = {
  rooftop:  { name: 'Rooftop selfie',            e: 15, risk: 0.22, harm: 'injury', boost: 0.05, desc: 'Edge of a 40-floor building at sunset. One gust of wind.' },
  prank:    { name: 'Public prank',              e: 15, risk: 0.3,  harm: 'arrest', boost: 0.04, desc: 'Fake a robbery at a mall. Security has no sense of humor.' },
  pepper:   { name: 'World\'s hottest pepper',   e: 10, risk: 0.25, harm: 'injury', boost: 0.03, desc: 'Two million Scoville units. On camera. No milk.' },
  driving:  { name: 'Film while speeding',       e: 20, risk: 0.4,  harm: 'crash',  boost: 0.09, desc: '180 km/h, phone in one hand. The worst idea on this list.' },
  tiger:    { name: 'Pose with a "tame" tiger',  e: 20, risk: 0.3,  harm: 'injury', boost: 0.07, desc: 'The owner says it\'s friendly. The owner has nine fingers.' },
  urbex:    { name: 'Urban exploring',           e: 20, risk: 0.3,  harm: 'arrest', boost: 0.05, desc: 'Abandoned factory, rotten floors, private property signs.' },
  nosleep:  { name: '48-hour no-sleep stream',   e: 40, risk: 0.35, harm: 'burnout', boost: 0.06, desc: 'Chat keeps you awake. Your body does not consent.' },
  hoax:     { name: 'Fake your disappearance',   e: 25, risk: 0.65, harm: 'backlash', boost: 0.12, desc: 'Go silent, let fans panic, reappear with a "comeback video".' },
};
/* Tiers: low risk pays small but steady, extreme risk pays a fortune (and hurts like one) */
Object.values(STUNTS).forEach((s) => { s.tier = s.tier || 'mid'; });
Object.assign(STUNTS, {
  icebath:   { tier: 'low', name: 'Ice bath challenge',         e: 8,  risk: 0.07, harm: 'injury', boost: 0.02,  desc: 'Three minutes in ice water, live. Your scream is the content.' },
  bungee:    { tier: 'low', name: 'Bungee jump (with a pro)',   e: 12, risk: 0.06, harm: 'injury', boost: 0.03,  desc: 'Certified instructor, triple-checked cord. Still, you\'re falling off a bridge.' },
  busk:      { tier: 'low', name: 'Busk in Times Square',       e: 10, risk: 0.1,  harm: 'arrest', boost: 0.025, desc: 'Sing for strangers without a permit. Cops might ask questions.' },
  steak:     { tier: 'low', name: '72oz steak challenge',       e: 12, risk: 0.12, harm: 'food',   boost: 0.03,  desc: 'Finish it in an hour and it\'s free. Your stomach signs no waiver.' },
  mystery:   { tier: 'low', name: 'Mystery street food tour',   e: 10, risk: 0.14, harm: 'food',   boost: 0.035, desc: 'Ten stalls, no menu, point at whatever smells best. Food bloggers live for this.' },
  gauntlet:  { tier: 'extreme', name: 'Spiciest food gauntlet', e: 25, risk: 0.55, harm: 'food',   boost: 0.15, desc: 'Ten dishes, each hotter than the last, ending with the Reaper wing. Paramedics on standby.' },
  skydive:   { tier: 'extreme', name: 'Solo skydive, first time', e: 30, risk: 0.6, harm: 'crash', boost: 0.2, desc: 'No instructor. You watched a tutorial. Twice.' },
  sharks:    { tier: 'extreme', name: 'Swim with sharks, no cage', e: 30, risk: 0.62, harm: 'injury', boost: 0.22, desc: 'The guide says they\'re "mostly chill". Mostly.' },
  wedding:   { tier: 'extreme', name: 'Crash a celebrity wedding', e: 25, risk: 0.6, harm: 'arrest', boost: 0.18, desc: 'Sneak in as a waiter, film the first dance, try to catch the bouquet.' },
  tower:     { tier: 'extreme', name: 'Free-climb a skyscraper',  e: 35, risk: 0.72, harm: 'crash', boost: 0.28, desc: '90 floors, bare hands, a GoPro on your head. The most dangerous thing in this game.' },
});
const STUNT_TIERS = { low: ['Low risk', 'Safer stunts, smaller prizes. Food bloggers start here.'], mid: ['Risky', 'Real danger, real payouts.'], extreme: ['Extreme', 'Huge prizes. Huge chance it goes very wrong.'] };

/* Schemes: money now, consequences later. risk feeds the investigation meter. */
const SCHEMES = {
  spamlinks: { name: 'Spam scam links in replies', e: 8,  cut: 0.012, risk: 0.18, rep: -3, desc: '"Click to claim your prize 🎁" links in your own replies. Fans who click lose money.' },
  giveaway:  { name: 'Fake giveaway',              e: 10, cut: 0.03,  risk: 0.32, rep: -1, desc: 'Free phones! Winners just pay "shipping". Nobody wins.' },
  coin:      { name: 'Pump your own coin ($CLOUT)', e: 15, cut: 0.08, risk: 0.5,  rep: -2, desc: 'Hype a coin, sell at the top, watch it go to zero.' },
  preorder:  { name: 'Fake merch preorder',        e: 10, cut: 0.05,  risk: 0.4,  rep: -1, desc: 'Take money for hoodies that will never exist.' },
  data:      { name: 'Sell fans\' emails',         e: 6,  cut: 0.02,  risk: 0.28, rep: 0,  desc: 'A "data partner" pays per email. Fans get 400 spam emails a day.' },
};
const VICTIM_DMS = ['I lost $40 on your giveaway?? I trusted you', 'my little brother clicked your link and now his account is gone', 'where is my hoodie. it\'s been 6 weeks', 'the coin went to zero. that was my rent', 'why am I getting 300 spam emails a day since your newsletter'];

const injured = () => S.injuredUntil && S.injuredUntil >= S.day;
function investigationLabel(v = S.investigation || 0) { return v >= 70 ? ['Under investigation', 'bad'] : v >= 40 ? ['Being watched', 'warn'] : v >= 15 ? ['Rumors', 'warn'] : ['Clean', 'good']; }
function stuntOdds(id) {
  const st = STUNTS[id];
  let r = st.risk * (1 + Math.max(0, S.stress - 50) / 100) * (injured() ? 1.3 : 1);
  if (st.harm === 'injury' && S.team.bodyguard) r *= Math.max(0.3, 1 - 0.3 * tm('bodyguard'));
  if (st.harm === 'arrest' && S.team.lawyer) r *= Math.max(0.35, 1 - 0.25 * tm('lawyer'));
  r *= 1 + stuntsToday() * 0.15; // tired daredevils slip
  return clamp(r, 0.05, 0.9);
}
function schemeOdds(id) {
  let r = SCHEMES[id].risk * (0.5 + (S.investigation || 0) / 100) * (S.team.pr ? Math.max(0.5, 1 - 0.2 * tm('pr')) : 1) * (S.team.lawyer ? Math.max(0.5, 1 - 0.15 * tm('lawyer')) : 1);
  return clamp(r, 0.05, 0.95);
}

/* The prize: the riskier the stunt, the bigger the payout. A daredevil streak multiplies it. */
const stuntStreakX = () => 1 + Math.min(5, S.stuntStreak || 0) * 0.25;
const stuntsToday = () => (S.flags.stuntDay === S.day ? S.flags.stuntN || 0 : 0);
const stuntNumb = () => Math.pow(0.6, stuntsToday()); // the audience gets numb to a second stunt in one day
function stuntPrize(id, viral = false) {
  const st = STUNTS[id], k = (1 + st.risk * 4 + (st.tier === 'extreme' ? st.risk * 6 : 0)) * (st.tier === 'low' ? 0.35 : 1);
  return {
    cash: Math.round(Math.max(800, totalFollowers() * 0.08) * k * (viral ? 2.5 : 1) * stuntStreakX() * stuntNumb() / 50) * 50,
    fp: st.boost * 2 * (viral ? 2 : 1) * stuntStreakX() * stuntNumb(),
  };
}

/* ---------- doing them ---------- */
function doStunt(id) {
  const st = STUNTS[id];
  S.stats.stunts = (S.stats.stunts || 0) + 1;
  S.stress = clamp(S.stress + 8, 0, 100);
  const fail = chance(stuntOdds(id));
  let title, text, fx;
  if (!fail) {
    const viral = chance(0.35 + st.risk * 0.2);
    const jackpot = chance(0.06 + st.risk * 0.12);
    const prize = stuntPrize(id, viral);
    S.flags.stuntN = stuntsToday() + 1; S.flags.stuntDay = S.day;
    let cash = prize.cash;
    if (jackpot) cash *= 3;
    fx = { fp: prize.fp, money: cash, heat: id === 'hoax' ? 25 : id === 'driving' ? 15 : 6, rep: id === 'driving' || id === 'hoax' ? -3 : 1 };
    S.stuntStreak = (S.stuntStreak || 0) + 1;
    if (S.challenge && !S.challenge.done && S.challenge.req.stunt && (S.challenge.req.stunt === st.tier)) completeChallenge();
    S.stats.stuntWins = (S.stats.stuntWins || 0) + 1;
    if (typeof passXP === 'function') passXP(25);
    S.stats.stuntCash = (S.stats.stuntCash || 0) + cash;
    title = jackpot ? `${st.name}: JACKPOT` : viral ? `${st.name}: it went VIRAL` : `${st.name}: you pulled it off`;
    text = viral ? 'The clip is everywhere. Reaction channels are reacting to the reaction channels.' : 'Hands shaking, but the footage is incredible.';
    text += ` Sponsors and ad money: ${money(cash)}.`;
    if (jackpot) text += ' Red Bolt energy drink saw the clip and paid triple to put their logo on it. 🏆';
    if (S.stuntStreak >= 2) text += ` Daredevil streak ×${S.stuntStreak}: prizes are ×${stuntStreakX().toFixed(2)} now. Don't push your luck… or do.`;
    gainEnergy(Math.round(st.e * 0.6), 'Adrenaline rush');
    if (viral) { S.stats.viral++; gainEnergy(20, 'Your stunt went viral'); news(`@${S.handle}'s ${st.name.toLowerCase()} clip is the most-watched video of the day`, true); }
    if (jackpot) news(`Red Bolt signs @${S.handle} after insane ${st.name.toLowerCase()} clip`, true);
    if ((viral || jackpot) && typeof celebrate === 'function') celebrate(jackpot ? 'gold' : 'viral');
    sound('cash');
    if (id === 'hoax') { S.queue.push({ ev: 'hoax_fallout', ctx: {} }); text = 'Fans spent 3 days looking for you. Your "comeback" video has 40M views. Now people are asking questions.'; }
    if (id === 'nosleep') fx.stress = 35;
  } else {
    S.stats.stuntFails = (S.stats.stuntFails || 0) + 1;
    S.stuntStreak = 0;
    S.flags.stuntN = stuntsToday() + 1; S.flags.stuntDay = S.day;
    const pay = (n) => -Math.round(Math.max(n, S.money * 0.06));
    if (st.harm === 'injury' || st.harm === 'crash') {
      const days = st.harm === 'crash' ? 5 : ri(2, 4);
      S.injuredUntil = S.day + days; S.flags.hospital = S.day;
      title = st.harm === 'crash' ? 'You crashed' : 'You got hurt';
      text = st.harm === 'crash' ? `${{ skydive: 'Your chute opened late. You landed in a cornfield with a broken leg.', tower: 'You slipped on floor 61 and a window-cleaning platform caught you. Broken ribs.' }[id] || 'You crashed the car. You\'re alive, with a broken arm.'} ${days} days of reduced energy, and the internet is furious that you filmed it.` : `Hospital. Stitches. ${days} days of reduced energy. Some fans are sending love, others are sending "I told you so".`;
      fx = st.harm === 'crash' ? { money: pay(8000), rep: -12, heat: 30, fp: -0.03 } : { money: pay(2000), fp: 0.01, stress: 15 };
      news(st.harm === 'crash' ? `@${S.handle} ${{ skydive: 'injured in botched solo skydive', tower: 'rescued from skyscraper mid-climb' }[id] || 'crashes while filming at high speed'}` : `@${S.handle} hospitalized after ${st.name.toLowerCase()} stunt`, true);
    } else if (st.harm === 'food') {
      const days = st.tier === 'extreme' ? 3 : 1;
      S.injuredUntil = S.day + days;
      title = st.tier === 'extreme' ? 'Ambulance on dish seven' : 'Food poisoning';
      text = st.tier === 'extreme' ? `You collapsed after the Reaper wing. ${days} days of reduced energy. The clip of you crying into a glass of milk has its own fan edits.` : 'You spent the night hugging a toilet. A day of reduced energy, but "I survived" posts do numbers.';
      fx = st.tier === 'extreme' ? { money: pay(3000), stress: 20, fp: 0.02, rep: -1 } : { money: pay(150), stress: 10, fp: 0.005 };
      news(`@${S.handle} ${st.tier === 'extreme' ? 'hospitalized after spicy food gauntlet' : 'gets food poisoning on camera'}`, true);
    } else if (st.harm === 'arrest') {
      S.flags.mugshot = S.day; S.day += 1; S.lastPostDay = S.day;
      title = 'You got arrested';
      text = 'A night in a holding cell, a fine, and a mugshot that is already a meme. You lost a day.';
      fx = { money: pay(S.team.lawyer ? 800 : 2500), rep: -5, heat: 12, fp: 0.015, legal: true };
      news(`@${S.handle} arrested during a stunt. Mugshot goes viral.`, true);
    } else if (st.harm === 'burnout') {
      title = 'You collapsed on stream';
      text = 'Hour 31. Chat watched you fall asleep mid-sentence. Your body forced a shutdown.';
      fx = { stress: 60, energy: -40, fp: 0.02 };
    } else {
      title = 'The hoax blew up in your face';
      text = 'Search parties were organized. The police were called. When you reappeared, nobody laughed.';
      fx = { rep: -20, heat: 45, fp: -0.08 };
      S.stats.cancels++;
      news(`@${S.handle} faked their own disappearance. The internet is not okay.`, true);
    }
  }
  S.queue.unshift({ ev: '_dz', ctx: { title, text, fx, eyebrow: `Danger Zone · ${st.name}` } });
}

function doScheme(id) {
  const sc = SCHEMES[id];
  const t = totalFollowers();
  const take = Math.round(Math.max(40, t * realRatio() * sc.cut * rnd(0.6, 1.4) * clamp(S.rep / 60, 0.3, 1.4)));
  S.stats.schemes = (S.stats.schemes || 0) + 1;
  S.scamTake = (S.scamTake || 0) + take;
  S.investigation = clamp((S.investigation || 0) + sc.risk * 30, 0, 100);
  for (let i = 0; i < ri(1, 3); i++) mail({ type: 'hater', from: '@' + fanHandle(), subject: 'you scammed me', body: pick(VICTIM_DMS) });
  log(`Ran a scheme (${sc.name}): ${money(take)}.`, 'bad');
  const caught = chance(schemeOdds(id));
  S.queue.unshift({ ev: '_dz', ctx: { title: `${sc.name}: ${money(take)} in your pocket`, text: caught ? 'The money landed. So did the screenshots. Someone is already making a thread.' : 'The money landed. Nobody connected the dots… yet. The investigation meter went up.', fx: { money: take, rep: sc.rep, heat: 6 }, eyebrow: 'Danger Zone · Scheme' } });
  if (caught) S.queue.splice(1, 0, { ev: 'scam_exposed', ctx: { id } });
}

/* Daily: investigations close in, injuries heal, scam bots show up */
function dangerTick() {
  if (S.investigation > 0) {
    if (chance(S.investigation / 320) && !S.queue.some((q) => q.ev === 'scam_exposed')) S.queue.push({ ev: 'scam_exposed', ctx: { id: 'giveaway', late: true } });
    S.investigation = Math.max(0, S.investigation - 2);
  }
  if (S.injuredUntil && S.injuredUntil < S.day) { S.injuredUntil = 0; notify('system', null, 'You\'re healed. Full energy is back.'); }
  if (!S.team.cyber && totalFollowers() >= 3000 && chance(0.07) && !S.queue.some((q) => q.ev === 'scam_bots')) S.queue.push({ ev: 'scam_bots', ctx: {} });
}

Object.assign(EVENTS, {
  _dz: {
    eyebrow: (c) => c.eyebrow || 'Danger Zone', title: (c) => c.title, text: (c) => esc(c.text),
    choices: (c) => [{ label: 'Continue', fn: () => R(c.text, c.fx) }],
  },
  scam_exposed: {
    eyebrow: () => 'Exposed', title: () => 'Your scam got exposed',
    text: (c) => `${c.late ? 'Weeks later, ' : ''}a 52-minute investigation video lays it all out: the links, the fake winners, the money trail, and ${fmt(ri(300, 4000))} fans who lost money. Platforms are reviewing your accounts.`,
    onShow: () => { S.stats.busted = (S.stats.busted || 0) + 1; S.investigation = 0; sound('bad'); news(`@${S.handle} exposed for scamming fans`, true); },
    choices: () => {
      const refund = Math.round((S.scamTake || 500) * 1.3);
      return [
        { label: `Refund everyone (${money(refund)})`, sub: 'The only way out that might work', fn: () => { S.scamTake = 0; return R('You paid back more than you took. Some fans forgave you. Most didn\'t.', { money: -refund, rep: -8, heat: 20, fp: -0.06 }); } },
        { label: 'Blame hackers', fn: () => { if (chance(0.25)) return R('Somehow, it worked. You owe the universe one.', { rep: -4, heat: 15 }); S.hackedUntil = S.day + 2; return R('The receipts showed your login. Platforms suspended you for 2 days.', { rep: -18, heat: 35, fp: -0.12, money: -Math.round((S.scamTake || 500) * 0.8), legal: true }); } },
        { label: 'Go silent and leave the country', fn: () => { S.day += 3; S.lastPostDay = S.day; return R('You came back to fewer followers and a pending lawsuit.', { rep: -15, fp: -0.15, money: -Math.round((S.scamTake || 500) * 1.5), legal: true }); } },
        { label: 'Double down: "they knew the risks"', fn: () => { S.queue.push({ ev: 'cancel', ctx: {} }); return R('That was the worst possible thing to say.', { rep: -20, heat: 60, fp: -0.1 }); } },
      ];
    },
  },
  scam_bots: {
    neg: true, title: () => 'Scam bots in your replies',
    text: () => 'Accounts impersonating you are replying to your fans with "you won! click to claim 🎁" links. Fans are losing money and blaming you.',
    choices: () => [
      { label: 'Warn your fans', sub: '−10 energy', fn: () => R('Fans thanked you for the warning.', { energy: -10, rep: 2 }) },
      { label: 'Hire moderators ($800)', disabled: () => S.money < 800, fn: () => R('The bots are gone. For now.', { money: -800, rep: 1 }) },
      { label: 'Ignore it', fn: () => { mail({ type: 'hater', from: '@' + fanHandle(), subject: 'your link stole my money', body: pick(VICTIM_DMS) }); return R('Fans got scammed in your name.', { rep: -5, fp: -0.01 }); } },
    ],
  },
  hoax_fallout: {
    title: () => 'People want answers about the disappearance',
    text: () => 'A search-and-rescue volunteer posted that they spent 3 nights looking for you. The comments are not kind.',
    choices: () => [
      { label: 'Sincere apology and a donation to search-and-rescue', sub: '$5,000', fn: () => R('Accepted, barely.', { money: -5000, rep: 3, heat: -15 }) },
      { label: '"It was a social experiment"', fn: () => R('Nobody has ever accepted this excuse.', { rep: -10, heat: 20, fp: 0.02 }) },
      { label: 'Do it again', sub: 'Absolutely unhinged', fn: () => R('Platforms banned the hashtag. Your fans are exhausted.', { rep: -15, heat: 35, fp: 0.04 }) },
    ],
  },
});

/* ---------- Spicy moves: celebrity-style drama for clout (PG-13) ---------- */
const spicyStar = () => randomNpc((id) => !S.npcs[id].feud) || pick(Object.keys(NPCS));
const spicyRival = () => { const f = Object.keys(S.npcs).filter((id) => S.npcs[id].feud); return f.length ? pick(f) : randomNpc(); };
const SPICY = {
  showmance: { name: 'Fake a showmance with a star', e: 20, risk: 0.3, pay: '+8% followers, a paid couple shoot',
    desc: 'Hold hands at a café, "accidentally" get photographed. Both your follower counts explode.',
    win: (n) => ({ t: `You and ${npcName(n)} are the internet's new favorite couple`, x: 'The blurry café photos broke the timeline. A brand paid for your first "couple shoot".', fx: { fp: 0.08, money: Math.round(Math.max(1500, T() * 0.02)), rel: { [n]: 10 }, heat: 8 } }),
    lose: (n) => ({ t: 'The showmance contract leaked', x: `A PDF titled "${npcName(n)} x @${S.handle} — 6 week arrangement" is everywhere. Clause 4: "must look in love at brunch".`, fx: { rep: -8, heat: 25, fp: 0.01, rel: { [n]: -15 } } }) },
  burner: { name: 'Troll rivals with a burner account', e: 10, risk: 0.35, pay: 'Rival bleeds followers, you get tea',
    desc: 'A secret account that leaves "just asking questions" comments on your rival\'s posts.',
    win: (n) => { S.npcs[n].followers *= 0.97; gainTea(n, 'from your burner\'s DMs'); return { t: 'The burner is working', x: `${npcName(n)}'s comments are a mess and nobody knows it's you. Your burner even got a juicy DM.`, fx: { fp: 0.01, heat: 3 } }; },
    lose: (n) => { S.stats.cancels++; return { t: 'Your burner got unmasked', x: `An internet detective matched your burner's typos to yours. Screenshots side by side. ${npcName(n)}'s fans are furious.`, fx: { rep: -12, heat: 35, fp: -0.04, rel: { [n]: -25 } } }; } },
  diss: { name: 'Drop a diss track on a rival', e: 25, risk: 0.35, pay: '+10% followers, streaming money',
    desc: 'Three minutes of bars about your rival. Producer charges in exposure.',
    win: (n) => ({ t: 'The diss track is #1 on Chirp', x: `"${npcName(n).split(' ')[0]} Fell Off" is the song of the week. Streams are paying out.`, fx: { fp: 0.1, money: Math.round(Math.max(800, T() * 0.015)), heat: 15, rel: { [n]: -20 } } }),
    lose: (n) => ({ t: 'The diss track is cringe', x: `People are reacting to it like a horror movie. ${npcName(n)} replied with one emoji: 😐.`, fx: { rep: -4, heat: 12, fp: 0.02, rel: { [n]: -8 } } }) },
  breakup: { name: 'Stage a public breakup', e: 15, risk: 0.3, pay: '+6% followers, sympathy tips',
    desc: 'A tearful "we\'ve decided to go our separate ways" video. Ring light, slow piano.',
    win: () => ({ t: 'The breakup video made everyone cry', x: 'Fans are sending love, tips and soup recipes. The algorithm loves heartbreak.', fx: { fp: 0.06, money: Math.round(Math.max(500, T() * 0.008)), stress: -5 } }),
    lose: () => ({ t: 'You were spotted together the next day', x: 'Paparazzi caught you two laughing at brunch 18 hours later. "Separate ways" is now a meme.', fx: { rep: -6, heat: 18, fp: 0.01 } }) },
  stage: { name: 'Crash an award show stage', e: 30, risk: 0.45, pay: '+15% followers, headlines worldwide',
    desc: 'Grab the mic mid-speech: "I\'mma let you finish, but…"',
    win: (n) => ({ t: 'The stage crash is the moment of the night', x: `You took ${npcName(n)}'s mic and the crowd ROARED. Half the internet hates you. All of it knows your name.`, fx: { fp: 0.15, heat: 30, rep: -3, rel: { [n]: -15 } } }),
    lose: () => { S.day += 1; S.lastPostDay = S.day; return { t: 'Security tackled you on live TV', x: 'Escorted out, banned from the venue, a night in a holding cell and a mugshot meme. You lost a day.', fx: { rep: -8, heat: 25, fp: 0.02, money: -Math.round(Math.max(1500, S.money * 0.04)), legal: true } }; } },
  villa: { name: 'Join Love Villa (reality dating show)', e: 60, risk: 0.4, pay: '+20% followers, appearance fee', min: 5000,
    desc: 'Five weeks in a villa with 12 singles, cameras everywhere, and a host who loves drama.',
    win: () => ({ t: 'You were the fan favorite on Love Villa', x: 'You won hearts, got a catchphrase, and walked out with an appearance fee and a book deal offer.', fx: { fp: 0.2, money: Math.round(Math.max(5000, T() * 0.03)), rep: 3, stress: 15 } }),
    lose: () => ({ t: 'You got the villain edit', x: 'The show cut you to look like a scheming monster. Villains still trend though.', fx: { fp: 0.09, money: Math.round(Math.max(2500, T() * 0.015)), rep: -10, heat: 30, stress: 25 } }) },
  paidbeef: { name: 'Get paid to start a fake feud', e: 12, risk: 0.3, pay: 'Big brand cash, +5% followers',
    desc: 'A soda brand pays you to pick a fight with a rival brand\'s ambassador. Scripted, of course.',
    win: (n) => ({ t: 'The soda war is ON', x: `You and ${npcName(n)} traded shots all week. Both brands' sales spiked and your check cleared.`, fx: { money: Math.round(Math.max(3000, T() * 0.05)), fp: 0.05, heat: 15, rel: { [n]: -5 } } }),
    lose: (n) => ({ t: 'The fake feud script leaked', x: `"Line 12: act genuinely offended." Both brands dropped you and ${npcName(n)}.`, fx: { rep: -10, heat: 25, money: Math.round(Math.max(1000, T() * 0.01)) } }) },
};
const spicyOdds = (id) => clamp(SPICY[id].risk * (1 + Math.max(0, S.stress - 50) / 120) * (S.team.pr ? 0.8 : 1) * (id === 'villa' || id === 'stage' ? 1 : (1 - skillLvl('charisma') * 0.02)), 0.05, 0.85);
function doSpicy(id) {
  const sp = SPICY[id];
  S.stats.spicy = (S.stats.spicy || 0) + 1;
  S.stress = clamp(S.stress + 6, 0, 100);
  const n = id === 'burner' || id === 'diss' ? spicyRival() : spicyStar();
  const fail = chance(spicyOdds(id));
  const o = fail ? sp.lose(n) : sp.win(n);
  if (!fail) { news(`@${S.handle}: ${o.t}`, true); if (typeof celebrate === 'function' && (o.fx.fp || 0) >= 0.08) celebrate('viral'); sound('viral'); }
  else { news(`@${S.handle}: ${o.t}`, true); sound('bad'); }
  S.queue.unshift({ ev: '_dz', ctx: { title: o.t, text: o.x, fx: o.fx, eyebrow: `Spicy move · ${sp.name}` } });
}
