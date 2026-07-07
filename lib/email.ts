// Gmail SMTP email sender for booking confirmations and receipts.
// Requires: GMAIL_USER, GMAIL_APP_PASSWORD (Google App Password), and
// optionally GMAIL_FROM_NAME. Emails are sent async and never block the
// calling API route — a failed send is logged but does not fail the
// booking.

import nodemailer from "nodemailer";

type Transporter = ReturnType<typeof nodemailer.createTransport>;
let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const user = process.env.GMAIL_USER?.trim();
  // Google displays App Passwords as "abcd efgh ijkl mnop" (16 chars with
  // three spaces = 19). Some SMTP libraries choke on the spaces, so strip
  // them defensively.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) return null;
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return cachedTransporter;
}

function fromField(): string {
  const name = process.env.GMAIL_FROM_NAME || "Sky Livery LLC";
  const addr = process.env.GMAIL_USER || "";
  return `"${name}" <${addr}>`;
}

// Money formatter — always whole dollars, US style.
function money(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "$0";
  return `$${Math.round(Number(n)).toLocaleString()}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(t: string): string {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hi = parseInt(h, 10);
  if (Number.isNaN(hi)) return t;
  const am = hi < 12;
  const h12 = hi === 0 ? 12 : hi > 12 ? hi - 12 : hi;
  return `${h12}:${m || "00"} ${am ? "AM" : "PM"}`;
}

// Shared layout: cream background, gold accents, navy text. Matches the
// business card and rate card visual system.
function shell(title: string, previewText: string, inner: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#EFE3C4;font-family:Georgia,'Playfair Display',serif;color:#0A1628;">
    <span style="display:none;visibility:hidden;opacity:0;max-height:0;overflow:hidden;">${previewText}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#EFE3C4;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#F5EBD3;border:1px solid #8C7A46;">
            <tr>
              <td style="padding:32px 36px 20px 36px;text-align:center;border-bottom:1px solid #8C7A46;">
                <div style="font-family:Georgia,serif;font-size:26px;letter-spacing:0.28em;color:#0A1628;font-weight:600;">
                  SKY LIVERY <span style="color:#8C7A46;font-size:18px;">LLC</span>
                </div>
                <div style="margin-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.4em;color:#8C7A46;text-transform:uppercase;">
                  Kenner &nbsp;·&nbsp; Louisiana
                </div>
              </td>
            </tr>
            ${inner}
            <tr>
              <td style="padding:22px 36px;background:#0A1628;color:#F5EBD3;text-align:center;">
                <div style="font-family:Georgia,serif;font-style:italic;color:#C9A961;font-size:14px;margin-bottom:6px;">
                  Arrive like you own the city.
                </div>
                <div style="font-family:Arial,sans-serif;font-size:11px;color:#F5EBD3;opacity:0.75;">
                  Sky Livery LLC · (504) 479-0454 · 24/7 dispatch<br/>
                  New Orleans, LA · Licensed &amp; Insured · 45+ Years Chauffeur Experience
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function tripBlock(b: {
  tripId: string;
  pickup: string;
  dropoff: string;
  tripDate: string;
  tripTime: string;
  rate: number | null | undefined;
  passengers?: number | null;
  serviceType?: string | null;
}): string {
  return `
    <tr>
      <td style="padding:22px 36px 8px 36px;">
        <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.3em;color:#8C7A46;text-transform:uppercase;">Reference</div>
        <div style="font-family:Georgia,serif;font-size:22px;color:#0A1628;font-weight:600;letter-spacing:0.05em;margin-top:2px;">${b.tripId}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:6px 36px 22px 36px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#EFE3C4;border-left:3px solid #C9A961;">
          <tr>
            <td style="padding:16px 18px;font-family:Arial,sans-serif;font-size:13px;color:#0A1628;line-height:1.7;">
              <div><strong style="color:#8C7A46;">Pickup:</strong> ${b.pickup}</div>
              <div><strong style="color:#8C7A46;">Dropoff:</strong> ${b.dropoff}</div>
              <div><strong style="color:#8C7A46;">When:</strong> ${fmtDate(b.tripDate)} at ${fmtTime(b.tripTime)}</div>
              ${b.serviceType ? `<div><strong style="color:#8C7A46;">Service:</strong> ${b.serviceType}</div>` : ""}
              ${b.passengers ? `<div><strong style="color:#8C7A46;">Passengers:</strong> ${b.passengers}</div>` : ""}
              <div style="margin-top:10px;padding-top:10px;border-top:1px dashed #8C7A46;">
                <strong style="color:#8C7A46;">Fare:</strong>
                <span style="font-family:Georgia,serif;font-size:20px;color:#0A1628;font-weight:600;margin-left:8px;">${money(b.rate)}</span>
                <span style="color:#0A1628;opacity:0.6;font-size:11px;margin-left:4px;">all-inclusive · gratuity included</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

// ---------------- Confirmation email ----------------

export async function sendBookingConfirmation(b: {
  to: string;
  customerName: string;
  tripId: string;
  pickup: string;
  dropoff: string;
  tripDate: string;
  tripTime: string;
  rate: number | null | undefined;
  passengers?: number | null;
  serviceType?: string | null;
}): Promise<void> {
  const t = getTransporter();
  if (!t) return; // silently skip if not configured

  const inner = `
    <tr>
      <td style="padding:26px 36px 4px 36px;">
        <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.3em;color:#8C7A46;text-transform:uppercase;">Booking confirmed</div>
        <h1 style="font-family:Georgia,serif;font-size:24px;color:#0A1628;font-weight:600;margin:6px 0 12px 0;line-height:1.3;">
          Thank you, ${b.customerName.split(" ")[0]}. Your ride is booked.
        </h1>
        <p style="font-family:Arial,sans-serif;font-size:14px;color:#0A1628;line-height:1.6;margin:0;">
          A licensed chauffeur will be at your pickup at the scheduled time. Dispatch will text you a driver name and vehicle plate roughly 30 minutes before pickup. If your flight is inbound, we are already tracking it.
        </p>
      </td>
    </tr>
    ${tripBlock(b)}
    <tr>
      <td style="padding:0 36px 22px 36px;">
        <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.3em;color:#8C7A46;text-transform:uppercase;margin-bottom:8px;">How to pay</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding:12px 14px;background:#EFE3C4;border:1px solid #8C7A46;font-family:Arial,sans-serif;font-size:13px;color:#0A1628;line-height:1.5;">
              <strong>1. Online (card).</strong> Use the secure Square payment link we will text you before pickup.
            </td>
          </tr>
          <tr><td style="height:8px;"></td></tr>
          <tr>
            <td style="padding:12px 14px;background:#EFE3C4;border:1px solid #8C7A46;font-family:Arial,sans-serif;font-size:13px;color:#0A1628;line-height:1.5;">
              <strong>2. In-vehicle (card).</strong> Every driver carries a Square reader. Tap or insert on drop-off.
            </td>
          </tr>
          <tr><td style="height:8px;"></td></tr>
          <tr>
            <td style="padding:12px 14px;background:#EFE3C4;border:1px solid #8C7A46;font-family:Arial,sans-serif;font-size:13px;color:#0A1628;line-height:1.5;">
              <strong>3. Cash.</strong> Accepted as well. Please have exact fare if possible.
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 36px 26px 36px;">
        <div style="font-family:Arial,sans-serif;font-size:12px;color:#0A1628;opacity:0.75;line-height:1.6;">
          Need to make a change? Reply to this email or call dispatch at
          <a href="tel:+15043396861" style="color:#8C7A46;text-decoration:none;font-weight:600;">(504) 339-6861</a>
          or <a href="tel:+15044790454" style="color:#8C7A46;text-decoration:none;font-weight:600;">(504) 479-0454</a>.
          We answer 24 hours a day, every day of the year.
        </div>
      </td>
    </tr>
  `;

  const html = shell(
    `Your Sky Livery ride is confirmed · ${b.tripId}`,
    `Booking ${b.tripId} confirmed. Pickup ${fmtDate(b.tripDate)} at ${fmtTime(b.tripTime)}. Fare ${money(b.rate)}.`,
    inner
  );

  try {
    await t.sendMail({
      from: fromField(),
      to: b.to,
      subject: `Sky Livery: booking confirmed (${b.tripId})`,
      html,
      replyTo: process.env.GMAIL_USER,
    });
  } catch (e) {
    console.error("[email] confirmation failed:", e);
  }
}

// ---------------- Receipt email ----------------

export async function sendReceipt(b: {
  to: string;
  customerName: string;
  tripId: string;
  pickup: string;
  dropoff: string;
  tripDate: string;
  tripTime: string;
  rate: number | null | undefined;
  paymentMethod: string | null;
  completedAt: string;
  passengers?: number | null;
  serviceType?: string | null;
}): Promise<void> {
  const t = getTransporter();
  if (!t) return;

  const methodLabel = (() => {
    switch ((b.paymentMethod || "").toLowerCase()) {
      case "square":
      case "card":
        return "Card via Square";
      case "cash":
        return "Cash";
      case "invoice":
        return "Invoiced";
      case "third_party":
        return "Third-party billing";
      default:
        return b.paymentMethod || "—";
    }
  })();

  const inner = `
    <tr>
      <td style="padding:26px 36px 4px 36px;">
        <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.3em;color:#8C7A46;text-transform:uppercase;">Receipt · paid in full</div>
        <h1 style="font-family:Georgia,serif;font-size:24px;color:#0A1628;font-weight:600;margin:6px 0 12px 0;line-height:1.3;">
          Thank you for riding with Sky Livery.
        </h1>
        <p style="font-family:Arial,sans-serif;font-size:14px;color:#0A1628;line-height:1.6;margin:0;">
          Below is your receipt. Please keep it for your records. If you traveled for business and need an itemized invoice with a company name on it, reply to this email and dispatch will send one within the business day.
        </p>
      </td>
    </tr>
    ${tripBlock(b)}
    <tr>
      <td style="padding:0 36px 22px 36px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0A1628;">
          <tr>
            <td style="padding:16px 18px;font-family:Arial,sans-serif;font-size:13px;color:#F5EBD3;line-height:1.7;">
              <div style="letter-spacing:0.25em;text-transform:uppercase;font-size:10px;color:#C9A961;margin-bottom:6px;">Payment</div>
              <div><strong style="color:#C9A961;">Method:</strong> ${methodLabel}</div>
              <div><strong style="color:#C9A961;">Paid on:</strong> ${fmtDate(b.completedAt)}</div>
              <div style="margin-top:8px;padding-top:8px;border-top:1px solid #8C7A46;">
                <strong style="color:#C9A961;">Total charged:</strong>
                <span style="font-family:Georgia,serif;font-size:20px;color:#F5EBD3;font-weight:600;margin-left:6px;">${money(b.rate)}</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 36px 26px 36px;">
        <div style="font-family:Arial,sans-serif;font-size:12px;color:#0A1628;opacity:0.75;line-height:1.6;">
          Loved the ride? Book us again anytime at
          <a href="https://skylivery1.vercel.app/book" style="color:#8C7A46;text-decoration:none;font-weight:600;">skylivery1.vercel.app/book</a>
          or call <a href="tel:+15043396861" style="color:#8C7A46;text-decoration:none;font-weight:600;">(504) 339-6861</a> or <a href="tel:+15044790454" style="color:#8C7A46;text-decoration:none;font-weight:600;">(504) 479-0454</a>.
        </div>
      </td>
    </tr>
  `;

  const html = shell(
    `Sky Livery receipt · ${b.tripId}`,
    `Receipt for ${b.tripId}. ${money(b.rate)} paid via ${methodLabel}.`,
    inner
  );

  try {
    await t.sendMail({
      from: fromField(),
      to: b.to,
      subject: `Sky Livery: receipt (${b.tripId})`,
      html,
      replyTo: process.env.GMAIL_USER,
    });
  } catch (e) {
    console.error("[email] receipt failed:", e);
  }
}
