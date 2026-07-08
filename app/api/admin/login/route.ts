import { NextRequest, NextResponse } from "next/server";
import { setAuthCookie, verifyDispatcherCode } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = typeof body?.code === "string" ? body.code : "";
  if (!code) {
    return NextResponse.json({ error: "Code required." }, { status: 400 });
  }
  const dispatcher = await verifyDispatcherCode(code);
  if (!dispatcher) {
    return NextResponse.json({ error: "Code not recognized." }, { status: 401 });
  }
  await setAuthCookie(dispatcher);
  return NextResponse.json({
    ok: true,
    name: dispatcher.name,
    role: dispatcher.role,
  });
}
