import Link from "next/link";
import { Icon } from "@/components/icons";
import type { NavItem } from "@/components/NavLinks";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";
import { one } from "@/lib/db";
import { money } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const s = await getSettings();
  const answered = await one<{ n: number }>("SELECT count(*) AS n FROM tickets WHERE user_id = $1 AND status = 'answered'", [user.id]);
  const items: NavItem[] = [
    { href: "/dashboard", label: "New order", icon: "cart", exact: true },
    { href: "/dashboard/mass-order", label: "Mass order", icon: "stack" },
    { href: "/dashboard/orders", label: "Orders", icon: "list" },
    { href: "/dashboard/services", label: "Services", icon: "grid" },
    { href: "/dashboard/funds", label: "Add funds", icon: "wallet" },
    { href: "/dashboard/tickets", label: "Support", icon: "ticket", count: answered?.n },
    { href: "/dashboard/api", label: "API", icon: "code" },
    { href: "/dashboard/account", label: "Account", icon: "user" },
  ];
  if (user.role === "admin") items.push({ href: "/admin", label: "Admin panel", icon: "settings", section: "Staff" });

  return (
    <Shell
      siteName={s.siteName}
      homeHref="/dashboard"
      items={items}
      right={
        <>
          <span className="muted small nowrap">{user.username}</span>
          <Link href="/dashboard/funds" className="balance-pill" title="Balance — add funds">
            <Icon name="wallet" size={16} />
            {money(user.balance, s.currencySymbol)}
          </Link>
        </>
      }
      footer={
        <div className="small" style={{ padding: "0 12px", opacity: 0.7 }}>
          Signed in as {user.username}
        </div>
      }
    >
      {s.announcement && <div className="alert alert-info">{s.announcement}</div>}
      {children}
    </Shell>
  );
}
