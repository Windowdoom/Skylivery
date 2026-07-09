// Boarding-pass-style treatment for a trip reference number — used at
// the two highest-trust moments (booking confirmed, payment received)
// to make the reference feel like something worth keeping, not just a
// line of text. No hooks, so it's safe in both client and server trees.
export default function TicketRef({ tripId }: { tripId: string }) {
  return (
    <div className="relative inline-block brass-ring rounded-lg">
      <div className="relative bg-navy/70 border border-dashed border-gold/50 rounded-lg px-6 py-3">
        <div className="text-gold/70 text-[9px] tracking-[0.3em] uppercase mb-1">
          Reference
        </div>
        <div className="font-display text-xl sm:text-2xl text-cream font-semibold tracking-[0.15em]">
          {tripId}
        </div>
      </div>
    </div>
  );
}
