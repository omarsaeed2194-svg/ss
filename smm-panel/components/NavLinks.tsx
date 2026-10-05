"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  count?: number;
  exact?: boolean;
  section?: string;
}

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav>
      {items.map((item) => (
        <div key={item.href} style={{ display: "contents" }}>
          {item.section && <div className="nav-label">{item.section}</div>}
          <Link href={item.href} className={isActive(pathname, item) ? "active" : ""}>
            <Icon name={item.icon} />
            {item.label}
            {!!item.count && <span className="count">{item.count}</span>}
          </Link>
        </div>
      ))}
    </nav>
  );
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="mobile-nav">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={isActive(pathname, item) ? "active" : ""}>
          {item.label}
          {!!item.count && ` (${item.count})`}
        </Link>
      ))}
    </nav>
  );
}
