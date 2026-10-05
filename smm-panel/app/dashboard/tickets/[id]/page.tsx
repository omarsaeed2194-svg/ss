import Link from "next/link";
import { notFound } from "next/navigation";
import { closeTicket, replyTicket } from "@/app/actions/account";
import { ActionForm } from "@/components/ActionForm";
import { RowAction } from "@/components/RowAction";
import { StatusBadge } from "@/components/StatusBadge";
import { TicketThread, type TicketMessage } from "@/components/TicketThread";
import { requireUser } from "@/lib/auth";
import { one, query } from "@/lib/db";

export default async function TicketPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const ticket = await one<{ id: number; subject: string; status: string }>(
    "SELECT id, subject, status FROM tickets WHERE id = $1 AND user_id = $2",
    [id, user.id]
  );
  if (!ticket) notFound();
  const messages = await query<TicketMessage>(
    `SELECT m.id, m.body, m.is_staff, m.created_at, u.username AS author
     FROM ticket_messages m LEFT JOIN users u ON u.id = m.user_id WHERE m.ticket_id = $1 ORDER BY m.id`,
    [id]
  );
  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/dashboard/tickets" className="small">
            ← All tickets
          </Link>
          <h1 style={{ marginTop: 6 }}>
            #{ticket.id} · {ticket.subject}
          </h1>
        </div>
        <div className="row">
          <StatusBadge status={ticket.status} />
          {ticket.status !== "closed" && <RowAction action={closeTicket} fields={{ ticket: ticket.id }} label="Close ticket" />}
        </div>
      </div>
      <div className="card card-body stack">
        <TicketThread messages={messages} viewerIsStaff={false} />
        <hr style={{ margin: 0 }} />
        <ActionForm action={replyTicket} submit={ticket.status === "closed" ? "Reopen with reply" : "Send reply"} pendingText="Sending…" resetOnOk>
          <input type="hidden" name="ticket" value={ticket.id} />
          <label className="field">
            <span>Reply</span>
            <textarea name="message" rows={4} required maxLength={5000} />
          </label>
        </ActionForm>
      </div>
    </>
  );
}
