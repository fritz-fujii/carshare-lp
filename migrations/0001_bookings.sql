CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  request_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'awaiting_payment', 'confirmed', 'rejected', 'cancelled')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  pickup_at TEXT NOT NULL,
  return_at TEXT NOT NULL,
  licence_country TEXT NOT NULL,
  licence_type TEXT NOT NULL,
  travel_plans TEXT NOT NULL DEFAULT '',
  toll_roads TEXT NOT NULL DEFAULT '',
  etc_requested TEXT NOT NULL DEFAULT '',
  destinations TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  invoice_url TEXT,
  invoice_reference TEXT,
  agreed_total_yen INTEGER,
  etc_advance_yen INTEGER,
  payment_reference TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS bookings_status_dates ON bookings(status, pickup_at, return_at);
CREATE INDEX IF NOT EXISTS bookings_created_at ON bookings(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS bookings_invoice_reference_unique ON bookings(invoice_reference) WHERE invoice_reference IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS bookings_payment_reference_unique ON bookings(payment_reference) WHERE payment_reference IS NOT NULL;
