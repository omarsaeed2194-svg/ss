import { OrderForm } from "@/components/OrderForm";
import { requireUser } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";
import { one } from "@/lib/db";
import { money, num } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "New order" };

export default async function NewOrderPage(props: { searchParams: Promise<{ service?: string }> }) {
  const searchParams = await props.searchParams;
  const user = await requireUser();
  const [s, catalog, stats] = await Promise.all([
    getSettings(),
    getCatalog(),
    one<{ total: number; active: number }>(
      `SELECT count(*) AS total, count(*) FILTER (WHERE status IN ('pending', 'in_progress', 'processing')) AS active
       FROM orders WHERE user_id = $1`,
      [user.id]
    ),
  ]);
  return (
    <>
      <div className="stats">
        <div className="card stat">
          <div className="label">Balance</div>
          <div className="value">{money(user.balance, s.currencySymbol)}</div>
        </div>
        <div className="card stat">
          <div className="label">Total spent</div>
          <div className="value">{money(user.spent, s.currencySymbol)}</div>
        </div>
        <div className="card stat">
          <div className="label">Orders</div>
          <div className="value">{num(stats?.total)}</div>
          <div className="sub">{num(stats?.active)} in progress</div>
        </div>
      </div>
      <OrderForm catalog={catalog} symbol={s.currencySymbol} initialService={Number(searchParams.service) || undefined} />
    </>
  );
}
