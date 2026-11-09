-- B1 non-prod roles. Dev passwords are local-only placeholders — never production.
-- Databases are created by scripts/db-bootstrap.sh (CREATE DATABASE cannot run in DO).

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gletcher_migrator') THEN
    CREATE ROLE gletcher_migrator LOGIN PASSWORD 'gletcher_migrator_dev';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gletcher_app') THEN
    CREATE ROLE gletcher_app LOGIN PASSWORD 'gletcher_app_dev';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gletcher_nocodb') THEN
    CREATE ROLE gletcher_nocodb LOGIN PASSWORD 'gletcher_nocodb_dev';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gletcher_worker') THEN
    CREATE ROLE gletcher_worker LOGIN PASSWORD 'gletcher_worker_dev';
  END IF;
END
$$;
