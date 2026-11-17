# ADR 0003 — ORM/driver и миграции (B1)

Дата: **09.11.2026**. Status: **Accepted** (B1: Drizzle + postgres.js + SQL
migrations verified — unit/integration/restore PASS).

## Решение

Для B1 использовать **Drizzle ORM** + драйвер **`postgres` (postgres.js)** и
**drizzle-kit** для versioned SQL migrations.

## Почему

- SQL-first, явные транзакции и unique constraints — нужны для idempotency/outbox.
- Лёгкий surface area: не тащит полный Prisma Client / generate cycle в Next route.
- Миграции — обычные SQL файлы под Git; application (роль migrator) владеет schema.
- Альтернатива Prisma: сильнее DX для больших моделей, тяжелее bootstrap и
  migrate ownership в multi-role PG. Альтернатива raw `pg` + hand-rolled migrator:
  меньше зависимостей, но хуже typed queries и drift. Выбрано среднее.

## Границы

- Только server-side (`src/server/**`, API routes). Никаких DB credentials в
  `NEXT_PUBLIC_*` или клиентском бандле.
- Первая schema: form submissions / consents / delivery outbox. Не полный
  user/loyalty/booking model.
- Pinned packages фиксируются в `package.json` / lockfile при установке B1.

## Связанные ADR

[0002-database](0002-database.md), [0007-background-jobs](0007-background-jobs.md),
[0008-hosting-dev](0008-hosting-dev.md).
