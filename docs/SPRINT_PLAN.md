# Следующие спринты — данные, CRM и действующие формы

Дата: **09.11.2026**, проверен чистый **2095221**, second-front.
[Ревью](reviews/2026-11-09-data-and-forms.md), [текущее задание](CURSOR_NEXT_STEPS.md),
[form pipeline](backend/FORMS_DATA_PIPELINE.md), [источники](data/SOURCE_INVENTORY.md).
[История предыдущей очереди](archive/SPRINT_PLAN_pre_2026-11-09.md).

## Приоритет владельца — Confirmed 09.11

Далее концентрироваться на переносе баз и настоящем приёме/доставке форм в
Telegram bot и CRM/admin (NocoDB). **Lead Google Sheets отменён 09.11 (152-ФЗ).**
**Backend-поток начинается сейчас**:
старый C1/public-exit gate не блокирует B1. Stage 4 не объявляется Done,
/about visual acceptance и campaigns остаются отдельным backlog.

Q1–Q3 получили код; формы без false success, но всё ещё unavailable. /about
реализован RU-only/noindex с motion, sign-off Open. DS/home/blog заново не делать.
R05/R06 были исключены из Q1 по записи Cursor — не добавлять их в B1.

## Серия — Proposed implementation order

| Sprint | Проверяемый результат | Gate |
|---|---|---|
| **B1 — Done 09.11** | PostgreSQL + NocoDB + первая настоящая contact заявка | Durable submit, один record/outbox, private staff view, synthetic integration tests |
| **B2 — Done (Telegram)** | Worker → Telegram; Sheets cancelled (152-ФЗ) | submission ID в DB/NocoDB/Telegram group |
| **B3 — Done (intake)** | Остальные публичные формы → тот же API/outbox | partnership/horeca/catalog/tours/newsletter |
| **B3 staff — Implemented** | Triage/assign/note/replay + audit (`/staff`) | Shared `STAFF_API_TOKEN`; NocoDB остаётся read-only |
| **M1-0 — Done** | Location staging contract + synthetic import | anomaly report; no auto-dedup; no tileset publish |
| **M1-1 — Done** | Chain×SKU matrix from Sheet CSV → `/staff/map` | Catalog SKU names; audit; tileset publish still Proposed |
| **M1-2a — Done** | Catalog → `Product` token adapter + dry-run publish recipe | Live upload gated; tileset IDs still Open |
| **M1-2b / points — Accepted 10.11** | Live Mapbox upload + store-points CRM + `/map` polish | Owner accepted; map CRM closed for M2 gate |
| **M2 — текущий** | Репетиция Airtable/loyalty + Make/Collabza перехода | M2-0 Done 10.11 (schema/counts/paid-filter/Make map); M2-1 ADR 0011 Proposed + synthetic rehearsal; no production cutover |
| Cutover | Согласованное production переключение по подсистемам | Проверенные restore, final sync, explicit authorization и rollback |

Короткий B0 (sources/contracts/ORM/NocoDB spike) — первая часть B1, не отдельный
неограниченный архитектурный проект. Schema/экспорты legacy собирать параллельно
уже сейчас; полный разбор биркоинов не блокирует новую contact table.

## B1 — Done (09.11.2026)

Закрыт по DoD на non-prod: embedded PostgreSQL 17 + NocoDB 0.301.2 + Contacts
intake API. Evidence [2026-11-09-b1-evidence](reviews/2026-11-09-b1-evidence.md),
runbook [B1_RUNBOOK](backend/B1_RUNBOOK.md). ADR 0002/0003/0008 Accepted для
этого среза. Homebrew/Docker не обязательны на машине разработчика.

Живая доставка Telegram — **B2 Done**. Lead Sheets — **Cancelled**. Остальные
формы unavailable до B3. Puck/CMS/Redis / Members auth migration не входили в B1.

## B2 — доставка Telegram (Sheets cancelled)

Worker → Telegram в ту же группу заявок (own bot). CRM = PostgreSQL + NocoDB.
Секреты server-only; at-least-once / ambiguous policy для Telegram.
Lead Google Sheets **не реализуется** (owner Confirmed 09.11, 152-ФЗ).
Retail map spreadsheet остаётся отдельным read-only import source, не каналом лидов.

## B3 — остальные формы / CRM workflow

Catalog, partnership RU/EN, russian-craft-beer, horeca, tours-request подключать
маленькими типизированными variants к тому же intake. Newsletter home/blog —
отдельный marketing purpose и placement/locale, не общий B2B opt-in.
Tours lead не означает booked/paid. Админка: triage/status/assignment/audit и
контролируемый replay; права на outbox/ledger/schema не давать менеджеру.

При необходимости inbound Telegram commands — отдельный auth/conflict/audit
contract. Трёхсторонняя sync с Sheets не планируется.

## M1/M2 — перенос существующих данных

M1: retail Google Sheet/старые GeoJSON/CSV + необходимые справочники. Сначала
источники/schema/checksums и исходные строки; Product/Adress/SKU и geography,
assortment scope/dedup decisions сохранить. Не считать исторические 7784
доказанным текущим входным объёмом; отсутствующие audit/data files восстановить.

M2: семь Airtable tables + formulas/relations/attachments/history и все
Make/Collabza/Bipium writers. Auth — Tilda Members. Synthetic/обезличенная
репетиция, stable legacy IDs, counts/orphans/sums, контроль ledger/opening balance,
никакой выдуманной истории. Восстановление из backup и reconciliation отчёт
до предложения переключить хоть одного production writer.

Фактический production импорт, freeze/final sync, выключение legacy automations,
смена auth/tilesets/DNS/credentials — конкретные отдельные разрешённые действия.

## Сохранённый публичный backlog

/about history placeholders/gallery autoplay, owner acceptance A1 и /agent320;
campaign/legacy/SEO parity, unpublished/password Klin, новые локали. Они не
отменены и не объявлены принятыми, но по новому решению не блокируют B1/B2.
Без нового указания не публиковать скрытые страницы/языки и не включать checkout.

Для каждого спринта: code + meaningful tests + lint/typecheck/build + реальные
evidence/ограничения + review. Commit/push/production не выполнять автоматически.
