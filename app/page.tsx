"use client";

import useSWR from "swr";
import { useMemo } from "react";
import { Card } from "@/components/Card";
import { StatTile } from "@/components/StatTile";
import { TrendChart } from "@/components/TrendChart";
import { DataTable } from "@/components/DataTable";
import type { DashboardOverview } from "@/lib/types";

const REFRESH_MS = 60_000;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function numberFmt(n: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

function pctFmt(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

export default function DashboardPage() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<DashboardOverview>(
    "/api/overview",
    fetcher,
    { refreshInterval: REFRESH_MS, revalidateOnFocus: true }
  );

  const gscTrend = useMemo(
    () => data?.searchConsole.trend.map((p) => ({ ...p, dateLabel: p.date.slice(5) })) ?? [],
    [data]
  );
  const ga4Trend = useMemo(
    () => data?.ga4.trend.map((p) => ({ ...p, dateLabel: p.date.slice(5) })) ?? [],
    [data]
  );
  const ubersuggestTrend = data?.ubersuggest.monthlyTrend ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            SEO Dashboard
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {data?.domain ?? "localization.saudisoft.com"} — Ubersuggest + GA4 + Search Console, combined
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
          {data ? <span>Generated {new Date(data.generatedAt).toLocaleTimeString()}</span> : null}
          <button
            onClick={() => mutate()}
            className="rounded-md border px-2.5 py-1 font-medium"
            style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
          >
            {isValidating ? "Refreshing…" : "Refresh now"}
          </button>
        </div>
      </header>

      {error ? (
        <Card title="Error">
          <p className="text-sm" style={{ color: "var(--critical)" }}>
            Could not load dashboard data. Retrying automatically.
          </p>
        </Card>
      ) : null}

      {!data && isLoading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Loading…
        </p>
      ) : null}

      {data ? (
        <div className="flex flex-col gap-6">
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile
              label="Organic traffic / mo"
              value={numberFmt(data.ubersuggest.overview.organicTraffic)}
              sublabel={`${numberFmt(data.ubersuggest.overview.organicKeywords)} ranking keywords`}
              status={data.ubersuggest.meta.status}
              asOf={data.ubersuggest.meta.asOf}
              message={data.ubersuggest.meta.message}
            />
            <StatTile
              label="Domain authority"
              value={String(data.ubersuggest.overview.domainAuthority)}
              status={data.ubersuggest.meta.status}
              asOf={data.ubersuggest.meta.asOf}
              message={data.ubersuggest.meta.message}
            />
            <StatTile
              label="Backlinks"
              value={numberFmt(data.ubersuggest.overview.backlinks)}
              sublabel={`${numberFmt(data.ubersuggest.overview.referringDomains)} referring domains`}
              status={data.ubersuggest.meta.status}
              asOf={data.ubersuggest.meta.asOf}
              message={data.ubersuggest.meta.message}
            />
            <StatTile
              label="GA4 sessions (28d)"
              value={numberFmt(data.ga4.totals.sessions)}
              sublabel={`${numberFmt(data.ga4.totals.activeUsers)} users · ${pctFmt(data.ga4.totals.engagementRate)} engaged`}
              status={data.ga4.meta.status}
              asOf={data.ga4.meta.asOf}
              message={data.ga4.meta.message}
            />
            <StatTile
              label="GSC clicks (28d)"
              value={numberFmt(data.searchConsole.totals.clicks)}
              sublabel={`${pctFmt(data.searchConsole.totals.ctr)} CTR`}
              status={data.searchConsole.meta.status}
              asOf={data.searchConsole.meta.asOf}
              message={data.searchConsole.meta.message}
            />
            <StatTile
              label="GSC impressions (28d)"
              value={numberFmt(data.searchConsole.totals.impressions)}
              sublabel={`avg. position ${data.searchConsole.totals.position.toFixed(1)}`}
              status={data.searchConsole.meta.status}
              asOf={data.searchConsole.meta.asOf}
              message={data.searchConsole.meta.message}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card title="GA4 — sessions & users (28d)" status={data.ga4.meta.status} asOf={data.ga4.meta.asOf} message={data.ga4.meta.message}>
              <TrendChart
                title=""
                data={ga4Trend}
                xKey="dateLabel"
                series={[
                  { key: "sessions", label: "Sessions", colorSlot: "series1" },
                  { key: "activeUsers", label: "Users", colorSlot: "series3" },
                ]}
                valueFormatter={numberFmt}
              />
            </Card>
            <Card title="Search Console — clicks (28d)" status={data.searchConsole.meta.status} asOf={data.searchConsole.meta.asOf} message={data.searchConsole.meta.message}>
              <TrendChart
                title=""
                data={gscTrend}
                xKey="dateLabel"
                series={[{ key: "clicks", label: "Clicks", colorSlot: "series2" }]}
                valueFormatter={numberFmt}
              />
            </Card>
            <Card title="Ubersuggest — organic traffic (12mo)" status={data.ubersuggest.meta.status} asOf={data.ubersuggest.meta.asOf} message={data.ubersuggest.meta.message}>
              <TrendChart
                title=""
                data={ubersuggestTrend}
                xKey="month"
                series={[{ key: "searchTraffic", label: "Est. traffic", colorSlot: "series4" }]}
                valueFormatter={numberFmt}
              />
            </Card>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Top ranking keywords (Ubersuggest)" status={data.ubersuggest.meta.status} asOf={data.ubersuggest.meta.asOf} message={data.ubersuggest.meta.message}>
              <DataTable
                emptyMessage="No keyword data available."
                rows={data.ubersuggest.topKeywords}
                columns={[
                  { header: "Keyword", render: (r) => r.keyword },
                  { header: "Pos", align: "right", render: (r) => String(r.position) },
                  { header: "Volume", align: "right", render: (r) => numberFmt(r.volume) },
                  { header: "Traffic", align: "right", render: (r) => numberFmt(r.traffic) },
                ]}
              />
            </Card>
            <Card title="Top search queries (Search Console)" status={data.searchConsole.meta.status} asOf={data.searchConsole.meta.asOf} message={data.searchConsole.meta.message}>
              <DataTable
                emptyMessage="No query data available."
                rows={data.searchConsole.topQueries}
                columns={[
                  { header: "Query", render: (r) => r.query },
                  { header: "Pos", align: "right", render: (r) => r.position.toFixed(1) },
                  { header: "Impr.", align: "right", render: (r) => numberFmt(r.impressions) },
                  { header: "Clicks", align: "right", render: (r) => numberFmt(r.clicks) },
                ]}
              />
            </Card>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Top pages by est. traffic (Ubersuggest)" status={data.ubersuggest.meta.status} asOf={data.ubersuggest.meta.asOf} message={data.ubersuggest.meta.message}>
              <DataTable
                emptyMessage="No page data available."
                rows={data.ubersuggest.topPages}
                columns={[
                  { header: "Page", render: (r) => r.path },
                  { header: "Traffic", align: "right", render: (r) => numberFmt(r.traffic) },
                  { header: "Backlinks", align: "right", render: (r) => numberFmt(r.backlinks) },
                ]}
              />
            </Card>
            <Card title="Sessions by channel (GA4, 28d)" status={data.ga4.meta.status} asOf={data.ga4.meta.asOf} message={data.ga4.meta.message}>
              <ChannelBars channels={data.ga4.channels} />
            </Card>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function ChannelBars({ channels }: { channels: DashboardOverview["ga4"]["channels"] }) {
  if (channels.length === 0) {
    return (
      <p className="py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        No channel data available.
      </p>
    );
  }
  const max = Math.max(...channels.map((c) => c.sessions), 1);
  return (
    <div className="flex flex-col gap-2.5">
      {channels.map((c) => (
        <div key={c.channel}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span style={{ color: "var(--text-secondary)" }}>{c.channel}</span>
            <span className="tabular" style={{ color: "var(--text-muted)" }}>
              {numberFmt(c.sessions)}
            </span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "var(--grid)" }}>
            <div
              className="h-2 rounded-full"
              style={{ width: `${(c.sessions / max) * 100}%`, background: "var(--series-1)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
