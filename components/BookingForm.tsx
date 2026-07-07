"use client";
import { useState } from "react";

export default function BookingForm() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [serviceType, setServiceType] = useState("transfer");
  const [passengers, setPassengers] = useState("1");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [quote, setQuote] = useState<{ rate: number; note: string; rateType?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "quote" | "details" | "confirmed">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmBooking = async () => {
    if (!name || !phone) {
      setError("Name and phone are required");
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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save booking. Please call us.");
      } else {
        setStep("confirmed");
      }
    } catch {
      setError("Network error. Please call us to book.");
    }
    setSubmitting(false);
  };

  const getQuote = async () => {
    if (!pickup || !dropoff) return;
    setLoading(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup, dropoff, serviceType, date }),
      });
      const data = await res.json();
      if (data.rate) {
        setQuote({ rate: data.rate, note: data.note, rateType: data.rateType });
        setStep("quote");
      }
    } catch {
      // Fallback: show a "call for quote" message
      setQuote(null);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/[0.035] border border-silver/[0.12] rounded-2xl p-6 sm:p-7 backdrop-blur-2xl">
      <h2 className="text-white font-display text-xl sm:text-2xl font-semibold mb-1">
        Book your ride
      </h2>
      <p className="text-silver text-sm mb-5">Flat rate, gratuity included, no surge</p>

      {(step === "form" || step === "quote") && (
        <>
          {/* Service type */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {([
              ["transfer", "Transfer"],
              ["hourly", "Hourly"],
              ["airport", "Airport"],
            ] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setServiceType(val)}
                className={`py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  serviceType === val
                    ? "bg-white/[0.08] border-white/30 text-white"
                    : "bg-transparent border-silver/[0.1] text-silver hover:border-silver/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Address inputs */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs">●</span>
              <input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Pickup address"
                className="w-full pl-7 pr-4 py-3 bg-white/[0.04] border border-silver/[0.12] rounded-lg text-white text-sm placeholder:text-silver/50 focus:border-white/30 focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs">◉</span>
              <input
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Dropoff address"
                className="w-full pl-7 pr-4 py-3 bg-white/[0.04] border border-silver/[0.12] rounded-lg text-white text-sm placeholder:text-silver/50 focus:border-white/30 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Date, time, passengers */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="py-2.5 px-3 bg-white/[0.04] border border-silver/[0.12] rounded-lg text-white text-sm focus:outline-none [color-scheme:dark]"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="py-2.5 px-3 bg-white/[0.04] border border-silver/[0.12] rounded-lg text-white text-sm focus:outline-none [color-scheme:dark]"
            />
            <select
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="py-2.5 px-3 bg-white/[0.04] border border-silver/[0.12] rounded-lg text-white text-sm focus:outline-none appearance-none"
            >
              {[1,2,3,4,5,6].map(n => (
                <option key={n} value={n} className="bg-navy">{n} {n === 1 ? "passenger" : "passengers"}</option>
              ))}
            </select>
          </div>

          {/* Quote result */}
          {quote && step === "quote" && (
            <div className="bg-emerald-500/[0.07] border border-emerald-500/20 rounded-xl p-4 mb-4">
              <p className="text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">Your flat rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-3xl font-bold">${quote.rate}</span>
                <span className="text-silver text-sm">all-inclusive</span>
              </div>
              <p className="text-silver/60 text-xs mt-1">{quote.note}</p>
            </div>
          )}

          {step === "form" && (
            <button
              onClick={getQuote}
              disabled={!pickup || !dropoff || loading}
              className="w-full py-3.5 bg-white text-navy rounded-lg text-base font-bold hover:scale-[1.01] hover:shadow-lg hover:shadow-white/10 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? "Calculating..." : "Get my rate"}
            </button>
          )}

          {step === "quote" && (
            <button
              onClick={() => setStep("details")}
              className="w-full py-3.5 bg-white text-navy rounded-lg text-base font-bold hover:scale-[1.01] hover:shadow-lg hover:shadow-white/10 transition-all"
            >
              Book this ride
            </button>
          )}
        </>
      )}

      {/* Contact details step */}
      {step === "details" && (
        <div className="space-y-3">
          <div className="bg-emerald-500/[0.07] border border-emerald-500/20 rounded-xl p-3 mb-2">
            <p className="text-white text-sm"><span className="font-bold">${quote?.rate}</span> <span className="text-silver">flat rate, gratuity included</span></p>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full px-4 py-3 bg-white/[0.04] border border-silver/[0.12] rounded-lg text-white text-sm placeholder:text-silver/50 focus:border-white/30 focus:outline-none"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            type="tel"
            className="w-full px-4 py-3 bg-white/[0.04] border border-silver/[0.12] rounded-lg text-white text-sm placeholder:text-silver/50 focus:border-white/30 focus:outline-none"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            className="w-full px-4 py-3 bg-white/[0.04] border border-silver/[0.12] rounded-lg text-white text-sm placeholder:text-silver/50 focus:border-white/30 focus:outline-none"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            onClick={confirmBooking}
            disabled={submitting}
            className="w-full py-3.5 bg-white text-navy rounded-lg text-base font-bold hover:scale-[1.01] transition-transform disabled:opacity-50"
          >
            {submitting ? "Booking..." : "Confirm booking"}
          </button>
          <button onClick={() => setStep("quote")} className="w-full py-2 text-silver text-sm hover:text-white transition-colors">
            Back
          </button>
        </div>
      )}

      {step === "confirmed" && (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-400 text-2xl">✓</span>
          </div>
          <h3 className="text-white font-display text-xl font-semibold mb-2">Booking received</h3>
          <p className="text-silver text-sm mb-4">
            We&apos;ll text {phone} to confirm your ride shortly. Flat rate ${quote?.rate}, gratuity included.
          </p>
          <button
            onClick={() => {
              setStep("form");
              setQuote(null);
              setPickup(""); setDropoff(""); setName(""); setPhone(""); setEmail("");
            }}
            className="text-white text-sm font-semibold hover:underline"
          >
            Book another ride
          </button>
        </div>
      )}

      <p className="text-center text-silver/60 text-xs mt-4">
        Or call <a href="tel:5040000000" className="text-white font-semibold hover:underline">(504) 000-0000</a> | <a href="sms:5040000000" className="text-white font-semibold hover:underline">Text us</a>
      </p>
    </div>
  );
}
