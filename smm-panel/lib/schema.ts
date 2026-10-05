import type { Q } from "./db";
import { hashPassword, newApiKey } from "./crypto";

// Idempotent: runs on every cold start. Add new columns with
// `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` at the end rather than editing
// existing CREATE statements, so already-deployed databases pick them up.
export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    balance NUMERIC(18,6) NOT NULL DEFAULT 0,
    spent NUMERIC(18,6) NOT NULL DEFAULT 0,
    api_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS providers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    api_url TEXT NOT NULL,
    api_key TEXT NOT NULL,
    exchange_rate NUMERIC(18,6) NOT NULL DEFAULT 1,
    balance NUMERIC(18,6),
    currency TEXT,
    balance_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sort INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true
  )`,
  `CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT 'default',
    rate NUMERIC(18,6) NOT NULL,
    min INT NOT NULL DEFAULT 10,
    max INT NOT NULL DEFAULT 10000,
    refill BOOLEAN NOT NULL DEFAULT false,
    cancel BOOLEAN NOT NULL DEFAULT false,
    provider_id INT REFERENCES providers(id) ON DELETE SET NULL,
    provider_service_id TEXT,
    provider_rate NUMERIC(18,6),
    active BOOLEAN NOT NULL DEFAULT true,
    sort INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    service_type TEXT NOT NULL DEFAULT 'default',
    link TEXT NOT NULL,
    quantity INT NOT NULL,
    comments TEXT,
    charge NUMERIC(18,6) NOT NULL,
    cost NUMERIC(18,6),
    status TEXT NOT NULL DEFAULT 'pending',
    start_count INT,
    remains INT,
    refunded NUMERIC(18,6) NOT NULL DEFAULT 0,
    provider_id INT REFERENCES providers(id) ON DELETE SET NULL,
    provider_service_id TEXT,
    provider_order_id TEXT,
    provider_error TEXT,
    cancel_requested BOOLEAN NOT NULL DEFAULT false,
    source TEXT NOT NULL DEFAULT 'web',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    synced_at TIMESTAMPTZ
  )`,
  `CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id, id DESC)`,
  `CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status)`,
  `CREATE TABLE IF NOT EXISTS refills (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    provider_refill_id TEXT,
    provider_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    instructions TEXT NOT NULL DEFAULT '',
    min_amount NUMERIC(18,6) NOT NULL DEFAULT 1,
    bonus_percent NUMERIC(6,2) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    sort INT NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method_id INT REFERENCES payment_methods(id) ON DELETE SET NULL,
    method_name TEXT NOT NULL,
    amount NUMERIC(18,6) NOT NULL,
    bonus NUMERIC(18,6) NOT NULL DEFAULT 0,
    reference TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    admin_note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount NUMERIC(18,6) NOT NULL,
    balance_after NUMERIC(18,6) NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    order_id INT,
    payment_id INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS transactions_user_idx ON transactions (user_id, id DESC)`,
  `CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    is_staff BOOLEAN NOT NULL DEFAULT false,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
];

const DEMO_CATALOG: { category: string; services: [string, number, number, number, string?][] }[] = [
  {
    category: "Instagram Followers",
    services: [
      ["Instagram Followers — Mixed quality, no refill", 1.2, 50, 20000],
      ["Instagram Followers — High quality, 30-day refill", 2.9, 100, 50000, "refill"],
    ],
  },
  {
    category: "Instagram Likes & Views",
    services: [
      ["Instagram Likes — Real-looking accounts", 0.6, 20, 30000],
      ["Instagram Reel Views — Instant", 0.05, 100, 1000000],
    ],
  },
  {
    category: "TikTok",
    services: [
      ["TikTok Followers — 30-day refill", 3.5, 100, 30000, "refill"],
      ["TikTok Views — Fast", 0.04, 100, 5000000],
      ["TikTok Likes", 0.9, 50, 50000],
    ],
  },
  {
    category: "YouTube",
    services: [
      ["YouTube Views — Non-drop, lifetime refill", 1.9, 500, 1000000, "refill"],
      ["YouTube Subscribers — 30-day refill", 18, 50, 5000, "refill"],
      ["YouTube Likes", 2.5, 20, 20000],
    ],
  },
  {
    category: "Telegram",
    services: [
      ["Telegram Channel Members", 1.5, 100, 50000],
      ["Telegram Post Views — Last 5 posts", 0.3, 100, 100000],
    ],
  },
  {
    category: "X (Twitter) & Facebook",
    services: [
      ["X (Twitter) Followers", 4.2, 100, 20000],
      ["Facebook Page Likes + Followers", 2.4, 100, 50000],
    ],
  },
];

async function getSetting(q: Q, key: string) {
  const { rows } = await q.query<{ value: string }>("SELECT value FROM settings WHERE key = $1", [key]);
  return rows[0]?.value ?? null;
}

export async function seed(q: Q) {
  // Demo catalog + a sample payment method, once per database (deleting them later doesn't bring them back).
  if (!(await getSetting(q, "seeded"))) {
    for (const [ci, group] of DEMO_CATALOG.entries()) {
      const { rows } = await q.query<{ id: number }>("INSERT INTO categories (name, sort) VALUES ($1, $2) RETURNING id", [
        group.category,
        ci,
      ]);
      for (const [si, [name, rate, min, max, flag]] of group.services.entries()) {
        await q.query(
          `INSERT INTO services (category_id, name, description, rate, min, max, refill, sort)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            rows[0].id,
            name,
            "Demo service — fulfilled manually from the admin until you connect a provider.\nStart: 0–6 hours\nSpeed: up to 10K/day",
            rate,
            min,
            max,
            flag === "refill",
            si,
          ]
        );
      }
    }
    await q.query("INSERT INTO payment_methods (name, instructions, min_amount) VALUES ($1, $2, $3)", [
      "Bank transfer",
      "Send the amount to:\nBank: Your Bank Name\nAccount name: Your Business\nIBAN: XX00 0000 0000 0000 0000 0000\n\nThen paste the transfer reference below. Funds are added as soon as we confirm the payment.",
      5,
    ]);
    await q.query("INSERT INTO settings (key, value) VALUES ('seeded', $1) ON CONFLICT (key) DO NOTHING", [
      new Date().toISOString(),
    ]);
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const { rows } = await q.query<{ id: number; role: string }>("SELECT id, role FROM users WHERE email = $1", [email]);
    if (!rows[0]) {
      let username = "admin";
      const taken = await q.query("SELECT 1 FROM users WHERE lower(username) = $1", [username]);
      if (taken.rows.length) username = `admin${Date.now().toString(36).slice(-4)}`;
      await q.query(
        `INSERT INTO users (username, email, password_hash, role, api_key) VALUES ($1, $2, $3, 'admin', $4)
         ON CONFLICT DO NOTHING`,
        [username, email, await hashPassword(password), newApiKey()]
      );
    } else if (rows[0].role !== "admin") {
      // Never promote: sign-up doesn't verify emails, so whoever registered this
      // address first may not be the owner of ADMIN_EMAIL.
      console.warn(
        "ADMIN_EMAIL belongs to an existing customer account, which was NOT made admin. " +
          "Set ADMIN_EMAIL to an address that isn't registered yet."
      );
    }
  }
}
