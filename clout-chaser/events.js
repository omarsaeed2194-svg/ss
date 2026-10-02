/* Clout Chaser — events, livestream chat, modal queue */
'use strict';

const T = () => totalFollowers();
const randomNpc = (filter = () => true) => pick(Object.keys(NPCS).filter(filter));
const R = (text, fx = {}) => ({ text, fx });

const EVENTS = {
  /* ---------- system screens ---------- */
  _summary: {
    eyebrow: (c) => `End of day ${c.day}`, title: (c) => `${weekday(c.day)} wrap-up`,
    text: (c) => {
      const rows = [
        ['Followers', `<span class="num ${c.df >= 0 ? 'good' : 'bad'}">${signed(c.df)}</span>`],
        ['Money', `<span class="num ${c.dm >= 0 ? 'good' : 'bad'}">${signedMoney(c.dm)}</span>`],
        ['Reputation', `<span class="num ${c.drep >= 0 ? 'good' : 'bad'}">${signed1(c.drep)}</span>`],
        ['Posts today', `<span class="num">${c.posts}</span>`],
      ];
      const lines = c.lines.map(([k, v]) => `<div><span class="muted">${esc(k)}</span><span class="num ${v > 0 ? 'good' : v < 0 ? 'bad' : ''}">${v ? signedMoney(v) : ''}</span></div>`).join('');
      return `<div class="summary-lines">${rows.map(([k, v]) => `<div><span>${k}</span>${v}</div>`).join('')}</div>` +
        (lines ? `<hr class="sep"><div class="summary-lines">${lines}</div>` : '') +
        `<p class="small muted" style="margin-top:10px">You now have ${fmt(c.totalF)} followers. New trends dropped and the algorithm reshuffled.</p>`;
    },
    choices: () => [{ label: 'Start the next day', fn: () => null }],
  },
  _weekly: {
    eyebrow: (c) => `Week ${c.week} analytics`, title: () => 'Weekly creator report',
    text: (c) => `<div class="summary-lines">
      <div><span>Follower change</span><span class="num ${c.df >= 0 ? 'good' : 'bad'}">${signed(c.df)}</span></div>
      <div><span>Net money</span><span class="num ${c.dm >= 0 ? 'good' : 'bad'}">${signedMoney(c.dm)}</span></div>
      <div><span>Reputation</span><span class="num ${c.drep >= 0 ? 'good' : 'bad'}">${signed1(c.drep)}</span></div>
      <div><span>Posts</span><span class="num">${c.posts}</span></div>
      <div><span>Average views</span><span class="num">${fmt(c.avgViews)}</span></div>
      <div><span>Viral hits</span><span class="num">${c.viral}</span></div></div>
      ${c.best ? `<div class="hint" style="margin-top:10px"><b>Top post</b> on ${PLATFORMS[c.best.platform].name} · ${fmt(c.best.views)} views<br>"${esc(c.best.caption)}"</div>` : '<div class="hint" style="margin-top:10px">No posts this week. The algorithm forgets fast.</div>'}`,
    choices: () => [{ label: 'Got it', fn: () => null }],
  },
  _verified: {
    eyebrow: () => 'Milestone', title: () => 'You got verified',
    text: () => 'Every platform just added the blue check next to your name. Brands take you more seriously, and so do the haters.',
    choices: () => [
      { label: 'Post a humble thank-you', sub: 'Classy', fn: () => R('Fans loved it.', { rep: 3, fp: 0.01 }) },
      { label: 'Post the screenshot with sunglasses emoji', sub: 'A little flex', fn: () => R('Half the comments are congratulations. The other half are "who?".', { fp: 0.03, rep: -1, heat: 4 }) },
    ],
  },
  _win: {
    eyebrow: () => 'Icon status', title: () => '100 million followers',
    text: () => `You did it. 100M followers with a reputation people still respect. Talk shows, magazine covers, your face on a billboard in Times Square. You can keep playing to top the leaderboard, collect every trophy, or buy that island.`,
    choices: () => [{ label: 'Keep going', fn: () => null }],
  },
  _gameover: {
    eyebrow: () => 'Deplatformed', title: () => 'Your reputation hit zero',
    text: () => `Every platform suspended @${esc(S.handle)}. Brands pulled out, your team stopped answering texts, and the drama channels are doing victory laps. Final count: ${fmt(T())} followers, ${money(S.money)}, day ${S.day}.`,
    choices: () => [
      { label: 'Start a comeback arc', sub: 'Keep playing: half your followers, reputation reset to 20, heat cleared', fn: () => { S.over = false; addFollowersPct(-0.5); S.rep = 20; S.heat = 0; S.deals.forEach((d) => { if (d.status === 'active') d.status = 'failed'; }); S.stats.comebacks++; log('Comeback arc begins.', 'gold'); news(`@${S.handle} is back. Nobody knows how to feel about it.`, true); return R('Appeal approved. You are back on probation. Don\'t blow it.'); } },
      { label: 'Start over with a new account', fn: () => { wipeSave(); S = null; showStart(); return 'restart'; } },
    ],
  },

  /* ---------- random events ---------- */
  old_post: {
    random: true, w: 3, when: () => T() > 2000, title: () => 'Receipts from 2017',
    text: () => 'Someone dug up a post you made years ago. It has not aged well, and it is climbing the Chirp trending list.',
    choices: () => [
      { label: 'Sincere apology video', sub: 'Own it', fn: () => R('Most people accepted it. A few say it was "too produced".', { rep: -2, heat: -15, fp: -0.01 }) },
      { label: 'Delete it and stay quiet', fn: () => chance(0.5) ? R('It blew over by lunch.', { heat: -4 }) : R('Screenshots are forever. People noticed the deletion.', { heat: 15, rep: -4 }) },
      { label: 'Double down', sub: 'Big reach, big damage', fn: () => R('Your replies are a war zone. Engagement is through the roof.', { fp: 0.04, rep: -8, heat: 25 }) },
      { label: 'Claim you were hacked', fn: () => chance(0.4) ? R('Somehow, people bought it.', { heat: -10 }) : R('Nobody believes you. "Hacked in 2017, found in 2026?"', { rep: -10, heat: 20 }) },
    ],
  },
  paparazzi: {
    random: true, w: 2, when: () => T() >= 1e5, title: () => 'Paparazzi at brunch',
    text: () => 'Photographers are waiting outside the café. You have syrup on your sleeve.',
    choices: () => [
      { label: 'Pose and wave', fn: () => R('Tabloids called you "refreshingly normal".', { fp: 0.01, rep: 1 }) },
      { label: 'Cover your face and run', fn: () => R('The photos look like a crime documentary. Memes followed.', { fp: 0.005, stress: 5 }) },
      { label: 'Confront them', sub: S.team.bodyguard ? 'Your bodyguard steps in' : 'Risky', fn: () => S.team.bodyguard ? R('Your bodyguard handled it calmly. The clip makes you look untouchable.', { fp: 0.02 }) : R('The video of you yelling is everywhere.', { fp: 0.02, rep: -4, heat: 12 }) },
    ],
  },
  stalker: {
    random: true, w: 1, when: () => T() >= 5e4, title: () => 'A fan showed up at your home',
    text: () => S.team.bodyguard ? 'Someone found your address and waited outside. Your bodyguard escorted them away before you even noticed.' : 'Someone found your address and waited outside for four hours. You are shaken.',
    choices: () => S.team.bodyguard ? [{ label: 'Thank your bodyguard', fn: () => R('Worth every penny.', { stress: 3 }) }] : [
      { label: 'Call the police and stay quiet', fn: () => R('Handled. You still check the window twice.', { stress: 15, rep: 1 }) },
      { label: 'Post about safety boundaries', fn: () => R('Fans rallied around you. Some creators shared it too.', { stress: 18, rep: 3, fp: 0.01 }) },
      { label: 'Hire a bodyguard now ($3,000 upfront)', disabled: () => S.money < 3000, fn: () => { S.team.bodyguard = true; return R('Hired. You sleep better tonight.', { money: -3000, stress: 5 }); } },
    ],
  },
  algo_shift: {
    random: true, w: 3, ctx: () => ({ p: pick(unlockedIds().filter((x) => x !== 'vault')) }), title: (c) => `${PLATFORMS[c.p].name} changed its algorithm`,
    text: (c) => `Overnight, ${PLATFORMS[c.p].name} started favoring different content. Creator forums are melting down.`,
    choices: (c) => [
      { label: 'Study it and adapt', sub: '−20 energy, algorithm favors you tomorrow', fn: () => { S.algoBoost[c.p] = 1.45; return R('You cracked it before most creators did.', { energy: -20 }); } },
      { label: 'Complain publicly', fn: () => R('Other creators agree loudly. Your rant gets traction.', { fp: 0.006, heat: 4 }) },
      { label: 'Ignore it', fn: () => { S.algoBoost[c.p] = 0.75; return R('Your reach there will dip tomorrow.'); } },
    ],
  },
  shadowban: {
    random: true, w: 2, when: () => S.heat >= 45 && S.shadowbanUntil < S.day, title: () => 'You might be shadowbanned',
    text: () => 'Views dropped off a cliff and your posts are missing from hashtag pages. Reach will be crushed for 3 days.',
    choices: () => [
      { label: 'File an appeal', sub: '−20 energy, 50% chance', fn: () => { if (chance(0.5)) return R('Appeal accepted. Reach restored.', { energy: -20 }); S.shadowbanUntil = S.day + 2; return R('Denied. Three days of silence.', { energy: -20 }); } },
      { label: 'Lay low', fn: () => { S.shadowbanUntil = S.day + 2; return R('You post less and let things cool down.', { heat: -20, stress: -5 }); } },
      { label: 'Post about being silenced', fn: () => { S.shadowbanUntil = S.day + 2; return R('Ironically, the post about the shadowban reached people.', { fp: 0.01, heat: 6 }); } },
    ],
  },
  meme: {
    random: true, w: 2, when: () => T() >= 5000, title: () => 'You became a meme',
    text: () => 'A screenshot of your face mid-sentence is now a reaction image. It is everywhere.',
    choices: () => [
      { label: 'Embrace it', fn: () => R('You posted the meme yourself. Legendary move.', { fp: 0.07, rep: 2 }) },
      { label: 'Ask people to stop', fn: () => R('That only made it spread faster.', { fp: 0.03, rep: -2, heat: 5 }) },
      { label: 'Print it on merch', sub: S.merch ? 'Merch sales spike' : 'Launch merch first', disabled: () => !S.merch, fn: () => { S.merch.boost = (S.merch.boost || 0) + 5; return R('The meme shirt sells out. Iconic.', { fp: 0.04, money: Math.round(T() * 0.01) }); } },
    ],
  },
  copyright: {
    random: true, w: 1.5, when: () => S.platforms.tube.unlocked, title: () => 'Copyright strike',
    text: () => 'A record label claimed your latest ViewTube video over 4 seconds of background music.',
    choices: () => [
      { label: 'Dispute it', sub: S.team.lawyer ? 'Your lawyer handles it' : '50% chance', fn: () => (S.team.lawyer || chance(0.5)) ? R('Claim withdrawn. Revenue restored.') : R('Dispute rejected. Strike stays.', { money: -300, fp: -0.005 }) },
      { label: 'Accept it', fn: () => { S.platforms.tube.followers *= 0.985; return R('You lose the video revenue.', { money: -150 }); } },
      { label: 'Make a video about the absurdity', fn: () => R('"4 seconds??" hits the front page.', { fp: 0.015, heat: 4 }) },
    ],
  },
  fan_art: {
    random: true, w: 2, title: () => 'A fan made art of you',
    text: () => 'A 14-year-old fan drew a portrait of you and tagged you. It is genuinely good.',
    choices: () => [
      { label: 'Share it and credit them', fn: () => R('Their follower count exploded. So did the goodwill.', { rep: 2.5, fp: 0.004 }) },
      { label: 'Commission them for merch art', sub: '$200', disabled: () => S.money < 200, fn: () => R('Wholesome content of the year.', { money: -200, rep: 4, fp: 0.01 }) },
      { label: 'Scroll past', fn: () => R('Nothing happens.') },
    ],
  },
  charity_ask: {
    random: true, w: 2, when: () => T() >= 3000, title: () => 'A children\'s hospital reached out',
    text: () => 'They are hoping you can help with their fundraiser this month.',
    choices: () => {
      const amt = Math.max(100, Math.round(S.money * 0.1 / 50) * 50);
      return [
        { label: 'Host a charity stream', sub: '−35 energy', disabled: () => S.energy < 35, fn: () => R('Your fans raised a huge amount. People are touched.', { energy: -35, rep: 6, fp: 0.012 }) },
        { label: `Donate ${money(amt)}`, disabled: () => S.money < amt, fn: () => { S.stats.donated += amt; return R('They posted a thank-you video.', { money: -amt, rep: 4 }); } },
        { label: 'Politely decline', fn: () => R('It stings a little.', { rep: -1 }) },
      ];
    },
  },
  brand_crisis: {
    random: true, w: 4, when: () => !!S.flags.shadyDeal, ctx: () => { const b = S.flags.shadyDeal; S.flags.shadyDeal = null; return { b }; },
    title: (c) => `${BRANDS[c.b].name} blew up`,
    text: (c) => `${BRANDS[c.b].name}, the brand you promoted, collapsed in a scandal. Fans who trusted your recommendation lost money.`,
    choices: (c) => {
      const refund = Math.round(Math.max(500, T() * 0.02));
      return [
        { label: `Refund fans out of pocket (${money(refund)})`, disabled: () => S.money < refund, fn: () => R('An expensive lesson that earned real respect.', { money: -refund, rep: 5, heat: -15 }) },
        { label: 'Post an apology', fn: () => R('Accepted, mostly. The screenshots live on.', { rep: -5, heat: 8 }) },
        { label: 'Stay silent', fn: () => { news(`Fans demand answers from @${S.handle} over ${BRANDS[c.b].name} promotion`, true); return R('Silence reads as guilt.', { rep: -12, heat: 22 }); } },
      ];
    },
  },
  dating_rumor: {
    random: true, w: 1.5, when: () => T() >= 5e4 && !S.partner, ctx: () => ({ npc: randomNpc((id) => NPCS[id].followers > 1e6) }), title: () => 'Dating rumors',
    text: (c) => `A gossip account claims you and ${npcName(c.npc)} have been "spending a lot of time together". You have met once, briefly.`,
    choices: (c) => [
      { label: 'Post a cryptic emoji', fn: () => chance(0.5) ? R(`${npcName(c.npc)} played along. The internet lost its mind.`, { fp: 0.03, rel: { [c.npc]: 6 } }) : R(`${npcName(c.npc)}'s team is annoyed.`, { fp: 0.02, rel: { [c.npc]: -8 } }) },
      { label: 'Deny it with a joke', fn: () => R('Clean and funny.', { fp: 0.008, rel: { [c.npc]: 3 } }) },
      { label: 'Ignore it', fn: () => R('It fades.') },
    ],
  },
  reality_tv: {
    random: true, w: 1, once: true, when: () => T() >= 3e5, title: () => 'Reality show offer',
    text: () => '"Clout House" wants you for season 4: eight creators, one mansion, cameras everywhere for a month.',
    choices: () => [
      { label: 'Sign on', sub: 'Big money and exposure, messy for your reputation', fn: () => { news(`@${S.handle} joins the cast of Clout House season 4`, true); return R('The edit made you look unhinged, but ratings were enormous.', { money: Math.round(T() * 0.08), fp: 0.14, rep: -8, stress: 30 }); } },
      { label: 'Decline', fn: () => R('Your peace is intact.') },
    ],
  },
  podcast_invite: {
    random: true, w: 2, when: () => T() >= 2e4, title: () => 'Podcast invite',
    text: () => 'The Morning Grind, a huge interview podcast, wants you as a guest this week.',
    choices: () => [
      { label: 'Go on the show', sub: '−25 energy', disabled: () => S.energy < 25, fn: () => chance(0.2 + (S.heat / 200)) ? R('A clip of you saying something dumb went viral for the wrong reasons.', { energy: -25, fp: 0.03, rep: -5, heat: 15 }) : R('Great conversation. Clips everywhere.', { energy: -25, fp: 0.035, rep: 2 }) },
      { label: 'Decline', fn: () => R('Maybe next time.') },
    ],
  },
  talk_show: {
    random: true, w: 1.5, when: () => T() >= 1e6, title: () => 'Late-night talk show',
    text: () => 'You are booked on a late-night show. The host loves to go off-script.',
    choices: () => [
      { label: 'Tell a funny story', sub: `Charisma ${skillLvl('charisma')}`, fn: () => chance(0.3 + skillLvl('charisma') * 0.07) ? R('The audience roared. Clip hit the front page.', { fp: 0.04, rep: 3 }) : R('It fell flat. Awkward silence.', { fp: 0.01, rep: -1 }) },
      { label: 'Plug your projects', fn: () => { if (S.merch) S.merch.boost = (S.merch.boost || 0) + 4; if (S.product) S.product.hype = (S.product.hype || 1) + 2; return R('Sales bumped. Viewers found it a bit salesy.', { fp: 0.015, money: Math.round(T() * 0.003) }); } },
      { label: 'Get real about mental health', fn: () => R('An honest moment that resonated.', { fp: 0.025, rep: 5, stress: -10 }) },
    ],
  },
  gala: {
    random: true, w: 1, when: () => T() >= 5e6, title: () => 'The Glitz Gala',
    text: () => 'The most exclusive fashion night of the year. You are invited. What are you wearing?',
    choices: () => [
      { label: 'Custom couture ($50K)', disabled: () => S.money < 5e4, fn: () => R('Best-dressed lists everywhere.', { money: -5e4, fp: 0.02, rep: 2 }) },
      { label: 'Something outrageous', fn: () => chance(0.5) ? R('Iconic. People will reference this for years.', { fp: 0.06, rep: 1 }) : R('Mocked mercilessly. "Did they lose a bet?"', { fp: 0.02, rep: -4, heat: 10 }) },
      { label: 'Skip it', fn: () => R('FOMO, but restful.', { stress: -8 }) },
    ],
  },
  mom_joins: {
    random: true, w: 1, once: true, title: () => 'Your mom joined Chirp',
    text: () => 'She is commenting "so proud of you sweetie" on every post, including the thirst traps.',
    choices: () => [
      { label: 'Embrace it', fn: () => R('Fans adore her. She has 12K followers now.', { rep: 3, fp: 0.01 }) },
      { label: 'Film a collab with mom', sub: '−20 energy', disabled: () => S.energy < 20, fn: () => R('Most wholesome video you have ever made.', { energy: -20, fp: 0.03, rep: 4 }) },
      { label: 'Ask her to stop', fn: () => R('She is hurt. Thanksgiving will be awkward.', { rep: -1, stress: 5 }) },
    ],
  },
  hacked: {
    random: true, w: 0.5, when: () => T() >= 1e4, title: () => 'You got hacked',
    text: () => 'Someone took over your Pixgram and is posting crypto scams to your followers.',
    choices: () => [
      { label: 'Pay the hacker ($2,000)', disabled: () => S.money < 2000, fn: () => R('Account returned. You feel dirty about it.', { money: -2000, stress: 8 }) },
      { label: 'Go through official support', sub: 'Locked out for 2 days', fn: () => { S.hackedUntil = S.day + 1; return R('Recovery takes a while. Some fans got scammed.', { fp: -0.03, stress: 12 }); } },
      { label: 'Warn fans from other accounts', fn: () => { S.hackedUntil = S.day; return R('Most fans were warned in time.', { fp: -0.01, rep: 1, stress: 8 }); } },
    ],
  },
  viral_duet: {
    random: true, w: 2, when: () => T() >= 1000, ctx: () => ({ npc: randomNpc((id) => NPCS[id].followers >= 1e7) }), title: (c) => `${npcName(c.npc)} reacted to your post`,
    text: (c) => `${npcName(c.npc)} reposted one of your clips with the caption "lmaooo who is this". Traffic is pouring in.`,
    choices: (c) => [
      { label: 'Reply fast with something funny', sub: `Charisma ${skillLvl('charisma')}`, fn: () => chance(0.4 + skillLvl('charisma') * 0.05) ? R('They replied back. You are in.', { fp: 0.08, rel: { [c.npc]: 12 } }) : R('Your reply got ratioed, but the traffic was real.', { fp: 0.04 }) },
      { label: 'Ride the wave quietly', fn: () => R('New followers trickle in.', { fp: 0.035 }) },
    ],
  },
  glitch: {
    random: true, w: 1, title: () => 'Follower glitch',
    text: () => 'For about an hour your follower count showed 10x the real number. Screenshots exist.',
    choices: () => [
      { label: 'Post the screenshot as a joke', fn: () => R('Self-aware. People liked it.', { fp: 0.01, rep: 0.5 }) },
      { label: 'Pretend it was real', fn: () => R('Everyone knows it wasn\'t.', { rep: -3, heat: 6 }) },
    ],
  },
  hater_campaign: {
    random: true, w: 2, when: () => S.heat >= 30, title: () => 'Coordinated hate raid',
    text: () => 'A forum organized a mass-reporting and comment-flooding campaign against you.',
    choices: () => [
      { label: 'Mass-block and filter', fn: () => R('Quieter, if a bit lonely.', { stress: 8, heat: -8 }) },
      { label: 'Address it calmly', fn: () => R('Mature response. Many bystanders sided with you.', { rep: 3, stress: 12 }) },
      { label: 'Fire back', fn: () => R('Great content. Terrible for your blood pressure.', { fp: 0.015, heat: 12, stress: 15, rep: -2 }) },
    ],
  },
  climate_jet: {
    random: true, w: 5, once: true, when: () => !!S.owned.jet, title: () => '"Climate hypocrite"',
    text: () => 'A flight tracker account posted that your jet took a 17-minute flight. People are furious.',
    choices: () => [
      { label: 'Sell the jet (60% refund)', fn: () => { delete S.owned.jet; return R('Grounded. The story died.', { money: 1.2e7, rep: 3, heat: -10 }); } },
      { label: 'Buy carbon offsets ($500K)', disabled: () => S.money < 5e5, fn: () => R('Mixed reactions.', { money: -5e5, rep: 1, heat: -5 }) },
      { label: 'Ignore it', fn: () => R('The flight tracker keeps posting.', { rep: -6, heat: 14 }) },
    ],
  },
  merch_quality: {
    random: true, w: 1.5, when: () => !!S.merch, title: () => 'Merch complaints',
    text: () => 'Your hoodies are shrinking two sizes in the wash. Photos are circulating.',
    choices: () => [
      { label: 'Refund everyone', fn: () => R('Costly but respected.', { money: -Math.round(S.merch.sold * 3 + 200), rep: 3 }) },
      { label: 'Switch suppliers and upgrade', sub: '+1 merch level', fn: () => { S.merch.lvl = Math.min(5, S.merch.lvl + 1); return R('Better product going forward.', { money: -Math.round(3000 * S.merch.lvl), rep: 1 }); } },
      { label: 'Blame the fans\' washing machines', fn: () => R('That went badly.', { rep: -5, heat: 12 }) },
    ],
  },
  product_recall: {
    random: true, w: 1.5, when: () => !!S.product, title: () => 'Product safety scare',
    text: () => `Customers report issues with a batch of ${esc(S.product ? S.product.name : '')}.`,
    choices: () => [
      { label: 'Voluntary recall', fn: () => R('Responsible. Sales dip briefly.', { money: -Math.round(S.product.sold * 2 + 5000), rep: 3, heat: -5 }) },
      { label: 'Deny everything', fn: () => R('Lawsuits are being drafted.', { rep: -10, heat: 20, money: -2e4, legal: true }) },
    ],
  },
  impersonator: {
    random: true, w: 1.5, when: () => T() >= 2e4, title: () => 'Someone is impersonating you',
    text: () => 'A fake account with your photos is DMing fans asking for gift cards.',
    choices: () => [
      { label: 'Report it and warn fans', sub: '−10 energy', fn: () => R('Taken down within hours. Fans appreciated the heads-up.', { energy: -10, rep: 1.5 }) },
      { label: 'Ignore it', fn: () => R('Some fans got scammed and blame you.', { rep: -3 }) },
    ],
  },
  content_house: {
    random: true, w: 1, once: true, when: () => T() >= 5e4, title: () => 'Content house invite',
    text: () => 'Hype Manor, a creator house with six big accounts, has a free room. Constant content, zero privacy.',
    choices: () => [
      { label: 'Move in', sub: 'Growth and new friends, much more stress', fn: () => { const ids = shuffle(Object.keys(NPCS).filter((id) => NPCS[id].followers < 2e7)).slice(0, 3); ids.forEach((id) => changeRel(id, 12)); return R(`You bonded with ${ids.map(npcName).join(', ')}.`, { fp: 0.05, stress: 20 }); } },
      { label: 'Decline', fn: () => R('You keep your own schedule.') },
    ],
  },
  book_deal: {
    random: true, w: 1, once: true, when: () => T() >= 2e5, title: () => 'Book deal',
    text: () => 'A publisher wants your memoir. You are 26.',
    choices: () => [
      { label: 'Write it yourself', sub: '−40 energy, +stress', fn: () => R('A surprise bestseller.', { money: Math.round(T() * 0.15 + 2e4), energy: -40, stress: 20, rep: 3 }) },
      { label: 'Use a ghostwriter', fn: () => chance(0.3) ? R('The ghostwriter talked. Awkward.', { money: Math.round(T() * 0.1), rep: -4, heat: 8 }) : R('Nobody has to know.', { money: Math.round(T() * 0.1) }) },
      { label: 'Decline', fn: () => R('Maybe when you have lived a little.') },
    ],
  },
  investor: {
    random: true, w: 1, once: true, when: () => T() >= 5e5, title: () => 'Startup pitch',
    text: () => 'A venture firm wants to fund "an app with your name on it". Details are vague.',
    choices: () => [
      { label: 'Take the $1M advance', fn: () => chance(0.6) ? R('The app is mid but the check cleared.', { money: 1e6 }) : R('The app launched broken. Reviews are brutal.', { money: 1e6, rep: -6, heat: 10 }) },
      { label: 'Pass', fn: () => R('Probably wise.') },
    ],
  },
  fan_edits: {
    random: true, w: 2, when: () => T() >= 1e4, title: () => 'Fan edits are trending',
    text: () => 'Fans are making slow-motion edits of you set to dramatic music.',
    choices: () => [{ label: 'Repost the best one', fn: () => R('Fandom energy is off the charts.', { fp: 0.02, rep: 1 }) }, { label: 'Leave it to them', fn: () => R('It keeps going on its own.', { fp: 0.01 }) }],
  },
  family_emergency: {
    random: true, w: 1, title: () => 'Family emergency',
    text: () => 'Your grandmother is in the hospital. She is okay, but it was scary.',
    choices: () => [
      { label: 'Log off and be with family', sub: 'Lose tomorrow\'s posting energy', fn: () => R('The right call. Fans sent kind messages.', { energy: -60, stress: -10, rep: 2 }) },
      { label: 'Keep posting like normal', fn: () => R('You feel hollow doing it.', { stress: 20 }) },
    ],
  },
  rising_rival: {
    random: true, w: 1.5, when: () => T() >= 5000 && T() < 5e6, ctx: () => ({ npc: pick(['skye', 'milo']) }), title: (c) => `${npcName(c.npc)} is copying your style`,
    text: (c) => `${npcName(c.npc)} posted something suspiciously close to your last video. Fans are tagging you.`,
    choices: (c) => [
      { label: 'Call it out', fn: () => { S.npcs[c.npc].feud = true; S.stats.feuds++; return R('A feud is born.', { fp: 0.02, heat: 10, rel: { [c.npc]: -40 } }); } },
      { label: 'Say imitation is flattery', fn: () => R('Gracious. They DM\'d to say thanks.', { rep: 2, rel: { [c.npc]: 15 } }) },
      { label: 'Ignore it', fn: () => R('It passes.') },
    ],
  },
  collab_offer_big: {
    random: true, w: 1.5, when: () => !S.collab && T() >= 1000, ctx: () => ({ npc: randomNpc((id) => S.npcs[id].rel >= 10 && !S.npcs[id].feud) || 'skye' }), title: (c) => `${npcName(c.npc)} wants to collab`,
    text: (c) => `${npcName(c.npc)}'s manager reached out. They have a slot open this week.`,
    choices: (c) => [
      { label: 'Say yes', fn: () => { S.collab = { npc: c.npc, until: S.day + 4 }; return R('Collab is on. Post it from the Studio within 4 days.', { rel: { [c.npc]: 5 } }); } },
      { label: 'Not right now', fn: () => R('They understand.', { rel: { [c.npc]: -2 } }) },
    ],
  },

  /* ---------- triggered events ---------- */
  backlash: {
    title: () => 'The replies are turning on you',
    text: () => 'Your last post pushed things too far. Quote-posts are piling up and brands are watching.',
    choices: () => [
      { label: 'Apologize', fn: () => R('Tensions ease.', { heat: -25, rep: -2 }) },
      { label: 'Clarify what you meant', fn: () => chance(0.5) ? R('The clarification landed.', { heat: -15 }) : R('The clarification made it worse.', { heat: 10, rep: -3 }) },
      { label: 'Lean in', sub: 'More followers, more fire', fn: () => R('Your new audience loves the chaos.', { fp: 0.03, rep: -6, heat: 15 }) },
      { label: 'Log off for the night', fn: () => R('The internet moved on to someone else by morning. Mostly.', { heat: -8, stress: -5 }) },
    ],
  },
  cancel: {
    eyebrow: () => 'Crisis', title: () => `#${S.handle}IsOverParty is trending`,
    text: () => { const lost = S.deals.filter((d) => d.status === 'active').length; return `Your heat boiled over. Brands are cutting ties${lost ? ` (${lost} active deal${lost > 1 ? 's' : ''} cancelled)` : ''}, followers are leaving in waves, and every drama channel has a video up. How do you respond?`; },
    onShow: () => {
      S.stats.cancels++; S.stats.scandals++;
      S.deals.forEach((d) => { if (d.status === 'active') d.status = 'failed'; });
      addFollowersPct(-0.18 * sev() * (S.team.pr ? 0.6 : 1));
      changeRep(-12 * sev() * (S.team.pr ? 0.6 : 1));
      news(`@${S.handle} gets cancelled. Brands flee.`, true); log('You got cancelled.', 'bad'); sound('bad');
    },
    choices: () => [
      { label: 'Sincere apology video', sub: 'No music, no filter', fn: () => { S.heat = 30; return R('It was real, and people could tell.', { rep: 8 }); } },
      { label: 'Notes-app apology', fn: () => { S.heat = 60; return R('Someone zoomed in and found the battery at 3%. Also, it was clearly written by a PR intern.', { rep: 2 }); } },
      { label: 'Tearful video', fn: () => { if (chance(0.5)) { S.heat = 35; return R('It worked. Mostly.', { rep: 6 }); } S.heat = 80; return R('Someone spotted the eye drops. Brutal.', { rep: -8 }); } },
      { label: 'Disappear for 5 days', fn: () => { S.heat = 10; S.day += 4; S.lastPostDay = S.day; return R('When you came back, the internet had moved on. Some followers had too.', { fp: -0.05, stress: -40 }); } },
      { label: 'Double down', sub: 'Build a new audience from the chaos', fn: () => { S.heat = 70; return R('You lost the mainstream but found a loud, loyal niche.', { fp: 0.1, rep: -15 }); } },
    ],
  },
  burnout: {
    eyebrow: () => 'Health', title: () => 'You burned out',
    text: () => 'You can\'t look at your phone without feeling sick. Your body is forcing a break.',
    onShow: () => { S.stats.burnouts++; },
    choices: () => [
      { label: 'Take 3 days fully offline', fn: () => { S.day += 2; S.lastPostDay = S.day; S.stress = 15; return R('You slept, cooked, and saw friends. You feel human again.', { fp: -0.03 }); } },
      { label: 'Book a therapist ($600)', disabled: () => S.money < 600, fn: () => { S.stress = 35; return R('It helped more than you expected.', { money: -600 }); } },
      { label: 'Push through', sub: 'Dangerous', fn: () => { S.stress = 90; S.energy = Math.round(S.energy * 0.5); return R('Your content quality is slipping and fans can tell.', { rep: -3 }); } },
    ],
  },
  exposed_bots: {
    eyebrow: () => 'Exposed', title: () => 'Kenzie Blake exposed your bot followers',
    text: () => `A 38-minute video breaks down your follower graph. ${fmt(S.fake)} of your followers are bots, with receipts.`,
    onShow: () => { S.stats.exposed++; },
    choices: () => [
      { label: 'Admit it and purge them', fn: () => { const f = S.fake; S.platforms.pix.followers = Math.max(0, S.platforms.pix.followers - f); S.fake = 0; return R('Painful, but you are clean now.', { rep: -8, heat: 10 }); } },
      { label: 'Deny everything', fn: () => chance(0.4) ? R('Somehow it blew over.', { heat: 12 }) : R('She posted part two. Worse.', { rep: -18, heat: 30 }) },
      { label: 'Blame a growth agency', fn: () => R('Half-believed.', { rep: -6, heat: 12 }) },
    ],
  },
  diss_reply: {
    title: (c) => `${npcName(c.npc)} fired back`,
    text: (c) => `${npcName(c.npc)} posted a response to your diss. Their fans are in your comments.`,
    choices: (c) => [
      { label: 'Clap back', fn: () => R('Round two goes viral.', { fp: 0.03, heat: 10, rep: -3, rel: { [c.npc]: -10 } }) },
      { label: 'Take the high road', fn: () => R('Classy. Some people switched sides.', { rep: 3, heat: -10 }) },
      { label: 'Propose a truce', fn: () => { if (chance(0.5 + NPCS[c.npc].kind * 0.3)) { S.npcs[c.npc].feud = false; return R('Truce accepted. Dramatic hug video incoming.', { rel: { [c.npc]: 35 }, rep: 3, fp: 0.02 }); } return R('They screenshotted your DM and posted it.', { rep: -2, heat: 8 }); } },
    ],
  },
  npc_callout: {
    title: (c) => `${npcName(c.npc)} called you out`,
    text: (c) => `${npcName(c.npc)} posted to ${fmt(S.npcs[c.npc].followers)} followers: "Some creators will do anything for clout. @${esc(S.handle)}, I'm looking at you."`,
    choices: (c) => [
      { label: 'Respond with receipts', fn: () => chance(0.5) ? R('You won this round.', { fp: 0.03, rep: 2, rel: { [c.npc]: -8 } }) : R('Your receipts were weak.', { rep: -5, heat: 10 }) },
      { label: 'Ignore it', fn: () => R('Their fans leave hate in your comments for a day.', { rep: -2, stress: 8 }) },
      { label: 'Make a parody', sub: `Charisma ${skillLvl('charisma')}`, fn: () => chance(0.3 + skillLvl('charisma') * 0.06) ? R('Hilarious. Even neutral fans shared it.', { fp: 0.05, rel: { [c.npc]: -12 } }) : R('Not funny. Cringe compilation material.', { rep: -3, heat: 6 }) },
      { label: 'Reach out privately', fn: () => { if (chance(0.3 + NPCS[c.npc].kind * 0.4)) { S.npcs[c.npc].feud = false; return R('You talked it out. They deleted the post.', { rel: { [c.npc]: 30 }, heat: -8 }); } return R('Left on read.', {}); } },
    ],
  },
  kenzie_video: {
    title: () => 'Kenzie Blake is making a video about you',
    text: () => 'Her community post teases "the truth about @' + esc(S.handle) + '". It drops tomorrow.',
    choices: () => [
      { label: 'Get ahead of it', sub: '−15 energy', fn: () => R('You addressed the rumors first. Her video flopped.', { energy: -15, heat: -12, rep: 1 }) },
      { label: 'Offer her an interview', fn: () => chance(0.5) ? R('She was fair. Surprisingly.', { fp: 0.02, rep: 2, rel: { kenzie: 15 } }) : R('She edited it to make you look awful.', { rep: -6, heat: 12, fp: 0.02 }) },
      { label: 'Threaten legal action', fn: () => R('The Streisand effect is real.', { heat: 18, rep: -4, fp: 0.02, rel: { kenzie: -20 } }) },
    ],
  },
  breakup: {
    random: true, w: 2, when: () => !!S.partner, title: () => 'Trouble in paradise',
    text: () => `You and ${npcName(S.partner)} have been fighting. It's over.`,
    choices: () => {
      const p = S.partner;
      const end = () => { S.partner = null; S.stats.breakups++; news(`@${S.handle} and ${npcName(p)} have split`, true); };
      return [
        { label: 'Joint amicable statement', fn: () => { end(); return R('Mature. The internet is sad but respectful.', { fp: -0.02, rep: 2, rel: { [p]: -10 } }); } },
        { label: 'Messy breakup video', fn: () => { end(); S.npcs[p].feud = true; S.stats.feuds++; return R('Views exploded. So did your relationship with their fans.', { fp: 0.06, rep: -6, heat: 18, rel: { [p]: -60 } }); } },
        { label: 'Silence', fn: () => { end(); return R('Fans spent a week analyzing unfollows.', { heat: 6, rel: { [p]: -20 } }); } },
      ];
    },
  },
  ftc: {
    title: () => 'Undisclosed ad complaint',
    text: (c) => `A consumer watchdog noticed your ${BRANDS[c.brand].name} posts didn't say #ad.`,
    choices: (c) => [
      { label: `Pay the fine (${money(Math.round(c.pay * 0.5))})`, fn: () => R('Settled quietly.', { money: -Math.round(c.pay * 0.5), rep: -2, legal: true }) },
      { label: 'Fight it', sub: S.team.lawyer ? 'Your lawyer is confident' : 'Coin flip', fn: () => (S.team.lawyer || chance(0.5)) ? R('Case dismissed.', { money: -500 }) : R('You lost. Bigger fine, bigger headlines.', { money: -c.pay, rep: -5, heat: 10, legal: true }) },
    ],
  },
  hacked_scam: {
    title: () => 'That was a phishing link',
    text: () => 'The "Pixgram Security" page stole your password. The hacker is posting crypto scams on your account.',
    choices: () => EVENTS.hacked.choices(),
  },

  /* ---------- awards ---------- */
  awards: {
    eyebrow: () => 'Awards season', title: () => 'The Clout Awards',
    text: () => {
      const elig = T() >= 2e4 && S.rep >= 40;
      if (!elig) return 'The Clout Awards are tonight. You weren\'t nominated. Eligibility: 20K followers and at least 40 reputation.';
      return `You're nominated for <b>${awardCat()}</b>. The ceremony is tonight.`;
    },
    ctx: () => ({}),
    choices: () => {
      const elig = T() >= 2e4 && S.rep >= 40;
      if (!elig) return [{ label: 'Watch from the couch', fn: () => R('Next year.') }];
      S.stats.noms++;
      const cat = awardCat();
      const p = clamp(0.12 + Math.log10(T()) / 22 + (S.rep - 50) / 140 + S.stats.viral * 0.006, 0.05, 0.8);
      const outcome = (bonus) => {
        if (chance(p + bonus)) { S.stats.awards++; S.awards = S.awards || []; S.awards.push({ d: S.day, cat }); gainEnergy(40, 'You won an award'); news(`@${S.handle} wins ${cat} at the Clout Awards`, true); sound('viral'); return R(`You won ${cat}!`, { fp: 0.05, rep: 4 }); }
        return R('You lost to someone with worse content. Allegedly.', { fp: 0.01 });
      };
      return [
        { label: 'Attend in a designer look ($2,000)', sub: `Win chance about ${Math.round((p + 0.05) * 100)}%`, disabled: () => S.money < 2000, fn: () => { S.money -= 2000; return outcome(0.05); } },
        { label: 'Attend casually', sub: `Win chance about ${Math.round(p * 100)}%`, fn: () => outcome(0) },
        { label: 'Skip it', fn: () => R('Absent winners look arrogant; absent losers look smart.', { rep: -1 }) },
      ];
    },
  },

  /* ---------- livestream ---------- */
  _chat: {
    eyebrow: (c) => `${(STREAM_THEMES[c.theme] || STREAM_THEMES.chat).icon} Live · ${fmt(c.viewers)} watching${c.hype ? ` · hype ${'🔥'.repeat(Math.min(5, c.hype))}` : ''} · moment ${c.i + 1}/${c.list.length}`, title: (c) => CHAT[c.list[c.i]].title(c),
    text: (c) => CHAT[c.list[c.i]].text(c),
    choices: (c) => CHAT[c.list[c.i]].choices(c).map((ch) => ({ ...ch, fn: () => {
      const res = ch.fn() || R('');
      c.i++;
      if (c.i < c.list.length) S.queue.unshift({ ev: '_chat', ctx: c });
      else S.queue.unshift({ ev: '_streamEnd', ctx: c });
      return res;
    } })),
  },
  _streamEnd: {
    eyebrow: () => 'Stream ended', title: (c) => `${STREAMS[c.len].name} wrap-up`,
    onShow: (c) => {
      const L = STREAMS[c.len];
      const ch = 1 + (skillLvl('charisma') - 1) * 0.06;
      const TH = STREAM_THEMES[c.theme] || STREAM_THEMES.chat;
      c.giftX = (c.giftX || 1) * (TH.mod.gift || 1) * (1 + (c.hype || 0) * 0.05);
      c.don = Math.round(c.don + c.viewers * L.hours * rnd(0.03, 0.08) * ch);
      c.gain = Math.round(c.viewers * L.hours * rnd(0.05, 0.11) * ch * diffM() / (1 + Math.log10(Math.max(1, S.platforms.live.followers) / 100 + 1) * 0.6));
      const gifts = rollGifts(c);
      if (TH.mod.charity) { c.charity = c.don + gifts; S.stats.donated = (S.stats.donated || 0) + c.charity; changeRep(TH.mod.rep); addFollowersPct(0.01); c.don = Math.round(c.don * 0.1); c.giftTotal = Math.round(gifts * 0.1); news(`@${S.handle} raised ${money(c.charity)} for charity on stream`, true); }
      else if (TH.mod.rep) changeRep(TH.mod.rep);
      if (!TH.mod.charity) { S.money += gifts; S.stats.earned += gifts; } else { S.money += c.giftTotal; } S.stats.giftsEarned = (S.stats.giftsEarned || 0) + gifts;
      if (chance(L.hours >= 12 ? 0.8 : L.hours >= 3 ? 0.45 : 0.25)) { const pk = pick(PR_PACKAGES); const note = pk.fx(); c.pkg = pk.text + (typeof note === 'string' ? `. ${note}` : ''); }
      c.gain = Math.round(c.gain * (TH.mod.gain || 1) * (1 + (c.hype || 0) * 0.04) * (1 + 0.15 * tm('producer')));
      S.platforms.live.followers += c.gain;
      for (const id of unlockedIds()) if (id !== 'live' && id !== 'vault') S.platforms[id].followers += c.gain * 0.1;
      S.money += c.don; S.stats.earned += c.don; S.stats.streams++;
      if (typeof passXP === 'function') passXP(30);
      if (typeof questEvent === 'function') questEvent('stream');
      gainEnergy(Math.round(clamp(Math.log10(c.viewers + 1) * 4, 3, 25)), 'Chat hyped you up');
      if (c.len === 's12') S.stats.subathons++;
      S.platforms.live.eng = clamp(S.platforms.live.eng * 0.8 + 14 * 0.2, 0.5, 30);
      addXp('charisma', 10 * L.hours);
      if (c.viewers > (S.stats.peakViewers || 0)) S.stats.peakViewers = c.viewers;
      log(`Streamed ${L.hours}h: peak ${fmt(c.viewers)} viewers, ${money(c.don)} in donations, ${money(c.giftTotal)} in gifts.`, 'good');
      if (c.giftTotal >= 1000 && typeof celebrate === 'function') celebrate('gold');
      S.lastPostDay = S.day;
      sound('cash');
      checkAll();
    },
    text: (c) => `<div class="summary-lines">${c.charity ? `<div><span>Raised for charity 💚</span><span class="num good">${money(c.charity)}</span></div>` : ''}${c.hype ? `<div><span>Peak hype</span><span>${'🔥'.repeat(Math.min(5, c.hype))}</span></div>` : ''}<div><span>Peak viewers</span><span class="num">${fmt(c.viewers)}</span></div><div><span>Donations & subs</span><span class="num good">${money(c.don)}</span></div><div><span>Gifts</span><span class="num gold">${money(c.giftTotal || 0)}</span></div><div><span>New Streamly followers</span><span class="num good">${signed(c.gain)}</span></div></div>
      ${(c.gifts || []).length ? `<div class="gifts">${c.gifts.map((g) => `<span class="gift" title="${g.name} · $${g.v} each"><b>${g.icon}</b>×${fmt(g.n)}</span>`).join('')}</div>` : ''}
      ${c.topGifter ? `<div class="small muted">Top gifter: <b style="color:var(--ink)">@${esc(c.topGifter.who)}</b> ${c.topGifter.gift.icon}</div>` : ''}
      ${c.pkg ? `<div class="hint">📦 PR package arrived: ${esc(c.pkg)}</div>` : ''}`,
    choices: () => [{ label: 'Close stream', fn: () => null }],
  },
};

function awardCat() {
  const n = NICHES[S.niche].name;
  const t = T();
  return t >= 1e7 ? 'Creator of the Year' : t >= 1e6 ? `Best ${n} Creator` : t >= 1e5 ? 'Breakout Creator' : 'Rising Star';
}

/* Livestream chat moments. Each mutates the stream context c. */
/* Virtual gifts viewers send during a stream, and the PR packages that show up after */
const LIVE_GIFTS = [
  { id: 'rose', name: 'Rose', icon: '🌹', v: 1, share: 0.14 },
  { id: 'heart', name: 'Heart', icon: '💖', v: 5, share: 0.18 },
  { id: 'crown', name: 'Crown', icon: '👑', v: 25, share: 0.18 },
  { id: 'rocket', name: 'Rocket', icon: '🚀', v: 100, share: 0.2 },
  { id: 'lion', name: 'Lion', icon: '🦁', v: 500, share: 0.15 },
  { id: 'galaxy', name: 'Galaxy', icon: '🌌', v: 2000, share: 0.1 },
  { id: 'universe', name: 'Universe', icon: '🪐', v: 10000, share: 0.05 },
];
function rollGifts(c) {
  const L = STREAMS[c.len];
  const ch = 1 + (skillLvl('charisma') - 1) * 0.08;
  const budget = (typeof worldMult === 'function' ? worldMult('gift') : 1) * (1 + 0.25 * tm('producer')) * c.viewers * Math.pow(L.hours, 0.85) * rnd(0.25, 0.5) * ch * clamp(S.rep / 55, 0.4, 1.6) * (c.giftX || 1) * (S.team.smm ? 1.15 : 1) * (1 + SB('gift')) + 8;
  const out = [];
  for (const g of LIVE_GIFTS) {
    const exp = (budget * g.share) / g.v * rnd(0.6, 1.4);
    const n = exp >= 1 ? Math.round(exp) : chance(exp) ? 1 : 0;
    if (n) out.push({ ...g, n });
  }
  if (!out.length) out.push({ ...LIVE_GIFTS[0], n: ri(3, 12) });
  const top = out[out.length - 1];
  c.gifts = out; c.giftTotal = out.reduce((a, g) => a + g.n * g.v, 0);
  c.topGifter = { who: fanHandle(), gift: top };
  return c.giftTotal;
}
const PR_PACKAGES = [
  { text: 'A crate of FizzBolt energy drinks', fx: () => gainEnergy(25, 'PR package: energy drinks') },
  { text: 'A designer hoodie from an up-and-coming brand', fx: () => { changeRep(1); addFollowersPct(0.004); } },
  { text: 'A hand-painted portrait from a fan', fx: () => { S.stress = clamp(S.stress - 12, 0, 100); } },
  { text: 'A mystery tech box', fx: () => { const it = SHOP.find((x) => x.cat === 'Gear' && !S.owned[x.id] && x.price <= 2000); if (it) { S.owned[it.id] = true; return `It was a ${it.name}! (+gear)`; } S.money += 500; return 'Already had everything inside, so you resold it for $500.'; } },
  { text: 'A gift card from a sponsor who wants in', fx: () => { const v = Math.round(Math.max(300, T() * 0.004) / 10) * 10; S.money += v; S.stats.earned += v; return `Worth ${money(v)}.`; } },
];

const CHAT = {
  giftwar: { title: () => 'Gift battle in chat!', text: () => `<b>${fanHandle()}</b> and <b>${fanHandle()}</b> are fighting to be your top gifter. 🚀🦁🚀`,
    choices: (c) => [
      { label: 'Hype the battle', sub: 'Gifts ×1.8, +stress', fn: () => { c.giftX = (c.giftX || 1) * 1.8; return R('Chat went feral. Rockets everywhere.', { stress: 6 }); } },
      { label: 'Set a gift goal', sub: '"At $500 I eat a ghost pepper"', fn: () => { c.giftX = (c.giftX || 1) * 1.5; c.viewers = Math.round(c.viewers * 1.2); return chance(0.6) ? R('Goal smashed. You ate the pepper. Clip of the week.', { heat: 4, stress: 8 }) : R('Goal hit in 4 minutes. Your mouth is still on fire.', { stress: 12 }); } },
      { label: 'Thank both of them warmly', fn: () => { c.giftX = (c.giftX || 1) * 1.2; return R('Wholesome. They both gifted more.', { rep: 1 }); } }] },
  whalegift: { title: () => 'A Galaxy just landed 🌌', text: () => `<b>${fanHandle()}</b> sent a Galaxy ($2,000) and wants a shoutout.`,
    choices: (c) => [
      { label: 'Give them a huge shoutout', fn: () => { c.don += 2000; c.giftX = (c.giftX || 1) * 1.3; return R('Everyone wants a shoutout now. More gifts poured in.'); } },
      { label: 'Read their name in a funny voice', sub: `Charisma ${skillLvl('charisma')}`, fn: () => { c.don += 2000; return chance(0.4 + skillLvl('charisma') * 0.05) ? (c.viewers = Math.round(c.viewers * 1.4), R('Chat lost it. The clip is everywhere.', { fp: 0.005 })) : R('They found it a bit weird but laughed.'); } }] },
  unhinged: { title: () => 'Big donation', text: () => '<b>xXgremlinXx</b> donated $50: "say something unhinged"',
    choices: (c) => [
      { label: 'Say it', fn: () => { c.viewers = Math.round(c.viewers * 1.3); c.don += 50; return R('Clip farmers are thrilled.', { heat: 8 }); } },
      { label: 'Laugh it off', fn: () => { c.don += 50; return R('Smooth.', { rep: 0.5 }); } }] },
  raid: { title: () => 'Troll raid', text: () => '400 accounts flood the chat with spam.',
    choices: (c) => [
      { label: 'Emote-only mode', fn: () => R('Chat is saved. Mods are grateful.') },
      { label: 'Roast them live', fn: () => { if (chance(0.6)) { c.viewers = Math.round(c.viewers * 1.4); return R('The roast was elite.', { rep: 0.5 }); } return R('You got heated. Clip is out of context everywhere.', { heat: 10 }); } },
      { label: 'Ignore and keep going', fn: () => { c.viewers = Math.round(c.viewers * 0.85); return R('Some viewers left.'); } }] },
  celeb: { init: (c) => { c.celeb = randomNpc((id) => !S.npcs[id].feud); }, title: (c) => `${npcName(c.celeb)} is in your chat`, text: (c) => `<b>@${NPCS[c.celeb].handle}</b>: "yo this stream is fire"`,
    choices: (c) => [
      { label: 'Shout them out', fn: () => { c.viewers = Math.round(c.viewers * 1.5); return R('Their fans came flooding in.', { rel: { [c.celeb]: 6 } }); } },
      { label: 'Invite them on stream', fn: () => { if (chance(0.25 + S.npcs[c.celeb].rel / 200)) { c.viewers = Math.round(c.viewers * 2.5); return R('They joined! Peak moment.', { rel: { [c.celeb]: 12 } }); } return R('They left the chat. Oof.', { rel: { [c.celeb]: -2 } }); } }] },
  sad: { title: () => 'A viewer is struggling', text: () => '<b>tiny.moth</b>: "sorry to be a downer but today has been really hard"',
    choices: (c) => [
      { label: 'Stop and talk with them', fn: () => R('Chat filled with support. A beautiful moment.', { rep: 3 }) },
      { label: 'Keep the energy up', fn: () => R('The moment passes.') }] },
  ex: { title: () => 'Chat wants tea', text: () => '<b>chaotic.bean</b>: "spill the tea about your ex!!"',
    choices: (c) => [
      { label: 'Spill it', fn: () => { c.viewers = Math.round(c.viewers * 1.6); return R('Views spiked. Your ex has seen it.', { heat: 10, rep: -2 }); } },
      { label: 'Deflect gracefully', fn: () => R('Respect.', { rep: 0.5 }) }] },
  sponsor: { title: () => 'Sponsor segment?', text: () => S.deals.some((d) => d.status === 'active') ? 'It\'s a good moment to read your sponsor ad.' : 'Chat is calm. Good time to plug something.',
    choices: (c) => {
      const d = S.deals.find((x) => x.status === 'active');
      const out = [];
      if (d) out.push({ label: `Read the ${BRANDS[d.brand].name} ad`, sub: 'Counts toward the deal', fn: () => { d.done++; if (d.done >= d.req) completeDeal(d); c.viewers = Math.round(c.viewers * 0.9); return R('Chat spammed "#ad". Deal progress +1.'); } });
      if (S.merch) out.push({ label: 'Plug your merch', fn: () => { S.merch.boost = (S.merch.boost || 0) + 1; return R('Merch link clicks are up.'); } });
      out.push({ label: 'Skip it', fn: () => R('Chat appreciates it.') });
      return out;
    } },
  crash: { title: () => 'Stream crashed', text: () => 'Your internet dropped mid-sentence.',
    choices: (c) => [
      { label: 'Restart fast', fn: () => { c.viewers = Math.round(c.viewers * 0.7); return R('Lost some viewers.'); } },
      { label: 'Switch to phone hotspot', fn: () => { c.viewers = Math.round(c.viewers * 0.85); return R('Grainy but alive.', { money: -20 }); } }] },
  pepper: { title: () => 'Challenge request', text: () => 'Chat wants you to eat a ghost pepper. Donations are rolling in for it.',
    choices: (c) => [
      { label: 'Do it', fn: () => { c.viewers = Math.round(c.viewers * 1.5); c.don += Math.round(c.viewers * 0.2); return R('You cried. Chat cried laughing.', { stress: 6 }); } },
      { label: 'Absolutely not', fn: () => R('Fair.') }] },
  mom: { title: () => 'Surprise guest', text: () => 'Your mom walks in with laundry.',
    choices: (c) => [
      { label: 'Introduce her to chat', fn: () => { c.viewers = Math.round(c.viewers * 1.3); return R('Chat adopts her immediately.', { rep: 1.5 }); } },
      { label: 'Panic-mute', fn: () => R('Chat is spamming "HI MOM".') }] },
  swat: { title: () => 'Threat in chat', text: () => 'Someone posted your old address and made a threat.',
    choices: (c) => [
      { label: 'End stream and report', fn: () => { c.viewers = Math.round(c.viewers * 0.5); return R('Safe call. Platform banned the account.', { stress: 10 }); } },
      { label: 'Keep going', fn: () => chance(0.2) ? R('Police knocked on your door on stream. Terrifying.', { stress: 30, heat: 10 }) : R('Nothing happened, but your hands are shaking.', { stress: 12 }) }] },
  rival: { init: (c) => { c.rival = Object.keys(S.npcs).find((id) => S.npcs[id].feud) || 'brody'; }, title: (c) => `${npcName(c.rival)} raided your stream`, text: (c) => `${npcName(c.rival)} sent thousands of viewers your way with a smirk.`,
    choices: (c) => [
      { label: 'Roast them back', fn: () => { c.viewers = Math.round(c.viewers * 2); return R('Chat exploded.', { heat: 6, rel: { [c.rival]: -5 } }); } },
      { label: 'Welcome them warmly', fn: () => { c.viewers = Math.round(c.viewers * 1.6); S.npcs[c.rival].feud = false; return R('A peace offering. It worked.', { rep: 2, rel: { [c.rival]: 20 } }); } }] },
  bigdonor: { title: () => 'Whale alert', text: () => '<b>lunar.otter</b> donated $500: "show us your pet!!"',
    choices: (c) => [
      { label: 'Pet reveal', fn: () => { c.don += 500; c.viewers = Math.round(c.viewers * 1.25); return R('Your cat ignored everyone. Perfect content.', { rep: 1 }); } },
      { label: 'Thank them and move on', fn: () => { c.don += 500; return R('Classy.'); } }] },
};

/* ---------- Stream themes: each one changes the vibe, the payouts and the chat moments ---------- */
const STREAM_THEMES = {
  chat:     { name: 'Just chatting', icon: '💬', desc: 'Hang out and talk. Balanced.', mod: {} },
  gaming:   { name: 'Gaming',        icon: '🎮', desc: 'Clutch plays and rage moments. More new followers.', mod: { gain: 1.25 } },
  cooking:  { name: 'Cooking',       icon: '🍳', desc: 'Food blogging, live. Gifts are generous, reputation goes up.', mod: { gift: 1.15, rep: 0.5 } },
  irl:      { name: 'IRL city walk', icon: '🏙️', desc: 'Roam the streets with a camera. Big viewer swings, more stress.', mod: { viewers: 1.3, stress: 6 } },
  karaoke:  { name: 'Karaoke night', icon: '🎤', desc: 'Sing badly, earn well. Gifts ×1.3.', mod: { gift: 1.3 } },
  qna:      { name: 'Q&A / AMA',     icon: '❓', desc: 'Answer anything. Fans trust you more.', mod: { rep: 1 } },
  charity:  { name: 'Charity stream', icon: '💚', desc: 'Donations go to a cause. Huge reputation, sponsors notice.', mod: { charity: true, rep: 4, gain: 1.15 }, min: 2000 },
  collab:   { name: 'Collab stream', icon: '🤝', desc: 'Go live with a friendly star. Their fans pour in.', mod: { viewers: 1.6, gain: 1.3 }, need: () => !!randomNpc((id) => S.npcs[id].rel >= 20 && !S.npcs[id].feud) },
};
const tName = () => pick(['lunar', 'chaotic', 'soft', 'midnight', 'rogue', 'velvet', 'crispy', 'pixel']) + '.' + pick(['otter', 'bean', 'goblin', 'moth', 'raccoon', 'mango', 'noodle', 'comet']) + ri(1, 99);
Object.assign(CHAT, {
  /* generic, but different every time */
  clipviral: { title: () => 'A clip is blowing up mid-stream', text: (c) => `Someone clipped you ${pick(['tripping over your chair', 'laughing at your own joke for 40 seconds', 'getting jump-scared by a notification', 'singing the ad music'])}. It's spreading on Clipz right now.`,
    choices: (c) => [
      { label: 'Lean in and recreate it', fn: () => { c.viewers = Math.round(c.viewers * 1.5); c.hype = (c.hype || 0) + 2; return R('Chat is spamming the clip emote. New viewers keep arriving.', { fp: 0.004 }); } },
      { label: 'Ask chat to stop clipping', fn: () => { c.viewers = Math.round(c.viewers * 0.95); return R('The Streisand effect kicks in. They clip that too.', { heat: 3 }); } }] },
  poll: { title: () => 'Chat poll: what next?', text: () => `${pick(['Spicy noodle challenge', 'Rate viewers\' setups', 'React to old posts', 'Prank call a friend'])} vs ${pick(['Draw fan requests', 'Speedrun a kids game', 'Read hate comments', 'Tier-list snacks'])}. Chat is voting.`,
    choices: (c) => [
      { label: 'Do whatever wins', fn: () => { c.viewers = Math.round(c.viewers * 1.25); c.hype = (c.hype || 0) + 1; return R('Chat loves being in charge.', { rep: 0.5 }); } },
      { label: 'Do both, back to back', sub: '−8 energy', fn: () => { c.viewers = Math.round(c.viewers * 1.45); c.hype = (c.hype || 0) + 2; return R('Chaotic double feature. Nobody left.', { energy: -8, stress: 4 }); } }] },
  brandlive: { title: () => 'A brand is in your chat', text: () => `<b>${pick(Object.values(BRANDS).filter((b) => !b.shady)).name}</b> offers $${fmt(Math.round(Math.max(150, T() * 0.004)))} to use their product live, right now.`,
    choices: (c) => [
      { label: 'Do it on the spot', fn: () => { const v = Math.round(Math.max(150, T() * 0.004)); c.don += v; c.viewers = Math.round(c.viewers * 0.92); return R(`Easy ${money(v)}. A few viewers rolled their eyes.`, { rep: -0.3 }); } },
      { label: 'Roast the product (lovingly)', sub: `Charisma ${skillLvl('charisma')}`, fn: () => chance(0.35 + skillLvl('charisma') * 0.06) ? (c.don += Math.round(Math.max(300, T() * 0.008)), R('They LOVED it and doubled the pay.', { fp: 0.003 })) : R('They left the chat. Chat thought it was hilarious though.', { heat: 2 }) },
      { label: 'Decline', fn: () => R('Integrity points.', { rep: 0.5 }) }] },
  speedrun: { title: () => 'Hype train incoming 🚂', text: (c) => `Level ${ri(2, 5)} hype train! ${fmt(Math.round(c.viewers * 0.08) + 3)} gifts in the last minute.`,
    choices: (c) => [
      { label: 'Ride it: promise a reward at level 10', fn: () => { c.giftX = (c.giftX || 1) * 1.6; c.hype = (c.hype || 0) + 3; return R('Level 10 reached. You now owe chat a dramatic reading of your old tweets.', { stress: 5 }); } },
      { label: 'Thank everyone by name', fn: () => { c.giftX = (c.giftX || 1) * 1.2; return R('It took 9 minutes. Chat felt seen.', { rep: 1 }); } }] },
  /* themed moments */
  g_clutch: { theme: 'gaming', title: () => '1v4 clutch moment', text: () => 'Last one alive. Chat is holding its breath.',
    choices: (c) => [
      { label: 'Go for the clutch', fn: () => chance(0.45 + skillLvl('creativity') * 0.03) ? (c.viewers = Math.round(c.viewers * 1.9), c.hype = (c.hype || 0) + 3, R('ACE. Chat exploded. That clip is going everywhere.', { fp: 0.006 })) : R('You lost. You slammed the desk a little too hard. That clip is going everywhere too.', { heat: 6 }) },
      { label: 'Play it safe', fn: () => R('You survived. Chat says "boring" but stays.') }] },
  g_cheater: { theme: 'gaming', title: () => 'Chat thinks you\'re cheating', text: () => '"no way that shot was legit" is spreading in chat.',
    choices: (c) => [
      { label: 'Hand-cam to prove it', fn: () => { c.viewers = Math.round(c.viewers * 1.3); return R('Clean hands, cleaner aim. Doubters converted.', { rep: 1 }); } },
      { label: 'Ban the accusers', fn: () => { c.viewers = Math.round(c.viewers * 0.9); return R('Chat is quieter. Reddit is louder.', { heat: 5 }); } }] },
  c_fire: { theme: 'cooking', title: () => 'Kitchen fire! 🔥', text: () => 'The pan is on fire. Chat is typing "LMAOOO" faster than you can find the lid.',
    choices: (c) => [
      { label: 'Calmly put it out with a lid', fn: () => { c.viewers = Math.round(c.viewers * 1.3); return R('Chef energy. Chat is impressed.', { rep: 1 }); } },
      { label: 'Panic theatrically', fn: () => { c.viewers = Math.round(c.viewers * 1.6); c.hype = (c.hype || 0) + 2; return R('The scream clip is iconic. Kitchen is fine. Mostly.', { stress: 6 }); } }] },
  c_secret: { theme: 'cooking', title: () => 'Chat picks the secret ingredient', text: () => `Winning vote: <b>${pick(['pickle juice', 'gummy bears', 'hot cheetos', 'maple syrup', 'cereal'])}</b>. In a pasta.`,
    choices: (c) => [
      { label: 'Commit and rate it honestly', fn: () => { c.viewers = Math.round(c.viewers * 1.35); c.giftX = (c.giftX || 1) * 1.2; return R(chance(0.5) ? 'Shockingly good. 7/10. Chat demands the recipe.' : 'It was a crime. 2/10. Chat gifted out of pity.', { rep: 0.5 }); } },
      { label: 'Fake it', fn: () => R('Chat noticed the swap. Trust -1.', { rep: -1 }) }] },
  i_fan: { theme: 'irl', title: () => 'A fan spots you on the street', text: () => `"OMG are you @${S.handle}?!" A crowd is forming.`,
    choices: (c) => [
      { label: 'Take selfies with everyone', fn: () => { c.viewers = Math.round(c.viewers * 1.4); return R('Wholesome chaos. Chat loved it.', { rep: 1.5, stress: 4 }); } },
      { label: 'Run away dramatically', fn: () => { c.viewers = Math.round(c.viewers * 1.5); c.hype = (c.hype || 0) + 2; return R('A chase through the city. Peak content.', { heat: 3 }); } }] },
  i_busker: { theme: 'irl', title: () => 'A street performer pulls you in', text: () => 'A breakdancer wants you to battle him. The crowd is chanting.',
    choices: (c) => [
      { label: 'Battle him', fn: () => chance(0.5) ? (c.viewers = Math.round(c.viewers * 1.7), R('You hit a worm. The crowd lost it.', { fp: 0.005 })) : (c.viewers = Math.round(c.viewers * 1.4), R('You fell. Hard. Still the best moment of the day.', { stress: 5 })) },
      { label: 'Tip him and hype him up', fn: () => R('He went viral too. Good karma.', { money: -50, rep: 1.5 }) }] },
  k_ballad: { theme: 'karaoke', title: () => 'Chat demands a power ballad', text: () => `${pick(['"My Heart Will Go On"', '"I Will Always Love You"', '"Bohemian Rhapsody"', '"Total Eclipse of the Heart"'])}. Key change included.`,
    choices: (c) => [
      { label: 'Go for the high note', fn: () => chance(0.4 + skillLvl('charisma') * 0.04) ? (c.giftX = (c.giftX || 1) * 1.8, R('YOU HIT IT. Gifts are raining.', { fp: 0.005 })) : (c.giftX = (c.giftX || 1) * 1.4, R('You did not hit it. Gifts are raining anyway.', { heat: 2 })) },
      { label: 'Lip-sync with dramatic choreography', fn: () => { c.viewers = Math.round(c.viewers * 1.3); return R('Theatre kid energy. Respect.'); } }] },
  q_salary: { theme: 'qna', title: () => '"How much do you make?"', text: () => 'The most-upvoted question. Chat is waiting.',
    choices: (c) => [
      { label: 'Tell the truth', fn: () => { c.viewers = Math.round(c.viewers * 1.4); return R(`You said ${money(S.stats.earned)} lifetime. Chat is stunned. Clips everywhere.`, { heat: 6, rep: 1 }); } },
      { label: '"Enough to buy chat pizza"', fn: () => { c.hype = (c.hype || 0) + 1; return R('Charming dodge.', { rep: 0.5 }); } }] },
  q_deep: { theme: 'qna', title: () => 'A real question', text: () => `<b>${tName()}</b>: "how do you deal with hate comments?"`,
    choices: (c) => [
      { label: 'Answer honestly', fn: () => { c.giftX = (c.giftX || 1) * 1.25; return R('Chat got emotional. People thanked you for hours.', { rep: 2, stress: -6 }); } },
      { label: 'Joke your way out', fn: () => R('Laughs, but a missed moment.') }] },
  ch_match: { theme: 'charity', title: () => 'Match the donations?', text: () => 'Chat is at 80% of the charity goal. You could match every donation from here.',
    choices: (c) => [
      { label: 'Match them', sub: '$' + 1000, disabled: () => S.money < 1000, fn: () => { c.viewers = Math.round(c.viewers * 1.5); return R('Goal smashed. Headlines: "Creator doubles charity haul".', { money: -1000, rep: 4, fp: 0.01 }); } },
      { label: 'Cheer chat on', fn: () => { c.hype = (c.hype || 0) + 2; return R('Chat got the goal on its own. Beautiful.', { rep: 1 }); } }] },
  co_offscript: { theme: 'collab', init: (c) => { c.co = c.co || randomNpc((id) => S.npcs[id].rel >= 20 && !S.npcs[id].feud) || randomNpc(); }, title: (c) => `${npcName(c.co)} goes off-script`, text: (c) => `${npcName(c.co)} just brought up your most embarrassing old post. Live.`,
    choices: (c) => [
      { label: 'Roast them right back', fn: () => { c.viewers = Math.round(c.viewers * 1.5); c.hype = (c.hype || 0) + 2; return R('A legendary roast battle. Both fanbases are thrilled.', { rel: { [c.co]: 4 } }); } },
      { label: 'Laugh it off', fn: () => R('Good sport. They respect you more.', { rep: 1, rel: { [c.co]: 6 } }) }] },
});

function startStream(len, theme = 'chat') {
  const L = STREAMS[len], TH = STREAM_THEMES[theme] || STREAM_THEMES.chat;
  if (S.energy < L.e) return toast(`You need ${L.e} energy for this stream.`, 'bad');
  if (S.hackedUntil >= S.day) return toast('Your account is locked while you recover it.', 'bad');
  S.energy -= L.e;
  S.stress = clamp(S.stress + L.e * 0.12 + (L.stress || 0) + (TH.mod.stress || 0), 0, 100);
  const ch = 1 + (skillLvl('charisma') - 1) * 0.06;
  const viewers = Math.round((S.platforms.live.followers * 0.06 + T() * 0.002 + 5) * ch * (S.algo.live || 1) * (1 + gearQ('live')) * diffM() * (TH.mod.viewers || 1));
  // never the same stream twice: themed moments first, then a shuffle of everything else, avoiding last stream's moments
  const recent = S.flags.lastChats || [];
  const ok = (k) => (k !== 'rival' || Object.values(S.npcs).some((n) => n.feud)) && !recent.includes(k);
  let themed = shuffle(Object.keys(CHAT).filter((k) => CHAT[k].theme === theme && ok(k)));
  if (!themed.length) themed = shuffle(Object.keys(CHAT).filter((k) => CHAT[k].theme === theme)); // always at least one themed moment
  const generic = shuffle(Object.keys(CHAT).filter((k) => !CHAT[k].theme && ok(k)));
  const list = [...themed.slice(0, Math.max(1, Math.ceil(L.chats / 2))), ...generic].slice(0, L.chats);
  S.flags.lastChats = list;
  const c = { len, theme, viewers, don: 0, gain: 0, list, i: 0, hype: 0 };
  list.forEach((k) => CHAT[k].init && CHAT[k].init(c));
  S.queue.unshift({ ev: '_chat', ctx: c });
  sound('post');
  processQueue();
}

/* ---------- modal & queue ---------- */
let modalBusy = false;
function processQueue() {
  if (modalBusy || !S) return;
  const item = S.queue.shift();
  if (!item) { renderAll(); return; }
  const ev = EVENTS[item.ev];
  if (!ev) return processQueue();
  showEvent(ev, item.ctx || {});
}

function showEvent(ev, ctx) {
  modalBusy = true;
  if (ev.onShow) ev.onShow(ctx);
  const eyebrow = ev.eyebrow ? ev.eyebrow(ctx) : 'Day ' + S.day;
  const title = ev.title(ctx), text = ev.text(ctx);
  const choices = ev.choices(ctx);
  const box = $('#modalBox');
  const art = typeof eventArt === 'function' ? eventArt(String(title).replace(/<[^>]+>/g, ''), String(eyebrow)) : '';
  box.innerHTML = safe(`${ev === EVENTS._summary || ev === EVENTS._weekly ? '' : art}<div class="eyebrow">${eyebrow}</div><h3>${title}</h3><div class="body">${text}</div>
    <div class="choices">${choices.map((ch, i) => `<button class="choice" data-i="${i}" ${ch.disabled && ch.disabled() ? 'disabled' : ''}><b>${esc(ch.label)}</b>${ch.sub ? `<span>${esc(ch.sub)}</span>` : ''}</button>`).join('')}</div>`);
  $('#modal').hidden = false;
  renderAll();
  box.querySelectorAll('.choice').forEach((b) => b.addEventListener('click', () => {
    const ch = choices[+b.dataset.i];
    const res = ch.fn(ctx);
    if (res === 'restart') { closeModal(); return; }
    if (!res || (!res.text && !(res.fx && Object.keys(res.fx).length))) { closeModal(); checkAll(); save(); processQueue(); return; }
    const chips = applyFx(res.fx);
    checkAll(); save();
    box.innerHTML = safe(`<div class="eyebrow">${eyebrow}</div><h3>${esc(ch.label)}</h3><div class="body">${esc(res.text)}</div>
      ${chips.length ? `<div class="fx">${chips.map(([k, v, g]) => `<span class="pill ${g ? 'good' : 'bad'}">${esc(k)} ${esc(v)}</span>`).join('')}</div>` : ''}
      <div class="row" style="justify-content:flex-end"><button class="btn primary" id="modalOk">Continue</button></div>`);
    renderAll();
    const ok = $('#modalOk'); ok.focus();
    ok.addEventListener('click', () => { closeModal(); processQueue(); });
  }));
  const first = box.querySelector('.choice:not([disabled])'); if (first) first.focus();
}
function closeModal() { $('#modal').hidden = true; modalBusy = false; renderAll(); }
