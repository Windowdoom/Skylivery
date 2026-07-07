"use client";
import { useMemo, useState, useTransition } from "react";
import { assignDriver, markCompleted, cancelBooking } from "@/app/admin/actions";

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
  completed_at: string | null;
};

export type Driver = {
  id: string;
  name: string;
  phone: string;
  gtb_permit_id: string;
  status: string;
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

function driverName(drivers: Driver[], id: string | null): string {
  if (!id) return "—";
  return drivers.find((d) => d.id === id)?.name ?? "unknown";
}

export default function AdminDashboard({
  bookings,
  drivers,
  monthly,
  volume,
}: {
  bookings: Booking[];
  drivers: Driver[];
  monthly: MonthlyRow[];
  volume: DriverVolumeRow[];
}) {
  const [pending, assigned, completed] = useMemo(() => {
    const p: Booking[] = [];
    const a: Booking[] = [];
    const c: Booking[] = [];
    for (const b of bookings) {
      if (b.status === "pending") p.push(b);
      else if (b.status === "assigned" || b.status === "in_progress") a.push(b);
      else if (b.status === "completed") c.push(b);
    }
    return [p, a, c];
  }, [bookings]);

  const thisMonth = monthly[0];

  return (
    <div className="min-h-screen bg-navy text-cream">
      {/* Top bar */}
      <header className="border-b border-gold/25 bg-dark/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="" className="h-8 w-8" />
            <div>
              <div className="text-cream font-display text-lg tracking-[0.14em]">
                Sky Livery Dispatch
              </div>
              <div className="text-gold text-[9px] tracking-[0.35em]">CONTROL ROOM</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export?scope=month"
              className="text-xs text-cream/80 border border-gold/30 rounded-md px-3 py-1.5 hover:border-gold hover:text-gold"
            >
              Export this month
            </a>
            <form action="/api/admin/logout" method="post">
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
              <PendingCard key={b.id} b={b} drivers={drivers} />
            ))
          )}
        </Column>

        <Column title="Assigned" tint="cream" count={assigned.length}>
          {assigned.length === 0 ? (
            <Empty>Nothing on the road.</Empty>
          ) : (
            assigned.map((b) => (
              <AssignedCard key={b.id} b={b} drivers={drivers} />
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
      <div className="mt-2 text-cream/60 text-xs">
        {fmtDate(b.trip_date)} · {fmtTime(b.trip_time)}
        {b.is_airport ? " · MSY" : ""}
        {b.service_type ? ` · ${b.service_type}` : ""}
      </div>
    </div>
  );
}

function PendingCard({ b, drivers }: { b: Booking; drivers: Driver[] }) {
  const [driverId, setDriverId] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    if (!driverId) return;
    start(async () => {
      await assignDriver(b.id, driverId);
    });
  }
  function decline() {
    if (!confirm("Cancel this booking?")) return;
    start(async () => {
      await cancelBooking(b.id);
    });
  }

  return (
    <div className="bg-navy/70 border border-gold/40 rounded-xl p-4">
      <BookingCore b={b} />
      <div className="mt-3 flex gap-2">
        <select
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          className="flex-1 bg-navy/60 border border-gold/25 rounded-md px-2 py-2 text-sm text-cream focus:border-gold focus:outline-none"
        >
          <option value="">Assign driver…</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id} className="bg-navy">
              {d.name}
            </option>
          ))}
        </select>
        <button
          onClick={submit}
          disabled={!driverId || pending}
          className="bg-gold text-navy px-3 rounded-md text-sm font-bold hover:bg-cream disabled:opacity-50"
        >
          {pending ? "…" : "Send"}
        </button>
      </div>
      <button
        onClick={decline}
        className="mt-2 w-full text-cream/50 hover:text-red-400 text-xs"
      >
        Cancel booking
      </button>
    </div>
  );
}

function AssignedCard({ b, drivers }: { b: Booking; drivers: Driver[] }) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [pending, start] = useTransition();
  const drv = drivers.find((d) => d.id === b.assigned_driver);

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
      </div>
      <div className="mt-3 flex gap-2">
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="flex-1 bg-navy/60 border border-gold/25 rounded-md px-2 py-2 text-sm text-cream focus:border-gold focus:outline-none"
        >
          <option value="card" className="bg-navy">Card</option>
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
    </div>
  );
}

function CompletedCard({ b, drivers }: { b: Booking; drivers: Driver[] }) {
  return (
    <div className="bg-navy/30 border border-cream/10 rounded-xl p-4 opacity-90">
      <BookingCore b={b} />
      <div className="mt-3 text-xs text-cream/60">
        Driver: {driverName(drivers, b.assigned_driver)} · Paid via{" "}
        {b.payment_method ?? "—"}
      </div>
    </div>
  );
}
