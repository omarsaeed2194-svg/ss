import Link from "next/link";
import { pageOf, Pagination } from "@/components/Pagination";
import { Time } from "@/components/Time";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { money, num } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Users · Admin" };
const PER_PAGE = 50;

export default async function AdminUsers(props: { searchParams: Promise<Record<string, string | undefined>> }) {
  const searchParams = await props.searchParams;
  await requireAdmin();
  const s = await getSettings();
  const page = pageOf(searchParams);
  const q = (searchParams.q ?? "").trim();
  const params: unknown[] = [];
  const where = q ? `WHERE u.username ILIKE $${params.push(`%${q}%`)} OR u.email ILIKE $1 OR u.id::text = $${params.push(q)}` : "";
  const rows = await query<{
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    balance: number;
    spent: number;
    orders: number;
    created_at: Date;
    last_login_at: Date | null;
  }>(
    `SELECT u.id, u.username, u.email, u.role, u.status, u.balance, u.spent, u.created_at, u.last_login_at,
            (SELECT count(*) FROM orders o WHERE o.user_id = u.id) AS orders
     FROM users u ${where} ORDER BY u.id DESC LIMIT ${PER_PAGE + 1} OFFSET ${(page - 1) * PER_PAGE}`,
    params
  );
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Users</h1>
        </div>
        <form className="row">
          <input className="input" name="q" defaultValue={q} placeholder="Username, email or ID" style={{ width: 260 }} />
          <button className="btn">Search</button>
        </form>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th className="right">Balance</th>
                <th className="right">Spent</th>
                <th className="right">Orders</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last login</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, PER_PAGE).map((u) => (
                <tr key={u.id}>
                  <td className="mono">{u.id}</td>
                  <td>
                    <Link href={`/admin/users/${u.id}`} style={{ fontWeight: 600 }}>
                      {u.username}
                    </Link>{" "}
                    {u.role === "admin" && <span className="badge badge-primary">Admin</span>}
                    <div className="small muted">{u.email}</div>
                  </td>
                  <td className="right nowrap">{money(u.balance, s.currencySymbol)}</td>
                  <td className="right nowrap">{money(u.spent, s.currencySymbol)}</td>
                  <td className="right">{num(u.orders)}</td>
                  <td>{u.status === "active" ? <span className="badge badge-on">Active</span> : <span className="badge badge-failed">Suspended</span>}</td>
                  <td className="small">
                    <Time value={u.created_at} dateOnly />
                  </td>
                  <td className="small">
                    <Time value={u.last_login_at} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <div className="empty">No users found.</div>}
        </div>
        <Pagination page={page} hasNext={rows.length > PER_PAGE} params={searchParams} />
      </div>
    </>
  );
}
