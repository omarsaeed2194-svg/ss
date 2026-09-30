# Pocket Android Simulator

A browser-based Android phone simulator in a single self-contained file (`index.html`). No build step and no dependencies: open the file in a browser.

## What it does

- **Lock screen** with clock and notifications. Swipe up (or tap the hint) to unlock.
- **Home screen** with app grid, dock, and a date/weather glance.
- **Search**: tap the home search bar to find apps, settings (toggle them right from the results), and notes, or press Enter to search the web.
- **Apps**: Browser (address bar, back/forward, reload, open in new tab), Phone (dialer and simulated calls), Calculator, Notes (saved in the browser), Clock (world clock and stopwatch), Calendar, Weather (sample data), Snake, and Settings.
- **Navigation bar**: Back, Home, and Overview. Overview shows live app previews; swipe a card up to close it.
- **Quick Settings**: tap the status bar for Wi‑Fi, Bluetooth, flashlight, airplane mode, Do Not Disturb, dark theme, and brightness.
- **Hardware**: power and volume buttons on the device frame and in the control panel.
- **Battery simulation**: set the charge level, plug in a charger, get a low-battery warning, and watch the phone shut down at 0%.
- **Notifications**: send sample notifications and see them as heads-up alerts, in the shade, and on the lock screen.
- **Logcat**: every action is logged in Android's logcat format.

## About the Browser

The Browser shows real web pages inside the phone using an iframe, and uses Google's embeddable search mode for searches. Two limits apply:

- Many sites (YouTube, Facebook, most news sites) refuse to be shown inside another page, so they show an error. Use the ↗ button to open them in a new tab.
- The hosted Claude artifact version can't embed any outside website. There the Browser shows an "Open in new tab" fallback. Open `index.html` from your own computer to browse inside the phone.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Esc` | Back |
| `P` | Power |
| Arrow keys / Space | Steer and pause Snake |

Settings › About phone › tap **Build number** 7 times to unlock developer mode.

## Run locally

```bash
open android-simulator/index.html        # macOS
xdg-open android-simulator/index.html    # Linux
# or serve it:
npx serve android-simulator
```
