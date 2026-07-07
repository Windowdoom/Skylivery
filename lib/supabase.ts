import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

export type BookingInsert = {
  name: string;
  phone: string;
  email: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_date: string | null;
  pickup_time: string | null;
  service_type: string;
  passengers: number;
  quoted_rate: number | null;
  rate_type: string | null;
  status?: string;
};
