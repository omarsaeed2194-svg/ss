import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { randomToken, sha256 } from "./crypto";
import { one, query } from "./db";

export const SESSION_COOKIE = "smm_session";
const SESSION_DAYS = 30;

export interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  balance: number;
  spent: number;
  api_key: string;
  created_at: Date;
}

const USER_COLUMNS = "u.id, u.username, u.email, u.role, u.status, u.balance, u.spent, u.api_key, u.created_at";

export async function createSession(userId: number) {
  const token = randomToken();
  await query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + $3::interval)", [
    sha256(token),
    userId,
    `${SESSION_DAYS} days`,
  ]);
  await query("UPDATE users SET last_login_at = now() WHERE id = $1", [userId]);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await query("DELETE FROM sessions WHERE token_hash = $1", [sha256(token)]);
  jar.delete(SESSION_COOKIE);
}

export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = await one<User>(
    `SELECT ${USER_COLUMNS} FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [sha256(token)]
  );
  return user && user.status === "active" ? user : null;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") notFound();
  return user;
}

export async function userByApiKey(key: string) {
  if (!key) return null;
  const user = await one<User>(`SELECT ${USER_COLUMNS} FROM users u WHERE u.api_key = $1`, [key]);
  return user && user.status === "active" ? user : null;
}
