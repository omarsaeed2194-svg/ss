import Link from "next/link";
import { bulkServices, deleteCategory, saveCategory } from "@/app/actions/admin";
import { Flash } from "@/components/Flash";
import { SelectAll } from "@/components/SelectAll";
import { SubmitButton } from "@/components/SubmitButton";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { money, num, SERVICE_TYPE_LABEL, type ServiceType } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Services · Admin" };

export default async function AdminServices(props: { searchParams: Promise<Record<string, string | undefined>> }) {
  const searchParams = await props.searchParams;
  await requireAdmin();
  const s = await getSettings();
  const [categories, services] = await Promise.all([
    query<{ id: number; name: string; sort: number; active: boolean; services: number }>(
      "SELECT c.*, (SELECT count(*) FROM services s WHERE s.category_id = c.id) AS services FROM categories c ORDER BY c.sort, c.id"
    ),
    query<{
      id: number;
      category_id: number;
      name: string;
      type: ServiceType;
      rate: number;
      provider_rate: number | null;
      min: number;
      max: number;
      refill: boolean;
      cancel: boolean;
      active: boolean;
      provider_name: string | null;
      provider_service_id: string | null;
    }>(
      `SELECT s.id, s.category_id, s.name, s.type, s.rate, s.provider_rate, s.min, s.max, s.refill, s.cancel, s.active,
              p.name AS provider_name, s.provider_service_id
       FROM services s LEFT JOIN providers p ON p.id = s.provider_id ORDER BY s.sort, s.id`
    ),
  ]);
  const sym = s.currencySymbol;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Services</h1>
          <p>{services.length} services in {categories.length} categories.</p>
        </div>
        <div className="row">
          <Link href="/admin/providers" className="btn">
            Import from provider
          </Link>
          <Link href="/admin/services/new" className="btn btn-primary">
            New service
          </Link>
        </div>
      </div>
      <Flash searchParams={searchParams} />

      <form action={bulkServices} className="card">
        <div className="card-head">
          <div className="row">
            <select name="op" className="input" style={{ width: 190 }} defaultValue="">
              <option value="" disabled>
                Bulk action…
              </option>
              <option value="enable">Enable</option>
              <option value="disable">Disable</option>
              <option value="move">Move to category</option>
              <option value="markup">Reprice: cost + markup %</option>
              <option value="delete">Delete</option>
            </select>
            <select name="category_id" className="input" style={{ width: 200 }} defaultValue="">
              <option value="">(for “Move”) category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input name="markup" type="number" step="0.1" className="input" placeholder="(for “Reprice”) %" style={{ width: 170 }} />
            <SubmitButton className="btn" confirm="Apply this action to the selected services?">
              Apply to selected
            </SubmitButton>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <SelectAll />
                </th>
                <th>ID</th>
                <th>Service</th>
                <th className="right">Rate / cost</th>
                <th className="right">Min / max</th>
                <th>Provider</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => {
                const list = services.filter((x) => x.category_id === c.id);
                return (
                  <CategoryBlock key={c.id} name={c.name} active={c.active} id={c.id}>
                    {list.map((x) => {
                      const loss = x.provider_rate != null && Number(x.provider_rate) > Number(x.rate);
                      return (
                        <tr key={x.id}>
                          <td>
                            <input type="checkbox" name="ids" value={x.id} data-group={String(c.id)} />
                          </td>
                          <td className="mono muted">{x.id}</td>
                          <td style={{ minWidth: 240 }}>
                            <Link href={`/admin/services/${x.id}`} style={{ fontWeight: 600 }}>
                              {x.name}
                            </Link>
                            <div className="row" style={{ gap: 6, marginTop: 4 }}>
                              {x.type !== "default" && <span className="badge badge-primary">{SERVICE_TYPE_LABEL[x.type]}</span>}
                              {x.refill && <span className="badge badge-on">Refill</span>}
                              {x.cancel && <span className="badge">Cancel</span>}
                            </div>
                          </td>
                          <td className="right nowrap">
                            <strong>{money(x.rate, sym)}</strong>
                            <div className="small" style={{ color: loss ? "var(--danger)" : "var(--muted)" }}>
                              {x.provider_rate == null ? "—" : `${money(x.provider_rate, sym)}${loss ? " · LOSS" : ""}`}
                            </div>
                          </td>
                          <td className="right nowrap">
                            {num(x.min)} / {num(x.max)}
                          </td>
                          <td className="small">
                            {x.provider_name ? (
                              <>
                                {x.provider_name} <span className="mono muted">#{x.provider_service_id}</span>
                              </>
                            ) : (
                              <span className="muted">Manual</span>
                            )}
                          </td>
                          <td>{x.active ? <span className="badge badge-on">Active</span> : <span className="badge">Disabled</span>}</td>
                        </tr>
                      );
                    })}
                    {!list.length && (
                      <tr>
                        <td></td>
                        <td colSpan={6} className="muted small">
                          No services in this category.
                        </td>
                      </tr>
                    )}
                  </CategoryBlock>
                );
              })}
            </tbody>
          </table>
          {!categories.length && <div className="empty">Add a category below, then create or import services.</div>}
        </div>
      </form>

      <div className="card">
        <div className="card-head">
          <h2>Categories</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Sort</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td colSpan={4} style={{ padding: 8 }}>
                    <div className="row">
                      <form action={saveCategory} className="row grow">
                        <input type="hidden" name="id" value={c.id} />
                        <input name="name" className="input grow" defaultValue={c.name} required style={{ minWidth: 200 }} />
                        <input name="sort" type="number" className="input" defaultValue={c.sort} style={{ width: 90 }} title="Sort order" />
                        <label className="check">
                          <input type="checkbox" name="active" defaultChecked={c.active} /> Active
                        </label>
                        <SubmitButton className="btn btn-sm">Save</SubmitButton>
                      </form>
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={c.id} />
                        <SubmitButton className="btn btn-sm btn-danger" confirm={`Delete category “${c.name}”?`}>
                          Delete
                        </SubmitButton>
                      </form>
                      <span className="muted small">{c.services} services</span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} style={{ padding: 8 }}>
                  <form action={saveCategory} className="row">
                    <input name="name" className="input grow" placeholder="New category name" required style={{ minWidth: 200 }} />
                    <input name="sort" type="number" className="input" placeholder="Sort" style={{ width: 90 }} />
                    <SubmitButton className="btn btn-sm btn-primary">Add category</SubmitButton>
                  </form>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function CategoryBlock({ id, name, active, children }: { id: number; name: string; active: boolean; children: React.ReactNode }) {
  return (
    <>
      <tr className="cat-row">
        <td>
          <SelectAll group={String(id)} />
        </td>
        <td colSpan={6}>
          {name} {!active && <span className="badge">Hidden</span>}
        </td>
      </tr>
      {children}
    </>
  );
}
