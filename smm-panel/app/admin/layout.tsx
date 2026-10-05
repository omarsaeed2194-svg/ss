import type { NavItem } from "@/components/NavLinks";
import { Shell } from "@/components/Shell";
import { requireAdmin } from "@/lib/auth";
import { one } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [s, counts] = await Promise.all([
    getSettings(),
    one<{ payments: number; tickets: number; failed: number }>(
      `SELECT (SELECT count(*) FROM payments WHERE status = 'pending') AS payments,
              (SELECT count(*) FROM tickets WHERE status = 'open') AS tickets,
              (SELECT count(*) FROM orders WHERE status = 'pending' AND provider_id IS NOT NULL
                 AND provider_order_id IS NULL AND provider_error IS NOT NULL) AS failed`
    ),
  ]);
  const items: NavItem[] = [
    { href: "/admin", label: "Overview", icon: "home", exact: true },
    { href: "/admin/orders", label: "Orders", icon: "list", count: counts?.failed },
    { href: "/admin/users", label: "Users", icon: "users" },
    { href: "/admin/services", label: "Services", icon: "grid" },
    { href: "/admin/providers", label: "Providers", icon: "server" },
    { href: "/admin/payments", label: "Payments", icon: "card", count: counts?.payments },
    { href: "/admin/tickets", label: "Tickets", icon: "ticket", count: counts?.tickets },
    { href: "/admin/settings", label: "Settings", icon: "settings" },
    { href: "/dashboard", label: "Customer view", icon: "external", section: "Panel" },
  ];
  return (
    <Shell
      siteName={s.siteName}
      homeHref="/admin"
      items={items}
      right={<span className="badge badge-primary">Admin · {admin.username}</span>}
    >
      {children}
    </Shell>
  );
}
