"use client";
import { useState } from "react";
import AddressAutocomplete from "./AddressAutocomplete";
import { FleurIcon } from "./Fleur";

type Step = "form" | "submitted";

export default function CorporateBookingForm() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactTitle, setContactTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [terms, setTerms] = useState("Net 30");

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [passenger, setPassenger] = useState("");
  const [notes, setNotes] = useState("");

  const [step, setStep] = useState<Step>("form");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tripId, setTripId] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (
      !companyName ||
      !contactName ||
      !phone ||
      !email ||
      !pickup ||
      !dropoff ||
      !date ||
      !time
    ) {
      setError("Please fill in every required field.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/corporate/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          contactName,
          contactTitle,
          phone,
          email,
          billingAddress,
          taxId,
          poNumber,
          costCenter,
          terms,
          pickup,
          dropoff,
          date,
          time,
          passengers: Number(passengers) || 1,
          passenger,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not submit. Please call dispatch.");
      } else {
        setTripId(data.tripId ?? null);
        setStep("submitted");
      }
    } catch {
      setError("Network error.");
    }
    setBusy(false);
  }

  const input =
    "w-full px-4 py-3 bg-navy/60 border border-gold/25 rounded-lg text-cream text-sm placeholder:text-cream/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40";
  const label =
    "text-gold text-[10px] font-semibold tracking-[0.25em] uppercase mb-1.5 block";

  if (step === "submitted") {
    return (
      <div className="bg-navy/70 border border-gold/40 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full border border-gold/60 flex items-center justify-center mx-auto mb-4">
          <FleurIcon className="w-6 h-8 text-gold" />
        </div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">
          Received
        </p>
        <h2 className="font-display text-2xl text-cream font-semibold mb-3">
          Thank you. Your account is being opened.
        </h2>
        {tripId && (
          <p className="text-gold text-xs tracking-[0.25em] uppercase mb-3">
            Reference {tripId}
          </p>
        )}
        <p className="text-cream/70 text-sm leading-relaxed mb-4">
          Dispatch will review your request and email the invoice for this ride
          shortly. Every future booking from your company rolls into the same
          monthly statement.
        </p>
        <p className="text-cream/50 text-xs">
          Questions? Call{" "}
          <a href="tel:+15043396861" className="text-gold hover:underline">
            (504) 339-6861
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="bg-navy/70 border border-gold/30 rounded-2xl p-6 sm:p-8 backdrop-blur-xl space-y-8">
      <div>
        <h2 className="font-display text-xl text-cream font-semibold mb-4 flex items-center gap-2">
          <FleurIcon className="w-3 h-4 text-gold" /> Company
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Company name *</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={input}
              placeholder="Acme LLC"
            />
          </div>
          <div>
            <label className={label}>Billing terms</label>
            <select
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className={input}
            >
              <option value="Due on receipt" className="bg-navy">
                Due on receipt
              </option>
              <option value="Net 15" className="bg-navy">
                Net 15
              </option>
              <option value="Net 30" className="bg-navy">
                Net 30
              </option>
            </select>
          </div>
          <div>
            <label className={label}>Contact name *</label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={input}
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className={label}>Contact title</label>
            <input
              value={contactTitle}
              onChange={(e) => setContactTitle(e.target.value)}
              className={input}
              placeholder="Executive Assistant"
            />
          </div>
          <div>
            <label className={label}>Phone *</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              className={input}
              placeholder="(504) 555-0100"
            />
          </div>
          <div>
            <label className={label}>Email *</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className={input}
              placeholder="accounts@acme.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Billing address</label>
            <input
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              className={input}
              placeholder="500 Poydras St, New Orleans, LA 70130"
            />
          </div>
          <div>
            <label className={label}>Tax ID / EIN (optional)</label>
            <input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className={input}
              placeholder="12-3456789"
            />
          </div>
          <div>
            <label className={label}>PO number (optional)</label>
            <input
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className={input}
              placeholder="PO-2026-042"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Cost center / department (optional)</label>
            <input
              value={costCenter}
              onChange={(e) => setCostCenter(e.target.value)}
              className={input}
              placeholder="Legal · Chicago"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl text-cream font-semibold mb-4 flex items-center gap-2">
          <FleurIcon className="w-3 h-4 text-gold" /> This ride
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={label}>Pickup address *</label>
            <AddressAutocomplete
              value={pickup}
              onChange={setPickup}
              placeholder="Hotel, office, or airport"
              className={input}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Dropoff address *</label>
            <AddressAutocomplete
              value={dropoff}
              onChange={setDropoff}
              placeholder="Destination address"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Date *</label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              className={input + " [color-scheme:dark]"}
            />
          </div>
          <div>
            <label className={label}>Pickup time *</label>
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              type="time"
              className={input + " [color-scheme:dark]"}
            />
          </div>
          <div>
            <label className={label}>Passengers</label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className={input}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n} className="bg-navy">
                  {n} pax
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Passenger name (if different)</label>
            <input
              value={passenger}
              onChange={(e) => setPassenger(e.target.value)}
              className={input}
              placeholder="Traveler's name"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Notes for dispatch (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={input + " min-h-[80px] resize-y"}
              placeholder="Flight number, meeting time, preferences…"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="pt-2">
        <button
          onClick={submit}
          disabled={busy}
          className="w-full py-3.5 bg-gold text-navy rounded-lg text-base font-bold tracking-wide hover:bg-cream hover:shadow-brass transition-all disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Submit corporate booking"}
        </button>
        <p className="text-center text-cream/50 text-[11px] mt-3">
          By submitting you agree to our{" "}
          <a href="/terms" className="text-gold hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-gold hover:underline">
            Privacy Policy
          </a>
          . An invoice for this ride will be emailed shortly via Square, with{" "}
          {terms.toLowerCase()} terms.
        </p>
      </div>
    </div>
  );
}
