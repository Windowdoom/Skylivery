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
        // Base gratuity is already included in the fare, but Square's
        // tip screen still gives the customer a chance to add extra if
        // they had a great ride. They can always tap "No tip".
        allowTipping: true,
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

// Create a Square-hosted invoice for a corporate booking. Returns the
// public URL Square hosts the invoice at, plus its id for our records.
export async function createCorporateInvoice(input: {
  tripId: string;
  amountCents: number;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  billingAddress?: string;
  pickup: string;
  dropoff: string;
  tripDate: string;
  tripTime: string;
  terms: string; // "Due on receipt" | "Net 15" | "Net 30"
  poNumber?: string;
  costCenter?: string;
}): Promise<{ url: string | null; id: string; number: string | null } | null> {
  const c = client();
  const locationId = process.env.SQUARE_LOCATION_ID?.trim();
  if (!c || !locationId) return null;

  try {
    // 1) Ensure a customer record for this contact.
    const customerRes = await c.customers.create({
      idempotencyKey: `cust-${input.tripId}-${Date.now()}`,
      givenName: input.contactName,
      companyName: input.companyName,
      emailAddress: input.contactEmail,
      phoneNumber: input.contactPhone,
      note: [input.poNumber && `PO: ${input.poNumber}`, input.costCenter && `Cost: ${input.costCenter}`]
        .filter(Boolean)
        .join(" · "),
    });
    const customerId = customerRes.customer?.id;
    if (!customerId) return null;

    // 2) Create an order with a single line item for the ride.
    const orderRes = await c.orders.create({
      idempotencyKey: `order-${input.tripId}-${Date.now()}`,
      order: {
        locationId,
        customerId,
        lineItems: [
          {
            name: `Sky Livery · ${input.tripId}`,
            quantity: "1",
            basePriceMoney: {
              amount: BigInt(input.amountCents),
              currency: "USD",
            },
            note: [
              `${input.pickup} → ${input.dropoff}`,
              `Pickup: ${input.tripDate} ${input.tripTime}`,
              input.poNumber && `PO: ${input.poNumber}`,
              input.costCenter && `Cost center: ${input.costCenter}`,
            ]
              .filter(Boolean)
              .join(" · "),
          },
        ],
      },
    });
    const orderId = orderRes.order?.id;
    if (!orderId) return null;

    // 3) Create the invoice pointing at the order.
    const dueDays =
      input.terms === "Net 30" ? 30 : input.terms === "Net 15" ? 15 : 0;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);
    const dueDateStr = dueDate.toISOString().slice(0, 10);

    const invoiceRes = await c.invoices.create({
      idempotencyKey: `inv-${input.tripId}-${Date.now()}`,
      invoice: {
        locationId,
        orderId,
        primaryRecipient: { customerId },
        deliveryMethod: "EMAIL",
        paymentRequests: [
          {
            requestType: "BALANCE",
            dueDate: dueDateStr,
          },
        ],
        acceptedPaymentMethods: {
          card: true,
          squareGiftCard: false,
          bankAccount: true,
          buyNowPayLater: false,
        },
        title: `Sky Livery · ${input.tripId}`,
        description: [
          input.pickup,
          "→",
          input.dropoff,
          `· ${input.tripDate} ${input.tripTime}`,
          input.poNumber ? `· PO ${input.poNumber}` : "",
        ]
          .filter(Boolean)
          .join(" "),
        customFields: [
          input.companyName ? { label: "Company", value: input.companyName } : null,
          input.billingAddress
            ? { label: "Billing address", value: input.billingAddress }
            : null,
          input.poNumber ? { label: "PO number", value: input.poNumber } : null,
          input.costCenter
            ? { label: "Cost center", value: input.costCenter }
            : null,
          { label: "Terms", value: input.terms },
        ].filter(Boolean) as { label: string; value: string }[],
      },
    });

    const invoice = invoiceRes.invoice;
    if (!invoice?.id) return null;

    // 4) Publish the invoice so Square emails it to the customer.
    const published = await c.invoices.publish({
      invoiceId: invoice.id,
      version: invoice.version!,
      idempotencyKey: `pub-${input.tripId}-${Date.now()}`,
    });

    return {
      url: published.invoice?.publicUrl ?? null,
      id: invoice.id,
      number: published.invoice?.invoiceNumber ?? null,
    };
  } catch (e) {
    console.error("[square] createCorporateInvoice failed:", e);
    return null;
  }
}

// Refund a Square payment by trip reference. Looks up the most recent
// completed payment whose note contains the trip_id, then issues a
// refund for the full or specified amount.
export async function refundByTripId(input: {
  tripId: string;
  amountCents?: number;
  reason?: string;
}): Promise<{ ok: boolean; refundId?: string; error?: string }> {
  const c = client();
  if (!c) return { ok: false, error: "Square not configured" };

  try {
    // Look up recent payments and find the one for this trip.
    const search = await c.payments.list({
      limit: 50,
      sortOrder: "DESC",
    });

    let paymentId: string | null = null;
    let paymentAmount: number | null = null;
    for await (const p of search) {
      const note = (p.note || "") + " " + (p.referenceId || "");
      if (note.includes(input.tripId)) {
        paymentId = p.id || null;
        paymentAmount = Number(p.amountMoney?.amount || 0);
        break;
      }
    }

    if (!paymentId) {
      return { ok: false, error: `No Square payment found for ${input.tripId}` };
    }

    const refundAmount = input.amountCents ?? paymentAmount ?? 0;
    if (refundAmount <= 0) {
      return { ok: false, error: "Refund amount is zero" };
    }

    const refund = await c.refunds.refundPayment({
      idempotencyKey: `refund-${input.tripId}-${Date.now()}`,
      paymentId,
      amountMoney: {
        amount: BigInt(refundAmount),
        currency: "USD",
      },
      reason: input.reason || `Refund for ${input.tripId}`,
    });

    return {
      ok: true,
      refundId: refund.refund?.id,
    };
  } catch (e) {
    console.error("[square] refundByTripId failed:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "refund failed",
    };
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
