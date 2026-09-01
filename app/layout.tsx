import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEO Dashboard — localization.saudisoft.com",
  description: "Live SEO dashboard combining Ubersuggest, GA4 and Search Console for localization.saudisoft.com",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
