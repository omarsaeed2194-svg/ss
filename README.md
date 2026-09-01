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

### 1. Google Analytics 4 & Search Console (shared service account)

Both connectors use the same Google service account:

1. In Google Cloud Console, create (or reuse) a project and a service
   account. Enable the **Google Analytics Data API** and the
   **Search Console API** for that project.
2. Create a JSON key for the service account and copy its `client_email`
   and `private_key`.
3. In **GA4 Admin → Property Access Management**, add the service account
   email as a **Viewer** on the `localization.saudisoft.com` property.
4. In **Search Console → Settings → Users and permissions**, add the same
   service account email as a **Restricted** (or Full) user on the
   `localization.saudisoft.com` property.
5. Copy `.env.example` to `.env.local` and fill in:
   - `GA4_PROPERTY_ID` — the numeric GA4 property ID.
   - `GSC_SITE_URL` — the exact property string as shown in Search Console
     (a URL-prefix property like `https://localization.saudisoft.com/`, or
     `sc-domain:saudisoft.com` for a domain property).
   - `GOOGLE_CLIENT_EMAIL` / `GOOGLE_PRIVATE_KEY` — from the service account
     key JSON (keep the `\n` escapes in the private key as a single-line
     env var).
6. Restart the dev server (or redeploy). Once credentials resolve, both
   panels switch their badge from `Demo data` to `Live`.

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
  page.tsx            Dashboard UI (client component, polls /api/overview)
  api/overview/route.ts  Combines all three connectors into one JSON response
lib/
  connectors/
    ubersuggest.ts     Reads data/ubersuggest-snapshot.json
    ga4.ts              GA4 Data API via @google-analytics/data, falls back to demo data
    gsc.ts              Search Console API via googleapis, falls back to demo data
  demo-data.ts          Deterministic placeholder data used before credentials exist
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
