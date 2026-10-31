# Gletcher Brewery — Roadmap и технический план миграции

> Версия: 0.2 (31 октября 2026 г.)  
> Статус: рабочий план, до аудита исходных данных.  
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

### Публичные разделы для инвентаризации

- `/` — главная и меню.
- `/beer` — каталог продукции.
- `/blog` и фактические URL статей — блог, SEO, изображения, локализация.
- `/map` — Mapbox и фильтры по категориям/товарам.
- `/agent` — регистрация, вход, личный кабинет и программа лояльности.
- `/tours` — экскурсии, заявки, бронирование, условия и платежи.
- Дополнительно обнаружить страницы партнёров, магазина, юридические, скрытые и системные URL, RU/EN версии.

Наблюдения на публичном сайте **не доказывают** фактическую реализацию авторизации, оплаты и бизнес-правил. В частности, на `/tours` видны разные сценарии бронирования и встречаются разные формулировки условий предоплаты; **перед разработкой получить единое утверждённое ТЗ**. Не фиксировать публично обнаруженные суммы как постоянные тарифы.

### Доступы и материалы, которые потребуются

| Система | Что исследовать | Результат |
|---|---|---|
| Tilda | Экспорт страниц, ассеты, метатеги, SEO URL, формы, JS-вставки, интеграции | Route inventory + asset inventory |
| Collabza | Регистрация, вход, сессии, персонализация, ID пользователей | Identity/auth migration plan |
| Airtable | Базы, таблицы, поля, связи, формулы, файлы, история, права | ERD + безопасный экспорт |
| Make.com | Все сценарии, webhooks, расписания, ошибки, внешние токены | Event/workflow inventory |
| YCLIENTS | Расписания, услуги, ресурсы, слоты, заполняемость, API/экспорт | Booking state machine |
| Mapbox | Style, tileset IDs, source-layers, property `Products`, filters, update workflow, масштабы | Data sync architecture |
| Google Sheets | Таблица торговых сетей (поля, связи, форматы, частота обновлений) | Import mapping |
| ЮMoney/ЮKassa | Merchant, API, уведомления, чеки, возвраты, тестовая среда | Payment integration contract |
| Yandex Cloud/DNS | Облачный каталог, сети, домен, SSL, access roles, email domain | Infrastructure design |

Google-таблица: https://docs.google.com/spreadsheets/d/1___r32NSbWCyvemCBmb3mVTckt549hz7zBHfcGks-6o/edit?gid=1425762822 — содержимое пока не проверено, поля таблицы не выдумывать.

## 3. Этапы (порядок и критерии выхода)

### Этап 0 — Discovery / технический аудит

**Работы:** карта всех страниц и форм, карта интеграций, выгрузка схем Airtable и сценариев Make.com, фиксация текущих URL и SEO, понимание логики `Products` на Mapbox, проверка структуры Google Sheets, инвентаризация YCLIENTS, определение бизнес-ответственных.

**Готовность:** подтверждённые требования и список открытых вопросов; документы `docs/architecture.md`, `docs/migration-inventory.md`, `docs/data-model.md`, `docs/adr/0001-database.md`.

### Этап 1 — Технический фундамент

**Работы:** инициализация Next.js + TS + Tailwind, ESLint, тесты и CI, единый дизайн-токен, Git workflows, локальная PostgreSQL и NocoDB через Docker Compose, выбор ORM, авторизации и CMS через ADR. Раздельная среда staging, `.env.example`, тестовые учётные записи.

**Готовность:** воспроизводимый `dev`, `build`, миграции SQL, локальный вход админа, доступ к NocoDB к безопасным тестовым таблицам, минимум 1 сценарий CI.

**Нельзя:** подключать production Airtable/финансовые ключи к локальной среде без специальных мер безопасности.

### Этап 2 — Сквозной прототип CRM → карта

Ранний прототип карты нужен, чтобы проверить неизвестную исходную структуру до переноса всех страниц.

**Работы:** нормализовать справочники сетей, магазинов, товаров; сделать импорт тестового фрагмента таблицы в PostgreSQL; настроить управляемое редактирование через NocoDB, валидацию координат и SKU; API выдаёт GeoJSON; Mapbox отображает точки и фильтры.

**Вариант A (предпочтительный для MVP):** NocoDB → PostgreSQL → `/api/map/locations` GeoJSON → Mapbox GL JS (live-перечитывание/инвалидация кеша).  
**Вариант B (для больших объёмов):** NocoDB → PostgreSQL → фоновые выгрузки/changesets Mapbox Tiling Service → публикация tileset → карта. Публикация MTS асинхронна; кэш может задержать изменения.  
**Решение:** выбрать после измерения числа точек и частоты редакций, а также требований к существующему `Products`.

**Готовность:** сотрудник изменил доступность продукта в CRM → изменение после публикации отражено на карте → журнал редакций и откат работают.

### Этап 3 — Публичный сайт / каталог / блог

**Работы:** компоненты, маршруты, адаптивная верстка, RU/EN, поиск по каталогу, перенос медиа, замена форм, метатеги, canonical, sitemap, redirects, аналитика, cookie и правовые блоки. Выбор rich-content CMS отдельно: NocoDB может хранить структурные записи, но визуальный редактор сложных страниц требует отдельного решения.

**Готовность:** согласованные страницы и контент, нет битых внутренних ссылок, SEO-редиректы, performance/accessibility критерии, визуальная приёмка.

### Этап 4 — «Агент Глетчер»: личный кабинет и Airtable → NocoDB/PostgreSQL

**Работы:** аудит личного кабинета и Collabza, правила биркоинов, статусы, награды, история, подтверждение личности/почты, проектирование `users`, `agent_profiles`, `point_transactions`, `reward_rules`, `rewards`, `redemptions` (предварительные имена), подготовка миграции через экспорт и тестовый импорт NocoDB.

**Обязательные проверки:** links/lookups/rollups/формулы, исходные IDs, балансы до/после, отсутствие дублей, проверка выборки пользователей, повторяемость экспорта, пересчёт с реестром начислений, план отката. Формулы Airtable импортируются не полностью — требуется ручная проверка и реконструкция.

**Готовность:** при сравнении тестовой/боевой системы нет необъяснённых расхождений; пользователь видит корректный баланс/историю и может восстановить доступ.

### Этап 5 — Экскурсии и сертификаты

**Работы:** согласовать тарифы и условия, ERD, расписание, вместимость, заявки, резервирование со сроком удержания, оплата, отмены/возвраты, email, чековая интеграция, PDF-генерация, QR/коды сертификатов и их погашение.

**Рекомендуемые сущности:** `tour_types`, `tour_slots`, `booking_holds`, `bookings`, `payments`, `payment_events`, `gift_certificates`, `certificate_redemptions`, `outbox_messages`.

**Обязательные проверки:** конкурирующие заявки на последнее место, двойные webhook, повторные платежи, сбой email после успешной оплаты, истёкший сертификат, частичная отмена, отмена мероприятия, резерв и ручное подтверждение.

**Готовность:** полный тестовый путь от брони до подтверждённой оплаты, письма с сертификатом и корректного погашения без повторного использования.

### Этап 6 — Переключение и эксплуатация

**Работы:** staging с копией *обезличенных* данных, end-to-end проверки, accessibility/SEO/performance, аудит прав, бэкапы с восстановлением, мониторинг, алерты, load tests, freeze/sync данных, DNS cutover, контроль 404/ошибок и rollback.

**Готовность:** чек-лист перед production подписан, известна точка возврата на старую систему, получены права на DNS/сертификаты и ответственное лицо на стороне бизнеса.

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

1. **0001 Database:** PostgreSQL + NocoDB, раздельные роли/схемы, стратегия миграций; проверка лицензии и edition NocoDB.
2. **0002 ORM:** Prisma vs Drizzle; требования к транзакциям, миграциям, фильтрам геоданных.
3. **0003 Auth:** регистрация, email/phone, перенос Collabza, MFA для админов.
4. **0004 CMS:** редактор страниц/блога с встраиваемыми React-компонентами (Puck или иной), медиатека, редакционные права.
5. **0005 Map:** GeoJSON API vs MTS, существующие источники и свойство `Products`, статусы публикации.
6. **0006 Background jobs:** Postgres-backed job queue / отдельный worker / managed service; обработка email и webhooks.
7. **0007 Hosting:** Compute Cloud vs container platform, сеть, TLS, cost estimation, Dev/Staging/Prod.
8. **0008 Booking and Payments:** конечный автомат брони, продавец услуги, правила чека/возврата, идемпотентность.

## 6. Технические принципы

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
| SEO проседает после переноса | URL inventory, redirects, sitemap, Search Console/Метрика, мониторинг |
| Правовые требования | Аудит 152-ФЗ, 54-ФЗ, особенностей сервиса и алкогольных ограничений |

## 8. Что запросить у владельца проекта в первую очередь

**Приоритет 1 — чтобы закончить архитектуру карты:** просмотр Google-таблицы, описание редактирования (кто и как часто), сколько торговых точек, ID текущих Mapbox source/tileset и пример feature с `Products`.

**Приоритет 2 — чтобы спроектировать миграцию программы:** read-only экспорты структуры Airtable, правила начислений и списаний, какая часть профиля ведётся в Collabza, каких Make.com сценариев касается программа.

**Приоритет 3 — чтобы определить бронирование:** карточки типов услуг в YCLIENTS, условия предоплаты и сертификатов, подтверждённый платёжный оператор и юридическое лицо получателя платежа.

**Приоритет 4 — чтобы выбрать инфраструктуру:** количество посетителей/агентов/записей, допустимый бюджет Yandex Cloud, доступ к DNS и владение Mapbox аккаунтом.

## 9. Следующее задание Cursor Agent

> **Read-only architecture discovery.** Просмотри локальный репозиторий и публичные страницы gletcherbrewery.com. Создай `docs/architecture.md`, `docs/migration-inventory.md`, `docs/data-model.md` и предложи ADR по PostgreSQL + NocoDB, Mapbox data pipeline и auth. Не приступай к миграциям или созданию production-интеграций. Покажи факты отдельно от предположений и перечисли материалы, которые необходимы от владельца проекта.

## 10. Официальные первоисточники

- NocoDB PostgreSQL external source: https://nocodb.com/docs/product/integrations/data-sources/connect-to-data-source
- NocoDB Airtable import: https://nocodb.com/docs/product/projects/import-project-from-airtable
- NocoDB self-hosted/licensing: https://nocodb.com/docs/self-hosting
- Mapbox MTS API: https://docs.mapbox.com/api/maps/mapbox-tiling-service/
- Mapbox GeoJSON sources: https://docs.mapbox.com/mapbox-gl-js/guides/add-your-data/style-layers/
- Yandex Managed PostgreSQL: https://yandex.cloud/ru/docs/managed-postgresql/
- Yandex Cloud Postbox: https://yandex.cloud/ru/docs/postbox/
- ЮKassa webhooks: https://yookassa.ru/developers/using-api/webhooks
- ЮKassa idempotency: https://yookassa.ru/developers/using-api/interaction-format
