-- NocoDB 0.301 meta-sync discovers public schema by default for this connection.
-- Keep durable business tables in app.*; expose staff projection in public for CRM.

CREATE TABLE IF NOT EXISTS public.staff_contact_leads (
  submission_id uuid PRIMARY KEY,
  form_id text NOT NULL,
  locale text NOT NULL,
  source_path text NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL,
  name text,
  email text,
  phone text,
  city text,
  company text,
  comment text
);

INSERT INTO public.staff_contact_leads
SELECT * FROM app.staff_contact_leads
ON CONFLICT (submission_id) DO NOTHING;

-- Keep app copy as internal; public is the staff CRM surface.
GRANT SELECT ON TABLE public.staff_contact_leads TO gletcher_nocodb;
GRANT SELECT, INSERT, UPDATE ON TABLE public.staff_contact_leads TO gletcher_app;
REVOKE ALL ON TABLE public.staff_contact_leads FROM PUBLIC;

-- Ensure nocodb cannot see app internals even if search_path expands
REVOKE ALL ON TABLE app.form_submissions FROM gletcher_nocodb;
REVOKE ALL ON TABLE app.submission_consents FROM gletcher_nocodb;
REVOKE ALL ON TABLE app.delivery_jobs FROM gletcher_nocodb;
REVOKE ALL ON TABLE app.delivery_attempts FROM gletcher_nocodb;
REVOKE ALL ON TABLE app.staff_contact_leads FROM gletcher_nocodb;

-- Prefer public for unqualified names. May require superuser; skip on restore DBs.
DO $$
BEGIN
  ALTER ROLE gletcher_nocodb SET search_path TO public;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'skip ALTER ROLE gletcher_nocodb search_path (insufficient_privilege)';
  WHEN undefined_object THEN
    RAISE NOTICE 'skip ALTER ROLE gletcher_nocodb search_path (role missing)';
END $$;
