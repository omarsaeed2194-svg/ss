"use client";

import { useState } from "react";
import { withDefaults } from "@/lib/defaults";
import { applyExport, readExportFiles, summarize, type ExportKey, type ParsedExport } from "@/lib/linkedin";
import type { SiteContent } from "@/lib/types";
import type { Update } from "./panels";

const LABELS: Record<ExportKey, string> = {
  profile: "Name, headline, about, location & websites",
  emails: "Primary email",
  positions: "Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  projects: "Projects",
  languages: "Languages",
};

export default function ImportPanel({ c, update }: { c: SiteContent; update: Update }) {
  const [parsed, setParsed] = useState<ParsedExport | null>(null);
  const [include, setInclude] = useState<Set<ExportKey>>(new Set());
  const [status, setStatus] = useState("");
  const [dragging, setDragging] = useState(false);

  async function load(files: File[]) {
    setStatus("Reading…");
    try {
      const p = await readExportFiles(files);
      const found = summarize(p);
      if (!found.length) {
        setParsed(null);
        setStatus("No LinkedIn CSVs found. Upload the .zip LinkedIn emailed you, or files like Profile.csv and Positions.csv.");
        return;
      }
      setParsed(p);
      setInclude(new Set(found.filter((f) => f.count > 0).map((f) => f.key)));
      setStatus("");
    } catch (e) {
      setStatus(`Couldn't read that file: ${(e as Error).message}`);
    }
  }

  function apply() {
    if (!parsed) return;
    update((x) => applyExport(x, parsed, include));
    setParsed(null);
    setStatus("Imported. Review the other tabs and the preview, then click Save to publish.");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "site-content.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importJson(file: File) {
    try {
      const data = JSON.parse(await file.text());
      if (!data?.profile) throw new Error("not a site-content backup");
      if (confirm("Replace all content and theme with this backup?")) {
        update(() => withDefaults(data));
        setStatus("Backup restored. Click Save to publish.");
      }
    } catch (e) {
      setStatus(`Couldn't restore: ${(e as Error).message}`);
    }
  }

  return (
    <>
      <h3 className="adm-h3">Import from LinkedIn</h3>
      <ol className="adm-steps">
        <li>
          On LinkedIn open{" "}
          <a href="https://www.linkedin.com/mypreferences/d/download-my-data" target="_blank" rel="noopener noreferrer">
            Settings → Data privacy → Get a copy of your data
          </a>
          .
        </li>
        <li>Pick <strong>“Want something in particular?”</strong> and tick Profile, Positions, Education, Skills, Certifications, Projects, Languages and Email addresses. Request the archive.</li>
        <li>LinkedIn emails you a download link (usually within ~10 minutes). Drop the .zip here — it&apos;s read in your browser, nothing is uploaded until you save.</li>
      </ol>

      <label
        className={`adm-drop${dragging ? " over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          load(Array.from(e.dataTransfer.files));
        }}
      >
        <input type="file" accept=".zip,.csv" multiple hidden onChange={(e) => load(Array.from(e.target.files ?? []))} />
        <strong>Drop your LinkedIn export (.zip or .csv files)</strong>
        <span className="adm-muted">or click to choose</span>
      </label>

      {parsed && (
        <div className="adm-card-inner">
          <p>Found in your export — choose what to import. Selected lists replace what&apos;s currently on the site.</p>
          {summarize(parsed).map(({ key, count }) => (
            <label key={key} className="adm-check">
              <input
                type="checkbox"
                checked={include.has(key)}
                disabled={count === 0}
                onChange={(e) => {
                  const next = new Set(include);
                  if (e.target.checked) next.add(key);
                  else next.delete(key);
                  setInclude(next);
                }}
              />
              {LABELS[key]} <span className="adm-muted">({count} {count === 1 ? "row" : "rows"})</span>
            </label>
          ))}
          <div className="adm-inline">
            <button type="button" className="adm-btn adm-btn-primary" onClick={apply} disabled={!include.size}>
              Import selected
            </button>
            <button type="button" className="adm-btn adm-btn-quiet" onClick={() => setParsed(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {status && <p className="adm-note" role="status">{status}</p>}

      <h3 className="adm-h3">Backup</h3>
      <p className="adm-muted">Download everything (content + theme) as JSON, or restore a previous backup.</p>
      <div className="adm-inline">
        <button type="button" className="adm-btn" onClick={exportJson}>
          Download backup
        </button>
        <label className="adm-btn">
          Restore backup…
          <input type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
        </label>
      </div>
    </>
  );
}
