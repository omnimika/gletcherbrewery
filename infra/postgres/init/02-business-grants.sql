-- Run against gletcher_business after roles exist.
-- Migrator owns schema `app`. Table grants live in versioned migrations
-- (see drizzle/0013_role_least_privilege.sql). Bootstrap must NOT auto-grant
-- SELECT/INSERT/UPDATE on all future tables to app/worker (R02).

CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION gletcher_migrator;

GRANT USAGE ON SCHEMA app TO gletcher_app, gletcher_nocodb, gletcher_worker;

-- Clear any previous broad defaults from older bootstrap runs.
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

-- Sequences only for app inserts. New tables still require explicit GRANT in migrations.
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  GRANT USAGE, SELECT ON SEQUENCES TO gletcher_app;

-- NocoDB: no default table privileges. Explicit SELECT on staff leads in migrations.
