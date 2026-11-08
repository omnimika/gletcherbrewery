# Reference Page Proposal — Gletcher Brewery

> Дата: **31 октября 2026**  
> **Решение владельца: эталон утверждён — `/beer` (кандидат A).**  
> `/beer` **принят владельцем 31.10.2026** по актуальному AGENTS §7.
> Ниже сохранена история выбора эталона; текущая задача — product template этапа 4.
> Дополнено: шрифты/ассеты из `tmp/` перенесены в `assets/`; ЛК исследован (см. `MEMBERS_LK_INVENTORY.md`).

## 0. Статус решения

| Параметр | Значение |
|---|---|
| Утверждённая эталонная страница | **`/beer`** |
| Дата утверждения | 31.10.2026 |
| Следующий шаг | завершить проверки и приёмку product template по [baseline](PRODUCT_PAGE_BASELINE.md) |
| Вне scope эталона | Mapbox, YCLIENTS, Tilda Members/ЛК, shop cart, payments |
| Реализация | **Started 31.10.2026** — Design Foundation + `/beer` в коде |

## 1. Кандидаты

### A. `/beer` — Каталог продукции (**утверждено**)

Публичный каталог с фильтрами ALL / CLASSIC / CRAFT / LIMITED, сеткой/слайдером бутылок и lead-формой.

### B. `/` — Главная

Бренд-hero, много секций CTA, превью блога, newsletter, максимальная репрезентативность chrome.

### C. `/beer/friday-avenue-apa` — Карточка сорта

Типовой product template (specs, pairing, related), тиражируется на ~18 RU (+ EN) страниц.

## 2. Сравнительная таблица

| Критерий (1–5, выше = лучше для *первой* эталонной) | A `/beer` | B `/` | C Product |
|---|---:|---:|---:|
| 1. Репрезентативность общих UI (header/footer/age-gate/locale/nav) | 5 | 5 | 5 |
| 2. Умеренная визуальная/адаптивная сложность | **4** | 2 | 3 |
| 3. Минимум внешних интеграций (нет Mapbox/YCLIENTS/Collabza/Store) | **5** | 4 | 5 |
| 4. Повторное использование кода дальше по миграции | **5** | 3 | 5 |
| 5. Доступность ассетов для старта | **5** (fonts + CATALOGUE bottles в `assets/`) | 4 | 5 |
| Сумма (после поставки ассетов) | **24** | 18 | 23 |

Дополнительно:

| Риск / фактор | A | B | C |
|---|---|---|---|
| Длина страницы / число секций | Средняя | Очень высокая | Средняя |
| Зависимость от контентной модели | Список продуктов + категории | Много копирайта и кампаний | Одна сущность Product |
| Мобильный паттерн | Filters + slider — ценный | Много уникальных блоков | Specs stack |
| Блокеры | Категории Confirmed в CSV | motion; media video | полный набор полей |

## 3. Рекомендация → утверждено

**Эталон: `/beer`.** Аргументы сохранены: общий chrome, ProductCard/filters, без тяжёлых интеграций, ассеты теперь локально в `assets/catalog/bottles` и `assets/brand/fonts`.

## 4. Scope первой реализации (после утверждения)

### Входит

- App Router route `src/app/beer/page.tsx` (+ layout chrome).
- `AgeGate`, `SiteHeader`, `MainNavOverlay`, `LocaleSwitch`, `SiteFooter`.
- Hero copy каталога (RU).
- Filter chips (клиентская фильтрация по fixture-данным).
- Сетка продуктов desktop + slider/arrows mobile.
- Lead-форма UI (submit → stub/API mock, без Tilda).
- Metadata title/description/canonical как на проде.
- Статические изображения: временно remote Tilda CDN **или** экспортированные файлы в `public/` (предпочтительно после получения прав).

### Не входит

- Полный паритет UI EN listing (props RU/EN уже в `product-props.ts` / CSV; routing per ADR 0001).
- Подключение PostgreSQL / NocoDB / Mapbox / YCLIENTS / Collabza.
- Онлайн-оплата, корзина, личный кабинет.
- Полный home или все product pages (кроме опционально 1–2 fixture cards).

## 5. План работ после утверждения

1. **Этап 2 — Design Foundation**  
   Tokens из аудита (`#E6EEFC`, `#0D0F49`, `#E5373C`, type scale, spacing).  
   Primitives + global layout.  
   Критерий: Story/страница-песочница header/footer/age-gate на 1440 и 390.
2. **Этап 3 — Reference `/beer`**  
   Контентные секции по SITE_INVENTORY §4.2.  
   Fixture JSON продуктов (slug, name, category, image, badge).  
   Визуальная приёмка vs production screenshots.
3. **Сразу после приёмки (этап 4 start)**  
   Один product route `/beer/[slug]` на базе тех же tokens.  
   Затем home.

## 6. Критерии визуальной приёмки эталона

Исторический checklist этапов 2–3 ниже не является требованием повторной
приёмки `/beer`. Факт принятия не подменяет отдельные технические проверки;
новые функциональные замечания — в [текущем ревью](../reviews/2026-10-31-product-template.md).

- [ ] Age-gate выглядит и ведёт себя близко к Tilda (copy + CTA).
- [ ] Header/logo/lang/menu на 1440 и 390 совпадают по композиции.
- [ ] Menu overlay: пункты, CTA входа, цвет фона.
- [ ] Filter chips: актив/неактив.
- [ ] Карточки: порядок/кадрирование бутылок приемлемы (допуск на font metric).
- [ ] Footer: контакты, 18+, policy link.
- [ ] Нет горизонтального скролла на 390.
- [ ] `npm run build && npm run lint && npm run typecheck` зелёные для принимаемого состояния.
- [ ] Меню кликабельно и управляется с клавиатуры; модальный DOM вне inert-фона, фокус возвращается после разблокировки.
- [ ] Смена категории после прокрутки карусели показывает её начало; viewport-height контракт проверен на 960×900 и мобильном экране.
- [ ] Lighthouse a11y: нет пустых link names у карточек (улучшение относительно Tilda — допустимо и желательно).

## 7. Материалы — статус

| Материал | Статус |
|---|---|
| Утверждение `/beer` | **Done** |
| Шрифты Gratimo / ABC Gravity | **В репо:** `assets/brand/fonts/` (часть — Trial; проверить лицензию перед public deploy) |
| Логотипы | **В репо:** `assets/brand/logos/` + PDF в `docs/brand/` |
| Бутылки CATALOGUE | **В репо:** `assets/catalog/bottles/` |
| Обложки / сортовые лого | **В репо:** `assets/catalog/covers`, `assets/catalog/logos` |
| Категории CLASSIC/CRAFT/LIMITED/AGING, порядок и badges | **Confirmed** — owner CSV + chip AGING для CYNIC; ключ `aging` (не `aged`) |
| PNG Cynic и MoA non-alcoholic | **Есть** — пути `CATALOGUE__0018_CYNIC---bottle.png` и `CATALOGUE__0017_Milk-of-Amnesia-non-alcoholic---bottle.png` существуют в `public/catalog/bottles/` |
| Tilda sources | **MCP доступ подтверждён** в Cursor; полный датированный snapshot и editor/published сверка открыты: [workflow](TILDA_MCP_WORKFLOW.md) |
| EN на эталоне | RU/EN срез реализован; каталог принят, product template имеет отдельный gate |
| Лицензии Trial-шрифтов | **Open** — не публиковать Trial в прод без покупки |

## 8. Неизвестные параметры (не блокируют старт этапа 2)

- Визуальное поведение карусели и фильтров на целевых viewport; категории и badges уже отражены в фикстурах по owner CSV.
- Поведение формы «Есть идеи?» (получатель, Make.com).
- Какой width ABC Gravity фактически на `/beer` (Condensed / ExtraCondensed / …).

---

## 9. Статус реализации (31.10.2026)

Собраны этап 2 + черновик этапа 3:

- Tokens / fonts / `SiteShell` (AgeGate, Header, Menu, Footer)
- Route `http://localhost:3000/beer` — hero, filters, gallery, lead form stub
- Историческая проверка `81713e4`: TypeScript PASS, ESLint FAIL в галерее.
  В `9e0ee8e` + product working tree свежие TypeScript/ESLint PASS; Codex
  не запускал текущий build/browser. Подробности в новом ревью.
- ADR: `docs/adr/0000-site-migration-strategy.md`

**Сейчас:** `/beer` принят; прежние F01–F05 исправлены по коду, F06 остался
в home CTA. Новый product template ждёт T01 H1, media/SEO/browser проверки и
собственной приёмки: [ревью](../reviews/2026-10-31-product-template.md).
Лицензии публичных шрифтов остаются отдельным gate перед деплоем.

Исходный scope этапа 3 выше сохранён как история выбора эталона. Фактически
идёт RU/EN срез этапа 4 по Accepted ADR 0001 после принятия каталога.
Операционный порядок: [CURSOR_NEXT_STEPS](../CURSOR_NEXT_STEPS.md).

Коммит/push — только по запросу.
