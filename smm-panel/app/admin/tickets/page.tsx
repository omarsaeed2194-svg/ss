import Link from "next/link";
import { pageOf, Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { Time } from "@/components/Time";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export const metadata = { title: "Tickets · Admin" };
const PER_PAGE = 50;

export default async function AdminTickets(props: { searchParams: Promise<Record<string, string | undefined>> }) {
  const searchParams = await props.searchParams;
  await requireAdmin();
  const page = pageOf(searchParams);
  const status = ["open", "answered", "closed"].includes(searchParams.status ?? "") ? searchParams.status! : "";
  const params: unknown[] = [];
  const rows = await query<{ id: number; subject: string; status: string; username: string; user_id: number; updated_at: Date; messages: number }>(
    `SELECT t.id, t.subject, t.status, u.username, t.user_id, t.updated_at,
            (SELECT count(*) FROM ticket_messages m WHERE m.ticket_id = t.id) AS messages
     FROM tickets t JOIN users u ON u.id = t.user_id
     ${status ? `WHERE t.status = $${params.push(status)}` : ""}
     ORDER BY (t.status = 'open') DESC, t.updated_at DESC LIMIT ${PER_PAGE + 1} OFFSET ${(page - 1) * PER_PAGE}`,
    params
  );
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Tickets</h1>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <nav className="tabs">
            {[
              ["", "All"],
              ["open", "Open"],
              ["answered", "Answered"],
              ["closed", "Closed"],
            ].map(([k, l]) => (
              <Link key={k} href={k ? `/admin/tickets?status=${k}` : "/admin/tickets"} className={status === k ? "active" : ""}>
                {l}
              </Link>
            ))}
          </nav>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>User</th>
                <th className="right">Messages</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, PER_PAGE).map((t) => (
                <tr key={t.id}>
                  <td className="mono">{t.id}</td>
                  <td>
                    <Link href={`/admin/tickets/${t.id}`} style={{ fontWeight: 600 }}>
                      {t.subject}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/admin/users/${t.user_id}`}>{t.username}</Link>
                  </td>
                  <td className="right">{t.messages}</td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="small">
                    <Time value={t.updated_at} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <div className="empty">No tickets.</div>}
        </div>
        <Pagination page={page} hasNext={rows.length > PER_PAGE} params={searchParams} />
      </div>
    </>
  );
}
