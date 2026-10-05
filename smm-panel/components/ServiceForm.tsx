import { saveService } from "@/app/actions/admin";
import { ActionForm } from "./ActionForm";

export interface ServiceFormValues {
  id?: number;
  category_id?: number;
  name?: string;
  description?: string;
  type?: string;
  rate?: number;
  min?: number;
  max?: number;
  refill?: boolean;
  cancel?: boolean;
  active?: boolean;
  sort?: number;
  provider_id?: number | null;
  provider_service_id?: string | null;
  provider_rate?: number | null;
}

export function ServiceForm({
  values,
  categories,
  providers,
}: {
  values: ServiceFormValues;
  categories: { id: number; name: string }[];
  providers: { id: number; name: string }[];
}) {
  return (
    <ActionForm action={saveService} submit={values.id ? "Save service" : "Create service"} pendingText="Saving…">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <label className="field">
        <span>Name</span>
        <input name="name" defaultValue={values.name} required maxLength={300} />
      </label>
      <div className="grid-form">
        <label className="field">
          <span>Category</span>
          <select name="category_id" defaultValue={values.category_id} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Type</span>
          <select name="type" defaultValue={values.type ?? "default"}>
            <option value="default">Default (link + quantity)</option>
            <option value="custom_comments">Custom comments (one per line)</option>
            <option value="package">Package (link only, fixed price)</option>
          </select>
        </label>
        <label className="field">
          <span>Sort order</span>
          <input name="sort" type="number" defaultValue={values.sort ?? 0} />
        </label>
      </div>
      <div className="grid-form">
        <label className="field">
          <span>Rate</span>
          <input name="rate" type="number" step="0.0001" min={0} defaultValue={values.rate} required />
          <span className="hint">Price per 1000 (per order for packages).</span>
        </label>
        <label className="field">
          <span>Min</span>
          <input name="min" type="number" min={1} defaultValue={values.min ?? 10} />
        </label>
        <label className="field">
          <span>Max</span>
          <input name="max" type="number" min={1} defaultValue={values.max ?? 10000} />
        </label>
      </div>
      <label className="field">
        <span>
          Description <span className="hint">(shown to customers: start time, speed, guarantee, requirements…)</span>
        </span>
        <textarea name="description" rows={5} defaultValue={values.description} />
      </label>
      <div className="row" style={{ gap: 20 }}>
        <label className="check">
          <input type="checkbox" name="active" defaultChecked={values.active ?? true} /> Active
        </label>
        <label className="check">
          <input type="checkbox" name="refill" defaultChecked={values.refill} /> Refill button
        </label>
        <label className="check">
          <input type="checkbox" name="cancel" defaultChecked={values.cancel} /> Cancel button
        </label>
      </div>
      <hr style={{ margin: "4px 0" }} />
      <div className="grid-form">
        <label className="field">
          <span>Fulfilment</span>
          <select name="provider_id" defaultValue={values.provider_id ?? ""}>
            <option value="">Manual (I fulfil it myself)</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                Provider: {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Provider service ID</span>
          <input name="provider_service_id" defaultValue={values.provider_service_id ?? ""} />
        </label>
        <label className="field">
          <span>Provider cost</span>
          <input name="provider_rate" type="number" step="0.000001" min={0} defaultValue={values.provider_rate ?? ""} />
          <span className="hint">Per 1000, in your currency. Used for profit stats.</span>
        </label>
      </div>
    </ActionForm>
  );
}
