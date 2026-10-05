"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/crypto";
import { one, query, tx } from "@/lib/db";
import { money, round6, type ServiceType } from "@/lib/format";
import { applyStatus, creditBalance, parseStatus, sendToProvider, syncOrders, syncRefills } from "@/lib/orders";
import { fetchProviderServices, mapProviderType, providerCall } from "@/lib/provider";
import { getSettings, saveSettings, type Settings } from "@/lib/settings";
import type { FormResult } from "./auth";

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const int = (fd: FormData, k: string) => {
  const n = Number(fd.get(k));
  return Number.isFinite(n) ? Math.round(n) : NaN;
};
const dec = (fd: FormData, k: string) => {
  const raw = text(fd, k);
  return raw === "" ? NaN : Number(raw);
};
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
const err = (e: unknown) => ({ error: (e as Error).message || "Something went wrong." });

function back(path: string, msg: { ok?: string; error?: string }): never {
  const sp = new URLSearchParams(msg as Record<string, string>);
  redirect(`${path}${path.includes("?") ? "&" : "?"}${sp}`);
}

// ---------- Orders ----------

export async function updateOrder(fd: FormData): Promise<FormResult> {
  await requireAdmin();
  const id = int(fd, "id");
  const status = parseStatus(fd.get("status"));
  if (!status) return { error: "Pick a status." };
  const startRaw = text(fd, "start_count");
  const remainsRaw = text(fd, "remains");
  const changed = await applyStatus(id, {
    status,
    startCount: startRaw === "" ? null : Number(startRaw),
    remains: remainsRaw === "" ? null : Number(remainsRaw),
  });
  revalidatePath("/admin", "layout");
  if (!changed) return { error: "Nothing changed (partial and canceled orders are final)." };
  return { ok: status === "canceled" || status === "partial" ? "Order updated and refund issued." : "Order updated." };
}

export async function resendOrder(fd: FormData): Promise<FormResult> {
  await requireAdmin();
  const id = int(fd, "id");
  const sent = await sendToProvider(id);
  revalidatePath("/admin", "layout");
  if (sent) return { ok: "Sent to provider." };
  const o = await one<{ provider_error: string | null }>("SELECT provider_error FROM orders WHERE id = $1", [id]);
  return { error: o?.provider_error || "Order can't be sent (already sent, not pending, or no provider)." };
}

export async function syncNow(): Promise<FormResult> {
  await requireAdmin();
  const res = await syncOrders({ limit: 1000 });
  const refills = await syncRefills();
  revalidatePath("/admin", "layout");
  const msg = `Checked ${res.checked} orders, ${res.updated} updated. Refills checked: ${refills.checked}.`;
  return res.errors.length ? { error: `${msg}\nErrors: ${res.errors.join("; ")}` } : { ok: msg };
}

// ---------- Users ----------

export async function adjustBalance(fd: FormData): Promise<FormResult> {
  await requireAdmin();
  const id = int(fd, "id");
  const amount = round6(dec(fd, "amount"));
  const note = text(fd, "note").slice(0, 200) || "Balance adjustment";
  if (!Number.isFinite(amount) || amount === 0) return { error: "Enter a non-zero amount (negative to deduct)." };
  try {
    await tx(async (q) => {
      if (amount < 0) {
        const { rows } = await q.query("SELECT 1 FROM users WHERE id = $1 AND balance + $2 >= 0", [id, amount]);
        if (!rows[0]) throw new Error("That would make the balance negative.");
      }
      await creditBalance(q, id, amount, "adjustment", note);
    });
  } catch (e) {
    return err(e);
  }
  revalidatePath(`/admin/users/${id}`);
  const { currencySymbol } = await getSettings();
  return { ok: `Balance ${amount > 0 ? "increased" : "decreased"} by ${money(Math.abs(amount), currencySymbol)}.` };
}

export async function setUserStatus(fd: FormData): Promise<FormResult> {
  const admin = await requireAdmin();
  const id = int(fd, "id");
  const status = text(fd, "status") === "suspended" ? "suspended" : "active";
  if (id === admin.id) return { error: "You can't suspend yourself." };
  await query("UPDATE users SET status = $2 WHERE id = $1", [id, status]);
  if (status === "suspended") await query("DELETE FROM sessions WHERE user_id = $1", [id]);
  revalidatePath(`/admin/users/${id}`);
  return { ok: status === "suspended" ? "User suspended and signed out." : "User reactivated." };
}

export async function setUserRole(fd: FormData): Promise<FormResult> {
  const admin = await requireAdmin();
  const id = int(fd, "id");
  const role = text(fd, "role") === "admin" ? "admin" : "user";
  if (id === admin.id) return { error: "You can't change your own role." };
  await query("UPDATE users SET role = $2 WHERE id = $1", [id, role]);
  revalidatePath(`/admin/users/${id}`);
  return { ok: role === "admin" ? "User is now an admin." : "Admin rights removed." };
}

export async function resetUserPassword(fd: FormData): Promise<FormResult> {
  await requireAdmin();
  const id = int(fd, "id");
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  await query("UPDATE users SET password_hash = $2 WHERE id = $1", [id, await hashPassword(password)]);
  await query("DELETE FROM sessions WHERE user_id = $1", [id]);
  return { ok: "Password changed and the user was signed out everywhere." };
}

// ---------- Categories & services ----------

export async function saveCategory(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const name = text(fd, "name").slice(0, 120);
  if (!name) back("/admin/services", { error: "Category name is required." });
  const sort = Number.isFinite(int(fd, "sort")) ? int(fd, "sort") : 0;
  if (id) await query("UPDATE categories SET name = $2, sort = $3, active = $4 WHERE id = $1", [id, name, sort, bool(fd, "active")]);
  else await query("INSERT INTO categories (name, sort) VALUES ($1, $2)", [name, sort]);
  revalidatePath("/", "layout");
  back("/admin/services", { ok: id ? "Category saved." : `Category “${name}” added.` });
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const used = await one<{ n: number }>("SELECT count(*) AS n FROM services WHERE category_id = $1", [id]);
  if (used?.n) back("/admin/services", { error: "Move or delete this category's services first." });
  await query("DELETE FROM categories WHERE id = $1", [id]);
  revalidatePath("/", "layout");
  back("/admin/services", { ok: "Category deleted." });
}

const TYPES: ServiceType[] = ["default", "package", "custom_comments"];

export async function saveService(fd: FormData): Promise<FormResult> {
  await requireAdmin();
  const id = int(fd, "id");
  const type = TYPES.includes(text(fd, "type") as ServiceType) ? (text(fd, "type") as ServiceType) : "default";
  const s = {
    category_id: int(fd, "category_id"),
    name: text(fd, "name").slice(0, 300),
    description: text(fd, "description").slice(0, 5000),
    type,
    rate: dec(fd, "rate"),
    min: type === "package" ? 1 : int(fd, "min"),
    max: type === "package" ? 1 : int(fd, "max"),
    refill: bool(fd, "refill"),
    cancel: bool(fd, "cancel"),
    active: bool(fd, "active"),
    sort: Number.isFinite(int(fd, "sort")) ? int(fd, "sort") : 0,
    provider_id: int(fd, "provider_id") || null,
    provider_service_id: text(fd, "provider_service_id") || null,
    provider_rate: Number.isFinite(dec(fd, "provider_rate")) ? dec(fd, "provider_rate") : null,
  };
  if (!s.name) return { error: "Name is required." };
  if (!(await one("SELECT 1 FROM categories WHERE id = $1", [s.category_id]))) return { error: "Pick a category." };
  if (!Number.isFinite(s.rate) || s.rate < 0) return { error: "Enter a valid rate." };
  if (!Number.isInteger(s.min) || !Number.isInteger(s.max) || s.min < 1 || s.max < s.min) return { error: "Min must be ≥ 1 and max ≥ min." };
  if (s.provider_id && !s.provider_service_id) return { error: "Enter the provider's service ID, or choose “Manual”." };
  const cols = Object.keys(s);
  const vals = Object.values(s);
  if (id) {
    await query(`UPDATE services SET ${cols.map((c, i) => `${c} = $${i + 2}`).join(", ")} WHERE id = $1`, [id, ...vals]);
  } else {
    await query(`INSERT INTO services (${cols.join(", ")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")})`, vals);
  }
  revalidatePath("/", "layout");
  back("/admin/services", { ok: id ? `Service #${id} saved.` : "Service created." });
}

export async function bulkServices(fd: FormData) {
  await requireAdmin();
  const ids = fd.getAll("ids").map(Number).filter(Number.isInteger);
  const op = text(fd, "op");
  if (!ids.length) back("/admin/services", { error: "Select at least one service." });
  if (op === "enable" || op === "disable") {
    await query("UPDATE services SET active = $2 WHERE id = ANY($1::int[])", [ids, op === "enable"]);
  } else if (op === "delete") {
    await query("DELETE FROM services WHERE id = ANY($1::int[])", [ids]);
  } else if (op === "move") {
    const cat = int(fd, "category_id");
    if (!(await one("SELECT 1 FROM categories WHERE id = $1", [cat]))) back("/admin/services", { error: "Pick a category to move to." });
    await query("UPDATE services SET category_id = $2 WHERE id = ANY($1::int[])", [ids, cat]);
  } else if (op === "markup") {
    const pct = dec(fd, "markup");
    if (!Number.isFinite(pct)) back("/admin/services", { error: "Enter a markup %." });
    const rows = await query<{ n: number }>(
      `WITH u AS (UPDATE services SET rate = round(provider_rate * (1 + $2::numeric / 100), 4)
                  WHERE id = ANY($1::int[]) AND provider_rate IS NOT NULL RETURNING 1) SELECT count(*) AS n FROM u`,
      [ids, pct]
    );
    revalidatePath("/", "layout");
    back("/admin/services", { ok: `Repriced ${rows[0]?.n ?? 0} services at cost + ${pct}% (services without a provider cost were skipped).` });
  } else {
    back("/admin/services", { error: "Pick an action." });
  }
  revalidatePath("/", "layout");
  back("/admin/services", { ok: `${ids.length} service(s) updated.` });
}

// ---------- Providers ----------

function validUrl(u: string) {
  try {
    return ["http:", "https:"].includes(new URL(u).protocol);
  } catch {
    return false;
  }
}

export async function saveProvider(fd: FormData): Promise<FormResult> {
  await requireAdmin();
  const id = int(fd, "id");
  const name = text(fd, "name").slice(0, 100);
  const api_url = text(fd, "api_url");
  const api_key = text(fd, "api_key");
  const exchange = dec(fd, "exchange_rate");
  if (!name || !validUrl(api_url)) return { error: "Enter a name and a valid API URL (https://…/api/v2)." };
  if (!api_key && !id) return { error: "Enter the API key from your provider account." };
  const rate = Number.isFinite(exchange) && exchange > 0 ? exchange : 1;
  let balance: { balance?: string; currency?: string } | null = null;
  try {
    const existing = id ? await one<{ api_key: string }>("SELECT api_key FROM providers WHERE id = $1", [id]) : null;
    balance = await providerCall({ api_url, api_key: api_key || existing?.api_key || "" }, "balance", {}, 15000);
  } catch (e) {
    return { error: `Couldn't connect: ${(e as Error).message}` };
  }
  const bal = Number(balance?.balance);
  if (id) {
    await query(
      `UPDATE providers SET name = $2, api_url = $3, api_key = COALESCE(NULLIF($4, ''), api_key), exchange_rate = $5,
       balance = $6, currency = $7, balance_checked_at = now() WHERE id = $1`,
      [id, name, api_url, api_key, rate, Number.isFinite(bal) ? bal : null, balance?.currency ?? null]
    );
    revalidatePath(`/admin/providers/${id}`);
    return { ok: "Provider saved — connection OK." };
  }
  const row = await one<{ id: number }>(
    `INSERT INTO providers (name, api_url, api_key, exchange_rate, balance, currency, balance_checked_at)
     VALUES ($1, $2, $3, $4, $5, $6, now()) RETURNING id`,
    [name, api_url, api_key, rate, Number.isFinite(bal) ? bal : null, balance?.currency ?? null]
  );
  redirect(`/admin/providers/${row!.id}?ok=${encodeURIComponent("Provider connected. Pick the services to import below.")}`);
}

export async function deleteProvider(fd: FormData) {
  await requireAdmin();
  await query("DELETE FROM providers WHERE id = $1", [int(fd, "id")]);
  back("/admin/providers", { ok: "Provider removed. Its services are now manual (fulfilled by you)." });
}

export async function importServices(fd: FormData) {
  await requireAdmin();
  const providerId = int(fd, "provider_id");
  const path = `/admin/providers/${providerId}`;
  const provider = await one<{ id: number; api_url: string; api_key: string; exchange_rate: number }>(
    "SELECT id, api_url, api_key, exchange_rate FROM providers WHERE id = $1",
    [providerId]
  );
  if (!provider) back("/admin/providers", { error: "Provider not found." });
  const wanted = new Set(fd.getAll("ids").map(String));
  if (!wanted.size) back(path, { error: "Select at least one service to import." });
  const markup = Number.isFinite(dec(fd, "markup")) ? dec(fd, "markup") : 0;

  let list;
  try {
    list = await fetchProviderServices(provider);
  } catch (e) {
    back(path, { error: (e as Error).message });
  }
  const existing = new Set(
    (await query<{ provider_service_id: string }>("SELECT provider_service_id FROM services WHERE provider_id = $1", [providerId])).map(
      (r) => r.provider_service_id
    )
  );
  const cats = new Map(
    (await query<{ id: number; name: string }>("SELECT id, name FROM categories")).map((c) => [c.name.toLowerCase(), c.id])
  );
  let nextSort = (await one<{ m: number }>("SELECT COALESCE(max(sort), 0) + 1 AS m FROM categories"))!.m;
  let imported = 0;
  let skipped = 0;
  for (const ps of list) {
    const sid = String(ps.service);
    if (!wanted.has(sid)) continue;
    const type = mapProviderType(ps.type);
    const cost = Number(ps.rate) * Number(provider.exchange_rate || 1);
    if (!type || existing.has(sid) || !Number.isFinite(cost)) {
      skipped++;
      continue;
    }
    const catName = String(ps.category || "Imported").slice(0, 120);
    let catId = cats.get(catName.toLowerCase());
    if (!catId) {
      catId = (await one<{ id: number }>("INSERT INTO categories (name, sort) VALUES ($1, $2) RETURNING id", [catName, nextSort++]))!.id;
      cats.set(catName.toLowerCase(), catId);
    }
    const min = Math.max(1, Math.round(Number(ps.min)) || 1);
    const max = Math.max(min, Math.round(Number(ps.max)) || min);
    await query(
      `INSERT INTO services (category_id, name, description, type, rate, min, max, refill, cancel, provider_id, provider_service_id, provider_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        catId,
        String(ps.name).slice(0, 300),
        String(ps.desc ?? ps.description ?? "").slice(0, 5000),
        type,
        Math.round(cost * (1 + markup / 100) * 10000) / 10000,
        type === "package" ? 1 : min,
        type === "package" ? 1 : max,
        !!ps.refill,
        !!ps.cancel,
        providerId,
        sid,
        round6(cost),
      ]
    );
    existing.add(sid);
    imported++;
  }
  revalidatePath("/", "layout");
  back(path, { ok: `Imported ${imported} service(s)${skipped ? `, skipped ${skipped} (already imported or unsupported type)` : ""}.` });
}

export async function syncProviderServices(fd: FormData) {
  await requireAdmin();
  const providerId = int(fd, "provider_id");
  const path = `/admin/providers/${providerId}`;
  const provider = await one<{ api_url: string; api_key: string; exchange_rate: number }>(
    "SELECT api_url, api_key, exchange_rate FROM providers WHERE id = $1",
    [providerId]
  );
  if (!provider) back("/admin/providers", { error: "Provider not found." });
  let list;
  try {
    list = await fetchProviderServices(provider);
  } catch (e) {
    back(path, { error: (e as Error).message });
  }
  const upstream = new Map(list.map((ps) => [String(ps.service), ps]));
  const ours = await query<{ id: number; provider_service_id: string; active: boolean }>(
    "SELECT id, provider_service_id, active FROM services WHERE provider_id = $1",
    [providerId]
  );
  let updated = 0;
  let disabled = 0;
  for (const s of ours) {
    const ps = upstream.get(s.provider_service_id);
    if (!ps) {
      if (s.active) {
        await query("UPDATE services SET active = false WHERE id = $1", [s.id]);
        disabled++;
      }
      continue;
    }
    const min = Math.max(1, Math.round(Number(ps.min)) || 1);
    await query("UPDATE services SET provider_rate = $2, min = $3, max = $4, refill = $5, cancel = $6 WHERE id = $1 AND type <> 'package'", [
      s.id,
      round6(Number(ps.rate) * Number(provider.exchange_rate || 1)),
      min,
      Math.max(min, Math.round(Number(ps.max)) || min),
      !!ps.refill,
      !!ps.cancel,
    ]);
    await query("UPDATE services SET provider_rate = $2, refill = $3, cancel = $4 WHERE id = $1 AND type = 'package'", [
      s.id,
      round6(Number(ps.rate) * Number(provider.exchange_rate || 1)),
      !!ps.refill,
      !!ps.cancel,
    ]);
    updated++;
  }
  revalidatePath("/", "layout");
  back(path, {
    ok: `Synced ${updated} service(s): costs, min/max, refill and cancel updated. ${disabled ? `${disabled} no longer offered upstream and were disabled.` : ""}`,
  });
}

// ---------- Payments ----------

export async function reviewPayment(fd: FormData): Promise<FormResult> {
  await requireAdmin();
  const id = int(fd, "id");
  const decision = text(fd, "decision");
  const note = text(fd, "note").slice(0, 300);
  try {
    const res = await tx(async (q) => {
      const { rows } = await q.query<{ id: number; user_id: number; amount: number; method_id: number | null; status: string }>(
        "SELECT id, user_id, amount, method_id, status FROM payments WHERE id = $1 FOR UPDATE",
        [id]
      );
      const p = rows[0];
      if (!p || p.status !== "pending") throw new Error("This payment was already processed.");
      if (decision === "reject") {
        await q.query("UPDATE payments SET status = 'rejected', admin_note = $2, updated_at = now() WHERE id = $1", [id, note]);
        return "rejected";
      }
      const amount = Number.isFinite(dec(fd, "amount")) && dec(fd, "amount") > 0 ? round6(dec(fd, "amount")) : Number(p.amount);
      const { rows: m } = await q.query<{ bonus_percent: number }>("SELECT bonus_percent FROM payment_methods WHERE id = $1", [p.method_id]);
      const bonus = round6((amount * Number(m[0]?.bonus_percent ?? 0)) / 100);
      await q.query("UPDATE payments SET status = 'completed', amount = $2, bonus = $3, admin_note = $4, updated_at = now() WHERE id = $1", [
        id,
        amount,
        bonus,
        note,
      ]);
      await creditBalance(q, p.user_id, amount, "deposit", `Payment #${id}`, { paymentId: id });
      if (bonus > 0) await creditBalance(q, p.user_id, bonus, "bonus", `Bonus for payment #${id}`, { paymentId: id });
      return "completed";
    });
    revalidatePath("/admin", "layout");
    return { ok: res === "completed" ? `Payment #${id} approved and balance credited.` : `Payment #${id} rejected.` };
  } catch (e) {
    return err(e);
  }
}

export async function savePaymentMethod(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const name = text(fd, "name").slice(0, 100);
  if (!name) back("/admin/payments", { error: "Method name is required." });
  const vals = [
    name,
    text(fd, "instructions").slice(0, 3000),
    Math.max(0, dec(fd, "min_amount") || 0),
    Math.max(0, dec(fd, "bonus_percent") || 0),
    bool(fd, "active"),
    Number.isFinite(int(fd, "sort")) ? int(fd, "sort") : 0,
  ];
  if (id) await query("UPDATE payment_methods SET name=$2, instructions=$3, min_amount=$4, bonus_percent=$5, active=$6, sort=$7 WHERE id=$1", [id, ...vals]);
  else await query("INSERT INTO payment_methods (name, instructions, min_amount, bonus_percent, active, sort) VALUES ($1,$2,$3,$4,$5,$6)", vals);
  back("/admin/payments", { ok: "Payment method saved." });
}

export async function deletePaymentMethod(fd: FormData) {
  await requireAdmin();
  await query("DELETE FROM payment_methods WHERE id = $1", [int(fd, "id")]);
  back("/admin/payments", { ok: "Payment method deleted." });
}

// ---------- Tickets ----------

export async function staffReply(fd: FormData): Promise<FormResult> {
  const admin = await requireAdmin();
  const id = int(fd, "ticket");
  const body = text(fd, "message").slice(0, 5000);
  if (!body) return { error: "Write a reply first." };
  const close = bool(fd, "close");
  await query("INSERT INTO ticket_messages (ticket_id, user_id, is_staff, body) VALUES ($1, $2, true, $3)", [id, admin.id, body]);
  await query("UPDATE tickets SET status = $2, updated_at = now() WHERE id = $1", [id, close ? "closed" : "answered"]);
  revalidatePath("/admin", "layout");
  return { ok: close ? "Reply sent and ticket closed." : "Reply sent." };
}

export async function setTicketStatus(fd: FormData): Promise<FormResult> {
  await requireAdmin();
  const status = ["open", "answered", "closed"].includes(text(fd, "status")) ? text(fd, "status") : "closed";
  await query("UPDATE tickets SET status = $2, updated_at = now() WHERE id = $1", [int(fd, "ticket"), status]);
  revalidatePath("/admin", "layout");
  return { ok: `Ticket marked ${status}.` };
}

// ---------- Settings ----------

export async function updateSettings(fd: FormData): Promise<FormResult> {
  await requireAdmin();
  const current = await getSettings();
  const next: Settings = {
    siteName: text(fd, "siteName").slice(0, 60) || current.siteName,
    heroTitle: text(fd, "heroTitle").slice(0, 120) || current.heroTitle,
    heroSubtitle: text(fd, "heroSubtitle").slice(0, 400),
    currencyCode: text(fd, "currencyCode").toUpperCase().slice(0, 6) || "USD",
    currencySymbol: text(fd, "currencySymbol").slice(0, 6) || "$",
    announcement: text(fd, "announcement").slice(0, 500),
    registrationOpen: bool(fd, "registrationOpen"),
    supportEmail: text(fd, "supportEmail").slice(0, 200),
    terms: text(fd, "terms").slice(0, 20000),
  };
  await saveSettings(next);
  revalidatePath("/", "layout");
  return { ok: "Settings saved." };
}
