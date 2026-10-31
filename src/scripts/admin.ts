export {};

type Booking = {
  id: string; status: string; name: string; email: string;
  pickup_at: string; return_at: string; licence_country: string; licence_type: string;
  travel_plans: string; toll_roads: string; etc_requested: string; destinations: string; notes: string;
  agreed_total_yen: number | null; etc_advance_yen: number | null;
  invoice_reference: string | null; invoice_url: string | null; payment_reference: string | null;
  created_at: string;
};

const list = document.getElementById("bookings")!;
const message = document.getElementById("admin-message")!;
const refresh = document.getElementById("refresh") as HTMLButtonElement;
const previous = document.getElementById("previous-page") as HTMLButtonElement;
const next = document.getElementById("next-page") as HTMLButtonElement;
let offset = 0;
let nextOffset: number | null = null;
const statusLabels: Record<string, string> = {
  pending: "申請中", approved: "承認済み・請求書未記録", awaiting_payment: "請求済み・入金待ち",
  confirmed: "予約確定", rejected: "却下", cancelled: "取消済み",
};

function element<K extends keyof HTMLElementTagNameMap>(tag: K, text: string, className = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  node.className = className;
  return node;
}

function field(form: HTMLFormElement, name: string, label: string, opts: { type?: string; min?: string; max?: string; required?: boolean; value?: string } = {}) {
  const wrapper = element("label", "", "block space-y-1");
  wrapper.append(element("span", label, "block text-sm font-semibold"));
  const input = document.createElement("input");
  input.name = name;
  input.type = opts.type ?? "text";
  input.required = opts.required ?? true;
  input.maxLength = 120;
  if (opts.min) input.min = opts.min;
  if (opts.max) input.max = opts.max;
  if (opts.value) input.value = opts.value;
  input.className = "w-full rounded border border-gray-400 bg-white p-2 text-gray-900";
  wrapper.append(input);
  form.append(wrapper);
}

async function update(id: string, data: Record<string, string | number | boolean>, button: HTMLButtonElement) {
  button.disabled = true;
  message.textContent = "更新しています…";
  try {
    const response = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "same-origin", cache: "no-store", body: JSON.stringify(data),
    });
    if (response.status === 409) {
      const result = await response.json().catch(() => ({}));
      if (result.error === "pickup_in_past") throw new Error("受取日時が過ぎているため承認できません。");
      if (result.error === "reference_already_used") throw new Error("この Square 番号は別の予約に使用されています。");
      throw new Error("状態・金額が一致しないか、予約期間が重複しています。一覧を更新して確認してください。");
    }
    if (!response.ok) throw new Error("更新できませんでした。入力内容と管理者のアクセス設定を確認してください。");
    await load();
    message.textContent = "更新しました。お客様への連絡は別途行ってください。";
  } catch (error) {
    message.textContent = error instanceof Error ? error.message : "更新できませんでした。";
  } finally { button.disabled = false; }
}

function renderBooking(booking: Booking) {
  const card = element("article", "", "rounded border border-gray-700 bg-gray-800 p-5");
  const title = element("h2", `${booking.name} — ${statusLabels[booking.status] ?? booking.status}`, "text-xl font-bold");
  card.append(title, element("p", `受付番号: ${booking.id}`, "mt-1 break-all text-xs text-gray-400"));
  const details = element("dl", "", "mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2");
  const rows: [string, unknown][] = [
    ["メール", booking.email], ["申請日時", booking.created_at],
    ["受取日時（日本時間）", booking.pickup_at], ["返却日時（日本時間）", booking.return_at],
    ["免許の発行国・地域", booking.licence_country], ["運転書類", booking.licence_type],
    ["旅行予定", booking.travel_plans], ["有料道路の利用", booking.toll_roads],
    ["ETC の希望", booking.etc_requested], ["行き先・ルート", booking.destinations], ["その他", booking.notes],
    ["請求合計（円）", booking.agreed_total_yen], ["うち ETC 前払金（円）", booking.etc_advance_yen],
    ["Square 請求書番号", booking.invoice_reference], ["Square 請求書 URL", booking.invoice_url],
    ["Square 支払参照番号", booking.payment_reference],
  ];
  for (const [label, value] of rows) {
    if (value === null || value === undefined || value === "") continue;
    const group = element("div", "", "min-w-0");
    group.append(element("dt", label, "text-xs text-gray-400"), element("dd", String(value), "mt-1 whitespace-pre-wrap break-words"));
    details.append(group);
  }
  card.append(details);
  const form = document.createElement("form");
  form.className = "mt-6 space-y-4 border-t border-gray-600 pt-4";

  if (booking.status === "pending") {
    form.append(element("p", "DriveShare を含む空き状況と運転資格を確認してから承認してください。合計額には ETC 前払金を含めます。", "text-sm text-gray-300"));
    field(form, "agreed_total_yen", "お客様への請求合計（円・ETC前払金を含む）", { type: "number", min: "1", max: "10000000" });
    field(form, "etc_advance_yen", "うち ETC 前払金（円）", { type: "number", min: "0", max: "10000000", value: "0" });
    const approve = element("button", "承認して枠を確保", "rounded bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700") as HTMLButtonElement;
    approve.type = "submit";
    form.append(approve);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = new FormData(form);
      const total = Number(values.get("agreed_total_yen"));
      const etc = Number(values.get("etc_advance_yen"));
      if (!Number.isInteger(total) || !Number.isInteger(etc) || etc > total) { message.textContent = "ETC 前払金は請求合計以下の整数で入力してください。"; return; }
      if (!window.confirm("内容と空き状況を確認して承認しますか？")) return;
      await update(booking.id, { action: "approve", agreed_total_yen: total, etc_advance_yen: etc }, approve);
    });
    const reject = element("button", "申請を却下", "ml-3 rounded border border-gray-400 px-4 py-2 hover:bg-gray-700") as HTMLButtonElement;
    reject.type = "button";
    reject.addEventListener("click", async () => { if (window.confirm("この申請を却下しますか？")) await update(booking.id, { action: "reject" }, reject); });
    form.append(reject);
  } else if (booking.status === "approved") {
    form.append(element("p", "Square で請求書を作成・送信してから、請求書番号を記録してください。この画面からは送信されません。", "text-sm text-gray-300"));
    field(form, "invoice_reference", "Square 請求書番号");
    field(form, "invoice_url", "Square 請求書 URL（任意）", { type: "url", required: false });
    const send = element("button", "請求書送信済みとして記録", "rounded bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700") as HTMLButtonElement;
    send.type = "submit"; form.append(send);
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); const values = new FormData(form);
      if (!window.confirm("Square で請求書を送信済みですか？")) return;
      await update(booking.id, { action: "invoice_sent", invoice_reference: String(values.get("invoice_reference") ?? "").trim(), invoice_url: String(values.get("invoice_url") ?? "").trim() }, send);
    });
    const release = element("button", "承認を取り消して枠を解除", "ml-3 rounded border border-gray-400 px-4 py-2 hover:bg-gray-700") as HTMLButtonElement;
    release.type = "button";
    release.addEventListener("click", async () => {
      if (!window.confirm("Square 請求書がまだ発行されていないことを確認しましたか？発行済みの場合はこの操作を行わないでください。")) return;
      await update(booking.id, { action: "release", invoice_not_created: true }, release);
    });
    form.append(release);
  } else if (booking.status === "awaiting_payment") {
    form.append(element("p", "Square で対象の請求書が全額・日本円で支払済みであることを確認してください。", "text-sm text-gray-300"));
    field(form, "payment_reference", "Square 支払参照番号");
    field(form, "verified_amount_yen", "Square で確認した支払済み額（円）", { type: "number", min: "1", max: "10000000" });
    const confirmButton = element("button", "入金を確認して予約確定", "rounded bg-emerald-700 px-4 py-2 font-semibold hover:bg-emerald-800") as HTMLButtonElement;
    confirmButton.type = "submit"; form.append(confirmButton);
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); const values = new FormData(form);
      if (!window.confirm("Square で請求書番号・金額・通貨・全額の支払いを照合しましたか？")) return;
      await update(booking.id, { action: "confirm", payment_reference: String(values.get("payment_reference") ?? "").trim(), verified_amount_yen: Number(values.get("verified_amount_yen")), verified_currency: "JPY" }, confirmButton);
    });
    const release = element("button", "請求を取り消して枠を解除", "ml-3 rounded border border-gray-400 px-4 py-2 hover:bg-gray-700") as HTMLButtonElement;
    release.type = "button";
    release.addEventListener("click", async () => {
      if (!window.confirm("Square で請求書を無効化し、支払いがないことを確認しましたか？")) return;
      await update(booking.id, { action: "release", invoice_voided_unpaid: true }, release);
    });
    form.append(release);
  }
  if (form.childElementCount) card.append(form);
  return card;
}

async function load() {
  refresh.disabled = true;
  previous.disabled = true;
  next.disabled = true;
  message.textContent = "予約を読み込んでいます…";
  try {
    const response = await fetch(`/api/admin/bookings?offset=${offset}`, { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) throw new Error("予約一覧を表示できません。管理者のアクセス設定と接続を確認してください。");
    const data = await response.json() as { bookings: Booking[]; next_offset: number | null };
    if (!Array.isArray(data.bookings)) throw new Error("予約一覧を読み込めませんでした。");
    nextOffset = data.next_offset;
    list.replaceChildren(...data.bookings.map(renderBooking));
    message.textContent = data.bookings.length ? `${offset + 1} 件目から ${offset + data.bookings.length} 件目を表示` : "このページに予約申請はありません。";
  } catch (error) {
    list.replaceChildren();
    nextOffset = null;
    message.textContent = error instanceof Error ? error.message : "予約一覧を読み込めませんでした。";
  } finally { refresh.disabled = false; previous.disabled = offset === 0; next.disabled = nextOffset === null; }
}
refresh.addEventListener("click", () => void load());
previous.addEventListener("click", () => { offset = Math.max(0, offset - 100); void load(); });
next.addEventListener("click", () => { if (nextOffset !== null) { offset = nextOffset; void load(); } });
void load();
