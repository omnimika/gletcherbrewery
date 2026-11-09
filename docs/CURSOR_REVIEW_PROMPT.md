# Промпт Cursor — B1: данные и первая работающая форма

Дата: **09.11.2026**. [Задание](CURSOR_NEXT_STEPS.md),
[план](SPRINT_PLAN.md), [ревью](reviews/2026-11-09-data-and-forms.md).

~~~text
Продолжи gletcherbrewery: новый Confirmed приоритет владельца — перенос баз
и рабочий приём/доставка форм в Telegram bot, CRM/admin и Google Sheets.
Сейчас выполни B1: PostgreSQL + NocoDB + первая contact форма.
Прочитай:
@AGENTS.md
@docs/ROADMAP.md
@docs/CURSOR_NEXT_STEPS.md
@docs/SPRINT_PLAN.md
@docs/reviews/2026-11-09-data-and-forms.md
@docs/backend/FORMS_DATA_PIPELINE.md
@docs/data/SOURCE_INVENTORY.md
@docs/adr/0002-database.md
@docs/adr/0007-background-jobs.md
@docs/discovery/INTEGRATIONS_AUDIT.md
@docs/adr/0001-i18n-routing-and-content.md

Проверь actual status/diff/log: baseline2095221, second-front, на ревью чисто.
Сохрани чужие изменения. Q1-Q3 и code A1 уже реализованы; старый campaign/
public exit gate не блокирует B1 по новому прямому указанию. Визуал /about
остаётся Open; не делай фронтенд заново и не объявляй Stage4 Done.

Дай краткий план с DoD. Короткий B0 входит в B1: уточни source/destination/
consent contracts, ORM/driver ADR0003, pinned PG/NocoDB edition/version,
dev/staging topology. Используй уже известный Airtable schema snapshot;
не invent формулы/данные. Auth=Tilda Members, Collabza=transport.
Упомянутые старые Mapbox audit/model/data exports сейчас отсутствуют.

Выполни non-prod фундамент, миграции/roles/restore и Contacts RU:
server schema/validation/limits/idempotency -> одна PG transaction
(submission+consent+outbox) -> accepted с ID после commit ->
private read-only staff NocoDB view. У NocoDB отдельная metadata DB.
Проверь реально доступные external PG/permissions, не предполагай enterprise
features free и не давай UI доступ менять business schema/outbox/ledger.

Не делай три независимые записи из frontend. Telegram/Sheets — B2 worker,
со stable IDs, independent retries и reconciliation. В B1 подготовь
adapter/job contracts/tests; mocks не называй реальной доставкой.
Известная Google retail Sheet не становится lead Sheet. Destination IDs,
PII allowlist и секреты задаются отдельно, server-only. Newsletter purpose
и tours booking не смешивай с contact lead.

Проверь DB failure/retry/concurrency/changed-body conflict, validation,
grant boundaries, сохранение ввода, реальный staff view и restore.
Свежие unit/integration/e2e + lint/typecheck/build/local browser. Обнови
docs конкретными командами/evidence/Open реквизитами. Недостающие credentials
не должны останавливать независимую подготовку; не заявляй unrun PASS.

Следом B2 Telegram+Sheets sandbox E2E, B3 остальные формы, M1/M2 миграционные
репетиции. Production записи/import/cutover/legacy writers/auth/DNS и
commit/push не выполнять без отдельного задания. Не ставь CMS/Redis/full
booking/loyalty ради первой формы. Docs ignored — подготовь safe-file list
для будущей передачи, без staging сейчас.
~~~
