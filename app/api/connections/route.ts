import { NextResponse } from "next/server";
import { getConnection, getSelection } from "@/lib/google/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const connection = getConnection();
  const selection = getSelection();

  return NextResponse.json({
    connected: Boolean(connection),
    email: connection?.email ?? null,
    ga4PropertyId: selection?.ga4PropertyId ?? null,
    gscSiteUrl: selection?.gscSiteUrl ?? null,
  });
}
