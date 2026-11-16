# B1 runbook — local PostgreSQL + NocoDB + Contacts intake

Дата: **09.11.2026**. Non-production only. Secrets live in `.env.local` (never Git).

## Граница этого runbook — уточнение12.11

Это исторический verified **local B1** путь; не общий доказанный restore/M2
runbook. Все публичные form variants/staff leads уже подключены, M1 принят,
кабинет /members/lk и loyalty spike добавлены.
Текущий [M2-2](../CURSOR_NEXT_STEPS.md) исправляет worker/roles/auth/receipt races;
[миграция](../data/LOYALTY_MIGRATION_PLAN.md) требует полного restore.

Не запускать db:embedded/restore/integration автоматически в рабочей среде
пользователя: bootstrap меняет локальные env/DB; integration пишет в DATABASE_URL.
Для новых тестов — отдельная synthetic test DB и credentials, без live delivery.
db:restore-check сейчас копирует только B1 таблицы; PASS не доказывает сохранность
loyalty/retail/audit/private photos. Worker runner ещё использует app DATABASE_URL,
изоляция worker role — задача R02, не выполненный факт этой инструкции.

## Topology (verified B1)

| Component | Local choice |
|---|---|
| PostgreSQL 17 | `embedded-postgres` on `127.0.0.1:${PGPORT}` (default **54329**) |
| Business DB | `gletcher_business` |
| NocoDB metadata | SQLite under `.tmp/nocodb-data` (isolated); optional `NC_DB` → `nocodb_meta` |
| NocoDB UI | `http://127.0.0.1:8080` — package `nocodb@0.301.2` via `scripts/nocodb-serve.mjs` |
| Next.js | `npm run dev` with `.env.local` |

Docker Compose (`infra/docker-compose.yml`) remains the alternate path when Docker is available. Homebrew/conda PG installs are optional; this machine uses embedded binaries.

## Roles

`gletcher_migrator` (DDL), `gletcher_app` (intake DML), `gletcher_nocodb` (**SELECT** on staff leads only), `gletcher_worker` (B2).

## Start sequence

```sh
# Node must satisfy package.json engines (^20.19 / ^22.13 / >=24)
nvm use 22

# 1) PostgreSQL + roles + migrations (keeps process alive)
npm run db:embedded

# 2) NocoDB (separate terminal; do not inherit DATABASE_URL)
npm run nocodb:dev

# 3) App
npm run dev
```

`.env.local` is rewritten by `db:embedded` with `DATABASE_URL`, `MIGRATION_DATABASE_URL`, `NOCODB_*`, `PGPORT`.

## Staff view in NocoDB

1. Open `http://127.0.0.1:8080`, create/sign-in staff account (local only).
2. Add external data source → PostgreSQL `gletcher_business` as `gletcher_nocodb` (read-only).
3. Expose table/view `staff_contact_leads` (public mirror and/or `app.staff_contact_leads`).
4. Confirm `is_schema_readonly` / `is_data_readonly`. Outbox tables must not be writable by this role.

## Checks

```sh
npm run test:unit
npm run test:integration   # requires DATABASE_URL
npm run db:restore-check   # logical dump/restore via scripts/db-restore-check.mjs
npm run b1:smoke           # Contacts API → public.staff_contact_leads + grant checks
npm run typecheck && npm run lint && npm run build
```

## Staff triage (`/staff`)

1. Set `STAFF_API_TOKEN` (≥16 chars) in `.env.local`, restart Next.
2. Open `http://localhost:3000/staff`, paste token, set actor name.
3. Change workflow status / assignee / note; replay failed Telegram jobs from lead detail.
4. NocoDB remains read-only for leads; audit lives in `app.staff_lead_events`.

## B1 boundary

Accepted status after DB commit only. Telegram delivery is **B2** (Sheets cancelled).
B3 forms + staff triage are available on this stack. No production writers/DNS/cutover
in this runbook.
