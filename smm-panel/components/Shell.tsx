import { logout } from "@/app/actions/auth";
import { Brand } from "./Brand";
import { Icon } from "./icons";
import { MobileNav, SidebarNav, type NavItem } from "./NavLinks";

export function Shell({
  siteName,
  items,
  homeHref,
  right,
  footer,
  children,
}: {
  siteName: string;
  items: NavItem[];
  homeHref: string;
  right?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <Brand name={siteName} href={homeHref} />
        <SidebarNav items={items} />
        <div style={{ marginTop: "auto", paddingTop: 16 }}>{footer}</div>
      </aside>
      <div className="main">
        <header className="topbar">
          <span className="topbar-brand">
            <Brand name={siteName} href={homeHref} />
          </span>
          <span className="spacer" />
          {right}
          <form action={logout}>
            <button className="btn btn-sm" title="Sign out">
              <Icon name="logout" size={16} />
              <span className="hide-sm">Sign out</span>
            </button>
          </form>
        </header>
        <MobileNav items={items} />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
