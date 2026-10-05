"use client";

/** Checkbox that toggles every `name` checkbox in the same form (optionally only those with a data-group). */
export function SelectAll({ name = "ids", group, label }: { name?: string; group?: string; label?: string }) {
  return (
    <label className="check" title="Select all">
      <input
        type="checkbox"
        onChange={(e) => {
          const form = e.currentTarget.form;
          if (!form) return;
          const sel = `input[type=checkbox][name="${name}"]${group ? `[data-group="${group}"]` : ""}`;
          form.querySelectorAll<HTMLInputElement>(sel).forEach((cb) => {
            if (!cb.closest("tr")?.hidden) cb.checked = e.currentTarget.checked;
          });
        }}
      />
      {label}
    </label>
  );
}
