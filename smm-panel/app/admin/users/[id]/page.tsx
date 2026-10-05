import Link from "next/link";
import { notFound } from "next/navigation";
import { adjustBalance, resetUserPassword, setUserRole, setUserStatus } from "@/app/actions/admin";
import { ActionForm } from "@/components/ActionForm";
import { RowAction } from "@/components/RowAction";
import { StatusBadge } from "@/components/StatusBadge";
import { Time } from "@/components/Time";
import { requireAdmin } from "@/lib/auth";
import { one, query } from "@/lib/db";
import { money } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export default async function AdminUser({ params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const s = await getSettings();
  const u = await one<{
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    balance: number;
    spent: number;
    api_key: string;
    created_at: Date;
    last_login_at: Date | null;
  }>("SELECT id, username, email, role, status, balance, spent, api_key, created_at, last_login_at FROM users WHERE id = $1", [id]);
  if (!u) notFound();
  const [orders, txs] = await Promise.all([
    query<{ id: number; service_name: string; charge: number; status: string; created_at: Date }>(
      "SELECT id, service_name, charge, status, created_at FROM orders WHERE user_id = $1 ORDER BY id DESC LIMIT 15",
      [id]
    ),
    query<{ id: number; type: string; amount: number; balance_after: number; note: string; created_at: Date }>(
      "SELECT id, type, amount, balance_after, note, created_at FROM transactions WHERE user_id = $1 ORDER BY id DESC LIMIT 15",
      [id]
    ),
  ]);
  const sym = s.currencySymbol;
  const self = u.id === admin.id;

  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin/users" className="small">
            ← Users
          </Link>
          <h1 style={{ marginTop: 6 }}>
            {u.username} {u.role === "admin" && <span className="badge badge-primary">Admin</span>}{" "}
            {u.status !== "active" && <span className="badge badge-failed">Suspended</span>}
          </h1>
          <p>
            {u.email} · joined <Time value={u.created_at} dateOnly /> · last login <Time value={u.last_login_at} />
          </p>
        </div>
        {!self && (
          <div className="row">
            <RowAction
              action={setUserStatus}
              fields={{ id: u.id, status: u.status === "active" ? "suspended" : "active" }}
              label={u.status === "active" ? "Suspend" : "Reactivate"}
              className={`btn btn-sm ${u.status === "active" ? "btn-danger" : ""}`}
              confirm={u.status === "active" ? `Suspend ${u.username}? They'll be signed out and their API key stops working.` : undefined}
            />
            <RowAction
              action={setUserRole}
              fields={{ id: u.id, role: u.role === "admin" ? "user" : "admin" }}
              label={u.role === "admin" ? "Remove admin" : "Make admin"}
              confirm={u.role === "admin" ? undefined : `Give ${u.username} full admin access?`}
            />
          </div>
        )}
      </div>
      <div className="stats">
        <div className="card stat">
          <div className="label">Balance</div>
          <div className="value">{money(u.balance, sym)}</div>
        </div>
        <div className="card stat">
          <div className="label">Spent</div>
          <div className="value">{money(u.spent, sym)}</div>
        </div>
      </div>
      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-head">
            <h2>Adjust balance</h2>
          </div>
          <div className="card-body">
            <ActionForm action={adjustBalance} submit="Apply" resetOnOk>
              <input type="hidden" name="id" value={u.id} />
              <div className="grid-form">
                <label className="field">
                  <span>Amount</span>
                  <input name="amount" type="number" step="0.0001" required />
                  <span className="hint">Negative to deduct.</span>
                </label>
                <label className="field">
                  <span>Note (shown to user)</span>
                  <input name="note" placeholder="e.g. Manual deposit via USDT" />
                </label>
              </div>
            </ActionForm>
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h2>Set a new password</h2>
          </div>
          <div className="card-body">
            <ActionForm action={resetUserPassword} submit="Set password" resetOnOk>
              <input type="hidden" name="id" value={u.id} />
              <label className="field">
                <span>New password</span>
                <input name="password" type="text" minLength={8} required autoComplete="off" />
                <span className="hint">The user is signed out everywhere; send them the new password securely.</span>
              </label>
            </ActionForm>
          </div>
        </div>
      </div>
      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-head">
            <h2>Recent orders</h2>
            <Link className="small" href={`/admin/orders?q=${encodeURIComponent(u.username)}`}>
              All →
            </Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="mono">
                      <Link href={`/admin/orders/${o.id}`}>{o.id}</Link>
                    </td>
                    <td>{o.service_name}</td>
                    <td className="right nowrap">{money(o.charge, sym)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!orders.length && <div className="empty">No orders.</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h2>Balance history</h2>
          </div>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {txs.map((t) => (
                  <tr key={t.id}>
                    <td className="small">
                      <Time value={t.created_at} />
                    </td>
                    <td className="small muted">{t.note}</td>
                    <td className="right nowrap" style={{ color: t.amount < 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
                      {t.amount > 0 ? "+" : ""}
                      {money(t.amount, sym)}
                    </td>
                    <td className="right nowrap muted">{money(t.balance_after, sym)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!txs.length && <div className="empty">No balance changes.</div>}
          </div>
        </div>
      </div>
    </>
  );
}
