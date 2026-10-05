import { FundsForm, type Method } from "@/components/FundsForm";
import { StatusBadge } from "@/components/StatusBadge";
import { Time } from "@/components/Time";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { money } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Add funds" };

const TX_LABEL: Record<string, string> = { deposit: "Deposit", bonus: "Bonus", order: "Order", refund: "Refund", adjustment: "Adjustment" };

export default async function FundsPage() {
  const user = await requireUser();
  const s = await getSettings();
  const [methods, payments, txs] = await Promise.all([
    query<Method>("SELECT id, name, instructions, min_amount, bonus_percent FROM payment_methods WHERE active ORDER BY sort, id"),
    query<{ id: number; created_at: Date; method_name: string; amount: number; bonus: number; reference: string; status: string; admin_note: string }>(
      "SELECT id, created_at, method_name, amount, bonus, reference, status, admin_note FROM payments WHERE user_id = $1 ORDER BY id DESC LIMIT 25",
      [user.id]
    ),
    query<{ id: number; created_at: Date; type: string; amount: number; balance_after: number; note: string }>(
      "SELECT id, created_at, type, amount, balance_after, note FROM transactions WHERE user_id = $1 ORDER BY id DESC LIMIT 50",
      [user.id]
    ),
  ]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Add funds</h1>
          <p>
            Current balance: <strong>{money(user.balance, s.currencySymbol)}</strong>
          </p>
        </div>
      </div>
      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card card-body">
          <FundsForm methods={methods.map((m) => ({ ...m, min_amount: Number(m.min_amount), bonus_percent: Number(m.bonus_percent) }))} symbol={s.currencySymbol} />
        </div>
        <div className="card">
          <div className="card-head">
            <h2>Payment history</h2>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th className="right">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{p.id}</td>
                    <td className="small">
                      <Time value={p.created_at} />
                    </td>
                    <td>
                      {p.method_name}
                      <div className="small muted break">{p.reference}</div>
                    </td>
                    <td className="right nowrap">
                      {money(p.amount, s.currencySymbol)}
                      {p.bonus > 0 && <div className="small muted">+{money(p.bonus, s.currencySymbol)} bonus</div>}
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                      {p.admin_note && <div className="small muted">{p.admin_note}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!payments.length && <div className="empty">No payments yet.</div>}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <h2>Balance history</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Details</th>
                <th className="right">Amount</th>
                <th className="right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id}>
                  <td className="small">
                    <Time value={t.created_at} />
                  </td>
                  <td>{TX_LABEL[t.type] ?? t.type}</td>
                  <td className="muted">{t.note}</td>
                  <td className="right nowrap" style={{ color: t.amount < 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
                    {t.amount > 0 ? "+" : ""}
                    {money(t.amount, s.currencySymbol)}
                  </td>
                  <td className="right nowrap">{money(t.balance_after, s.currencySymbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!txs.length && <div className="empty">No balance changes yet.</div>}
        </div>
      </div>
    </>
  );
}
