import { bookingsEnabled, json } from "../../lib/booking-api.js";

export function onRequestGet({ env }) {
  const enabled = bookingsEnabled(env);
  return json({ bookings_enabled: enabled, turnstile_site_key: enabled ? env.TURNSTILE_SITE_KEY : null });
}
