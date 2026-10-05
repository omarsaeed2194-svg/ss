import Link from "next/link";
import { syncNow } from "@/app/actions/admin";
import { pageOf, Pagination } from "@/components/Pagination";
import { RowAction } from "@/components/RowAction";
import { OrderLink } from "@/components/OrderLink";
import { StatusBadge } from "@/components/StatusBadge";
import { Time } from "@/components/Time";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { money, num, ORDER_STATUSES, STATUS_LABEL } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Orders · Admin" };
const PER_PAGE = 50;

export default async function AdminOrders({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  await requireAdmin();
  const s = await getSettings();
  const page = pageOf(searchParams);
  const filter = searchParams.status ?? "";
  const q = (searchParams.q ?? "").trim();
  const params: unknown[] = [];
  const where: string[] = [];
  if (ORDER_STATUSES.includes(filter as never)) where.push(`o.status = $${params.push(filter)}`);
  if (filter === "failed") where.push("o.status = 'pending' AND o.provider_id IS NOT NULL AND o.provider_order_id IS NULL AND o.provider_error IS NOT NULL");
  if (filter === "manual") where.push("o.status IN ('pending', 'in_progress', 'processing') AND o.provider_id IS NULL");
  if (filter === "cancel") where.push("o.cancel_requested AND o.status IN ('pending', 'in_progress', 'processing')");
  if (q) {
    const p = params.push(`%${q}%`);
    const e = params.push(q);
    where.push(`(o.link ILIKE $${p} OR u.username ILIKE $${p} OR o.id::text = $${e} OR o.provider_order_id = $${e})`);
  }
  const rows = await query<{
    id: number;
    username: string;
    user_id: number;
    service_id: number | null;
    service_name: string;
    link: string;
    quantity: number;
    charge: number;
    cost: number | null;
    start_count: number | null;
    remains: number | null;
    status: string;
    provider_name: string | null;
    provider_order_id: string | null;
    provider_error: string | null;
    cancel_requested: boolean;
    created_at: Date;
  }>(
    `SELECT o.id, u.username, o.user_id, o.service_id, o.service_name, o.link, o.quantity, o.charge, o.cost, o.start_count,
            o.remains, o.status, p.name AS provider_name, o.provider_order_id, o.provider_error, o.cancel_requested, o.created_at
     FROM orders o JOIN users u ON u.id = o.user_id LEFT JOIN providers p ON p.id = o.provider_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY o.id DESC LIMIT ${PER_PAGE + 1} OFFSET ${(page - 1) * PER_PAGE}`,
    params
  );
  const tabs: [string, string][] = [
    ["", "All"],
    ...ORDER_STATUSES.map((st) => [st, STATUS_LABEL[st]] as [string, string]),
    ["failed", "Failed to send"],
    ["manual", "Manual to fulfil"],
    ["cancel", "Cancel requests"],
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Orders</h1>
        </div>
        <div className="row">
          <form className="row">
            {filter && <input type="hidden" name="status" value={filter} />}
            <input className="input" name="q" defaultValue={q} placeholder="ID, link, username, provider ID" style={{ width: 260 }} />
            <button className="btn">Search</button>
          </form>
          <RowAction action={syncNow} fields={{}} label="Sync statuses" />
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <nav className="tabs">
            {tabs.map(([k, label]) => (
              <Link key={k} href={k ? `/admin/orders?status=${k}` : "/admin/orders"} className={filter === k ? "active" : ""}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Service</th>
                <th>Link</th>
                <th className="right">Qty</th>
                <th className="right">Charge / cost</th>
                <th className="right">Start / remains</th>
                <th>Status</th>
                <th>Provider</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, PER_PAGE).map((o) => (
                <tr key={o.id}>
                  <td className="mono">
                    <Link href={`/admin/orders/${o.id}`}>{o.id}</Link>
                  </td>
                  <td>
                    <Link href={`/admin/users/${o.user_id}`}>{o.username}</Link>
                  </td>
                  <td style={{ minWidth: 180 }}>
                    <span className="mono muted">{o.service_id ?? "—"}</span> {o.service_name}
                  </td>
                  <td className="link-cell">
                    <OrderLink link={o.link} />
                  </td>
                  <td className="right">{num(o.quantity)}</td>
                  <td className="right nowrap">
                    {money(o.charge, s.currencySymbol)}
                    <div className="small muted">{o.cost == null ? "—" : money(o.cost, s.currencySymbol)}</div>
                  </td>
                  <td className="right nowrap">
                    {num(o.start_count)}
                    <div className="small muted">{num(o.remains)}</div>
                  </td>
                  <td>
                    <StatusBadge status={o.status} />
                    {o.cancel_requested && o.status !== "canceled" && <div className="small muted">Cancel requested</div>}
                  </td>
                  <td className="small" style={{ maxWidth: 220 }}>
                    {o.provider_name ? (
                      <>
                        {o.provider_name}
                        <div className="muted mono">{o.provider_order_id ?? "not sent"}</div>
                        {o.provider_error && !o.provider_order_id && <div style={{ color: "var(--danger)" }}>{o.provider_error}</div>}
                      </>
                    ) : (
                      <span className="muted">Manual</span>
                    )}
                  </td>
                  <td className="small">
                    <Time value={o.created_at} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <div className="empty">No orders found.</div>}
        </div>
        <Pagination page={page} hasNext={rows.length > PER_PAGE} params={searchParams} />
      </div>
    </>
  );
}
