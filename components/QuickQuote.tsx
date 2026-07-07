"use client";
import { useState } from "react";
import AddressAutocomplete from "./AddressAutocomplete";

export default function QuickQuote() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  function goToBook() {
    const params = new URLSearchParams();
    if (pickup) params.set("pickup", pickup);
    if (dropoff) params.set("dropoff", dropoff);
    if (date) params.set("date", date);
    if (time) params.set("time", time);
    const q = params.toString();
    window.location.href = q ? `/book?${q}` : "/book";
  }

  const cell =
    "flex-1 min-w-0 flex flex-col gap-1 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gold/20 last:border-none";
  const label = "text-[10px] tracking-[0.25em] uppercase text-gold/90";
  const field =
    "w-full bg-transparent text-cream text-sm placeholder:text-cream/40 focus:outline-none";

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-gold/35 bg-navy/70 backdrop-blur-xl shadow-brass overflow-hidden">
      <div className="flex flex-col sm:flex-row items-stretch">
        <div className={cell + " sm:flex-[2]"}>
          <span className={label}>Pickup</span>
          <AddressAutocomplete
            value={pickup}
            onChange={setPickup}
            placeholder="Address or airport"
            className={field}
          />
        </div>
        <div className={cell + " sm:flex-[2]"}>
          <span className={label}>Dropoff</span>
          <AddressAutocomplete
            value={dropoff}
            onChange={setDropoff}
            placeholder="Address or destination"
            className={field}
          />
        </div>
        <div className={cell + " sm:flex-[1]"}>
          <span className={label}>Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={field + " [color-scheme:dark]"}
          />
        </div>
        <div className={cell + " sm:flex-[1]"}>
          <span className={label}>Time</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={field + " [color-scheme:dark]"}
          />
        </div>

        <button
          onClick={goToBook}
          className="shrink-0 m-2 px-6 py-4 bg-gold text-navy rounded-xl font-bold tracking-wide hover:bg-cream hover:shadow-brass transition-all inline-flex items-center gap-2"
        >
          Get my rate
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
