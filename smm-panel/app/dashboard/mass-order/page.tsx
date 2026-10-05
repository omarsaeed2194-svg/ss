import { massOrder } from "@/app/actions/orders";
import { ActionForm } from "@/components/ActionForm";

export const metadata = { title: "Mass order" };

export default function MassOrderPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mass order</h1>
          <p>Place up to 100 orders at once — one per line.</p>
        </div>
      </div>
      <div className="card card-body">
        <ActionForm action={massOrder} submit="Place orders" pendingText="Placing orders…">
          <label className="field">
            <span>
              Orders <span className="hint">Format: service_id | link | quantity</span>
            </span>
            <textarea
              name="orders"
              rows={12}
              className="mono"
              placeholder={"1 | https://instagram.com/yourpage | 1000\n5 | https://tiktok.com/@you/video/123 | 5000"}
              required
            />
          </label>
        </ActionForm>
      </div>
    </>
  );
}
