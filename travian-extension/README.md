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
- **Farm lists** — presses "Start all" (or the lists you pick) every N minutes.
- **Hero adventures** — sends the hero out whenever they're home and an
  adventure is available.
- **Popup + dashboard** — live resources (projected forward between checks),
  time until storage is full, build queue countdowns, attack warnings, and an
  activity log of everything the bot did.

Works on Travian: Legends servers (`*.travian.com`, e.g.
`ts3.x1.arabics.travian.com`). It does **not** support Travian: Kingdoms.

> **Heads-up:** Travian's game rules prohibit bots and scripts that play for
> you, and accounts caught using them can be banned. The "Automate actions"
> features are exactly that kind of tool, and even "Watch & alert" reloads
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
src/ui.js / ui.css     Village cards and styles shared by popup and dashboard
popup/                 Toolbar popup
dashboard/             Full dashboard (also the extension's options page); overview.js renders the Overview tab
icons/                 Extension icons
```
