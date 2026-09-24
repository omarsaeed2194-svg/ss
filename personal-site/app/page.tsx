import type { Metadata } from "next";
import Site from "@/components/Site";
import { getContent } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: c.seo.title || c.profile.name,
    description: c.seo.description,
    openGraph: { title: c.seo.title || c.profile.name, description: c.seo.description, type: "profile" },
  };
}

export default async function Home() {
  return <Site content={await getContent()} />;
}
