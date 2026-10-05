"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { money } from "@/lib/format";
import { placeOrder, requestCancel, requestRefill, UserError } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import type { FormResult } from "./auth";

async function run<T>(fn: () => Promise<T>): Promise<{ error: string } | { value: T }> {
  try {
    return { value: await fn() };
  } catch (e) {
    if (e instanceof UserError) return { error: e.message };
    console.error(e);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function newOrder(fd: FormData): Promise<FormResult & { orderId?: number }> {
  const user = await requireUser();
  const res = await run(() =>
    placeOrder(
      user.id,
      {
        serviceId: Number(fd.get("service")),
        link: String(fd.get("link") ?? ""),
        quantity: fd.get("quantity") ? Number(fd.get("quantity")) : undefined,
        comments: String(fd.get("comments") ?? ""),
      },
      "web"
    )
  );
  if ("error" in res) return res;
  revalidatePath("/dashboard", "layout");
  const { currencySymbol } = await getSettings();
  return {
    ok: `Order #${res.value.orderId} placed — charged ${money(res.value.charge, currencySymbol)}. New balance: ${money(res.value.balance, currencySymbol)}.`,
    orderId: res.value.orderId,
  };
}

export async function massOrder(fd: FormData): Promise<FormResult> {
  const user = await requireUser();
  const lines = String(fd.get("orders") ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return { error: "Add at least one order line." };
  if (lines.length > 100) return { error: "Up to 100 orders per batch." };
  const { currencySymbol } = await getSettings();
  const results: string[] = [];
  let ok = 0;
  for (const [i, line] of lines.entries()) {
    const [service, link, quantity] = line.split("|").map((p) => p.trim());
    const res = await run(() => placeOrder(user.id, { serviceId: Number(service), link, quantity: Number(quantity) }, "mass"));
    if ("error" in res) results.push(`Line ${i + 1}: ${res.error}`);
    else {
      ok++;
      results.push(`Line ${i + 1}: order #${res.value.orderId} — ${money(res.value.charge, currencySymbol)}`);
    }
  }
  revalidatePath("/dashboard", "layout");
  const summary = `${ok} of ${lines.length} orders placed.\n\n${results.join("\n")}`;
  return ok === lines.length ? { ok: summary } : { error: summary };
}

export async function refillOrder(fd: FormData): Promise<FormResult> {
  const user = await requireUser();
  const res = await run(() => requestRefill(user.id, Number(fd.get("order"))));
  revalidatePath("/dashboard/orders");
  return "error" in res ? res : { ok: `Refill requested for order #${fd.get("order")}.` };
}

export async function cancelOrder(fd: FormData): Promise<FormResult> {
  const user = await requireUser();
  const res = await run(() => requestCancel(user.id, Number(fd.get("order"))));
  revalidatePath("/dashboard", "layout");
  if ("error" in res) return res;
  return { ok: res.value === "canceled" ? `Order #${fd.get("order")} canceled and refunded.` : `Cancellation requested for order #${fd.get("order")}.` };
}
