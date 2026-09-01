import { NextResponse } from "next/server";
import { clearConnection } from "@/lib/google/session";

export async function POST() {
  clearConnection();
  return NextResponse.json({ ok: true });
}
