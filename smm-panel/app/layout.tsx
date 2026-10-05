import type { Metadata } from "next";
import { Toaster } from "@/components/Toaster";
import { getSettings } from "@/lib/settings";
import "./globals.css";

// Every page reads the database (settings, session), so nothing is prerendered at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: { default: s.siteName, template: `%s · ${s.siteName}` }, description: s.heroSubtitle };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
