"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ImportPanel from "@/components/admin/ImportPanel";
import {
  CertificationsPanel,
  EducationPanel,
  ExperiencePanel,
  ProfilePanel,
  ProjectsPanel,
  SectionsPanel,
  SkillsPanel,
  ThemePanel,
  type Update,
} from "@/components/admin/panels";
import type { SiteContent } from "@/lib/types";

const TABS = [
  { id: "import", label: "Import", Panel: ImportPanel },
  { id: "profile", label: "Profile", Panel: ProfilePanel },
  { id: "theme", label: "Theme", Panel: ThemePanel },
  { id: "sections", label: "Sections", Panel: SectionsPanel },
  { id: "experience", label: "Experience", Panel: ExperiencePanel },
  { id: "projects", label: "Projects", Panel: ProjectsPanel },
  { id: "education", label: "Education", Panel: EducationPanel },
  { id: "certifications", label: "Certifications", Panel: CertificationsPanel },
  { id: "skills", label: "Skills & languages", Panel: SkillsPanel },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Admin() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saved, setSaved] = useState<string>("");
  const [storage, setStorage] = useState<string>("");
  const [tab, setTab] = useState<TabId>("profile");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  const dirty = content !== null && JSON.stringify(content) !== saved;

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(({ content, storage }) => {
        setContent(content);
        setSaved(JSON.stringify(content));
        setStorage(storage);
      })
      .catch((e) => setMsg({ kind: "err", text: `Couldn't load content: ${e.message}` }));
  }, []);

  const push = useCallback(() => {
    if (content) frame.current?.contentWindow?.postMessage({ type: "site-content", content }, window.location.origin);
  }, [content]);

  useEffect(push, [push]);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === "preview-ready") push();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [push]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update: Update = useCallback((fn) => setContent((c) => (c ? fn(c) : c)), []);

  async function save() {
    if (!content) return;
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setContent(data.content);
      setSaved(JSON.stringify(data.content));
      setMsg({ kind: "ok", text: "Published." });
      setTimeout(() => setMsg(null), 2500);
    } else setMsg({ kind: "err", text: data.error || `Save failed (HTTP ${res.status}).` });
  }

  async function logout() {
    if (dirty && !confirm("Discard unsaved changes and sign out?")) return;
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const { Panel } = TABS.find((t) => t.id === tab)!;

  return (
    <div className="adm adm-shell">
      <header className="adm-bar">
        <strong className="adm-logo">Site admin</strong>
        <a href="/" target="_blank" className="adm-link">
          View site ↗
        </a>
        <span className="adm-spacer" />
        {msg && <span className={msg.kind === "ok" ? "adm-ok" : "adm-error"} role="status">{msg.text}</span>}
        {dirty && <span className="adm-muted">Unsaved changes</span>}
        <button
          type="button"
          className="adm-btn adm-btn-quiet"
          disabled={!dirty}
          onClick={() => confirm("Discard all unsaved changes?") && setContent(JSON.parse(saved))}
        >
          Discard
        </button>
        <button type="button" className="adm-btn adm-btn-primary" disabled={!dirty || saving} onClick={save}>
          {saving ? "Saving…" : "Save & publish"}
        </button>
        <button type="button" className="adm-btn adm-btn-quiet" onClick={logout}>
          Sign out
        </button>
      </header>

      <div className="adm-body">
        <nav className="adm-tabs" aria-label="Editor sections">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)} aria-current={tab === t.id}>
              {t.label}
            </button>
          ))}
          {storage === "file" && (
            <p className="adm-muted adm-storage">Saving to data/site.json. For Vercel, configure KV storage (see README).</p>
          )}
        </nav>

        <section className="adm-editor">{content ? <Panel c={content} update={update} /> : <p className="adm-muted">Loading…</p>}</section>

        <section className="adm-preview">
          <div className="adm-preview-bar">
            <span className="adm-muted">Live preview</span>
            <div className="adm-seg">
              {(["desktop", "mobile"] as const).map((d) => (
                <button key={d} type="button" className={device === d ? "on" : ""} onClick={() => setDevice(d)}>
                  {d === "desktop" ? "Desktop" : "Mobile"}
                </button>
              ))}
            </div>
          </div>
          <div className="adm-frame-wrap">
            <iframe ref={frame} src="/admin/preview" title="Live preview" className={`adm-frame adm-frame-${device}`} />
          </div>
        </section>
      </div>
    </div>
  );
}
