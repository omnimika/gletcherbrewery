-- B1 non-prod bootstrap. Idempotent-ish for local re-runs.
-- Run as a superuser (local brew/conda postgres / compose entrypoint).

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

SELECT 'CREATE DATABASE gletcher_business OWNER gletcher_migrator'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gletcher_business')\gexec

SELECT 'CREATE DATABASE nocodb_meta OWNER gletcher_migrator'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nocodb_meta')\gexec

GRANT CONNECT ON DATABASE gletcher_business TO gletcher_app, gletcher_nocodb, gletcher_worker;
GRANT CONNECT ON DATABASE nocodb_meta TO gletcher_migrator;
