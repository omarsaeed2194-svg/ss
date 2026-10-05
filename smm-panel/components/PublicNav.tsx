import Link from "next/link";
import { Brand } from "./Brand";

export function PublicNav({ siteName, signedIn }: { siteName: string; signedIn: boolean }) {
  return (
    <header className="lp-nav">
      <div className="lp-container lp-nav-inner">
        <Brand name={siteName} />
        <nav className="lp-links">
          <Link href="/services">Services</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/api-docs">API</Link>
        </nav>
        <div className="actions">
          {signedIn ? (
            <Link href="/dashboard" className="btn btn-primary">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn">
                Sign in
              </Link>
              <Link href="/register" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter({ siteName, supportEmail }: { siteName: string; supportEmail: string }) {
  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <span>
          © {new Date().getFullYear()} {siteName}
        </span>
        <span className="row">
          <Link href="/services">Services</Link>
          <Link href="/api-docs">API</Link>
          <Link href="/terms">Terms</Link>
          {supportEmail && <a href={`mailto:${supportEmail}`}>{supportEmail}</a>}
        </span>
      </div>
    </footer>
  );
}
