"use client";
import { useMemo, useState, useTransition } from "react";
import {
  assignDriver,
  markCompleted,
  cancelBooking,
  deleteBooking,
  clearTestBookings,
  markPaid,
  createBookingManually,
  createVehicle,
  retireVehicle,
  activateVehicle,
} from "@/app/admin/actions";

export type Booking = {
  id: string;
  trip_id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  pickup_address: string;
  dropoff_address: string;
  trip_date: string;
  trip_time: string;
  service_type: string | null;
  passengers: number | null;
  rate: number | null;
  is_airport: boolean | null;
  distance_miles: number | null;
  status: string;
  assigned_driver: string | null;
  payment_method: string | null;
  payment_intent: string | null;
  payment_link: string | null;
  paid: boolean | null;
  flight_number: string | null;
  assigned_at: string | null;
  completed_at: string | null;
};

export type Driver = {
  id: string;
  name: string;
  phone: string;
  gtb_permit_id: string;
  status: string;
  primary_vehicle: string | null;
  payout_percent: number | null;
};

export type Vehicle = {
  id: string;
  cpnc_number: string;
  make: string | null;
  model: string | null;
  color: string | null;
  year: number | null;
  plate: string | null;
  active: boolean;
};

export type MonthlyRow = {
  month: string;
  total_trips: number;
  gross_revenue: number | null;
  avg_fare: number | null;
  active_drivers: number;
};

export type DriverVolumeRow = {
  name: string;
  gtb_permit_id: string;
  status: string;
  trips_this_month: number;
  revenue_this_month: number | null;
};

function money(n: number | null | undefined): string {
  if (n === null || n === undefined) return "$0";
  return `$${Math.round(Number(n)).toLocaleString()}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtTime(t: string): string {
  const [h, m] = t.split(":");
  const hi = parseInt(h, 10);
  const am = hi < 12;
  const h12 = hi === 0 ? 12 : hi > 12 ? hi - 12 : hi;
  return `${h12}:${m} ${am ? "AM" : "PM"}`;
}

// Compact New Orleans-local timestamp for display on cards.
// Example: "Jul 7, 3:42 PM CT"
function fmtStamp(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }) + " CT";
}

function driverName(drivers: Driver[], id: string | null): string {
  if (!id) return "—";
  return drivers.find((d) => d.id === id)?.name ?? "unknown";
}

export default function AdminDashboard({
  bookings,
  drivers,
  vehicles,
  monthly,
  volume,
}: {
  bookings: Booking[];
  drivers: Driver[];
  vehicles: Vehicle[];
  monthly: MonthlyRow[];
  volume: DriverVolumeRow[];
}) {
  const [pending, assigned, completed, cancelled] = useMemo(() => {
    const p: Booking[] = [];
    const a: Booking[] = [];
    const c: Booking[] = [];
    const x: Booking[] = [];
    for (const b of bookings) {
      if (b.status === "pending") p.push(b);
      else if (b.status === "assigned" || b.status === "in_progress") a.push(b);
      else if (b.status === "completed") c.push(b);
      else if (b.status === "cancelled") x.push(b);
    }
    return [p, a, c, x];
  }, [bookings]);

  const [clearing, startClear] = useTransition();
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);
  function onClearTests() {
    if (
      !confirm(
        "Delete all bookings whose customer name looks like test data (test, demo, asdf, qwerty) or uses a throwaway phone? This cannot be undone."
      )
    )
      return;
    startClear(async () => {
      const res = await clearTestBookings();
      if (res.error) {
        alert(`Clear failed: ${res.error}`);
      } else {
        alert(`Removed ${res.deleted} test booking${res.deleted === 1 ? "" : "s"}.`);
      }
    });
  }

  // Filter to the actual current calendar month, not just the newest row.
  const currentMonthKey = new Date().toISOString().slice(0, 7); // "2026-07"
  const thisMonth = monthly.find((m) =>
    typeof m.month === "string" && m.month.startsWith(currentMonthKey)
  );

  return (
    <div className="min-h-screen bg-navy text-cream">
      {/* Top bar */}
      <header className="border-b border-gold/25 bg-dark/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo-emblem.png" alt="" className="h-8 w-8 object-contain" />
            <div>
              <div className="text-cream font-display text-lg tracking-[0.14em]">
                Sky Livery Dispatch
              </div>
              <div className="text-gold text-[9px] tracking-[0.35em]">CONTROL ROOM</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api/admin/export?scope=month"
              className="text-xs text-cream/80 border border-gold/30 rounded-md px-3 py-1.5 hover:border-gold hover:text-gold"
            >
              Month CSV
            </a>
            <a
              href="/api/admin/export?scope=quarter"
              className="text-xs text-cream/80 border border-gold/30 rounded-md px-3 py-1.5 hover:border-gold hover:text-gold"
            >
              Quarter CSV
            </a>
            <a
              href="/api/admin/export?scope=year"
              className="text-xs text-cream/80 border border-gold/30 rounded-md px-3 py-1.5 hover:border-gold hover:text-gold"
            >
              Year CSV
            </a>
            <button
              onClick={() => setShowNewBooking(true)}
              className="text-xs text-navy bg-gold rounded-md px-3 py-1.5 font-bold hover:bg-cream"
            >
              + New booking
            </button>
            <button
              onClick={() => setShowVehicles(true)}
              className="text-xs text-cream/80 border border-gold/30 rounded-md px-3 py-1.5 hover:border-gold hover:text-gold"
            >
              Vehicles ({vehicles.length})
            </button>
            <button
              onClick={onClearTests}
              disabled={clearing}
              className="text-xs text-red-300/80 border border-red-500/30 rounded-md px-3 py-1.5 hover:border-red-400 hover:text-red-300 disabled:opacity-50"
            >
              {clearing ? "Clearing…" : "Clear test bookings"}
            </button>
            <form action="/api/admin/logout" method="post" className="ml-3">
              <button className="text-xs text-cream/70 hover:text-gold">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      {/* Stats row */}
      <section className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Pending" value={pending.length.toString()} />
        <StatTile label="This month · trips" value={(thisMonth?.total_trips ?? 0).toString()} />
        <StatTile label="This month · revenue" value={money(thisMonth?.gross_revenue)} />
        <StatTile label="This month · avg fare" value={money(thisMonth?.avg_fare)} />
      </section>

      {/* Queues */}
      <section className="max-w-7xl mx-auto px-6 pb-12 grid lg:grid-cols-3 gap-6">
        <Column title="Pending" tint="gold" count={pending.length}>
          {pending.length === 0 ? (
            <Empty>No pending bookings.</Empty>
          ) : (
            pending.map((b) => (
              <PendingCard key={b.id} b={b} drivers={drivers} vehicles={vehicles} />
            ))
          )}
        </Column>

        <Column title="Assigned" tint="cream" count={assigned.length}>
          {assigned.length === 0 ? (
            <Empty>Nothing on the road.</Empty>
          ) : (
            assigned.map((b) => (
              <AssignedCard key={b.id} b={b} drivers={drivers} vehicles={vehicles} />
            ))
          )}
        </Column>

        <Column title="Completed" tint="muted" count={completed.length}>
          {completed.length === 0 ? (
            <Empty>No completed trips yet.</Empty>
          ) : (
            completed.slice(0, 20).map((b) => (
              <CompletedCard key={b.id} b={b} drivers={drivers} />
            ))
          )}
        </Column>
      </section>

      {/* Cancelled section (collapsible) */}
      {cancelled.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-6">
          <details className="bg-navy/40 border border-red-500/20 rounded-2xl">
            <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                <h2 className="text-cream font-display text-lg">Cancelled</h2>
                <span className="text-red-300/70 text-xs">{cancelled.length}</span>
              </div>
              <span className="text-cream/50 text-xs">click to expand</span>
            </summary>
            <div className="px-5 pb-5 pt-2 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cancelled.map((b) => (
                <CancelledCard key={b.id} b={b} />
              ))}
            </div>
          </details>
        </section>
      )}

      {/* Weekly driver payouts */}
      <PayoutPanel bookings={bookings} drivers={drivers} />

      {/* Driver leaderboard + monthly history */}
      <section className="max-w-7xl mx-auto px-6 pb-16 grid lg:grid-cols-2 gap-6">
        <div className="bg-navy/50 border border-gold/20 rounded-2xl p-5">
          <h2 className="text-cream font-display text-lg mb-4">Driver volume this month</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gold text-[10px] tracking-[0.2em] uppercase text-left">
                <th className="pb-2">Driver</th>
                <th className="pb-2">Permit</th>
                <th className="pb-2 text-right">Trips</th>
                <th className="pb-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {volume.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-cream/60 py-2">
                    No trips logged yet this month.
                  </td>
                </tr>
              ) : (
                volume.map((d) => (
                  <tr key={d.name} className="border-t border-gold/10">
                    <td className="py-2 text-cream">{d.name}</td>
                    <td className="py-2 text-cream/70">{d.gtb_permit_id}</td>
                    <td className="py-2 text-right text-cream">{d.trips_this_month}</td>
                    <td className="py-2 text-right text-gold">{money(d.revenue_this_month)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-navy/50 border border-gold/20 rounded-2xl p-5">
          <h2 className="text-cream font-display text-lg mb-4">Last 12 months</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gold text-[10px] tracking-[0.2em] uppercase text-left">
                <th className="pb-2">Month</th>
                <th className="pb-2 text-right">Trips</th>
                <th className="pb-2 text-right">Revenue</th>
                <th className="pb-2 text-right">Avg fare</th>
              </tr>
            </thead>
            <tbody>
              {monthly.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-cream/60 py-2">
                    No completed trips yet.
                  </td>
                </tr>
              ) : (
                monthly.map((m) => (
                  <tr key={m.month} className="border-t border-gold/10">
                    <td className="py-2 text-cream">
                      {new Date(m.month).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2 text-right text-cream">{m.total_trips}</td>
                    <td className="py-2 text-right text-gold">{money(m.gross_revenue)}</td>
                    <td className="py-2 text-right text-cream/80">{money(m.avg_fare)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showNewBooking && (
        <NewBookingModal
          drivers={drivers}
          onClose={() => setShowNewBooking(false)}
        />
      )}

      {showVehicles && (
        <VehiclesModal
          vehicles={vehicles}
          onClose={() => setShowVehicles(false)}
        />
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-navy/50 border border-gold/20 rounded-xl p-4">
      <div className="text-gold text-[10px] tracking-[0.25em] uppercase">{label}</div>
      <div className="mt-1 font-display text-3xl text-cream">{value}</div>
    </div>
  );
}

function Column({
  title,
  count,
  tint,
  children,
}: {
  title: string;
  count: number;
  tint: "gold" | "cream" | "muted";
  children: React.ReactNode;
}) {
  const dot =
    tint === "gold" ? "bg-gold" : tint === "cream" ? "bg-cream" : "bg-cream/40";
  return (
    <div className="bg-navy/40 border border-gold/15 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
        <h2 className="text-cream font-display text-lg">{title}</h2>
        <span className="text-gold text-xs">{count}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-cream/50 text-sm py-6 text-center">{children}</div>;
}

function BookingCore({ b }: { b: Booking }) {
  return (
    <div className="text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] tracking-[0.25em] uppercase text-gold">
          {b.trip_id}
        </span>
        <span className="text-gold font-semibold">{money(b.rate)}</span>
      </div>
      <div className="text-cream font-medium">{b.customer_name}</div>
      <a
        href={`tel:${b.customer_phone}`}
        className="text-cream/70 text-xs hover:text-gold"
      >
        {b.customer_phone}
      </a>
      <div className="mt-2 text-cream/80 text-xs leading-snug">
        <div>↑ {b.pickup_address}</div>
        <div>↓ {b.dropoff_address}</div>
      </div>
      {b.flight_number && (
        <div className="mt-2 inline-flex items-center gap-1.5 border border-gold/40 rounded-md px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase text-gold">
          ✈ Flight {b.flight_number}
        </div>
      )}
      <div className="mt-2 text-cream/60 text-xs">
        {fmtDate(b.trip_date)} · {fmtTime(b.trip_time)}
        {b.is_airport ? " · MSY" : ""}
        {b.service_type ? ` · ${b.service_type}` : ""}
      </div>
    </div>
  );
}

function PendingCard({
  b,
  drivers,
  vehicles,
}: {
  b: Booking;
  drivers: Driver[];
  vehicles: Vehicle[];
}) {
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [pending, start] = useTransition();

  function onPickDriver(id: string) {
    setDriverId(id);
    const drv = drivers.find((d) => d.id === id);
    if (drv?.primary_vehicle) setVehicleId(drv.primary_vehicle);
  }

  function submit() {
    if (!driverId) return;
    start(async () => {
      await assignDriver(b.id, driverId, vehicleId || null);
    });
  }
  function decline() {
    const paidNote = b.paid
      ? "\n\nThis booking is PAID. You will need to refund separately (use the 'Cancel & Refund' button, or refund manually in Square)."
      : "";
    if (!confirm(`Cancel this booking?${paidNote}`)) return;
    start(async () => {
      await cancelBooking(b.id);
    });
  }
  function declineAndRefund() {
    if (!b.paid) {
      alert("Booking is not marked paid, nothing to refund.");
      return;
    }
    if (
      !confirm(
        `Cancel ${b.trip_id} AND refund via Square? Policy: 2+ hrs out = full refund, under 2 hrs or no-show = no refund.`
      )
    )
      return;
    start(async () => {
      const res = await cancelBooking(b.id, { refund: true });
      if (!res.ok) {
        alert(`Cancel failed: ${res.error}`);
      } else if (res.error) {
        alert(res.error);
      } else if (res.refunded) {
        alert(`Refunded $${res.refundAmount} to the customer.`);
      } else {
        alert("Cancelled. No refund issued (policy = $0 or already refunded).");
      }
    });
  }

  return (
    <div className="bg-navy/70 border border-gold/40 rounded-xl p-4">
      <BookingCore b={b} />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <select
          value={driverId}
          onChange={(e) => onPickDriver(e.target.value)}
          className="bg-navy/60 border border-gold/25 rounded-md px-2 py-2 text-sm text-cream focus:border-gold focus:outline-none"
        >
          <option value="">Driver…</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id} className="bg-navy">
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="bg-navy/60 border border-gold/25 rounded-md px-2 py-2 text-sm text-cream focus:border-gold focus:outline-none"
        >
          <option value="">Vehicle…</option>
          {vehicles.filter((v) => v.active).map((v) => {
            const desc = [v.make, v.model].filter(Boolean).join(" ");
            return (
              <option key={v.id} value={v.id} className="bg-navy">
                {v.cpnc_number}{desc ? ` · ${desc}` : ""}
              </option>
            );
          })}
        </select>
      </div>
      <button
        onClick={submit}
        disabled={!driverId || pending}
        className="mt-2 w-full bg-gold text-navy px-3 py-2 rounded-md text-sm font-bold hover:bg-cream disabled:opacity-50"
      >
        {pending ? "Assigning…" : "Send"}
      </button>
      <TextCustomerButton b={b} />
      <div className="mt-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={decline}
            className="text-cream/50 hover:text-red-400"
          >
            Cancel booking
          </button>
          {b.paid && (
            <button
              onClick={declineAndRefund}
              className="text-yellow-300/80 hover:text-yellow-200"
            >
              Cancel &amp; Refund
            </button>
          )}
        </div>
        <button
          onClick={() => {
            if (!confirm(`Permanently delete ${b.trip_id}? Use only for test data.`)) return;
            start(async () => {
              const res = await deleteBooking(b.id);
              if (!res.ok) alert(`Delete failed: ${res.error}`);
            });
          }}
          className="text-cream/40 hover:text-red-400 text-[10px] uppercase tracking-[0.2em]"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function AssignedCard({
  b,
  drivers,
  vehicles,
}: {
  b: Booking;
  drivers: Driver[];
  vehicles: Vehicle[];
}) {
  const [paymentMethod, setPaymentMethod] = useState("square");
  const [pending, start] = useTransition();
  const drv = drivers.find((d) => d.id === b.assigned_driver);
  const veh = vehicles.find((v) => v.id === (b as unknown as { vehicle_id?: string }).vehicle_id);

  function complete() {
    start(async () => {
      await markCompleted(b.id, paymentMethod);
    });
  }

  return (
    <div className="bg-navy/50 border border-cream/25 rounded-xl p-4">
      <BookingCore b={b} />
      <div className="mt-3 text-xs text-cream/70">
        Driver: <span className="text-cream">{drv?.name ?? "—"}</span>
        {drv?.phone && <span className="text-cream/50"> · {drv.phone}</span>}
        {veh?.cpnc_number && (
          <span className="text-gold"> · {veh.cpnc_number}</span>
        )}
      </div>
      <div className="mt-1 text-[10px] tracking-[0.15em] uppercase text-gold/70">
        Assigned {fmtStamp(b.assigned_at)}
      </div>
      <div className="mt-3 flex gap-2">
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="flex-1 bg-navy/60 border border-gold/25 rounded-md px-2 py-2 text-sm text-cream focus:border-gold focus:outline-none"
        >
          <option value="square" className="bg-navy">Square (card)</option>
          <option value="cash" className="bg-navy">Cash</option>
          <option value="invoice" className="bg-navy">Invoice</option>
          <option value="third_party" className="bg-navy">Third party</option>
        </select>
        <button
          onClick={complete}
          disabled={pending}
          className="bg-cream text-navy px-3 rounded-md text-sm font-bold hover:bg-gold disabled:opacity-50"
        >
          {pending ? "…" : "Complete"}
        </button>
      </div>
      <TextCustomerButton b={b} />
    </div>
  );
}

function CompletedCard({ b, drivers }: { b: Booking; drivers: Driver[] }) {
  const [pending, start] = useTransition();
  function onDelete() {
    if (
      !confirm(
        `Permanently delete ${b.trip_id}? Only do this for test data — real trips should stay for tax records.`
      )
    )
      return;
    start(async () => {
      const res = await deleteBooking(b.id);
      if (!res.ok) alert(`Delete failed: ${res.error}`);
    });
  }
  function onMarkPaid() {
    start(async () => {
      await markPaid(b.id, true);
    });
  }
  const isPaid = b.paid === true;
  return (
    <div
      className={`bg-navy/30 border rounded-xl p-4 opacity-90 ${
        isPaid ? "border-cream/10" : "border-yellow-400/40"
      }`}
    >
      <BookingCore b={b} />
      <div className="mt-1 text-[10px] tracking-[0.15em] uppercase text-gold/60 space-x-3">
        <span>Assigned {fmtStamp(b.assigned_at)}</span>
        <span>Closed {fmtStamp(b.completed_at)}</span>
      </div>
      <div className="mt-2 text-xs text-cream/60 flex items-center justify-between">
        <span>
          Driver: {driverName(drivers, b.assigned_driver)} · Paid via{" "}
          {b.payment_method ?? "—"}{" "}
          <span
            className={
              isPaid
                ? "text-green-400 font-semibold ml-1"
                : "text-yellow-300 font-semibold ml-1"
            }
          >
            {isPaid ? "PAID" : "UNPAID"}
          </span>
        </span>
        <div className="flex items-center gap-2 ml-2">
          {!isPaid && (
            <button
              onClick={onMarkPaid}
              disabled={pending}
              className="text-green-300 hover:text-green-200 text-[10px] uppercase tracking-[0.2em]"
            >
              {pending ? "…" : "Mark paid"}
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={pending}
            className="text-cream/40 hover:text-red-400 text-[10px] uppercase tracking-[0.2em]"
            title="Delete (permanent)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function TextCustomerButton({ b }: { b: Booking }) {
  const phone = (b.customer_phone || "").replace(/[^\d+]/g, "");
  if (!phone) return null;
  const msg = (() => {
    const parts = [
      `Sky Livery: your ride is confirmed. Ref ${b.trip_id}. Fare $${b.rate}.`,
    ];
    if (b.payment_intent === "online" && b.payment_link) {
      parts.push(`Pay here: ${b.payment_link}`);
    } else if (b.payment_intent === "online") {
      parts.push(`We will send your Square link shortly.`);
    } else {
      parts.push(`Pay in the car on drop-off. Ref ${b.trip_id}.`);
    }
    parts.push(`Call (504) 339-6861 to change anything.`);
    return parts.join(" ");
  })();
  const href = `sms:${phone}?&body=${encodeURIComponent(msg)}`;
  return (
    <a
      href={href}
      className="mt-2 block text-center text-xs text-cream/70 border border-gold/30 rounded-md px-3 py-1.5 hover:border-gold hover:text-gold"
    >
      Text customer
    </a>
  );
}

function NewBookingModal({
  onClose,
  drivers,
}: {
  onClose: () => void;
  drivers: Driver[];
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [rate, setRate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [paymentIntent, setPaymentIntent] = useState("in-vehicle");
  const [serviceType, setServiceType] = useState("transfer");
  const [flightNumber, setFlightNumber] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  void drivers;

  function submit() {
    setErr(null);
    if (!name || !phone || !pickup || !dropoff || !date || !time || !rate) {
      setErr("Fill in every field except email.");
      return;
    }
    start(async () => {
      const res = await createBookingManually({
        name,
        phone,
        email: email || undefined,
        pickup,
        dropoff,
        date,
        time,
        rate: Math.round(Number(rate)) || 0,
        serviceType,
        passengers: Number(passengers) || 1,
        paymentIntent,
        flightNumber: flightNumber.trim() || undefined,
      });
      if (!res.ok) {
        setErr(res.error || "Could not save booking.");
        return;
      }
      onClose();
    });
  }

  const input =
    "w-full px-3 py-2 bg-navy/60 border border-gold/25 rounded-md text-cream text-sm placeholder:text-cream/40 focus:border-gold focus:outline-none";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-navy border border-gold/40 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-cream font-display text-xl">Manual booking</h2>
            <p className="text-gold text-[10px] tracking-[0.25em] uppercase">
              Entered by dispatch
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-cream/60 hover:text-gold text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className={input}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            type="tel"
            className={input}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            type="email"
            className={input + " col-span-2"}
          />
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Pickup address"
            className={input + " col-span-2"}
          />
          <input
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            placeholder="Dropoff address"
            className={input + " col-span-2"}
          />
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className={input}
          />
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            type="time"
            className={input}
          />
          <input
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="Fare in dollars"
            type="number"
            className={input}
          />
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
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className={input}
          >
            <option value="transfer" className="bg-navy">Transfer</option>
            <option value="airport" className="bg-navy">Airport (MSY)</option>
            <option value="hourly" className="bg-navy">Hourly</option>
            <option value="wedding" className="bg-navy">Wedding</option>
            <option value="corporate" className="bg-navy">Corporate</option>
            <option value="event" className="bg-navy">Event</option>
          </select>
          <select
            value={paymentIntent}
            onChange={(e) => setPaymentIntent(e.target.value)}
            className={input}
          >
            <option value="in-vehicle" className="bg-navy">Pay in the car</option>
            <option value="online" className="bg-navy">Pay before (Square link)</option>
            <option value="invoice" className="bg-navy">Invoice (corporate only)</option>
          </select>
          <input
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
            placeholder="Flight # (airport pickups, optional)"
            className={input + " col-span-2"}
            maxLength={12}
          />
        </div>

        {err && <p className="text-red-400 text-xs mt-3">{err}</p>}

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={submit}
            disabled={pending}
            className="bg-gold text-navy px-5 py-2.5 rounded-md text-sm font-bold hover:bg-cream disabled:opacity-50"
          >
            {pending ? "Saving…" : "Create booking"}
          </button>
          <button
            onClick={onClose}
            className="text-cream/60 hover:text-gold text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const MAKE_MODEL_PRESETS = [
  { make: "Ford", model: "Expedition" },
  { make: "Ford", model: "Expedition Max" },
  { make: "Chevrolet", model: "Suburban" },
  { make: "Chevrolet", model: "Tahoe" },
  { make: "GMC", model: "Yukon" },
  { make: "GMC", model: "Yukon XL" },
  { make: "Cadillac", model: "Escalade" },
  { make: "Cadillac", model: "Escalade ESV" },
  { make: "Lincoln", model: "Navigator" },
  { make: "Mercedes-Benz", model: "Sprinter" },
];

function VehiclesModal({
  vehicles,
  onClose,
}: {
  vehicles: Vehicle[];
  onClose: () => void;
}) {
  const [cpnc, setCpnc] = useState("");
  const [preset, setPreset] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("Onyx Black");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onPresetPick(v: string) {
    setPreset(v);
    if (!v) return;
    const [m, ...rest] = v.split("|");
    setMake(m);
    setModel(rest.join("|"));
  }

  function submit() {
    setErr(null);
    if (!cpnc) {
      setErr("CPNC number is required.");
      return;
    }
    start(async () => {
      const res = await createVehicle({
        cpncNumber: cpnc,
        make: make || undefined,
        model: model || undefined,
        color: color || undefined,
        year: year ? Number(year) : undefined,
        plate: plate || undefined,
      });
      if (!res.ok) {
        setErr(res.error || "Could not add vehicle.");
        return;
      }
      setCpnc("");
      setPreset("");
      setMake("");
      setModel("");
      setColor("Onyx Black");
      setYear("");
      setPlate("");
    });
  }

  const input =
    "w-full px-3 py-2 bg-navy/60 border border-gold/25 rounded-md text-cream text-sm placeholder:text-cream/40 focus:border-gold focus:outline-none";

  const active = vehicles.filter((v) => v.active);
  const retired = vehicles.filter((v) => !v.active);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-navy border border-gold/40 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-cream font-display text-xl">Fleet</h2>
            <p className="text-gold text-[10px] tracking-[0.25em] uppercase">
              Vehicles &amp; CPNC plates
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-cream/60 hover:text-gold text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="bg-navy/40 border border-gold/20 rounded-xl p-4 mb-6">
          <p className="text-gold text-[10px] tracking-[0.25em] uppercase mb-3">
            Add a vehicle
          </p>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={cpnc}
              onChange={(e) => setCpnc(e.target.value.toUpperCase())}
              placeholder="CPNC (e.g. LM 415)"
              className={input}
              maxLength={16}
            />
            <select
              value={preset}
              onChange={(e) => onPresetPick(e.target.value)}
              className={input + " appearance-none"}
            >
              <option value="" className="bg-navy">
                Pick make/model or type below
              </option>
              {MAKE_MODEL_PRESETS.map((p) => (
                <option
                  key={p.make + p.model}
                  value={`${p.make}|${p.model}`}
                  className="bg-navy"
                >
                  {p.make} {p.model}
                </option>
              ))}
            </select>
            <input
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="Make"
              className={input}
            />
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Model"
              className={input}
            />
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Color (e.g. Onyx Black)"
              className={input}
            />
            <input
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
              placeholder="Year (optional)"
              className={input}
              maxLength={4}
            />
            <input
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="License plate (optional)"
              className={input + " col-span-2"}
              maxLength={12}
            />
          </div>
          {err && <p className="text-red-400 text-xs mt-3">{err}</p>}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={submit}
              disabled={pending || !cpnc}
              className="bg-gold text-navy px-5 py-2 rounded-md text-sm font-bold hover:bg-cream disabled:opacity-50"
            >
              {pending ? "Adding…" : "Add vehicle"}
            </button>
          </div>
        </div>

        <p className="text-gold text-[10px] tracking-[0.25em] uppercase mb-2">
          Active fleet ({active.length})
        </p>
        <div className="space-y-2 mb-6">
          {active.length === 0 ? (
            <p className="text-cream/50 text-sm py-2">No active vehicles yet.</p>
          ) : (
            active.map((v) => <VehicleRow key={v.id} v={v} />)
          )}
        </div>

        {retired.length > 0 && (
          <>
            <p className="text-gold/60 text-[10px] tracking-[0.25em] uppercase mb-2">
              Retired ({retired.length})
            </p>
            <div className="space-y-2">
              {retired.map((v) => (
                <VehicleRow key={v.id} v={v} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function VehicleRow({ v }: { v: Vehicle }) {
  const [pending, start] = useTransition();
  const label = [v.color, v.year, v.make, v.model].filter(Boolean).join(" ");
  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${
        v.active ? "bg-navy/50 border-gold/20" : "bg-navy/20 border-cream/10 opacity-70"
      }`}
    >
      <div className="min-w-0">
        <div className="text-gold text-xs font-bold tracking-[0.15em]">
          {v.cpnc_number}
        </div>
        <div className="text-cream text-sm truncate">{label || "—"}</div>
        {v.plate && (
          <div className="text-cream/50 text-[10px] uppercase tracking-[0.2em] mt-0.5">
            Plate {v.plate}
          </div>
        )}
      </div>
      <button
        onClick={() => {
          start(async () => {
            if (v.active) await retireVehicle(v.id);
            else await activateVehicle(v.id);
          });
        }}
        disabled={pending}
        className={`text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded ${
          v.active
            ? "text-cream/60 hover:text-red-300 border border-cream/20"
            : "text-green-300 hover:text-green-200 border border-green-500/30"
        }`}
      >
        {pending ? "…" : v.active ? "Retire" : "Reactivate"}
      </button>
    </div>
  );
}

function CancelledCard({ b }: { b: Booking }) {
  const [pending, start] = useTransition();
  function onDelete() {
    if (!confirm(`Permanently delete ${b.trip_id}?`)) return;
    start(async () => {
      const res = await deleteBooking(b.id);
      if (!res.ok) alert(`Delete failed: ${res.error}`);
    });
  }
  return (
    <div className="bg-navy/30 border border-red-500/15 rounded-xl p-4 opacity-75">
      <BookingCore b={b} />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-red-300/70 text-[10px] uppercase tracking-[0.2em]">
          Cancelled
        </span>
        <button
          onClick={onDelete}
          disabled={pending}
          className="text-cream/40 hover:text-red-400 text-[10px] uppercase tracking-[0.2em]"
        >
          {pending ? "…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

function getWeekRange(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { start, end, label: `${fmt(start)} – ${fmt(end)}` };
}

type PayoutLine = {
  driverId: string;
  name: string;
  phone: string;
  trips: number;
  gross: number;
  percent: number;
  payout: number;
};

function PayoutPanel({
  bookings,
  drivers,
}: {
  bookings: Booking[];
  drivers: Driver[];
}) {
  const { label, start, end } = useMemo(() => getWeekRange(), []);

  const lines = useMemo(() => {
    const map = new Map<string, { trips: number; gross: number }>();
    for (const b of bookings) {
      if (b.status !== "completed" || !b.assigned_driver || !b.completed_at)
        continue;
      const completedAt = new Date(b.completed_at);
      if (completedAt < start || completedAt > end) continue;
      const existing = map.get(b.assigned_driver) ?? { trips: 0, gross: 0 };
      existing.trips += 1;
      existing.gross += b.rate ?? 0;
      map.set(b.assigned_driver, existing);
    }
    const result: PayoutLine[] = [];
    for (const [driverId, { trips, gross }] of map) {
      const drv = drivers.find((d) => d.id === driverId);
      const percent = drv?.payout_percent ?? 92;
      result.push({
        driverId,
        name: drv?.name ?? "Unknown",
        phone: drv?.phone ?? "",
        trips,
        gross,
        percent,
        payout: Math.round(gross * (percent / 100) * 100) / 100,
      });
    }
    result.sort((a, b) => b.gross - a.gross);
    return result;
  }, [bookings, drivers, start, end]);

  const totalPayout = lines.reduce((s, l) => s + l.payout, 0);
  const totalGross = lines.reduce((s, l) => s + l.gross, 0);

  return (
    <section className="max-w-7xl mx-auto px-6 pb-8">
      <div className="bg-navy/50 border border-gold/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-cream font-display text-lg">
              Weekly driver payouts
            </h2>
            <p className="text-gold text-[10px] tracking-[0.2em] uppercase mt-0.5">
              {label}
            </p>
          </div>
          <div className="text-right">
            <div className="text-gold text-[10px] tracking-[0.2em] uppercase">
              Total Zelle
            </div>
            <div className="font-display text-2xl text-cream">
              {money(totalPayout)}
            </div>
          </div>
        </div>

        {lines.length === 0 ? (
          <div className="text-cream/50 text-sm py-4 text-center">
            No completed trips this week.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gold text-[10px] tracking-[0.2em] uppercase text-left">
                  <th className="pb-2">Driver</th>
                  <th className="pb-2">Zelle</th>
                  <th className="pb-2 text-right">Trips</th>
                  <th className="pb-2 text-right">Gross</th>
                  <th className="pb-2 text-right">Split</th>
                  <th className="pb-2 text-right">Payout</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.driverId} className="border-t border-gold/10">
                    <td className="py-3 text-cream font-medium">{l.name}</td>
                    <td className="py-3 text-cream/70">
                      {l.phone ? (
                        <a href={`tel:${l.phone}`} className="hover:text-gold">
                          {l.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 text-right text-cream">{l.trips}</td>
                    <td className="py-3 text-right text-cream/80">
                      {money(l.gross)}
                    </td>
                    <td className="py-3 text-right text-cream/60">
                      {l.percent}%
                    </td>
                    <td className="py-3 text-right text-gold font-semibold">
                      {money(l.payout)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-gold/30">
                  <td className="py-3 text-cream/60 font-medium" colSpan={2}>
                    Totals
                  </td>
                  <td className="py-3 text-right text-cream">
                    {lines.reduce((s, l) => s + l.trips, 0)}
                  </td>
                  <td className="py-3 text-right text-cream/80">
                    {money(totalGross)}
                  </td>
                  <td />
                  <td className="py-3 text-right text-gold font-bold">
                    {money(totalPayout)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
