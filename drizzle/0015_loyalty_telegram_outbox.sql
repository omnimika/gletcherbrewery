-- Loyalty cabinet Telegram: polymorphic delivery_jobs source + worker SELECTs.
-- Forms keep destination=telegram / TELEGRAM_CHAT_ID.
-- Receipts + agent applications use destination=telegram_agent / TELEGRAM_AGENT_CHAT_ID.
-- No fake form_submissions leads.

ALTER TABLE app.delivery_jobs
  ADD COLUMN IF NOT EXISTS source_kind text,
  ADD COLUMN IF NOT EXISTS source_id uuid;

UPDATE app.delivery_jobs
SET
  source_kind = 'form_submission',
  source_id = submission_id
WHERE source_kind IS NULL;

ALTER TABLE app.delivery_jobs
  ALTER COLUMN source_kind SET DEFAULT 'form_submission',
  ALTER COLUMN source_kind SET NOT NULL,
  ALTER COLUMN source_id SET NOT NULL;

ALTER TABLE app.delivery_jobs
  ALTER COLUMN submission_id DROP NOT NULL;

DROP INDEX IF EXISTS app.delivery_jobs_unique_uidx;

CREATE UNIQUE INDEX IF NOT EXISTS delivery_jobs_unique_uidx
  ON app.delivery_jobs (
    source_kind,
    source_id,
    destination,
    event_type,
    schema_version
  );

ALTER TABLE app.delivery_jobs
  DROP CONSTRAINT IF EXISTS delivery_jobs_source_kind_chk;

ALTER TABLE app.delivery_jobs
  ADD CONSTRAINT delivery_jobs_source_kind_chk
  CHECK (
    source_kind IN (
      'form_submission',
      'loyalty_receipt',
      'loyalty_agent_application'
    )
  );

ALTER TABLE app.delivery_jobs
  DROP CONSTRAINT IF EXISTS delivery_jobs_form_source_chk;

ALTER TABLE app.delivery_jobs
  ADD CONSTRAINT delivery_jobs_form_source_chk
  CHECK (
    (
      source_kind = 'form_submission'
      AND submission_id IS NOT NULL
      AND submission_id = source_id
    )
    OR (
      source_kind <> 'form_submission'
      AND submission_id IS NULL
    )
  );

-- Worker may load loyalty rows for telegram_agent messages (column-limited).
GRANT SELECT (
  id,
  member_id,
  status,
  source,
  city,
  venue_network,
  venue_name,
  gletcher_sum_rub,
  proposed_earn,
  purchase_at,
  created_at
) ON TABLE app.loyalty_receipts TO gletcher_worker;

GRANT SELECT (
  id,
  member_id,
  status,
  phone,
  city,
  venue_name,
  venue_type,
  venue_address,
  venue_boss,
  comment,
  created_at
) ON TABLE app.loyalty_agent_applications TO gletcher_worker;

GRANT SELECT (
  id,
  email_normalized,
  display_name,
  phone,
  city
) ON TABLE app.loyalty_members TO gletcher_worker;
