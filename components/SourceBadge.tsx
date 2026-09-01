import type { DataStatus } from "@/lib/types";

const LABEL: Record<DataStatus, string> = {
  live: "Live",
  cached: "Cached",
  demo: "Demo data",
  error: "Error",
};

const DOT_COLOR: Record<DataStatus, string> = {
  live: "var(--good)",
  cached: "var(--series-1)",
  demo: "var(--warning)",
  error: "var(--critical)",
};

export function SourceBadge({ status, asOf, message }: { status: DataStatus; asOf: string; message?: string }) {
  const time = new Date(asOf);
  const formatted = Number.isNaN(time.getTime()) ? "" : time.toLocaleString();

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
      style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
      title={message ? `${message} (as of ${formatted})` : `As of ${formatted}`}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: DOT_COLOR[status] }}
      />
      {LABEL[status]}
    </span>
  );
}
