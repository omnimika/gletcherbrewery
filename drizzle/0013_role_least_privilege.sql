-- M2-2 R02: least-privilege roles for existing + future objects.
-- Revokes broad default privileges; re-grants explicit table/column rights.
-- Ledger is append-only for gletcher_app (no UPDATE/DELETE).
-- Worker: delivery outbox + column-limited form_submissions payload only.
-- NocoDB: SELECT-only on staff lead projection (+ previously granted retail SELECTs).

-- ---------------------------------------------------------------------------
-- Stop auto-granting all future tables to app/worker
-- ---------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  REVOKE ALL ON TABLES FROM gletcher_app;
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  REVOKE ALL ON SEQUENCES FROM gletcher_app;
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  REVOKE ALL ON TABLES FROM gletcher_worker;
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  REVOKE ALL ON SEQUENCES FROM gletcher_worker;
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  REVOKE ALL ON TABLES FROM gletcher_nocodb;
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  REVOKE ALL ON SEQUENCES FROM gletcher_nocodb;

-- Sequences for app inserts only (no setval). New tables still need table GRANTs.
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  GRANT USAGE, SELECT ON SEQUENCES TO gletcher_app;

GRANT USAGE ON SCHEMA app TO gletcher_app, gletcher_nocodb, gletcher_worker;

-- ---------------------------------------------------------------------------
-- Wipe inherited privileges on all current app tables, then re-grant
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.relname AS tbl
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'app'
      AND c.relkind IN ('r', 'p')
      AND c.relname <> 'schema_migrations'
  LOOP
    EXECUTE format('REVOKE ALL ON TABLE app.%I FROM PUBLIC', r.tbl);
    EXECUTE format('REVOKE ALL ON TABLE app.%I FROM gletcher_app', r.tbl);
    EXECUTE format('REVOKE ALL ON TABLE app.%I FROM gletcher_worker', r.tbl);
    EXECUTE format('REVOKE ALL ON TABLE app.%I FROM gletcher_nocodb', r.tbl);
  END LOOP;
END $$;

-- Sequences currently in app
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.relname AS seq
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'app'
      AND c.relkind = 'S'
  LOOP
    EXECUTE format('REVOKE ALL ON SEQUENCE app.%I FROM PUBLIC', r.seq);
    EXECUTE format('REVOKE ALL ON SEQUENCE app.%I FROM gletcher_app', r.seq);
    EXECUTE format('REVOKE ALL ON SEQUENCE app.%I FROM gletcher_worker', r.seq);
    EXECUTE format('REVOKE ALL ON SEQUENCE app.%I FROM gletcher_nocodb', r.seq);
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE app.%I TO gletcher_app', r.seq);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Forms / outbox / staff CRM
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON TABLE app.form_submissions TO gletcher_app;
GRANT SELECT, INSERT, UPDATE ON TABLE app.submission_consents TO gletcher_app;
GRANT SELECT, INSERT, UPDATE ON TABLE app.delivery_jobs TO gletcher_app;
GRANT SELECT, INSERT ON TABLE app.delivery_attempts TO gletcher_app;
GRANT SELECT, INSERT, UPDATE ON TABLE app.staff_contact_leads TO gletcher_app;
GRANT SELECT, INSERT ON TABLE app.staff_lead_events TO gletcher_app;

GRANT SELECT, UPDATE ON TABLE app.delivery_jobs TO gletcher_worker;
GRANT SELECT, INSERT ON TABLE app.delivery_attempts TO gletcher_worker;
-- Delivery payload only (no email columns beyond fields jsonb; no consent/PII tables).
GRANT SELECT (id, form_id, source_path, locale, fields)
  ON TABLE app.form_submissions TO gletcher_worker;

GRANT SELECT ON TABLE app.staff_contact_leads TO gletcher_nocodb;

-- public mirror used by NocoDB external source
GRANT SELECT ON TABLE public.staff_contact_leads TO gletcher_nocodb;
GRANT SELECT, INSERT, UPDATE ON TABLE public.staff_contact_leads TO gletcher_app;
REVOKE ALL ON TABLE public.staff_contact_leads FROM PUBLIC;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.staff_contact_leads FROM gletcher_nocodb;

-- ---------------------------------------------------------------------------
-- Retail (app DML; nocodb SELECT where already staff-facing; worker none)
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.retail_import_batches TO gletcher_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.retail_staging_rows TO gletcher_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.retail_chains TO gletcher_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.retail_chain_products TO gletcher_app;
GRANT SELECT, INSERT ON TABLE app.retail_assortment_events TO gletcher_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.retail_locations TO gletcher_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.retail_location_products TO gletcher_app;
GRANT SELECT, INSERT ON TABLE app.retail_tileset_publish_runs TO gletcher_app;

GRANT SELECT ON TABLE app.retail_import_batches TO gletcher_nocodb;
GRANT SELECT ON TABLE app.retail_staging_rows TO gletcher_nocodb;
GRANT SELECT ON TABLE app.retail_chains TO gletcher_nocodb;
GRANT SELECT ON TABLE app.retail_chain_products TO gletcher_nocodb;
GRANT SELECT ON TABLE app.retail_locations TO gletcher_nocodb;
GRANT SELECT ON TABLE app.retail_location_products TO gletcher_nocodb;

-- ---------------------------------------------------------------------------
-- Loyalty: app DML; ledger append-only; worker/nocodb denied
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON TABLE app.loyalty_members TO gletcher_app;
GRANT SELECT, INSERT, UPDATE ON TABLE app.loyalty_receipts TO gletcher_app;
GRANT SELECT, INSERT ON TABLE app.loyalty_ledger_entries TO gletcher_app;
-- Explicit deny even if a future default reappears:
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE app.loyalty_ledger_entries FROM gletcher_app;

GRANT SELECT, INSERT, UPDATE ON TABLE app.product_receipt_aliases TO gletcher_app;
GRANT SELECT, INSERT, UPDATE ON TABLE app.loyalty_agent_applications TO gletcher_app;
GRANT SELECT, INSERT, UPDATE ON TABLE app.loyalty_magic_link_tokens TO gletcher_app;
GRANT SELECT, INSERT, UPDATE ON TABLE app.loyalty_member_sessions TO gletcher_app;

-- schema_migrations: migrator only (already owned); ensure app/worker cannot alter
REVOKE ALL ON TABLE app.schema_migrations FROM gletcher_app;
REVOKE ALL ON TABLE app.schema_migrations FROM gletcher_worker;
REVOKE ALL ON TABLE app.schema_migrations FROM gletcher_nocodb;
