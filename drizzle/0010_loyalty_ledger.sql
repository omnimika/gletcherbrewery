-- M2-1 loyalty: members, append-only ledger, receipts (QR/OCR/manual), aliases.
-- Spendable = verified earn only (owner Confirmed 10.11).
-- Legacy Airtable checks НЕТ → import as verified (manual review already done).

CREATE TABLE IF NOT EXISTS app.loyalty_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized text NOT NULL,
  display_name text,
  phone text,
  city text,
  airtable_record_id text,
  onboarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_members_email_uidx
  ON app.loyalty_members (email_normalized);

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_members_airtable_uidx
  ON app.loyalty_members (airtable_record_id)
  WHERE airtable_record_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS app.loyalty_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL
    REFERENCES app.loyalty_members (id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending_upload',
  source text NOT NULL,
  -- qr | ocr | manual | legacy_airtable | staff
  photo_object_key text,
  qr_payload text,
  fiscal_fn text,
  fiscal_fd text,
  fiscal_fp text,
  fiscal_operation text,
  receipt_fingerprint text,
  purchase_at date,
  city text,
  venue_network text,
  venue_name text,
  gletcher_sum_rub numeric(12, 2),
  proposed_earn integer,
  ocr_text text,
  ocr_lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  staff_note text,
  reviewed_by text,
  reviewed_at timestamptz,
  airtable_check_id text,
  legacy_paid_flag text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_receipts_fingerprint_uidx
  ON app.loyalty_receipts (receipt_fingerprint)
  WHERE receipt_fingerprint IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_receipts_airtable_uidx
  ON app.loyalty_receipts (airtable_check_id)
  WHERE airtable_check_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS loyalty_receipts_member_idx
  ON app.loyalty_receipts (member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS loyalty_receipts_status_idx
  ON app.loyalty_receipts (status, created_at);

CREATE TABLE IF NOT EXISTS app.loyalty_ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL
    REFERENCES app.loyalty_members (id) ON DELETE RESTRICT,
  entry_kind text NOT NULL,
  -- check_earn | shop_earn | agent_earn | spend | adjustment | opening
  amount integer NOT NULL,
  -- signed: earn > 0, spend < 0
  status text NOT NULL DEFAULT 'posted',
  -- posted | voided (void via reversing entry preferred)
  source_system text NOT NULL,
  source_record_id text NOT NULL,
  receipt_id uuid REFERENCES app.loyalty_receipts (id) ON DELETE SET NULL,
  eligible_sum_rub numeric(12, 2),
  reward_rate numeric(8, 6),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_ledger_idempotency_uidx
  ON app.loyalty_ledger_entries (source_system, source_record_id, entry_kind);

CREATE INDEX IF NOT EXISTS loyalty_ledger_member_idx
  ON app.loyalty_ledger_entries (member_id, created_at);

CREATE INDEX IF NOT EXISTS loyalty_ledger_receipt_idx
  ON app.loyalty_ledger_entries (receipt_id)
  WHERE receipt_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS app.product_receipt_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alias_normalized text NOT NULL,
  product_slug text,
  brand text NOT NULL DEFAULT 'gletcher',
  gtin text,
  active boolean NOT NULL DEFAULT true,
  valid_from date,
  valid_to date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS product_receipt_aliases_alias_uidx
  ON app.product_receipt_aliases (alias_normalized)
  WHERE active = true;

CREATE INDEX IF NOT EXISTS product_receipt_aliases_gtin_idx
  ON app.product_receipt_aliases (gtin)
  WHERE gtin IS NOT NULL;

CREATE INDEX IF NOT EXISTS product_receipt_aliases_slug_idx
  ON app.product_receipt_aliases (product_slug)
  WHERE product_slug IS NOT NULL;
