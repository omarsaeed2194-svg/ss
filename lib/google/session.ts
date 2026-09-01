import { cookies } from "next/headers";
import crypto from "crypto";

const CONN_COOKIE = "gconn";
const SELECT_COOKIE = "gselect";
const STATE_COOKIE = "gstate";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 180, // 180 days
};

function getKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET env var is required to store the Google connection securely. See .env.example.");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

function encrypt(payload: unknown): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const json = Buffer.from(JSON.stringify(payload), "utf-8");
  const encrypted = Buffer.concat([cipher.update(json), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

function decrypt<T>(value: string): T | null {
  try {
    const raw = Buffer.from(value, "base64url");
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString("utf-8")) as T;
  } catch {
    return null;
  }
}

export interface GoogleConnection {
  refreshToken: string;
  email?: string;
}

export interface GoogleSelection {
  ga4PropertyId?: string;
  gscSiteUrl?: string;
}

export function saveConnection(connection: GoogleConnection) {
  cookies().set(CONN_COOKIE, encrypt(connection), COOKIE_OPTIONS);
}

export function getConnection(): GoogleConnection | null {
  const raw = cookies().get(CONN_COOKIE)?.value;
  if (!raw) return null;
  return decrypt<GoogleConnection>(raw);
}

export function clearConnection() {
  cookies().delete(CONN_COOKIE);
  cookies().delete(SELECT_COOKIE);
}

export function saveSelection(partial: GoogleSelection) {
  const current = getSelection() ?? {};
  const merged: GoogleSelection = {
    ga4PropertyId: partial.ga4PropertyId ?? current.ga4PropertyId,
    gscSiteUrl: partial.gscSiteUrl ?? current.gscSiteUrl,
  };
  cookies().set(SELECT_COOKIE, JSON.stringify(merged), COOKIE_OPTIONS);
}

export function getSelection(): GoogleSelection | null {
  const raw = cookies().get(SELECT_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GoogleSelection;
  } catch {
    return null;
  }
}

export function saveState(state: string) {
  cookies().set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
}

export function consumeState(): string | null {
  const value = cookies().get(STATE_COOKIE)?.value ?? null;
  cookies().delete(STATE_COOKIE);
  return value;
}
