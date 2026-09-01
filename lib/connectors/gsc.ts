import { google } from "googleapis";
import type { GSCData, GSCPage, GSCQuery, GSCTrendPoint } from "@/lib/types";
import { demoGSCTrend, demoGSCQueries, demoGSCPages } from "@/lib/demo-data";
import { getConnection, getSelection } from "@/lib/google/session";
import { clientFromRefreshToken } from "@/lib/google/oauth";

function totals(rows: { clicks?: number; impressions?: number; ctr?: number; position?: number }[]) {
  const clicks = rows.reduce((a, r) => a + (r.clicks ?? 0), 0);
  const impressions = rows.reduce((a, r) => a + (r.impressions ?? 0), 0);
  const ctr = impressions > 0 ? clicks / impressions : 0;
  const position = rows.length > 0 ? rows.reduce((a, r) => a + (r.position ?? 0), 0) / rows.length : 0;
  return { clicks, impressions, ctr, position };
}

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export async function getGSCData(): Promise<GSCData> {
  const connection = getConnection();
  const siteUrl = getSelection()?.gscSiteUrl;

  if (!connection || !siteUrl) {
    return {
      meta: {
        status: "demo",
        asOf: new Date().toISOString(),
        message: connection
          ? "Pick a Search Console site on the Connect page to see live data."
          : "Connect your Google account on the Connect page to see live Search Console data.",
      },
      totals: totals(demoGSCTrend),
      trend: demoGSCTrend,
      topQueries: demoGSCQueries,
      topPages: demoGSCPages,
    };
  }

  try {
    const auth = clientFromRefreshToken(connection.refreshToken);
    const searchconsole = google.searchconsole({ version: "v1", auth });

    const [trendRes, queryRes, pageRes] = await Promise.all([
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate: dateNDaysAgo(28), endDate: dateNDaysAgo(1), dimensions: ["date"] },
      }),
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate: dateNDaysAgo(28), endDate: dateNDaysAgo(1), dimensions: ["query"], rowLimit: 20 },
      }),
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate: dateNDaysAgo(28), endDate: dateNDaysAgo(1), dimensions: ["page"], rowLimit: 15 },
      }),
    ]);

    const trend: GSCTrendPoint[] = (trendRes.data.rows ?? []).map((row) => ({
      date: row.keys?.[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));

    const topQueries: GSCQuery[] = (queryRes.data.rows ?? []).map((row) => ({
      query: row.keys?.[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));

    const topPages: GSCPage[] = (pageRes.data.rows ?? []).map((row) => ({
      page: row.keys?.[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));

    return {
      meta: { status: "live", asOf: new Date().toISOString() },
      totals: totals(trend),
      trend,
      topQueries,
      topPages,
    };
  } catch (err) {
    return {
      meta: {
        status: "error",
        asOf: new Date().toISOString(),
        message: err instanceof Error ? err.message : "Failed to fetch Search Console data",
      },
      totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      trend: [],
      topQueries: [],
      topPages: [],
    };
  }
}
