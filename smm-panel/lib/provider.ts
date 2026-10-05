import type { ServiceType } from "./format";

// Client for the de-facto standard "SMM panel API v2" that nearly every
// provider exposes: POST key + action (services/add/status/balance/refill/cancel)
// as form fields to a single URL, JSON back, failures as {"error": "..."}.

export interface ProviderCreds {
  api_url: string;
  api_key: string;
}

export interface ProviderService {
  service: string | number;
  name: string;
  type?: string;
  category?: string;
  rate: string | number;
  min: string | number;
  max: string | number;
  refill?: boolean;
  cancel?: boolean;
  desc?: string;
  description?: string;
}

export class ProviderError extends Error {}

export async function providerCall<T = any>(
  p: ProviderCreds,
  action: string,
  params: Record<string, string | number | null | undefined> = {},
  timeoutMs = 20000
): Promise<T> {
  const body = new URLSearchParams({ key: p.api_key, action });
  for (const [k, v] of Object.entries(params)) if (v != null && v !== "") body.set(k, String(v));
  let res: Response;
  try {
    res = await fetch(p.api_url, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    throw new ProviderError(`Could not reach provider: ${(e as Error).message}`);
  }
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ProviderError(`Provider returned an invalid response (HTTP ${res.status}): ${text.slice(0, 140)}`);
  }
  if (data && typeof data === "object" && !Array.isArray(data) && data.error) {
    throw new ProviderError(String(data.error));
  }
  return data as T;
}

export function mapProviderType(type?: string): ServiceType | null {
  const t = (type || "default").trim().toLowerCase();
  if (t === "default") return "default";
  if (t === "package") return "package";
  if (t === "custom comments") return "custom_comments";
  return null;
}

export async function fetchProviderServices(p: ProviderCreds) {
  const data = await providerCall<ProviderService[]>(p, "services", {}, 30000);
  if (!Array.isArray(data)) throw new ProviderError("Provider's services response is not a list.");
  return data;
}
