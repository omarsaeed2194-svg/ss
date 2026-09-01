import type { GA4Channel, GA4TopPage, GA4TrendPoint, GSCPage, GSCQuery, GSCTrendPoint } from "@/lib/types";

// Deterministic placeholder data shown only until real GA4 / Search Console
// credentials are configured (see README). Values are shaped to roughly
// match the site's real Ubersuggest-estimated traffic scale so the layout
// previews sensibly, and are clearly labeled "demo" in the API response.

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function last28Dates(): string[] {
  const dates: string[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const rand = seededRandom(42);
const dates = last28Dates();

export const demoGA4Trend: GA4TrendPoint[] = dates.map((date) => {
  const sessions = Math.round(6 + rand() * 10);
  return {
    date,
    sessions,
    activeUsers: Math.round(sessions * (0.75 + rand() * 0.15)),
    conversions: Math.round(rand() * 1.5),
  };
});

export const demoGA4Channels: GA4Channel[] = [
  { channel: "Organic Search", sessions: 178, engagementRate: 0.64 },
  { channel: "Direct", sessions: 62, engagementRate: 0.58 },
  { channel: "Referral", sessions: 24, engagementRate: 0.71 },
  { channel: "Organic Social", sessions: 15, engagementRate: 0.49 },
  { channel: "Unassigned", sessions: 5, engagementRate: 0.4 },
];

export const demoGA4TopPages: GA4TopPage[] = [
  { path: "/a-look-at-two-rare-languages-hassaniya-and-yiddish/", sessions: 41, activeUsers: 36 },
  { path: "/5-facts-to-know-about-arabic-language/", sessions: 33, activeUsers: 29 },
  { path: "/middle-eastern-languages-localization/", sessions: 27, activeUsers: 24 },
  { path: "/african-languages-beyond-the-surface/", sessions: 16, activeUsers: 14 },
  { path: "/the-education-system-in-the-middle-east/", sessions: 6, activeUsers: 5 },
];

export const demoGSCTrend: GSCTrendPoint[] = dates.map((date) => {
  const impressions = Math.round(60 + rand() * 90);
  const clicks = Math.round(impressions * (0.03 + rand() * 0.05));
  return {
    date,
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: Math.round((18 + rand() * 14) * 10) / 10,
  };
});

export const demoGSCQueries: GSCQuery[] = [
  { query: "hassaniya arabic", clicks: 9, impressions: 210, ctr: 0.043, position: 5.2 },
  { query: "ksa language", clicks: 6, impressions: 480, ctr: 0.0125, position: 34.1 },
  { query: "african languages", clicks: 5, impressions: 640, ctr: 0.0078, position: 41.7 },
  { query: "middle eastern languages localization", clicks: 4, impressions: 95, ctr: 0.042, position: 12.4 },
  { query: "saudi arabia language", clicks: 3, impressions: 140, ctr: 0.021, position: 24.8 },
  { query: "vendor management in localization", clicks: 2, impressions: 60, ctr: 0.033, position: 18.9 },
  { query: "sap translator", clicks: 1, impressions: 30, ctr: 0.033, position: 13.2 },
];

export const demoGSCPages: GSCPage[] = [
  { page: "/a-look-at-two-rare-languages-hassaniya-and-yiddish/", clicks: 12, impressions: 260, ctr: 0.046, position: 5.6 },
  { page: "/5-facts-to-know-about-arabic-language/", clicks: 9, impressions: 610, ctr: 0.015, position: 29.3 },
  { page: "/middle-eastern-languages-localization/", clicks: 8, impressions: 340, ctr: 0.024, position: 21.1 },
  { page: "/african-languages-beyond-the-surface/", clicks: 5, impressions: 660, ctr: 0.0076, position: 42.0 },
  { page: "/the-education-system-in-the-middle-east/", clicks: 2, impressions: 40, ctr: 0.05, position: 4.5 },
];
