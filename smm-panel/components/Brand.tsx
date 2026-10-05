import Link from "next/link";

export function Brand({ name, href = "/" }: { name: string; href?: string }) {
  return (
    <Link href={href} className="brand">
      <span className="brand-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m4 15 5-5 4 4 7-7M14 7h6v6" />
        </svg>
      </span>
      {name}
    </Link>
  );
}
