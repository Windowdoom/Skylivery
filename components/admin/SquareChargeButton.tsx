"use client";
import { useState } from "react";

// Tries to hand the charge straight to the Square Point of Sale app
// (Tap to Pay, no manual card entry) via Square's documented mobile
// deep-link format. If the driver doesn't have the app, or the deep
// link format has drifted from what Square documents (their live docs
// were unreachable while building this — verify on a real phone with
// Square POS installed before relying on it), nothing bad happens: the
// browser tab just stays put, a short timeout notices that, and it
// falls back automatically to the Square Checkout web link that
// already works today. That link is always shown too, never hidden,
// so there's always a manual way in either way.
export default function SquareChargeButton({
  tripId,
  rate,
  paymentLink,
  callbackUrl,
}: {
  tripId: string;
  rate: number | null;
  paymentLink: string;
  callbackUrl: string;
}) {
  const [tried, setTried] = useState(false);
  const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;

  function tryPosApp() {
    if (!appId || !rate) return;
    setTried(true);
    const payload = {
      amount_money: { amount: Math.round(rate * 100), currency_code: "USD" },
      callback_url: callbackUrl,
      client_id: appId,
      version: "1.3",
      notes: tripId,
      options: { supported_tender_types: ["CREDIT_CARD", "CASH", "OTHER"] },
    };
    const deepLink = `square-commerce-v1://payment/create?data=${encodeURIComponent(JSON.stringify(payload))}`;

    const fallbackTimer = setTimeout(() => {
      if (document.visibilityState === "visible") {
        window.location.href = paymentLink;
      }
    }, 1200);
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.visibilityState === "hidden") clearTimeout(fallbackTimer);
      },
      { once: true }
    );
    window.location.href = deepLink;
  }

  if (!appId) {
    // Not configured — just the link that already works, no attempt
    // at a deep link that would only ever fail silently.
    return (
      <a
        href={paymentLink}
        target="_blank"
        className="block text-center py-2.5 bg-navy border border-gold/50 text-gold rounded-lg font-semibold hover:bg-gold/10"
      >
        Tap to charge ${rate ?? "?"}
      </a>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={tryPosApp}
        className="w-full text-center py-2.5 bg-gold text-navy rounded-lg font-bold hover:bg-cream"
      >
        {tried ? "Opening Square…" : `Charge $${rate ?? "?"} in Square app`}
      </button>
      <a
        href={paymentLink}
        target="_blank"
        className="block text-center py-2 border border-gold/30 text-cream/70 text-xs rounded-lg hover:border-gold hover:text-gold"
      >
        Or use the Square payment link instead
      </a>
    </div>
  );
}
