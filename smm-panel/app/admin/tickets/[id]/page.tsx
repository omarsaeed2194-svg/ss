import Link from "next/link";
import { notFound } from "next/navigation";
import { setTicketStatus, staffReply } from "@/app/actions/admin";
import { ActionForm } from "@/components/ActionForm";
import { RowAction } from "@/components/RowAction";
import { StatusBadge } from "@/components/StatusBadge";
import { TicketThread, type TicketMessage } from "@/components/TicketThread";
import { requireAdmin } from "@/lib/auth";
import { one, query } from "@/lib/db";
import { money } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export default async function AdminTicket(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await requireAdmin();
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const s = await getSettings();
  const t = await one<{ id: number; subject: string; status: string; user_id: number; username: string; email: string; balance: number }>(
    `SELECT t.id, t.subject, t.status, t.user_id, u.username, u.email, u.balance FROM tickets t JOIN users u ON u.id = t.user_id WHERE t.id = $1`,
    [id]
  );
  if (!t) notFound();
  const messages = await query<TicketMessage>(
    `SELECT m.id, m.body, m.is_staff, m.created_at, u.username AS author
     FROM ticket_messages m LEFT JOIN users u ON u.id = m.user_id WHERE m.ticket_id = $1 ORDER BY m.id`,
    [id]
  );
  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin/tickets" className="small">
            ← Tickets
          </Link>
          <h1 style={{ marginTop: 6 }}>
            #{t.id} · {t.subject}
          </h1>
          <p>
            From <Link href={`/admin/users/${t.user_id}`}>{t.username}</Link> ({t.email}) · balance {money(t.balance, s.currencySymbol)} ·{" "}
            <Link href={`/admin/orders?q=${encodeURIComponent(t.username)}`}>their orders</Link>
          </p>
        </div>
        <div className="row">
          <StatusBadge status={t.status} />
          {t.status !== "closed" ? (
            <RowAction action={setTicketStatus} fields={{ ticket: t.id, status: "closed" }} label="Close" />
          ) : (
            <RowAction action={setTicketStatus} fields={{ ticket: t.id, status: "open" }} label="Reopen" />
          )}
        </div>
      </div>
      <div className="card card-body stack">
        <TicketThread messages={messages} viewerIsStaff />
        <hr style={{ margin: 0 }} />
        <ActionForm action={staffReply} submit="Send reply" pendingText="Sending…" resetOnOk>
          <input type="hidden" name="ticket" value={t.id} />
          <label className="field">
            <span>Reply</span>
            <textarea name="message" rows={5} required maxLength={5000} />
          </label>
          <label className="check">
            <input type="checkbox" name="close" /> Close ticket after replying
          </label>
        </ActionForm>
      </div>
    </>
  );
}
