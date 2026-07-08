import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "./supabaseAdmin";

// Dispatcher-based admin auth.
//
// Each person (owner + N dispatchers) logs in with their own numeric
// code. Their identity is embedded in a signed cookie so we can:
//   - track who created / dispatched every booking
//   - hide owner-only actions (delete, clear tests) from dispatchers
//   - allow multiple people to be logged in simultaneously
//
// The cookie carries a compact payload (id.role.name) plus an HMAC
// signature so reading is O(1) with no DB round-trip on every request.
// If a dispatcher is deactivated in Supabase, they stay authorized on
// their current session until it expires or the owner rotates the HMAC
// secret via the ADMIN_HMAC_SECRET env var.

const COOKIE = "sl_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const HMAC_ENV = () =>
  process.env.ADMIN_HMAC_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "sky-livery-fallback-dev-secret";

export type DispatcherRole = "owner" | "dispatcher";
export type Dispatcher = {
  id: string;
  name: string;
  role: DispatcherRole;
};

function sign(payload: string): string {
  return createHmac("sha256", HMAC_ENV()).update(payload).digest("hex");
}

function encodePayload(d: Dispatcher): string {
  // base64url of JSON. Safe for cookie value.
  const json = JSON.stringify({ i: d.id, r: d.role, n: d.name });
  return Buffer.from(json, "utf-8").toString("base64url");
}

function decodePayload(b64: string): Dispatcher | null {
  try {
    const json = Buffer.from(b64, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    if (
      typeof parsed.i !== "string" ||
      typeof parsed.r !== "string" ||
      typeof parsed.n !== "string"
    )
      return null;
    if (parsed.r !== "owner" && parsed.r !== "dispatcher") return null;
    return { id: parsed.i, name: parsed.n, role: parsed.r };
  } catch {
    return null;
  }
}

export async function verifyDispatcherCode(
  code: string
): Promise<Dispatcher | null> {
  const clean = (code || "").trim();
  if (!clean) return null;
  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from("dispatchers")
      .select("id, name, role, active")
      .eq("code", clean)
      .eq("active", true)
      .single();
    if (!data) return null;
    const role: DispatcherRole = data.role === "owner" ? "owner" : "dispatcher";
    return { id: data.id, name: data.name, role };
  } catch {
    return null;
  }
}

export async function setAuthCookie(dispatcher: Dispatcher): Promise<void> {
  const payload = encodePayload(dispatcher);
  const sig = sign(payload);
  const value = `${payload}.${sig}`;
  const jar = await cookies();
  jar.set(COOKIE, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAuthCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

// Sync — reads and verifies the cookie without hitting the DB.
export function currentDispatcher(): Dispatcher | null {
  try {
    // In Next.js 15 cookies() is async in some contexts, but reading
    // during a synchronous server context still returns the same store.
    // We cast to any so the code compiles under either return type.
    const jar = cookies() as unknown as {
      get: (name: string) => { value: string } | undefined;
    };
    const c = jar.get(COOKIE);
    if (!c) return null;
    const [b64, sig] = c.value.split(".");
    if (!b64 || !sig) return null;
    const expected = sign(b64);
    // timingSafeEqual requires equal length; hex strings from same hash
    // are always 64 chars.
    if (sig.length !== expected.length) return null;
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length === 0 || b.length === 0) return null;
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    return decodePayload(b64);
  } catch {
    return null;
  }
}

export function isAuthed(): boolean {
  return currentDispatcher() !== null;
}

export function isOwner(): boolean {
  return currentDispatcher()?.role === "owner";
}

// Convenience: throw if not authorized. Optionally require owner.
export function requireAuth(
  opts?: { owner?: boolean }
): Dispatcher {
  const d = currentDispatcher();
  if (!d) throw new Error("unauthorized");
  if (opts?.owner && d.role !== "owner") throw new Error("owner-only");
  return d;
}
