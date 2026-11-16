# Gletcher Brewery — Roadmap и технический план миграции

> Версия: 0.15 (12 ноября 2026 г.)
> Статус: проверен HEAD 4a4eb01, second-front, и рабочее дерево12.11. B1–B3 реализованы, M1 принят10.11; M2-1 и кабинет — рабочий spike, agent application часть в diff. Текущий M2-2 — надёжность data path, далее CRM/member workflow и row-level import/reconciliation/restore. Unit77 PASS; tsc/lint FAIL. Public sign-offs отдельно; lead Google Sheets Cancelled; Postbox/GTIN/shop UI owner отложил.
> Для репозитория: поместить в `docs/ROADMAP.md`.

## 1. Концепция

**Предлагаемый целевой стек:** Next.js (App Router), React, TypeScript (strict), Tailwind CSS, PostgreSQL, self-hosted NocoDB, Mapbox GL JS, Yandex Cloud. Для платежей — уточняемый продукт эквайринга ЮKassa/ЮMoney, для писем — кандидат Yandex Cloud Postbox, для файлов — Yandex Object Storage. MongoDB сейчас не нужна.

NocoDB — интерфейс к данным, **не замена самой СУБД**. PostgreSQL — основной источник истины. Для транзакционной логики (биркоины, записи, платежи) нужен серверный доменный слой с атомарными операциями. Нельзя допускать, чтобы ручная запись в NocoDB обходила бизнес-правила.

```text
                gletcherbrewery.com
                        |
              Next.js / TypeScript
           /      |       |         \
    Public UI  Account   Booking   Mapbox GL
           \      |       |         /
              Server-side APIs
                     |
          PostgreSQL (business data)
                     ^
                     |
           NocoDB (admin views)
                     |
          Staff / internal workflows

External services:
Mapbox (basemap, optional MTS) · ЮKassa (payments) ·
Yandex Object Storage (media/PDF) · Postbox (email)

Production hosting target: Yandex Cloud
```

**Разделение данных PostgreSQL:** обособить служебную БД/схему NocoDB и прикладные таблицы; отдельные credentials и права. При окончательном выборе версии NocoDB подтвердить поддержку подключения внешней PostgreSQL БД, нужных ролей и операций в Community Edition.

## 2. Аудит действующего сайта — известное и неизвестное

### Проверенные публичные адреса (31.10.2026)

Следующие пути обнаружены в основной навигации действующего сайта и доступны для чтения; это **не** полный реестр страниц:

| URL | Назначение | Для будущего переноса |
|---|---|---|
| `/` | Главная / презентация бренда | Визуальная сложность, общий header/footer, hero, CTA, адаптивность |
| `/beer` | Каталог пива | Категории, карточки, возможные динамические маршруты |
| `/blog` | Блог | Листинг, фактические адреса постов, SEO, медиа |
| `/map` | Карта продаж | Mapbox, фильтры; аудит UI сейчас, интеграция позже |
| `/agent` | Бонусная программа | Публичная страница; canonical кабинет `/members/lk` уже реализован как spike |
| `/tours` | Экскурсии | Публичные страницы сейчас, бронь/оплата позднее |
| `/shop` | Магазин / предзаказ | Проверить правила отображения, формы и юридические ограничения |

**Необходимо обнаружить** `/blog-all/tpost/...`, карточки продукции, страницы партнёров, формы, юридические документы, альтернативные языки, служебные и устаревшие URL, перенаправления, 404 и скрытые вложенные маршруты. Не считать угадываемые адреса достоверными без посещения.

### Что фиксировать при инвентаризации (этап 1)

Для каждого маршрута: точный URL, язык, тип страницы, заголовок, SEO title/description/canonical, H1–H3, контентные блоки, изображения/видео/шрифты, общие и уникальные компоненты, навигационные переходы, формы/CTA, внешние интеграции, интерактивность, мобильное поведение, юридические предупреждения, приоритет миграции и полнота наблюдений.

Создать **снимки-референсы** десктопа и мобильного вида, если у агента есть браузерный инструмент; документировать размеры viewport, дату, страницу, состояния меню/модалок. Не выдавать HTTP-текстовый скрейпинг за полный визуальный аудит. MCP Tilda теперь доступен в Cursor: использовать [протокол исходников](discovery/TILDA_MCP_WORKFLOW.md), сохраняя editor/published раздельно. Отсутствие браузера отмечать явно; исходники его не заменяют.

Отдельно сравнить повторяемые UI-паттерны: header, footer, меню, типографика, сетка, кнопки, карточки, секции, формы, модальные окна, локализация и age/legal notices. На основе этого выбрать **2–3 кандидата** для первой эталонной страницы и предложить один с аргументами (репрезентативность компонентов, умеренная сложность, минимум критичных backend-интеграций, проверяемая мобильная версия).

Из публичного вида **нельзя** выводить действительные правила регистрации, расчёта бонусов, эквайринга или бронирования. Не фиксировать обнаруженные тарифы как неизменные условия.

### Доступы и материалы, которые потребуются позже

| Система | Что исследовать | Результат |
|---|---|---|
| Tilda | MCP доступ подтверждён; сверить страницы/records/Zero Block, ассеты, SEO, формы/inserts, editor vs published | Датированный source manifest + route/asset inventory |
| Tilda Members | Регистрация/вход/сессии, identity mapping с Airtable | Auth migration contract |
| Collabza | Transfer schemas/writers Airtable/Bipium, IDs, Make boundaries | Data transport migration plan |
| Airtable | Базы, таблицы, поля, связи, формулы, файлы, история, права | ERD + безопасный экспорт |
| Make.com | Все сценарии, webhooks, расписания, ошибки, внешние токены | Event/workflow inventory |
| YCLIENTS | Расписания, услуги, ресурсы, слоты, заполняемость, API/экспорт | Booking state machine |
| Mapbox | Style, tileset IDs, source-layers, фактические свойства, filters, update workflow | Data sync architecture |
| Google Sheets | Таблица торговых сетей (поля, связи, форматы, частота обновлений) | Import mapping |
| ЮMoney/ЮKassa | Merchant, API, уведомления, чеки, возвраты, тестовая среда | Payment integration contract |
| Yandex Cloud/DNS | Облачный каталог, сети, домен, SSL, роли, email domain | Infrastructure design |

Google retail Sheet: metadata evidence09.11 (Карта Gletcher / tab Карта, capacity1007×44) не включало чтение ячеек/headers. M1 имеет позднейшие import inputs и acceptance10.11; не выдавать ранний metadata-only запрос за полный сегодняшний аудит. Это источник карты, не lead destination. Реестр: [SOURCE_INVENTORY](data/SOURCE_INVENTORY.md).

## 2.1. Исторические retail exports — inputs для восстановления

**Исторические числа из прежних материалов, не свежий воспроизводимый аудит:**
из 13 вложений были описаны 12 GeoJSON/CSV, всего **7 784 исходные строки**. Обнаружены 17 значений торговых `Title`, 17 строковых токенов продукции, 12 групп дубликатов `(Title, Adress)` (69 строк в этих группах), 55 групп повторяющихся координат (156 строк), 3 860 пустых или служебных значений `Packing`; нулевых или нечисловых координат нет. Две строки `Перекрёсток` помечены как Санкт-Петербург, но геокодированы во Франции и Нидерландах. Apple Numbers пока не разобран.

**Нельзя** использовать 7 784 как количество уникальных реальных магазинов; нет подтверждения актуальности выгрузок, входящие повторы не очищены, а списки `Product` могут быть сетевыми, а не точечными. Детали: `docs/MAPBOX_DATA_AUDIT.md`.

**Датированное ограничение09.11:** старые audit/model/data files отсутствовали; числа не являются свежим batch. M1 import/CRM/publish реализован и принят владельцем10.11, повторять M1 не требуется. Provenance исторических exports остаётся отдельным вопросом. Действующий код источников: `src/server/retail/source-manifest.ts`, `chain-layer-registry.ts`.

## 3. Этапы разработки, порядок и критерии завершения

> **Правило порядка:** аналитика по отдельной подсистеме допустима заранее; её реализация — только в согласованной очереди. Публикация на действующий домен, изменения production-сервисов и миграция персональных данных запрещены без отдельного согласования.

| Этап | Результат | Статус на 12.11.2026 |
|---|---|---|
| 0. Bootstrap | Работающий локально Next.js + TS + Tailwind и чистый Git | **Done** (проверено 31.10.2026) |
| 1. Site Discovery | Реестр URL, UI-инвентаризация, SEO/контент и кандидат эталона | **Done** — эталон `/beer` утверждён |
| 2. Design Foundation | Общие tokens, containers, grid, UI/state/motion | DS-1/DS-2 и Q2 implemented, sign-offs отдельно |
| 3. Reference Page | Одна принятая адаптивная эталонная страница | `/beer` принят 31.10; DS-2 Horeca pilot реализован, sign-offs отдельно |
| 4. Public Migration | Public UI/SEO/контент | Q1–Q3 и A1 code реализованы; remaining sign-offs Open, не blocker B1 |
| 5. Data & Infrastructure | PostgreSQL/NocoDB, intake/delivery, staging | B1–B3 implemented; текущий M2-2 reliability; YC staging Open |
| 6. Retail Map | CRM торговых точек и публикация данных | M1 Owner Accepted10.11, regression по необходимости |
| 7. Agent Gletcher | Миграция Airtable/Collabza и бонусная программа | M2-0 inventory и M2-1 spike implemented; row import Open |
| 8. Tours & Certificates | Запись, оплата, PDF/email | Backend в очереди; public tours с YCLIENTS и firm shop уже реализованы |
| 9. Launch | Проверки, параллельный запуск, cutover и rollback | В очереди |

### Этап 0 — Инициализация и технический фундамент (первый обязательный gate)

**Работы:** в *существующем* Git-репозитории `gletcherbrewery` проверить/создать Next.js App Router, TypeScript strict, Tailwind CSS, ESLint, `src/`, alias `@/*`; сохранить `.git`, `AGENTS.md`, `docs/*`, README и остальные вложения. Зафиксировать менеджер пакетов (сейчас предлагается npm). Создать минимальный `src/app` и главную заглушку, `.gitignore` и `.env.example` без секретов при необходимости.

**Проверки:** `npm run dev`, `npm run build`, lint-скрипт из фактического `package.json` (не предполагать команду для неподтверждённой версии), `npx tsc --noEmit`, `git status`. Не выполнять `git init` второй раз в существующем репозитории, не перетирать документацию.

**Критерий готовности:** локальный сайт открывается, сборка и типизация проходят, состояние Git понятно, исходная документация не повреждена. **До подтверждения этого факта агент не начинает этап 1.** На этом этапе **не** нужны Docker/PostgreSQL/NocoDB/Mapbox/эквайринг.

### Этап 1 — Site Discovery / инвентаризация действующего сайта (артефакты подготовлены)

**Режим:** read-only для действующего сайта и существующего кода; разрешено создавать/обновлять только документы `docs/discovery/*`. Не начинать дизайн-систему и верстку. Публичные данные собирать безопасно, без логина, покупки, отправки форм или нагрузочного сканирования.

**Работы:**

1. Проверить готовность этапа 0 (наличие Next.js, `package.json`, структур, команды сборки). Если нет — отметить блокер, не выдавать этап 1 за завершённый.
2. Инвентаризировать публичные маршруты: главная, каталог и карточки, блог и статьи, карта, агент, экскурсии, магазин, партнёры, RU/EN, юридические и иные вложенные страницы; по возможности изучить меню, sitemap, ссылки, canonical, redirect.
3. Для каждого типа страницы описать контентные секции, интерактивность, внешние сервисы, SEO URL и степень доступности данных. Отметить **Confirmed / Observed / Assumed / Unknown**.
4. Составить реестр повторяемых компонентов: desktop/mobile header, меню, footer, карточки, CTA, кнопки, формы, галереи, типографика, сетки, иллюстрации, состояние загрузки и ошибки.
5. Подготовить визуальные референсы desktop/mobile (через браузер, когда доступен) и сравнение breakpoint/поведения; если недоступны — записать ограничение и рекомендации по сбору референсов.
6. Выделить доступные/отсутствующие ассеты, лицензирование шрифтов, оптимизацию изображений, видео и Tilda Zero Block кастомизации.
7. Предложить 2–3 страницы на роль **первой эталонной**, оценить по повторяемым компонентам, сложности, интерактивности, адаптивности и рискам; рекомендовать одну, но **не реализовывать без утверждения**.

**Артефакты:**

- `docs/discovery/SITE_INVENTORY.md` — таблица URL и шаблонов страниц; статус проверки и функциональные зависимости.
- `docs/discovery/UI_COMPONENT_AUDIT.md` — общие/уникальные компоненты, визуальная система, состояния, breakpoint и технические замечания.
- `docs/discovery/CONTENT_SEO_INVENTORY.md` — URL, title/H1, canonical, метатеги, локали, формы, медиа, редиректы и риски SEO.
- `docs/discovery/REFERENCE_PAGE_PROPOSAL.md` — сравнение 2–3 кандидатов, выбор одного, план реализации и критерии визуальной приёмки.
- `docs/discovery/PRODUCT_PROPS_INVENTORY.md` — props `/beer/{slug}` RU/EN, slug-map, задел под `sr`/`hy`/`ka`/`de` (ADR 0001).

**Критерий готовности:** есть проверяемая карта доступных публичных разделов и страниц, выделены общие компоненты и пробелы в доступе; предложена одна эталонная страница с аргументами и объёмом первой реализации. **Точка решения владельца проекта: утвердить страницу и допуск к этапу 2.**

### Этап 2 — Минимальная дизайн-система и каркас Next.js

**Работы:** по результатам аудита создать дизайн-токены (цвета, шрифты, размеры, сетки, spacing, адаптивные размеры), UI primitives, глобальные layout/header/footer, соглашения об assets и именовании, доступность и базовую навигацию. Не копировать Tilda DOM/стили без проверки. По необходимости предложить библиотеку компонентов, но не добавлять автоматически большой UI-фреймворк.

**Требование владельца 01.11.2026 — действующий дизайн-контракт:** полноценный
[дизайн-код](design/DESIGN_SYSTEM.md) и [ADR 0010](adr/0010-design-system-and-section-layout.md):
презентационные секции, autoscale-композиции по ширине/высоте, anchors/native
soft snap, 50/50 и 25/50/25 по обеим осям, cards 3/4/6, banners/carousels.
Это плановая доработка foundation в ходе этапа 4, не повтор Bootstrap/Discovery.
DS-1 tokens/primitives/showcase и DS-2 pilot уже реализованы, DS-3 широко
перенесён. Не выполнять их заново; проверенные R03/R04/R09/R10 и reflow
candidates — ограниченный Q2. Новая серия/доказательства в текущем ревью.
Прежние приёмки не запрещают явно запрошенную систематизацию; содержание,
URL/локали/сценарии сохраняются. Численные values реализованы/reviewable;
это не подтверждает owner sign-off каждого layout/state.

**Критерий готовности:** есть локальная showcase всех grids/states, читаемый
контент при short viewport/zoom, focus/reduced-motion/no-JS fallback; реальные
desktop/mobile evidence и lint/typecheck/build. Native document scroll;
screen min-height может расти, статьи/legal/form — reading flow. Не создавать
mandatory full-page wrapper, не уменьшать весь UI transform-ом. CRM/платежи вне scope.

### Этап 3 — Первая эталонная страница

**Работы:** воссоздать **одну утверждённую** страницу на Next.js, максимально сохраняя дизайн, структуру, контент, изображения, навигацию, поведение и адаптивность. По возможности сверить скриншоты исходника и localhost на согласованных viewport; не считать внешние сервисы работающими, если подключены только заглушки/fixtures.

**Критерий готовности:** владелец принимает визуал и UX, соблюдены SEO-атрибуты, мобильная адаптация, доступность, нет регрессий в build. Создана воспроизводимая схема переноса других страниц.

**Статус gate:** `/beer` принят владельцем по актуальным инструкциям AGENTS §7.
Исторические lint/focus-origin/contrast/min-height/order исправлены по коду;
в срезе 0df9706 header/menu/footer использовали временный production mapping. Loop clone
links исправлены. A01–A03 [исторического ревью](reviews/2026-10-31-product-acceptance.md)
закрыты по коду в `0df9706`, product template принят. Не выполнять их повторно.

**Перед массовым переносом:** проверить реализацию [Accepted ADR i18n](adr/0001-i18n-routing-and-content.md): RU/EN URL, ID/slug-map, published peers, fallback и SEO. Next-intl уже установлен. Сербская письменность, шрифты и допуск остальных локалей остаются открытыми; изменение статуса ADR не заменяет проверки реализации.

### Этап 4 — Публичный слой и отдельный backlog

На2095221 DS-1/DS-2/основной rollout, Q1–Q3 и /about code реализованы.
Q1 устранил ложные отправки; после B3 формы подключены к intake/outbox. Q3 добавил blog-all308,
sitemap/robots/public registry. /about RU-only/noindex с motion, owner acceptance
и отдельные history/gallery вопросы Open.
[Review](reviews/2026-11-09-data-and-forms.md), [matrix](discovery/PUBLIC_ROUTE_MATRIX.md).

**Новый приоритет владельца09.11:** начать B1/B2 данные/формы, не ждать campaigns/
public exit. Это меняет очередь, но не принимает незавершённый визуал и не
объявляет stage4 Done. /about остаётся обязательным; C1/legacy coverage —
отдельный backlog. Protected/planned страницы и языки не публиковать автоматически.

Public exit по-прежнему требует source parity/приёмок, согласованного coverage,
URL/SEO/media/accessibility regression и честных legacy boundaries. Stage9/DNS
cutover отдельно. Puck preference Confirmed, CMS не нужен для first lead pipeline.
sr/hy/ka/de planned до translation/script/font/publication checks.

### Этап 5 — База данных, CRM и формы

B1 принят local09.11: PostgreSQL17, Drizzle/postgres.js, SQL migrations,
NocoDB0.301.2 read-only external source; metadata отделена. B2 Telegram и
B3 остальные формы/staff commands реализованы. Lead Google Sheets **Cancelled**.
Архитектуру не выбирать заново; исторические ADR/evidence не равны готовности
всей новой схемы и worker fault paths.

**Текущий M2-2:** исправить worker recovery/fencing/replay, DB role boundaries,
magic-link consume/debug guard, receipt verdict/ledger/audit и CRM concurrency.
Вернуть tsc/lint PASS. [Задание](CURSOR_NEXT_STEPS.md), [ревью](reviews/2026-11-12-agent-crm-and-migration.md),
[pipeline](backend/FORMS_DATA_PIPELINE.md). Затем M2-3 member↔staff workflows
и M2-4 миграция; подготовка manifest/fixtures идёт уже сейчас.

Критерий: meaningful PostgreSQL concurrency/negative grants tests, сохранённые
accepted submissions при сбоях, наблюдаемые retry/ambiguous states, зелёные
quality checks. Общий staff token пока local spike, shared staging требует
доказанной staff identity и прав. Production data/cutover отдельно.

### Этап 6 — CRM торговых точек и Mapbox

**M1 Owner Accepted10.11:** retail staging/import, chain×SKU и location
assortment, staff CRM, publish adapters и Mapbox UI реализованы.
Не открывать новый визуальный спринт карты. Поддерживать Product/Adress
compatibility, координаты/provenance и scope ассортимента, audit/publish/rollback.
Исторические source gaps остаются в [реестре](data/SOURCE_INVENTORY.md),
но не возвращают уже принятый M1 в начало очереди.

### Этап 7 — «Агент Глетчер»: текущая серия M2

M2-0: schema/aggregates/writers inventory и owner policies. M2-1: ledger,
receipt QR/OCR/manual path, staff receipt queue, magic-link spike.
Canonical /members/lk использует member/ledger/receipts, status/level/prize
по формулам11.11. Незакоммиченный agent application срез сохраняется.

- **M2-2:** надёжность/транзакции/роли — выше.
- **M2-3:** agent application→staff→member status; private photo→review→один
  earn→кабинет. [Контракт](backend/AGENT_CRM_WORKFLOWS.md).
- **M2-4A/B:** row-level importer семи source tables, IDs/history/attachments,
  quarantine/resume, поучастниковые available/lifetime и полный DB/files restore.
  [План миграции](data/LOYALTY_MIGRATION_PLAN.md).
- **M2-5:** protected staging/staff identity/наблюдаемая доставка; onboarding
  после owner возврата к Postbox. GTIN и ФНС не блокируют manual fallback.

Owner5%, email identity, legacy manually-reviewed НЕТ→verified и P1 onboarding
уже Confirmed; не переоткрывать эти решения. Legacy verification привязать к
подтверждённому batch/record set, новые pending не повышать автоматически.
Старый policy smoke не доказывает migration continuity. ADR0011 Proposed до
persisted reconciliation/restore; source counts10.11 — датированный baseline.

Критерий готовности: нет необъяснённых расхождений по members/history/links/
available/lifetime, повторный импорт без дублей, весь staff/member путь
проверен, restore и права доказаны. Cutover — отдельное разрешение.

### Этап 8 — Экскурсии, эквайринг, сертификаты и email

**Работы:** согласовать модель брони, тарифы и оферту; исключить двойные резервы и повторные webhooks, настроить ЮKassa/ЮMoney в тестовой среде, генерировать PDF-код сертификата после оплаты, надёжно отправлять email и регистрировать погашение. Решить использование Yandex Postbox/Object Storage после ADR.

**Критерий готовности:** тестовый сквозной сценарий — запись → подтверждение платежа → сертификат → письмо → погашение, включая ошибочные и повторные события.

### Этап 9 — Проверки, запуск, мониторинг и откат

**Работы:** функциональные/e2e тесты, доступность, метрики производительности, SEO и права, обезличенный staging, проверка восстановления БД, заморозка/синхронизация данных, DNS cutover и rollback план.

**Критерий готовности:** бизнес утверждает чек-лист и маршрут отката, новая система проверена с реальными интеграциями, мониторинг ошибок и редиректов включён.

## 4. Предварительная модель данных

```text
loyalty_members ──1:N── loyalty_receipts
       │                  └── approved earn → loyalty_ledger_entries
       ├──1:N── loyalty_ledger_entries (earn/spend/adjust; append-only target)
       ├──1:N── loyalty_agent_applications
       └──1:N── loyalty_member_sessions
form_submissions ──1:N── delivery_jobs ──1:N── delivery_attempts
       └── staff projection + staff_lead_events

retail_chains ──1:N── retail_locations
products      ──N:M── retail_locations (location_products)
                  or  ──N:M── retail_chains (chain_products)

tour_types ──1:N── tour_slots ──1:N── bookings ──1:N── payments
                                            └──1:N── gift_certificates*

* Связь сертификата с booking/order будет уточнена после аудита.
```

**Не переносить структуру Google Sheets 1:1 в SQL до анализа.** Возможно, ассортимент задаётся на уровне торговой сети, точки, региона либо отдельно по каждому SKU — от этого зависит модель связей и объём данных.

## 5. Архитектурные решения и оставшийся ADR backlog

Сложные технические решения фиксировать по мере приближения этапа. **Не блокировать первую страницу выбором ORM, БД и CRM.**

Реестр: [docs/adr/README.md](adr/README.md). Существующие пути файлов сохранены; исторические два префикса `0000` различать полным именем файла. `0001` уже занят i18n и не резервируется повторно под Database.

| ADR | Статус / следующий шаг |
|---|---|
| `0000-frontend-bootstrap.md` | Confirmed для заказанного стека |
| `0000-site-migration-strategy.md` | Proposed; завершение эталона и порядок переноса |
| `0001-i18n-routing-and-content.md` | **Accepted** — next-intl, published vs planned, catalog id + translations |
| `0002-database.md` | Accepted B1 non-prod; role enforcement расширить под loyalty |
| `0003-orm-and-migrations.md` | Accepted: Drizzle/postgres.js и SQL migrations |
| Будущий `0004-auth.md` | Tilda Members identity mapping, staff/member access и recovery |
| `0005-cms.md` | Proposed; Puck preference Confirmed, установка editor на CRM-этапе |
| Будущий `0006-map.md` | GeoJSON/MTS, контракт и публикация карты |
| `0007-background-jobs.md` | Accepted Telegram slice; M2-2 закрывает recovery/fencing defects, Sheets Cancelled |
| `0008-hosting-dev.md` | Accepted local; YC staging/production Open |
| Будущий `0009-booking-payments.md` | Бронь, merchant, чеки/возвраты, идемпотентность |
| `0010-design-system-and-section-layout.md` | Direction Confirmed; DS-1/2 implemented; acceptance backlog отдельно |
| `0011-loyalty-ledger.md` | Proposed; owner policies Confirmed, row-level rehearsal/restore Open |

## 6. Технические принципы

- Сначала работающий Next.js, затем доказуемый UI-аудит, затем дизайн-система и эталонная страница. Запрещено подменять этот порядок техническим энтузиазмом по одной подсистеме.
- Owner09.11 приоритизировал B1/B2 перед remaining campaigns/public exit.
  SQL commit предшествует accepted; downstream deliveries асинхронны и наблюдаемы,
  CRM читает source of truth. Stage4 sign-offs и production cutover отдельно.
- Одна SQL-схема, управляемая миграциями; NocoDB как рабочий табличный UI, по умолчанию без прав изменять схему.
- Бонусы, деньги и бронирования — только атомарные операции backend с audit log.
- У каждого импорта есть `source`, `source_id`, временная метка, checksum/версия, dry-run, статистика результатов и возможность отката.
- API и webhooks версионируются и проверяются. Повторные события идемпотентны.
- Запуск безопасных миграций только на staging перед production.
- Все секреты хранятся вне репозитория; read/write Mapbox token — только серверный.
- Уважать требования персональных данных и законодательные ограничения на рекламу/продажу алкоголя; до запуска сделать профильную юридическую проверку.
- Не обещать эквивалентность Tilda/Collabza/Airtable/Make/YCLIENTS без сверки поведения и реальных данных.

## 7. Технические риски (по степени внимания)

| Риск | Мера |
|---|---|
| Различия NocoDB и Airtable формул/связей | Импорт схемы в тестовую БД, отчёты о несовпадениях, выборочная сверка |
| Потеря бонусного баланса | Ledger, reconciliation, архив экспорта, запрет прямой записи баланса |
| Несогласованность данных карты и tileset | SQL source-of-truth, staging publication, status, retries, cache strategy |
| Двойная запись на экскурсию | Атомарная транзакция, ограничения БД, expiration holds |
| Двойная обработка оплаты | Idempotency, authenticated webhook, read-back payment status |
| Письмо не отправилось после оплаты | Transactional outbox / job retries, мониторинг доставки |
| NocoDB правки обходят бизнес-логику | Ограничить права, критичные таблицы read-only, отдельный admin UI |
| Неполная визуальная реконструкция на основе текстовых данных | Desktop/mobile скриншоты, проверка интерактивных состояний, визуальное сравнение и маркировка неизвестного |
| Начало разработки вторичных модулей до основания проекта | Жёсткие gates 0–3 и утверждение следующего этапа владельцем |
| SEO проседает после переноса | URL inventory, redirects, sitemap, Search Console/Метрика, мониторинг |
| Правовые требования | Аудит 152-ФЗ, 54-ФЗ, особенностей сервиса и алкогольных ограничений |

## 8. Недостающие сведения — только для нужного среза

M2-2 не ждёт live credentials: нужны изолированная synthetic PG и отдельные
app/worker/nocodb roles. Их права проверяются реально, не по UI.
M2-3: mapping девяти agent statuses, staff/public comments, review evidence;
не выдумывать agent earn или prize redemption.

M2-4: свежий защищённый snapshot/schema/checksums, verified-eligible record set,
email collisions, links/history/attachments, Collabza READ/WRITE и Bipium.
Postbox/GTIN owner отложил; inputs потребуются при возврате к этим задачам.
На shared staging — staff auth ADR, private storage, operational delivery и
план восстановления. Не выдавать source metadata09–11.11 за новый live audit.

## 9. Следующее задание Cursor Agent

1. Сверить actual Git/diff; прочитать [M2-2](CURSOR_NEXT_STEPS.md) и
   [ревью12.11](reviews/2026-11-12-agent-crm-and-migration.md).
2. Закрыть R01–R07/quality gates с PostgreSQL concurrency/grants evidence.
3. Подготовить manifests/linked fixtures, затем M2-3 CRM/member loops и
   M2-4 import/reconciliation/restore по [серии](SPRINT_PLAN.md).
4. M2-5 readiness и конкретное cutover proposal отдельно. Production/legacy
   changes, рассылки, commit/push не выполнять автоматически.
   [Готовый промпт](CURSOR_REVIEW_PROMPT.md).

## 10. Текущие доказательства/материалы

- [SOURCE_INVENTORY](data/SOURCE_INVENTORY.md): dated source/destination status.
- [FORMS_DATA_PIPELINE](backend/FORMS_DATA_PIPELINE.md): intake/outbox/admin.
- [AGENT_CRM_WORKFLOWS](backend/AGENT_CRM_WORKFLOWS.md): member↔staff DoD.
- [LOYALTY_MIGRATION_PLAN](data/LOYALTY_MIGRATION_PLAN.md): настоящий перенос.
- [Ревью12.11](reviews/2026-11-12-agent-crm-and-migration.md): HEAD+diff, FAIL/PASS,
  R01–R12 и ограничения. [B1 evidence](reviews/2026-11-09-b1-evidence.md) —
  исторический local B1-only результат.
- [INTEGRATIONS_AUDIT](discovery/INTEGRATIONS_AUDIT.md): historical31.10 snapshot;
  schema/writers/owner answers10–11.11 в профильных docs.

## 11. Официальные первоисточники

- NocoDB PostgreSQL external source: https://nocodb.com/docs/product/integrations/data-sources/connect-to-data-source
- NocoDB Airtable import: https://nocodb.com/docs/product/projects/import-project-from-airtable
- NocoDB self-hosted/licensing: https://nocodb.com/docs/self-hosting
- Mapbox MTS API: https://docs.mapbox.com/api/maps/mapbox-tiling-service/
- Mapbox GeoJSON sources: https://docs.mapbox.com/mapbox-gl-js/guides/add-your-data/style-layers/
- Yandex Managed PostgreSQL: https://yandex.cloud/ru/docs/managed-postgresql/
- Yandex Cloud Postbox: https://yandex.cloud/ru/docs/postbox/
- ЮKassa webhooks: https://yookassa.ru/developers/using-api/webhooks
- ЮKassa idempotency: https://yookassa.ru/developers/using-api/interaction-format
