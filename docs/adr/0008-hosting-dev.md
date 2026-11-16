# ADR 0008 — Dev/staging topology (B1 slice)

Дата: **09.11.2026**. Status: **Accepted** для local non-prod B1 topology
(verified). Yandex Cloud как production/staging target остаётся Confirmed в
ROADMAP; платные ресурсы и cutover не входят в B1.

## Dev topology (B1)

| Компонент | Non-prod выбор | Примечание |
|---|---|---|
| PostgreSQL | **17.x** via `embedded-postgres` (default port **54329**) или Homebrew/Compose | Business DB `gletcher_business`; optional `nocodb_meta` |
| NocoDB | Self-hosted **0.301.2** (`scripts/nocodb-serve.mjs` / Compose image) | Local meta: SQLite `.tmp/nocodb-data` **or** PG `nocodb_meta`; business — external read-only source |
| Next.js app | Local `npm run dev` | Intake API на том же process; worker — отдельно в B2 |
| Secrets | `.env.local` / secret store refs | Значения не в Git; см. `.env.example` |

## Роли PostgreSQL

| Role | Назначение | Grants (минимум) |
|---|---|---|
| `gletcher_migrator` | DDL / migrations | OWN schema `app`, CREATE |
| `gletcher_app` | Next.js intake | DML на submissions/consents/outbox insert |
| `gletcher_nocodb` | NocoDB external source | **SELECT** на staff view / lead columns only |
| `gletcher_worker` | B2 delivery worker | DML на `delivery_jobs` / `delivery_attempts` |

Schema edit из NocoDB UI — выключен. Staff account — private, первый view
read-only. Public frontend не получает PG/NocoDB service tokens.

## Проверка границ M2 (12.11)

Матрица выше — требуемая ответственность. Runtime runner worker пока использует
DATABASE_URL приложения, default grants чрезмерно широки. До расширения доступа
реализовать R02: отдельное connection config, explicit grants/revokes для текущих
и будущих таблиц, реальные negative tests; не считать имя роли доказанной изоляцией.
[Ревью](../reviews/2026-11-12-agent-crm-and-migration.md).
Local receipt storage .tmp требует отдельного backup; production private
Object Storage/staff auth/worker supervision — staging шаг, не выполненный B1.

## Compose

`infra/docker-compose.yml` — воспроизводимый путь при наличии Docker.
На машине без Docker допустим Homebrew/conda + `scripts/db-bootstrap.sh` с той
же schema/roles. DoD требует реального запуска, не только файла Compose.

## Staging / production

Staging: Managed PostgreSQL + контейнеры на Yandex Cloud — отдельный ADR update
после оценки стоимости. Production writers/DNS — отдельные задания.
