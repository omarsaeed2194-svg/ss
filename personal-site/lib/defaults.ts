import type { Section, SectionType, SiteContent, Theme, ThemeColors } from "./types";

export const FONTS = [
  "Inter",
  "Manrope",
  "Space Grotesk",
  "IBM Plex Sans",
  "DM Sans",
  "Plus Jakarta Sans",
  "Cairo",
  "Playfair Display",
  "Fraunces",
  "Lora",
  "JetBrains Mono",
  "System",
] as const;

type Preset = Pick<Theme, "light" | "dark" | "headingFont" | "bodyFont" | "radius" | "cardStyle">;

const c = (
  primary: string,
  accent: string,
  background: string,
  surface: string,
  text: string,
  muted: string,
  border: string,
): ThemeColors => ({ primary, accent, background, surface, text, muted, border });

export const PRESETS: Record<string, { label: string } & Preset> = {
  professional: {
    label: "Professional",
    light: c("#0a66c2", "#0f9d8a", "#f6f7f9", "#ffffff", "#15191e", "#5b6570", "#e3e6ea"),
    dark: c("#5aa7ff", "#3dd6c0", "#0d1117", "#161b22", "#e6edf3", "#8b949e", "#262c36"),
    headingFont: "Inter",
    bodyFont: "Inter",
    radius: 12,
    cardStyle: "outline",
  },
  editorial: {
    label: "Editorial",
    light: c("#9a3412", "#1d4ed8", "#fbf8f3", "#ffffff", "#1c1917", "#6b635b", "#e7e0d6"),
    dark: c("#fb923c", "#93c5fd", "#141210", "#1d1a17", "#f5f0e8", "#a8a095", "#2f2a25"),
    headingFont: "Fraunces",
    bodyFont: "Lora",
    radius: 4,
    cardStyle: "flat",
  },
  midnight: {
    label: "Midnight",
    light: c("#6d28d9", "#db2777", "#f7f5ff", "#ffffff", "#1a1530", "#625b7a", "#e6e1f5"),
    dark: c("#a78bfa", "#f472b6", "#0b0a14", "#15131f", "#ece9f8", "#948daf", "#2a2640"),
    headingFont: "Space Grotesk",
    bodyFont: "DM Sans",
    radius: 16,
    cardStyle: "shadow",
  },
  desert: {
    label: "Desert",
    light: c("#b45309", "#047857", "#faf6ef", "#fffdf9", "#2a2118", "#76685a", "#ebe2d4"),
    dark: c("#f59e0b", "#34d399", "#15120e", "#1f1a14", "#f3ece2", "#a99a88", "#342c22"),
    headingFont: "Plus Jakarta Sans",
    bodyFont: "Cairo",
    radius: 10,
    cardStyle: "outline",
  },
  mono: {
    label: "Minimal Mono",
    light: c("#111111", "#555555", "#ffffff", "#ffffff", "#111111", "#666666", "#e5e5e5"),
    dark: c("#fafafa", "#aaaaaa", "#0a0a0a", "#0a0a0a", "#fafafa", "#999999", "#262626"),
    headingFont: "JetBrains Mono",
    bodyFont: "IBM Plex Sans",
    radius: 0,
    cardStyle: "outline",
  },
};

export const DEFAULT_THEME: Theme = {
  preset: "professional",
  mode: "auto",
  ...PRESETS.professional,
  width: 1080,
  layout: "centered",
  heroStyle: "split",
  avatarShape: "circle",
  animations: true,
};

export const SECTION_LABELS: Record<SectionType, string> = {
  about: "About",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Licenses & Certifications",
  projects: "Projects",
  languages: "Languages",
  contact: "Contact",
};

export const DEFAULT_SECTIONS: Section[] = (
  ["about", "experience", "projects", "skills", "education", "certifications", "languages", "contact"] as SectionType[]
).map((type) => ({ type, title: SECTION_LABELS[type], visible: true }));

/**
 * Starter content. LinkedIn blocks automated access to profiles, so this is
 * seeded only from public information and is meant to be replaced by
 * importing the LinkedIn data export from /admin → Import.
 */
export const DEFAULT_CONTENT: SiteContent = {
  version: 1,
  seo: {
    title: "Omar Saeed",
    description: "Omar Saeed — localization, SEO and content marketing.",
  },
  theme: DEFAULT_THEME,
  profile: {
    name: "Omar Saeed",
    headline: "Localization · SEO · Content Marketing",
    location: "",
    email: "omar.saeed2194@gmail.com",
    phone: "",
    avatarUrl: "",
    about:
      "I help brands reach Arabic-speaking and GCC audiences through localization, search and content. " +
      "I write about translation, game and e-learning localization, and how companies grow across the Middle East.\n\n" +
      "Replace this text from the admin panel, or import your LinkedIn data export to fill in your full profile.",
    resumeUrl: "",
    openToWork: false,
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/omarsaeedsaeed/" },
      { label: "Saudisoft blog", url: "https://localization.saudisoft.com/our-blogs/" },
    ],
  },
  sections: DEFAULT_SECTIONS,
  experience: [
    {
      id: "exp-saudisoft",
      title: "SEO & Content",
      company: "Saudisoft",
      location: "",
      start: "",
      end: "Present",
      description:
        "Writing and optimizing content for Saudisoft Localization & Translation — covering e-learning, game and " +
        "media localization and the GCC market — and tracking organic performance across Search Console, GA4 and Ubersuggest.",
    },
  ],
  education: [],
  skills: [
    "Search Engine Optimization (SEO)",
    "Content Marketing",
    "Localization",
    "Translation",
    "Copywriting",
    "Google Analytics",
    "Google Search Console",
    "Arabic",
    "English",
  ],
  certifications: [],
  projects: [
    {
      id: "proj-seo-dashboard",
      title: "Live SEO dashboard",
      description:
        "A Next.js dashboard combining Ubersuggest, Google Analytics 4 and Search Console into one live view for localization.saudisoft.com.",
      url: "",
      date: "2026",
    },
  ],
  languages: [
    { id: "lang-ar", name: "Arabic", proficiency: "Native or bilingual" },
    { id: "lang-en", name: "English", proficiency: "Professional working" },
  ],
  updatedAt: new Date(0).toISOString(),
};

/** Fill any fields missing from stored content (e.g. after adding new theme options). */
export function withDefaults(raw: Partial<SiteContent> | null | undefined): SiteContent {
  const d = DEFAULT_CONTENT;
  if (!raw) return structuredClone(d);
  const sections = Array.isArray(raw.sections) ? raw.sections.filter((s) => s.type in SECTION_LABELS) : d.sections;
  // Append any section types added since the content was saved, hidden so the page doesn't change.
  for (const s of d.sections) {
    if (!sections.some((x) => x.type === s.type)) sections.push({ ...s, visible: false });
  }
  const theme = { ...d.theme, ...raw.theme } as Theme;
  theme.light = { ...d.theme.light, ...raw.theme?.light };
  theme.dark = { ...d.theme.dark, ...raw.theme?.dark };
  return {
    ...d,
    ...raw,
    version: 1,
    seo: { ...d.seo, ...raw.seo },
    theme,
    profile: { ...d.profile, ...raw.profile },
    sections,
  };
}

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
