import { one, query, tx, type Q } from "./db";
import { chargeFor, ORDER_STATUSES, round6, type OrderStatus } from "./format";
import { providerCall, ProviderError } from "./provider";

/** An error whose message is safe and meant to be shown to the customer. */
export class UserError extends Error {}

export const ACTIVE_STATUSES: OrderStatus[] = ["pending", "in_progress", "processing"];

export function parseStatus(raw: unknown): OrderStatus | null {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (s === "cancelled") return "canceled";
  if (s === "inprogress") return "in_progress";
  return (ORDER_STATUSES as readonly string[]).includes(s) ? (s as OrderStatus) : null;
}

interface ServiceRow {
  id: number;
  name: string;
  type: string;
  rate: number;
  provider_rate: number | null;
  min: number;
  max: number;
  refill: boolean;
  cancel: boolean;
  active: boolean;
  category_active: boolean;
  provider_id: number | null;
  provider_service_id: string | null;
}

export interface OrderInput {
  serviceId: number;
  link: string;
  quantity?: number;
  comments?: string;
}

export async function placeOrder(userId: number, input: OrderInput, source: "web" | "mass" | "api") {
  const service = await one<ServiceRow>(
    `SELECT s.*, c.active AS category_active FROM services s JOIN categories c ON c.id = s.category_id WHERE s.id = $1`,
    [input.serviceId]
  );
  if (!service || !service.active || !service.category_active) throw new UserError("Service not found or currently disabled.");

  const link = String(input.link ?? "").trim();
  if (!link) throw new UserError("Link is required.");
  if (link.length > 500 || /\s/.test(link)) throw new UserError("Link looks invalid.");
  if (/^[a-z][a-z0-9+.-]*:/i.test(link) && !/^https?:\/\//i.test(link)) throw new UserError("Links must start with https:// (or be a plain username).");

  let quantity: number;
  let comments: string | null = null;
  if (service.type === "package") {
    quantity = 1;
  } else if (service.type === "custom_comments") {
    const lines = String(input.comments ?? "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) throw new UserError("Add at least one comment, one per line.");
    quantity = lines.length;
    comments = lines.join("\n");
  } else {
    quantity = Number(input.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) throw new UserError("Quantity must be a whole number.");
  }
  if (service.type !== "package" && (quantity < service.min || quantity > service.max)) {
    throw new UserError(`Quantity must be between ${service.min} and ${service.max}.`);
  }
  const charge = chargeFor(service, quantity);
  // Estimated upstream cost; replaced by the provider's reported charge on sync.
  const cost = service.provider_id && service.provider_rate != null ? chargeFor({ type: service.type, rate: service.provider_rate }, quantity) : null;

  const order = await tx(async (q) => {
    const { rows: users } = await q.query<{ balance: number }>(
      `UPDATE users SET balance = balance - $1, spent = spent + $1
       WHERE id = $2 AND status = 'active' AND balance >= $1 RETURNING balance`,
      [charge, userId]
    );
    if (!users[0]) throw new UserError("Not enough funds on your balance.");
    const { rows } = await q.query<{ id: number }>(
      `INSERT INTO orders (user_id, service_id, service_name, service_type, link, quantity, comments, charge, cost,
                           provider_id, provider_service_id, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [userId, service.id, service.name, service.type, link, quantity, comments, charge, cost, service.provider_id, service.provider_service_id, source]
    );
    await q.query(
      `INSERT INTO transactions (user_id, type, amount, balance_after, note, order_id) VALUES ($1, 'order', $2, $3, $4, $5)`,
      [userId, -charge, users[0].balance, `Order #${rows[0].id}`, rows[0].id]
    );
    return { id: rows[0].id, balance: users[0].balance };
  });

  if (service.provider_id) await sendToProvider(order.id);
  return { orderId: order.id, charge, balance: order.balance };
}

/**
 * Forward an order to its upstream provider. Claims the order first so a
 * double click on "Resend" can't create two upstream orders.
 */
export async function sendToProvider(orderId: number) {
  const claimed = await one<{
    link: string;
    quantity: number;
    comments: string | null;
    service_type: string;
    provider_service_id: string;
    api_url: string;
    api_key: string;
  }>(
    `UPDATE orders o SET provider_order_id = 'sending', provider_error = NULL, updated_at = now()
     FROM providers p
     WHERE o.id = $1 AND p.id = o.provider_id AND o.status = 'pending'
       AND (o.provider_order_id IS NULL OR (o.provider_order_id = 'sending' AND o.updated_at < now() - interval '10 minutes'))
     RETURNING o.link, o.quantity, o.comments, o.service_type, o.provider_service_id, p.api_url, p.api_key`,
    [orderId]
  );
  if (!claimed) return false;
  const params: Record<string, string | number | null> = { service: claimed.provider_service_id, link: claimed.link };
  if (claimed.service_type === "default") params.quantity = claimed.quantity;
  if (claimed.service_type === "custom_comments") params.comments = claimed.comments;
  try {
    const res = await providerCall<{ order?: string | number }>(claimed, "add", params);
    if (res?.order == null) throw new ProviderError("Provider did not return an order ID.");
    await query("UPDATE orders SET provider_order_id = $2, provider_error = NULL, updated_at = now() WHERE id = $1", [
      orderId,
      String(res.order),
    ]);
    return true;
  } catch (e) {
    await query("UPDATE orders SET provider_order_id = NULL, provider_error = $2, updated_at = now() WHERE id = $1", [
      orderId,
      (e as Error).message.slice(0, 500),
    ]);
    return false;
  }
}

export interface StatusUpdate {
  status: OrderStatus;
  remains?: number | null;
  startCount?: number | null;
  cost?: number | null;
}

async function credit(q: Q, userId: number, amount: number, type: string, note: string, refs: { orderId?: number; paymentId?: number } = {}) {
  const { rows } = await q.query<{ balance: number }>(
    `UPDATE users SET balance = balance + $2 ${type === "refund" ? ", spent = GREATEST(spent - $2, 0)" : ""}
     WHERE id = $1 RETURNING balance`,
    [userId, amount]
  );
  if (!rows[0]) throw new Error("User not found.");
  await q.query(
    `INSERT INTO transactions (user_id, type, amount, balance_after, note, order_id, payment_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, type, amount, rows[0].balance, note, refs.orderId ?? null, refs.paymentId ?? null]
  );
  return rows[0].balance;
}
export { credit as creditBalance };

/**
 * Move an order to a new status. Partial and Canceled are terminal and refund
 * the undelivered share of the charge exactly once.
 */
export async function applyStatus(orderId: number, u: StatusUpdate) {
  return tx(async (q) => {
    const { rows } = await q.query<{
      id: number;
      user_id: number;
      status: OrderStatus;
      quantity: number;
      charge: number;
      remains: number | null;
      start_count: number | null;
      cost: number | null;
    }>("SELECT id, user_id, status, quantity, charge, remains, start_count, cost FROM orders WHERE id = $1 FOR UPDATE", [orderId]);
    const o = rows[0];
    if (!o || o.status === "partial" || o.status === "canceled") return false;

    const clamp = (n: number) => Math.min(Math.max(Math.round(n), 0), o.quantity);
    let remains = u.remains != null && Number.isFinite(u.remains) ? clamp(u.remains) : o.remains;
    if (u.status === "completed") remains = 0;
    if (u.status === "canceled") remains = o.quantity;
    let refund = 0;
    if (u.status === "canceled") refund = Number(o.charge);
    if (u.status === "partial") refund = round6((Number(o.charge) * (remains ?? 0)) / o.quantity);

    const startCount = u.startCount != null && Number.isFinite(u.startCount) ? Math.round(u.startCount) : o.start_count;
    const cost = u.cost != null && Number.isFinite(u.cost) ? u.cost : o.cost;
    const changed = u.status !== o.status || remains !== o.remains || startCount !== o.start_count || cost !== o.cost;
    await q.query(
      `UPDATE orders SET status = $2, remains = $3, start_count = $4, cost = $5, refunded = $6, synced_at = now()
       ${changed ? ", updated_at = now()" : ""} WHERE id = $1`,
      [o.id, u.status, remains, startCount, cost, refund]
    );
    if (refund > 0) {
      await credit(q, o.user_id, refund, "refund", `Refund for order #${o.id} (${u.status === "partial" ? `${remains} undelivered` : "canceled"})`, {
        orderId: o.id,
      });
    }
    return changed;
  });
}

const toNum = (v: unknown) => (v === "" || v == null || !Number.isFinite(Number(v)) ? null : Number(v));

/** Pull statuses for in-flight provider orders, in batches of 100 per provider. */
export async function syncOrders(opts: { userId?: number; staleSeconds?: number; limit?: number; timeoutMs?: number } = {}) {
  const params: unknown[] = [];
  const where = [
    "o.provider_order_id IS NOT NULL",
    "o.provider_order_id <> 'sending'",
    `o.status IN ('pending', 'in_progress', 'processing')`,
  ];
  if (opts.userId) where.push(`o.user_id = $${params.push(opts.userId)}`);
  if (opts.staleSeconds) where.push(`(o.synced_at IS NULL OR o.synced_at < now() - $${params.push(`${opts.staleSeconds} seconds`)}::interval)`);
  const rows = await query<{ id: number; provider_order_id: string; provider_id: number; api_url: string; api_key: string; exchange_rate: number }>(
    `SELECT o.id, o.provider_order_id, o.provider_id, p.api_url, p.api_key, p.exchange_rate
     FROM orders o JOIN providers p ON p.id = o.provider_id
     WHERE ${where.join(" AND ")} ORDER BY o.synced_at ASC NULLS FIRST LIMIT ${Math.min(opts.limit ?? 500, 2000)}`,
    params
  );

  const result = { checked: 0, updated: 0, errors: [] as string[] };
  const byProvider = new Map<number, typeof rows>();
  for (const r of rows) byProvider.set(r.provider_id, [...(byProvider.get(r.provider_id) ?? []), r]);

  for (const batch of byProvider.values()) {
    for (let i = 0; i < batch.length; i += 100) {
      const chunk = batch.slice(i, i + 100);
      let data: Record<string, any>;
      try {
        data = await providerCall(chunk[0], "status", { orders: chunk.map((o) => o.provider_order_id).join(",") }, opts.timeoutMs);
      } catch (e) {
        result.errors.push((e as Error).message);
        break;
      }
      for (const o of chunk) {
        result.checked++;
        const entry = data?.[o.provider_order_id];
        const status = entry && !entry.error ? parseStatus(entry.status) : null;
        if (!status) {
          await query("UPDATE orders SET synced_at = now() WHERE id = $1", [o.id]);
          continue;
        }
        const changed = await applyStatus(o.id, {
          status,
          remains: toNum(entry.remains),
          startCount: toNum(entry.start_count),
          cost: toNum(entry.charge) == null ? null : round6(toNum(entry.charge)! * Number(o.exchange_rate || 1)),
        });
        if (changed) result.updated++;
      }
    }
  }
  return result;
}

export async function syncRefills(limit = 50) {
  const rows = await query<{ id: number; provider_refill_id: string; api_url: string; api_key: string }>(
    `SELECT r.id, r.provider_refill_id, p.api_url, p.api_key
     FROM refills r JOIN orders o ON o.id = r.order_id JOIN providers p ON p.id = o.provider_id
     WHERE r.provider_refill_id IS NOT NULL AND r.status IN ('pending', 'in_progress', 'processing')
     ORDER BY r.updated_at ASC LIMIT $1`,
    [limit]
  );
  let updated = 0;
  for (const r of rows) {
    try {
      const res = await providerCall<{ status?: string }>(r, "refill_status", { refill: r.provider_refill_id }, 10000);
      const status = String(res?.status ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_").replace("cancelled", "canceled");
      if (status) {
        await query("UPDATE refills SET status = $2, updated_at = now() WHERE id = $1", [r.id, status]);
        updated++;
      }
    } catch {
      await query("UPDATE refills SET updated_at = now() WHERE id = $1", [r.id]);
    }
  }
  return { checked: rows.length, updated };
}

interface OwnedOrder {
  id: number;
  status: OrderStatus;
  provider_id: number | null;
  provider_order_id: string | null;
  cancel_requested: boolean;
  service_refill: boolean | null;
  service_cancel: boolean | null;
  api_url: string | null;
  api_key: string | null;
}

async function ownedOrder(userId: number, orderId: number) {
  if (!Number.isInteger(orderId) || orderId <= 0) throw new UserError("Order not found.");
  const o = await one<OwnedOrder>(
    `SELECT o.id, o.status, o.provider_id, o.provider_order_id, o.cancel_requested,
            s.refill AS service_refill, s.cancel AS service_cancel, p.api_url, p.api_key
     FROM orders o LEFT JOIN services s ON s.id = o.service_id LEFT JOIN providers p ON p.id = o.provider_id
     WHERE o.id = $1 AND o.user_id = $2`,
    [orderId, userId]
  );
  if (!o) throw new UserError("Order not found.");
  return o;
}

export async function requestRefill(userId: number, orderId: number) {
  const o = await ownedOrder(userId, orderId);
  if (!o.service_refill) throw new UserError("This service doesn't offer refills.");
  if (o.status !== "completed" && o.status !== "partial") throw new UserError("Refills are available once an order is completed.");
  const recent = await one(
    `SELECT 1 FROM refills WHERE order_id = $1 AND status <> 'rejected' AND created_at > now() - interval '24 hours'`,
    [o.id]
  );
  if (recent) throw new UserError("A refill was already requested for this order in the last 24 hours.");

  const refill = (await one<{ id: number }>("INSERT INTO refills (order_id, user_id) VALUES ($1, $2) RETURNING id", [o.id, userId]))!;
  if (o.api_url && o.api_key && o.provider_order_id && o.provider_order_id !== "sending") {
    try {
      const res = await providerCall<{ refill?: string | number }>({ api_url: o.api_url, api_key: o.api_key }, "refill", {
        order: o.provider_order_id,
      });
      await query("UPDATE refills SET provider_refill_id = $2 WHERE id = $1", [refill.id, res?.refill != null ? String(res.refill) : null]);
    } catch (e) {
      await query("UPDATE refills SET status = 'rejected', provider_error = $2, updated_at = now() WHERE id = $1", [
        refill.id,
        (e as Error).message.slice(0, 500),
      ]);
      throw new UserError(`Refill was not accepted: ${(e as Error).message}`);
    }
  }
  return refill.id;
}

export async function requestCancel(userId: number, orderId: number) {
  const o = await ownedOrder(userId, orderId);
  if (!ACTIVE_STATUSES.includes(o.status)) throw new UserError("Only orders that haven't finished can be canceled.");
  // Not handed to a provider yet (manual service, or forwarding failed): cancel and refund right away.
  if (o.status === "pending" && !o.provider_order_id) {
    await applyStatus(o.id, { status: "canceled" });
    return "canceled" as const;
  }
  if (!o.service_cancel) throw new UserError("This service doesn't support cancellation.");
  if (o.cancel_requested) throw new UserError("Cancellation was already requested for this order.");
  if (o.api_url && o.api_key && o.provider_order_id && o.provider_order_id !== "sending") {
    let res: any;
    try {
      res = await providerCall<any>({ api_url: o.api_url, api_key: o.api_key }, "cancel", { orders: o.provider_order_id });
    } catch (e) {
      throw new UserError(`Cancellation was not accepted: ${(e as Error).message}`);
    }
    const entry = Array.isArray(res) ? res.find((r) => String(r?.order) === o.provider_order_id) ?? res[0] : res;
    if (entry?.cancel?.error) throw new UserError(`Cancellation was not accepted: ${entry.cancel.error}`);
  }
  await query("UPDATE orders SET cancel_requested = true, updated_at = now() WHERE id = $1", [o.id]);
  return "requested" as const;
}
