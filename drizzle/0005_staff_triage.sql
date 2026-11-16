-- B3 staff triage: workflow fields + audit events. Intake status stays separate.
-- NocoDB remains SELECT-only; mutations go through app server commands.

ALTER TABLE app.staff_contact_leads
  ADD COLUMN IF NOT EXISTS workflow_status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS assignee text,
  ADD COLUMN IF NOT EXISTS staff_note text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_by text;

ALTER TABLE public.staff_contact_leads
  ADD COLUMN IF NOT EXISTS workflow_status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS assignee text,
  ADD COLUMN IF NOT EXISTS staff_note text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_by text;

CREATE INDEX IF NOT EXISTS staff_contact_leads_workflow_idx
  ON app.staff_contact_leads (workflow_status, created_at DESC);

CREATE INDEX IF NOT EXISTS staff_contact_leads_public_workflow_idx
  ON public.staff_contact_leads (workflow_status, created_at DESC);

CREATE TABLE IF NOT EXISTS app.staff_lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL
    REFERENCES app.form_submissions (id) ON DELETE CASCADE,
  action text NOT NULL,
  actor text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_lead_events_submission_idx
  ON app.staff_lead_events (submission_id, created_at DESC);

GRANT SELECT, INSERT ON TABLE app.staff_lead_events TO gletcher_app;
REVOKE ALL ON TABLE app.staff_lead_events FROM PUBLIC;
REVOKE ALL ON TABLE app.staff_lead_events FROM gletcher_nocodb;
REVOKE ALL ON TABLE app.staff_lead_events FROM gletcher_worker;

-- Backfill public mirror for rows created before this migration.
UPDATE public.staff_contact_leads AS p
SET
  workflow_status = a.workflow_status,
  assignee = a.assignee,
  staff_note = a.staff_note,
  updated_at = a.updated_at,
  updated_by = a.updated_by
FROM app.staff_contact_leads AS a
WHERE p.submission_id = a.submission_id;
