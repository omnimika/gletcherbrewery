# Реестр архитектурных решений

Статус `Proposed` описывает предложение, не принятое окончательное решение.
Допуск к конкретной реализации определяется текущим заданием/инструкцией
владельца: reviewable реализация допускает проверку Proposed values; DS-1/DS-2
уже реализованы; приоритет09.11 — B1 данные/формы, затем B2 доставка.
ADR 0002/0003/0008 — **Accepted** для B1 non-prod (09.11). ADR 0007 остаётся
Proposed до live B2 delivery. `Confirmed` — только явно утверждённые части.

| Файл | Область | Статус |
|---|---|---|
| [0000-frontend-bootstrap.md](0000-frontend-bootstrap.md) | Заказанный Next.js/TS/Tailwind/npm стек | Confirmed |
| [0000-site-migration-strategy.md](0000-site-migration-strategy.md) | Общие шаблоны и порядок переноса | Proposed |
| [0001-i18n-routing-and-content.md](0001-i18n-routing-and-content.md) | URL, переводы, публикация и SEO | **Accepted** |
| [0002-database.md](0002-database.md) | PostgreSQL/NocoDB, roles/schema/first lead | **Accepted** (B1 non-prod) |
| [0003-orm-and-migrations.md](0003-orm-and-migrations.md) | Drizzle + postgres.js + SQL migrations | **Accepted** (B1) |
| [0007-background-jobs.md](0007-background-jobs.md) | Durable outbox/worker, Telegram/Sheets | Proposed B2 |
| [0008-hosting-dev.md](0008-hosting-dev.md) | Local non-prod topology | **Accepted** (B1); YC staging Open |
| [0005-cms.md](0005-cms.md) | Rich-content / Puck / Tilda block map | **Proposed** (editor preference Confirmed) |
| [0010-design-system-and-section-layout.md](0010-design-system-and-section-layout.md) | Design tokens, секции/сетка/anchors/UI/state/motion | **Direction Confirmed**; DS-1/DS-2 implemented, rollout reviewable |
| [0011-loyalty-ledger.md](0011-loyalty-ledger.md) | «Агент Глетчер» ledger, QR-verify, legacy→ДА | **Proposed** (policies Confirmed 10.11; rehearsal Open) |

Два исторических файла с префиксом `0000` сохранены по существующим путям.
В ссылках использовать полное имя файла.
`0001` — i18n; `0002` — Database; `0003` — ORM; `0005` — CMS; `0007` — jobs;
`0008` — hosting/dev; `0010` — design system; `0011` — loyalty ledger.
Не использовать эти номера повторно.

Backend/hosting ADR оформляются при приближении соответствующего этапа.
Установка Puck/CMS отложена до CRM-этапа; публичный рендерер блоков — раньше.
