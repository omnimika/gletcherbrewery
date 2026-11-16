# Реестр архитектурных решений

Статус `Proposed` описывает предложение, не принятое окончательное решение.
Допуск к конкретной реализации определяется текущим заданием/инструкцией
владельца: reviewable реализация допускает проверку Proposed values; DS-1/DS-2
уже реализованы; приоритет12.11 — data/CRM/member workflows и перенос M2.
ADR 0002/0003/0008 — **Accepted** для B1 non-prod (09.11), 0007 — **Accepted**
для Telegram slice. Это решения, а не гарантия отсутствия дефектов:
[ревью12.11](../reviews/2026-11-12-agent-crm-and-migration.md).
`Confirmed` — только явно утверждённые части.

| Файл | Область | Статус |
|---|---|---|
| [0000-frontend-bootstrap.md](0000-frontend-bootstrap.md) | Заказанный Next.js/TS/Tailwind/npm стек | Confirmed |
| [0000-site-migration-strategy.md](0000-site-migration-strategy.md) | Общие шаблоны и порядок переноса | Proposed |
| [0001-i18n-routing-and-content.md](0001-i18n-routing-and-content.md) | URL, переводы, публикация и SEO | **Accepted** |
| [0002-database.md](0002-database.md) | PostgreSQL/NocoDB, roles/schema/first lead | **Accepted** (B1 non-prod) |
| [0003-orm-and-migrations.md](0003-orm-and-migrations.md) | Drizzle + postgres.js + SQL migrations | **Accepted** (B1) |
| [0007-background-jobs.md](0007-background-jobs.md) | Durable outbox/worker, Telegram; Sheets Cancelled | **Accepted** (Telegram slice); recovery/fencing fixes M2-2 |
| [0008-hosting-dev.md](0008-hosting-dev.md) | Local non-prod topology | **Accepted** (B1); YC staging Open |
| [0005-cms.md](0005-cms.md) | Rich-content / Puck / Tilda block map | **Proposed** (editor preference Confirmed) |
| [0010-design-system-and-section-layout.md](0010-design-system-and-section-layout.md) | Design tokens, секции/сетка/anchors/UI/state/motion | **Direction Confirmed**; DS-1/DS-2 implemented, rollout reviewable |
| [0011-loyalty-ledger.md](0011-loyalty-ledger.md) | «Агент Глетчер» ledger, QR-verify, legacy→ДА | **Proposed** (policies Confirmed10–11.11; row-level import/restore Open) |

Два исторических файла с префиксом `0000` сохранены по существующим путям.
В ссылках использовать полное имя файла.
`0001` — i18n; `0002` — Database; `0003` — ORM; `0005` — CMS; `0007` — jobs;
`0008` — hosting/dev; `0010` — design system; `0011` — loyalty ledger.
Не использовать эти номера повторно.

Auth ADR0004 и update staging ADR0008 оформляются перед shared staging; Drizzle/local PG/outbox не переизбирать.
Установка Puck/CMS отложена до CRM-этапа; публичный рендерер блоков — раньше.
