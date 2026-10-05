// Shows the ?ok= / ?error= message that server actions redirect back with.
export function Flash({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const ok = searchParams?.ok;
  const error = searchParams?.error;
  return (
    <>
      {typeof ok === "string" && ok && <div className="alert alert-success">{ok}</div>}
      {typeof error === "string" && error && <div className="alert alert-error">{error}</div>}
    </>
  );
}
