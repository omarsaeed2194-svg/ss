export interface Column<T> {
  header: string;
  align?: "left" | "right";
  render: (row: T) => string;
}

export function DataTable<T>({ columns, rows, emptyMessage }: { columns: Column<T>[]; rows: T[]; emptyMessage: string }) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr style={{ borderBottom: `1px solid var(--grid)` }}>
            {columns.map((col) => (
              <th
                key={col.header}
                className="whitespace-nowrap py-2 pr-4 text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--text-muted)", textAlign: col.align ?? "left" }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid var(--grid)` }}>
              {columns.map((col) => (
                <td
                  key={col.header}
                  className="tabular whitespace-nowrap py-2 pr-4"
                  style={{ color: "var(--text-secondary)", textAlign: col.align ?? "left" }}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
