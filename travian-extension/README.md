# Travian Helper — Chrome extension

**[الدليل بالعربية](README.ar.md)** · The extension's interface is in Arabic
by default; switch to English under **Settings → Language**.

Keeps track of your **Travian: Legends** villages and runs your routine while
you're away:

- **Watch & alert** — re-checks every village on a timer and alerts you
  (desktop, Telegram and/or Discord) about **incoming attacks** (with arrival
  time), **warehouse/granary filling up**, **crop running out**, and **being
  logged out**.
- **Build queue** — queue upgrades per village ("Main Building → level 10"),
  or "upgrade all resource fields to level N" (lowest field first). The bot
  starts the next upgrade as soon as a builder is free and you can afford it,
  using the game's own "enough resources at…" timer to know when to retry.
- **Troop training** — rules like "train 20 Legionnaires in Barracks every
  60 minutes" (trains as many as you can afford, up to that number).
- **Farm lists kept in the extension** — your farms are saved in the extension,
  not in the game's farm list. Make lists (village, every N minutes, raid or
  normal attack), paste targets one per line (`12|-34 Name`), and set the
  troops per target (any mix of units). Each round sends to the targets
  waiting longest first while troops last; oases are checked for animals
  first; a target that fails three times in a row (beginner's protection,
  village gone…) is switched off. "Send now" works any time, and the lists
  sync to your other browsers with the rest of your commands.
- **Game farm lists** — can also press "Start all" (or the lists you pick) on
  the game's own farm lists every N minutes.
- **Hero adventures** — sends the hero out whenever they're home and an
  adventure is available.
- **Troop escape (no Gold Club)** — per village, a plan: when an attack is on
  its way, the village's troops (all units or the ones you pick, optionally
  the hero) leave as reinforcement to another of your villages a set number
  of seconds before it lands. If that village is under attack too, they go to
  your nearest safe village. It runs on a precise timer, interrupts anything
  else the bot is doing, and works with automation off and while you play — it
  only needs "Watch & alert". You get an alert when the troops leave, if it
  fails, and when the attack is over (send them back from the rally point; they
  eat the other village's crop meanwhile). Attacks are noticed at each check,
  so keep "Check every" shorter than your attackers' travel time.
- **Troops** — the troops in each village and what the barracks, stable and
  workshop are training (with finish times), in the Overview, the Troops tab
  and the popup.
- **Autopilot** — one switch for when you're away. When a village's build
  queue is empty it picks the next upgrade itself (warehouse/granary when
  90% full → crop when the village is short of crop → Main Building up to the
  fields' level → the lowest resource field, up to a level you choose). It also
  sends the hero on adventures and starts farm lists if you tick them. The
  Autopilot tab shows what it will do next in every village.
- **Oasis raids** — raids empty oases near a village with the unit and number
  you choose, every N minutes. It finds oases on the game map (or uses
  coordinates you add), opens each oasis right before sending and only raids
  when it has **no animals and no owner**, and only confirms when the
  confirmation page names that same oasis. If a step fails, the Activity log
  says which one (for example "could not find the Raid option").
- **Overview dashboard** — filter by village; headline numbers (stock,
  production, net crop, time until storage is full, incoming attacks, builders);
  **alerts & tips** worked out from each village's state (attacks, starvation,
  full storage, idle builders, unbalanced fields, missing cranny/wall, bonus
  buildings you can now build, hero adventures, farm lists…) with one-click
  actions; resource meters, a 24-hour stock chart, field levels and key
  buildings, plus construction, troop movements and activity. It updates live
  as things happen (finished upgrades, attacks starting and ending). Each
  village is drawn from its real state (keep height, wall, fields, scaffolding
  while building, red flag under attack), with a hero card beside it.
- **Popup** — live resources, time until storage is full, build queue
  countdowns and attack warnings at a glance.

Works on Travian: Legends servers (`*.travian.com`, e.g.
`ts3.x1.arabics.travian.com`). It does **not** support Travian: Kingdoms.

> **Heads-up:** Travian's game rules prohibit bots and scripts that play for
> you, and accounts caught using them can be banned. The "Automate actions"
> and Autopilot features are exactly that kind of tool (regular raids around
> the clock are especially easy to spot), and even "Watch & alert" reloads
> game pages on a timer. Use it on your own account at your own risk — and
> consider leaving automation off on an account you care about.

## Install

1. Download this folder (`travian-extension/`).
2. Open `chrome://extensions` in Chrome (or Edge/Brave).
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and pick the `travian-extension` folder.
5. Pin the extension (puzzle-piece icon → pin) so the castle icon is visible.

## Updating without losing your commands

From version 1.3 the extension has a fixed ID (`joghiimcpihpcnaanfcefiligknbbbgc`),
so updates keep your build queue, training rules and settings:

1. Unzip the new version **over the old folder** (replace the files).
2. Open `chrome://extensions` and press the **reload ⟳** button on Travian Helper.

Don't press **Remove** — that deletes the extension's data in this browser
(it can still be restored from Chrome sync or a backup file, see below).

### One-time move from version 1.2 or older

Older versions had no fixed ID, so their commands can't carry over by
themselves. Save them first:

1. Open the **old** version's dashboard, press **F12**, open the **Console** tab.
2. If Chrome asks, type `allow pasting` and press Enter. Then paste this line
   and press Enter — it downloads `travian-helper-backup.json`:
   ```
   chrome.storage.local.get(null).then(d=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d)]));a.download='travian-helper-backup.json';a.click()})
   ```
3. Remove the old version in `chrome://extensions`, then **Load unpacked** the new one.
4. In the new dashboard: **Settings → Save & sync → Restore from backup**, and
   pick the downloaded file.

## Your commands in another browser

- **Chrome sync:** commands are saved to your Chrome account automatically.
  Install the extension in Chrome on another computer, signed in to the same
  Google account with sync on (Settings → You and Google → Sync → make sure
  **Extensions** is on), and your commands appear there.
- **One browser runs the automation at a time.** The others show "running on
  another browser". If that browser is closed, another one takes over within
  3 minutes — or press **Run automation here** in Settings.
- **Backup file:** Settings → Save & sync → **Download backup** /
  **Restore from backup**. Use it for browsers without Chrome sync (e.g. Edge)
  or just to keep a copy.

## First run

1. Log in to your Travian server in the same browser and open your village.
   The extension detects the server and your villages from that page.
2. Click the castle icon. Your villages show up with live resources.
3. Open the **Dashboard** to:
   - **Build queue** — pick a village, then "Queue" fields or buildings to a
     target level, or add an auto-upgrade for resource fields.
   - **Troops** — add training rules. (Open each barracks/stable once in
     Travian so real unit names appear.)
   - **Farms & hero** — turn on farm lists and adventures. (Open Rally Point →
     Farm List once so your lists appear.)
   - **Alerts** — set up phone alerts and press **Send test alert**.
4. Flip **Automate actions** on (popup or dashboard sidebar).

### Phone alerts

- **Telegram:** message `@BotFather`, send `/newbot`, copy the token. Send any
  message to your new bot, open
  `https://api.telegram.org/bot<token>/getUpdates`, and copy `chat.id`.
- **Discord:** Server Settings → Integrations → Webhooks → New Webhook → Copy
  Webhook URL.

## How it works

- The extension reads the game pages: resources, production, build queue,
  troop movements, the village list (which flags attacked villages on every
  page), and so on. Anything you open yourself updates the dashboard too.
- To act, it opens one pinned **bot tab** and works in it: it navigates to the
  right page and presses the same buttons you would. It waits a random 1–4
  seconds between steps, and spreads its timers by ± the "randomize" percentage
  in Settings.
- **Pause while I'm playing** (on by default): when you click or type in a
  Travian tab, the bot stays idle for a few minutes so it doesn't switch your
  active village under you. Just having the game open doesn't count — the game
  reloads itself when timers finish, and that no longer pauses the bot.
- **Why isn't it building?** Each village in the popup and the Build queue tab
  shows the reason the next upgrade hasn't started (automation off, paused
  while you play, builders busy until…, waiting for resources…). "Check now"
  retries queued upgrades immediately.
- **Active hours** (optional): limit automation to a time window. Watching and
  alerts keep running outside it.
- Everything is stored locally in Chrome (`chrome.storage.local`). Nothing is
  sent anywhere except the alerts you configure (to Telegram/Discord).

### Limits

- **Your computer must stay on with Chrome open** (and not asleep) for the bot
  and alerts to run. If you need alerts with the computer off, you'd need a
  server-side setup instead.
- It can't log in for you. If your session expires you get an alert and the
  bot pauses until you log in again.
- It upgrades existing buildings and fields; it doesn't place new buildings
  on empty building sites.
- If Travian changes its page layout, parts of it may stop working until the
  selectors in `src/parser.js` and `src/content.js` are updated. Watch the
  **Activity log** for errors.

## Files

```
manifest.json          Chrome extension manifest (MV3)
src/parser.js          Reads game state out of Travian pages (pure DOM parsing)
src/content.js         Runs on Travian pages: reports state, performs clicks
src/background.js      Service worker: storage, alerts, scheduler, bot jobs
src/shared.js          Constants and helpers (building names, projections, defaults)
src/i18n.js            Arabic and English UI strings (Arabic is the default)
src/sync.js            Saves commands to Chrome sync; one-browser-at-a-time lease
src/advisor.js         Game tips worked out from each village's state
src/autopilot.js       Autopilot choices: next upgrade, which oases to raid, farm targets
src/escape.js          Troop escape: when to leave, where to, which troops
src/ui.js / ui.css     Village cards and styles shared by popup and dashboard
popup/                 Toolbar popup
dashboard/             Full dashboard (also the extension's options page); overview.js renders the
                       Overview tab, autopilot.js the Autopilot tab, farms.js the farm lists,
                       escape.js the escape plans,
                       chart.js the 24-hour stock chart, art.js the village/hero drawings
icons/                 Extension icons
```
