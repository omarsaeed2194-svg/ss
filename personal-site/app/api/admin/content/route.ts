import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getContent, saveContent, storageKind } from "@/lib/store";
import type { SiteContent } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_BYTES = 2_000_000; // leaves room for an inlined avatar image

export async function GET() {
  return NextResponse.json({ content: await getContent(), storage: storageKind });
}

export async function PUT(req: Request) {
  const text = await req.text();
  if (text.length > MAX_BYTES) return NextResponse.json({ error: "Content is too large (max 2 MB)." }, { status: 413 });
  let body: SiteContent;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const problem = validate(body);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  try {
    const content = await saveContent(body);
    revalidatePath("/");
    return NextResponse.json({ content });
  } catch (e) {
    const msg =
      storageKind === "file"
        ? "Could not write data/site.json. On serverless hosts (e.g. Vercel) set KV_REST_API_URL / KV_REST_API_TOKEN."
        : (e as Error).message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function validate(c: SiteContent): string | null {
  if (!c || typeof c !== "object") return "Body must be an object.";
  if (!c.profile || typeof c.profile.name !== "string") return "profile.name is required.";
  if (!c.theme || typeof c.theme !== "object") return "theme is required.";
  for (const k of ["sections", "experience", "education", "skills", "certifications", "projects", "languages"] as const) {
    if (!Array.isArray(c[k])) return `${k} must be an array.`;
  }
  const urls = [c.profile.avatarUrl, c.profile.resumeUrl, ...c.profile.links.map((l) => l.url)];
  for (const u of urls) {
    if (u && !/^(https?:|mailto:|tel:|\/|data:image\/(png|jpeg|webp|gif);base64,)/i.test(u)) return `Unsupported URL: ${u.slice(0, 60)}`;
  }
  return null;
}
