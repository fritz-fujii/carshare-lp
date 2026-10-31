import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { onRequestPost as createBooking } from "../functions/api/bookings.js";
import { onRequestGet as getConfig } from "../functions/api/config.js";
import { onRequestGet as listBookings } from "../functions/api/admin/bookings/index.js";
import { onRequestPost as transition } from "../functions/api/admin/bookings/[id].js";

function d1() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(new URL("../migrations/0001_bookings.sql", import.meta.url), "utf8"));
  return {
    prepare(sql) {
      return { bind(...args) {
        return {
          async first() { return db.prepare(sql).get(...args) ?? null; },
          async all() { return { results: db.prepare(sql).all(...args) }; },
          async run() { return { meta: db.prepare(sql).run(...args) }; },
        };
      } };
    },
  };
}

const b64 = (value) => Buffer.from(value).toString("base64url");
async function signedToken(privateKey, email = "owner@example.com") {
  const now = Math.floor(Date.now() / 1000);
  const header = b64(JSON.stringify({ alg: "RS256", kid: "test-key" }));
  const claims = b64(JSON.stringify({ iss: "https://test-team.cloudflareaccess.com", aud: ["test-audience"], email, exp: now + 60, nbf: now - 1 }));
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, new TextEncoder().encode(`${header}.${claims}`));
  return `${header}.${claims}.${b64(signature)}`;
}

test("booking requests, access verification and competing approvals", async () => {
  const keys = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const jwk = { ...await crypto.subtle.exportKey("jwk", keys.publicKey), kid: "test-key" };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url) === "https://challenges.cloudflare.com/turnstile/v0/siteverify") return Response.json({ success: true, hostname: "example.com" });
    if (String(url) === "https://test-team.cloudflareaccess.com/cdn-cgi/access/certs") return Response.json({ keys: [jwk] });
    throw new Error("Unexpected outbound request");
  };
  try {
    const env = { DB: d1(), FEATURE_BOOKINGS_ENABLED: "true", TURNSTILE_SITE_KEY: "site", TURNSTILE_SECRET_KEY: "secret", CF_ACCESS_TEAM_DOMAIN: "test-team.cloudflareaccess.com", CF_ACCESS_AUD: "test-audience", ADMIN_EMAILS: "owner@example.com" };
    assert.equal((await (await getConfig({ env: { ...env, FEATURE_BOOKINGS_ENABLED: "false" } })).json()).bookings_enabled, false);
    assert.equal((await (await getConfig({ env: { ...env, CF_ACCESS_AUD: "" } })).json()).bookings_enabled, false);
    const valid = { name: "Example Driver", email: "driver@example.com", pickup_at: "2099-03-01T10:00", return_at: "2099-03-03T10:00", licence_country: "France", licence_type: "valid_licence", travel_plans: "undecided", toll_roads: "unsure", etc_requested: "unsure", destinations: "", notes: "", turnstile_token: "test" };
    const post = (data, key) => new Request("https://example.com/api/bookings", { method: "POST", headers: { origin: "https://example.com", "content-type": "application/json", "Idempotency-Key": key }, body: JSON.stringify(data) });
    const key = crypto.randomUUID();
    const first = await createBooking({ request: post(valid, key), env });
    assert.equal(first.status, 201);
    const { id } = await first.json();
    const retry = await createBooking({ request: post(valid, key), env });
    assert.equal((await retry.json()).id, id);
    assert.equal((await createBooking({ request: post({ ...valid, name: "Another Person" }, key), env })).status, 409);
    const second = await createBooking({ request: post({ ...valid, email: "another@example.com" }, crypto.randomUUID()), env });
    const secondId = (await second.json()).id;

    const adminRequest = (body, token, origin = "https://example.com") => new Request(`https://example.com/api/admin/bookings/${id}`, { method: "POST", headers: { origin, "content-type": "application/json", "Cf-Access-Jwt-Assertion": token }, body: JSON.stringify(body) });
    const token = await signedToken(keys.privateKey);
    const otherToken = await signedToken(keys.privateKey, "other@example.com");
    assert.equal((await listBookings({ request: new Request("https://example.com/api/admin/bookings", { headers: { "Cf-Access-Jwt-Assertion": otherToken } }), env })).status, 401);
    const parts = token.split(".");
    const forged = `${parts[0]}.${b64(JSON.stringify({ iss: "https://test-team.cloudflareaccess.com", aud: ["test-audience"], email: "owner@example.com", exp: Math.floor(Date.now() / 1000) + 600 }))}.${parts[2]}`;
    assert.equal((await listBookings({ request: new Request("https://example.com/api/admin/bookings", { headers: { "Cf-Access-Jwt-Assertion": forged } }), env })).status, 401);
    assert.equal((await transition({ request: adminRequest({ action: "reject" }, token, "https://evil.example"), env, params: { id } })).status, 403);
    assert.equal((await transition({ request: adminRequest({ action: "approve", agreed_total_yen: 24800, etc_advance_yen: 10000 }, token), env, params: { id } })).status, 200);
    const conflict = await transition({ request: adminRequest({ action: "approve", agreed_total_yen: 14800, etc_advance_yen: 0 }, token), env, params: { id: secondId } });
    assert.equal(conflict.status, 409);
    assert.equal((await conflict.json()).error, "overlap");
    assert.equal((await transition({ request: adminRequest({ action: "invoice_sent", invoice_reference: "INV-1", invoice_url: "https://squareup.com/pay-invoice/example" }, token), env, params: { id } })).status, 200);
    assert.equal((await transition({ request: adminRequest({ action: "confirm", payment_reference: "PAY-1", verified_amount_yen: 1, verified_currency: "JPY" }, token), env, params: { id } })).status, 409);
    assert.equal((await transition({ request: adminRequest({ action: "confirm", payment_reference: "PAY-1", verified_amount_yen: 24800, verified_currency: "JPY" }, token), env, params: { id } })).status, 200);
    const later = await createBooking({ request: post({ ...valid, pickup_at: "2099-03-03T10:00", return_at: "2099-03-04T10:00" }, crypto.randomUUID()), env });
    const laterId = (await later.json()).id;
    assert.equal((await transition({ request: adminRequest({ action: "approve", agreed_total_yen: 14800, etc_advance_yen: 0 }, token), env, params: { id: laterId } })).status, 200);
    const duplicateInvoice = await transition({ request: adminRequest({ action: "invoice_sent", invoice_reference: "INV-1" }, token), env, params: { id: laterId } });
    assert.equal(duplicateInvoice.status, 409);
    assert.equal((await duplicateInvoice.json()).error, "reference_already_used");
    assert.equal((await transition({ request: adminRequest({ action: "release" }, token), env, params: { id: laterId } })).status, 400);
    const releaseApproved = await transition({ request: adminRequest({ action: "release", invoice_not_created: true }, token), env, params: { id: laterId } });
    assert.equal((await releaseApproved.json()).booking.status, "cancelled");
    assert.equal((await transition({ request: adminRequest({ action: "release", invoice_voided_unpaid: true }, token), env, params: { id } })).status, 409);

    const held = await createBooking({ request: post({ ...valid, pickup_at: "2099-04-01T10:00", return_at: "2099-04-03T10:00" }, crypto.randomUUID()), env });
    const heldId = (await held.json()).id;
    assert.equal((await transition({ request: adminRequest({ action: "approve", agreed_total_yen: 14800, etc_advance_yen: 0 }, token), env, params: { id: heldId } })).status, 200);
    assert.equal((await transition({ request: adminRequest({ action: "invoice_sent", invoice_reference: "INV-2" }, token), env, params: { id: heldId } })).status, 200);
    assert.equal((await transition({ request: adminRequest({ action: "release", invoice_not_created: true }, token), env, params: { id: heldId } })).status, 409);
    const releaseInvoiced = await transition({ request: adminRequest({ action: "release", invoice_voided_unpaid: true }, token), env, params: { id: heldId } });
    assert.equal((await releaseInvoiced.json()).booking.status, "cancelled");

    const stale = await createBooking({ request: post({ ...valid, pickup_at: "2099-05-01T10:00", return_at: "2099-05-02T10:00" }, crypto.randomUUID()), env });
    const staleId = (await stale.json()).id;
    await env.DB.prepare("UPDATE bookings SET pickup_at='2000-01-01T10:00',return_at='2000-01-02T10:00' WHERE id=?").bind(staleId).run();
    const oldRequest = await transition({ request: adminRequest({ action: "approve", agreed_total_yen: 14800, etc_advance_yen: 0 }, token), env, params: { id: staleId } });
    assert.equal(oldRequest.status, 409);
    assert.equal((await oldRequest.json()).error, "pickup_in_past");

    const insert = "INSERT INTO bookings (id,idempotency_key,request_hash,status,name,email,pickup_at,return_at,licence_country,licence_type,created_at,updated_at) VALUES (?,?,?,'pending','Test','test@example.com','2099-01-01T10:00','2099-01-02T10:00','Japan','test','2026-01-01T00:00:00Z','2026-01-01T00:00:00Z')";
    for (let index = 0; index < 101; index++) await env.DB.prepare(insert).bind(crypto.randomUUID(), crypto.randomUUID(), "hash").run();
    const list = async (offset) => (await (await listBookings({ request: new Request(`https://example.com/api/admin/bookings?offset=${offset}`, { headers: { "Cf-Access-Jwt-Assertion": token } }), env })).json());
    const firstPage = await list(0);
    assert.equal(firstPage.bookings.length, 100);
    assert.equal(firstPage.next_offset, 100);
    const secondPage = await list(firstPage.next_offset);
    assert.equal(secondPage.next_offset, null);
    const ids = [...firstPage.bookings, ...secondPage.bookings].map((booking) => booking.id);
    assert.equal(new Set(ids).size, ids.length);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
