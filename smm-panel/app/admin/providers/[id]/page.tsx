import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProvider, importServices, saveProvider, syncProviderServices } from "@/app/actions/admin";
import { ActionForm } from "@/components/ActionForm";
import { Flash } from "@/components/Flash";
import { ImportTable, type ImportRow } from "@/components/ImportTable";
import { SubmitButton } from "@/components/SubmitButton";
import { requireAdmin } from "@/lib/auth";
import { one, query } from "@/lib/db";
import { round6 } from "@/lib/format";
import { fetchProviderServices, mapProviderType } from "@/lib/provider";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Provider · Admin" };

export default async function AdminProvider({ params, searchParams }: { params: { id: string }; searchParams: Record<string, string | undefined> }) {
  await requireAdmin();
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const s = await getSettings();
  const p = await one<{ id: number; name: string; api_url: string; api_key: string; exchange_rate: number; balance: number | null; currency: string | null }>(
    "SELECT id, name, api_url, api_key, exchange_rate, balance, currency FROM providers WHERE id = $1",
    [id]
  );
  if (!p) notFound();
  const imported = new Set(
    (await query<{ provider_service_id: string }>("SELECT provider_service_id FROM services WHERE provider_id = $1", [id])).map((r) => r.provider_service_id)
  );
  let rows: ImportRow[] = [];
  let loadError = "";
  try {
    rows = (await fetchProviderServices(p)).map((ps) => ({
      id: String(ps.service),
      name: String(ps.name),
      category: String(ps.category || "Imported"),
      type: String(ps.type || "Default"),
      supported: mapProviderType(ps.type) !== null,
      cost: round6(Number(ps.rate) * Number(p.exchange_rate || 1)),
      min: Number(ps.min),
      max: Number(ps.max),
      refill: !!ps.refill,
      imported: imported.has(String(ps.service)),
    }));
  } catch (e) {
    loadError = (e as Error).message;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin/providers" className="small">
            ← Providers
          </Link>
          <h1 style={{ marginTop: 6 }}>{p.name}</h1>
          <p>
            Balance: <strong>{p.balance == null ? "—" : `${Number(p.balance).toFixed(2)} ${p.currency ?? ""}`}</strong> · {imported.size} services imported
          </p>
        </div>
        <div className="row">
          <form action={syncProviderServices}>
            <input type="hidden" name="provider_id" value={p.id} />
            <SubmitButton className="btn" pendingText="Syncing…">
              Sync imported services
            </SubmitButton>
          </form>
          <form action={deleteProvider}>
            <input type="hidden" name="id" value={p.id} />
            <SubmitButton className="btn btn-danger" confirm={`Remove ${p.name}? Its services will become manual and stop being forwarded.`}>
              Remove
            </SubmitButton>
          </form>
        </div>
      </div>
      <Flash searchParams={searchParams} />

      <form action={importServices} className="card">
        <input type="hidden" name="provider_id" value={p.id} />
        {loadError ? (
          <div className="card-body">
            <div className="alert alert-error">Couldn't load services from the provider: {loadError}</div>
          </div>
        ) : (
          <ImportTable rows={rows} symbol={s.currencySymbol} />
        )}
      </form>

      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-head">
          <h2>Connection</h2>
        </div>
        <div className="card-body">
          <ActionForm action={saveProvider} submit="Save & test connection" pendingText="Checking…">
            <input type="hidden" name="id" value={p.id} />
            <label className="field">
              <span>Name</span>
              <input name="name" defaultValue={p.name} required />
            </label>
            <label className="field">
              <span>API URL</span>
              <input name="api_url" type="url" defaultValue={p.api_url} required />
            </label>
            <label className="field">
              <span>API key</span>
              <input name="api_key" placeholder={`•••• ${p.api_key.slice(-4)} (leave empty to keep)`} autoComplete="off" />
            </label>
            <label className="field">
              <span>Exchange rate</span>
              <input name="exchange_rate" type="number" step="0.000001" min={0} defaultValue={Number(p.exchange_rate)} />
              <span className="hint">Applies to new imports and syncs. Use the bulk “Reprice” action on the services page to update your prices.</span>
            </label>
          </ActionForm>
        </div>
      </div>
    </>
  );
}
