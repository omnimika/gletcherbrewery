# Спринты — перенос данных, кабинет, CRM и формы

Дата: **12.11.2026**. Проверен HEAD **4a4eb01** + рабочее дерево, second-front.
[Текущее задание](CURSOR_NEXT_STEPS.md), [ревью](reviews/2026-11-12-agent-crm-and-migration.md),
[промпт](CURSOR_REVIEW_PROMPT.md). Исторический public-gate план сохранён
[в архиве](archive/SPRINT_PLAN_pre_2026-11-09.md).

## Подтверждённый приоритет

Фокус владельца: перенос баз, приём/отправка данных, личный кабинет Agent,
CRM/admin и формы. Public/campaign sign-offs не блокируют этот поток.
Lead Google Sheets отменён ранее; новое задание его не возвращает.
Postbox/SMTP и мастер GTIN отложены владельцем; shop/spend UI тоже отложен.

## Состояние перед новым спринтом

| Срез | Статус на 12.11 | Что не следует из этого статуса |
|---|---|---|
| B1: PostgreSQL/Drizzle/Contacts/NocoDB | Local Done 09.11, прежнее evidence | Не весь current schema backup/restore |
| B2: Telegram outbox/worker | Implemented, прежняя live delivery отмечена Done | Crash/restart/fencing ещё имеют ошибки R01/R06 |
| B3: все формы + staff lead workflow | Implemented | Не production-ready RBAC/anti-abuse/concurrency |
| M1: retail/assortment/points/Mapbox CRM | Owner Accepted 10.11 | Не требуется повторный map redesign |
| M2-0: Airtable/Make/policies | Inventory 10–11.11 | Не свежий export и не полностью известные Collabza writers |
| M2-1: ledger/QR/OCR/manual/auth | Spike implemented | Нет row-level persisted migration evidence |
| /members/lk + agent application | Часть в HEAD, task-first/UI/0012/API в рабочем дереве | Staff agent workflow и итог для member не закрыты |
| /about | Code implemented, visual acceptance Open | Stage4 не объявляется Done |

Тесты Codex12.11: 77 unit PASS; tsc FAIL; lint FAIL. Build/DB/live/browser
не запускались. Полная детализация и приоритеты R01–R12 — в ревью.

## Очередь — Proposed implementation, не фиктивная дата завершения

| Sprint | Конкретный результат | Gate |
|---|---|---|
| **M2-2 — текущий** | Надёжные worker/auth/receipt/CRM tx, узкие DB roles, зелёные проверки | R01–R07; real DB concurrency/negative grants tests; без Postbox |
| **M2-3** | Замкнутые member↔staff процессы agent applications и чеков | Queue/detail/photo, audited decision, member result, isolation/retry |
| **M2-4A** | Семь source tables → staging → domain import, resume/idempotency | Synthetic row-level PostgreSQL rehearsal, mapping/quarantine, повтор без дублей |
| **M2-4B** | Поучастниковая сверка + полный restore DB/files/roles | Независимые sums/counts/links, available≠lifetime, нет необъяснённых расхождений |
| **M2-5** | Protected staging, staff identity, delivery/operational acceptance | Test targets, наблюдаемость, email onboarding после owner возврата к Postbox |
| Cutover proposal | Конкретный batch/final delta/freeze/rollback | Отдельное явное разрешение перед production действиями |

M2-4A/B — один поток миграции с двумя проверяемыми результатами; не добавлять
ещё один бесконечный discovery. Manifest/fixtures готовить параллельно M2-2.
Shared schema/grants менять последовательно либо в согласованных worktrees.

## M2-2 — следующий спринт

Подробное задание: [CURSOR_NEXT_STEPS](CURSOR_NEXT_STEPS.md).
Приоритет — исправление R01–R05 P1, затем связанные concurrency/adapter дефекты
R06/R07 в том же data path. Не ограничиться lint или косметикой кабинета.

Recovery и fencing вводить вместе. Revoke existing grants и narrow defaults —
разные операции; обновить bootstrap и upgrade migration. Worker использует
свою DB роль. Magic-link consume/session и receipt verdict/ledger/audit атомарны.
Staff patches/replay не перетирают параллельные операции.

Приёмка на отдельной synthetic PG: restart/expired lease/stale ack,
approve-vs-reject, concurrent token use и rollback, role-negative tests,
CRM parallel patches/replay. Build/typecheck/lint/unit/integration/smoke.
Stage/live credentials не требуются, outbound adapters в tests — fake HTTP.

## M2-3 — рабочий кабинет и работа менеджера

[Контракт](backend/AGENT_CRM_WORKFLOWS.md). Agent application submission уже есть:
не создавать заново ещё одну форму/копию lead. Закончить staff list/detail/
pagination/status mapping/audit и member status history, DB invariant открытой
заявки. Source девять статусов не терять; approve не равен agent earn.

Receipt review получает authenticated photo preview и доказательство решения.
Member видит pending/approved/rejected и настоящие начисленные баллы. Никаких
прямых balance writes из NocoDB. Публичные leads имеют pagination/filter/search,
чтобы старые заявки не пропадали за limit100. Referral «1%» не обещать до backend.

Приёмка: один синтетический member отправляет заявку и фото чека; менеджер
обрабатывает оба; member видит решения и один earn. Member B не видит данные A;
retries/конфликт/DB failure не создают дублей и не теряют ввод.

## M2-4 — перенос и сверка

[Детальное задание](data/LOYALTY_MIGRATION_PLAN.md).
Сначала synthetic linked rows в isolated PG, затем защищённый обезличенный
snapshot при соответствующем доступе. Source table/record/batch mapping,
normalization collisions/orphans, attachments, статусы и история сохранены.

Пересчитывать target available/lifetime из сохранённых ledger rows; source
targets получать независимо. Старые начисления не пересчитывать новой ставкой.
Owner legacy verified policy привязать к одобренному набору/срезу, не ко всем
будущим НЕТ. Opening и полный earn/spend не складываются дважды.

Backup/restore — вся текущая схема и фото, staff audit, jobs, constraints/grants;
не B1-only table list. Не запускать restored outbox в live targets. Checksum/lock
миграционного runner; уже применённые SQL не переписывать. ADR0011 остаётся
Proposed до реальной row-level сверки и restore evidence.

## M2-5 — готовность эксплуатации

Перед shared staging: отдельные environments/credentials, staff identity/
permissions, закрытые NocoDB и private photos, bounded uploads/OCR/rate limits,
health/queue age/failed/ambiguous visibility и replay runbook.

Postbox credentials/текст письма/отправитель — после возвращения владельца к
задаче. Тогда durable email job + наблюдаемая отправка в test mailbox, token TTL,
повторы и честные ошибки. Не называть debug link работающей email доставкой.
Мастер GTIN/ФНС улучшают matcher, но manual staff путь уже работает без них.

## Cutover — отдельное решение

Согласованные source batch и mapping, delta/freeze/writers register, identity
onboarding, backup/restore, one-writer rule, reconciliation и rollback.
Collabza #4/#11/#16 и Bipium должны иметь решение keep/replace/retire.
Не прекращать production writers и не делать двухстороннюю финансовую sync
по умолчанию. Production import/auth/DNS/рассылки/платные ресурсы требуют
конкретного разрешения. Commit/push — по запросу.

## Остальной backlog

/about parity/acceptance, campaigns/legacy SEO, CMS/Puck, новые локали и
экскурсии/платежи/сертификаты сохраняются. Они не подменяют ближайший data sprint.
Не открывать checkout/магазин или новые sr/hy/ka/de без отдельного решения.
