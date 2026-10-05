"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { hashPassword, newApiKey, verifyPassword } from "@/lib/crypto";
import { one } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export type FormResult = { error?: string; ok?: string } | undefined;

const field = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const slowFail = async (error: string) => {
  await new Promise((r) => setTimeout(r, 500));
  return { error };
};

export async function login(fd: FormData): Promise<FormResult> {
  const id = field(fd, "login").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!id || !password) return { error: "Enter your username or email and password." };
  const user = await one<{ id: number; password_hash: string; status: string }>(
    "SELECT id, password_hash, status FROM users WHERE lower(username) = $1 OR email = $1",
    [id]
  );
  if (!user || !(await verifyPassword(password, user.password_hash))) return slowFail("Wrong username/email or password.");
  if (user.status !== "active") return { error: "This account is suspended. Contact support." };
  await createSession(user.id);
  redirect("/dashboard");
}

export async function register(fd: FormData): Promise<FormResult> {
  const settings = await getSettings();
  if (!settings.registrationOpen) return { error: "Registration is currently closed." };
  const username = field(fd, "username");
  const email = field(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) return { error: "Username must be 3–24 letters, numbers or underscores." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (fd.get("terms") !== "on") return { error: "Please accept the terms of service." };
  const taken = await one<{ username: string; email: string }>(
    "SELECT username, email FROM users WHERE lower(username) = lower($1) OR email = $2",
    [username, email]
  );
  if (taken) return { error: taken.email === email ? "An account with this email already exists." : "This username is taken." };
  const user = await one<{ id: number }>(
    "INSERT INTO users (username, email, password_hash, api_key) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id",
    [username, email, await hashPassword(password), newApiKey()]
  );
  if (!user) return { error: "This username or email is taken." };
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
