import Link from "next/link";
import { syncNow } from "@/app/actions/admin";
import { RowAction } from "@/components/RowAction";
import { StatusBadge } from "@/components/StatusBadge";
import { Time } from "@/components/Time";
import { requireAdmin } from "@/lib/auth";
import { one, query, usingEmbeddedDb } from "@/lib/db";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/settings";
import { money, num } from "@/lib/format";

export const metadata = { title: "Admin" };

export default async function AdminHome() {
  await requireAdmin();
  const s = await getSettings();
  const [stats, providers, recent, checks] = await Promise.all([
    one<Record<string, number>>(
      `SELECT
         (SELECT count(*) FROM users) AS users,
         (SELECT count(*) FROM users WHERE created_at > now() - interval '24 hours') AS users_today,
         (SELECT count(*) FROM orders WHERE created_at > now() - interval '24 hours') AS orders_today,
         (SELECT COALESCE(sum(charge - refunded), 0) FROM orders WHERE created_at > now() - interval '24 hours') AS volume_today,
         (SELECT COALESCE(sum(charge - refunded), 0) FROM orders WHERE created_at > now() - interval '30 days') AS volume_30,
         (SELECT COALESCE(sum(CASE WHEN status = 'canceled' THEN 0 ELSE (charge - refunded)
                   - COALESCE(cost, 0) * CASE WHEN charge > 0 THEN (charge - refunded) / charge ELSE 1 END END), 0)
            FROM orders WHERE created_at > now() - interval '30 days') AS profit_30,
         (SELECT COALESCE(sum(amount), 0) FROM payments WHERE status = 'completed' AND updated_at > now() - interval '30 days') AS deposits_30,
         (SELECT COALESCE(sum(balance), 0) FROM users) AS balances,
         (SELECT count(*) FROM orders WHERE status IN ('pending', 'in_progress', 'processing')) AS active_orders,
         (SELECT count(*) FROM orders WHERE cancel_requested AND status IN ('pending', 'in_progress', 'processing')) AS cancel_requests`
    ),
    query<{ id: number; name: string; balance: number | null; currency: string | null; balance_checked_at: Date | null }>(
      "SELECT id, name, balance, currency, balance_checked_at FROM providers ORDER BY id"
    ),
    query<{ id: number; username: string; service_name: string; charge: number; status: string; created_at: Date }>(
      `SELECT o.id, u.username, o.service_name, o.charge, o.status, o.created_at
       FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.id DESC LIMIT 10`
    ),
    one<{ providers: number; demo: number; placeholder_method: number }>(
      `SELECT (SELECT count(*) FROM providers) AS providers,
              (SELECT count(*) FROM services WHERE description LIKE 'Demo service%') AS demo,
              (SELECT count(*) FROM payment_methods WHERE instructions LIKE '%XX00 0000%') AS placeholder_method`
    ),
  ]);
  const todo = [
    s.siteName === DEFAULT_SETTINGS.siteName && { text: "Name your panel and set your currency", href: "/admin/settings" },
    !checks?.providers && { text: "Connect a provider and import services", href: "/admin/providers" },
    !!checks?.demo && { text: `Remove the ${checks.demo} demo services`, href: "/admin/services" },
    !!checks?.placeholder_method && { text: "Replace the sample bank details in your payment methods", href: "/admin/payments" },
    !process.env.CRON_SECRET && { text: "Set CRON_SECRET and schedule /api/cron/sync (see README)", href: null },
    usingEmbeddedDb &&
      process.env.NODE_ENV === "production" && {
        text: "You're on the embedded database (./data/pglite): back that folder up, or set DATABASE_URL to a hosted Postgres",
        href: null,
      },
  ].filter(Boolean) as { text: string; href: string | null }[];
  const sym = s.currencySymbol;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Overview</h1>
          <p>Last 30 days unless noted.</p>
        </div>
        <RowAction action={syncNow} fields={{}} label="Sync order statuses now" />
      </div>

      {todo.length > 0 && (
        <div className="card">
          <div className="card-head">
            <h2>Finish setting up</h2>
          </div>
          <div className="card-body stack-sm">
            {todo.map((t) => (
              <div key={t.text} className="row">
                <span className="badge badge-pending">To do</span>
                {t.href ? <Link href={t.href}>{t.text}</Link> : <span>{t.text}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats">
        <Stat label="Order volume (24h)" value={money(stats?.volume_today, sym)} sub={`${num(stats?.orders_today)} orders`} />
        <Stat label="Order volume (30d)" value={money(stats?.volume_30, sym)} />
        <Stat label="Est. profit (30d)" value={money(stats?.profit_30, sym)} sub="Revenue minus provider cost" />
        <Stat label="Deposits (30d)" value={money(stats?.deposits_30, sym)} />
        <Stat label="Users" value={num(stats?.users)} sub={`${num(stats?.users_today)} new today`} />
        <Stat label="Customer balances" value={money(stats?.balances, sym)} sub="Owed in services" />
        <Stat label="Active orders" value={num(stats?.active_orders)} sub={stats?.cancel_requests ? `${stats.cancel_requests} cancel requests` : undefined} />
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-head">
            <h2>Recent orders</h2>
            <Link href="/admin/orders" className="small">
              All orders →
            </Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td className="mono">
                      <Link href={`/admin/orders/${o.id}`}>{o.id}</Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.username}</div>
                      <div className="small muted">{o.service_name}</div>
                    </td>
                    <td className="right nowrap">{money(o.charge, sym)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!recent.length && <div className="empty">No orders yet.</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h2>Provider balances</h2>
            <Link href="/admin/providers" className="small">
              Manage →
            </Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {providers.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/providers/${p.id}`} style={{ fontWeight: 600 }}>
                        {p.name}
                      </Link>
                      <div className="small muted">
                        Checked <Time value={p.balance_checked_at} />
                      </div>
                    </td>
                    <td className="right nowrap" style={{ fontWeight: 700 }}>
                      {p.balance == null ? "—" : `${Number(p.balance).toFixed(2)} ${p.currency ?? ""}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!providers.length && (
              <div className="empty">
                No providers yet. <Link href="/admin/providers">Connect one</Link> to automate orders.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}
