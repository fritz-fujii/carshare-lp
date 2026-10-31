import { authorizedAdmin, json, readJson, sameOrigin, textField } from "../../../../lib/booking-api.js";

const fields = `id,status,name,email,pickup_at,return_at,licence_country,licence_type,travel_plans,toll_roads,etc_requested,destinations,notes,invoice_url,invoice_reference,agreed_total_yen,etc_advance_yen,payment_reference,created_at,updated_at`;

function money(value, min) {
  if (!Number.isSafeInteger(value) || value < min || value > 10000000) throw new Error("invalid_request");
  return value;
}

function squareUrl(value) {
  if (value === undefined || value === null || value === "") return null;
  const text = textField(value, 2048, 1);
  const url = new URL(text);
  if (url.protocol !== "https:" || url.hostname !== "squareup.com" || url.username || url.password || url.port || !url.pathname.startsWith("/pay-invoice/")) throw new Error("invalid_request");
  return url.toString();
}

export async function onRequestPost({ request, env, params }) {
  if (!await authorizedAdmin(request, env)) return json({ error: "unauthorized" }, 401);
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (!env.DB) return json({ error: "temporarily_unavailable" }, 503);
  if (typeof params.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.id)) return json({ error: "not_found" }, 404);
  let body, query, values;
  const now = new Date().toISOString();
  try {
    body = await readJson(request);
    if (body.action === "approve") {
      const total = money(body.agreed_total_yen, 1);
      const etc = money(body.etc_advance_yen, 0);
      if (etc > total) throw new Error("invalid_request");
      // A single SQLite statement checks overlaps and holds the interval atomically.
      // A hold is not released automatically: the operator must first deal with the invoice.
      query = `UPDATE bookings SET status='approved', agreed_total_yen=?, etc_advance_yen=?, updated_at=?
        WHERE id=? AND status='pending' AND pickup_at > strftime('%Y-%m-%dT%H:%M','now','+9 hours') AND NOT EXISTS (
          SELECT 1 FROM bookings other WHERE other.id <> bookings.id
          AND other.status IN ('approved','awaiting_payment','confirmed')
          AND other.pickup_at < bookings.return_at AND other.return_at > bookings.pickup_at
        )`;
      values = [total, etc, now, params.id];
    } else if (body.action === "invoice_sent") {
      const reference = textField(body.invoice_reference, 120, 1);
      const url = squareUrl(body.invoice_url);
      query = "UPDATE bookings SET status='awaiting_payment', invoice_reference=?, invoice_url=?, updated_at=? WHERE id=? AND status='approved'";
      values = [reference, url, now, params.id];
    } else if (body.action === "confirm") {
      const reference = textField(body.payment_reference, 120, 1);
      const verifiedAmount = money(body.verified_amount_yen, 1);
      if (body.verified_currency !== "JPY") throw new Error("invalid_request");
      query = "UPDATE bookings SET status='confirmed', payment_reference=?, updated_at=? WHERE id=? AND status='awaiting_payment' AND agreed_total_yen=?";
      values = [reference, now, params.id, verifiedAmount];
    } else if (body.action === "reject") {
      query = "UPDATE bookings SET status='rejected', updated_at=? WHERE id=? AND status='pending'";
      values = [now, params.id];
    } else if (body.action === "release" && body.invoice_not_created === true) {
      query = "UPDATE bookings SET status='cancelled', updated_at=? WHERE id=? AND status='approved' AND invoice_reference IS NULL";
      values = [now, params.id];
    } else if (body.action === "release" && body.invoice_voided_unpaid === true) {
      query = "UPDATE bookings SET status='cancelled', updated_at=? WHERE id=? AND status='awaiting_payment' AND invoice_reference IS NOT NULL";
      values = [now, params.id];
    } else {
      throw new Error("invalid_request");
    }
  } catch {
    return json({ error: "invalid_request" }, 400);
  }
  try {
    const result = await env.DB.prepare(query).bind(...values).run();
    if (!result.meta?.changes) {
      const existing = await env.DB.prepare("SELECT id,status,pickup_at FROM bookings WHERE id=?").bind(params.id).first();
      if (!existing) return json({ error: "not_found" }, 404);
      const nowJst = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 16);
      if (body.action === "approve" && existing.status === "pending") return json({ error: existing.pickup_at <= nowJst ? "pickup_in_past" : "overlap" }, 409);
      return json({ error: "state_or_amount_conflict" }, 409);
    }
    const booking = await env.DB.prepare(`SELECT ${fields} FROM bookings WHERE id=?`).bind(params.id).first();
    return json({ booking });
  } catch {
    try {
      if (body.action === "invoice_sent") {
        const duplicate = await env.DB.prepare("SELECT id FROM bookings WHERE invoice_reference=? AND id<>?").bind(body.invoice_reference.trim(), params.id).first();
        if (duplicate) return json({ error: "reference_already_used" }, 409);
      }
      if (body.action === "confirm") {
        const duplicate = await env.DB.prepare("SELECT id FROM bookings WHERE payment_reference=? AND id<>?").bind(body.payment_reference.trim(), params.id).first();
        if (duplicate) return json({ error: "reference_already_used" }, 409);
      }
    } catch { /* Fail closed if the database is unavailable. */ }
    return json({ error: "temporarily_unavailable" }, 503);
  }
}
