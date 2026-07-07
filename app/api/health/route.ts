import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Admin-only diagnostic. Returns which integrations are wired up in this
// deployment, without leaking secret values. Use to confirm env vars are
// really set in Production after a redeploy.
export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    "";
  const ntfy = process.env.NTFY_URL || process.env.NTFY_TOPIC_URL || "";
  const gmailUser = process.env.GMAIL_USER || "";
  const gmailPass = process.env.GMAIL_APP_PASSWORD || "";
  const gmailName = process.env.GMAIL_FROM_NAME || "";
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY || "";

  return NextResponse.json({
    supabase: {
      urlSet: !!supabaseUrl,
      urlHost: supabaseUrl ? new URL(supabaseUrl).host : null,
      keySet: !!supabaseKey,
    },
    ntfy: {
      set: !!ntfy,
      host: ntfy ? new URL(ntfy).host : null,
      topic: ntfy ? new URL(ntfy).pathname.replace(/^\//, "") : null,
    },
    gmail: {
      userSet: !!gmailUser,
      user: gmailUser || null,
      passSet: !!gmailPass,
      passLength: gmailPass.length,
      fromName: gmailName || null,
    },
    maps: {
      keySet: !!mapsKey,
      keyLength: mapsKey.length,
    },
    nodeEnv: process.env.NODE_ENV || null,
    vercelEnv: process.env.VERCEL_ENV || null,
  });
}
