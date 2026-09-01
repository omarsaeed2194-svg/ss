import { NextResponse } from "next/server";
import { getUbersuggestData } from "@/lib/connectors/ubersuggest";
import { getGA4Data } from "@/lib/connectors/ga4";
import { getGSCData } from "@/lib/connectors/gsc";
import type { DashboardOverview } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DOMAIN = process.env.TARGET_DOMAIN ?? "localization.saudisoft.com";

export async function GET() {
  const [ubersuggest, ga4, searchConsole] = await Promise.all([
    getUbersuggestData(),
    getGA4Data(),
    getGSCData(),
  ]);

  const body: DashboardOverview = {
    domain: DOMAIN,
    generatedAt: new Date().toISOString(),
    ubersuggest,
    ga4,
    searchConsole,
  };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store" },
  });
}
