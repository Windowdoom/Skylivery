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
  const sqToken = process.env.SQUARE_ACCESS_TOKEN || "";
  const sqLoc = process.env.SQUARE_LOCATION_ID || "";
  const sqApp = process.env.SQUARE_APPLICATION_ID || "";
  const sqSig = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "";
  const sqEnv = process.env.SQUARE_ENV || "";
  const siteUrl = process.env.PUBLIC_SITE_URL || "";
  const twSid = process.env.TWILIO_ACCOUNT_SID || "";
  const twToken = process.env.TWILIO_AUTH_TOKEN || "";
  const twFrom = process.env.TWILIO_SMS_FROM || "";

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
    square: {
      accessTokenSet: !!sqToken,
      accessTokenPrefix: sqToken ? sqToken.slice(0, 5) : null,
      locationIdSet: !!sqLoc,
      locationId: sqLoc || null,
      applicationIdSet: !!sqApp,
      webhookSigKeySet: !!sqSig,
      webhookSigKeyLength: sqSig.length,
      env: sqEnv || null,
    },
    twilio: {
      accountSidSet: !!twSid,
      accountSidPrefix: twSid ? twSid.slice(0, 6) : null,
      authTokenSet: !!twToken,
      authTokenLength: twToken.length,
      smsFromSet: !!twFrom,
      smsFrom: twFrom || null,
    },
    siteUrl: siteUrl || null,
    nodeEnv: process.env.NODE_ENV || null,
    vercelEnv: process.env.VERCEL_ENV || null,
  });
}
