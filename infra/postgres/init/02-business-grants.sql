-- Run against gletcher_business after migrations created schema `app`.
-- Migrator owns objects; app/worker/nocodb get least privilege.

CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION gletcher_migrator;

GRANT USAGE ON SCHEMA app TO gletcher_app, gletcher_nocodb, gletcher_worker;

-- Default privileges for future migrator-owned tables
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  GRANT SELECT, INSERT, UPDATE ON TABLES TO gletcher_app;
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO gletcher_app;

ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  GRANT SELECT, INSERT, UPDATE ON TABLES TO gletcher_worker;
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO gletcher_worker;

-- NocoDB must NOT receive default SELECT on all tables.
-- Explicit GRANT SELECT on app.staff_contact_leads is applied in migrations.
