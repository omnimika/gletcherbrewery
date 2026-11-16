# Gletcher Brewery — AGENTS.md

> Версия: 0.16 (16 ноября 2026 г.)
> Назначение: единые постоянные инструкции для Cursor Agent и OpenAI Codex.  
> Подробный план реализации: `docs/ROADMAP.md` (локальный; см. `docs/README.md`).  
> **Не считать этот документ подтверждением неизвестных деталей исходной системы.**

## 1. Цель проекта

Воссоздать действующий сайт https://www.gletcherbrewery.com на **Next.js + TypeScript + Tailwind CSS**, сохранив его контент, пользовательские сценарии, существующие публичные URL и критичные данные. Последовательно заменить зависимости от Tilda, Collabza, Airtable, Make.com и YCLIENTS собственными сервисами и интеграциями.

Это **поэтапная миграция действующего бизнеса**, а не создание нового сайта с нуля по приблизительным макетам. Существующий сайт до согласованного переключения остаётся рабочим и является функциональным ориентиром, но его данные и публичный текст не всегда отражают актуальные бизнес-правила.

### Зафиксировано владельцем проекта

- Frontend/full-stack: Next.js, TypeScript, Tailwind CSS.
- Приоритет подтверждён 12.11: перенос баз, работающий обмен данными,
  личный кабинет «Агент», CRM/admin и формы → PostgreSQL/NocoDB/Telegram.
  Lead Google Sheets отменён ранее владельцем; не возвращать его в план.
  Public/campaign gate не блокирует data stream. Контракты:
  `docs/backend/FORMS_DATA_PIPELINE.md`, `docs/backend/AGENT_CRM_WORKFLOWS.md`.
- Owner deferrals из задания 11.11 сохраняются: Postbox/SMTP и GTIN export —
  позже; shop/spend UI отложен. Они не блокируют CRM, manual review и importer.
- /about обязателен вместе с анимацией и логикой source landing: Tilda page
  71867465, project 1212341. Задание/приёмка: `docs/discovery/ABOUT_PAGE_BASELINE.md`.
  Статичная упрощённая страница без исходного поведения не закрывает этот scope.
- Дизайн-код: презентационные композиции с адаптацией к ширине **и высоте** окна,
  якорями, мягким позиционированием, сетками 50/50 и 25/50/25 по обеим осям,
  cards 3/4/6, banners/carousels. Сохранить характер палитры/шрифтов/границ;
  общие компоненты, состояния и motion: `docs/design/DESIGN_SYSTEM.md`.
- MCP Tilda подключён в Cursor; владелец подтвердил доступ к исходникам страниц. Для анализа использовать read-only workflow `docs/discovery/TILDA_MCP_WORKFLOW.md`, различая редакторскую и опубликованную версии.
- Хостинг и инфраструктура: **Yandex Cloud**.
- Замена Airtable: **NocoDB обязателен**; репозиторий: https://github.com/nocodb/nocodb.
- Требуется мигрировать участников и историю бонусной программы **«Агент Глетчер»** из Airtable.
- Требуется заменить онлайн-запись на экскурсии от **YCLIENTS** и интегрировать эквайринг **ЮMoney/ЮKassa** (конкретный платёжный продукт и действующий мерчант-аккаунт уточнить).
- Требуется автоматическая генерация подарочных сертификатов с отправкой по email.
- Существующая карта использует **Mapbox**; в новой системе нужна управляемая CRM/админ-панель для торговых сетей, точек и ассортимента, с последующим обновлением данных карты.
- Предпочтение MongoDB снято: **PostgreSQL рекомендована как базовая СУБД**, отдельная MongoDB не включена в архитектуру без доказанной необходимости.

### Что не подтверждено

- Полный свежий row-level export Airtable, все legacy writers и аномалии identity.
  Schema/aggregates 10.11 и status/level/prize formulas 11.11 уже исследованы;
  5%, email identity, legacy verification и P1 onboarding — Confirmed.
  Не переоткрывать принятые owner policies. Реестр: `docs/data/SOURCE_INVENTORY.md`.
- Актуальность и полнота production retail inputs, права/частота обновления.
  M1 map/CRM принят 10.11; старые отсутствующие файлы не блокируют его повторно.
- Полнота production Mapbox configuration и provenance legacy exports;
  текущие registry/import/publish adapters уже реализованы. Поле `Product`
  (singular) сохранять по действующему контракту.
- Текущие цены и условия всех типов экскурсий, политика возвратов, количество мест, правила сертификатов и налогово-правовая схема приёма платежей.
- Полнота экспорта Tilda, совпадение editor/published, права на экспорт и медиа, настройки домена, сценарии Make.com, данные YCLIENTS и Collabza. Подключённый MCP сам по себе этого не подтверждает.
- Production staff/member auth, CMS, YC staging/deploy/CI/CD. Drizzle/postgres.js,
  local PG/NocoDB и outbox ADR уже Accepted; magic-link пока spike.

**Не подменять неизвестные бизнес-правила предположениями.** Помечать решения как `Confirmed`, `Proposed`, `Open` в технической документации.

## 2. Роли AI-агентов

### Cursor Agent — ведущий разработчик
- Ведёт архитектуру и реализацию, создаёт код, тесты, миграции и документацию.
- Перед крупной задачей делает краткий план с зависимостями и критериями приёмки.
- Проверяет Git diff, запускает соответствующие проверки, предлагает коммиты.
- Не выполняет push, destructive operations, миграцию production или изменение боевых интеграций без явного разрешения.
- Рассматривает замечания Codex; применяет только подтверждённые исправления.

### OpenAI Codex — независимый ревьюер
- Ревью архитектуры, TypeScript, безопасности, скорости, доступности, совместимости и миграционной надёжности.
- Код приложения при стандартном ревью — **read-only**: читает файлы, тесты и staged/unstaged diff, возвращает замечания P0–P3 с файлами и строками. Если рабочее дерево чистое, явно указывает проверяемый commit и baseline.
- Владелец разрешил Codex редактировать `AGENTS.md`, `ROADMAP.md`, `README.md` и `docs/**`, включая `docs/discovery/**`, для ревью и передачи задач Cursor. Код приложения остаётся read-only; изменения документации не означают исправления кода или принятия Proposed-решений.
- Не устанавливает пакеты, не делает коммиты, push или миграции без отдельного задания. Для read-only проверки типов отключает incremental-кеш; build/dev запускает только в режиме, допускающем запись генерируемых файлов.

### Одновременная работа
- Не позволять двум агентам одновременно изменять одни и те же файлы.
- Для параллельной разработки с записью применять отдельные ветки/worktrees и явные границы задач.
- `main` — стабильная ветка; работа в `feature/*` и `fix/*`.

## 3. Базовая архитектура (предложение, требует проверки)

- Next.js App Router + TypeScript strict + Tailwind CSS.
- PostgreSQL — **source of truth** для пользователей, каталога, торговых точек, бонусных операций, заказов и записей на экскурсии.
- NocoDB self-hosted — административный табличный интерфейс над PostgreSQL, замена Airtable для сотрудников.
- Для NocoDB выделить **отдельную БД/схему для служебных данных**; бизнес-таблицы подключать как внешний источник по отдельным ограниченным учётным данным. Проверить применимость этого режима в выбранной версии/community edition.
- SQL-схему бизнес-системы создавать **версионируемыми миграциями** приложения; по умолчанию отключить правку её схемы из NocoDB.
- Бизнес-операции проводить через серверные сервисы/API Next.js или отдельный backend, если нагрузка это потребует. **Не** давать браузеру прямой доступ к NocoDB API-token или БД.
- NocoDB допускается для управления справочниками/редакционными данными, но **не для обхода** проверки платежей, бронирований, начисления/списания бонусов и контроля доступа.
- Mapbox GL JS — карта на frontend; PostgreSQL хранит торговые сети, точки, продукты и отношения ассортимента.
- Yandex Cloud: Managed PostgreSQL (production-кандидат), Compute Cloud/контейнеры для веб-приложения и NocoDB, Object Storage для файлов и PDF, Postbox для транзакционных писем. Окончательные параметры — после оценки нагрузки и стоимости.
- Drizzle + postgres.js/SQL migrations (ADR 0003), local topology (0008) и
  transactional outbox (0007) Accepted для существующего среза. Auth staff/member
  production и CMS — дальнейшие ADR; не выбирать ORM повторно.

## 4. Подсистемы

### 4.1. Публичный сайт
- Перенести страницы, компоненты, русскую/английскую локализацию (после инвентаризации), каталог сортов, блог, раздел партнёров, контакты, карту, экскурсии и «Агента Глетчер».
- Максимально сохранить URL, метаданные SEO, alt, canonical, sitemap, structured data и редиректы 301 для изменённых адресов.
- Сверять дизайн по исходному сайту, а не копировать неконтролируемо Tilda-HTML.
- Новый дизайн-код — целевое развитие исходного бренда. Screen sections растут
  по содержимому; статьи/legal/forms сохраняют reading flow. Native document
  scroll, opt-in proximity и reduced-motion; без whole-UI scale/scroll hijack.
- Поддерживать mobile-first, семантическую разметку, доступность, оптимизацию изображений и Core Web Vitals.
- Сохранить возрастные ограничения и юридические предупреждения; проверять применимое законодательство РФ и **не реализовывать онлайн-продажу алкоголя без отдельного юридического согласования**.
- i18n: сохранять RU URL без префикса и существующие EN URL; будущие `sr`/`hy`/`ka`/`de` остаются **Proposed** до согласования и публикации переводов. Язык, письменность и рынок — отдельные параметры; маршрут, переключатель и SEO используют только опубликованные версии. Контракт: `docs/adr/0001-i18n-routing-and-content.md`.

### 4.2. NocoDB / Airtable / «Агент Глетчер»
- Первым этапом зафиксировать экспорт структуры: таблицы, связи, поля, формулы, представления, attachment, automations, Make.com-сценарии.
- Сначала тестовая миграция в отдельном окружении; затем сверка количества записей и ключевых идентификаторов.
- **Формулы Airtable не считать автоматически перенесёнными**: переписать и проверить расчёты явно.
- Сохранить идентичность участников, статусы, исходные ID, историю начислений и списаний, если присутствует.
- Баланс бонусов проектировать на основе журнала транзакций (`ledger`), с идемпотентностью, аудитом и контролируемыми корректировками; не позволять ручное изменение баланса без журналирования.
- Перенос учётных данных/сессий Tilda Members выяснить отдельно; не предполагать,
  что пароли экспортируются. Collabza — data transport, не auth provider.
- До переключения сделать сверку, резервную копию, план отката и ограниченное по времени окно синхронизации.

### 4.3. Mapbox / торговые сети / CRM
- Исходная Google-таблица: https://docs.google.com/spreadsheets/d/1___r32NSbWCyvemCBmb3mVTckt549hz7zBHfcGks-6o/edit?gid=1425762822
- Использовать её как **референс для анализа**, не предполагая названия колонок до получения доступа.
- Предварительная модель: `retail_chains`, `retail_locations`, `products`, `location_products` (или `chain_products`, если источник описывает ассортимент на уровне сети), `data_imports`, `audit_events`.
- Проверить, что именно обозначает свойство `Products` в существующем Mapbox tileset/source-layer. Не менять формат без совместимости с фильтрами.
- Источник истины — PostgreSQL. Изменения сотрудники вносят через NocoDB или специально разработанный админ-интерфейс; веб-карта читает только опубликованные валидированные данные.
- Для небольших/часто меняющихся данных сначала оценить серверный GeoJSON API и Mapbox GL JS `GeoJSONSource`; при большом масштабе — Mapbox Tiling Service, batch/incremental updates и учёт задержек публикации/кэша.
- Не загружать Mapbox tileset при каждом сохранении ячейки. Нужны валидация координат, дедупликация, журнал импорта, статус публикации и откат.
- Никаких секретных Mapbox upload/write token в клиентском JavaScript.
- Исторические 12 retail sources / 7 784 строки не являются свежим batch.
  M1 принят 10.11; provenance старых отсутствующих exports сохраняется как
  отдельное ограничение, не повод повторять M1. Текущие sources/status:
  `docs/data/SOURCE_INVENTORY.md`.
- Для импорта поддерживать исторические поля `Type`, `Title`, `City`, `Adress`, `Product`, `Packing` и `Longitude`/`Latitude` либо GeoJSON `geometry.coordinates`. При экспорте в Mapbox использовать заранее утверждённый adapter/contract; не заменять `Product` на `Products` без сверки фронтенда.
- Не удалять дубликаты автоматически: одинаковые адреса и координаты могут относиться к разным брендам/отделам или отражать ошибки. Дедупликация только после ручной проверки с журналом решений.
- Координаты валидировать географически, а не только по диапазону ±180/±90; отдельные исходные строки содержат геокодирование Франции и Нидерландов.
- Учитывать, что список продуктов в импорте может быть сеть-уровневым ассортиментом, **не подтверждённым наличием в конкретном магазине**. Не обещать пользователям наличие товара без подтверждённого источника и даты проверки.
- Различия `Friday Avenue` vs `Friday Avenue APA` и аналогичных имен не сливать автоматически; согласовать таблицу соответствия каталога и ключи SKU.
- Для входного staging-файла сохранять оригинальную строку, source file, номер строки и batch ID; все преобразования должны быть трассируемыми и воспроизводимыми.

### 4.4. Экскурсии, эквайринг и сертификаты
- Отдельно моделировать тип экскурсии, ресурсы/вместимость, расписание, заявки, бронирования, удержание мест, платёж, возврат, сертификат, погашение и email-доставку.
- Поддержать управляемые условия групповых и VIP-экскурсий; **цены, проценты предоплаты и правила подтверждения не хардкодить до утверждения**.
- На стороне сервера проверять свободные места в транзакции; исключать двойное бронирование и повторную обработку webhooks.
- Для ЮKassa/ЮMoney использовать серверную инициацию, idempotence keys, проверку подлинности и актуального статуса платежа, журнал событий и обработку возвратов.
- PDF-сертификат генерировать после подтверждённой оплаты, с уникальным кодом/QR (по необходимости), сроком действия, статусом и защитой от повторного погашения.
- Хранить файлы в Object Storage; отправлять email фоновым повторяемым заданием, не теряя успешную оплату при ошибке SMTP.
- Проверить требования к чекам, персональным данным, условиям оферты и типам сертификатов до production.

### 4.5. CMS, контент и автоматизации
- Полноценный редактор блога и страницы каталога — отдельное архитектурное решение после инвентаризации контента. NocoDB не считать автоматической полноценной заменой rich-content CMS.
- Каждую Make.com-автоматизацию инвентаризировать: триггер, входные данные, действие, зависимости, ошибки, владельцы.
- Заменять сценарии серверными обработчиками/очередями/планировщиком **по одному**, с тестами и аудитом событий.

## 5. Безопасность и надёжность

- TypeScript `strict`, валидация всех внешних вводов, типизированные API-контракты.
- Разделять dev/staging/prod, использовать `.env.example`; реальные секреты только в секрет-хранилище/переменных окружения, никогда в Git.
- RBAC: публичный пользователь, участник программы, менеджер контента, редактор геоданных, менеджер экскурсий, администратор. Проверки прав — на сервере, не только в UI.
- Раздельные роли PostgreSQL для приложения, миграций, NocoDB и сервисных задач. Принцип минимальных привилегий.
- PII: минимизация, согласия, шифрование соединений, сроки хранения, логирование доступа, оценка требований 152-ФЗ.
- Бэкапы PostgreSQL и Object Storage, проверенное восстановление, аудит критичных изменений, мониторинг и алерты.
- При тестировании использовать синтетические данные; production PII не передавать в промпты агентов.
- Для финансовых и бонусных действий — идемпотентность, транзакции, запрет двойного списания, тесты конкурентного доступа.

## 6. Git, качество, работа с проектом

- Перед каждым заданием изучать `AGENTS.md`, `docs/ROADMAP.md` и уже принятые ADR; **не перескакивать через утверждённые этапы**.
- Не выполнять массовое создание кода, установку новых сервисов или миграции до согласованного этапа.
- Для новых зависимостей указывать причину выбора, альтернативы, поддержку и влияние на инфраструктуру.
- Организация кода по доменам; не смешивать UI, доступ к БД и расчётную бизнес-логику в одном файле.
- Для каждого изменения: критерии приёмки → код → тесты → lint/typecheck/build → краткий отчёт → review Codex → коммит.
- Для критичной логики нужны unit, integration и e2e тесты; проверять edge cases, отказ внешнего API, повторные webhooks, гонки и права доступа.
- Не удалять старые страницы/аккаунты/таблицы и не переключать DNS без отдельного плана отката.
- Документировать любые изменения архитектуры в `docs/adr/` как Architecture Decision Record.
– В случае необходимости, при наличии неопределенности в дальнейших действиях, рекомендуется задавать уточняющие вопросы пользователю, предлагая варианты действий и аргументацию.
- Локальные design skills (Impeccable, Taste, Emil Animation) и их hooks/lockfile —
  **gitignored**; не коммитить `.agents/`, `.cursor/skills|agents|hooks`,
  `.claude/skills|agents`, `.codex/`, `skills-lock.json`. Политика вызова:
  `docs/design/AGENT_DESIGN_SKILLS.md`. Они не входят в DoD data-stream и не
  перекрывают `DESIGN_SYSTEM` / Tilda baselines / текущий спринт M2.
- Partial ignore для `docs/`: публичны `adr/`, `design/`, `backend/`,
  `development.md`, discovery baselines; локальны ROADMAP/SPRINT/CURSOR_*,
  `reviews/`, `archive/`, `discovery/_raw/`, loyalty/FNS inventory и brand PDF.
  Карта: `docs/README.md`. Не коммитить локальные docs после untrack.

### 6.1. Design skills — когда читать

- **Не** подключать на M2 data/CRM/backend задачах по умолчанию.
- На явной UI/motion задаче: сначала `docs/design/DESIGN_SYSTEM.md` + baseline
  страницы; затем узкий skill (`animate` / `review-animations` / impeccable
  critique|polish|harden). Taste — только anti-slop review, не greenfield.
- Запрещено без запроса владельца: new-work redesign identity, смена палитры/
  сетки, scroll-hijack, whole-UI scale, установка альтернативного UI kit.
- CLI skills требует Node ≥22.20; для обычных npm-скриптов проекта см.
  `docs/development.md` (`engines.node`).

## 7. Текущий порядок работ Cursor Agent

**Owner Confirmed 12.11:** data/forms, кабинет Agent и CRM — главный поток.
Public acceptance и production cutover остаются отдельными решениями.

1. Ревью: HEAD `4a4eb01`, `second-front` + существующий незакоммиченный diff.
   Сохранять task-first `/agent/cabinet` (не `/members/lk`), agent application API/0012/schema/level.
   B1–B3 реализованы; M1 map/CRM Owner Accepted 10.11. Их не повторять.
2. M2-0 inventory/policies и M2-1 ledger/QR/OCR/manual/auth spike реализованы.
   **Production row-level snapshot / ADR0011 Accepted ещё Open.**
3. **M2-2 Done 16.11:** R01–R07 + quality baseline + public boundary. R01–R12:
   `docs/reviews/2026-11-12-agent-crm-and-migration.md`.
4. **M2-3 Done 16.11** + Pre-M2-4 tails. **M2-4 foundation Done 16.11**;
   **protected CSV batch Done 17.11** (`tmp/Airtable`, `Чеки-xls.csv`,
   cutoff=today, reconcile available/lifetime **212338** PASS). ADR0011 →
   Accepted после owner review. Дальше **M2-5** / cutover proposal.
5. `/agent/cabinet` — canonical RU кабинет; `/members/lk` только 301 → cabinet; `/agent/login` для входа.
   Postbox/GTIN/shop отложены; не обещать email delivery/referral earn без backend.
6. PostgreSQL source of truth; NocoDB read-only. Изменения бизнес-данных —
   серверные audited commands, не прямое редактирование ledger/баланса.
   ADR0002/0003/0007/0008 Accepted в указанном non-prod scope, не production readiness.
7. /about RU-only/noindex реализован с source motion; owner visual acceptance
   Open. Stage4 не закрывать автоматически.
8. Production import, legacy writers/auth/DNS/cutover, рассылки, commit/push —
   только отдельным разрешённым действием. Задание: `docs/CURSOR_NEXT_STEPS.md`.

## 8. Дополнительные документы

- `docs/data/SOURCE_INVENTORY.md` — sources/destinations, fresh metadata и недостающие migration inputs.
- `docs/data/AIRTABLE_LOYALTY_SCHEMA.md`, `docs/data/LOYALTY_WRITERS_MAP.md` — M2-0 loyalty inventory.
- `docs/data/PRODUCT_GTIN_CATALOG.md`, `src/content/product-gtins.ts` — EAN/GTIN ↔ SKU (Open until owner export).
- `docs/discovery/RECEIPT_QR_VERIFICATION.md` — ЛК чеки: QR→ФНС→Gletcher 5%→Оплачено=ДА.
- `docs/discovery/RECEIPT_FREE_PATH.md` — чеки без платных API: QR+OCR+manual (Confirmed).
- `docs/discovery/FNS_OPEN_API_APPLICATION_DRAFT.md` — черновик параллельной заявки ФНС.
- `docs/discovery/RECEIPT_FNS_PROVIDER_RESEARCH.md` — справочно (платные отклонены).
- `docs/discovery/LOYALTY_OWNER_QUESTIONS.md` — ответы владельца.
- `docs/adr/0011-loyalty-ledger.md` — Proposed ledger + opening-balance / spendable policy.
- `docs/backend/FORMS_DATA_PIPELINE.md` — intake/CRM/Telegram, consistency/retry/PII; lead Sheets Cancelled.
- `docs/backend/AGENT_CRM_WORKFLOWS.md` — member↔staff сценарии чеков/agent applications.
- `docs/data/LOYALTY_MIGRATION_PLAN.md` — row-level import, reconciliation, full restore.
- `docs/reviews/2026-11-12-agent-crm-and-migration.md` — актуальное ревью и R01–R12.
- `docs/adr/0002-database.md`, `docs/adr/0003-orm-and-migrations.md`, `docs/adr/0008-hosting-dev.md` — Accepted B1 non-prod; `0007-background-jobs.md` — Accepted Telegram slice.
- `docs/backend/B1_RUNBOOK.md`, `docs/reviews/2026-11-09-b1-evidence.md` — локальный запуск и DoD evidence.
- `docs/ROADMAP.md` — приоритеты реализации.
- `docs/discovery/PRODUCT_PROPS_INVENTORY.md` — props карточек пива RU/EN + контракт под будущие локали.
- `docs/adr/0001-i18n-routing-and-content.md` — маршрутизация и модель контента для `ru`/`en`/`sr`/`hy`/`ka`/`de`.
- `docs/CURSOR_NEXT_STEPS.md` — актуальное задание Cursor с критериями приёмки; обновлять после подтверждённых изменений.
- `docs/design/DESIGN_SYSTEM.md` — дизайн-код, containers/grids, anchors/scroll, UI/state/motion и DoD.
- `docs/design/AGENT_DESIGN_SKILLS.md` — локальные Impeccable/Taste/Animation skills: ignore, reinstall, precedence.
- `docs/adr/0010-design-system-and-section-layout.md` — архитектура дизайн-системы и границы rollout.
- `docs/reviews/2026-11-09-data-and-forms.md` — историческое ревью 2095221, начало data/forms потока.
- `docs/reviews/2026-11-05-public-integrity.md` — историческое ревью d6011d2 и Q1–Q3 outcomes.
- `docs/discovery/PUBLIC_ROUTE_MATRIX.md` — code/publication coverage и legacy/campaign решения до cutover.
- `docs/discovery/ABOUT_PAGE_BASELINE.md` — обязательный /about: Tilda 71867465, animation/interaction parity и DoD A1.
- `docs/discovery/ABOUT_SECTION_MANIFEST.md` — A1 records/ZB/animation map и adaptations.
- `docs/reviews/2026-11-01-design-system.md` — историческое ревью `6b137e7` и follow-up DS-1/DS-2.
- `docs/reviews/2026-11-01-home-and-sprints.md` — историческое ревью `2c1a9d0`.
- `docs/SPRINT_PLAN.md` — B1/B2/B3 + M1/M2, прежний public-gate порядок в docs/archive.
- `docs/discovery/HOME_PAGE_BASELINE.md` — source baseline и приёмка текущей home.
- `docs/reviews/2026-10-31-product-acceptance.md` — историческое ревью `6f84465`; A01–A03 исправлены в `0df9706`.
- `docs/reviews/2026-10-31-product-template.md` — историческое ревью `9e0ee8e` + рабочего дерева.
- `docs/discovery/PRODUCT_PAGE_BASELINE.md` — source baseline Friday и media-варианты шаблона.
- `docs/reviews/2026-10-31-follow-up.md` — историческое ревью `81713e4`.
- `docs/reviews/2026-10-31-current-state.md` — историческое ревью `5b4910d`.
- `docs/discovery/TILDA_MCP_WORKFLOW.md` — чтение исходников, provenance, editor/published и сверка результата.
- `docs/CURSOR_REVIEW_PROMPT.md` — готовый промпт для продолжения Cursor.

## 9. Полезные ссылки

- Сайт: https://www.gletcherbrewery.com/
- Бонусная программа: https://www.gletcherbrewery.com/agent
- Карта: https://www.gletcherbrewery.com/map
- Экскурсии: https://www.gletcherbrewery.com/tours
- NocoDB: https://github.com/nocodb/nocodb
- NocoDB docs: https://nocodb.com/docs/
- Mapbox GL JS: https://docs.mapbox.com/mapbox-gl-js/
- Mapbox Tiling Service: https://docs.mapbox.com/api/maps/mapbox-tiling-service/
- Yandex Cloud: https://yandex.cloud/
- ЮKassa: https://yookassa.ru/developers/

**Обновлять этот документ по мере получения подтверждённых требований, сохраняя его кратким и не превращая в журнал задач. Детали — в `docs/*`.**
