import type { GA4Data, GA4Channel, GA4TopPage, GA4TrendPoint } from "@/lib/types";
import { demoGA4Trend, demoGA4Channels, demoGA4TopPages } from "@/lib/demo-data";

function getCredentials() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!propertyId || !clientEmail || !privateKey) return null;
  return { propertyId, clientEmail, privateKey };
}

function sum(rows: { metricValues?: { value?: string | null }[] | null }[] | undefined, index: number) {
  if (!rows) return 0;
  return rows.reduce((acc, row) => acc + Number(row.metricValues?.[index]?.value ?? 0), 0);
}

export async function getGA4Data(): Promise<GA4Data> {
  const creds = getCredentials();

  if (!creds) {
    return {
      meta: {
        status: "demo",
        asOf: new Date().toISOString(),
        message: "Set GA4_PROPERTY_ID, GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY to connect live GA4 data.",
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
    // Lazy import so the package is only required when live credentials exist.
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
    const client = new BetaAnalyticsDataClient({
      credentials: { client_email: creds.clientEmail, private_key: creds.privateKey },
    });
    const property = `properties/${creds.propertyId}`;

    const [trendReport] = await client.runReport({
      property,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "conversions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const [channelReport] = await client.runReport({
      property,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }, { name: "engagementRate" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    });

    const [pagesReport] = await client.runReport({
      property,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    });

    const trend: GA4TrendPoint[] = (trendReport.rows ?? []).map((row) => {
      const raw = row.dimensionValues?.[0]?.value ?? "";
      const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      return {
        date,
        sessions: Number(row.metricValues?.[0]?.value ?? 0),
        activeUsers: Number(row.metricValues?.[1]?.value ?? 0),
        conversions: Number(row.metricValues?.[2]?.value ?? 0),
      };
    });

    const channels: GA4Channel[] = (channelReport.rows ?? []).map((row) => ({
      channel: row.dimensionValues?.[0]?.value ?? "Unknown",
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      engagementRate: Number(row.metricValues?.[1]?.value ?? 0),
    }));

    const topPages: GA4TopPage[] = (pagesReport.rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? "/",
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      activeUsers: Number(row.metricValues?.[1]?.value ?? 0),
    }));

    const totalSessions = sum(trendReport.rows ?? undefined, 0);
    const totalUsers = sum(trendReport.rows ?? undefined, 1);
    const totalConversions = sum(trendReport.rows ?? undefined, 2);
    const avgEngagement =
      channels.length > 0 ? channels.reduce((a, c) => a + c.engagementRate, 0) / channels.length : 0;

    return {
      meta: { status: "live", asOf: new Date().toISOString() },
      totals: {
        sessions: totalSessions,
        activeUsers: totalUsers,
        conversions: totalConversions,
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
