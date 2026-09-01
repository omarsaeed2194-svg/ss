import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthUrl } from "@/lib/google/oauth";
import { saveState } from "@/lib/google/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    saveState(state);
    const url = getAuthUrl(req.nextUrl.origin, state);
    return NextResponse.redirect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "OAuth is not configured.";
    return NextResponse.redirect(`${req.nextUrl.origin}/connect?error=${encodeURIComponent(message)}`);
  }
}
