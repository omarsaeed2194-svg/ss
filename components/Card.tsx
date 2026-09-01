import type { ReactNode } from "react";
import type { DataStatus } from "@/lib/types";
import { SourceBadge } from "./SourceBadge";

export function Card({
  title,
  status,
  asOf,
  message,
  children,
}: {
  title: string;
  status?: DataStatus;
  asOf?: string;
  message?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--surface)", borderColor: "var(--card-border)" }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        {status ? <SourceBadge status={status} asOf={asOf ?? ""} message={message} /> : null}
      </div>
      {children}
    </div>
  );
}
