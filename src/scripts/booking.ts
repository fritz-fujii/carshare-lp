export {};

type Turnstile = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window { turnstile?: Turnstile }
}

const form = document.querySelector<HTMLFormElement>("#booking-form");
const fields = document.querySelector<HTMLFieldSetElement>("#booking-fields");
const status = document.querySelector<HTMLElement>("#booking-status");
const submit = document.querySelector<HTMLButtonElement>("#booking-submit");
const verification = document.querySelector<HTMLElement>("#booking-verification");

if (form && fields && status && submit && verification) {
  const activeForm = form;
  const activeFields = fields;
  const statusBox = status;
  const button = submit;
  const challenge = verification;
  const storageKey = "carshare-pending-booking-v1";
  let token = "";
  let widgetId = "";
  let sending = false;

  const announce = (message: string) => { statusBox.textContent = message; };
  const updateButton = () => { button.disabled = sending || !token; };
  const resetChallenge = () => {
    token = "";
    updateButton();
    if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
  };

  async function setup() {
    try {
      // Keep the controls disabled if secure IDs, session storage, configuration,
      // or the anti-abuse challenge are unavailable.
      if (!crypto.randomUUID || !crypto.subtle) throw new Error("unsupported");
      sessionStorage.setItem(`${storageKey}-test`, "1");
      sessionStorage.removeItem(`${storageKey}-test`);
      const configResponse = await fetch("/api/config", { cache: "no-store" });
      if (!configResponse.ok) throw new Error("unavailable");
      const config = await configResponse.json();
      if (config.bookings_enabled !== true || typeof config.turnstile_site_key !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(config.turnstile_site_key)) throw new Error("unavailable");

      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onerror = () => announce("Verification could not load. Booking requests are unavailable; please try again later.");
      script.onload = () => {
        if (!window.turnstile) {
          announce("Verification could not load. Booking requests are unavailable; please try again later.");
          return;
        }
        try {
          widgetId = window.turnstile.render(challenge, {
            sitekey: config.turnstile_site_key,
            callback: (value: string) => { token = value; updateButton(); },
            "expired-callback": () => { token = ""; updateButton(); announce("Verification expired. Please complete it again."); },
            "error-callback": () => { token = ""; updateButton(); announce("Verification failed. Please try again."); },
          });
          activeFields.disabled = false;
          updateButton();
          announce("Complete the form and verification to send a request. A request is not a confirmed booking.");
        } catch {
          activeFields.disabled = true;
          announce("Verification could not load. Booking requests are unavailable; please try again later.");
        }
      };
      document.head.appendChild(script);
    } catch {
      announce("Booking requests are currently unavailable. Please try again later.");
    }
  }

  activeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending || activeFields.disabled || !token) return;
    if (!activeForm.reportValidity()) return;
    const data = new FormData(activeForm);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const payload = {
      name: value("name"), email: value("email"), pickup_at: value("pickup_at"), return_at: value("return_at"),
      licence_country: value("licence_country"), licence_type: value("licence_type"), travel_plans: value("travel_plans"),
      toll_roads: value("toll_roads"), etc_requested: value("etc_requested"), destinations: value("destinations"), notes: value("notes"),
    };
    if (payload.name.length < 2 || !payload.licence_country || !payload.licence_type) {
      announce("Please complete all required fields.");
      return;
    }
    const pickupTime = Date.parse(`${payload.pickup_at}:00+09:00`);
    const returnTime = Date.parse(`${payload.return_at}:00+09:00`);
    if (!Number.isFinite(pickupTime) || !Number.isFinite(returnTime) || pickupTime <= Date.now() || returnTime <= pickupTime) {
      announce("Please choose a future pickup time and a later return time, in Japan time.");
      return;
    }

    sending = true;
    updateButton();
    try {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(payload)));
      const fingerprint = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      const previous = sessionStorage.getItem(storageKey);
      const pending = previous ? JSON.parse(previous) : null;
      if (pending && pending.fingerprint !== fingerprint) {
        announce("The outcome of an earlier request is unknown. Please restore the earlier details and retry, or contact us before submitting different details.");
        return;
      }
      const id = pending?.id || crypto.randomUUID();
      sessionStorage.setItem(storageKey, JSON.stringify({ id, fingerprint }));
      announce("Sending your request. Please keep this page open.");
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": id },
        body: JSON.stringify({ ...payload, turnstile_token: token }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.status === "pending" && typeof result.id === "string" && /^[0-9a-f-]{36}$/i.test(result.id)) {
        sessionStorage.removeItem(storageKey);
        activeFields.disabled = true;
        announce(`Request received. Reference: ${result.id}. This is not a confirmed booking; we will review your request before payment.`);
        return;
      }
      if (response.status === 400 && result.error === "verification_failed") {
        announce("Verification failed. Please complete it again and retry with the same details.");
      } else if (response.status === 400 && result.error === "invalid_request") {
        sessionStorage.removeItem(storageKey);
        announce("Please check the required fields and dates, then try again.");
      } else if (response.status === 409) {
        announce("We could not match this retry to the original request. Please contact us before submitting again.");
      } else {
        announce("We could not confirm whether your request was received. Please retry with the same details or contact us before making another request.");
      }
      resetChallenge();
    } catch {
      announce("We could not confirm whether your request was received. Please retry with the same details or contact us before making another request.");
      resetChallenge();
    } finally {
      sending = false;
      updateButton();
    }
  });

  void setup();
}
