import type { DataStatus } from "@/lib/types";
import { SourceBadge } from "./SourceBadge";

export function StatTile({
  label,
  value,
  sublabel,
  status,
  asOf,
  message,
}: {
  label: string;
  value: string;
  sublabel?: string;
  status: DataStatus;
  asOf: string;
  message?: string;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border p-4"
      style={{ background: "var(--surface)", borderColor: "var(--card-border)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        <SourceBadge status={status} asOf={asOf} message={message} />
      </div>
      <div className="tabular text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
      {sublabel ? (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {sublabel}
        </span>
      ) : null}
    </div>
  );
}
