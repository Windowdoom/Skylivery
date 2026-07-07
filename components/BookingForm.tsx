"use client";
import { useEffect, useState } from "react";
import { FleurIcon } from "./Fleur";
import AddressAutocomplete from "./AddressAutocomplete";

type Quote = {
  rate: number;
  note: string;
  rateType?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  distanceMiles?: number;
};
type Step = "form" | "quote" | "details" | "confirmed" | "phone";

export type BookingContext = {
  label: string;         // shown to the customer, e.g. "Wedding & Events"
  subtitle?: string;     // small right-side tag, e.g. "Full-day charter"
  serviceType: string;   // stored in bookings.service_type
};

export default function BookingForm({
  compact = false,
  context,
}: {
  compact?: boolean;
  context?: BookingContext;
}) {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [serviceType, setServiceType] = useState(context?.serviceType ?? "transfer");
  const [passengers, setPassengers] = useState("1");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tripId, setTripId] = useState<string | null>(null);

  // Prefill from ?pickup=&dropoff=&date=&time= when routed from the Hero quick-quote bar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const pk = p.get("pickup");
    const dr = p.get("dropoff");
    const dt = p.get("date");
    const tm = p.get("time");
    if (pk) setPickup(pk);
    if (dr) setDropoff(dr);
    if (dt) setDate(dt);
    if (tm) setTime(tm);
  }, []);

  async function getQuote() {
    if (!pickup || !dropoff) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup, dropoff, serviceType, date }),
      });
      const data = await res.json();
      if (data?.rateType === "phone") {
        setStep("phone");
      } else if (!res.ok || !data.rate) {
        setError(data.error || "Could not calculate a rate. Call us to book.");
      } else {
        setQuote({
          rate: data.rate,
          note: data.note,
          rateType: data.rateType,
          pickupLat: data.pickupLat,
          pickupLng: data.pickupLng,
          dropoffLat: data.dropoffLat,
          dropoffLng: data.dropoffLng,
          distanceMiles: data.distanceMiles,
        });
        setStep("quote");
      }
    } catch {
      setError("Network error. Please try again or call us.");
    }
    setLoading(false);
  }

  async function confirmBooking() {
    if (!name || !phone) {
      setError("Name and phone are required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          pickup,
          dropoff,
          date,
          time,
          serviceType,
          passengers,
          rate: quote?.rate ?? null,
          rateType: quote?.rateType ?? null,
          pickupLat: quote?.pickupLat ?? null,
          pickupLng: quote?.pickupLng ?? null,
          dropoffLat: quote?.dropoffLat ?? null,
          dropoffLng: quote?.dropoffLng ?? null,
          distanceMiles: quote?.distanceMiles ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save your booking. Please call to book.");
      } else {
        setTripId(data.tripId ?? null);
        setStep("confirmed");
      }
    } catch {
      setError("Network error. Please call us to book.");
    }
    setSubmitting(false);
  }

  function resetAll() {
    setStep("form");
    setQuote(null);
    setPickup(""); setDropoff(""); setDate(""); setTime("");
    setName(""); setPhone(""); setEmail("");
    setError(null);
  }

  const input =
    "w-full px-4 py-3 bg-navy/60 border border-gold/25 rounded-lg text-cream text-sm placeholder:text-cream/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40 transition";

  return (
    <div
      id="book"
      className={`relative bg-navy/70 border border-gold/30 rounded-2xl ${
        compact ? "p-6" : "p-6 sm:p-8"
      } backdrop-blur-2xl shadow-brass`}
    >
      {/* Decorative corner flourishes */}
      <FleurIcon className="absolute top-3 left-3 w-3 h-4 text-gold/50" />
      <FleurIcon className="absolute top-3 right-3 w-3 h-4 text-gold/50" />

      <div className="text-center mb-1">
        <span className="text-[10px] tracking-[0.3em] uppercase text-gold">Reservations</span>
      </div>
      <h2 className="text-cream font-display text-2xl font-semibold text-center mb-1">
        Book your ride
      </h2>
      <p className="text-cream/60 text-xs text-center mb-6">
        Flat rate · gratuity included · no surge
      </p>

      {(step === "form" || step === "quote") && (
        <>
          {context ? (
            <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-gold/45 bg-gold/[0.08]">
              <div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-gold">
                  Booking
                </div>
                <div className="text-cream text-sm font-semibold mt-0.5">
                  {context.label}
                </div>
              </div>
              {context.subtitle && (
                <span className="text-cream/70 text-xs text-right">
                  {context.subtitle}
                </span>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(
                [
                  ["transfer", "Transfer"],
                  ["hourly", "Hourly"],
                  ["airport", "Airport"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setServiceType(val)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    serviceType === val
                      ? "bg-gold/15 border-gold text-cream"
                      : "bg-transparent border-gold/20 text-cream/60 hover:border-gold/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3 mb-4">
            <AddressAutocomplete
              value={pickup}
              onChange={setPickup}
              placeholder="Pickup address"
              className={input + " pl-7"}
              icon={
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold text-xs z-10">
                  ●
                </span>
              }
            />
            <AddressAutocomplete
              value={dropoff}
              onChange={setDropoff}
              placeholder="Dropoff address"
              className={input + " pl-7"}
              icon={
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold text-xs z-10">
                  ◉
                </span>
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={input + " [color-scheme:dark]"}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={input + " [color-scheme:dark]"}
            />
            <select
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className={input + " appearance-none"}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n} className="bg-navy">
                  {n} pax
                </option>
              ))}
            </select>
          </div>

          {quote && step === "quote" && (
            <div className="bg-gold/[0.08] border border-gold/40 rounded-xl p-4 mb-4">
              <p className="text-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-1">
                Your flat rate
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-cream font-display text-4xl font-semibold">${quote.rate}</span>
                <span className="text-cream/70 text-sm">all-inclusive</span>
              </div>
              <p className="text-cream/60 text-xs mt-1">{quote.note}</p>
            </div>
          )}

          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

          {step === "form" ? (
            <button
              onClick={getQuote}
              disabled={!pickup || !dropoff || loading}
              className="w-full py-3.5 bg-gold text-navy rounded-lg text-base font-bold tracking-wide hover:bg-cream hover:shadow-brass transition-all disabled:opacity-50 disabled:hover:shadow-none"
            >
              {loading ? "Calculating…" : "Get my flat rate"}
            </button>
          ) : (
            <button
              onClick={() => setStep("details")}
              className="w-full py-3.5 bg-gold text-navy rounded-lg text-base font-bold tracking-wide hover:bg-cream transition-all"
            >
              Book this ride
            </button>
          )}
        </>
      )}

      {step === "details" && (
        <div className="space-y-3">
          <div className="bg-gold/[0.08] border border-gold/40 rounded-xl p-3 mb-2">
            <p className="text-cream text-sm">
              <span className="font-bold text-gold">${quote?.rate}</span>{" "}
              <span className="text-cream/70">flat rate, gratuity included</span>
            </p>
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={input} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" type="tel" className={input} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" className={input} />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            onClick={confirmBooking}
            disabled={submitting}
            className="w-full py-3.5 bg-gold text-navy rounded-lg text-base font-bold tracking-wide hover:bg-cream transition-all disabled:opacity-50"
          >
            {submitting ? "Booking…" : "Confirm booking"}
          </button>
          <button onClick={() => setStep("quote")} className="w-full py-2 text-cream/60 text-sm hover:text-gold transition-colors">
            Back
          </button>
        </div>
      )}

      {step === "phone" && (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full border border-gold/60 flex items-center justify-center mx-auto mb-4">
            <FleurIcon className="w-6 h-8 text-gold" />
          </div>
          <h3 className="text-cream font-display text-2xl font-semibold mb-2">
            This one is a phone call.
          </h3>
          <p className="text-cream/70 text-sm mb-5 max-w-sm mx-auto leading-relaxed">
            For trips this long, dispatch handles the quote personally so we can plan the driver, timing, and any overnight arrangement for your route.
          </p>
          <a
            href="tel:+15044790454"
            className="inline-block bg-gold text-navy px-6 py-3 rounded-md text-base font-bold tracking-wide hover:bg-cream transition-colors"
          >
            Call (504) 479-0454
          </a>
          <p className="text-cream/50 text-xs mt-4">
            24 hours, 7 days, every day of the year.
          </p>
          <button
            onClick={() => setStep("form")}
            className="mt-4 text-gold/70 text-xs hover:text-gold"
          >
            ← Back to form
          </button>
        </div>
      )}

      {step === "confirmed" && (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full border border-gold/60 flex items-center justify-center mx-auto mb-4">
            <FleurIcon className="w-6 h-8 text-gold" />
          </div>
          <h3 className="text-cream font-display text-2xl font-semibold mb-2">Merci. Booking received.</h3>
          {tripId && (
            <p className="text-gold text-xs tracking-[0.25em] uppercase mb-3">
              Reference {tripId}
            </p>
          )}
          <p className="text-cream/70 text-sm mb-4">
            We&apos;ll text {phone} shortly to confirm your ride.
            <br />
            Flat rate ${quote?.rate}, gratuity included.
          </p>
          <button onClick={resetAll} className="text-gold text-sm font-semibold hover:underline">
            Book another ride
          </button>
        </div>
      )}

      <p className="text-center text-cream/50 text-xs mt-5">
        Or call{" "}
        <a href="tel:+15044790454" className="text-gold font-semibold hover:underline">
          (504) 479-0454
        </a>{" "}
        · 24/7 dispatch
      </p>
    </div>
  );
}
