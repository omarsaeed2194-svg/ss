import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/google/oauth";
import { consumeState, saveConnection } from "@/lib/google/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const baseUrl = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expected = consumeState();

  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(`${baseUrl}/connect?error=invalid_state`);
  }

  try {
    const { tokens, email } = await exchangeCode(baseUrl, code);
    if (!tokens.refresh_token) {
      return NextResponse.redirect(`${baseUrl}/connect?error=no_refresh_token`);
    }
    saveConnection({ refreshToken: tokens.refresh_token, email });
    return NextResponse.redirect(`${baseUrl}/connect?connected=1`);
  } catch {
    return NextResponse.redirect(`${baseUrl}/connect?error=oauth_failed`);
  }
}
