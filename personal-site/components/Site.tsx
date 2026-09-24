import type { ReactNode } from "react";
import { googleFontsHref, themeCss } from "@/lib/theme";
import type { Section, SiteContent } from "@/lib/types";
import ThemeToggle from "./ThemeToggle";

export function safeHref(url: string | undefined) {
  if (!url) return undefined;
  const u = url.trim();
  return /^(https?:|mailto:|tel:|\/|#)/i.test(u) ? u : /^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u) ? `https://${u}` : undefined;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((p, i) => (
          <p key={i} className="prose">
            {p.trim()}
          </p>
        ))}
    </>
  );
}

function range(start: string, end: string) {
  return [start, end].filter(Boolean).join(" – ");
}

function Ext({ href, children, className }: { href?: string; children: ReactNode; className?: string }) {
  const h = safeHref(href);
  if (!h) return <span className={className}>{children}</span>;
  const external = /^https?:/i.test(h);
  return (
    <a href={h} className={className} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

function hasContent(c: SiteContent, s: Section) {
  switch (s.type) {
    case "about":
      return Boolean(c.profile.about.trim());
    case "contact":
      return Boolean(c.profile.email || c.profile.phone || c.profile.links.length);
    default:
      return c[s.type].length > 0;
  }
}

function SectionBody({ c, s }: { c: SiteContent; s: Section }) {
  switch (s.type) {
    case "about":
      return <Paragraphs text={c.profile.about} />;
    case "experience":
      return (
        <ol className="timeline">
          {c.experience.map((e) => (
            <li key={e.id} className="card timeline-item">
              <div className="item-head">
                <div>
                  <h3>{e.title}</h3>
                  <div className="item-sub">{[e.company, e.location].filter(Boolean).join(" · ")}</div>
                </div>
                {range(e.start, e.end) && <span className="pill">{range(e.start, e.end)}</span>}
              </div>
              {e.description && <Paragraphs text={e.description} />}
            </li>
          ))}
        </ol>
      );
    case "education":
      return (
        <div className="stack">
          {c.education.map((e) => (
            <div key={e.id} className="card">
              <div className="item-head">
                <div>
                  <h3>{e.school}</h3>
                  {e.degree && <div className="item-sub">{e.degree}</div>}
                </div>
                {range(e.start, e.end) && <span className="pill">{range(e.start, e.end)}</span>}
              </div>
              {e.description && <Paragraphs text={e.description} />}
            </div>
          ))}
        </div>
      );
    case "skills":
      return (
        <ul className="chips">
          {c.skills.map((s, i) => (
            <li key={`${s}-${i}`} className="chip">
              {s}
            </li>
          ))}
        </ul>
      );
    case "certifications":
      return (
        <div className="grid">
          {c.certifications.map((x) => (
            <div key={x.id} className="card">
              <h3>
                <Ext href={x.url}>{x.name}</Ext>
              </h3>
              <div className="item-sub">{[x.issuer, x.date].filter(Boolean).join(" · ")}</div>
            </div>
          ))}
        </div>
      );
    case "projects":
      return (
        <div className="grid">
          {c.projects.map((p) => (
            <div key={p.id} className="card project">
              <div className="item-head">
                <h3>
                  <Ext href={p.url}>{p.title}</Ext>
                </h3>
                {p.date && <span className="pill">{p.date}</span>}
              </div>
              {p.description && <Paragraphs text={p.description} />}
            </div>
          ))}
        </div>
      );
    case "languages":
      return (
        <div className="grid grid-sm">
          {c.languages.map((l) => (
            <div key={l.id} className="card">
              <h3>{l.name}</h3>
              {l.proficiency && <div className="item-sub">{l.proficiency}</div>}
            </div>
          ))}
        </div>
      );
    case "contact":
      return (
        <div className="card contact">
          <p className="prose">Want to work together or just say hello? Reach out.</p>
          <div className="actions">
            {c.profile.email && (
              <a className="btn btn-primary" href={`mailto:${c.profile.email}`}>
                {c.profile.email}
              </a>
            )}
            {c.profile.phone && (
              <a className="btn" href={`tel:${c.profile.phone.replace(/\s/g, "")}`}>
                {c.profile.phone}
              </a>
            )}
            {c.profile.links.map((l) => (
              <Ext key={l.url} href={l.url} className="btn">
                {l.label}
              </Ext>
            ))}
          </div>
        </div>
      );
  }
}

function Avatar({ c }: { c: SiteContent }) {
  const shape = `avatar avatar-${c.theme.avatarShape}`;
  // eslint-disable-next-line @next/next/no-img-element
  return c.profile.avatarUrl ? (
    <img className={shape} src={c.profile.avatarUrl} alt={c.profile.name} />
  ) : (
    <div className={shape} aria-hidden>
      {initials(c.profile.name)}
    </div>
  );
}

function Hero({ c }: { c: SiteContent }) {
  const p = c.profile;
  return (
    <header className={`hero hero-${c.theme.heroStyle}`} id="top">
      <Avatar c={c} />
      <div className="hero-text">
        {p.openToWork && <span className="badge">Open to opportunities</span>}
        <h1>{p.name}</h1>
        {p.headline && <p className="headline">{p.headline}</p>}
        {p.location && <p className="location">{p.location}</p>}
        <div className="actions">
          {p.email && (
            <a className="btn btn-primary" href={`mailto:${p.email}`}>
              Get in touch
            </a>
          )}
          {safeHref(p.resumeUrl) && (
            <Ext href={p.resumeUrl} className="btn">
              Résumé
            </Ext>
          )}
          {p.links.map((l) => (
            <Ext key={l.url} href={l.url} className="btn btn-ghost">
              {l.label}
            </Ext>
          ))}
        </div>
      </div>
    </header>
  );
}

export default function Site({ content: c, preview = false }: { content: SiteContent; preview?: boolean }) {
  const sections = c.sections.filter((s) => s.visible && hasContent(c, s));
  const fonts = googleFontsHref(c.theme);
  const nav = (
    <nav className="nav-links" aria-label="Sections">
      {sections.map((s) => (
        <a key={s.type} href={`#${s.type}`}>
          {s.title}
        </a>
      ))}
    </nav>
  );
  const body = sections.map((s) => (
    <section key={s.type} id={s.type} className="section">
      <h2>{s.title}</h2>
      <SectionBody c={c} s={s} />
    </section>
  ));

  return (
    <div
      className={`site layout-${c.theme.layout} cards-${c.theme.cardStyle}${c.theme.animations ? " animate" : ""}${preview ? " is-preview" : ""}`}
    >
      {fonts && <link rel="stylesheet" href={fonts} />}
      <style dangerouslySetInnerHTML={{ __html: themeCss(c.theme) }} />
      {c.theme.layout === "sidebar" ? (
        <div className="shell">
          <aside className="sidebar">
            <Hero c={c} />
            {nav}
            {c.theme.mode === "auto" && <ThemeToggle />}
          </aside>
          <main className="main">{body}</main>
        </div>
      ) : (
        <>
          <div className="topbar">
            <div className="container topbar-inner">
              <a href="#top" className="brand">
                {c.profile.name}
              </a>
              {nav}
              {c.theme.mode === "auto" && <ThemeToggle />}
            </div>
          </div>
          <main className="container">
            <Hero c={c} />
            {body}
          </main>
        </>
      )}
      <footer className="footer container">
        © {new Date().getFullYear()} {c.profile.name}
      </footer>
    </div>
  );
}
