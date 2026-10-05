import Link from "next/link";
import { saveProvider } from "@/app/actions/admin";
import { ActionForm } from "@/components/ActionForm";
import { Flash } from "@/components/Flash";
import { Time } from "@/components/Time";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { num } from "@/lib/format";

export const metadata = { title: "Providers · Admin" };

export default async function AdminProviders({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  await requireAdmin();
  const providers = await query<{
    id: number;
    name: string;
    api_url: string;
    balance: number | null;
    currency: string | null;
    balance_checked_at: Date | null;
    services: number;
  }>(
    `SELECT p.id, p.name, p.api_url, p.balance, p.currency, p.balance_checked_at,
            (SELECT count(*) FROM services s WHERE s.provider_id = p.id) AS services
     FROM providers p ORDER BY p.id`
  );
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Providers</h1>
          <p>Connect any panel that offers the standard SMM API v2 — orders for its services are forwarded automatically.</p>
        </div>
      </div>
      <Flash searchParams={searchParams} />
      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-head">
            <h2>Connected providers</h2>
          </div>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {providers.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/providers/${p.id}`} style={{ fontWeight: 600 }}>
                        {p.name}
                      </Link>
                      <div className="small muted break">{p.api_url}</div>
                    </td>
                    <td className="right nowrap">
                      <strong>{p.balance == null ? "—" : `${Number(p.balance).toFixed(2)} ${p.currency ?? ""}`}</strong>
                      <div className="small muted">
                        <Time value={p.balance_checked_at} />
                      </div>
                    </td>
                    <td className="right nowrap">{num(p.services)} services</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!providers.length && <div className="empty">No providers yet.</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h2>Add provider</h2>
          </div>
          <div className="card-body">
            <ActionForm action={saveProvider} submit="Connect provider" pendingText="Checking connection…">
              <label className="field">
                <span>Name</span>
                <input name="name" placeholder="e.g. MainProvider" required />
              </label>
              <label className="field">
                <span>API URL</span>
                <input name="api_url" type="url" placeholder="https://provider.com/api/v2" required />
              </label>
              <label className="field">
                <span>API key</span>
                <input name="api_key" required autoComplete="off" />
                <span className="hint">From the API page of your account on the provider's panel.</span>
              </label>
              <label className="field">
                <span>Exchange rate</span>
                <input name="exchange_rate" type="number" step="0.000001" min={0} defaultValue={1} />
                <span className="hint">1 unit of the provider's currency in your panel's currency. Leave 1 if both use the same currency.</span>
              </label>
            </ActionForm>
          </div>
        </div>
      </div>
    </>
  );
}
