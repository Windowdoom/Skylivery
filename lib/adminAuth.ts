import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "sl_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function token(password: string): string {
  return createHmac("sha256", password + "|sky-livery-admin")
    .update("v1")
    .digest("hex");
}

export function isAuthed(): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const c = cookies().get(COOKIE);
  if (!c) return false;
  const want = token(expected);
  try {
    const a = Buffer.from(c.value, "hex");
    const b = Buffer.from(want, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function setAuthCookie(password: string): void {
  cookies().set(COOKIE, token(password), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearAuthCookie(): void {
  cookies().delete(COOKIE);
}
