import { NextRequest, NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "Admin login not configured." }, { status: 500 });
  }
  if (typeof password !== "string" || password.length === 0 || password !== expected) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  setAuthCookie(expected);
  return NextResponse.json({ ok: true });
}
