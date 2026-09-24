import type { Theme, ThemeColors } from "./types";

const HEX = /^#[0-9a-f]{3,8}$/i;

function vars(c: ThemeColors) {
  return (Object.entries(c) as [keyof ThemeColors, string][])
    .filter(([, v]) => HEX.test(v))
    .map(([k, v]) => `--${k}:${v};`)
    .join("");
}

function fontStack(name: string, fallback: string) {
  if (name === "System" || !/^[\w ]+$/.test(name)) return fallback;
  return `"${name}", ${fallback}`;
}

/** CSS custom properties for a theme, scoped to `scope` so the admin preview can host it. */
export function themeCss(t: Theme, scope = ".site") {
  const light = vars(t.light);
  const dark = vars(t.dark);
  const shared =
    `--radius:${Math.max(0, Math.min(40, t.radius))}px;` +
    `--width:${Math.max(640, Math.min(1600, t.width))}px;` +
    `--font-heading:${fontStack(t.headingFont, "system-ui, sans-serif")};` +
    `--font-body:${fontStack(t.bodyFont, "system-ui, sans-serif")};`;
  if (t.mode === "light") return `${scope}{${shared}${light}color-scheme:light}`;
  if (t.mode === "dark") return `${scope}{${shared}${dark}color-scheme:dark}`;
  return (
    `${scope}{${shared}${light}color-scheme:light}` +
    `@media (prefers-color-scheme: dark){${scope}:not([data-scheme="light"]){${dark}color-scheme:dark}}` +
    `${scope}[data-scheme="dark"]{${dark}color-scheme:dark}`
  );
}

export function googleFontsHref(t: Theme) {
  const families = Array.from(new Set([t.headingFont, t.bodyFont])).filter((f) => f !== "System" && /^[\w ]+$/.test(f));
  if (!families.length) return null;
  const q = families.map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700`).join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}
