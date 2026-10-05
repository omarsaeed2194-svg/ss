import Link from "next/link";
import { cancelOrder, refillOrder } from "@/app/actions/orders";
import { pageOf, Pagination } from "@/components/Pagination";
import { RowAction } from "@/components/RowAction";
import { OrderLink } from "@/components/OrderLink";
import { StatusBadge } from "@/components/StatusBadge";
import { Time } from "@/components/Time";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { money, num, ORDER_STATUSES, STATUS_LABEL } from "@/lib/format";
import { syncOrders } from "@/lib/orders";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Orders" };
const PER_PAGE = 50;

interface Row {
  id: number;
  created_at: Date;
  link: string;
  charge: number;
  refunded: number;
  start_count: number | null;
  quantity: number;
  service_id: number | null;
  service_name: string;
  status: string;
  remains: number | null;
  cancel_requested: boolean;
  can_refill: boolean | null;
  can_cancel: boolean | null;
  provider_order_id: string | null;
  refill_status: string | null;
}

export default async function OrdersPage(props: { searchParams: Promise<Record<string, string | undefined>> }) {
  const searchParams = await props.searchParams;
  const user = await requireUser();
  const s = await getSettings();
  // Opportunistic refresh so statuses are current even without a cron job.
  await syncOrders({ userId: user.id, staleSeconds: 60, limit: 200, timeoutMs: 6000 }).catch(() => {});

  const page = pageOf(searchParams);
  const status = ORDER_STATUSES.includes(searchParams.status as never) ? searchParams.status! : "";
  const q = (searchParams.q ?? "").trim();
  const params: unknown[] = [user.id];
  let where = "o.user_id = $1";
  if (status) where += ` AND o.status = $${params.push(status)}`;
  if (q) where += ` AND (o.link ILIKE $${params.push(`%${q}%`)} OR o.id::text = $${params.push(q)})`;
  const rows = await query<Row>(
    `SELECT o.id, o.created_at, o.link, o.charge, o.refunded, o.start_count, o.quantity, o.service_id, o.service_name, o.status,
            o.remains, o.cancel_requested, o.provider_order_id, s.refill AS can_refill, s.cancel AS can_cancel,
            (SELECT r.status FROM refills r WHERE r.order_id = o.id ORDER BY r.id DESC LIMIT 1) AS refill_status
     FROM orders o LEFT JOIN services s ON s.id = o.service_id
     WHERE ${where} ORDER BY o.id DESC LIMIT ${PER_PAGE + 1} OFFSET ${(page - 1) * PER_PAGE}`,
    params
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Orders</h1>
          <p>Statuses update automatically.</p>
        </div>
        <form className="row">
          {status && <input type="hidden" name="status" value={status} />}
          <input className="input" name="q" defaultValue={q} placeholder="Search by order ID or link" style={{ width: 260 }} />
          <button className="btn">Search</button>
        </form>
      </div>
      <div className="card">
        <div className="card-head">
          <nav className="tabs">
            <Link href="/dashboard/orders" className={!status ? "active" : ""}>
              All
            </Link>
            {ORDER_STATUSES.map((st) => (
              <Link key={st} href={`/dashboard/orders?status=${st}`} className={status === st ? "active" : ""}>
                {STATUS_LABEL[st]}
              </Link>
            ))}
          </nav>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Link</th>
                <th className="right">Charge</th>
                <th className="right">Start count</th>
                <th className="right">Quantity</th>
                <th>Service</th>
                <th>Status</th>
                <th className="right">Remains</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, PER_PAGE).map((o) => (
                <tr key={o.id}>
                  <td className="mono">{o.id}</td>
                  <td className="small">
                    <Time value={o.created_at} />
                  </td>
                  <td className="link-cell">
                    <OrderLink link={o.link} />
                  </td>
                  <td className="right nowrap">
                    {money(o.charge, s.currencySymbol)}
                    {o.refunded > 0 && <div className="small muted">−{money(o.refunded, s.currencySymbol)} refunded</div>}
                  </td>
                  <td className="right">{num(o.start_count)}</td>
                  <td className="right">{num(o.quantity)}</td>
                  <td style={{ minWidth: 200 }}>
                    <span className="mono muted">{o.service_id ?? "—"}</span> {o.service_name}
                  </td>
                  <td>
                    <StatusBadge status={o.status} />
                    {o.cancel_requested && ["pending", "in_progress", "processing"].includes(o.status) && (
                      <div className="small muted">Cancel requested</div>
                    )}
                    {o.refill_status && <div className="small muted">Refill: {STATUS_LABEL[o.refill_status] ?? o.refill_status}</div>}
                  </td>
                  <td className="right">{num(o.remains)}</td>
                  <td className="nowrap">
                    <div className="row" style={{ gap: 6, flexWrap: "nowrap" }}>
                      {o.can_refill && (o.status === "completed" || o.status === "partial") && (
                        <RowAction action={refillOrder} fields={{ order: o.id }} label="Refill" />
                      )}
                      {["pending", "in_progress", "processing"].includes(o.status) &&
                        !o.cancel_requested &&
                        (o.can_cancel || (o.status === "pending" && !o.provider_order_id)) && (
                          <RowAction action={cancelOrder} fields={{ order: o.id }} label="Cancel" className="btn btn-sm btn-danger" confirm={`Cancel order #${o.id}?`} />
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <div className="empty">
              No orders yet. <Link href="/dashboard">Place your first order</Link>
            </div>
          )}
        </div>
        <Pagination page={page} hasNext={rows.length > PER_PAGE} params={searchParams} />
      </div>
    </>
  );
}
