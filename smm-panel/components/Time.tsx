"use client";

// Renders in the viewer's own timezone; the server's render is replaced on hydration.
export function Time({ value, dateOnly }: { value: Date | string | null | undefined; dateOnly?: boolean }) {
  if (!value) return <>—</>;
  const d = new Date(value);
  const text = dateOnly
    ? d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <time dateTime={d.toISOString()} suppressHydrationWarning className="nowrap">
      {text}
    </time>
  );
}
