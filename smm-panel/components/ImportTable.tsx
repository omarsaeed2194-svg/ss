"use client";

import { useMemo, useState } from "react";
import { money } from "@/lib/format";
import { SubmitButton } from "./SubmitButton";

export interface ImportRow {
  id: string;
  name: string;
  category: string;
  type: string;
  supported: boolean;
  cost: number;
  min: number;
  max: number;
  refill: boolean;
  imported: boolean;
}

export function ImportTable({ rows, symbol }: { rows: ImportRow[]; symbol: string }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [markup, setMarkup] = useState("30");
  const categories = useMemo(() => [...new Set(rows.map((r) => r.category))], [rows]);
  const needle = q.trim().toLowerCase();
  const visible = (r: ImportRow) =>
    (!cat || r.category === cat) && (!needle || r.id === needle || r.name.toLowerCase().includes(needle) || r.category.toLowerCase().includes(needle));
  const pct = Number(markup) || 0;

  return (
    <>
      <div className="card-head">
        <div className="row grow">
          <input className="input" style={{ maxWidth: 260 }} placeholder="Search provider services…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input" style={{ maxWidth: 260 }} value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="row">
          <label className="row small" style={{ gap: 6 }}>
            Markup
            <input name="markup" className="input" type="number" step="0.1" value={markup} onChange={(e) => setMarkup(e.target.value)} style={{ width: 90 }} />%
          </label>
          <SubmitButton pendingText="Importing…">Import selected</SubmitButton>
        </div>
      </div>
      <div className="table-wrap" style={{ maxHeight: 640, overflowY: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input
                  type="checkbox"
                  title="Select all visible"
                  onChange={(e) => {
                    e.currentTarget.form
                      ?.querySelectorAll<HTMLInputElement>('input[name="ids"]:not(:disabled)')
                      .forEach((cb) => {
                        if (!cb.closest("tr")?.hidden) cb.checked = e.currentTarget.checked;
                      });
                  }}
                />
              </th>
              <th>ID</th>
              <th>Service</th>
              <th className="right">Cost</th>
              <th className="right">Your price</th>
              <th className="right">Min / max</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} hidden={!visible(r)}>
                <td>
                  <input type="checkbox" name="ids" value={r.id} disabled={r.imported || !r.supported} />
                </td>
                <td className="mono muted">{r.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div className="row small muted" style={{ gap: 6, marginTop: 2 }}>
                    {r.category}
                    {r.type !== "Default" && <span className={`badge ${r.supported ? "badge-primary" : "badge-failed"}`}>{r.type}{r.supported ? "" : " — not supported"}</span>}
                    {r.refill && <span className="badge badge-on">Refill</span>}
                    {r.imported && <span className="badge badge-completed">Imported</span>}
                  </div>
                </td>
                <td className="right nowrap">{money(r.cost, symbol)}</td>
                <td className="right nowrap" style={{ fontWeight: 700 }}>
                  {money(Math.round(r.cost * (1 + pct / 100) * 10000) / 10000, symbol)}
                </td>
                <td className="right nowrap">
                  {r.min} / {r.max}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
