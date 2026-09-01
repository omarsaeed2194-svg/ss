import { NextRequest, NextResponse } from "next/server";
import { saveSelection } from "@/lib/google/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  saveSelection({
    ga4PropertyId: typeof body.ga4PropertyId === "string" ? body.ga4PropertyId : undefined,
    gscSiteUrl: typeof body.gscSiteUrl === "string" ? body.gscSiteUrl : undefined,
  });
  return NextResponse.json({ ok: true });
}
