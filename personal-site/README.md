# Personal website — Omar Saeed

A personal site built from a LinkedIn profile, with a password-protected
admin backend (`/admin`) to customize the theme, layout, sections and every
piece of content, with a live preview.

## Quick start

```bash
cd personal-site
cp .env.example .env.local   # then set ADMIN_PASSWORD and SESSION_SECRET
npm install
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

## Filling it from LinkedIn

LinkedIn doesn't allow profiles to be scraped, so the site imports
LinkedIn's **official data export** instead:

1. On LinkedIn: **Settings → Data privacy → Get a copy of your data**
   (https://www.linkedin.com/mypreferences/d/download-my-data).
2. Choose *Want something in particular?* and tick Profile, Positions,
   Education, Skills, Certifications, Projects, Languages and Email addresses.
3. When LinkedIn emails the archive, open **/admin → Import** and drop the
   `.zip` in. Pick which parts to import, review the preview, then
   **Save & publish**.

The zip is read in the browser; nothing is sent to the server until you save.
Until you import, the site shows starter content taken from public
information. Replace it from the admin.

## What the admin can change

| Tab | Controls |
| --- | --- |
| **Import** | LinkedIn export import, JSON backup download/restore |
| **Profile** | Photo (upload or URL), name, headline, location, about, email, phone, résumé link, "open to opportunities" badge, links, SEO title/description |
| **Theme** | 5 presets (Professional, Editorial, Midnight, Desert, Minimal Mono), light/dark/auto mode with a visitor toggle, separate light and dark palettes (7 colors each), heading and body fonts (Google Fonts, including Arabic-friendly Cairo), single-column or sidebar layout, header style (photo left / centered / banner), photo shape, card style, corner radius, content width, animations |
| **Sections** | Reorder, rename, show/hide |
| **Experience / Projects / Education / Certifications / Skills & languages** | Add, edit, reorder, delete |

Changes appear in the live preview (desktop and mobile widths) right away,
and go live when you click **Save & publish**.

## Storage

- **Default:** content is saved to `data/site.json`. This works for
  `npm run dev` and any Node host with a writable disk. You can also commit
  that file to publish content through git.
- **Vercel / serverless:** the filesystem is read-only there, so create a
  free Upstash Redis database (or Vercel KV) and set `KV_REST_API_URL` and
  `KV_REST_API_TOKEN`. The admin then saves to Redis.

## Deploying to Vercel

Import the repo in Vercel, set **Root Directory** to `personal-site`, and add
the environment variables `ADMIN_PASSWORD`, `SESSION_SECRET`,
`KV_REST_API_URL` and `KV_REST_API_TOKEN`.

## Security

- `/admin` and `/api/admin/*` are protected by middleware. It checks an
  HMAC-signed, httpOnly session cookie that expires after 7 days.
- The admin is locked until `ADMIN_PASSWORD` is set.
- Saved URLs are restricted to `http(s)`, `mailto:`, `tel:`, relative paths
  and inline images, so `javascript:` links are rejected both on save and
  on render.

## Structure

```
app/page.tsx                   Public site (server-rendered from stored content)
app/admin/page.tsx             Editor shell: tabs, save/discard, live preview
app/admin/preview/page.tsx     Preview rendered in an iframe (real responsive breakpoints)
app/admin/login/page.tsx       Password login
app/api/admin/*                login / logout / content (GET, PUT)
components/Site.tsx            The site renderer, shared by the public page and the preview
components/admin/*             Editor panels and form controls
lib/linkedin.ts                LinkedIn export (.zip/.csv) parser and mapper
lib/theme.ts                   Theme → CSS custom properties, Google Fonts URL
lib/store.ts                   File or Redis (Upstash REST) persistence
lib/defaults.ts                Presets, fonts, starter content, schema defaults
```
