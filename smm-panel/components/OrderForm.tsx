"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { newOrder } from "@/app/actions/orders";
import type { CatalogCategory } from "@/lib/catalog";
import { chargeFor, money, num } from "@/lib/format";

export function OrderForm({ catalog, symbol, initialService }: { catalog: CatalogCategory[]; symbol: string; initialService?: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialCat = catalog.find((c) => c.services.some((s) => s.id === initialService)) ?? catalog[0];
  const [catId, setCatId] = useState(initialCat?.id);
  const [serviceId, setServiceId] = useState(initialService && initialCat ? initialService : initialCat?.services[0]?.id);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [comments, setComments] = useState("");
  const [result, setResult] = useState<{ error?: string; ok?: string }>();
  const [pending, startTransition] = useTransition();

  const category = catalog.find((c) => c.id === catId);
  const service = category?.services.find((s) => s.id === serviceId);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return catalog
      .flatMap((c) => c.services.map((s) => ({ ...s, catId: c.id, catName: c.name })))
      .filter((s) => String(s.id) === q || s.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [catalog, search]);

  const qty = service?.type === "custom_comments" ? comments.split("\n").filter((l) => l.trim()).length : Number(quantity) || 0;
  const charge = service ? chargeFor(service, service.type === "package" ? 1 : qty) : 0;

  function pick(cat: number, svc: number) {
    setCatId(cat);
    setServiceId(svc);
    setSearch("");
    setResult(undefined);
  }

  if (!catalog.length) return <div className="card card-body empty">No services are available right now. Please check back soon.</div>;

  return (
    <div className="order-layout">
      <form
        ref={formRef}
        className="card card-body stack"
        onSubmit={(e) => {
          // Not <form action>: React 19 would reset the form even when the order is rejected.
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await newOrder(fd);
            setResult(res);
            if (res?.ok) {
              setQuantity("");
              setComments("");
              formRef.current?.reset();
            }
          });
        }}
      >
        <div className="field" style={{ position: "relative" }}>
          <span>Search services</span>
          <input placeholder="Type a service name or ID…" value={search} onChange={(e) => setSearch(e.target.value)} autoComplete="off" />
          {matches.length > 0 && (
            <div className="card" style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 3, marginTop: 4, padding: 6 }}>
              {matches.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  className="btn btn-block"
                  style={{ justifyContent: "flex-start", border: "none", height: "auto", padding: "8px 10px", fontWeight: 500, whiteSpace: "normal", textAlign: "left" }}
                  onClick={() => pick(m.catId, m.id)}
                >
                  <span className="mono muted">{m.id}</span> {m.name} — <strong>{money(m.rate, symbol)}</strong>
                </button>
              ))}
            </div>
          )}
        </div>
        <label className="field">
          <span>Category</span>
          <select
            value={catId}
            onChange={(e) => {
              const c = catalog.find((x) => x.id === Number(e.target.value));
              pick(Number(e.target.value), c?.services[0]?.id ?? 0);
            }}
          >
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Service</span>
          <select name="service" value={serviceId} onChange={(e) => pick(catId!, Number(e.target.value))}>
            {category?.services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} — {s.name} — {money(s.rate, symbol)}
                {s.type === "package" ? "" : " per 1000"}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Link</span>
          <input name="link" placeholder="https://…" required autoComplete="off" />
        </label>
        {service?.type === "custom_comments" ? (
          <label className="field">
            <span>
              Comments <span className="hint">(one per line — {qty} entered)</span>
            </span>
            <textarea name="comments" rows={6} value={comments} onChange={(e) => setComments(e.target.value)} required />
          </label>
        ) : service?.type === "package" ? null : (
          <label className="field">
            <span>Quantity</span>
            <input
              name="quantity"
              type="number"
              inputMode="numeric"
              min={service?.min}
              max={service?.max}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            {service && (
              <span className="hint">
                Min {num(service.min)} — Max {num(service.max)}
              </span>
            )}
          </label>
        )}
        <div className="charge-box">
          <span style={{ fontWeight: 600 }}>Charge</span>
          <span className="amount">{money(charge, symbol)}</span>
        </div>
        {result?.error && <div className="alert alert-error">{result.error}</div>}
        {result?.ok && <div className="alert alert-success">{result.ok}</div>}
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={pending}>
          {pending ? "Placing order…" : "Place order"}
        </button>
      </form>

      <div className="card">
        <div className="card-head">
          <h2>Service details</h2>
          {service && <span className="badge mono">ID {service.id}</span>}
        </div>
        {service ? (
          <div className="card-body stack">
            <h3>{service.name}</h3>
            <div className="service-info">
              <div>
                <div className="k">{service.type === "package" ? "Price" : "Per 1000"}</div>
                <div className="v">{money(service.rate, symbol)}</div>
              </div>
              <div>
                <div className="k">Min</div>
                <div className="v">{service.type === "package" ? "—" : num(service.min)}</div>
              </div>
              <div>
                <div className="k">Max</div>
                <div className="v">{service.type === "package" ? "—" : num(service.max)}</div>
              </div>
            </div>
            <div className="row">
              {service.refill ? <span className="badge badge-on">Refill available</span> : <span className="badge">No refill</span>}
              {service.cancel && <span className="badge">Cancel available</span>}
              {service.type === "custom_comments" && <span className="badge badge-primary">Custom comments</span>}
              {service.type === "package" && <span className="badge badge-primary">Package</span>}
            </div>
            {service.description && <div className="desc-box">{service.description}</div>}
            <p className="muted small">
              Make sure the account or post is public and stays public until the order completes. Don't place a second order for the same link
              until the first one finishes.
            </p>
          </div>
        ) : (
          <div className="empty">Pick a service.</div>
        )}
      </div>
    </div>
  );
}
