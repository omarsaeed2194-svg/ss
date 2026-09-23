# Saudisoft Localization Journey — website video

A 52-second, 30 fps motion-graphics video (horizontal 1920×1080 and vertical 1080×1920) telling the
localization.saudisoft.com story, built to autoplay silently on a web page.

| Time | Scene |
| --- | --- |
| 0–5s | "Every market speaks its own language." (EN + AR) + wordmark |
| 5–11s | 1983 · Jeddah, Saudi Arabia: where it began |
| 11–17s | Growth: Jeddah → offices in Saudi Arabia & Egypt → Cairo hub → 35+ years, 100+ languages |
| 17–28s | The journey of every project: Source → Analysis → Translate → Edit & proof → Engineer → Test → Launch (TEP) |
| 28–34s | Services: software, websites, games, eLearning, subtitling, voiceover, transcreation, interpretation |
| 34–41s | 100+ languages: greetings in 22 scripts, arcs from Jeddah across the globe |
| 41–46s | ISO 17100 certified |
| 46–52s | CTA: localization.saudisoft.com |

## Files

Two cuts of the same 52s timeline, each as 1080p MP4 (H.264, faststart), 1080p
WebM (VP9), a lighter 720p MP4 and a poster JPG, in `dist/`:

- `saudisoft-localization-journey-horizontal-*`: 1920×1080 (16:9), for page sections and hero banners
- `saudisoft-localization-journey-vertical-*`: 1080×1920 (9:16), for mobile, stories and reels

`embed.html` is a copy-paste embed (autoplay, muted, loop, responsive). It serves
the vertical cut on phones held upright and the horizontal cut everywhere else.

There is no audio track, because browsers only autoplay muted video.

## Editing & re-rendering

All copy, colours and timings live in `journey.html`. Open
`journey.html?t=20` in a browser to preview any moment. `window.render(t)`
draws the frame for time `t` (seconds).

```bash
python3 fetch-fonts.py          # once: downloads Google Fonts into ./fonts
node render.js --stills         # quick preview JPGs in dist/ (add --portrait for vertical)
node render.js                  # horizontal cut -> dist/*-horizontal-*
node render.js --portrait       # vertical cut   -> dist/*-vertical-*
```

Open `journey.html?portrait&t=20` to preview the vertical layout. `render.js`
needs `playwright` (with Chromium) and `ffmpeg`. Set `PLAYWRIGHT_PATH` /
`FFMPEG` to override their locations.

Brand: colours come from the Saudisoft logo (`saudisoft-logo.png`): green
`#0B6D40`, yellow `#FADC29`, grey `#67696B`, on a light background. For a
sharper logo, replace `saudisoft-logo.png` with a larger or SVG version.

---

# AAA game localization case study video

A 49-second companion video for
[the AAA game case study](https://localization.saudisoft.com/saudisoft-deliver-aaa-game-experiences/),
in a dark, cinematic game-HUD style using the same brand colours. Source: `case-aaa.html`.

| Time | Scene |
| --- | --- |
| 0–5.6s | Case study: "Delivering a AAA game experience to Arabic players" (لعبة عالمية. بلغتك.) |
| 5.6–12.4s | The mission: a leading global publisher, one of its most anticipated AAA titles; MENA markets light up |
| 12.4–19.2s | The scope: thousands of assets; dialogue, subtitles, quests, items, tutorials and menus flip EN → AR |
| 19.2–30.4s | The solution: translation & transcreation, cultural adaptation, Arabic dubbing, engineering & LQA |
| 30.4–37.4s | In-game: menu, HUD and subtitles mirror from LTR to RTL |
| 37.4–43.6s | "Achievement unlocked": linguistic accuracy, emotional authenticity, cultural relevance |
| 43.6–49s | CTA: localization.saudisoft.com |

Files: `dist/saudisoft-aaa-game-case-study-{horizontal,vertical}-*`, with sound
(AAC in the MP4s, Opus in the WebMs). Embed with `embed-aaa-case-study.html`.
It autoplays muted, as browsers require, and has a "Sound on" button.

**Soundtrack.** `sound-aaa.py` synthesizes an original score (no samples or
licensed music, so no rights issues). It's a 120 bpm cinematic pulse with a
D Hijaz (Arabic maqam) melody that builds into a D-major "achievement" finale,
plus sound effects timed to the animation:
- whooshes on scene changes
- UI blips as the MENA markets light up
- flip ticks on the asset cards
- a power-up for each solution pillar
- a left-to-right sweep for the RTL switch
- an "achievement unlocked" chime and impacts on the title and logo

It's mixed to about -17 LUFS with a -1 dBFS peak. If you change timings in
`case-aaa.html`, update the matching times in `sound-aaa.py`.

```bash
pip install numpy scipy
python3 sound-aaa.py                      # -> dist/audio-aaa.wav
node render.js case-aaa.html              # horizontal (muxes the audio)
node render.js case-aaa.html --portrait   # vertical
```

The case study names neither the game nor the publisher, and gives no figures.
The in-game screen is a generic mockup. If you can share real numbers (word
count, voice-over lines, characters, timeline), add them to the scope or
achievement scene in `case-aaa.html` and re-render.
