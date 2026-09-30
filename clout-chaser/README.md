# Clout Chaser

A browser game that simulates life as a social media creator. You start with 210 followers and a phone and try to become an icon: 100M followers while keeping your reputation above 60.

No build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```bash
cd clout-chaser
python3 -m http.server 8080   # then open http://localhost:8080
```

Progress saves automatically to `localStorage`. The Account tab can export and import save codes.

## Core stats

| Stat | What it does |
| --- | --- |
| Followers | Tracked per platform. Drives reach, deal pay, merch sales and tier. |
| Engagement | Weighted average across platforms. Bot followers drag it down. Raises deal pay. |
| Reputation (0–100) | Boosts follower conversion and passive growth. At 0 you get deplatformed. |
| Heat (0–100) | Controversy. Adds reach, but at 100 you get cancelled. Cools each night. |
| Energy | Spent on every post and action. Refills when you end the day. |
| Stress | Rises with work and heat. Above 80 it cuts energy; at 100 you burn out. |
| Money | Earned from ads, deals, streams, merch, products, podcasts, events. |

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
- **Team**: assistant, editor, manager, community manager, PR agent, therapist, lawyer, bodyguard, each with daily salaries.
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
- `events.js` – random and triggered events, livestream chat, modal queue
- `ui.js` – rendering, player actions, start screen

All people, brands and platforms in the game are fictional.
