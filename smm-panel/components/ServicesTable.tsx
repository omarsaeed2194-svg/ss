"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CatalogCategory } from "@/lib/catalog";
import { money, num } from "@/lib/format";

export function ServicesTable({ catalog, symbol, orderLinks }: { catalog: CatalogCategory[]; symbol: string; orderLinks?: boolean }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return catalog
      .filter((c) => !cat || String(c.id) === cat)
      .map((c) => ({
        ...c,
        services: c.services.filter(
          (s) => !needle || String(s.id) === needle || s.name.toLowerCase().includes(needle) || c.name.toLowerCase().includes(needle)
        ),
      }))
      .filter((c) => c.services.length);
  }, [catalog, q, cat]);

  return (
    <div className="card">
      <div className="card-head">
        <div className="row grow">
          <input className="input" style={{ maxWidth: 320 }} placeholder="Search by name or ID…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input" style={{ maxWidth: 260 }} value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th className="right">Rate per 1000</th>
              <th className="right">Min / Max</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <CategoryRows key={c.id} c={c} symbol={symbol} orderLinks={orderLinks} open={open} setOpen={setOpen} />
            ))}
          </tbody>
        </table>
        {!filtered.length && <div className="empty">No services match your search.</div>}
      </div>
    </div>
  );
}

function CategoryRows({
  c,
  symbol,
  orderLinks,
  open,
  setOpen,
}: {
  c: CatalogCategory;
  symbol: string;
  orderLinks?: boolean;
  open: number | null;
  setOpen: (id: number | null) => void;
}) {
  return (
    <>
      <tr className="cat-row">
        <td colSpan={5}>{c.name}</td>
      </tr>
      {c.services.map((s) => (
        <ServiceRow key={s.id} s={s} symbol={symbol} orderLinks={orderLinks} open={open === s.id} toggle={() => setOpen(open === s.id ? null : s.id)} />
      ))}
    </>
  );
}

function ServiceRow({
  s,
  symbol,
  orderLinks,
  open,
  toggle,
}: {
  s: CatalogCategory["services"][number];
  symbol: string;
  orderLinks?: boolean;
  open: boolean;
  toggle: () => void;
}) {
  return (
    <>
      <tr>
        <td className="mono muted">{s.id}</td>
        <td>
          <div style={{ fontWeight: 600 }}>{s.name}</div>
          <div className="row" style={{ gap: 6, marginTop: 4 }}>
            {s.type !== "default" && <span className="badge badge-primary">{s.type === "package" ? "Package" : "Custom comments"}</span>}
            {s.refill && <span className="badge badge-on">Refill</span>}
            {s.cancel && <span className="badge">Cancel</span>}
            {s.description && (
              <button type="button" className="link-btn small" onClick={toggle}>
                {open ? "Hide details" : "Details"}
              </button>
            )}
          </div>
        </td>
        <td className="right nowrap" style={{ fontWeight: 700 }}>
          {money(s.rate, symbol)}
          {s.type === "package" && <div className="muted small">per package</div>}
        </td>
        <td className="right nowrap">{s.type === "package" ? "—" : `${num(s.min)} / ${num(s.max)}`}</td>
        <td className="right">
          <Link className="btn btn-sm btn-primary" href={orderLinks ? `/dashboard?service=${s.id}` : `/register`}>
            Order
          </Link>
        </td>
      </tr>
      {open && (
        <tr>
          <td></td>
          <td colSpan={4}>
            <div className="desc-box">{s.description}</div>
          </td>
        </tr>
      )}
    </>
  );
}
