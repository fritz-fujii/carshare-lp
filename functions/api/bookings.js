import { bookingsEnabled, hashRequest, japanDate, json, readJson, sameOrigin, textField, verifyTurnstile } from "../../lib/booking-api.js";

export async function onRequestPost({ request, env }) {
  if (!bookingsEnabled(env)) return json({ error: "bookings_unavailable" }, 503);
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const idempotencyKey = (request.headers.get("Idempotency-Key") || "").toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) return json({ error: "invalid_request" }, 400);
  let input, data;
  try {
    data = await readJson(request);
    const pickup = japanDate(data.pickup_at);
    const end = japanDate(data.return_at);
    if (end <= pickup || pickup <= Date.now()) throw new Error("invalid_request");
    input = {
      name: textField(data.name, 100, 2),
      email: textField(data.email, 254, 3),
      pickup_at: data.pickup_at,
      return_at: data.return_at,
      licence_country: textField(data.licence_country, 100, 1),
      licence_type: textField(data.licence_type, 120, 1),
      travel_plans: textField(data.travel_plans ?? "", 100),
      toll_roads: textField(data.toll_roads ?? "", 100),
      etc_requested: textField(data.etc_requested ?? "", 100),
      destinations: textField(data.destinations ?? "", 500),
      notes: textField(data.notes ?? "", 1000),
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw new Error("invalid_request");
  } catch {
    return json({ error: "invalid_request" }, 400);
  }
  const hash = await hashRequest(input);
  try {
    const existing = await env.DB.prepare("SELECT id, request_hash FROM bookings WHERE idempotency_key = ?").bind(idempotencyKey).first();
    if (existing) return existing.request_hash === hash ? json({ id: existing.id, status: "pending" }, 201) : json({ error: "idempotency_conflict" }, 409);
    if (!await verifyTurnstile(data.turnstile_token, env, request)) return json({ error: "verification_failed" }, 400);
  } catch {
    return json({ error: "temporarily_unavailable" }, 503);
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  try {
    await env.DB.prepare(`INSERT INTO bookings (id,idempotency_key,request_hash,status,name,email,pickup_at,return_at,licence_country,licence_type,travel_plans,toll_roads,etc_requested,destinations,notes,created_at,updated_at) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, idempotencyKey, hash, input.name, input.email, input.pickup_at, input.return_at, input.licence_country, input.licence_type, input.travel_plans, input.toll_roads, input.etc_requested, input.destinations, input.notes, now, now).run();
    return json({ id, status: "pending" }, 201);
  } catch {
    try {
      const existing = await env.DB.prepare("SELECT id, request_hash FROM bookings WHERE idempotency_key = ?").bind(idempotencyKey).first();
      if (existing) return existing.request_hash === hash ? json({ id: existing.id, status: "pending" }, 201) : json({ error: "idempotency_conflict" }, 409);
    } catch { /* Database failure: return a generic error. */ }
    return json({ error: "temporarily_unavailable" }, 503);
  }
}
