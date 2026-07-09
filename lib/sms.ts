// Twilio SMS via plain REST calls (no SDK dependency — same pattern as
// the Google Maps fetch calls elsewhere in this codebase).
//
// Reads env vars:
//   TWILIO_ACCOUNT_SID   required
//   TWILIO_AUTH_TOKEN    required
//   TWILIO_SMS_FROM      required, e.g. "+15045551234"
//
// If any are missing, smsConfigured() is false and sendSms() is a no-op
// that resolves without throwing — callers never need to branch on
// whether SMS is set up.

import crypto from "crypto";

export function smsConfigured(): boolean {
  return (
    !!process.env.TWILIO_ACCOUNT_SID?.trim() &&
    !!process.env.TWILIO_AUTH_TOKEN?.trim() &&
    !!process.env.TWILIO_SMS_FROM?.trim()
  );
}

// Normalize US numbers to E.164. Accepts "(504) 339-6861", "504-339-6861",
// "5043396861", or already-E.164 "+15043396861".
export function toE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

// Bare 10-digit comparison key, for matching an inbound Twilio "From"
// number against whatever format a driver's phone happens to be stored
// in ("(504) 339-6861" vs "+15043396861" vs "5043396861").
export function phoneDigits(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

// Verify Twilio's webhook signature so /api/sms/inbound only trusts
// requests that really came from Twilio. Algorithm per Twilio docs:
// HMAC-SHA1(authToken, url + sorted "key"+"value" pairs of POST params).
export function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signatureHeader: string | null
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!authToken || !signatureHeader) return false;
  const data =
    url +
    Object.keys(params)
      .sort()
      .map((k) => k + params[k])
      .join("");
  const expected = crypto
    .createHmac("sha1", authToken)
    .update(Buffer.from(data, "utf-8"))
    .digest("base64");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signatureHeader)
    );
  } catch {
    return false;
  }
}

export async function sendSms(input: {
  to: string;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromRaw = process.env.TWILIO_SMS_FROM?.trim();
  if (!sid || !token || !fromRaw) return { ok: false, error: "Twilio not configured" };

  // Twilio's API rejects "From" unless it's strict E.164 — accept
  // whatever format the env var happens to be in (e.g. "(225) 663-8806")
  // and normalize it the same way we normalize recipient numbers.
  const from = toE164(fromRaw);
  if (!from) return { ok: false, error: `Bad TWILIO_SMS_FROM: ${fromRaw}` };

  const to = toE164(input.to);
  if (!to) return { ok: false, error: `Bad phone number: ${input.to}` };

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: from, Body: input.body }),
      }
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[sms] Twilio send failed:", res.status, detail);
      return { ok: false, error: `Twilio ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[sms] send failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}
