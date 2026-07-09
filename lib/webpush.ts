// Web Push: notifications delivered straight to a driver's phone
// through their browser, no app install, no Twilio/carrier dependency.
// Each driver subscribes once from /driver-setup; their subscription
// is stored per-device in driver_push_subscriptions. Sending a push
// pushes to every device a driver has subscribed from.
//
// Reads env vars:
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY  (public — must use the NEXT_PUBLIC_
//                                  prefix since the browser needs this
//                                  same value client-side to subscribe;
//                                  a separate non-prefixed var here
//                                  would risk the two drifting apart)
//   VAPID_PRIVATE_KEY             (secret)
//   VAPID_SUBJECT                 mailto: or https: contact, optional

import webpush from "web-push";
import { supabaseAdmin } from "./supabaseAdmin";

let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const priv = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!pub || !priv) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT?.trim() || "mailto:skyliveryllc@gmail.com",
    pub,
    priv
  );
  configured = true;
  return true;
}

export function webPushConfigured(): boolean {
  return ensureConfigured();
}

export type PushPayload = {
  title: string;
  body: string;
  url: string; // where notificationclick should take the driver
  tag?: string; // replaces any existing notification with the same tag
};

// Sends to every device this driver has subscribed from. Prunes dead
// subscriptions (expired/unsubscribed — Web Push returns 404/410 for
// those) as it goes so the table doesn't accumulate stale rows.
export async function sendWebPushToDriver(
  driverId: string,
  payload: PushPayload
): Promise<{ sent: number }> {
  if (!ensureConfigured()) return { sent: 0 };
  const sb = supabaseAdmin();
  const { data: subs } = await sb
    .from("driver_push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("driver_id", driverId);
  if (!subs || subs.length === 0) return { sent: 0 };

  const body = JSON.stringify(payload);
  let sent = 0;
  await Promise.allSettled(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          body
        );
        sent += 1;
        // "Handed off to the push service" — not proof the phone
        // actually displayed it (that part we can never see), but the
        // best signal we have, and enough to tell "this driver's
        // channel is alive" from "we can't reach them at all."
        await sb
          .from("driver_push_subscriptions")
          .update({ last_success_at: new Date().toISOString() })
          .eq("id", s.id);
      } catch (e) {
        const status = (e as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          await sb.from("driver_push_subscriptions").delete().eq("id", s.id);
        } else {
          console.error("[webpush] send failed:", e);
        }
      }
    })
  );
  return { sent };
}
