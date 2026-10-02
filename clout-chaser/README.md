# Clout Chaser

A browser game that simulates life as a social media creator. You start with 210 followers and a phone and try to become an icon: 100M followers while keeping your reputation above 60.

No build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```bash
cd clout-chaser
python3 -m http.server 8080   # then open http://localhost:8080
```

Progress saves automatically to `localStorage`. The Account tab can export and import save codes.

## Interface

The game looks and plays like a social app (inspired by the Status social-media sim):

- **Timeline** with For you / Following / Your posts tabs, post cards with reply, repost, like and view counts, and a compact status bar of your stats.
- **Compose sheet**: write any post. The game reads the tone from your words (funny, rage bait, wholesome, clickbait and so on), picks the topic from your hashtags and @mentions, and shows a live forecast. You can override tone and topic, change format/effort/timing, or tap the dice for a suggested post.
- **Threads**: open any post to see replies. Thank fans, like replies, clap back at haters, or write your own reply to a star's post. Your words decide whether it lands as a compliment, joke, self-promo or troll.
- **Notifications** for likes, follows, reposts, replies, viral moments and stars following you back.
- **Messages** in iMessage-style threads with stars, brands and fans. Type DMs to stars (mention "collab" to pitch one, or "date" when you're close); brand offers show up as cards you can accept, negotiate or decline.
- **Profiles** for you and every star, with banner, bio (yours is editable), relationship meter and actions.
- **Floating stat pop-ups** after every action show exactly what changed.
- Desktop gets a sidebar and a trends/stats rail; phones get a bottom tab bar, a compose button and a side drawer. Dark, light or device theme.

## Core stats

| Stat | What it does |
| --- | --- |
| Followers | Tracked per platform. Drives reach, deal pay, merch sales and tier. |
| Engagement | Weighted average across platforms. Bot followers drag it down. Raises deal pay. |
| Reputation (0–100) | Boosts follower conversion and passive growth. At 0 you get deplatformed. |
| Heat (0–100) | Controversy. Adds reach, but at 100 you get cancelled. Cools each night. |
| Energy | Spent on every post and action. Refills when you sleep, and comes back during the day when things go well (see below). Rewards can overcharge you up to 60 past your max. |
| Stress | Rises with work and heat. Above 80 it cuts energy; at 100 you burn out. |
| Money | Earned from ads, deals, streams, merch, products, podcasts, events. |

## Celebrity clashes

- **Parody A-listers**: 20 satirical stand-ins for real celebrities with tweaked names (Taylor Shift, Elon Tusk, Mark Zuckerburger, Kym Kardashion, Kylie Jenmer, Cristiano Ronaldough, Leonel Messy, MrFeast, Drayke, Kendrik Lamarr, Rihannah Fenti, Beyonslay, Justin Beaver, Ariana Venti, Dwayne "The Pebble" Johnson, Logan and Jake Pall, Kai Senate, Snoop Doug, Billie Eyelash). They post in their own voice and are tagged as parody in the game. Everything they say and do is invented, and they only get light gossip.
- **World clashes**: stars start public beefs with each other: classic rivalries (diss track war, cage match, GOAT debate, beauty empire war, snack vs drink war, award snubs) plus random subtweet wars and unfollow drama. Each clash runs 3–5 days with a live public vote, and both sides post disses in the feed.
- **Your move**: back a side (their fans follow you, the other side resents you, and backing the winner pays off), broker peace (a charisma check that ends the clash in a truce), stir the pot (followers and heat), or post about it (a high-reach topic). Stars who like you DM you to ask for your support.
- **Clash battles**: challenge any star from their profile to three rounds judged by a public vote. Roast beats meme, meme beats receipts, receipts beat roast. Taking the high road wins against attacks, and fan armies depend on who has more followers. Winning brings followers, energy and the option to end the feud with a handshake.

## Companies, countries and spice

- **@mention autocomplete**: type `@` in a post, a reply or a DM to get a dropdown of stars and companies (arrow keys plus Enter/Tab, or click).
- **Images**: every star, fan and you get a generated illustrated face (shuffle yours at signup). Posts get generated art in their format and look: memes with real top and bottom text, reels, carousels, polaroid photos, reactions and vlog thumbnails. You can also upload your own photo to a post (resized in the browser; +8 originality, +8% quality).
- **Parody companies**: Windy's, McDougal's, Nikey, Pear, Tezla, Netflux, Starbux, Red Bully, Coca-Kola, Amazin', Gucchi and Duolinguo post on the timeline, drop into your replies (the roast accounts roast), answer when you tag them, and send sponsorship offers.
- **Countries**: pick a home country. Your audience is spread across countries (see Analytics), international fans comment with their flags, stars have home countries, and a world tour lets you travel for content, grow abroad and run into local stars. Controversy can get you restricted in a country.
- **Creative comments**: replies quote words from your caption and reference your niche and platform, with stans, askers, bots, haters, international fans, company accounts and reply chains.
- **Spicier, harder game**: cost of fame grows every tier; scandal events hit more often the more famous you are; three weak posts in a row start "did they fall off?" discourse; you collect harmless secrets ("tea") on stars at parties, collabs and in DMs and can spill them for huge reach (they won't forget it). There are new events: leaked DMs, an ex's tell-all, deepfakes, lip-sync scandals, plagiarism accusations, 3 AM posts, star subtweets, company roasts, tax audits, country restrictions, and a hot-seat interview with three spicy questions.

## Behavior and mind games

- **Personalities**: every star is a Diva, Hothead, Sweetheart, Strategist or Wildcard; every brand is Savage, Corporate or Snob. They remember what you did (praise, pitches, disses, gifts, apologies, spilled tea) and have a mood that drifts day to day. Together these give a stance toward you: in your corner, warming up, neutral, wary, or hostile. All of it is shown on their profile.
- **Asks get real answers**: collabs, shoutouts, apologies and sponsorship pitches go through one decision engine. Possible answers:
  - yes or no
  - a counter-offer ("shout me out first", "a gift would help", "apologize publicly", or a lowball brand deal)
  - "let me think about it" (they answer a day or two later)
  - ghosting
  - a Wildcard yes that later flakes
- **Beef gets a response**: Hothead attacks back or challenges you to a clash battle, Diva says "who?", Strategist posts receipts (unless you hold tea on them) or ignores you, Sweetheart posts that it hurt and their fans turn on you, Wildcard plays mind games. Brands roast back, issue PR statements, send a cease-and-desist, or offer a deal to make you stop.
- **They act on their own**: friends shout you out unprompted, hostile stars come for you, Wildcards play mind games (3 AM likes on old posts, unfollow-refollow, "wrong chat" DMs, cryptic stories), same-niche rivals steal your trend or poach your brand partners, and happy brands send offers.
- **Mention intents**: @mention someone in a post and choose Just tag, Shout out, Pitch collab or sponsorship, or Start beef. Each mention shows a hint on how that personality will react. The dice reads your mentions and writes a post about that star or brand that fits the intent.
- **DM quick starters**: pitch a collab, compliment, ask for a shoutout, apologize, talk trash, or ask on a date. Each fills in a message written for that star.
- **Profile shortcuts**: pitch a collab, shout them out, or diss them in a post straight from a star's profile.

## Living comments and new features

- **Fans read your post**: replies react to what you wrote (food, gym, money, love, 3 AM, pets, travel, sadness, wins, gaming, beauty, tech, fashion, music). They answer your questions, vote in your polls, take sides in your beefs, beg for your collabs to happen, and notice your format, look and photos.
- **Superfans**: three recurring fans (a Superfan, a Top critic and a Class clown) comment on most posts, keep count, and compare each post with your last one. They're listed on your profile as Top fans.
- **Stars and brands reply on their own**: friends, same-niche peers and big names on viral posts comment in their own voice. Feuding stars show up to hate, and friends defend you in the replies. Brand accounts banter with each other. Reply to a star or brand in your thread and they answer back. Reply to a star's post and they (and sometimes another star) reply under it. Star posts have threads full of star and brand replies, including clash comebacks.
- **Post everywhere**: the "All platforms" toggle cross-posts to every unlocked platform in each platform's best format (photo or reel, hot take, short, vlog) at a 35% energy discount, with a combined forecast. Special topics and mention intents apply only to the first platform.
- **Polls**: a Chirp format with up to four options. Fans vote, and the results show as bars.
- **Duets**: remix any star's post from its thread. You borrow some of their audience, and they react to how you treated them.
- **Daily spin**: once a day, win energy, cash, followers, an algorithm boost, fresh tea, a spa day, a mystery event, or nothing.

## Money and the bigger shop

- **Tips** on every post (more with high reputation and loyal superfans).
- **Affiliate links**: toggle one in the composer to earn on views; engagement and reputation dip a little.
- **FanVault**: paid subscriptions, pay-per-view posts, custom videos and DM tips (see below).
- **Paid gigs** arrive in Messages: shoutouts, club appearances, keynotes, viral clip licensing, movie cameos.
- **Markets**: an index, three parody stocks and CloutCoin, with nightly price moves, news shocks and sparkline charts.
- **Property** that pays rent every night, from a studio apartment to an office tower.
- **Online course** (50K+ followers) that sells every day and can be promoted.
- **Money screen** with net worth, yesterday's income by source, subscriptions, markets and course.
- **Shop additions**: new gear, a pet (unlocks pet content, lowers stress), sneakers, a watch, a penthouse, a superyacht, a sports team; one-day boosts (photographer, lucky charm, trend forecast, crisis PR kit, bot cleanup); avatar frames and profile banners.

## Growth and UI

- Faster growth: posts convert more viewers, small accounts get a discovery push, overnight growth is stronger.
- Home now opens with a tier progress card, your cash, and quick-action tiles (post, go live, money, DMs, shop, danger).
- Confetti on viral posts, follower milestones and new tiers; stat pop-ups no longer cover the header.

## FanVault (paid subscriptions)

A sixth platform, unlocked at 1K followers. Fans pay monthly for exclusive drops; the content stays PG-13.

- Set your price ($4.99 to $24.99). Cheaper brings more subscribers, pricier earns more per fan. Raising it makes some fans cancel.
- Six drops: behind-the-scenes vlog, glam photoshoot, poolside set (subscribers flood in, plus heat and a leak risk), pay-per-view exclusive ($20 unlocks; too many in a row and fans cancel), custom shoutout videos, paid DM hour (tips).
- "Link in bio" turns free posts into a funnel for subscribers, but costs a little reputation and makes brands nervous.
- Subscriptions pay every night (you keep 80%, or 92% with your own app). No drop for 3+ days and subscribers start cancelling.
- Events: leaked sets, whale tippers, brands reviewing your deal, your aunt subscribing, copycat resellers, platform policy panics.

## More team and spicy moves

- New hires: **Data analyst** (+8% reach, a daily tip on the hottest platform and trend), **Ghostwriter** (+12 originality), **Money manager** (auto-invests part of your spare cash every night, follows tips, sells ahead of predicted drops, tips +10% reliable), **Stylist** (+6% photo/video quality, small daily reputation boost), **Booking agent** (60% more gigs, 30% more pay), **Accountant** (half the cost of fame, double savings interest).
- **Team levels**: upgrade anyone from Junior → Pro → Senior → Elite → Legend. Each level adds +25% to what they do (Legend = double) and raises their salary. Hiring 4+ people gives a dream-team reach bonus (+1% per extra hire, up to +10%).
- **Spicy moves** in the Danger Zone: fake a showmance with a star, troll rivals with a burner account, drop a diss track, stage a public breakup, crash an award show stage, join the Love Villa reality dating show, or get paid to start a fake feud. Each has odds, a payoff and a messy way to fail.

## Milestones and stream themes

- **Milestones panel** in the right sidebar (on phones, on your profile): progress bars toward your next follower milestone, next tier, bank balance goal, posting streak and stamina boost, plus your next trophies. Money milestones give +10 energy; streak milestones (3, 7, 14, 30, 60, 100 days) give +3 max energy.
- **Stream themes**: Just chatting, Gaming, Cooking, IRL city walk, Karaoke night, Q&A, Charity stream and Collab stream. Each changes payouts and brings its own chat moments (clutch plays, kitchen fires, street battles, power ballads, salary questions, donation matching, co-streamers going off-script), and no two streams in a row repeat the same moments. A hype meter builds during the stream and boosts gifts and followers.

## Accounts, cloud saves, friends, quests

- **Daily quests**: three new quests every game day (posts, viral hits, streams, bets, casino, stunts, followers or money targets, gifts, stories…) with cash, energy and Pass XP rewards, plus a bonus chest for finishing all three. On Home and under Friends → Daily quests.
- **13 new random events**: becoming a meme, a fan tattoo, an AI clone of you, airport paparazzi, a star sliding into your DMs, ripped pants on camera, a fake death rumor, a fan naming their baby after you, your old teacher, a podcast invite, the Glitz Gala, accidentally starting a trend, and a salary leak.
- **Accounts and cloud saves**: progress syncs automatically a few seconds after every save. On a new device, sign in and the game offers your cloud save; it never overwrites a different cloud game without asking.
  - On the claude.ai page you're signed in with your Claude account automatically (works for everyone the page is shared with).
  - For the Android app or another web host, accounts are email + password via Supabase: create a free project, run `android/supabase-schema.sql`, put the URL and anon key in `cloud-config.js`, rebuild.
- **Friends**: find players by @handle, add friends, see their stats and a friends leaderboard (and who's online on claude.ai), send one gift of each kind per day (⚡ energy, 💵 cash, 🎟️ Pass XP) and do a daily 🤝 duo collab that boosts both of you.

## Menus, HQ and more team

- **Merged menu**: the sidebar has five hubs (Business, Play, Team & HQ, Me, Settings). Each hub opens its screens with a tab row on top (e.g. Business: Money · Brand deals · Shop · Empire) and remembers the last one you used.
- **Detailed faces and logos**: cartoon faces with eyes, brows, noses, lips, beards, shades, chains, earrings, hats and 16 hairstyles. Every parody star has signature caricature traits, and every parody company and sponsor has its own designed logo.
- **New hires**: photographer, personal chef, personal trainer, stream producer, talent scout and cybersecurity expert (blocks hacks, deepfakes, impersonators and scam bots). All can be upgraded Junior → Legend.
- **Headquarters**: six rooms (content studio, editing bay, data room, home gym, chill lounge, trophy hall), each upgradable to level 5 for permanent boosts. Your building grows from a bedroom setup to a Clout Empire campus.
- **Daily login calendar**: real-world daily rewards on a 7-day cycle (cash, energy, Pass XP, lucky charm, followers, a big chest on day 7). Keep the streak going.

## Visuals

- **Animated posts**: every post illustration has niche scenery (steaming plates, drifting clouds and planes, spinning vinyl, neon grids, spotlights, sparkles). Video posts autoplay when on screen with a progress bar and sound-bars.
- **Stories**: a row of stars at the top of Home. Tap one to watch their auto-playing story clips, tap sides to skip, and send emoji reactions (stars may like them back).
- **Illustrated event pop-ups**: an animated banner on every event, picked by what's happening: coins raining for money, sirens for scandals, hearts for romance, hazard stripes for stunts, spotlights for awards, a stage with your face, floating hearts and chat for livestreams, a pitch for football.
- **Reaction bursts** when you like, repost, post, spin, bet or claim rewards; spinning slot reels and roulette wheel; a live pitch with a moving ball and GOAL flashes; colorful menu icons.

## The long game (Arena, Legacy, seasons)

- **Arena → Sportsbook**: four Clout League football matches a day (six during Clout Cup week) between parody clubs. Bet game money on 1 / X / 2 or over/under 2.5 goals with real odds, watch any match live minute by minute (goals, red cards, VAR) and cash out mid-match, or let it settle when you sleep. League table and results.
- **Arena → Casino** (game money only, small house edge): Clout Slots (👑👑👑 pays 500×), Roulette (colors, odd/even, halves, zero and lucky 7 at 36×), and the Viral Rocket crash game where you cash out before it crashes.
- **Arena → Clout Pass**: a 30-tier season that resets every 30 days with a new theme. Earn XP from posting, streaming, challenges, deals, stunts, FanVault drops and winning bets; claim cash, energy, boosts, max energy, an exclusive avatar frame (tier 10), a stadium banner (tier 20) and a champion crown (tier 30).
- **Weekly world events**: Clout Cup week, Fashion Week, Brand budget season, StreamFest, Vegas Week, Crypto mania and Algorithm chaos, each changing one part of the game for 7 days.
- **Legacy**: at 100M followers, rebrand into a new era. Followers reset and you keep 15% of your cash, but you earn Legacy points for permanent perks (more followers per post, more money, more max energy, more viral luck, bigger head start). Repeat forever.
- **New tiers and goals**: Legend (1B) and Mythic (5B) tiers, milestones up to 10B followers and $100B, mega brands (Nyke, Maison Lumière, Galactic Airlines, Pear Inc. global) and mega contracts (movie lead, halftime show, your own reality series), plus new trophies.

## Progression and balance
- **Career path:** 25 goals, one at a time, shown on Home. Each has a "Show me" button and a reward, leading a new player from their first post to their first rebrand. Old saves skip goals they already finished.
- **Screens unlock as you grow:** Investing at 500 followers; Team, Arena and FanVault at 1K; Bank and Danger Zone at 2K; HQ at 3K; Empire and Acquisitions at 5K; Tea at 10K; Legacy at 1M. Locked screens say what opens them, and a toast announces each unlock.
- **Economy:**
  - Passive yields were lowered: stocks ×0.6, companies ×0.6, rent ×0.65–0.7.
  - Big fortunes pay a progressive nightly **wealth upkeep**: 0.02% of net worth from $1M, 0.05% from $100M, 0.08% from $1B. Tax staff reduce it.
  - **Prestige** purchases turn money into fame: galas, ads, art, a hospital wing, stadium naming rights, a trip to space. Each gives followers and reputation, plus +1% permanent reach per level.
- **Linked systems:**
  - Viral posts boost the companies you own.
  - Scandals hurt your companies but drive FanVault sign-ups.
  - Boycotts can target your businesses; a crisis team can defuse them.
  - Your companies can ask you to star in their ads.
  - Stars you're close to invest in your companies or slip you stock tips.
  - Banks review you when you're controversial; a great reputation raises your credit.

## Store-safe names
Settings → **Store-safe names** swaps every parody of a real celebrity, brand, football club or stock for an original name, and uses generic logos. The swap covers text already in old saves. It's on by default in the Android build and off on the web.

## Tests
`./tests/run.sh` runs two suites. Both need Node and Playwright with Chromium.
- `features.js` checks the career path, unlocks, finance, staff, FanVault, Arena, house edges, the late-game economy, store-safe names and an old-save upgrade.
- `crawl.js` clicks every button on every screen, on desktop and phone, for a new game and an old save (`tests/fixtures/old-save.json`). It fails on any JavaScript error or covered button.

## Finance: bank, mortgages, investing, acquisitions
- **Money hub** now has four screens: Money, Investing, Bank and Acquisitions. Net worth includes stocks, shorts, property, company stakes and debt.
- **Clout Bank**: a credit score from 300 to 850. Personal loans (30/90/180 days) are paid automatically every night. Missed payments cost credit and a late fee, and after four misses collectors take your savings and stocks. Better credit means lower rates and bigger limits.
- **Real estate with mortgages**: seven properties, from a starter loft to a skyscraper. Buy for cash, or with a 360-day mortgage at 10–35% down depending on credit. Rent pays nightly and values follow a housing index. Five missed payments and the bank repossesses the property.
- **Investing desk**: 17 assets in stocks, ETFs, bonds, commodities, a REIT and crypto. It has an allocation bar, unrealized and realized profit and loss, and **short selling** with margin, a borrow fee and margin calls.
- **Acquisitions**: buy 10–100% stakes in 13 fictional companies, from a coffee chain to a media group. Each pays its share of profit nightly. Owning 51% gives you control: a perk, plus Expand, Cut costs and IPO actions. Acquisition loans need 40% down. Events cover buyout offers, booms, scandals, mergers and strikes.

## Enterprise org chart
- Over 60 roles across 9 departments: Executive (CEO, COO, CFO, CMO, CTO, Chief of Staff), Creative, Growth, Business, Commerce, Finance & investing (fund manager, quant, advisor, tax attorney, realtor, M&A banker, risk officer), Legal & safety, Operations and Personal care.
- Each role lists its effects. These stack through `staffBonus()` and cover reach, quality, deal pay, sales, energy, stress, heat, gifts, FanVault, taxes, payroll, loan rates, portfolio alpha, stop-loss and more. You can hire a whole department in one tap.

## FanVault creator dashboard
- A dedicated screen with Grow, Earn and Fans tabs, plus revenue and subscriber charts and a creator rank.
- Grow:
  - VIP and Inner Circle tiers; the Inner Circle needs a weekly call.
  - Promotions: free trial, flash sale and a 3-month bundle.
- Earn:
  - Pay-to-unlock mass messages.
  - A custom request queue with deadlines.
- Fans: a top-fan leaderboard with thank-you tips.

## More Arena
- Sportsbook **parlays** (up to 6 legs, with a bonus on 3+), influencer **Fight Night** (winner or KO), animated **horse racing**, **blackjack**, **scratch cards**, and a full **bet history** across every game.

## Danger Zone

- **Stunts** (rooftop selfie, public prank, world's hottest pepper, filming while speeding, posing with a "tame" tiger, urban exploring, a 48-hour no-sleep stream, faking your own disappearance) can go hugely viral, or go wrong. You can get injured (hospital bill, max energy cut by 40% for days), arrested (fine, a lost day, a mugshot meme), collapse from burnout, or face public outrage. Stress raises the odds of failure; a bodyguard and a lawyer lower them. Afterwards you can post a "hospital update" or "own the mugshot" for sympathy and reach.
- **Shady schemes** (scam links in replies, a fake giveaway, a pump-and-dump coin, a fake merch preorder, selling fans' emails) pay out right away, fill your inbox with scammed fans, and raise a hidden investigation meter. Getting exposed means a choice between refunds, blaming hackers (suspension if it fails), fleeing the country, or doubling down into a cancellation. Scam bots impersonating you also show up in your replies.
- **Polls on any post**: tap "Add poll" in the composer (Chirp still has a dedicated poll format). Polls boost engagement.

- **Stunt tiers**: low risk (ice bath, pro bungee, busking, 72oz steak, mystery street food tour), risky (the originals), and extreme (spiciest food gauntlet, solo skydive, sharks without a cage, crashing a celebrity wedding, free-climbing a skyscraper). Low risk pays small, extreme pays a fortune. Food stunts can end in food poisoning.
- **More daily challenges**: food blogging (score a dish out of 10, share a recipe, #foodie spots, funny food takes), polls with 3+ options, doubling your usual views, low-risk and extreme stunts, FanVault drops. Hard challenges pay cash and +4% followers; food ones pay a bonus. Reroll a challenge once a day for 5 energy.
- **Stunt prizes**: a landed stunt pays sponsor and ad money plus a big follower jump, scaled by how risky it is. Viral clips pay ×2.5 cash and ×2 followers; a rare jackpot (Red Bolt sponsorship) pays ×3 cash. Successful stunts in a row build a daredevil streak (up to ×2.25 prizes); a fail resets it. A second stunt on the same day pays less and is riskier.

## Creativity

- **Originality score** (0–100) for every post: your own words, a wide vocabulary, questions, emoji and @mentions raise it. Repeating yourself or using the dice's canned captions lowers it. Higher originality means more reach and viral chance, and 85+ gives a small energy bonus.
- **Looks** for photo and video posts: Clean, Neon, Vintage, Chaotic, Cinematic, Lo-fi, each with its own effect. One look trends each week for +12% reach. The post's media is drawn in that look.
- **Daily creative challenge**: a new prompt every day (a funny short, ride a trend, 75+ originality, use this week's look, mention a star, ask a question, post about a clash). The composer tells you when your draft completes it. Reward: +20 energy and +2% followers.
- **@mentions** notify stars; friends may reply in your thread.

## Energy rewards

Doing well gives you a second wind, shown as a gold energy pop-up:

| Trigger | Energy |
| --- | --- |
| Post that fans engage with | Refund of up to 60% of its cost (shown in the composer forecast) |
| Post that beats your recent average views | +8 |
| Viral post | +25 |
| A star replies to your post | +5 |
| Follower milestone (500, 1K, 2.5K, 5K, 10K, ...) | +15 and +2 max energy for good |
| New creator tier | Full refill +15, and +5 max energy for good |
| Getting verified | +30 |
| Achievement unlocked | +8 |
| Skill level up | +10 |
| Brand deal paid | +10 |
| Collab posted / collab agreed in DMs | +15 / +6 |
| Shoutout from a star | +12 |
| Star follows you back | +8 |
| Starting to date a star | +20 |
| Award win | +40 |
| Stream ends | +3 to +25 depending on viewers |
| Thanking fans, star replies to your DM or reply | +2 to +8 |
| Daily posting streak | +5 morning energy per day in a row, up to +30 |

## Features

- **5 platforms**: Pixgram, Chirp, Clipz, ViewTube and Streamly, each with its own followers, engagement, daily algorithm mood and unlock threshold.
- **Post composer** with 14 formats, topics (niche, live trends, storytime, causes, hot takes, flexes, sponsored, collabs, diss posts, couple content), 8 tones, effort, post time, hashtags, your own caption, #ad disclosure, and a live forecast of views, followers, viral chance, reputation and heat.
- **Post results**: views, likes, comments, shares, follower change, ad revenue, and generated comments from fans, haters, bots and celebrity friends. Posts can go viral or flop.
- **Trends** rotate daily. Fresh trends that fit your niche reach furthest. Repeating the same topic gets stale.
- **20 fictional stars** (pop stars, actors, streamers, a tech billionaire, a drama channel and more). Follow, DM, gift, comment, ask for collabs or shoutouts, date them, or call them out and start a feud. Relationships fade without upkeep.
- **Feed** of star posts to like and comment on (supportive, funny, self-promo or trolling).
- **Inbox** with fan mail, hate mail, brand offers (accept, negotiate, decline), collab invites, star DMs and phishing or crypto scams.
- **Brand deals** with deadlines, breach fees, sketchy brands that pay more and can blow up later, sellout penalties, and fines for skipping disclosure.
- **Livestreams** of 1h, 3h or 12h with chat events: troll raids, celebrity drop-ins, donations, sponsor reads, rival raids, swatting threats.
- **40+ random events** with choices: resurfaced old posts, paparazzi, stalkers, algorithm changes, shadowbans, becoming a meme, copyright strikes, hacks, reality TV, talk shows, galas, book deals, breakups, bot exposés and more.
- **Cancellation** when heat hits 100, with apology options: sincere video, notes-app apology, tearful video, disappearing, or doubling down.
- **Shop**: gear that raises post quality, lifestyle purchases with upkeep (supercar, mansion, jet, island), courses, energy and recovery items, bot followers, paid badge, ad campaigns.
- **Team**: assistant, editor, social media manager, talent manager, community manager, PR agent, therapist, lawyer, bodyguard. Monthly salaries: the first month is paid when you hire, then every 30 days.
- **Empire**: merch line with levels and drops, your own product brand, a podcast with celebrity guests, savings with interest, charity donations.
- **Life & skills**: self-care actions, fan meetups, giveaways, industry parties, and four skills (charisma, creativity, editing, business) that level up with practice.
- **Analytics**: history chart (followers, reputation, money, engagement, heat), platform breakdowns, top posts, daily wrap-ups and weekly reports.
- **The Tea**: a gossip feed about the stars and you.
- **Trophies**: tier ladder from Nobody to Icon, verification, Clout Awards every 30 days, and 50+ achievements.
- **Difficulty**: Chill, Normal or Brutal. Sound effects toggle. Ctrl/Cmd+E ends the day.

## Files

- `index.html` – layout and styles
- `data.js` – platforms, formats, tones, trends, stars, brands, shop, team
- `engine.js` – simulation: posting math, day cycle, NPCs, deals, achievements, saving
- `faces.js` – detailed cartoon faces, celeb caricature traits, designed brand logos
- `quests.js` – daily quests and extra random events
- `social.js` – accounts, cloud saves, friends, gifts (claude.ai and Supabase backends)
- `cloud-config.js` – Supabase URL/key for email accounts (empty = local only)
- `android/supabase-schema.sql` – database tables and security rules for Supabase
- `extra.js` – new team members, Headquarters, daily login calendar
- `finance.js` – bank, loans, mortgages, real estate, investing desk, short selling, acquisitions, enterprise org chart
- `arena.js` – parlays, Fight Night, horse racing, blackjack, scratch cards, bet history
- `names.js` – store-safe original names for every parody
- `progression.js` – career path, screen unlocks, wealth upkeep, prestige, linked-system events
- `tests/` – browser test suites and an old-save fixture
- `visuals.js` – animated scenery, stories, event art, reaction bursts, casino and match animations
- `art.js` – generated faces, logos, post illustrations, photo resizing
- `events.js` – random and triggered events, livestream chat, modal queue
- `clash.js` – celebrity clashes and clash battles
- `spicy.js` – scandal events, hot seat, tea fallout, world tour
- `behavior.js` – personalities, memory, mood, decisions, mind games, mention intents
- `danger.js` – risky stunts, shady schemes, investigations, injuries
- `endgame.js` – sportsbook, casino, Clout Pass, world events, Legacy, mega deals
- `vault.js` – FanVault paid-subscription platform, drops, events
- `money.js` – gigs, markets, property, course, extra shop items, cosmetics, Money screen
- `ui.js` – rendering, player actions, start screen

All people, brands and platforms in the game are fictional or clearly marked parody with tweaked names; everything they do in the game is invented.

## Android app

`android/` turns the game into an Android app (a full-screen WebView wrapper; saves stay on the phone).

- **Sideload:** `android/dist/clout-chaser.apk`. Copy it to your phone, open it, and allow "Install unknown apps" when asked.
- **Google Play:** `android/dist/clout-chaser.aab` is the App Bundle Play asks for. It targets Android 15 (API 35) and draws edge to edge with system-bar insets handled.
- Rebuild with `cd android && ./build.sh`. It needs a JDK 17+ and Python 3, but no Android SDK: the platform jar and dex compiler come from Maven Central, and bundletool comes from GitHub. The phone APK is generated from the AAB by bundletool, so it is aligned and signed exactly as Android expects.
- **Signing:** set `KEYSTORE=/path/release.jks KS_PASS=... KS_ALIAS=upload` to sign with your release (upload) key. Without them, the build uses a throwaway key in `android/.tools/`. That's fine for testing, but it can't update an app installed with another key. Keep the release key and its password somewhere safe; the key is never committed.
- The app-store build turns on **store-safe names** by default (see below).
- Android 7.0+ (API 24). Back button closes sheets and pop-ups first, then goes back, then exits. "Add your photo" opens the phone's photo picker.
