import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/adminAuth";

export async function POST() {
  clearAuthCookie();
  return NextResponse.json({ ok: true });
}
