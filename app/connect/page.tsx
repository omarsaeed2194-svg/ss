"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";

interface ConnectionStatus {
  connected: boolean;
  email: string | null;
  ga4PropertyId: string | null;
  gscSiteUrl: string | null;
}

interface GA4Property {
  propertyId: string;
  displayName: string;
  accountName: string;
}

interface GSCSite {
  siteUrl: string;
  permissionLevel: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state: "Connection failed (invalid state) — please try again.",
  no_refresh_token:
    "Google didn't return a refresh token. Remove this app's access at myaccount.google.com/permissions, then try connecting again.",
  oauth_failed: "Could not complete the Google sign-in.",
};

export default function ConnectPage() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [properties, setProperties] = useState<GA4Property[] | null>(null);
  const [sites, setSites] = useState<GSCSite[] | null>(null);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (params.get("connected")) setBanner("Google account connected.");
    else if (error) setBanner(ERROR_MESSAGES[error] ?? decodeURIComponent(error));
    if (params.toString()) window.history.replaceState({}, "", "/connect");
  }, []);

  useEffect(() => {
    fetch("/api/connections")
      .then((r) => r.json())
      .then((data: ConnectionStatus) => {
        setStatus(data);
        setSelectedProperty(data.ga4PropertyId ?? "");
        setSelectedSite(data.gscSiteUrl ?? "");
      });
  }, []);

  useEffect(() => {
    if (!status?.connected) return;
    setListError(null);
    Promise.all([
      fetch("/api/connections/ga4-properties").then((r) => r.json()),
      fetch("/api/connections/gsc-sites").then((r) => r.json()),
    ])
      .then(([ga4, gsc]) => {
        if (ga4.error || gsc.error) {
          setListError(ga4.error ?? gsc.error);
          return;
        }
        setProperties(ga4.properties);
        setSites(gsc.sites);
      })
      .catch(() => setListError("Failed to load your GA4 properties and Search Console sites."));
  }, [status?.connected]);

  async function saveSelection() {
    setSaving(true);
    await fetch("/api/connections/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ga4PropertyId: selectedProperty, gscSiteUrl: selectedSite }),
    });
    setSaving(false);
    setBanner("Selection saved — the dashboard will pick it up on its next refresh.");
  }

  async function disconnect() {
    await fetch("/api/auth/google/disconnect", { method: "POST" });
    window.location.reload();
  }

  const selectClass = "w-full rounded-md border px-2 py-1.5 text-sm";
  const selectStyle = { borderColor: "var(--card-border)", background: "var(--surface)", color: "var(--text-primary)" };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Connect Google data
        </h1>
        <Link href="/" className="text-sm" style={{ color: "var(--text-secondary)" }}>
          ← Back to dashboard
        </Link>
      </div>

      {banner ? (
        <div
          className="mb-4 rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
        >
          {banner}
        </div>
      ) : null}

      {!status ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Loading…
        </p>
      ) : !status.connected ? (
        <Card title="Google account">
          <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            Sign in with the Google account that already has access to your GA4 property and Search
            Console site. This uses a normal Google sign-in popup — no service account, JSON key, or
            manually granting access to a robot account required.
          </p>
          <a
            href="/api/auth/google/start"
            className="inline-block rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: "var(--series-1)" }}
          >
            Connect Google account
          </a>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <Card title="Google account">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Connected as <strong style={{ color: "var(--text-primary)" }}>{status.email ?? "your Google account"}</strong>
              </p>
              <button
                onClick={disconnect}
                className="rounded-md border px-3 py-1.5 text-sm"
                style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
              >
                Disconnect
              </button>
            </div>
          </Card>

          <Card title="Data sources">
            {listError ? (
              <p className="text-sm" style={{ color: "var(--critical)" }}>
                {listError}
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    GA4 property
                  </label>
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className={selectClass}
                    style={selectStyle}
                  >
                    <option value="">{properties ? "Select a property…" : "Loading…"}</option>
                    {properties?.map((p) => (
                      <option key={p.propertyId} value={p.propertyId}>
                        {p.accountName} — {p.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Search Console site
                  </label>
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className={selectClass}
                    style={selectStyle}
                  >
                    <option value="">{sites ? "Select a site…" : "Loading…"}</option>
                    {sites?.map((s) => (
                      <option key={s.siteUrl} value={s.siteUrl}>
                        {s.siteUrl}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={saveSelection}
                  disabled={saving || (!selectedProperty && !selectedSite)}
                  className="self-start rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: "var(--series-1)" }}
                >
                  {saving ? "Saving…" : "Save selection"}
                </button>
              </div>
            )}
          </Card>
        </div>
      )}
    </main>
  );
}
