const NO_STORE = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export function json(body, status = 200) {
  return Response.json(body, { status, headers: NO_STORE });
}

export function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return !!origin && origin === new URL(request.url).origin;
}

export async function readJson(request, maxBytes = 8192) {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new Error("invalid_request");
  if (Number(request.headers.get("content-length")) > maxBytes || !request.body) throw new Error("invalid_request");
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new Error("invalid_request"); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const text = new TextDecoder().decode(bytes);
  const body = JSON.parse(text);
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("invalid_request");
  return body;
}

export function bookingsEnabled(env) {
  return env.FEATURE_BOOKINGS_ENABLED === "true" && !!env.DB && !!env.TURNSTILE_SECRET_KEY && !!env.TURNSTILE_SITE_KEY && /^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.CF_ACCESS_TEAM_DOMAIN || "") && !!env.CF_ACCESS_AUD && !!env.ADMIN_EMAILS?.trim();
}

export async function hashRequest(input) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(input)));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function textField(value, maxLength, minLength = 0) {
  if (typeof value !== "string") throw new Error("invalid_request");
  const trimmed = value.trim();
  if (trimmed.length < minLength || trimmed.length > maxLength || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(trimmed)) throw new Error("invalid_request");
  return trimmed;
}

export function japanDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("invalid_request");
  const millis = Date.parse(`${value}:00+09:00`);
  if (!Number.isFinite(millis) || new Date(millis + 9 * 3600000).toISOString().slice(0, 16) !== value) throw new Error("invalid_request");
  return millis;
}

export async function verifyTurnstile(token, env, request) {
  if (typeof token !== "string" || token.length < 1 || token.length > 2048) return false;
  const form = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true && result.hostname === new URL(request.url).hostname;
}

function decodeBase64Url(input) {
  if (!/^[A-Za-z0-9_-]+$/.test(input)) throw new Error("invalid_token");
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const bytes = atob(padded);
  return Uint8Array.from(bytes, (c) => c.charCodeAt(0));
}

// Never trust the Access header without verifying its signature and claims.
export async function authorizedAdmin(request, env) {
  try {
    const team = env.CF_ACCESS_TEAM_DOMAIN;
    const audience = env.CF_ACCESS_AUD;
    const allowlist = (env.ADMIN_EMAILS || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
    if (typeof team !== "string" || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(team) || !audience || !allowlist.length) return false;
    const token = request.headers.get("Cf-Access-Jwt-Assertion");
    if (!token || token.length > 16384) return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const decoder = new TextDecoder();
    const header = JSON.parse(decoder.decode(decodeBase64Url(parts[0])));
    const claims = JSON.parse(decoder.decode(decodeBase64Url(parts[1])));
    const now = Math.floor(Date.now() / 1000);
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (header.alg !== "RS256" || typeof header.kid !== "string" || claims.iss !== `https://${team}` || !audiences.includes(audience) || typeof claims.exp !== "number" || claims.exp <= now || (claims.nbf !== undefined && (typeof claims.nbf !== "number" || claims.nbf > now)) || typeof claims.email !== "string" || !allowlist.includes(claims.email.toLowerCase())) return false;
    const keyResponse = await fetch(`https://${team}/cdn-cgi/access/certs`);
    if (!keyResponse.ok) return false;
    const keyset = await keyResponse.json();
    const jwk = Array.isArray(keyset.keys) && keyset.keys.find((key) => key.kid === header.kid && key.kty === "RSA");
    if (!jwk) return false;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, decodeBase64Url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  } catch {
    return false;
  }
}
