/* Clout Chaser — behavior: personalities, memory, mood, mind games, and how stars and brands answer you */
'use strict';

/* ---------- personalities ---------- */
const ARCHETYPES = {
  diva:       { name: 'Diva',       desc: 'Big ego. Ignores small accounts, loves flattery, wants something in return.' },
  hothead:    { name: 'Hothead',    desc: 'Escalates every beef and holds grudges. Might come for you first.' },
  sweetheart: { name: 'Sweetheart', desc: 'Says yes a lot, forgives fast, gets hurt when attacked.' },
  strategist: { name: 'Strategist', desc: 'Calm and calculated. Ignores bait, keeps receipts, takes time to decide.' },
  wildcard:   { name: 'Wildcard',   desc: 'Mind games. Might say yes and vanish, or turn on you for fun.' },
};
const CO_STYLES = {
  savage:    { name: 'Savage',    desc: 'Roasts anyone who comes at them. Loves a public fight.' },
  corporate: { name: 'Corporate', desc: 'PR statements, lawyers, and the occasional deal to make problems go away.' },
  snob:      { name: 'Snob',      desc: 'Does not engage with small accounts. Only works with the elite.' },
};
function archetype(id) {
  const N = NPCS[id];
  if (N.drama >= 0.75 && N.kind < 0.45) return 'wildcard';
  if (N.drama >= 0.7) return 'hothead';
  if (N.ego >= 0.8) return 'diva';
  if (N.kind >= 0.7) return 'sweetheart';
  return 'strategist';
}
const coStyle = (id) => (COMPANIES[id].roast ? 'savage' : COMPANIES[id].cat === 'Luxury' ? 'snob' : 'corporate');

/* ---------- memory & mood ---------- */
function bstate(kind, id) {
  if (kind === 'co') { S.cos = S.cos || {}; return (S.cos[id] = S.cos[id] || { mood: 0, mem: [] }); }
  const n = S.npcs[id]; if (n.mood === undefined) n.mood = 0; if (!n.mem) n.mem = []; return n;
}
function remember(kind, id, act, moodDelta = 0) {
  const st = bstate(kind, id);
  st.mem.unshift({ d: S.day, a: act });
  if (st.mem.length > 12) st.mem.length = 12;
  st.mood = clamp((st.mood || 0) + moodDelta, -1, 1);
}
const recent = (kind, id, act, days) => bstate(kind, id).mem.filter((m) => m.a === act && S.day - m.d <= days).length;
const grudge = (id) => bstate('npc', id).mem.some((m) => ['beef', 'troll', 'tea', 'callout'].includes(m.a) && S.day - m.d < 14);
function stanceOf(id) {
  const n = bstate('npc', id);
  if (n.feud || n.rel <= -40 || (grudge(id) && n.mood < -0.3)) return 'hostile';
  if (n.rel >= 40 && n.mood > -0.2) return 'friendly';
  if (n.mood < -0.3 || grudge(id)) return 'wary';
  if (n.mood > 0.35) return 'warm';
  return 'neutral';
}
const STANCE = { hostile: ['Hostile', 'bad'], wary: ['Wary of you', 'warn'], neutral: ['Neutral', ''], warm: ['Warming up', 'good'], friendly: ['In your corner', 'good'] };
function moodLabel(m) { return m > 0.5 ? 'Hyped about you' : m > 0.15 ? 'Warm' : m > -0.15 ? 'Neutral' : m > -0.5 ? 'Annoyed' : 'Furious'; }
const MEM_TEXT = { praise: 'you praised them', pitch: 'you pitched a collab', shoutask: 'you asked for a shoutout', beef: 'you started beef', troll: 'you trolled them', apology: 'you apologized', gift: 'you sent a gift', tea: 'you spilled their tea', callout: 'you called them out', flaked: 'they flaked on you', declined: 'you turned down their terms', sponsorpitch: 'you pitched a sponsorship', dm: 'you DM\'d them' };
function memorySummary(kind, id) {
  return bstate(kind, id).mem.slice(0, 4).map((m) => `${MEM_TEXT[m.a] || m.a} ${S.day - m.d ? (S.day - m.d) + 'd ago' : 'today'}`);
}

/* ---------- what they say ---------- */
const ANSWERS = {
  diva:       { yes: ['fine. you have good energy. let\'s do it', 'ok. but my lighting, my rules'], no: ['I don\'t really do that with smaller accounts, sorry', 'my team says no. I say no too'], counter: ['maybe. shout me out first and we\'ll talk', 'I\'d consider it… if you make it worth my while'], later: ['let me check with my team 💅', 'I\'ll think about it'], flake: [] },
  hothead:    { yes: ['LET\'S GO. we\'re gonna break the internet', 'say less, I\'m in'], no: ['nah', 'not happening, especially after what you pulled'], counter: ['prove you\'re serious. post about me first', 'only if you say it publicly'], later: ['busy rn, ask me tomorrow', 'maybe. ping me later'], flake: [] },
  sweetheart: { yes: ['omg yes!! I\'d love that 🥹', 'of course!! when are you free?'], no: ['aw I\'m so sorry, my schedule is crazy right now', 'I wish I could, maybe next month? 🤍'], counter: ['yes! could you give me a little shoutout first? 🙏'], later: ['let me look at my calendar and get back to you!'], flake: [] },
  strategist: { yes: ['the numbers make sense. let\'s do it', 'ok. send me a one-pager and a date'], no: ['not a fit for my audience right now', 'I\'ll pass for now'], counter: ['come with something concrete. mention me publicly and we\'ll see', 'I need to see you can deliver. shout me out first'], later: ['let me sleep on it', 'I\'ll get back to you after I check a few things'], flake: [] },
  wildcard:   { yes: ['sure lol why not', 'chaos collab? I\'m in'], no: ['who are you again lol', 'no 💀'], counter: ['only if you post something unhinged about me first', 'make it interesting. shout me out and maybe'], later: ['maybe. maybe not. we\'ll see 😈'], flake: [] },
};
const FORGIVE = {
  yes: ['ok. water under the bridge', 'fine. we\'re good', 'I appreciate that. truce'],
  no: ['too little, too late', 'you said what you said', 'nah. I remember everything'],
  counter: ['say it publicly and maybe I\'ll believe you', 'a DM? after a public diss? apologize in a post'],
  later: ['I need some time', 'I\'ll think about it'],
};

/* The heart of it: how a star answers an ask, shaped by personality, mood, memory and the power gap */
function decide(id, ask) {
  const n = bstate('npc', id), N = NPCS[id], A = archetype(id);
  const ratio = Math.min(1, totalFollowers() / n.followers);
  let p = { collab: 0.08 + n.rel / 120 + ratio * 0.8 - N.ego * 0.3 + (S.rep - 50) / 150,
    shout: n.rel / 150 + ratio * 0.5 - N.ego * 0.2 + 0.1,
    forgive: 0.2 + N.kind * 0.4 + n.rel / 200 }[ask] ?? 0.2;
  p += (n.mood || 0) * 0.2;
  if (S.heat > 60) p -= 0.15;
  const flattered = recent('npc', id, 'praise', 6) >= 1;
  let counter = 0.12, later = 0.12, ghost = 0.1;
  if (A === 'diva') { p *= 0.6 + ratio; if (flattered) p += 0.2; counter = 0.35; ghost = 0.25; }
  if (A === 'hothead') { if (grudge(id)) p -= 0.3; later = 0.05; counter = 0.15; }
  if (A === 'sweetheart') { p += 0.15; ghost = 0.03; counter = 0.08; }
  if (A === 'strategist') { later = 0.3; counter = 0.2; if (ratio < 0.02 && n.rel < 40) p -= 0.15; }
  if (A === 'wildcard') { later = 0.15; counter = 0.15; ghost = 0.15; }
  if (ask === 'forgive') { ghost = 0.05; if (A === 'diva' || A === 'strategist') counter = 0.5; if (A === 'hothead') p -= 0.15; }
  if (n.cond && n.cond.until >= S.day) counter = 0; // already waiting on you
  p = clamp(p, 0.02, 0.92);
  const r = Math.random(); const rest = 1 - p;
  let res;
  if (r < p) res = A === 'wildcard' && ask === 'collab' && chance(0.3) ? 'flake' : 'yes';
  else if (r < p + counter * rest) res = 'counter';
  else if (r < p + (counter + later) * rest) res = 'later';
  else if (r < p + (counter + later + ghost) * rest) res = 'ghost';
  else res = 'no';
  const pool = ask === 'forgive' ? FORGIVE : ANSWERS[A];
  const line = res === 'flake' ? pick(ANSWERS[A].yes) : res === 'ghost' ? '' : pick(pool[res] || ['...']);
  return { res, A, line };
}

/* Carries out a decision: messages, collab windows, counter-offers, delayed answers */
function resolveAsk(id, ask, d, via = 'dm') {
  const N = NPCS[id], n = bstate('npc', id), first = N.name.split(' ')[0];
  const say = (body) => { const m = mail({ type: 'npc', npc: id, subject: '', body }); m.read = !!(ui && ui.view && ui.view.key === 'npc:' + id); };
  const out = { ok: false, msg: '' };
  if (d.res === 'yes' || d.res === 'flake') {
    if (ask === 'collab') {
      if (S.collab) { say('love it, but finish your current collab first'); out.msg = `${first} said yes, but you already have a collab running.`; return out; }
      S.collab = { npc: id, until: S.day + 4, flaky: d.res === 'flake' }; changeRel(id, 4);
      if (d.res === 'flake') S.pending.push({ day: S.day + 1, id, ask: 'flake' });
      gainEnergy(6, 'Collab locked in'); log(`${N.name} agreed to collab${via === 'post' ? ' after your public pitch' : ''}.`, 'gold');
      out.ok = true; out.msg = `${N.name} said yes! Post the collab within 4 days.`;
    } else if (ask === 'shout') {
      const g = Math.min(n.followers * 0.0015 * rnd(0.5, 1.5), Math.max(totalFollowers() * 0.6, 2000)) * diffM();
      addFollowers(g); changeRel(id, -2); notify('repost', id, 'shouted you out to their followers', { npc: true });
      gainEnergy(12, 'Shoutout rush'); log(`${N.name} shouted you out (${signed(g)}).`, 'gold');
      out.ok = true; out.msg = `${N.name} shouted you out!`;
    } else if (ask === 'forgive') {
      n.feud = false; changeRel(id, 25); remember('npc', id, 'apology', 0.5); news(`@${S.handle} and ${N.name} make peace`, true);
      out.ok = true; out.msg = `${N.name} accepted your apology.`;
    }
    if (d.line) say(d.line);
  } else if (d.res === 'counter') {
    const cond = ask === 'forgive' ? 'apology' : (archetype(id) === 'diva' && chance(0.5)) ? 'gift' : 'shout';
    const price = giftCost(id) * 3;
    mail({ type: 'counter', npc: id, ask, cond, price, subject: '', body: d.line + (cond === 'gift' ? ` (a ${money(price)} gift would help)` : cond === 'apology' ? ' (post an apology that @mentions them)' : ' (post a shoutout that @mentions them within 3 days)') });
    out.msg = `${first} sent a counter-offer. Check Messages.`;
  } else if (d.res === 'later') {
    S.pending.push({ day: S.day + ri(1, 2), id, ask });
    if (d.line) say(d.line);
    out.msg = `${first} is thinking about it.`;
  } else if (d.res === 'ghost') {
    out.msg = `Seen by ${first}. No reply.`;
  } else {
    if (d.line) say(d.line);
    changeRel(id, -1);
    out.msg = `${first} said no.`;
  }
  return out;
}
/* Ask from anywhere (buttons, DMs, public posts) */
function askStar(id, ask, via) {
  remember('npc', id, ask === 'collab' ? 'pitch' : ask === 'shout' ? 'shoutask' : 'apology', 0);
  return resolveAsk(id, ask, decide(id, ask), via);
}

/* ---------- beef: how stars hit back ---------- */
const COMEBACKS = {
  attack: ['@{me} you\'re literally famous for being mean to me. sit down', 'imagine needing my name to go viral @{me}', '@{me} I\'ve had haters with better content', 'ok @{me}, round two. you asked for it'],
  dismiss: ['who?', 'not sure who that is but ok', 'I don\'t respond to people under 1M lol'],
  defend: ['here are the receipts. I\'ll let you decide 🧾', 'interesting claim. here\'s the actual timeline', 'I don\'t do drama. I do facts.'],
  hurt: ['this one really hurt ngl. I always supported you', 'I\'m logging off for a bit. be kind to each other 🤍', 'didn\'t expect this from you'],
};
function provoke(id, how = 'beef') {
  const n = bstate('npc', id), N = NPCS[id], A = archetype(id);
  const ratio = totalFollowers() / Math.max(1, n.followers);
  if (!n.feud) { n.feud = true; S.stats.feuds++; }
  changeRel(id, -25); remember('npc', id, how === 'troll' ? 'troll' : 'beef', -0.5);
  let stance;
  if (A === 'hothead') stance = chance(0.7) ? 'attack' : 'challenge';
  else if (A === 'wildcard') stance = pick(['attack', 'attack', 'mindgame', 'dismiss']);
  else if (A === 'diva') stance = ratio < 0.2 ? 'dismiss' : 'attack';
  else if (A === 'strategist') stance = chance(0.6) ? 'defend' : 'ignore';
  else stance = 'hurt';
  const post = (t) => { npcPost(id); S.feed[0].text = t.replace('{me}', S.handle); S.feed[0].likes = Math.round(S.feed[0].likes * 2); };
  const res = { stance, text: '' };
  if (stance === 'attack') { post(pick(COMEBACKS.attack)); S.queue.push({ ev: 'diss_reply', ctx: { npc: id } }); res.text = `${N.name} hit back hard.`; }
  if (stance === 'challenge') { post(`@${S.handle} you want smoke? clash battle. now.`); S.queue.push({ ev: 'they_challenge', ctx: { npc: id } }); res.text = `${N.name} challenged you to a clash battle.`; }
  if (stance === 'dismiss') { post(pick(COMEBACKS.dismiss)); applyFx({ rep: -2, heat: 3 }); res.text = `${N.name} acted like they don't know you. Brutal.`; }
  if (stance === 'defend') { post(pick(COMEBACKS.defend)); const hasTea = (S.tea || []).some((t) => t.npc === id); if (hasTea) { applyFx({ fp: 0.02 }); res.text = `${N.name} posted receipts, but you have tea on them. Standoff.`; } else { applyFx({ rep: -3, heat: 5 }); res.text = `${N.name} posted receipts. It made you look bad.`; } }
  if (stance === 'ignore') { res.text = `${N.name} ignored it completely. Your beef fizzled.`; }
  if (stance === 'hurt') { post(pick(COMEBACKS.hurt)); applyFx({ rep: -4, fp: -0.01 }); bstate('npc', id).mood = -0.8; res.text = `${N.name} posted that it hurt. Their fans are furious with you.`; }
  if (stance === 'mindgame') { post(`thinking about everyone who supported me this year 🥰 (not @${S.handle})`); S.pending.push({ day: S.day + 1, id, ask: 'mindgame' }); res.text = `${N.name} is playing mind games.`; }
  return res;
}

/* ---------- brands ---------- */
const CO_PRODUCT = { windys: 'the spicy nuggets', mcdougals: 'the fries', nikey: 'these runners', pear: 'the Pear 17', tezla: 'the Cybertruck window', netflux: 'the true crime docs', starbux: 'the pumpkin latte', redbully: 'a can of Red Bully', cocakola: 'an ice-cold Kola', amazin: 'next-day delivery', gucchi: 'a $1,200 belt', duolinguo: 'that owl' };
function coDecide(id) {
  const st = bstate('co', id), style = coStyle(id), b = BRANDS[id];
  if (style === 'snob' && totalFollowers() < (b.min || 0) * 2) return { res: 'no', line: 'Thank you for your interest. We only partner with select talent.' };
  let p = 0.1 + tierIndex() * 0.07 + engRate() / 40 + st.mood * 0.25 + (recent('co', id, 'praise', 10) ? 0.12 : 0) - (recent('co', id, 'beef', 20) ? 0.3 : 0) - (S.heat > 60 ? 0.2 : 0);
  if (totalFollowers() < (b.min || 0)) p -= 0.25;
  p = clamp(p, 0.03, 0.85);
  const r = Math.random();
  if (r < p) return { res: 'yes', line: 'We love this energy. Sending details.' };
  if (r < p + 0.25) return { res: 'counter', line: 'We can work with you, but on our terms.' };
  if (r < p + 0.4) return { res: 'later', line: 'Our team will review and circle back.' };
  if (r < p + 0.5) return { res: 'ghost', line: '' };
  return { res: 'no', line: pick(['We\'ll keep your info on file.', 'Not the right fit at this time.', 'Our marketing calendar is full.']) };
}
function pitchBrand(id) {
  remember('co', id, 'sponsorpitch', 0.05);
  const d = coDecide(id), b = BRANDS[id], C = COMPANIES[id];
  if (d.res === 'yes') mail({ type: 'deal', brand: id, pay: dealPay(b), req: 1, days: ri(3, 6), from: b.name, subject: 'Re: your pitch', body: d.line });
  if (d.res === 'counter') mail({ type: 'deal', brand: id, pay: Math.round(dealPay(b) * 0.6), req: 2, days: ri(4, 7), from: b.name, subject: 'Counteroffer', body: `${d.line} Lower fee, one extra post.` });
  if (d.res === 'later') S.pending.push({ day: S.day + ri(1, 3), co: id, ask: 'sponsor' });
  return { res: d.res, line: d.line, name: C.name };
}
function provokeBrand(id) {
  remember('co', id, 'beef', -0.5);
  const style = coStyle(id), C = COMPANIES[id];
  if (style === 'savage') return { stance: 'roast', line: pick(['imagine beefing with a fast food account. we have fries, you have a ring light', 'we read your post. so did our fryer. it laughed', 'counterpoint: you']) };
  if (style === 'snob') { applyFx({ rep: -1 }); return { stance: 'ignore', line: '' }; }
  const r = Math.random();
  if (r < 0.55) return { stance: 'pr', line: `We hear our community and take all feedback seriously. — The ${C.name} Team` };
  if (r < 0.8) { S.queue.push({ ev: 'brand_cnd', ctx: { co: id } }); return { stance: 'lawyer', line: 'Our legal team will be in touch.' }; }
  mail({ type: 'deal', brand: id, pay: Math.round(dealPay(BRANDS[id]) * 1.2), req: 1, days: 5, from: C.name, subject: 'Let\'s make this right', body: 'Instead of fighting, what if we worked together? Generous fee, one post. (Translation: please stop.)' });
  return { stance: 'hush', line: 'Check your DMs 👀' };
}

/* ---------- post intents: what you meant by that @mention ---------- */
function applyMentionIntents(post, o, r) {
  const intents = o.intents || {};
  post.mentions = mentionedNpcs(o.caption).slice(0, 2);
  post.intents = {};
  for (const id of post.mentions) {
    const it = intents['npc:' + id] || 'tag', n = bstate('npc', id), N = NPCS[id];
    post.intents['npc:' + id] = it;
    const add = (text, neg) => { if (!post.comms.some((c) => c.npc === id)) post.comms.unshift({ who: N.handle, npc: id, text, likes: Math.round(r.likes * rnd(0.05, 0.25)), neg }); };
    if (it === 'beef') { const res = provoke(id, 'beef'); post.beef = res.text; if (res.stance === 'attack' || res.stance === 'challenge') add(pick(COMEBACKS.attack).replace('{me}', S.handle), true); news(`@${S.handle} comes for ${N.name} in a post. ${res.text}`, true); continue; }
    if (n.cond && n.cond.until >= S.day && it === 'shout' && n.cond.type !== 'gift') { // they set terms, you delivered
      const was = n.cond.ask; n.cond = null; remember('npc', id, 'praise', 0.4); changeRel(id, 5);
      if (was === 'forgive') { n.feud = false; changeRel(id, 20); add('ok. apology accepted 🤝'); post.deal = `${N.name} accepted your public apology.`; }
      else if (!S.collab) { S.collab = { npc: id, until: S.day + 4 }; add('ok you delivered. collab is on 🤝'); post.deal = `${N.name} kept their word: collab unlocked.`; gainEnergy(10, 'Terms met'); }
      continue;
    }
    if (n.feud) { changeRel(id, -3); continue; }
    if (it === 'shout') {
      changeRel(id, 3); remember('npc', id, 'praise', 0.25);
      if (chance(0.25 + (n.mood || 0) * 0.3 + (archetype(id) === 'sweetheart' ? 0.2 : 0))) { add(pick(['you\'re too kind 🥹', 'this made my day', 'ok I love you for this'])); if (chance(0.35)) { const g = Math.min(n.followers * 0.0004, Math.max(totalFollowers() * 0.2, 300)); addFollowers(g); notify('repost', id, 'reposted your shoutout', { npc: true }); } }
      continue;
    }
    if (it === 'collab') {
      const res = askStar(id, 'collab', 'post');
      post.pitch = res.msg;
      const d = res.ok ? 'yes' : '';
      if (d) add(pick(['DMs 👀', 'say less. check your DMs', 'okay let\'s talk']));
      else if (chance(0.4)) add(pick(['lol maybe one day', '👀', 'my agent will call your agent (they won\'t)']), true);
      continue;
    }
    changeRel(id, TONES[o.tone].heat >= 10 ? -4 : 1.5);
    if (n.rel >= 25 && chance(0.4)) add(pick(['haha thank you for the mention!', 'this is so real', 'love you for this', 'ok I see you 👀']));
  }
  for (const id of mentionedCompanies(o.caption).slice(0, 2)) {
    const it = intents['co:' + id] || 'tag', C = COMPANIES[id];
    post.intents['co:' + id] = it;
    const add = (text, neg) => { post.comms.unshift({ who: C.handle, co: id, text, likes: Math.round(r.likes * rnd(0.05, 0.2)), neg }); S.stats.coReplies = (S.stats.coReplies || 0) + 1; };
    if (it === 'beef') { const res = provokeBrand(id); if (res.line) add(res.line, res.stance === 'roast'); if (res.stance === 'roast') applyFx({ fp: 0.015, heat: 6 }); post.beef = `${C.name}: ${CO_STYLES[coStyle(id)].name} response (${res.stance}).`; continue; }
    if (it === 'collab') { const res = pitchBrand(id); if (res.line && res.res !== 'ghost') add(res.res === 'yes' || res.res === 'counter' ? 'check your DMs 👀' : res.line); post.pitch = `${C.name}: ${{ yes: 'offer sent to your DMs', counter: 'counteroffer in your DMs', later: 'reviewing your pitch', ghost: 'no response', no: 'passed' }[res.res]}.`; continue; }
    if (it === 'shout') { remember('co', id, 'praise', 0.25); if (chance(0.6)) add(pick(C.replies)); if (chance(0.06 + bstate('co', id).mood * 0.1)) pitchBrand(id); continue; }
    if (chance(0.5)) { const roast = C.roast && (TONES[o.tone].heat >= 3 || chance(0.5)); add(roast ? pick(['and yet you still tagged us', 'bold of you to @ us with that caption', 'this is giving "tagged a brand for clout"']) : pick(C.replies), roast); gainEnergy(4, `${C.name} replied to you`); }
  }
}

/* ---------- daily agency: they act on their own ---------- */
function behaviorTick() {
  S.pending = S.pending || [];
  const due = S.pending.filter((p) => p.day <= S.day);
  S.pending = S.pending.filter((p) => p.day > S.day);
  for (const p of due) {
    if (p.co) { if (p.ask === 'sponsor') { const d = coDecide(p.co); if (d.res === 'yes' || d.res === 'counter') pitchBrand(p.co); else notify('system', null, `${COMPANIES[p.co].name} passed on your sponsorship pitch.`); } continue; }
    if (p.ask === 'flake') { if (S.collab && S.collab.npc === p.id && S.collab.flaky) S.queue.push({ ev: 'flaked', ctx: { npc: p.id } }); continue; }
    if (p.ask === 'mindgame') { S.queue.push({ ev: 'mind_game', ctx: { npc: p.id, kind: 'posttroll' } }); continue; }
    const d = decide(p.id, p.ask); if (d.res === 'later' || d.res === 'counter' || d.res === 'ghost') d.res = chance(0.5) ? 'yes' : 'no';
    if (!d.line) d.line = pick((p.ask === 'forgive' ? FORGIVE : ANSWERS[archetype(p.id)])[d.res === 'flake' ? 'yes' : d.res] || ['...']);
    const out = resolveAsk(p.id, p.ask, d);
    notify('system', null, `${NPCS[p.id].name} got back to you: ${out.msg}`);
  }
  // moods drift back toward neutral; expired terms sour things a little
  for (const [id, n] of Object.entries(S.npcs)) {
    if (n.mood) n.mood *= 0.85;
    if (n.cond && n.cond.until < S.day) { n.cond = null; n.mood = (n.mood || 0) - 0.15; }
  }
  for (const st of Object.values(S.cos || {})) st.mood *= 0.9;
  // proactive moves
  const ids = shuffle(Object.keys(S.npcs)).slice(0, 8);
  let moves = 0;
  for (const id of ids) {
    if (moves >= 2) break;
    const st = stanceOf(id), A = archetype(id), n = S.npcs[id];
    if (st === 'hostile' && (A === 'hothead' || A === 'wildcard') && chance(0.2)) { S.queue.push(chance(0.5) ? { ev: 'npc_callout', ctx: { npc: id } } : { ev: 'mind_game', ctx: { npc: id } }); moves++; }
    else if (st === 'friendly' && (A === 'sweetheart' || n.mood > 0.4) && chance(0.08)) { const g = Math.min(n.followers * 0.0005, Math.max(totalFollowers() * 0.15, 400)); addFollowers(g); notify('repost', id, 'shouted you out out of nowhere 🥹', { npc: true }); gainEnergy(8, `${NPCS[id].name.split(' ')[0]} hyped you up`); moves++; }
    else if (A === 'wildcard' && st !== 'friendly' && chance(0.05)) { S.queue.push({ ev: 'mind_game', ctx: { npc: id } }); moves++; }
    else if (NPCS[id].niche === S.niche && st !== 'friendly' && n.followers > totalFollowers() * 0.5 && n.followers < totalFollowers() * 2 && chance(0.08)) { S.queue.push({ ev: 'rival_move', ctx: { npc: id } }); moves++; }
  }
  for (const [id, st] of Object.entries(S.cos || {})) {
    if (st.mood > 0.4 && chance(0.12)) pitchBrand(id);
    if (recent('co', id, 'beef', 7) && coStyle(id) === 'corporate' && chance(0.1)) S.queue.push({ ev: 'brand_cnd', ctx: { co: id } });
  }
}

/* ---------- text generation for the dice and DM starters ---------- */
const PRAISE = ['never misses', 'carried this whole year', 'is the blueprint', 'deserves every award', 'is so underrated it hurts', 'changed the game'];
const DISSES = ['fell off', 'peaked three years ago', 'has been mid since the last drop', 'needs a new personality', 'is all PR and no talent', 'is boring and the numbers prove it'];
const IDEAS = { music: 'a surprise duet', gaming: 'a 24-hour challenge stream', fitness: 'a workout battle', comedy: 'a prank war', tech: 'a blind gadget test', food: 'a cook-off', fashion: 'a style swap', travel: 'a 48-hour city race', beauty: 'a full glam swap', lifestyle: 'a day-in-the-life swap' };
const MENTION_TPL = {
  npc: {
    shout: ['Can we talk about how @{h} {praise}? Iconic.', '@{h} is the reason I take {myniche} seriously. No notes.', 'Appreciation post for @{h} 🙏 "{line}" lives in my head rent free', 'Unpopular opinion: @{h} {praise}. Okay that is a popular opinion.'],
    collab: ['@{h} you + me + {idea}. Let\'s make it happen? 👀', 'Calling it now: an @{h} x @{me} collab would break {platform}. DMs open.', '@{h} I have the perfect idea for us: {idea}. You in?', 'Dear @{h}: {idea}. That\'s the pitch. Thank you for coming to my TED talk.'],
    beef: ['@{h} {diss}. Say it to my face.', 'Respectfully, @{h} {diss}. The {myniche} scene needs new blood.', 'Not @{h} copying my whole vibe 💀 we see you', '"{line}" — @{h}, be so serious right now'],
    tag: ['Just saw @{h}\'s latest. {react}', '@{h} "{line}" 😭', 'Me watching @{h} {react2}'],
  },
  co: {
    shout: ['Nothing beats {product} from @{h}. Not sponsored (yet) 👀', '@{h} you have changed my life. {product} forever.', 'Ranking my favorite brands: 1. @{h} 2. there is no 2'],
    collab: ['@{h} sponsor me. I will make {product} go viral.', 'Hey @{h}, imagine a {myniche} campaign starring me. Call me.', '@{h} I will say "{product}" 100 times on camera. Name a price.'],
    beef: ['@{h} {product} is mid and you know it.', 'Dear @{h}, explain yourselves. {complaint}', '@{h} I want a refund for {product}. And a public apology.'],
    tag: ['Me and {product} from @{h} at 2am', '@{h} {product} hits different today'],
  },
};
const REACT = ['I am screaming', 'this is art', 'okay I see you', 'no notes', 'the internet is healed'];
const REACT2 = ['live their best life while I do laundry', 'win again', 'not sleep for three days'];
const COMPLAINTS = ['The last one was a crime.', 'My order arrived in a different dimension.', 'Customer service ghosted me harder than my ex.', 'Your new logo looks like a sad pear.'];
function fillMention(t, kind, id) {
  const E = kind === 'co' ? COMPANIES[id] : NPCS[id];
  return t.replace(/\{h\}/g, E.handle).replace(/\{me\}/g, S.handle).replace(/\{praise\}/g, pick(PRAISE)).replace(/\{diss\}/g, pick(DISSES))
    .replace(/\{idea\}/g, IDEAS[kind === 'co' ? S.niche : E.niche] || 'something chaotic').replace(/\{myniche\}/g, NICHES[S.niche].name.toLowerCase())
    .replace(/\{platform\}/g, 'the internet').replace(/\{line\}/g, kind === 'npc' && E.lines ? pick(E.lines).replace(/[.!]$/, '') : pick(NPC_POSTS[E.niche || 'lifestyle']).replace('{trend}', '#fyp'))
    .replace(/\{react\}/g, pick(REACT)).replace(/\{react2\}/g, pick(REACT2)).replace(/\{product\}/g, CO_PRODUCT[id] || 'this').replace(/\{complaint\}/g, pick(COMPLAINTS));
}
function genMentionText(kind, id, intent) { return fillMention(pick(MENTION_TPL[kind][intent] || MENTION_TPL[kind].tag), kind, id); }
const DM_TPL = {
  collab: ['hey! big fan of your stuff. want to collab on {idea}?', 'I have an idea: {idea}. want to film something together this week?', 'collab? I think our audiences would love {idea}'],
  compliment: ['honestly you {praise}. just wanted to say that', 'your last post was so good, genuinely', 'not to be dramatic but you {praise}'],
  shout: ['would you be down to give me a shoutout? would mean a lot 🙏', 'any chance of a shoutout? happy to return the favor', 'small creator here, a shoutout from you would change everything'],
  trash: ['you {diss}, just saying', 'lol you really think you are that good?', 'your last post was mid and you know it'],
  sorry: ['hey, I\'m sorry about what I said. that was not cool', 'I owe you an apology. can we reset?', 'sorry for the drama. I was out of line'],
  date: ['dinner sometime? just us', 'I think we\'d be cute together. date?'],
};
const dmTemplate = (id, kind) => fillMention(pick(DM_TPL[kind]), 'npc', id);
const INTENT_TONE = { shout: 'wholesome', collab: 'authentic', beef: 'ragebait' };
function intentHint(kind, id, intent) {
  if (kind === 'co') {
    const s = coStyle(id);
    return { beef: s === 'savage' ? 'They will roast you back in public.' : s === 'snob' ? 'They will probably just ignore you.' : 'Expect a PR statement, a lawyer, or a deal to shut you up.', collab: s === 'snob' && totalFollowers() < (BRANDS[id].min || 0) * 2 ? 'Too small for them right now.' : 'They may send an offer, a lowball counter, or nothing.', shout: 'Brands remember fans. Praise raises the odds of a deal.', tag: 'They might reply. Roast accounts might roast.' }[intent];
  }
  const A = archetype(id), st = stanceOf(id), n = S.npcs[id];
  if (intent === 'beef') return { hothead: 'Hothead: they will hit back hard, maybe challenge you.', wildcard: 'Wildcard: could attack, ignore, or play mind games.', diva: totalFollowers() / n.followers < 0.2 ? 'Diva: they will act like they do not know you.' : 'Diva: they will clap back.', strategist: 'Strategist: expect receipts or silence.', sweetheart: 'Sweetheart: they will be hurt, and their fans will be mad at you.' }[A];
  if (intent === 'collab') return `${ARCHETYPES[A].name}, ${STANCE[st][0].toLowerCase()}. ${A === 'diva' ? 'Flatter them first or expect a counter-offer.' : A === 'strategist' ? 'They may take a day to decide.' : A === 'wildcard' ? 'A yes might not mean yes.' : A === 'sweetheart' ? 'Good odds.' : 'They decide fast.'}`;
  if (intent === 'shout') return n.cond && n.cond.until >= S.day ? 'This fulfills the terms they gave you.' : 'Raises their mood and your odds next time.';
  return 'A plain tag. Friends might reply.';
}

/* ---------- events ---------- */
Object.assign(EVENTS, {
  they_challenge: {
    title: (c) => `${NPCS[c.npc].name} wants a clash battle`, text: (c) => `${NPCS[c.npc].name} posted "you started it, I'll finish it" and tagged you. Everyone is waiting.`,
    choices: (c) => [
      { label: 'Accept the battle', sub: 'Three rounds, public vote', fn: () => { startBattle(c.npc); return R('Let\'s go.'); } },
      { label: 'Decline', fn: () => R('"Scared" is trending under your name.', { rep: -2, heat: 4 }) },
    ],
  },
  flaked: {
    title: (c) => `${NPCS[c.npc].name} flaked on the collab`, text: (c) => `${NPCS[c.npc].name} said yes, then posted a collab with someone else. Your DMs are on read.`,
    onShow: (c) => { if (S.collab && S.collab.npc === c.npc) S.collab = null; remember('npc', c.npc, 'flaked', -0.2); },
    choices: (c) => [
      { label: 'Call them out publicly', fn: () => { const r = provoke(c.npc, 'callout'); return R(`Messy, but people are on your side. ${r.text}`, { fp: 0.02 }); } },
      { label: 'Guilt-trip them in DMs', fn: () => { if (chance(0.45)) { S.collab = { npc: c.npc, until: S.day + 3 }; return R('"ok ok I\'m sorry, let\'s actually do it." The collab is back on.', { rel: { [c.npc]: 5 } }); } return R('Left on read. Again.', { stress: 6 }); } },
      { label: 'Let it go', fn: () => R('Unbothered. Mature.', { rep: 1 }) },
    ],
  },
  mind_game: {
    title: (c) => `${NPCS[c.npc].name} is playing games`,
    ctx: () => ({}),
    text: (c) => {
      c.kind = c.kind || pick(['oldlike', 'unfollow', 'cryptic', 'wrongchat', 'posttroll']);
      return { oldlike: `${NPCS[c.npc].name} liked a post of yours from three years ago. At 3:12 AM. Then unliked it. Screenshots exist.`, unfollow: `${NPCS[c.npc].name} unfollowed you, waited an hour, and followed you again. The fan accounts are investigating.`, cryptic: `${NPCS[c.npc].name} posted a story: "some people are only nice when the camera is on 🙂". It's clearly about you.`, wrongchat: `${NPCS[c.npc].name} DM'd you "lol they're so desperate" and then "oops wrong chat". Was it the wrong chat?`, posttroll: `${NPCS[c.npc].name} keeps posting "thank you to everyone who supports me (not you know who)". You know who.` }[c.kind];
    },
    choices: (c) => [
      { label: 'Play along', sub: 'Mind games back', fn: () => chance(0.5) ? R('You liked their 2015 post at 4 AM. The internet loved the pettiness.', { fp: 0.02, heat: 6, rel: { [c.npc]: -3 } }) : R('They escalated. Now it\'s a whole saga.', { heat: 10, rel: { [c.npc]: -8 } }) },
      { label: 'Confront them in DMs', fn: () => { const A = archetype(c.npc); if (A === 'wildcard' && chance(0.5)) return R('"lol what? you\'re reading into it." Classic.', { stress: 6 }); return R('They admitted it and things cooled down.', { rel: { [c.npc]: 8 } }); } },
      { label: 'Ignore it', fn: () => R('Nothing to react to, nothing to post. They got bored.', { stress: -3 }) },
    ],
  },
  rival_move: {
    title: (c) => `${NPCS[c.npc].name} is coming for your spot`,
    ctx: () => ({}),
    text: (c) => { c.kind = c.kind || pick(['trend', 'ratio', 'poach']); return { trend: `${NPCS[c.npc].name} jumped on the trend you started and their version is outperforming yours.`, ratio: `${NPCS[c.npc].name} quote-posted your latest with "did it better" and is ratioing you.`, poach: `${NPCS[c.npc].name} is DMing your brand partners and offering lower rates.` }[c.kind]; },
    choices: (c) => [
      { label: 'Compete harder', sub: '−20 energy, push your next post', fn: () => { S.algoBoost[pick(unlockedIds())] = 1.35; return R('You doubled down. Tomorrow you\'re louder.', { energy: -20 }); } },
      { label: 'Propose a truce collab', fn: () => { const out = askStar(c.npc, 'collab', 'dm'); return R(out.msg, {}); } },
      { label: 'Call it out', fn: () => { const r = provoke(c.npc, 'callout'); return R(r.text, { fp: 0.01 }); } },
    ],
  },
  brand_cnd: {
    title: (c) => `${COMPANIES[c.co].name} sent a cease and desist`, text: (c) => `${COMPANIES[c.co].name}'s lawyers want your post about them taken down and an apology. It's mostly scare tactics.`,
    choices: (c) => [
      { label: 'Delete and apologize', fn: () => { remember('co', c.co, 'apology', 0.4); return R('They accepted. You look a little weak, but you\'re safe.', { rep: -1, heat: -5 }); } },
      { label: 'Post the letter', fn: () => R('Streisand effect: the letter is now more famous than your post.', { fp: 0.03, heat: 10, money: S.team.lawyer ? 0 : -2000, legal: true }) },
      { label: 'Let your lawyer handle it', sub: S.team.lawyer ? 'You have one' : 'Costs $5,000', fn: () => R('It went away quietly.', { money: S.team.lawyer ? 0 : -5000 }) },
    ],
  },
});
