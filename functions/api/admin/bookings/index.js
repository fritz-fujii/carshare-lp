import { authorizedAdmin, json } from "../../../../lib/booking-api.js";

export async function onRequestGet({ request, env }) {
  if (!await authorizedAdmin(request, env)) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "temporarily_unavailable" }, 503);
  const rawOffset = new URL(request.url).searchParams.get("offset") ?? "0";
  if (!/^(0|[1-9]\d{0,15})$/.test(rawOffset) || !Number.isSafeInteger(Number(rawOffset)) || Number(rawOffset) > Number.MAX_SAFE_INTEGER - 100) return json({ error: "invalid_request" }, 400);
  const offset = Number(rawOffset);
  try {
    const result = await env.DB.prepare(`SELECT id,status,name,email,pickup_at,return_at,licence_country,licence_type,travel_plans,toll_roads,etc_requested,destinations,notes,invoice_url,invoice_reference,agreed_total_yen,etc_advance_yen,payment_reference,created_at,updated_at FROM bookings ORDER BY created_at DESC,id DESC LIMIT 101 OFFSET ?`).bind(offset).all();
    return json({ bookings: result.results.slice(0, 100), next_offset: result.results.length > 100 ? offset + 100 : null });
  } catch {
    return json({ error: "temporarily_unavailable" }, 503);
  }
}
