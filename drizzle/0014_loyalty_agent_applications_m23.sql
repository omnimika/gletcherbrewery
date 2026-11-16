-- M2-3 R08: intent idempotency, one active application, staff audit events,
-- member-visible public_note. Statuses align with Airtable «Агенты» (9 values).

ALTER TABLE app.loyalty_agent_applications
  ADD COLUMN IF NOT EXISTS intent_key text,
  ADD COLUMN IF NOT EXISTS public_note text;

-- Backfill intent for any pre-M2-3 rows (stable, unique per row).
UPDATE app.loyalty_agent_applications
SET intent_key = id::text
WHERE intent_key IS NULL;

ALTER TABLE app.loyalty_agent_applications
  ALTER COLUMN intent_key SET NOT NULL;

-- If multiple non-rejected rows exist per member, keep newest; close older.
WITH ranked AS (
  SELECT
    id,
    member_id,
    ROW_NUMBER() OVER (
      PARTITION BY member_id
      ORDER BY created_at DESC, id DESC
    ) AS rn
  FROM app.loyalty_agent_applications
  WHERE status IS DISTINCT FROM 'rejected'
)
UPDATE app.loyalty_agent_applications a
SET
  status = 'rejected',
  public_note = COALESCE(a.public_note, 'Закрыто миграцией 0014 (дубликат активной заявки)'),
  reviewed_by = COALESCE(a.reviewed_by, 'migration_0014'),
  reviewed_at = COALESCE(a.reviewed_at, now()),
  updated_at = now()
FROM ranked r
WHERE a.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_agent_applications_member_intent_uidx
  ON app.loyalty_agent_applications (member_id, intent_key);

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_agent_applications_one_active_uidx
  ON app.loyalty_agent_applications (member_id)
  WHERE status IS DISTINCT FROM 'rejected';

CREATE TABLE IF NOT EXISTS app.loyalty_agent_application_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL
    REFERENCES app.loyalty_agent_applications (id) ON DELETE CASCADE,
  action text NOT NULL,
  actor text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS loyalty_agent_application_events_app_idx
  ON app.loyalty_agent_application_events (application_id, created_at DESC);

REVOKE ALL ON TABLE app.loyalty_agent_application_events FROM PUBLIC;
REVOKE ALL ON TABLE app.loyalty_agent_application_events FROM gletcher_worker;
REVOKE ALL ON TABLE app.loyalty_agent_application_events FROM gletcher_nocodb;
GRANT SELECT, INSERT ON TABLE app.loyalty_agent_application_events TO gletcher_app;

-- Re-assert app DML on applications (0013 may have run before this table matured).
GRANT SELECT, INSERT, UPDATE ON TABLE app.loyalty_agent_applications TO gletcher_app;
REVOKE ALL ON TABLE app.loyalty_agent_applications FROM gletcher_worker;
REVOKE ALL ON TABLE app.loyalty_agent_applications FROM gletcher_nocodb;
