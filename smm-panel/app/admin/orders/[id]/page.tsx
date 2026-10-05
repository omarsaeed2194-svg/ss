import Link from "next/link";
import { notFound } from "next/navigation";
import { resendOrder, updateOrder } from "@/app/actions/admin";
import { ActionForm } from "@/components/ActionForm";
import { OrderLink } from "@/components/OrderLink";
import { RowAction } from "@/components/RowAction";
import { StatusBadge } from "@/components/StatusBadge";
import { Time } from "@/components/Time";
import { requireAdmin } from "@/lib/auth";
import { one, query } from "@/lib/db";
import { money, num, ORDER_STATUSES, SERVICE_TYPE_LABEL, STATUS_LABEL, type ServiceType } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export default async function AdminOrder(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await requireAdmin();
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const s = await getSettings();
  const o = await one<{
    id: number;
    user_id: number;
    username: string;
    service_id: number | null;
    service_name: string;
    service_type: ServiceType;
    link: string;
    quantity: number;
    comments: string | null;
    charge: number;
    cost: number | null;
    refunded: number;
    status: string;
    start_count: number | null;
    remains: number | null;
    provider_id: number | null;
    provider_name: string | null;
    provider_service_id: string | null;
    provider_order_id: string | null;
    provider_error: string | null;
    cancel_requested: boolean;
    source: string;
    created_at: Date;
    updated_at: Date;
    synced_at: Date | null;
  }>(
    `SELECT o.*, u.username, p.name AS provider_name FROM orders o JOIN users u ON u.id = o.user_id
     LEFT JOIN providers p ON p.id = o.provider_id WHERE o.id = $1`,
    [id]
  );
  if (!o) notFound();
  const refills = await query<{ id: number; status: string; provider_refill_id: string | null; provider_error: string | null; created_at: Date }>(
    "SELECT id, status, provider_refill_id, provider_error, created_at FROM refills WHERE order_id = $1 ORDER BY id DESC",
    [id]
  );
  const final = o.status === "partial" || o.status === "canceled";
  const canResend = o.status === "pending" && o.provider_id && !o.provider_order_id;
  const sym = s.currencySymbol;

  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin/orders" className="small">
            ← Orders
          </Link>
          <h1 style={{ marginTop: 6 }}>Order #{o.id}</h1>
        </div>
        <StatusBadge status={o.status} />
      </div>
      {o.provider_error && !o.provider_order_id && (
        <div className="alert alert-error">
          Provider rejected this order: {o.provider_error}
          {"\n"}Fix the cause (e.g. top up the provider balance) and resend it, or cancel it to refund the customer.
        </div>
      )}
      {o.cancel_requested && !final && <div className="alert alert-warning">The customer asked to cancel this order.</div>}
      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card card-body">
          <table className="table">
            <tbody>
              <Row k="Customer">
                <Link href={`/admin/users/${o.user_id}`}>{o.username}</Link>
              </Row>
              <Row k="Service">
                <span className="mono muted">{o.service_id ?? "deleted"}</span> {o.service_name}
                {o.service_id && (
                  <>
                    {" "}
                    · <Link href={`/admin/services/${o.service_id}`}>edit</Link>
                  </>
                )}
              </Row>
              <Row k="Type">{SERVICE_TYPE_LABEL[o.service_type]}</Row>
              <Row k="Link">
                <OrderLink link={o.link} />
              </Row>
              <Row k="Quantity">{num(o.quantity)}</Row>
              {o.comments && (
                <Row k="Comments">
                  <div className="desc-box">{o.comments}</div>
                </Row>
              )}
              <Row k="Charge">{money(o.charge, sym)}</Row>
              <Row k="Refunded">{money(o.refunded, sym)}</Row>
              <Row k="Cost">{o.cost == null ? "—" : money(o.cost, sym)}</Row>
              <Row k="Start count / remains">
                {num(o.start_count)} / {num(o.remains)}
              </Row>
              <Row k="Provider">
                {o.provider_name ? (
                  <>
                    {o.provider_name} · service <span className="mono">{o.provider_service_id}</span> · order{" "}
                    <span className="mono">{o.provider_order_id ?? "not sent"}</span>
                  </>
                ) : (
                  "Manual (fulfilled by you)"
                )}
              </Row>
              <Row k="Placed via">{o.source}</Row>
              <Row k="Created">
                <Time value={o.created_at} />
              </Row>
              <Row k="Last synced">
                <Time value={o.synced_at} />
              </Row>
            </tbody>
          </table>
        </div>
        <div className="stack">
          <div className="card">
            <div className="card-head">
              <h2>Update order</h2>
              {canResend && <RowAction action={resendOrder} fields={{ id: o.id }} label="Resend to provider" className="btn btn-sm btn-primary" />}
            </div>
            <div className="card-body">
              {final ? (
                <p className="muted">This order is {STATUS_LABEL[o.status].toLowerCase()} and has been refunded — it can no longer be changed.</p>
              ) : (
                <ActionForm action={updateOrder} submit="Save" feedback="toast">
                  <input type="hidden" name="id" value={o.id} />
                  <label className="field">
                    <span>Status</span>
                    <select name="status" defaultValue={o.status}>
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {STATUS_LABEL[st]}
                        </option>
                      ))}
                    </select>
                    <span className="hint">Canceled refunds the full charge. Partial refunds the share of “remains”.</span>
                  </label>
                  <div className="grid-form">
                    <label className="field">
                      <span>Start count</span>
                      <input name="start_count" type="number" defaultValue={o.start_count ?? ""} />
                    </label>
                    <label className="field">
                      <span>Remains</span>
                      <input name="remains" type="number" min={0} max={o.quantity} defaultValue={o.remains ?? ""} />
                    </label>
                  </div>
                </ActionForm>
              )}
            </div>
          </div>
          {refills.length > 0 && (
            <div className="card">
              <div className="card-head">
                <h2>Refills</h2>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <tbody>
                    {refills.map((r) => (
                      <tr key={r.id}>
                        <td className="mono">#{r.id}</td>
                        <td>
                          <StatusBadge status={r.status} />
                          {r.provider_error && <div className="small" style={{ color: "var(--danger)" }}>{r.provider_error}</div>}
                        </td>
                        <td className="mono small">{r.provider_refill_id ?? "—"}</td>
                        <td className="small">
                          <Time value={r.created_at} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="muted nowrap" style={{ width: 170 }}>
        {k}
      </td>
      <td>{children}</td>
    </tr>
  );
}
