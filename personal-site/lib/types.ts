export type ColorMode = "light" | "dark" | "auto";

export interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
}

export interface Theme {
  preset: string;
  mode: ColorMode;
  light: ThemeColors;
  dark: ThemeColors;
  headingFont: string;
  bodyFont: string;
  /** Corner radius in px for cards, buttons and the avatar frame. */
  radius: number;
  /** Max content width in px. */
  width: number;
  layout: "centered" | "sidebar";
  heroStyle: "split" | "centered" | "banner";
  avatarShape: "circle" | "rounded" | "square";
  cardStyle: "flat" | "outline" | "shadow";
  animations: boolean;
}

export interface Link {
  label: string;
  url: string;
}

export interface Profile {
  name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  avatarUrl: string;
  about: string;
  resumeUrl: string;
  openToWork: boolean;
  links: Link[];
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  url: string;
  date: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string;
}

export type SectionType =
  | "about"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "projects"
  | "languages"
  | "contact";

export interface Section {
  type: SectionType;
  title: string;
  visible: boolean;
}

export interface SiteContent {
  version: 1;
  seo: { title: string; description: string };
  theme: Theme;
  profile: Profile;
  sections: Section[];
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  projects: Project[];
  languages: Language[];
  updatedAt: string;
}
