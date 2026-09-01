export type DataStatus = "live" | "cached" | "demo" | "error";

export interface SourceMeta {
  status: DataStatus;
  asOf: string;
  message?: string;
}

export interface UbersuggestOverview {
  organicTraffic: number;
  organicKeywords: number;
  domainAuthority: number;
  backlinks: number;
  referringDomains: number;
  followBacklinks: number;
  noFollowBacklinks: number;
}

export interface UbersuggestTrendPoint {
  month: string;
  searchTraffic: number;
  searchKeywords: number;
}

export interface UbersuggestKeyword {
  keyword: string;
  position: number;
  volume: number;
  traffic: number;
  intent: string;
  url: string;
}

export interface UbersuggestPage {
  path: string;
  title: string;
  traffic: number;
  backlinks: number;
  referringDomains: number;
}

export interface UbersuggestData {
  meta: SourceMeta;
  overview: UbersuggestOverview;
  monthlyTrend: UbersuggestTrendPoint[];
  topKeywords: UbersuggestKeyword[];
  topPages: UbersuggestPage[];
}

export interface GA4TrendPoint {
  date: string;
  sessions: number;
  activeUsers: number;
  conversions: number;
}

export interface GA4Channel {
  channel: string;
  sessions: number;
  engagementRate: number;
}

export interface GA4TopPage {
  path: string;
  sessions: number;
  activeUsers: number;
}

export interface GA4Data {
  meta: SourceMeta;
  totals: {
    sessions: number;
    activeUsers: number;
    conversions: number;
    engagementRate: number;
  };
  trend: GA4TrendPoint[];
  channels: GA4Channel[];
  topPages: GA4TopPage[];
}

export interface GSCTrendPoint {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCData {
  meta: SourceMeta;
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  trend: GSCTrendPoint[];
  topQueries: GSCQuery[];
  topPages: GSCPage[];
}

export interface DashboardOverview {
  domain: string;
  generatedAt: string;
  ubersuggest: UbersuggestData;
  ga4: GA4Data;
  searchConsole: GSCData;
}
