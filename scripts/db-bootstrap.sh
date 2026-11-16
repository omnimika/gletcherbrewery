#!/usr/bin/env bash
# Bootstrap non-prod PostgreSQL roles + databases for B1.
# Requires: psql, a running PostgreSQL 16/17, superuser access.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PSQL="${PSQL:-psql}"
PGHOST="${PGHOST:-127.0.0.1}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-$(whoami)}"

export PGHOST PGPORT PGUSER

echo "==> roles ($PGHOST:$PGPORT as $PGUSER)"
"$PSQL" -v ON_ERROR_STOP=1 -d postgres -f "$ROOT/infra/postgres/init/01-roles.sql"

create_db_if_missing() {
  local db="$1"
  local owner="$2"
  local exists
  exists="$("$PSQL" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${db}'")"
  if [[ "$exists" != "1" ]]; then
    echo "==> create database ${db} owner ${owner}"
    "$PSQL" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${db} OWNER ${owner}"
  else
    echo "==> database ${db} already exists"
  fi
}

create_db_if_missing gletcher_business gletcher_migrator
create_db_if_missing nocodb_meta gletcher_migrator

"$PSQL" -d postgres -v ON_ERROR_STOP=1 -c \
  "GRANT CONNECT ON DATABASE gletcher_business TO gletcher_app, gletcher_nocodb, gletcher_worker;"

echo "==> schema + default privileges on gletcher_business"
"$PSQL" -v ON_ERROR_STOP=1 -d gletcher_business \
  -f "$ROOT/infra/postgres/init/02-business-grants.sql"

echo "Bootstrap OK. Next: npm run db:migrate"
