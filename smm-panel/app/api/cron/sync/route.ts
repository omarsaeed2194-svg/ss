import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { syncOrders, syncRefills } from "@/lib/orders";
import { providerCall } from "@/lib/provider";

// Background sync: order statuses, refill statuses and provider balances.
// Call every few minutes with `Authorization: Bearer $CRON_SECRET` (what
// Vercel Cron sends) or `?secret=$CRON_SECRET`.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || new URL(req.url).searchParams.get("secret");
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set on the server." }, { status: 503 });
  if (given !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await syncOrders({ limit: 1000 });
  const refills = await syncRefills();
  const providers = await query<{ id: number; api_url: string; api_key: string }>("SELECT id, api_url, api_key FROM providers");
  for (const p of providers) {
    try {
      const res = await providerCall<{ balance?: string; currency?: string }>(p, "balance", {}, 10000);
      await query("UPDATE providers SET balance = $2, currency = $3, balance_checked_at = now() WHERE id = $1", [
        p.id,
        Number(res.balance) || 0,
        res.currency ?? null,
      ]);
    } catch {}
  }
  return NextResponse.json({ ok: true, orders, refills });
}

export const GET = handle;
export const POST = handle;
