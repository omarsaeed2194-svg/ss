import { promises as fs } from "fs";
import path from "path";
import { withDefaults } from "./defaults";
import type { SiteContent } from "./types";

const FILE = path.join(process.cwd(), "data", "site.json");
const KEY = "personal-site:content";
const KV_URL = process.env.KV_REST_API_URL?.replace(/\/$/, "");
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

export const storageKind = KV_URL && KV_TOKEN ? "kv" : "file";

async function kv(cmd: string, body?: string) {
  const res = await fetch(`${KV_URL}/${cmd}/${encodeURIComponent(KEY)}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV ${cmd} failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as { result: string | null };
}

export async function getContent(): Promise<SiteContent> {
  if (storageKind === "kv") {
    const { result } = await kv("get");
    if (result) return withDefaults(JSON.parse(result));
    // First run on KV: fall through to the committed seed file.
  }
  try {
    return withDefaults(JSON.parse(await fs.readFile(FILE, "utf8")));
  } catch {
    return withDefaults(null);
  }
}

export async function saveContent(content: SiteContent): Promise<SiteContent> {
  const next = withDefaults({ ...content, updatedAt: new Date().toISOString() });
  const json = JSON.stringify(next, null, 2);
  if (storageKind === "kv") {
    await kv("set", json);
  } else {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, json + "\n");
  }
  return next;
}
