import Link from "next/link";
import { openTicket } from "@/app/actions/account";
import { ActionForm } from "@/components/ActionForm";
import { StatusBadge } from "@/components/StatusBadge";
import { Time } from "@/components/Time";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const metadata = { title: "Support" };

export default async function TicketsPage() {
  const user = await requireUser();
  const tickets = await query<{ id: number; subject: string; status: string; updated_at: Date }>(
    "SELECT id, subject, status, updated_at FROM tickets WHERE user_id = $1 ORDER BY (status = 'closed'), updated_at DESC LIMIT 100",
    [user.id]
  );
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Support</h1>
          <p>Questions about an order or payment? Open a ticket and we'll get back to you here.</p>
        </div>
      </div>
      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card card-body">
          <ActionForm action={openTicket} submit="Open ticket" pendingText="Sending…" resetOnOk>
            <div className="grid-form">
              <label className="field">
                <span>Topic</span>
                <select name="topic">
                  <option>Order</option>
                  <option>Payment</option>
                  <option>Refill</option>
                  <option>Cancellation</option>
                  <option>API</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="field">
                <span>
                  Order IDs <span className="hint">(optional)</span>
                </span>
                <input name="orders" placeholder="e.g. 1024, 1025" />
              </label>
            </div>
            <label className="field">
              <span>Message</span>
              <textarea name="message" rows={6} required minLength={5} maxLength={5000} />
            </label>
          </ActionForm>
        </div>
        <div className="card">
          <div className="card-head">
            <h2>Your tickets</h2>
          </div>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td className="mono muted">#{t.id}</td>
                    <td className="grow">
                      <Link href={`/dashboard/tickets/${t.id}`} style={{ fontWeight: 600 }}>
                        {t.subject}
                      </Link>
                      <div className="small muted">
                        Updated <Time value={t.updated_at} />
                      </div>
                    </td>
                    <td className="right">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!tickets.length && <div className="empty">No tickets yet.</div>}
          </div>
        </div>
      </div>
    </>
  );
}
