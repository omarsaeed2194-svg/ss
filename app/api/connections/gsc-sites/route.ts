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
    const searchconsole = google.searchconsole({ version: "v1", auth });
    const { data } = await searchconsole.sites.list();

    const sites = (data.siteEntry ?? []).map((site) => ({
      siteUrl: site.siteUrl ?? "",
      permissionLevel: site.permissionLevel ?? "",
    }));

    return NextResponse.json({ sites });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list Search Console sites." },
      { status: 500 }
    );
  }
}
