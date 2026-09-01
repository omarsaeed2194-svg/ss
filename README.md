# SEO Dashboard — localization.saudisoft.com

A live SEO dashboard that combines three data sources into one view for
`localization.saudisoft.com`:

- **Ubersuggest** — domain authority, organic traffic estimate, keyword
  rankings, backlinks, top pages (refreshed periodically — see below).
- **Google Analytics 4** — sessions, users, conversions, channels, top pages
  (live, via the GA4 Data API).
- **Google Search Console** — clicks, impressions, CTR, average position,
  top queries and pages (live, via the Search Console API).

The dashboard auto-refreshes every 60 seconds in the browser and each stat
card is labeled with its data source status (`Live`, `Cached`, `Demo data`,
or `Error`) and an "as of" timestamp, so it's always clear what's real and
what's still a placeholder.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Without any environment variables configured, GA4 and Search Console panels
render clearly-labeled **demo data** shaped to the site's real traffic scale,
so the layout and interactions can be reviewed before credentials are wired
up. Ubersuggest panels always show the real snapshot committed in
`data/ubersuggest-snapshot.json`.

## Connecting live data

### 1. Google Analytics 4 & Search Console (one-click Google sign-in)

Both connectors share a single OAuth connection — sign in once with the
Google account that already has access to your GA4 property and Search
Console site, then pick which property/site to show. No service account,
JSON key, or granting a robot-account access to your properties.

One-time setup (you, in Google Cloud Console):

1. Create/select a project at console.cloud.google.com.
2. **APIs & Services → Library**: enable **Google Analytics Data API**,
   **Google Analytics Admin API**, and **Search Console API**.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   (Application type: **Web application**). Add an **Authorized redirect
   URI** for every place this app runs:
   - `https://<your-vercel-domain>/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (for local dev)
4. Copy the Client ID and Client Secret into your environment (`.env.local`
   locally, or Vercel → Project → Settings → Environment Variables):
   - `GOOGLE_OAUTH_CLIENT_ID`
   - `GOOGLE_OAUTH_CLIENT_SECRET`
   - `SESSION_SECRET` — any random string, e.g. `openssl rand -hex 32`
     (encrypts the stored refresh token in a cookie)
5. Redeploy (or restart `npm run dev`).

Then, in the app itself:

1. Open `/connect` (or click **Connect GA4 / Search Console** on the
   dashboard).
2. Click **Connect Google account** and sign in with the Google account
   that has access to the GA4 property and Search Console site for
   `localization.saudisoft.com`.
3. Pick the GA4 property and Search Console site from the dropdowns (auto
   populated from your account) and click **Save selection**.

The dashboard panels switch their badge from `Demo data` to `Live` as soon
as both are configured. The connection (an encrypted refresh token) lives
in an httpOnly cookie in your browser — nothing is stored server-side, so
reconnecting is one click if you ever clear cookies or switch browsers.

### 2. Ubersuggest

Ubersuggest doesn't offer a self-serve public REST API on most plans, so
this project treats it as a periodically-refreshed snapshot rather than a
live server-side call:

- `data/ubersuggest-snapshot.json` holds the latest pull (domain overview,
  keyword rankings, top pages, backlinks).
- `npm run refresh:ubersuggest` explains how to regenerate it — in practice,
  ask a Claude Code session with the Ubersuggest MCP connector to re-pull
  `domain_overview`, `domain_keywords`, `domain_top_pages` and
  `backlinks_overview` for the domain and rewrite the snapshot file, then
  commit it.
- The dashboard flags the snapshot as stale (message on the `Cached` badge)
  once it's more than 14 days old.

If your Ubersuggest plan is later upgraded to one with a documented API key,
swap the body of `scripts/refresh-ubersuggest.mjs` and
`lib/connectors/ubersuggest.ts` for real `fetch()` calls — the rest of the
dashboard (types, UI, API route) doesn't need to change.

## Architecture

```
app/
  page.tsx                     Dashboard UI (client component, polls /api/overview)
  connect/page.tsx             Google sign-in + GA4 property / Search Console site picker
  api/overview/route.ts        Combines all three connectors into one JSON response
  api/auth/google/             OAuth start / callback / disconnect routes
  api/connections/             Connection status, property/site listing, selection save
lib/
  connectors/
    ubersuggest.ts     Reads data/ubersuggest-snapshot.json
    ga4.ts              GA4 Data API via googleapis, using the stored OAuth session
    gsc.ts              Search Console API via googleapis, using the stored OAuth session
  google/
    oauth.ts             Builds auth URLs, exchanges codes, builds API clients from a refresh token
    session.ts            Encrypted-cookie storage for the connection + selected property/site
  demo-data.ts          Deterministic placeholder data used before a Google account is connected
  types.ts              Shared types for all three sources + combined overview
data/
  ubersuggest-snapshot.json  Latest Ubersuggest pull for the domain
components/              StatTile, TrendChart, DataTable, Card, SourceBadge
```

Each connector is independent and fails soft — if GA4 or Search Console
credentials are missing or a call errors, that panel falls back to demo
data (or an `Error` badge) without breaking the rest of the dashboard.

## Deploying

This is a standard Next.js app (`npm run build && npm run start`), so it
deploys to Vercel, or any Node host, unchanged. Set the environment
variables from `.env.example` in the hosting provider's dashboard rather
than committing `.env.local`.
