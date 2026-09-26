-- Demo inquiries captured by functions/api/inquiry.ts.
--
-- Only what the visitor typed, plus a salted one-way hash of their IP (never
-- the address itself) so the endpoint can rate-limit a single source.

CREATE TABLE IF NOT EXISTS inquiry (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT    NOT NULL,           -- ISO 8601, UTC
  name        TEXT    NOT NULL,
  phone       TEXT    NOT NULL,
  email       TEXT,
  company     TEXT,
  role        TEXT,                       -- consultant | business | developer | other
  tools       TEXT,                       -- comma-separated: n8n,make,zapier,custom,none
  best_time   TEXT,                       -- morning | afternoon | evening
  message     TEXT,
  ip_hash     TEXT    NOT NULL,           -- sha256(salt:ip)
  user_agent  TEXT
);

-- The rate-limit query filters on both columns together.
CREATE INDEX IF NOT EXISTS idx_inquiry_ip_hash_created_at ON inquiry (ip_hash, created_at);

-- Reading the newest inquiries is the common case.
CREATE INDEX IF NOT EXISTS idx_inquiry_created_at ON inquiry (created_at DESC);
