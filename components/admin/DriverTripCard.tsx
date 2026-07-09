import { mapsTripUrl } from "@/lib/maps";
import { completeToken } from "@/lib/complete";
import CompleteForm from "./CompleteForm";

// Full trip details for a driver's currently assigned trip: customer
// contact, tap-to-navigate pickup/dropoff, the Square pay link, a
// "text customer" deep link into the driver's own Messages app, and
// the mark-complete flow. Used by both the trip-specific page (reached
// via a push notification) and the persistent "my current trip" home
// page (the fallback for when a push never showed).
export default function DriverTripCard({
  booking,
}: {
  booking: {
    trip_id: string;
    customer_name: string;
    customer_phone: string;
    pickup_address: string;
    dropoff_address: string;
    trip_date: string;
    trip_time: string;
    rate: number | null;
    paid: boolean | null;
    payment_method: string | null;
    payment_link: string | null;
    flight_number: string | null;
  };
}) {
  const smsBody = `Hi ${booking.customer_name.split(" ")[0]}, this is your Sky Livery driver. On the way.`;
  const textCustomerHref = `sms:${booking.customer_phone.replace(/[^\d+]/g, "")}?&body=${encodeURIComponent(smsBody)}`;

  return (
    <div className="bg-navy/70 border border-gold/40 rounded-2xl p-5 text-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.25em] uppercase text-gold">{booking.trip_id}</span>
        <span className="text-gold font-semibold">${booking.rate ?? "?"}</span>
      </div>

      <div>
        <div className="text-cream font-medium">{booking.customer_name}</div>
        <a href={`tel:${booking.customer_phone}`} className="text-cream/70 text-xs hover:text-gold">
          {booking.customer_phone}
        </a>
      </div>

      <a
        href={mapsTripUrl(booking.pickup_address, booking.dropoff_address)}
        target="_blank"
        className="block bg-navy/60 border border-gold/25 rounded-md px-3 py-2.5 hover:border-gold"
      >
        <div className="text-[9px] tracking-[0.2em] uppercase text-gold/70 mb-1.5">
          Tap to navigate full trip
        </div>
        <div className="text-cream text-xs">↑ {booking.pickup_address}</div>
        <div className="text-cream text-xs mt-0.5">↓ {booking.dropoff_address}</div>
      </a>

      <div className="text-cream/60 text-xs">
        {booking.trip_date} · {booking.trip_time}
        {booking.flight_number ? ` · ✈ ${booking.flight_number}` : ""}
      </div>

      {!booking.paid && booking.payment_link && (
        <a
          href={booking.payment_link}
          target="_blank"
          className="block text-center py-2.5 bg-navy border border-gold/50 text-gold rounded-lg font-semibold hover:bg-gold/10"
        >
          Tap to charge ${booking.rate ?? "?"}
        </a>
      )}
      {booking.paid && (
        <div className="text-emerald-300 text-xs bg-emerald-400/10 border border-emerald-400/30 rounded-md px-3 py-2">
          Paid via {booking.payment_method === "square" ? "Square" : booking.payment_method || "card"}. Nothing to collect.
        </div>
      )}

      <a
        href={textCustomerHref}
        className="block text-center py-2.5 border border-gold/30 text-cream/80 rounded-lg text-sm hover:border-gold hover:text-gold"
      >
        Text customer
      </a>

      <div className="pt-2 border-t border-gold/15">
        <p className="text-cream/60 text-[10px] tracking-[0.2em] uppercase mb-1">When the ride's done</p>
        <CompleteForm
          tripId={booking.trip_id}
          token={completeToken(booking.trip_id)}
          alreadyPaid={booking.paid === true}
          paidMethod={booking.payment_method}
          rate={booking.rate}
        />
      </div>
    </div>
  );
}
