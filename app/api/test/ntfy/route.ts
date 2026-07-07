import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Admin-only. Fires a test push to the configured ntfy topic and returns
// the actual response so we can see why a real booking push may have been
// silently dropped by the fire-and-forget catch in /api/book.
export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ntfyUrl = process.env.NTFY_URL || process.env.NTFY_TOPIC_URL;
  if (!ntfyUrl) {
    return NextResponse.json(
      { ok: false, error: "NTFY_URL / NTFY_TOPIC_URL not set" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(ntfyUrl, {
      method: "POST",
      headers: {
        Title: "Sky Livery test push",
        Priority: "high",
        Tags: "test_tube,sparkles",
      },
      body: `Ntfy test at ${new Date().toISOString()}\nIf you see this on your phone, ntfy is working.`,
    });
    const text = await res.text();
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      responseBody: text.slice(0, 500),
      ntfyUrl,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        ntfyUrl,
      },
      { status: 500 }
    );
  }
}
