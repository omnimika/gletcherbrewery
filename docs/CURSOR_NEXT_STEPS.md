# Текущее задание Cursor — B2: delivery worker (после B1 Done)

Дата: **09.11.2026**. B1 closed на non-prod: embedded PG + NocoDB + Contacts intake.
Evidence: [reviews/2026-11-09-b1-evidence.md](reviews/2026-11-09-b1-evidence.md),
runbook: [backend/B1_RUNBOOK.md](backend/B1_RUNBOOK.md).

## B1 — Done

- PostgreSQL 17 (embedded) `gletcher_business` / roles / versioned SQL migrations
- Contacts RU → `POST /api/forms/submissions` → one transaction
  (submission + consent + outbox) with idempotency
- Private NocoDB staff source read-only on `staff_contact_leads`
- Unit/integration/restore/smoke + lint/typecheck/build PASS
- Telegram/Sheets **не** доставляются в B1 (adapters/contracts only)

## Выполнить сейчас — B2

Durable worker: lease/retry, independent destination status for **test** Telegram
bot/chat (и thread если нужен) + отдельный lead Google Sheet. Тот же
`submissionId` должен появиться в DB, NocoDB view, test chat и Sheet.
Reconciliation / poison / replay — часть DoD. Live credentials и Sheet schema —
owner Open; без них подготовить worker + fault tests и точный список реквизитов.

Не начинать M1/M2 production migration, cart/payments, Puck/CMS, Redis ради B2.
Stage-4 A1 visual / C1 campaigns — отдельный backlog, не blocker B2.

## Git

Commit/push только по запросу владельца. `/docs/` в `.gitignore` — локальные
docs обновлять точечно; не unignore raw export packs.
