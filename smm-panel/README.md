# SMM panel

A complete social media marketing (SMM) reseller panel: a public storefront,
a customer dashboard, an admin backend, automatic forwarding of orders to
upstream providers, and the standard SMM API v2 so other panels and bots can
resell your services.

## Quick start

```bash
cd smm-panel
cp .env.example .env.local   # set ADMIN_EMAIL and ADMIN_PASSWORD
npm install
npm run dev
```

- Site: http://localhost:3000
- Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then open **Admin panel** in
  the sidebar (or go to `/admin`).

No database setup is needed for local development: without `DATABASE_URL`
the app runs an embedded Postgres (PGlite) stored in `./data/pglite`.

A fresh database is seeded with a **demo catalog** (17 manual services in 6
categories) and a sample "Bank transfer" payment method, so you can click
through everything right away. The admin overview shows a setup checklist;
delete the demo services (Services → select all → Delete) once you've
imported real ones.

## Going live: the setup checklist

1. **Settings** — panel name, currency code/symbol, homepage text, support
   email, terms of service.
2. **Providers** — add your upstream provider's API URL (usually ends in
   `/api/v2`) and your API key there. The connection is tested on save.
   Then tick the services to import and choose your markup %. Categories are
   created from the provider's categories.
3. **Payments** — replace the sample bank details with your real payment
   methods (bank, crypto wallet, mobile wallet...). Each method has its own
   instructions, minimum and optional bonus %.
4. **Background sync** — set `CRON_SECRET` and call `/api/cron/sync` every
   few minutes (see below).

## How it works

### Orders

1. The customer picks a service, pastes a link and a quantity; the charge is
   `rate × quantity / 1000` (packages have a fixed price).
2. The balance is debited atomically (concurrent orders can't overspend).
3. If the service is linked to a provider, the order is forwarded right away.
   If the provider rejects it (for example, your provider balance is too low), the
   order stays pending and shows up under **Admin → Orders → Failed to
   send** with the provider's error. Fix the cause and click **Resend**, or
   cancel it to refund the customer.
4. Statuses, start counts and remains are pulled from the provider by the
   sync job, and each time customers open their orders page.
5. **Partial** refunds the undelivered share; **Canceled** refunds everything.
   Both happen exactly once and are recorded in the customer's balance
   history.

Services without a provider are **manual**: orders wait under **Admin →
Orders → Manual to fulfil**, and you set the status, start count and remains
yourself.

Supported service types: Default (link + quantity), Package (link only) and
Custom Comments (one comment per line). Provider services of other types are
listed but can't be imported. Drip-feed and subscriptions aren't supported.

### Refills and cancellations

Services flagged with refill/cancel show those buttons in the customer's
order history (refill once per 24h, on completed or partial orders). Requests
are forwarded to the provider. For manual services, pending orders are
canceled and refunded immediately.

### Payments

Customers choose a method, pay outside the panel, and submit the amount
and transaction reference. You check it arrived, then approve it (you can
correct the amount) or reject it with a note. Approval credits the balance
plus the method's bonus. You can also adjust any balance by hand from
**Admin → Users**.

There's no card gateway built in, on purpose. Stripe and PayPal both list
the sale of followers, likes and views as prohibited, and accounts selling
these services are routinely closed. SMM panels usually take crypto, bank
transfers and local wallets, and manual approval works with all of them.

### Support tickets

Customers open tickets about orders or payments. Admins reply from **Admin
→ Tickets**. The customer's sidebar shows a badge when there's an answer.

## API

Every customer gets an API key (**Dashboard → API**, with full docs). The
endpoint is `POST /api/v2` with form fields or JSON. It implements the
standard actions: `services`, `add`, `status` (single or up to 100),
`balance`, `refill`, `refill_status` and `cancel`. That makes the panel
compatible with existing reseller scripts, and other panels can add yours as
a provider. Public docs are at `/api-docs`.

## Background sync

`GET` or `POST /api/cron/sync` updates order statuses (in batches of 100 per
provider), refill statuses and provider balances. It requires the
`CRON_SECRET` from your environment, given as `Authorization: Bearer <secret>`
or `?secret=<secret>`.

- **Vercel**: Vercel Cron sends the bearer header automatically. Hobby plans
  only allow a daily cron, so use a free external scheduler (for example
  cron-job.org) with `https://your-domain/api/cron/sync?secret=...` every 5
  minutes.
- **VPS**: `*/5 * * * * curl -fsS "https://your-domain/api/cron/sync?secret=..." >/dev/null`

There's also a **Sync statuses** button in the admin. Customers' own pages
sync their in-flight orders when opened, so statuses stay reasonably fresh
even without a scheduler.

## Deploying

| Host | Database |
| --- | --- |
| VPS or any Node server with a persistent disk | Embedded PGlite works. Back up `smm-panel/data/`. Or use Postgres. |
| Vercel, Netlify or other serverless hosts | Set `DATABASE_URL` to a hosted Postgres (Neon, Supabase, Vercel Postgres...). The filesystem there isn't persistent. |

On Vercel: import the repo, set **Root Directory** to `smm-panel`, and add
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DATABASE_URL` and `CRON_SECRET`. Tables are
created automatically on first request.

On a VPS: `npm ci && npm run build && npm start` (port 3000) behind nginx or
Caddy for HTTPS, plus the cron line above.

### The live deployment (Railway)

The production site runs on Railway, in the project **smm-panel**:

| Service | What it is |
| --- | --- |
| `smm-panel` | This app, built from this repo with root directory `/smm-panel`. Only changes under `smm-panel/` trigger a redeploy. Health check: `/`. |
| `Postgres` | The database. The app's `DATABASE_URL` is the reference `${{Postgres.DATABASE_URL}}`, over Railway's private network. |
| `order-sync` | A Railway Function on a `*/5 * * * *` cron that calls `/api/cron/sync`. Its `APP_URL` and `CRON_SECRET` are references to the `smm-panel` service. |

Variables you set yourself on the `smm-panel` service (Variables tab), so
they never pass through chat or git: `ADMIN_EMAIL`, `ADMIN_PASSWORD` and
`CRON_SECRET`. The admin account is created on the first start after
they're set.

## Security notes

- Passwords are hashed with scrypt. Sessions are random tokens stored as
  SHA-256 hashes, in an httpOnly cookie that lasts 30 days. Changing a
  password signs out other devices.
- Every server action checks the session (and admin role) itself; admin
  pages are also guarded by `requireAdmin()`.
- Order links that aren't `http(s)` URLs are rejected (plain usernames are
  allowed) and never rendered as clickable links, so a `javascript:` link
  can't run in an admin's browser.
- Suspending a user signs them out and disables their API key.
- There's no email delivery, so there's no self-serve password reset.
  Admins can set a new password from **Admin → Users**. Login throttling is
  minimal. Put the site behind Cloudflare (or similar) for rate limiting.

## Structure

```
app/
  page.tsx, services/, api-docs/, terms/   Public storefront
  login/, register/                        Auth pages
  dashboard/                               Customer area: new order, mass order, orders, services,
                                           add funds, support tickets, API key + docs, account
  admin/                                   Overview, orders, users, services & categories,
                                           providers (connect/import/sync), payments & methods,
                                           tickets, settings
  actions/                                 Server actions (auth, orders, account, admin)
  api/v2/route.ts                          Public reseller API
  api/cron/sync/route.ts                   Background sync endpoint
lib/
  db.ts         Postgres via `pg` (DATABASE_URL) or embedded PGlite; tx() helper
  schema.ts     Tables (created on startup), demo seed, admin bootstrap
  orders.ts     Order placement, provider forwarding, status/refund logic, sync, refill, cancel
  provider.ts   Client for upstream SMM API v2 providers
  auth.ts       Sessions, requireUser / requireAdmin, API key lookup
  settings.ts   Panel settings with defaults
  format.ts     Money formatting, statuses, charge calculation (shared with the browser)
components/     Shell/nav, order form, services table, import table, forms, toasts
```
