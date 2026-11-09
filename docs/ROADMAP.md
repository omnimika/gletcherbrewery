# Gletcher Brewery — Roadmap и технический план миграции

> Версия: 0.14 (9 ноября 2026 г.)
> Статус: проверен чистый 2095221, second-front, baseline d6011d2; lint/tsc PASS, build/browser Codex не запускал. Q1–Q3 и /about code реализованы; формы ещё unavailable. Owner09.11 приоритизировал B1 — PostgreSQL/NocoDB/первая форма, затем Telegram/Sheets и миграции. Public/campaign sign-offs не блокируют этот поток.
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
| `/agent` | Бонусная программа | Публичная посадочная страница сейчас, личный кабинет позднее |
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

Google retail Sheet: metadata09.11 подтверждены (Карта Gletcher / tab Карта, capacity1007×44), ячейки/headers не читались. Это источник карты, не lead destination. Реестр: [SOURCE_INVENTORY](data/SOURCE_INVENTORY.md).

## 2.1. Исторические retail exports — inputs для восстановления

**Исторические числа из прежних материалов, не свежий воспроизводимый аудит:**
из 13 вложений были описаны 12 GeoJSON/CSV, всего **7 784 исходные строки**. Обнаружены 17 значений торговых `Title`, 17 строковых токенов продукции, 12 групп дубликатов `(Title, Adress)` (69 строк в этих группах), 55 групп повторяющихся координат (156 строк), 3 860 пустых или служебных значений `Packing`; нулевых или нечисловых координат нет. Две строки `Перекрёсток` помечены как Санкт-Петербург, но геокодированы во Франции и Нидерландах. Apple Numbers пока не разобран.

**Нельзя** использовать 7 784 как количество уникальных реальных магазинов; нет подтверждения актуальности выгрузок, входящие повторы не очищены, а списки `Product` могут быть сетевыми, а не точечными. Детали: `docs/MAPBOX_DATA_AUDIT.md`.

**На09.11 audit/model/data files отсутствуют**; найти exports и восстановить provenance перед M1. Старые числа не являются доступным migration batch. По новому приоритету B1/B2 уже в фокусе; retail импорт — через staging/reconciliation, без изменения production tilesets.

## 3. Этапы разработки, порядок и критерии завершения

> **Правило порядка:** аналитика по отдельной подсистеме допустима заранее; её реализация — только в согласованной очереди. Публикация на действующий домен, изменения production-сервисов и миграция персональных данных запрещены без отдельного согласования.

| Этап | Результат | Статус на 09.11.2026 |
|---|---|---|
| 0. Bootstrap | Работающий локально Next.js + TS + Tailwind и чистый Git | **Done** (проверено 31.10.2026) |
| 1. Site Discovery | Реестр URL, UI-инвентаризация, SEO/контент и кандидат эталона | **Done** — эталон `/beer` утверждён |
| 2. Design Foundation | Общие tokens, containers, grid, UI/state/motion | DS-1 реализован; конкретные дефекты grid/motion — Q2, не новый foundation |
| 3. Reference Page | Одна принятая адаптивная эталонная страница | `/beer` принят 31.10; DS-2 Horeca pilot реализован, sign-offs отдельно |
| 4. Public Migration | Public UI/SEO/контент | Q1–Q3 и A1 code реализованы; remaining sign-offs Open, не blocker B1 |
| 5. Data & Infrastructure | PostgreSQL/NocoDB, intake/delivery, staging | **B1 Done 09.11**; текущий **B2**; YC staging Open |
| 6. Retail Map | CRM торговых точек и публикация данных | Backend в очереди; legacy Mapbox frontend уже реализован |
| 7. Agent Gletcher | Миграция Airtable/Collabza и бонусная программа | Backend в очереди; public landing уже реализован |
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
Q1 устранил ложные отправки: формы пока unavailable. Q3 добавил blog-all308,
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

### Этап 5 — База данных, CRM и формы — текущий фокус

**Owner Confirmed09.11:** [B1](CURSOR_NEXT_STEPS.md) включает короткий B0 contracts/
version/ORM spike и Contacts → PostgreSQL → private staff NocoDB view.
Затем B2 durable worker → Telegram/lead Sheet, B3 остальные forms/admin workflows.
[Pipeline](backend/FORMS_DATA_PIPELINE.md), [sources](data/SOURCE_INVENTORY.md).
Новые leads не ждут полного bonus импорта; schema/export сбор идёт параллельно.
Production data/cutover и платные ресурсы не разрешены этим review.


**Работы:** после появления реальных потребностей модулей утвердить PostgreSQL + self-hosted NocoDB, локальную тестовую среду и Yandex Cloud staging; ADR по ORM, auth, CMS, секретам, фоновой обработке и хостингу. Отдельные роли/схемы NocoDB и бизнес-данных. Репетиции миграций только с тестовыми/обезличенными данными; настроить мониторинг, бэкапы, CI.

**Критерий готовности:** тестовая PostgreSQL + NocoDB, воспроизводимые миграции, безопасный доступ серверного приложения и утверждённая архитектура. MongoDB не добавлять без обоснованной задачи.

### Этап 6 — CRM торговых точек и Mapbox

**Исторический задел:** ранее описаны 12 GeoJSON/CSV, но audit/model/data files сейчас отсутствуют. Восстановить provenance/exports и сверить actual style/layers до M1; не называть старые числа проверенным batch.

**Работы:** утвердить контракт импорта; нормализовать сети, магазины, SKU; загрузить тестовый фрагмент в PostgreSQL; настроить редактор NocoDB с RBAC, модерацией и валидацией; создать API выдачи GeoJSON и фильтры Mapbox. Поддержать статус публикации, аудит и откат. Для MVP сравнить server-side GeoJSON API с Mapbox Tiling Service после замера нагрузки и частоты обновлений.

**Критерий готовности:** изменения валидированной тестовой точки или ассортимента проходят путь CRM → публикация → карта, с журналом и возможностью отката. Production tilesets не изменять без отдельного разрешения.

### Этап 7 — «Агент Глетчер»: Airtable/Collabza/Make → PostgreSQL/NocoDB

**Работы:** инвентаризировать схему Airtable, правила расчёта, учетные записи Collabza и Make-сценарии; предусмотреть `ledger` бонусных операций и сохранение ID/истории; создать тестовую миграцию, сверку, доступ и восстановление аккаунта. NocoDB — админ-интерфейс, критичные начисления выполняются в серверной транзакционной логике.

**Критерий готовности:** нет необъяснимых расхождений по числу участников, балансу и истории; правила и права доступа подтверждены, есть rollback.

### Этап 8 — Экскурсии, эквайринг, сертификаты и email

**Работы:** согласовать модель брони, тарифы и оферту; исключить двойные резервы и повторные webhooks, настроить ЮKassa/ЮMoney в тестовой среде, генерировать PDF-код сертификата после оплаты, надёжно отправлять email и регистрировать погашение. Решить использование Yandex Postbox/Object Storage после ADR.

**Критерий готовности:** тестовый сквозной сценарий — запись → подтверждение платежа → сертификат → письмо → погашение, включая ошибочные и повторные события.

### Этап 9 — Проверки, запуск, мониторинг и откат

**Работы:** функциональные/e2e тесты, доступность, метрики производительности, SEO и права, обезличенный staging, проверка восстановления БД, заморозка/синхронизация данных, DNS cutover и rollback план.

**Критерий готовности:** бизнес утверждает чек-лист и маршрут отката, новая система проверена с реальными интеграциями, мониторинг ошибок и редиректов включён.

## 4. Предварительная модель данных

```text
users ──1:1── agent_profiles ──1:N── point_transactions
                              └──1:N── redemptions ──N:1── rewards

retail_chains ──1:N── retail_locations
products      ──N:M── retail_locations (location_products)
                  or  ──N:M── retail_chains (chain_products)

tour_types ──1:N── tour_slots ──1:N── bookings ──1:N── payments
                                            └──1:N── gift_certificates*

* Связь сертификата с booking/order будет уточнена после аудита.
```

**Не переносить структуру Google Sheets 1:1 в SQL до анализа.** Возможно, ассортимент задаётся на уровне торговой сети, точки, региона либо отдельно по каждому SKU — от этого зависит модель связей и объём данных.

## 5. Решения, которые ещё нужно принять (ADR backlog)

Сложные технические решения фиксировать по мере приближения этапа. **Не блокировать первую страницу выбором ORM, БД и CRM.**

Реестр: [docs/adr/README.md](adr/README.md). Существующие пути файлов сохранены; исторические два префикса `0000` различать полным именем файла. `0001` уже занят i18n и не резервируется повторно под Database.

| ADR | Статус / следующий шаг |
|---|---|
| `0000-frontend-bootstrap.md` | Confirmed для заказанного стека |
| `0000-site-migration-strategy.md` | Proposed; завершение эталона и порядок переноса |
| `0001-i18n-routing-and-content.md` | **Accepted** — next-intl, published vs planned, catalog id + translations |
| `0002-database.md` | Proposed B1: PostgreSQL/NocoDB, ownership/grants и first lead |
| Будущий `0003-orm.md` | Выбор driver/ORM внутри B0/B1, transaction/constraint tests |
| Будущий `0004-auth.md` | Tilda Members identity mapping, staff/member access и recovery |
| `0005-cms.md` | Proposed; Puck preference Confirmed, установка editor на CRM-этапе |
| Будущий `0006-map.md` | GeoJSON/MTS, контракт и публикация карты |
| `0007-background-jobs.md` | Proposed B1/B2: transaction outbox/worker, Telegram/Sheets, retry/ambiguous |
| Будущий `0008-hosting.md` | Yandex Cloud, сеть, стоимость, среды |
| Будущий `0009-booking-payments.md` | Бронь, merchant, чеки/возвраты, идемпотентность |
| `0010-design-system-and-section-layout.md` | Direction Confirmed; DS-1/2 реализованы, rollout reviewable; текущие defects — Q2 |

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

## 8. Недостающие сведения — по мере нужного среза

B1: non-prod topology, NocoDB version/edition и staff role, contact purpose/
PII/retention и secret references. Обратимые technical choices готовить по
коротким ADR без вопроса на каждый пакет; credentials не присылать в prompts.

B2: bot/chat/topic, отдельный lead spreadsheet/tab/schema, runtime Google
principal/share, template/allowed fields и ответственный. Retail Sheet metadata
доступны коннектору; это не app credential и не назначение лидов.

M1/M2: retail exports, актуальные Airtable schema/exports/formulas, Make blueprint,
Collabza/Bipium writers, Tilda Members identity links. Read-only discovery и
reconciliation предшествуют предложению production переключения. Старый billing
snapshot не выдавать за текущее состояние.

## 9. Следующее задание Cursor Agent

1. Изучить [B1](CURSOR_NEXT_STEPS.md), [план](SPRINT_PLAN.md),
   [ревью](reviews/2026-11-09-data-and-forms.md), [pipeline](backend/FORMS_DATA_PIPELINE.md),
   [sources](data/SOURCE_INVENTORY.md), ADR0002/0007 и Accepted i18n.
   Проверить actual Git state, baseline2095221.
2. B0 коротко внутри B1: contracts/ORM/version/NocoDB spike; затем non-prod
   DB/migrations/roles и Contacts → durable record/outbox → protected staff view.
   Не подменять реальный DB результат моками.
3. Далее B2 live sandbox delivery Telegram/Sheets, B3 остальные forms,
   M1/M2 data rehearsal. Schema/exports собирать параллельно, не ждать campaigns.
4. Production import/writers/auth/DNS, платные ресурсы и commit/push —
   отдельные конкретные действия. [Промпт](CURSOR_REVIEW_PROMPT.md).

## 10. Текущие доказательства/материалы

- [SOURCE_INVENTORY](data/SOURCE_INVENTORY.md): metadata и недостающие inputs.
- [FORMS_DATA_PIPELINE](backend/FORMS_DATA_PIPELINE.md): typed intake/delivery/admin contract.
- [INTEGRATIONS_AUDIT](discovery/INTEGRATIONS_AUDIT.md): исторический31.10 snapshot.
- Старые MAPBOX_DATA_AUDIT.md, MAPBOX_DATA_MODEL.md и data/ отсутствуют; сначала
  восстановить exports/provenance, не строить миграцию по старым числам.
- [Ревью09.11](reviews/2026-11-09-data-and-forms.md): progress/checks/ограничения.

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
