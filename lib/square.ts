// Square Checkout integration. Creates a hosted payment link for the
// customer when they pick "Pay before pickup" at booking time, and
// exposes helpers used by the /api/webhooks/square handler.
//
// Reads env vars:
//   SQUARE_ACCESS_TOKEN     required (sandbox or production)
//   SQUARE_LOCATION_ID      required
//   SQUARE_APPLICATION_ID   optional but recommended (used for webhook)
//   SQUARE_ENV              "sandbox" (default) or "production"
//
// If SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID are missing, all helpers
// return null and the caller falls back to the pre-Square flow (email
// with "we'll text you a link" copy but no actual link). This lets us
// ship the code before creds land in Vercel.

import { SquareClient, SquareEnvironment } from "square";
import crypto from "crypto";

let cached: SquareClient | null = null;

function client(): SquareClient | null {
  if (cached) return cached;
  const token = process.env.SQUARE_ACCESS_TOKEN?.trim();
  if (!token) return null;
  cached = new SquareClient({
    token,
    environment:
      process.env.SQUARE_ENV === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });
  return cached;
}

export function squareConfigured(): boolean {
  return (
    !!process.env.SQUARE_ACCESS_TOKEN?.trim() &&
    !!process.env.SQUARE_LOCATION_ID?.trim()
  );
}

// Build the customer-facing redirect URL. Points at the confirmation
// page with the trip reference so we can show a "thanks, we're set"
// state when they land back.
function redirectUrl(tripId: string): string {
  const base = process.env.PUBLIC_SITE_URL || "https://www.skyliverynola.com";
  return `${base}/book/paid?ref=${encodeURIComponent(tripId)}`;
}

export async function createCheckoutLink(input: {
  tripId: string;
  amountCents: number;
  customerName: string;
  customerEmail?: string | null;
  pickup: string;
  dropoff: string;
}): Promise<{ url: string; id: string } | null> {
  const c = client();
  const locationId = process.env.SQUARE_LOCATION_ID?.trim();
  if (!c || !locationId) return null;

  try {
    const res = await c.checkout.paymentLinks.create({
      idempotencyKey: `sl-${input.tripId}-${Date.now()}`,
      quickPay: {
        name: `Sky Livery · ${input.tripId}`,
        priceMoney: {
          amount: BigInt(input.amountCents),
          currency: "USD",
        },
        locationId,
      },
      checkoutOptions: {
        allowTipping: false,
        askForShippingAddress: false,
        redirectUrl: redirectUrl(input.tripId),
        merchantSupportEmail:
          process.env.GMAIL_USER || "skyliveryllc@gmail.com",
      },
      description: `Trip ${input.tripId}: ${input.pickup} → ${input.dropoff}`,
      prePopulatedData: input.customerEmail
        ? {
            buyerEmail: input.customerEmail,
          }
        : undefined,
      paymentNote: input.tripId,
    });

    const link = res.paymentLink;
    if (link?.url && link?.id) {
      return { url: link.url, id: link.id };
    }
    return null;
  } catch (e) {
    console.error("[square] createCheckoutLink failed:", e);
    return null;
  }
}

// Verify the HMAC signature Square puts on webhook deliveries so we
// only trust real Square events. Body must be the raw request body
// (not JSON-parsed) for signature verification.
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  requestUrl: string
): boolean {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim();
  if (!signatureKey || !signatureHeader) return false;

  const hmac = crypto.createHmac("sha256", signatureKey);
  hmac.update(requestUrl + rawBody);
  const expected = hmac.digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signatureHeader)
    );
  } catch {
    return false;
  }
}
