"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireUser, SESSION_COOKIE } from "@/lib/auth";
import { hashPassword, newApiKey, sha256, verifyPassword } from "@/lib/crypto";
import { one, query } from "@/lib/db";
import { money } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import type { FormResult } from "./auth";

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function createPayment(fd: FormData): Promise<FormResult> {
  const user = await requireUser();
  const method = await one<{ id: number; name: string; min_amount: number }>(
    "SELECT id, name, min_amount FROM payment_methods WHERE id = $1 AND active",
    [Number(fd.get("method"))]
  );
  if (!method) return { error: "Choose a payment method." };
  const amount = Math.round(Number(fd.get("amount")) * 100) / 100;
  const { currencySymbol } = await getSettings();
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Enter an amount." };
  if (amount < Number(method.min_amount)) return { error: `The minimum for ${method.name} is ${money(method.min_amount, currencySymbol)}.` };
  if (amount > 100000) return { error: "That amount is too large — contact support." };
  const reference = text(fd, "reference").slice(0, 300);
  if (!reference) return { error: "Enter the transaction ID / reference of your payment." };
  const pending = await one<{ n: number }>("SELECT count(*) AS n FROM payments WHERE user_id = $1 AND status = 'pending'", [user.id]);
  if ((pending?.n ?? 0) >= 5) return { error: "You already have 5 payments waiting for review. Please wait until they're processed." };
  await query("INSERT INTO payments (user_id, method_id, method_name, amount, reference) VALUES ($1, $2, $3, $4, $5)", [
    user.id,
    method.id,
    method.name,
    amount,
    reference,
  ]);
  revalidatePath("/dashboard/funds");
  return { ok: "Payment submitted. Your balance will be updated as soon as it's confirmed." };
}

export async function changePassword(fd: FormData): Promise<FormResult> {
  const user = await requireUser();
  const row = await one<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = $1", [user.id]);
  if (!row || !(await verifyPassword(String(fd.get("current") ?? ""), row.password_hash))) return { error: "Current password is wrong." };
  const next = String(fd.get("password") ?? "");
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  if (next !== String(fd.get("confirm") ?? "")) return { error: "The new passwords don't match." };
  await query("UPDATE users SET password_hash = $2 WHERE id = $1", [user.id, await hashPassword(next)]);
  // Sign out every other device.
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  await query("DELETE FROM sessions WHERE user_id = $1 AND token_hash <> $2", [user.id, sha256(token)]);
  return { ok: "Password updated. Other devices have been signed out." };
}

export async function regenerateApiKey(): Promise<FormResult> {
  const user = await requireUser();
  await query("UPDATE users SET api_key = $2 WHERE id = $1", [user.id, newApiKey()]);
  revalidatePath("/dashboard/api");
  return { ok: "New API key generated. The old key no longer works." };
}

export async function openTicket(fd: FormData): Promise<FormResult> {
  const user = await requireUser();
  const topic = text(fd, "topic");
  const orderIds = text(fd, "orders").slice(0, 200);
  const subject = [topic || "Other", orderIds && `#${orderIds.replace(/[^\d,\s]/g, "")}`].filter(Boolean).join(" ").slice(0, 150);
  const body = text(fd, "message").slice(0, 5000);
  if (body.length < 5) return { error: "Please describe your request." };
  const open = await one<{ n: number }>("SELECT count(*) AS n FROM tickets WHERE user_id = $1 AND status <> 'closed'", [user.id]);
  if ((open?.n ?? 0) >= 10) return { error: "You have too many open tickets. Please wait for a reply on the existing ones." };
  const ticket = await one<{ id: number }>("INSERT INTO tickets (user_id, subject) VALUES ($1, $2) RETURNING id", [user.id, subject]);
  await query("INSERT INTO ticket_messages (ticket_id, user_id, body) VALUES ($1, $2, $3)", [ticket!.id, user.id, body]);
  revalidatePath("/dashboard/tickets");
  return { ok: `Ticket #${ticket!.id} opened. We'll reply here as soon as possible.` };
}

export async function replyTicket(fd: FormData): Promise<FormResult> {
  const user = await requireUser();
  const id = Number(fd.get("ticket"));
  const body = text(fd, "message").slice(0, 5000);
  if (!body) return { error: "Write a message first." };
  const ticket = await one("SELECT id FROM tickets WHERE id = $1 AND user_id = $2", [id, user.id]);
  if (!ticket) return { error: "Ticket not found." };
  await query("INSERT INTO ticket_messages (ticket_id, user_id, body) VALUES ($1, $2, $3)", [id, user.id, body]);
  await query("UPDATE tickets SET status = 'open', updated_at = now() WHERE id = $1", [id]);
  revalidatePath(`/dashboard/tickets/${id}`);
  return { ok: "Reply sent." };
}

export async function closeTicket(fd: FormData): Promise<FormResult> {
  const user = await requireUser();
  const id = Number(fd.get("ticket"));
  await query("UPDATE tickets SET status = 'closed', updated_at = now() WHERE id = $1 AND user_id = $2", [id, user.id]);
  revalidatePath(`/dashboard/tickets/${id}`);
  revalidatePath("/dashboard", "layout");
  return { ok: "Ticket closed." };
}
