import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/adminAuth";

export async function POST() {
  await clearAuthCookie();
  return NextResponse.redirect(new URL("/admin/login", process.env.PUBLIC_SITE_URL || "https://www.skyliverynola.com"));
}
