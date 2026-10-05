import Link from "next/link";

/** Prev/next links that keep the current filters. Fetch `perPage + 1` rows to know whether there is a next page. */
export function Pagination({
  page,
  hasNext,
  params,
}: {
  page: number;
  hasNext: boolean;
  params: Record<string, string | string[] | undefined>;
}) {
  if (page <= 1 && !hasNext) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (typeof v === "string" && v && k !== "page" && k !== "ok" && k !== "error") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `?${s}` : "?";
  };
  return (
    <div className="pagination">
      <span className="muted small">Page {page}</span>
      {page > 1 && (
        <Link className="btn btn-sm" href={href(page - 1)}>
          ← Previous
        </Link>
      )}
      {hasNext && (
        <Link className="btn btn-sm" href={href(page + 1)}>
          Next →
        </Link>
      )}
    </div>
  );
}

export function pageOf(searchParams: Record<string, string | string[] | undefined>) {
  const n = Number(searchParams.page);
  return Number.isInteger(n) && n > 0 ? n : 1;
}
