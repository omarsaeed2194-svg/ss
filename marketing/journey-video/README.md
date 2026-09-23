# Saudisoft Localization Journey — website video

A 52-second, 1920×1080, 30 fps motion-graphics video telling the
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

- `dist/saudisoft-localization-journey-1080p.mp4`: H.264, faststart (≈5 MB)
- `dist/saudisoft-localization-journey-1080p.webm`: VP9 (≈3.7 MB)
- `dist/saudisoft-localization-journey-720p.mp4`: lighter fallback (≈2.6 MB)
- `dist/saudisoft-localization-journey-poster.jpg`: poster frame
- `embed.html`: copy-paste `<video>` embed (autoplay, muted, loop, responsive)

There is no audio track, because browsers only autoplay muted video.

## Editing & re-rendering

All copy, colours and timings live in `journey.html`. Open
`journey.html?t=20` in a browser to preview any moment. `window.render(t)`
draws the frame for time `t` (seconds).

```bash
python3 fetch-fonts.py          # once: downloads Google Fonts into ./fonts
node render.js --stills         # quick preview JPGs in dist/
node render.js                  # full render -> dist/master.mp4
```

`render.js` needs `playwright` (with Chromium) and `ffmpeg`. Set
`PLAYWRIGHT_PATH` / `FFMPEG` to override their locations. Then produce the web
encodes from `dist/master.mp4`:

```bash
ffmpeg -i dist/master.mp4 -c:v libx264 -crf 22 -pix_fmt yuv420p -movflags +faststart -an dist/saudisoft-localization-journey-1080p.mp4
ffmpeg -i dist/master.mp4 -vf scale=1280:720 -c:v libx264 -crf 23 -pix_fmt yuv420p -movflags +faststart -an dist/saudisoft-localization-journey-720p.mp4
ffmpeg -i dist/master.mp4 -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -an dist/saudisoft-localization-journey-1080p.webm
```

Brand: colours come from the Saudisoft logo (`saudisoft-logo.png`): green
`#0B6D40`, yellow `#FADC29`, grey `#67696B`, on a light background. For a
sharper logo, replace `saudisoft-logo.png` with a larger or SVG version.
