import { google } from "googleapis";
import type { GA4Channel, GA4Data, GA4TopPage, GA4TrendPoint } from "@/lib/types";
import { demoGA4Trend, demoGA4Channels, demoGA4TopPages } from "@/lib/demo-data";
import { getConnection, getSelection } from "@/lib/google/session";
import { clientFromRefreshToken } from "@/lib/google/oauth";

function sumMetric(rows: { metricValues?: { value?: string | null }[] | null }[], index: number) {
  return rows.reduce((acc, row) => acc + Number(row.metricValues?.[index]?.value ?? 0), 0);
}

export async function getGA4Data(): Promise<GA4Data> {
  const connection = getConnection();
  const propertyId = getSelection()?.ga4PropertyId;

  if (!connection || !propertyId) {
    return {
      meta: {
        status: "demo",
        asOf: new Date().toISOString(),
        message: connection
          ? "Pick a GA4 property on the Connect page to see live data."
          : "Connect your Google account on the Connect page to see live GA4 data.",
      },
      totals: {
        sessions: demoGA4Trend.reduce((a, p) => a + p.sessions, 0),
        activeUsers: demoGA4Trend.reduce((a, p) => a + p.activeUsers, 0),
        conversions: demoGA4Trend.reduce((a, p) => a + p.conversions, 0),
        engagementRate: 0.61,
      },
      trend: demoGA4Trend,
      channels: demoGA4Channels,
      topPages: demoGA4TopPages,
    };
  }

  try {
    const auth = clientFromRefreshToken(connection.refreshToken);
    const analyticsData = google.analyticsdata({ version: "v1beta", auth });
    const property = `properties/${propertyId}`;

    const [trendRes, channelRes, pagesRes] = await Promise.all([
      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "conversions" }],
          orderBys: [{ dimension: { dimensionName: "date" } }],
        },
      }),
      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }, { name: "engagementRate" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: "8",
        },
      }),
      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "sessions" }, { name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: "10",
        },
      }),
    ]);

    const trendRows = trendRes.data.rows ?? [];
    const trend: GA4TrendPoint[] = trendRows.map((row) => {
      const raw = row.dimensionValues?.[0]?.value ?? "";
      const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      return {
        date,
        sessions: Number(row.metricValues?.[0]?.value ?? 0),
        activeUsers: Number(row.metricValues?.[1]?.value ?? 0),
        conversions: Number(row.metricValues?.[2]?.value ?? 0),
      };
    });

    const channels: GA4Channel[] = (channelRes.data.rows ?? []).map((row) => ({
      channel: row.dimensionValues?.[0]?.value ?? "Unknown",
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      engagementRate: Number(row.metricValues?.[1]?.value ?? 0),
    }));

    const topPages: GA4TopPage[] = (pagesRes.data.rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? "/",
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      activeUsers: Number(row.metricValues?.[1]?.value ?? 0),
    }));

    const avgEngagement =
      channels.length > 0 ? channels.reduce((a, c) => a + c.engagementRate, 0) / channels.length : 0;

    return {
      meta: { status: "live", asOf: new Date().toISOString() },
      totals: {
        sessions: sumMetric(trendRows, 0),
        activeUsers: sumMetric(trendRows, 1),
        conversions: sumMetric(trendRows, 2),
        engagementRate: avgEngagement,
      },
      trend,
      channels,
      topPages,
    };
  } catch (err) {
    return {
      meta: {
        status: "error",
        asOf: new Date().toISOString(),
        message: err instanceof Error ? err.message : "Failed to fetch GA4 data",
      },
      totals: { sessions: 0, activeUsers: 0, conversions: 0, engagementRate: 0 },
      trend: [],
      channels: [],
      topPages: [],
    };
  }
}
