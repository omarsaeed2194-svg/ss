"use client";

import { useState, type ReactNode } from "react";

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="adm-field">
      <span>{label}</span>
      {children}
      {hint && <small className="adm-muted">{hint}</small>}
    </label>
  );
}

export function Text({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  type?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Area({
  label,
  value,
  onChange,
  rows = 5,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: ReactNode;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly (T | { value: T; label: string })[];
  onChange: (v: T) => void;
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => {
          const { value: v, label: l } = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </Field>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="adm-field">
      <span>{label}</span>
      <div className="adm-seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            type="button"
            key={o.value}
            role="radio"
            aria-checked={value === o.value}
            className={value === o.value ? "on" : ""}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="adm-switch" aria-hidden />
      {label}
    </label>
  );
}

export function IconBtn({ label, onClick, children, disabled }: { label: string; onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button type="button" className="adm-icon" onClick={onClick} aria-label={label} title={label} disabled={disabled}>
      {children}
    </button>
  );
}

export function move<T>(arr: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

type FieldDef<T> = { key: keyof T & string; label: string; area?: boolean; placeholder?: string; half?: boolean };

/** Editable, reorderable list of records (experience, education, projects…). */
export function ListEditor<T extends { id: string }>({
  items,
  onChange,
  fields,
  title,
  subtitle,
  create,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  fields: FieldDef<T>[];
  title: (item: T) => string;
  subtitle?: (item: T) => string;
  create: () => T;
  addLabel: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const set = (i: number, patch: Partial<T>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div className="adm-list">
      {items.length === 0 && <p className="adm-empty">Nothing here yet — this section is hidden on the site until you add something.</p>}
      {items.map((item, i) => (
        <div key={item.id} className={`adm-item${open === item.id ? " open" : ""}`}>
          <div className="adm-item-head">
            <button type="button" className="adm-item-title" onClick={() => setOpen(open === item.id ? null : item.id)} aria-expanded={open === item.id}>
              <strong>{title(item) || "Untitled"}</strong>
              {subtitle && <span className="adm-muted">{subtitle(item)}</span>}
            </button>
            <IconBtn label="Move up" onClick={() => onChange(move(items, i, -1))} disabled={i === 0}>↑</IconBtn>
            <IconBtn label="Move down" onClick={() => onChange(move(items, i, 1))} disabled={i === items.length - 1}>↓</IconBtn>
            <IconBtn
              label="Delete"
              onClick={() => {
                if (confirm(`Delete “${title(item) || "this item"}”?`)) onChange(items.filter((_, j) => j !== i));
              }}
            >
              ✕
            </IconBtn>
          </div>
          {open === item.id && (
            <div className="adm-item-body adm-grid2">
              {fields.map((f) =>
                f.area ? (
                  <div key={f.key} className="adm-span2">
                    <Area label={f.label} value={String(item[f.key] ?? "")} onChange={(v) => set(i, { [f.key]: v } as Partial<T>)} />
                  </div>
                ) : (
                  <div key={f.key} className={f.half ? "" : "adm-span2"}>
                    <Text
                      label={f.label}
                      placeholder={f.placeholder}
                      value={String(item[f.key] ?? "")}
                      onChange={(v) => set(i, { [f.key]: v } as Partial<T>)}
                    />
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        className="adm-btn"
        onClick={() => {
          const n = create();
          onChange([n, ...items]);
          setOpen(n.id);
        }}
      >
        + {addLabel}
      </button>
    </div>
  );
}
