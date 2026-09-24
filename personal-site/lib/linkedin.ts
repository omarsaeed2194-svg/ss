/**
 * Maps LinkedIn's official data export (Settings → Data privacy → Get a copy
 * of your data) onto the site's content model. Runs in the browser: the admin
 * drops the .zip (or individual CSVs) and reviews the result before saving.
 */
import JSZip from "jszip";
import { newId } from "./defaults";
import type { SiteContent } from "./types";

export type Row = Record<string, string>;

/** RFC 4180 CSV parser (quoted fields, embedded commas/newlines, "" escapes). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim()));
}

/** Some exports start with a "Notes:" preamble; find the real header row. */
function toObjects(text: string, expectHeader: string): Row[] {
  const rows = parseCsv(text);
  const h = rows.findIndex((r) => r.some((f) => f.trim() === expectHeader));
  if (h < 0) return [];
  const header = rows[h].map((f) => f.trim());
  return rows.slice(h + 1).map((r) => Object.fromEntries(header.map((k, i) => [k, (r[i] ?? "").trim()])));
}

const FILES = {
  profile: { name: "Profile.csv", header: "First Name" },
  positions: { name: "Positions.csv", header: "Company Name" },
  education: { name: "Education.csv", header: "School Name" },
  skills: { name: "Skills.csv", header: "Name" },
  certifications: { name: "Certifications.csv", header: "Name" },
  projects: { name: "Projects.csv", header: "Title" },
  languages: { name: "Languages.csv", header: "Name" },
  emails: { name: "Email Addresses.csv", header: "Email Address" },
} as const;

export type ExportKey = keyof typeof FILES;
export type ParsedExport = Partial<Record<ExportKey, Row[]>>;

export async function readExportFiles(files: File[]): Promise<ParsedExport> {
  const texts: Record<string, string> = {};
  for (const f of files) {
    if (f.name.toLowerCase().endsWith(".zip")) {
      const zip = await JSZip.loadAsync(f);
      for (const entry of Object.values(zip.files)) {
        if (!entry.dir && entry.name.toLowerCase().endsWith(".csv")) {
          texts[entry.name.split("/").pop()!.toLowerCase()] = await entry.async("string");
        }
      }
    } else if (f.name.toLowerCase().endsWith(".csv")) {
      texts[f.name.toLowerCase()] = await f.text();
    }
  }
  const out: ParsedExport = {};
  for (const [key, { name, header }] of Object.entries(FILES) as [ExportKey, (typeof FILES)[ExportKey]][]) {
    const text = texts[name.toLowerCase()];
    if (text) out[key] = toObjects(text, header);
  }
  return out;
}

/** "[PERSONAL:https://x.com],[COMPANY:https://y.com]" or plain comma list → URLs */
function parseWebsites(raw: string) {
  return raw
    .split(/,(?=\s*\[|\s*https?:)/)
    .map((s) => s.replace(/^\s*\[?[A-Z_]*:?/, "").replace(/\]\s*$/, "").trim())
    .filter((s) => /^https?:\/\//.test(s));
}

export interface ImportSummary {
  key: ExportKey;
  count: number;
}

export function summarize(parsed: ParsedExport): ImportSummary[] {
  return (Object.keys(parsed) as ExportKey[]).map((key) => ({ key, count: parsed[key]!.length }));
}

/** Merge selected parts of the export into content. Lists are replaced, not appended. */
export function applyExport(content: SiteContent, parsed: ParsedExport, include: Set<ExportKey>): SiteContent {
  const next = structuredClone(content);
  const on = (k: ExportKey) => include.has(k) && parsed[k]?.length;

  if (on("profile")) {
    const p = parsed.profile![0];
    const name = [p["First Name"], p["Last Name"]].filter(Boolean).join(" ");
    if (name) next.profile.name = name;
    if (p["Headline"]) next.profile.headline = p["Headline"];
    if (p["Summary"]) next.profile.about = p["Summary"];
    if (p["Geo Location"]) next.profile.location = p["Geo Location"];
    for (const url of parseWebsites(p["Websites"] ?? "")) {
      if (!next.profile.links.some((l) => l.url === url)) {
        next.profile.links.push({ label: new URL(url).hostname.replace(/^www\./, ""), url });
      }
    }
    if (name) {
      next.seo.title = name;
      next.seo.description = [name, p["Headline"]].filter(Boolean).join(" — ");
    }
  }
  if (on("emails")) {
    const primary = parsed.emails!.find((e) => e["Primary"] === "Yes") ?? parsed.emails![0];
    if (primary["Email Address"]) next.profile.email = primary["Email Address"];
  }
  if (on("positions")) {
    next.experience = parsed.positions!.map((r) => ({
      id: newId("exp"),
      title: r["Title"],
      company: r["Company Name"],
      location: r["Location"] ?? "",
      start: r["Started On"] ?? "",
      end: r["Finished On"] || "Present",
      description: r["Description"] ?? "",
    }));
  }
  if (on("education")) {
    next.education = parsed.education!.map((r) => ({
      id: newId("edu"),
      school: r["School Name"],
      degree: r["Degree Name"] ?? "",
      start: r["Start Date"] ?? "",
      end: r["End Date"] ?? "",
      description: [r["Notes"], r["Activities"]].filter(Boolean).join("\n\n"),
    }));
  }
  if (on("skills")) next.skills = parsed.skills!.map((r) => r["Name"]).filter(Boolean);
  if (on("certifications")) {
    next.certifications = parsed.certifications!.map((r) => ({
      id: newId("cert"),
      name: r["Name"],
      issuer: r["Authority"] ?? "",
      date: r["Started On"] ?? "",
      url: r["Url"] ?? "",
    }));
  }
  if (on("projects")) {
    next.projects = parsed.projects!.map((r) => ({
      id: newId("proj"),
      title: r["Title"],
      description: r["Description"] ?? "",
      url: r["Url"] ?? "",
      date: [r["Started On"], r["Finished On"]].filter(Boolean).join(" – "),
    }));
  }
  if (on("languages")) {
    next.languages = parsed.languages!.map((r) => ({
      id: newId("lang"),
      name: r["Name"],
      proficiency: (r["Proficiency"] ?? "").replace(/_/g, " ").toLowerCase().replace(/^\w/, (m) => m.toUpperCase()),
    }));
  }
  return next;
}
