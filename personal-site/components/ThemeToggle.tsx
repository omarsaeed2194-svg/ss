"use client";

import { useEffect, useState } from "react";

/** Lets visitors flip light/dark when the site is in "auto" mode. Remembered per browser. */
export default function ThemeToggle() {
  const [scheme, setScheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("scheme");
    } catch {}
    const initial =
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setScheme(initial);
    if (saved) document.querySelector(".site")?.setAttribute("data-scheme", saved);
  }, []);

  function toggle() {
    const next = scheme === "dark" ? "light" : "dark";
    setScheme(next);
    document.querySelector(".site")?.setAttribute("data-scheme", next);
    try {
      localStorage.setItem("scheme", next);
    } catch {}
  }

  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode">
      {scheme === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
