import Link from "next/link";
import { deletePaymentMethod, reviewPayment, savePaymentMethod } from "@/app/actions/admin";
import { ActionForm } from "@/components/ActionForm";
import { Flash } from "@/components/Flash";
import { pageOf, Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { Time } from "@/components/Time";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { money } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Payments · Admin" };
const PER_PAGE = 50;

interface MethodRow {
  id: number;
  name: string;
  instructions: string;
  min_amount: number;
  bonus_percent: number;
  active: boolean;
  sort: number;
}

export default async function AdminPayments({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  await requireAdmin();
  const s = await getSettings();
  const page = pageOf(searchParams);
  const [pending, history, methods] = await Promise.all([
    query<{ id: number; user_id: number; username: string; method_name: string; amount: number; reference: string; created_at: Date }>(
      `SELECT p.id, p.user_id, u.username, p.method_name, p.amount, p.reference, p.created_at
       FROM payments p JOIN users u ON u.id = p.user_id WHERE p.status = 'pending' ORDER BY p.id`
    ),
    query<{ id: number; user_id: number; username: string; method_name: string; amount: number; bonus: number; reference: string; status: string; admin_note: string; updated_at: Date }>(
      `SELECT p.id, p.user_id, u.username, p.method_name, p.amount, p.bonus, p.reference, p.status, p.admin_note, p.updated_at
       FROM payments p JOIN users u ON u.id = p.user_id WHERE p.status <> 'pending'
       ORDER BY p.updated_at DESC LIMIT ${PER_PAGE + 1} OFFSET ${(page - 1) * PER_PAGE}`
    ),
    query<MethodRow>("SELECT * FROM payment_methods ORDER BY sort, id"),
  ]);
  const sym = s.currencySymbol;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Payments</h1>
          <p>Customers submit a payment with its reference; check it arrived, then approve to credit their balance.</p>
        </div>
      </div>
      <Flash searchParams={searchParams} />

      <div className="card">
        <div className="card-head">
          <h2>Waiting for review ({pending.length})</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Method / reference</th>
                <th className="right">Amount</th>
                <th>Submitted</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((p) => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td>
                    <Link href={`/admin/users/${p.user_id}`}>{p.username}</Link>
                  </td>
                  <td>
                    {p.method_name}
                    <div className="mono small break">{p.reference}</div>
                  </td>
                  <td className="right nowrap" style={{ fontWeight: 700 }}>
                    {money(p.amount, sym)}
                  </td>
                  <td className="small">
                    <Time value={p.created_at} />
                  </td>
                  <td style={{ minWidth: 300 }}>
                    <ActionForm action={reviewPayment} submit="Submit" className="stack-sm" feedback="toast">
                      <input type="hidden" name="id" value={p.id} />
                      <div className="row" style={{ gap: 6 }}>
                        <select name="decision" className="input" style={{ width: 120 }}>
                          <option value="approve">Approve</option>
                          <option value="reject">Reject</option>
                        </select>
                        <input name="amount" type="number" step="0.01" className="input" defaultValue={Number(p.amount)} style={{ width: 110 }} title="Amount actually received" />
                      </div>
                      <input name="note" className="input" placeholder="Note to customer (optional)" />
                    </ActionForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!pending.length && <div className="empty">Nothing to review.</div>}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Payment methods</h2>
          <span className="muted small">Shown on the customer “Add funds” page.</span>
        </div>
        <div className="card-body stack">
          {methods.map((m) => (
            <details key={m.id} className="card" style={{ boxShadow: "none" }}>
              <summary className="row-between" style={{ padding: "12px 16px", cursor: "pointer" }}>
                <span className="row">
                  <strong>{m.name}</strong>
                  {m.active ? <span className="badge badge-on">Active</span> : <span className="badge">Hidden</span>}
                  <span className="muted small">
                    min {money(m.min_amount, sym)}
                    {Number(m.bonus_percent) > 0 && ` · +${m.bonus_percent}% bonus`}
                  </span>
                </span>
                <span className="small">Edit</span>
              </summary>
              <div style={{ padding: "0 16px 16px" }} className="stack-sm">
                <MethodForm m={m} />
                <form action={deletePaymentMethod}>
                  <input type="hidden" name="id" value={m.id} />
                  <SubmitButton className="btn btn-sm btn-danger" confirm={`Delete ${m.name}?`}>
                    Delete method
                  </SubmitButton>
                </form>
              </div>
            </details>
          ))}
          <details className="card" style={{ boxShadow: "none" }} open={!methods.length}>
            <summary style={{ padding: "12px 16px", cursor: "pointer", fontWeight: 600, color: "var(--primary)" }}>+ Add payment method</summary>
            <div style={{ padding: "0 16px 16px" }}>
              <MethodForm />
            </div>
          </details>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>History</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Method / reference</th>
                <th className="right">Amount</th>
                <th>Status</th>
                <th>Processed</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, PER_PAGE).map((p) => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td>
                    <Link href={`/admin/users/${p.user_id}`}>{p.username}</Link>
                  </td>
                  <td>
                    {p.method_name}
                    <div className="mono small break">{p.reference}</div>
                  </td>
                  <td className="right nowrap">
                    {money(p.amount, sym)}
                    {p.bonus > 0 && <div className="small muted">+{money(p.bonus, sym)} bonus</div>}
                  </td>
                  <td>
                    <StatusBadge status={p.status} />
                    {p.admin_note && <div className="small muted">{p.admin_note}</div>}
                  </td>
                  <td className="small">
                    <Time value={p.updated_at} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!history.length && <div className="empty">No processed payments yet.</div>}
        </div>
        <Pagination page={page} hasNext={history.length > PER_PAGE} params={searchParams} />
      </div>
    </>
  );
}

function MethodForm({ m }: { m?: MethodRow }) {
  return (
    <form action={savePaymentMethod} className="stack-sm">
      {m && <input type="hidden" name="id" value={m.id} />}
      <div className="grid-form">
        <label className="field">
          <span>Name</span>
          <input name="name" defaultValue={m?.name} placeholder="e.g. USDT (TRC20)" required />
        </label>
        <label className="field">
          <span>Minimum amount</span>
          <input name="min_amount" type="number" step="0.01" min={0} defaultValue={m ? Number(m.min_amount) : 1} />
        </label>
        <label className="field">
          <span>Bonus %</span>
          <input name="bonus_percent" type="number" step="0.1" min={0} defaultValue={m ? Number(m.bonus_percent) : 0} />
        </label>
        <label className="field">
          <span>Sort</span>
          <input name="sort" type="number" defaultValue={m?.sort ?? 0} />
        </label>
      </div>
      <label className="field">
        <span>Instructions shown to the customer</span>
        <textarea name="instructions" rows={5} defaultValue={m?.instructions} placeholder="Wallet address / account details and what to put in the reference field" />
      </label>
      <div className="row">
        <label className="check">
          <input type="checkbox" name="active" defaultChecked={m?.active ?? true} /> Active
        </label>
        <SubmitButton className="btn btn-primary btn-sm">{m ? "Save method" : "Add method"}</SubmitButton>
      </div>
    </form>
  );
}
