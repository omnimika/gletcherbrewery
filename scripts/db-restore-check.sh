#!/usr/bin/env bash
# Prefer Node logical restore when pg_dump/psql are unavailable (embedded PG).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if ! command -v pg_dump >/dev/null 2>&1 || ! command -v psql >/dev/null 2>&1; then
  echo "==> pg_dump/psql missing — using scripts/db-restore-check.mjs"
  exec node "$ROOT/scripts/db-restore-check.mjs"
fi

PGHOST="${PGHOST:-127.0.0.1}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-$(whoami)}"
DUMP_DIR="${DUMP_DIR:-.tmp/pg-restore-check}"
STAMP="$(date +%Y%m%d%H%M%S)"
DUMP_FILE="${DUMP_DIR}/gletcher_business_${STAMP}.dump"
RESTORE_DB="gletcher_business_restore_${STAMP}"

mkdir -p "$DUMP_DIR"
export PGHOST PGPORT PGUSER

echo "==> dump gletcher_business -> ${DUMP_FILE}"
pg_dump -Fc -d gletcher_business -f "$DUMP_FILE"

echo "==> create ${RESTORE_DB}"
psql -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS ${RESTORE_DB}"
psql -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${RESTORE_DB} OWNER gletcher_migrator"

echo "==> restore"
pg_restore -d "$RESTORE_DB" --no-owner --role=gletcher_migrator "$DUMP_FILE" || true
psql -d "$RESTORE_DB" -v ON_ERROR_STOP=1 -c "SELECT COUNT(*) AS submissions FROM app.form_submissions;"
psql -d "$RESTORE_DB" -v ON_ERROR_STOP=1 -c "SELECT COUNT(*) AS view_rows FROM app.staff_contact_leads;"

echo "==> drop restore DB"
psql -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE ${RESTORE_DB}"

echo "Restore check OK (${DUMP_FILE})"
