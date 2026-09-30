# Pocket Android Simulator

A browser-based Android phone simulator in a single self-contained file (`index.html`). No build step and no dependencies: open the file in a browser.

## What it does

- **Lock screen** with clock and notifications. Swipe up (or tap the hint) to unlock.
- **Home screen** with app grid, dock, and a date/weather glance.
- **Apps**: Phone (dialer and simulated calls), Calculator, Notes (saved in the browser), Clock (world clock and stopwatch), Calendar, Weather (sample data), Snake, and Settings.
- **Navigation bar**: Back, Home, and Overview. Overview shows live app previews; swipe a card up to close it.
- **Quick Settings**: tap the status bar for Wi‑Fi, Bluetooth, flashlight, airplane mode, Do Not Disturb, dark theme, and brightness.
- **Hardware**: power and volume buttons on the device frame and in the control panel.
- **Battery simulation**: set the charge level, plug in a charger, get a low-battery warning, and watch the phone shut down at 0%.
- **Notifications**: send sample notifications and see them as heads-up alerts, in the shade, and on the lock screen.
- **Logcat**: every action is logged in Android's logcat format.

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
