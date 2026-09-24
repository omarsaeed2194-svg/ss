"use client";

import { useState } from "react";
import { DEFAULT_THEME, FONTS, newId, PRESETS, SECTION_LABELS } from "@/lib/defaults";
import type { SiteContent, Theme, ThemeColors } from "@/lib/types";
import { Area, IconBtn, ListEditor, move, Segmented, Select, Text, Toggle } from "./fields";

export type Update = (fn: (c: SiteContent) => SiteContent) => void;
type P = { c: SiteContent; update: Update };

/* ---------------- Profile ---------------- */

async function resizeImage(file: File, size = 480): Promise<string> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  const scale = Math.min(1, size / Math.min(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  // Center-crop to a square so every avatar shape looks right.
  const side = Math.min(w, h);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = side;
  canvas.getContext("2d")!.drawImage(img, (side - w) / 2, (side - h) / 2, w, h);
  URL.revokeObjectURL(img.src);
  return canvas.toDataURL("image/jpeg", 0.86);
}

export function ProfilePanel({ c, update }: P) {
  const p = c.profile;
  const set = (patch: Partial<SiteContent["profile"]>) => update((x) => ({ ...x, profile: { ...x.profile, ...patch } }));
  const setLinks = (links: SiteContent["profile"]["links"]) => set({ links });

  return (
    <>
      <div className="adm-avatar-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="adm-avatar" /> : <div className="adm-avatar adm-avatar-empty">No photo</div>}
        <div className="adm-stack">
          <label className="adm-btn">
            Upload photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) set({ avatarUrl: await resizeImage(f) });
                e.target.value = "";
              }}
            />
          </label>
          {p.avatarUrl && (
            <button type="button" className="adm-btn adm-btn-quiet" onClick={() => set({ avatarUrl: "" })}>
              Remove photo
            </button>
          )}
        </div>
      </div>
      {!p.avatarUrl.startsWith("data:") && (
        <Text label="…or photo URL" value={p.avatarUrl} onChange={(v) => set({ avatarUrl: v })} placeholder="https://…" />
      )}
      <div className="adm-grid2">
        <Text label="Full name" value={p.name} onChange={(v) => set({ name: v })} />
        <Text label="Location" value={p.location} onChange={(v) => set({ location: v })} placeholder="Riyadh, Saudi Arabia" />
      </div>
      <Text label="Headline" value={p.headline} onChange={(v) => set({ headline: v })} />
      <Area label="About" rows={8} value={p.about} onChange={(v) => set({ about: v })} hint="Leave a blank line between paragraphs." />
      <div className="adm-grid2">
        <Text label="Email" type="email" value={p.email} onChange={(v) => set({ email: v })} />
        <Text label="Phone" value={p.phone} onChange={(v) => set({ phone: v })} />
      </div>
      <Text label="Résumé / CV link" value={p.resumeUrl} onChange={(v) => set({ resumeUrl: v })} placeholder="https://…/cv.pdf" />
      <Toggle label="Show “Open to opportunities” badge" checked={p.openToWork} onChange={(v) => set({ openToWork: v })} />

      <h3 className="adm-h3">Links</h3>
      <div className="adm-list">
        {p.links.map((l, i) => (
          <div key={i} className="adm-link-row">
            <input aria-label="Label" value={l.label} placeholder="Label" onChange={(e) => setLinks(p.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            <input aria-label="URL" value={l.url} placeholder="https://…" onChange={(e) => setLinks(p.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
            <IconBtn label="Move up" onClick={() => setLinks(move(p.links, i, -1))} disabled={i === 0}>↑</IconBtn>
            <IconBtn label="Remove" onClick={() => setLinks(p.links.filter((_, j) => j !== i))}>✕</IconBtn>
          </div>
        ))}
        <button type="button" className="adm-btn" onClick={() => setLinks([...p.links, { label: "", url: "" }])}>
          + Add link
        </button>
      </div>

      <h3 className="adm-h3">Search & sharing</h3>
      <Text label="Page title" value={c.seo.title} onChange={(v) => update((x) => ({ ...x, seo: { ...x.seo, title: v } }))} />
      <Area label="Description" rows={2} value={c.seo.description} onChange={(v) => update((x) => ({ ...x, seo: { ...x.seo, description: v } }))} />
    </>
  );
}

/* ---------------- Sections ---------------- */

export function SectionsPanel({ c, update }: P) {
  const setSections = (sections: SiteContent["sections"]) => update((x) => ({ ...x, sections }));
  return (
    <>
      <p className="adm-muted">Reorder, rename or hide sections. Empty sections are hidden automatically.</p>
      <div className="adm-list">
        {c.sections.map((s, i) => (
          <div key={s.type} className={`adm-section-row${s.visible ? "" : " off"}`}>
            <Toggle label="" checked={s.visible} onChange={(v) => setSections(c.sections.map((x, j) => (j === i ? { ...x, visible: v } : x)))} />
            <input aria-label={`${SECTION_LABELS[s.type]} title`} value={s.title} onChange={(e) => setSections(c.sections.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
            <span className="adm-muted adm-tag">{SECTION_LABELS[s.type]}</span>
            <IconBtn label="Move up" onClick={() => setSections(move(c.sections, i, -1))} disabled={i === 0}>↑</IconBtn>
            <IconBtn label="Move down" onClick={() => setSections(move(c.sections, i, 1))} disabled={i === c.sections.length - 1}>↓</IconBtn>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- Content lists ---------------- */

export function ExperiencePanel({ c, update }: P) {
  return (
    <ListEditor
      items={c.experience}
      onChange={(experience) => update((x) => ({ ...x, experience }))}
      title={(e) => e.title}
      subtitle={(e) => [e.company, [e.start, e.end].filter(Boolean).join(" – ")].filter(Boolean).join(" · ")}
      create={() => ({ id: newId("exp"), title: "New role", company: "", location: "", start: "", end: "Present", description: "" })}
      addLabel="Add position"
      fields={[
        { key: "title", label: "Title", half: true },
        { key: "company", label: "Company", half: true },
        { key: "start", label: "Start", half: true, placeholder: "Jan 2022" },
        { key: "end", label: "End", half: true, placeholder: "Present" },
        { key: "location", label: "Location" },
        { key: "description", label: "Description", area: true },
      ]}
    />
  );
}

export function EducationPanel({ c, update }: P) {
  return (
    <ListEditor
      items={c.education}
      onChange={(education) => update((x) => ({ ...x, education }))}
      title={(e) => e.school}
      subtitle={(e) => e.degree}
      create={() => ({ id: newId("edu"), school: "New school", degree: "", start: "", end: "", description: "" })}
      addLabel="Add education"
      fields={[
        { key: "school", label: "School" },
        { key: "degree", label: "Degree / field of study" },
        { key: "start", label: "Start", half: true },
        { key: "end", label: "End", half: true },
        { key: "description", label: "Notes & activities", area: true },
      ]}
    />
  );
}

export function ProjectsPanel({ c, update }: P) {
  return (
    <ListEditor
      items={c.projects}
      onChange={(projects) => update((x) => ({ ...x, projects }))}
      title={(p) => p.title}
      subtitle={(p) => p.date}
      create={() => ({ id: newId("proj"), title: "New project", description: "", url: "", date: "" })}
      addLabel="Add project"
      fields={[
        { key: "title", label: "Title", half: true },
        { key: "date", label: "Date", half: true },
        { key: "url", label: "Link", placeholder: "https://…" },
        { key: "description", label: "Description", area: true },
      ]}
    />
  );
}

export function CertificationsPanel({ c, update }: P) {
  return (
    <ListEditor
      items={c.certifications}
      onChange={(certifications) => update((x) => ({ ...x, certifications }))}
      title={(x) => x.name}
      subtitle={(x) => x.issuer}
      create={() => ({ id: newId("cert"), name: "New certification", issuer: "", date: "", url: "" })}
      addLabel="Add certification"
      fields={[
        { key: "name", label: "Name" },
        { key: "issuer", label: "Issuing organization", half: true },
        { key: "date", label: "Date", half: true },
        { key: "url", label: "Credential URL", placeholder: "https://…" },
      ]}
    />
  );
}

export function SkillsPanel({ c, update }: P) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const items = draft.split(/[,\n]/).map((s) => s.trim()).filter((s) => s && !c.skills.includes(s));
    if (items.length) update((x) => ({ ...x, skills: [...x.skills, ...items] }));
    setDraft("");
  };
  return (
    <>
      <h3 className="adm-h3">Skills</h3>
      <div className="adm-chips">
        {c.skills.map((s, i) => (
          <span key={`${s}-${i}`} className="adm-chip">
            <button type="button" aria-label={`Move ${s} left`} onClick={() => update((x) => ({ ...x, skills: move(x.skills, i, -1) }))} disabled={i === 0}>‹</button>
            {s}
            <button type="button" aria-label={`Remove ${s}`} onClick={() => update((x) => ({ ...x, skills: x.skills.filter((_, j) => j !== i) }))}>×</button>
          </span>
        ))}
      </div>
      <div className="adm-inline">
        <input
          value={draft}
          placeholder="Add skills, comma-separated"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="adm-btn" onClick={add} disabled={!draft.trim()}>
          Add
        </button>
      </div>

      <h3 className="adm-h3">Languages</h3>
      <ListEditor
        items={c.languages}
        onChange={(languages) => update((x) => ({ ...x, languages }))}
        title={(l) => l.name}
        subtitle={(l) => l.proficiency}
        create={() => ({ id: newId("lang"), name: "New language", proficiency: "" })}
        addLabel="Add language"
        fields={[
          { key: "name", label: "Language", half: true },
          { key: "proficiency", label: "Proficiency", half: true, placeholder: "Native or bilingual" },
        ]}
      />
    </>
  );
}

/* ---------------- Theme ---------------- */

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  primary: "Primary",
  accent: "Accent",
  background: "Background",
  surface: "Cards",
  text: "Text",
  muted: "Muted text",
  border: "Borders",
};

export function ThemePanel({ c, update }: P) {
  const t = c.theme;
  const [palette, setPalette] = useState<"light" | "dark">(t.mode === "dark" ? "dark" : "light");
  const set = (patch: Partial<Theme>) => update((x) => ({ ...x, theme: { ...x.theme, ...patch } }));
  const setColor = (k: keyof ThemeColors, v: string) =>
    update((x) => ({ ...x, theme: { ...x.theme, preset: "custom", [palette]: { ...x.theme[palette], [k]: v } } }));

  return (
    <>
      <h3 className="adm-h3">Presets</h3>
      <div className="adm-presets">
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            type="button"
            key={key}
            className={`adm-preset${t.preset === key ? " on" : ""}`}
            onClick={() => set({ preset: key, light: p.light, dark: p.dark, headingFont: p.headingFont, bodyFont: p.bodyFont, radius: p.radius, cardStyle: p.cardStyle })}
          >
            <span className="adm-swatches">
              {[p.light.primary, p.light.accent, p.dark.background, p.light.background].map((col, i) => (
                <i key={i} style={{ background: col }} />
              ))}
            </span>
            <span style={{ fontFamily: p.headingFont }}>{p.label}</span>
          </button>
        ))}
      </div>

      <Segmented
        label="Color mode"
        value={t.mode}
        onChange={(mode) => {
          set({ mode });
          if (mode !== "auto") setPalette(mode);
        }}
        options={[
          { value: "auto", label: "Auto + visitor toggle" },
          { value: "light", label: "Light only" },
          { value: "dark", label: "Dark only" },
        ]}
      />

      <h3 className="adm-h3">Colors</h3>
      {t.mode === "auto" && (
        <Segmented
          label="Editing palette"
          value={palette}
          onChange={setPalette}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      )}
      <div className="adm-colors">
        {(Object.keys(COLOR_LABELS) as (keyof ThemeColors)[]).map((k) => (
          <label key={k} className="adm-color">
            <input type="color" value={t[palette][k]} onChange={(e) => setColor(k, e.target.value)} />
            <span>{COLOR_LABELS[k]}</span>
            <input
              className="adm-hex"
              value={t[palette][k]}
              aria-label={`${COLOR_LABELS[k]} hex`}
              onChange={(e) => /^#[0-9a-f]{0,6}$/i.test(e.target.value) && setColor(k, e.target.value)}
            />
          </label>
        ))}
      </div>

      <h3 className="adm-h3">Typography</h3>
      <div className="adm-grid2">
        <Select label="Heading font" value={t.headingFont} options={FONTS} onChange={(headingFont) => set({ headingFont })} />
        <Select label="Body font" value={t.bodyFont} options={FONTS} onChange={(bodyFont) => set({ bodyFont })} />
      </div>

      <h3 className="adm-h3">Layout</h3>
      <Segmented label="Page layout" value={t.layout} onChange={(layout) => set({ layout })} options={[{ value: "centered", label: "Single column" }, { value: "sidebar", label: "Sidebar" }]} />
      <Segmented label="Header style" value={t.heroStyle} onChange={(heroStyle) => set({ heroStyle })} options={[{ value: "split", label: "Photo left" }, { value: "centered", label: "Centered" }, { value: "banner", label: "Banner" }]} />
      <Segmented label="Photo shape" value={t.avatarShape} onChange={(avatarShape) => set({ avatarShape })} options={[{ value: "circle", label: "Circle" }, { value: "rounded", label: "Rounded" }, { value: "square", label: "Square" }]} />
      <Segmented label="Cards" value={t.cardStyle} onChange={(cardStyle) => set({ cardStyle })} options={[{ value: "outline", label: "Outline" }, { value: "shadow", label: "Shadow" }, { value: "flat", label: "Flat" }]} />
      <div className="adm-grid2">
        <label className="adm-field">
          <span>Corner radius · {t.radius}px</span>
          <input type="range" min={0} max={28} value={t.radius} onChange={(e) => set({ radius: Number(e.target.value) })} />
        </label>
        <label className="adm-field">
          <span>Content width · {t.width}px</span>
          <input type="range" min={720} max={1400} step={20} value={t.width} onChange={(e) => set({ width: Number(e.target.value) })} />
        </label>
      </div>
      <Toggle label="Entrance animations" checked={t.animations} onChange={(animations) => set({ animations })} />
      <p>
        <button type="button" className="adm-btn adm-btn-quiet" onClick={() => confirm("Reset the theme to defaults?") && set(structuredClone(DEFAULT_THEME))}>
          Reset theme to default
        </button>
      </p>
    </>
  );
}
