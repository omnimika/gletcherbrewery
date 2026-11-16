# Integrations Audit — Collabza · Make · Airtable

> Дата: **31 октября 2026**  
> Режим: согласованный вход владельцем; пароли **не сохраняются** в Git.  
> PII из таблиц **не копируются** в документ (только схема/объёмы).  
> Статусы: **Confirmed** / **Observed** / **Assumed** / **Unknown**

**Исторический snapshot31.10, не live-status09.11.** Сейчас data/forms — текущий
приоритет; [SOURCE_INVENTORY](../data/SOURCE_INVENTORY.md) разделяет свежие metadata,
старые observations и Open schema/exports. Этот аудит не заменяет полный экспорт.

## 0. Важные уточнения к предыдущим допущениям

| Ранее | Сейчас |
|---|---|
| «Collabza = auth ЛК» | **Auth ЛК на сайте = Tilda Members.** Collabza — **транспорт данных** Zero Block ↔ Airtable/Bipium |
| Collabza «не подтверждён» | **Confirmed:** аккаунт Pro2, project `3005660`, 19 интеграций |
| Make «не инвентаризирован» | **Confirmed:** 1 активный сценарий «История заказов» (ID `334247`), ~25+ модулей |
| Airtable схема Open | **Confirmed base:** `appq63sJgcuLGSUPC` «Gletcher Brewery – История заказов», 7 таблиц |

**Observed31.10:** Airtable показывал Payment failed. Текущий billing/доступность
09.11 не проверены; перепроверить статус и возможность защищённого экспорта,
не считать старый баннер доказательством текущей проблемы.

## 1. Архитектура as-is (Observed)

```text
[Пользователь]
    │
    ▼
gletcherbrewery.com  (Tilda)
  · публичный сайт
  · /members/* = Tilda Members UI
  · Zero Block поля ЛК (баланс, чеки, рефералка, магазин…)
    │
    │  Collabza transfer scripts
    │  https://transfer.collabza.ru/s3/<uuid>.js
    ▼
Collabza (Pro2)
  · 17× Airtable
  · 2× Bipium
  · 0× NocoDB (UI предлагает «Переезд на NocoDB»)
    │
    ▼
Airtable base appq63sJgcuLGSUPC
  Пользователи · Чеки · Агенты · Заказы · Покупки · Товары · Акции
    ▲
    │  Make.com scenario 334247 (Instant webhook)
    │  Webhooks → HTTP → Airtable (+ routers/filters)
    └──────────────────────────────────────────────
```

Make и Collabza **оба** пишут/читают Airtable; точные границы ответственности модулей — Open (нужен пошаговый разбор сценария).

## 2. Collabza — Confirmed

| Параметр | Значение |
|---|---|
| Login | `https://collabza.ru/members/login` (тот же Tilda Members stack) |
| Integrations UI | `https://collabza.ru/integrations` → iframe `transfer.collabza.ru` |
| Тариф | Pro2, активен; продление до **15.09.2027**; автопродление выкл. |
| Квоты | Airtable+Bipium **19/40**; NocoDB **0/40** |
| Навигация продукта | Миграция с Airtable, Переезд на NocoDB, Подключение сервера |

### 2.1. Список интеграций (19)

| # | Название | Backend |
|---|---|---|
| 1 | Бипиум: Zero ЛК ЧЕКИ | Bipium |
| 2 | Бипиум Zero ЛК ИНФО (Имя, Email, Баланс…) | Bipium |
| 3 | Zero: ЛК ИНФО (Имя, Email, Город, Баланс (+за все время)) | Airtable |
| 4 | Заявки агентов | Airtable |
| 5 | Чеки - история офлайн покупок | Airtable |
| 6 | Email | Airtable |
| 7 | Zero: ЛК ИНФО (Уровень, Статус, Приз, До следующего уровня, Реферальная ссылка) | Airtable |
| 8 | Уровень | Airtable |
| 9 | Статус | Airtable |
| 10 | Биркоины | Airtable |
| 11 | Биркоины вывод | Airtable |
| 12 | Каталог спецпредложений (bonus) | Airtable |
| 13 | Каталог спецпредложений | Airtable |
| 14 | Спецпредложения - бонусная система | Airtable |
| 15 | Реферальная ссылка | Airtable |
| 16 | Списание бонусов из корзины | Airtable |
| 17 | Мои покупки Gletcher - Заголовок | Airtable |
| 18 | Мои покупки Gletcher | Airtable |
| 19 | Мои Заказы Gletcher Shop | Airtable |

Endpoints вида `transfer.collabza.ru/s3/<uuid>.js` — **не публиковать токены iframe** в docs/Git. Машинный список имён: `docs/discovery/_raw/collabza_integrations.json`.

**Следствие для миграции:** Collabza удобно рассматривать как временный мост; целевой путь ROADMAP (NocoDB поверх PostgreSQL) уже намечен в UI Collabza, но бизнес-логика начислений должна уйти в **серверный ledger**, не в «просто другую таблицу».

## 3. Make.com — Confirmed

| Параметр | Значение |
|---|---|
| Org | `121681` (EU1) |
| Team | `76262` |
| Plan | Core |
| Credits | ~8659 / 10000 (Observed 31.10.2026) |
| Сценарии в списке | **1** видимый: «Gletcher Brewery – История заказов» |
| Scenario ID | `334247` (Shared, **Active**) |
| Создан / обновлён | 16.06.2022 / 09.12.2024 |
| Публичный шаринг | [shared scenario](https://eu1.make.com/public/shared-scenario/wJQZBYZMrmY/gletcher-brewery-istoriya-zakazov) |
| Триггер | Instant (webhook); в истории часто **3 operations / 3 credits** за run |
| Usage 7d | ~372 credits, ~1.4 MB |

### 3.1. Ветки/роутеры (лейблы на диаграмме) — Observed

- Создание пользователей  
- Создание заказа  
- Не чек / Catch all  
- По своей ссылке или пусто  
- Первый раз по ссылке друга  
- По ссылке друга или спецпредложение  
- Не друг  
- Спецпредложение  
- Фото загрузка  
- Форма агента  

Модули на canvas: **Webhooks**, **HTTP**, **Airtable**, **Tools** (Confirmed по иконкам shared view + editor).

**Open:** полный граф модулей (пошаговый dump), список webhook URL, mapping полей, error handlers. Рекомендуется экспорт blueprint JSON из Make (владелец) для ADR этапа 7.

## 4. Airtable — Confirmed

| Параметр | Значение |
|---|---|
| Base name | Gletcher Brewery – История заказов |
| Base ID | `appq63sJgcuLGSUPC` |
| Billing | **Payment failed** banner — риск |
| Views на Пользователи | Главная · Collabza · xls |

### 4.1. Таблицы

| Таблица | Table ID | Notes |
|---|---|---|
| Пользователи | `tblCN54pm2SwmTlsv` | Профиль + баланс + рефералка |
| Чеки | `tblymazDxC3rJeect` | **~4 811 records** (Observed); order_id вида `1212341:<id>` (Tilda project) |
| Агенты | `tblBBDgXoGBspoIQE` | Заявки амбассадоров |
| Заказы | `tblVEEISkwlXY6o3u` | Shop / rewards orders |
| Покупки | `tbl0PtMPIwBTmPjG5` | Line items? |
| Товары | `tbltQbwlpvGbLvF1t` | Каталог спецпредложений |
| Акции | `tblTQUAXmJnGDkXx9` | Promo rules |

### 4.2. Поля «Пользователи» (Observed headers)

`Email`, `id`, `Created`, `phone`, `city`, `Имя`,  
`Биркоины доступно`, `Статус`, `Уровень`, `Процент`, `Статус текущий`, `Приз`,  
`Заказы`, `До следующего уровня`,  
`Биркоины`, `Биркоины вывод`, `Биркоины всего накоплено`,  
`Биркоины начислены`, `Биркоины начислены за чеки`, `Биркоины начислены агентские`, `Биркоины списаны`,  
`Реферальная ссылка`, `Заказы друзей`, `Списать биркоины`, `id друга`,  
`Спецпередложения`, `Использовал`, `Загрузки чеков`.

**Observed:** баланс, похоже, хранится/кэшируется **полями на пользователе**, плюс отдельные начисления/списания — для миграции нужно выяснить, какие поля формульные, какие пишутся Make/Collabza (**Open**, критично для ledger).

### 4.3. Поля «Чеки» (Observed headers)

`order_id`, `Оплачено`, `Дата создания`, `city`, `Покупатель`, `Имя`, `Имя покупателя`, `Название`, `Сумма`,  
`Биркоины начислить2`, `buyplace`, `check`, `Друг`, `Email друга`, `Tilda Дата`, `Tilda Покупки`.

Сводка UI: сумма чеков порядка **₽4.1M**, биркоины начисление sum **205 934** (Observed footer — не аудит точности).

## 5. Связь с публичным ЛК (`/members/lk`)

Сопоставление UI ↔ интеграции (Assumed mapping, высокая уверенность):

| UI ЛК | Вероятный источник |
|---|---|
| Баланс / накоплено / списано | Пользователи + Collabza «Биркоины*» / Zero ИНФО |
| Статус, уровень, приз | Пользователи + Collabza «Уровень/Статус» |
| Реферальная ссылка | Пользователи.`Реферальная ссылка` |
| Загрузка чека | Чеки + Make ветки «Фото загрузка» / «Не чек» |
| Заявка агента | Агенты + Make «Форма агента» + Collabza «Заявки агентов» |
| Магазин наград | Товары/Акции + Collabza каталог + «Списание бонусов из корзины» |
| Мои покупки | Заказы/Покупки + Collabza «Мои покупки/Заказы» |

## 6. Риски и next steps (этап 7, не эталон `/beer`)

1. **Airtable billing/export access** — перепроверить текущее состояние; баннер наблюдался31.10.
2. Баланс на карточке пользователя vs ledger — сверка формул обязательна.  
3. Дублирование Airtable ↔ Bipium (2 интеграции) — зачем, актуально ли.  
4. Make: один жирный сценарий = single point of failure; нужен blueprint export.  
5. Collabza Pro до 2027 — можно использовать как мост на время миграции, но не как целевую архитектуру.  
6. Секреты (пароли чата) — ротация после discovery; хранить только в секрет-хранилище.  
7. Не коммитить iframe tokens / API keys.

## 7. Что запросить у владельца дальше

1. Проверить текущие billing/export access; действие по оплате только по актуальным фактам владельцем.
2. Make → Export blueprint JSON сценария `334247`.  
3. Airtable → список **формульных** полей (или доступ API read-only + schema dump).  
4. Подтвердить роль Bipium (пилот / запас / мёртвый).  
5. Согласовать: Collabza→NocoDB путь vs прямой PostgreSQL+app API.

---

Связанные документы: `MEMBERS_LK_INVENTORY.md`, `SITE_INVENTORY.md`, `docs/ROADMAP.md` этап 7.
