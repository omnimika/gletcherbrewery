#!/usr/bin/env bash
# Start NocoDB against local nocodb_meta PostgreSQL (no Docker required).
# After start: create staff user, add external data source gletcher_business
# with role gletcher_nocodb, expose view app.staff_contact_leads as read-only.
set -euo pipefail

export NC_DB="${NC_DB:-pg://gletcher_migrator:gletcher_migrator_dev@127.0.0.1:5432?d=nocodb_meta}"
export NC_AUTH_JWT_SECRET="${NC_AUTH_JWT_SECRET:-dev_only_change_me_not_for_prod}"
export NC_PUBLIC_URL="${NC_PUBLIC_URL:-http://localhost:8080}"
export PORT="${PORT:-8080}"

echo "NocoDB meta: ${NC_DB%%@*}@…"
echo "UI: ${NC_PUBLIC_URL}"
echo "Connect external PG: postgres://gletcher_nocodb:***@127.0.0.1:5432/gletcher_business"
echo "Staff view: app.staff_contact_leads (SELECT only)"

# Prefer local package + wrapper (npx bin resolution is flaky for nocodb).
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export NC_TOOL_DIR="${NC_TOOL_DIR:-$ROOT/.tmp/nocodb-data}"
mkdir -p "$NC_TOOL_DIR"
# Do not inherit app DATABASE_URL into NocoDB process.
unset DATABASE_URL MIGRATION_DATABASE_URL NOCODB_DATABASE_URL
# Optional: PG meta when NC_DB is set; otherwise SQLite under NC_TOOL_DIR.
exec node "$ROOT/scripts/nocodb-serve.mjs"
