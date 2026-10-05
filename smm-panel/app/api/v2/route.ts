import { NextResponse } from "next/server";
import { userByApiKey, type User } from "@/lib/auth";
import { one, query } from "@/lib/db";
import { SERVICE_TYPE_LABEL, STATUS_LABEL, type ServiceType } from "@/lib/format";
import { placeOrder, requestCancel, requestRefill, UserError } from "@/lib/orders";
import { getSettings } from "@/lib/settings";

// Standard SMM panel API v2, so this panel works with any reseller tooling
// (and other panels can use it as a provider). Errors are returned as
// {"error": "..."} with HTTP 200, like the panels these clients are built for.

export const dynamic = "force-dynamic";

type Params = Record<string, string>;

async function readParams(req: Request): Promise<Params> {
  const params: Params = Object.fromEntries(new URL(req.url).searchParams);
  if (req.method !== "POST") return params;
  const type = req.headers.get("content-type") || "";
  try {
    if (type.includes("application/json")) {
      const body = (await req.json()) as Record<string, unknown>;
      for (const [k, v] of Object.entries(body ?? {})) if (v != null) params[k] = String(v);
    } else if (type.includes("form")) {
      for (const [k, v] of (await req.formData()).entries()) if (typeof v === "string") params[k] = v;
    }
  } catch {}
  return params;
}

const fail = (error: string) => NextResponse.json({ error });
const ids = (s: string | undefined) =>
  String(s ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 100);

async function orderStatus(user: User, id: string, currency: string) {
  const o = /^\d+$/.test(id)
    ? await one<{ charge: number; start_count: number | null; status: string; remains: number | null; quantity: number }>(
        "SELECT charge, start_count, status, remains, quantity FROM orders WHERE id = $1 AND user_id = $2",
        [Number(id), user.id]
      )
    : null;
  if (!o) return { error: "Incorrect order ID" };
  return {
    charge: Number(o.charge).toFixed(5),
    start_count: String(o.start_count ?? 0),
    status: STATUS_LABEL[o.status] ?? o.status,
    // Unknown remains on an unfinished order means nothing has been delivered yet.
    remains: String(o.remains ?? (o.status === "completed" ? 0 : o.quantity)),
    currency,
  };
}

async function handle(req: Request) {
  const p = await readParams(req);
  const user = await userByApiKey(p.key || "");
  if (!user) return fail("Invalid API key");
  const { currencyCode } = await getSettings();

  try {
    switch (p.action) {
      case "services": {
        const rows = await query<{
          id: number;
          name: string;
          type: ServiceType;
          category: string;
          rate: number;
          min: number;
          max: number;
          refill: boolean;
          cancel: boolean;
          description: string;
        }>(
          `SELECT s.id, s.name, s.type, c.name AS category, s.rate, s.min, s.max, s.refill, s.cancel, s.description
           FROM services s JOIN categories c ON c.id = s.category_id
           WHERE s.active AND c.active ORDER BY c.sort, c.id, s.sort, s.id`
        );
        return NextResponse.json(
          rows.map((s) => ({
            service: s.id,
            name: s.name,
            type: SERVICE_TYPE_LABEL[s.type] ?? "Default",
            category: s.category,
            rate: Number(s.rate).toFixed(4),
            min: String(s.min),
            max: String(s.max),
            refill: s.refill,
            cancel: s.cancel,
            dripfeed: false,
            desc: s.description,
          }))
        );
      }
      case "add": {
        const serviceId = Number(p.service);
        if (!Number.isInteger(serviceId)) return fail("Incorrect service ID");
        const res = await placeOrder(
          user.id,
          { serviceId, link: p.link, quantity: p.quantity ? Number(p.quantity) : undefined, comments: p.comments },
          "api"
        );
        return NextResponse.json({ order: res.orderId });
      }
      case "status": {
        if (p.orders) {
          const out: Record<string, unknown> = {};
          for (const id of ids(p.orders)) out[id] = await orderStatus(user, id, currencyCode);
          return NextResponse.json(out);
        }
        const status = await orderStatus(user, String(p.order ?? ""), currencyCode);
        return NextResponse.json(status);
      }
      case "balance":
        return NextResponse.json({ balance: Number(user.balance).toFixed(5), currency: currencyCode });
      case "refill": {
        if (p.orders) {
          const out = [];
          for (const id of ids(p.orders)) {
            try {
              out.push({ order: Number(id), refill: await requestRefill(user.id, Number(id)) });
            } catch (e) {
              out.push({ order: Number(id), refill: { error: e instanceof UserError ? e.message : "Refill failed" } });
            }
          }
          return NextResponse.json(out);
        }
        return NextResponse.json({ refill: await requestRefill(user.id, Number(p.order)) });
      }
      case "refill_status": {
        const list = p.refills ? ids(p.refills) : [String(p.refill ?? "")];
        const out = [];
        for (const id of list) {
          const r = /^\d+$/.test(id)
            ? await one<{ status: string }>("SELECT status FROM refills WHERE id = $1 AND user_id = $2", [Number(id), user.id])
            : null;
          out.push({ refill: Number(id), status: r ? STATUS_LABEL[r.status] ?? r.status : { error: "Refill not found" } });
        }
        return NextResponse.json(p.refills ? out : r1(out[0]));
      }
      case "cancel": {
        const out = [];
        for (const id of ids(p.orders ?? p.order)) {
          try {
            await requestCancel(user.id, Number(id));
            out.push({ order: Number(id), cancel: 1 });
          } catch (e) {
            out.push({ order: Number(id), cancel: { error: e instanceof UserError ? e.message : "Cancel failed" } });
          }
        }
        return NextResponse.json(out);
      }
      default:
        return fail("Incorrect request");
    }
  } catch (e) {
    if (e instanceof UserError) return fail(e.message);
    console.error("API v2 error", e);
    return fail("Internal error, please try again");
  }
}

function r1(entry: { status: unknown }) {
  return typeof entry.status === "string" ? { status: entry.status } : (entry.status as object);
}

export const GET = handle;
export const POST = handle;
