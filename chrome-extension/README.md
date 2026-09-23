# AI Visibility Toolkit (Chrome extension)

Helps `localization.saudisoft.com` (or any site) show up in AI answers from
ChatGPT, Perplexity, Gemini, Claude and Copilot, and measures whether it does.

An extension can't place a site into AI answers directly. Assistants cite
pages their crawlers can read, understand and trust. This extension does two
things:

1. **Makes your pages easy for AI engines to cite** by auditing them and
   generating the files to fix the gaps.
2. **Tracks whether AI answers cite you**, so you can see whether the fixes
   are working.

## Install (unpacked)

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select this `chrome-extension/` folder.
3. Pin **AI Visibility Toolkit** to the toolbar.

## Tabs

**Audit** — open any page of your site and click *Audit this page*. It scores
the page (0–100) and lists fixes:

- Robots.txt access for each AI crawler (OAI-SearchBot, GPTBot, ChatGPT-User,
  PerplexityBot, Claude-SearchBot, ClaudeBot, Google-Extended, Bingbot,
  Applebot-Extended, CCBot).
- Whether the content is in the server HTML. Most AI crawlers don't run
  JavaScript.
- `noindex` / `nosnippet` blockers, `/llms.txt`, sitemap, JSON-LD
  (Organization, FAQPage), Q&A-style headings, content depth, facts and
  figures, lists/tables, freshness, canonical, `lang` / hreflang, Open Graph,
  brand consistency.

**Generate** — after an audit, drafts:
`llms.txt` (from your sitemap), `FAQPage` JSON-LD (from the question
headings on the page), `Organization` JSON-LD, and robots.txt rules that
allow AI crawlers. Review each draft before publishing it.

**Track** — your target prompts (edit them in Settings), each with buttons
that open ChatGPT / Perplexity / Claude / Copilot with the prompt filled in.
Gemini has no URL parameter, so its button copies the prompt for you to paste.
While an answer is on screen, the content script:

- outlines links to your domain in green and highlights brand-name mentions,
- shows a badge: *cited* (links to you), *named* (mentioned without a link),
  or *not in this answer*,
- logs the result. The Track tab summarizes it and exports a CSV.

**Settings** — domain, brand names, target prompts (synced via Chrome sync).

## Notes

- The tracker only reads the page. It never changes what the assistant says,
  and data stays in `chrome.storage` in your browser.
- AI answers vary by user, location and time. Ask each prompt a few times,
  and over several weeks, before reading trends.
- The assistants' page markup changes often. If prompts stop being detected,
  update the selectors in `content/tracker.js` (`currentPrompt` / `isUserText`).
