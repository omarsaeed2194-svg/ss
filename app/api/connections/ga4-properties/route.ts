import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getConnection } from "@/lib/google/session";
import { clientFromRefreshToken } from "@/lib/google/oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  const connection = getConnection();
  if (!connection) {
    return NextResponse.json({ error: "Not connected." }, { status: 401 });
  }

  try {
    const auth = clientFromRefreshToken(connection.refreshToken);
    const admin = google.analyticsadmin({ version: "v1beta", auth });
    const { data } = await admin.accountSummaries.list({ pageSize: 200 });

    const properties = (data.accountSummaries ?? []).flatMap((account) =>
      (account.propertySummaries ?? []).map((property) => ({
        propertyId: (property.property ?? "").replace("properties/", ""),
        displayName: property.displayName ?? property.property ?? "",
        accountName: account.displayName ?? "",
      }))
    );

    return NextResponse.json({ properties });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list GA4 properties." },
      { status: 500 }
    );
  }
}
