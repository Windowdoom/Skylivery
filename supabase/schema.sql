-- Sky Livery LLC — database schema
--
-- This file documents the tables the application code depends on. It is
-- reverse-engineered from actual usage across app/, lib/, and
-- components/ as of the commit that added this file — it is NOT an
-- executable migration history and has not been diffed column-for-
-- column against the live Supabase project. Treat it as a reference for
-- onboarding / disaster recovery, not a source of truth to blindly
-- re-run. If you stand up a fresh Supabase project from this file,
-- re-verify every `create table if not exists` against what's actually
-- live before trusting it.
--
-- Three views referenced by the code (trip_log, monthly_revenue,
-- driver_volume) were created directly against live data in an earlier
-- session and their exact join/aggregation logic isn't preserved here —
-- only the columns the application code reads from them. If you ever
-- need to recreate them, query the live Supabase project's
-- information_schema or pg_views first.

-- ============================================================
-- bookings — one row per trip, from first booking through refund
-- ============================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null unique,                 -- "SL-YYYY-XXXXX" customer-facing reference
  created_at timestamptz not null default now(),

  customer_name text not null,
  customer_phone text not null,
  customer_email text,

  pickup_address text not null,
  dropoff_address text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  dropoff_lat double precision,
  dropoff_lng double precision,

  trip_date date not null,
  trip_time time not null,
  service_type text,                             -- 'transfer' | 'corporate' | 'airport' | ...
  passengers int,
  is_airport boolean default false,
  distance_miles numeric,
  internal_zone text,                            -- pricing-engine internal only, never customer-facing
  flight_number text,

  rate numeric,                                  -- 0 for corporate "call to quote" trips until quoted
  payment_intent text,                            -- 'online' | 'in-vehicle' | 'invoice'
  payment_method text,                            -- set on completion: 'square' | 'cash' | 'invoice' | 'third_party'
  payment_link text,                              -- Square Checkout URL or Invoice public URL
  payment_link_id text,
  paid boolean not null default false,
  payment_captured_at timestamptz,
  card_last4 text,                                -- last 4 digits from Square's payment.card_details, if paid by card
  reminder_sent boolean not null default false,   -- day-before SMS reminder, sent at most once

  status text not null default 'pending',         -- 'pending' | 'assigned' | 'completed' | 'cancelled'
  assigned_driver uuid references public.drivers(id),
  vehicle_id uuid references public.vehicles(id),
  assigned_at timestamptz,
  completed_at timestamptz,

  dispatched_by text,                             -- dispatcher name, "Corporate portal", or a booking channel label
  assigned_by text                                -- dispatcher name, "<Driver> (self-claim)", or "<Driver> (SMS accept)"
);

create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_trip_date_idx on public.bookings(trip_date);
create index if not exists bookings_trip_id_idx on public.bookings(trip_id);

-- ============================================================
-- drivers
-- ============================================================
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  gtb_permit_id text,
  status text,                                    -- legacy/unused by current code; active flag below is authoritative
  active boolean not null default true,
  primary_vehicle uuid references public.vehicles(id),
  payout_percent numeric,                         -- e.g. 92 for a 92% driver payout split (whole number, not 0.92 — PayoutPanel in AdminDashboard.tsx divides by 100 itself); null defaults to 92
  pin_failures int not null default 0,            -- failed last-4-of-phone attempts (ntfy claim, push setup)
  pin_locked_until timestamptz                    -- set after too many failures; see lib/driverPin.ts
);

-- ============================================================
-- vehicles — the fleet
-- ============================================================
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  cpnc_number text not null unique,               -- "LM 415" etc — CPNC permit number, the public vehicle ID
  make text,
  model text,
  color text,
  year int,
  plate text,
  active boolean not null default true            -- retired vehicles keep their row (and CPNC) but active=false
);

-- ============================================================
-- dispatchers — numeric-code login for owner + Dispatch 1/2/3
-- ============================================================
create table if not exists public.dispatchers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  role text not null default 'dispatcher',        -- 'owner' | 'dispatcher'
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- sms_offers — tracks the "text every driver, first Y wins" broadcast
-- ============================================================
create table if not exists public.sms_offers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  trip_id text not null,
  phone text not null,
  sent_at timestamptz not null default now(),
  response text,                                  -- null (no reply yet) | 'Y' | 'N' | 'expired' (trip taken by someone else)
  responded_at timestamptz
);

create index if not exists sms_offers_driver_idx on public.sms_offers(driver_id, response);
create index if not exists sms_offers_booking_idx on public.sms_offers(booking_id);

-- ============================================================
-- driver_push_subscriptions — web push endpoints, one row per device
-- a driver has enabled trip alerts on (via /driver-setup). A driver
-- switching phones just adds a new row; dead ones are pruned
-- automatically the first time a push to them fails (404/410).
-- ============================================================
create table if not exists public.driver_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  last_success_at timestamptz              -- last time a push was successfully handed to this endpoint
);

create index if not exists driver_push_subs_driver_idx on public.driver_push_subscriptions(driver_id);
grant all on public.driver_push_subscriptions to service_role;

-- ============================================================
-- Views (documented, not defined — see note at top of file)
-- ============================================================
--
-- trip_log — one row per completed trip, used for the CSV export at
-- /api/admin/export and cascaded from on delete. Columns the code reads:
--   trip_id, trip_date, trip_time, driver_name, driver_gtb_permit,
--   pickup_address, dropoff_address, distance_miles, fare_charges,
--   extra_charges, total_charges, payment_method, cpnc_number,
--   company_name, booking_id
--
-- monthly_revenue — one row per calendar month, used on the admin
-- dashboard stat tiles. Columns the code reads:
--   month, total_trips, gross_revenue, avg_fare
--
-- driver_volume — one row per active driver, current-month leaderboard.
-- Columns the code reads:
--   name, gtb_permit_id, status, trips_this_month, revenue_this_month

-- ============================================================
-- Grants — service-role (used by supabaseAdmin()) needs full access;
-- RLS policies for anon/authenticated roles are not captured here.
-- ============================================================
grant all on public.bookings to service_role;
grant all on public.drivers to service_role;
grant all on public.vehicles to service_role;
grant all on public.dispatchers to service_role;
grant all on public.sms_offers to service_role;
