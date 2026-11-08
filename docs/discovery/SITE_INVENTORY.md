# Site Inventory — Gletcher Brewery

> Дата аудита: **31 октября 2026**  
> Источник: публичный сайт `https://www.gletcherbrewery.com` (Tilda project id **1212341**)  
> Режим: публичный сайт read-only; 31.10.2026 дополнительно выполнен согласованный вход в ЛК (без отправки форм/покупок).  
> Эталон: **`/beer` утверждён** владельцем.  
> Статусы фактов: **Confirmed** / **Observed** / **Assumed** / **Unknown**

## 0. Готовность этапа 0 (Bootstrap)

| Проверка | Результат | Статус |
|---|---|---|
| `package.json` Next.js 16.4.3 + React 19 + Tailwind 4 | Есть | Confirmed |
| `src/app` (layout, page, globals.css) | Есть | Confirmed |
| TypeScript strict / `@/*` | Есть (`tsconfig.json`) | Confirmed |
| `npm run build` | Успешно | Confirmed |
| `npm run typecheck` / `npm run lint` | Успешно | Confirmed |
| Production-интеграции (БД, NocoDB, Mapbox app) | Не подключены — ожидаемо | Confirmed |

**Вывод:** этап 0 пройден; этап 1 (этот документ) можно считать выполненным по артефактам.

## 1. Метод исследования

1. HTTP-чтение `robots.txt`, `sitemap.xml`, `sitemap-feeds.xml`, `sitemap-store.xml`.
2. Выгрузка HTML ключевых маршрутов и парсинг title/description/canonical/интеграций.
3. Браузерный осмотр (Cursor IDE Browser): viewport **1440×900** и **390×844**.
4. Визуальные референсы: age-gate, hero главной, overlay-меню, мобильный каталог `/beer`.

**Ограничения**

- Age-gate (Tilda `t658`) блокирует контент до подтверждения 18+; после клика «ДА. ПЕРЕЙТИ НА САЙТ.» контент доступен в сессии браузера.
- Часть карточек каталога — image-link без accessible name (**Observed** a11y-пробел).
- Файлы шрифта поставлены владельцем в `tmp/` и перенесены в `assets/brand/fonts/` (**Confirmed** наличие; лицензия Trial — Open).
- Личный кабинет исследован после входа: см. `MEMBERS_LK_INVENTORY.md`. Auth = **Tilda Members**, не Collabza.
- Не все `Disallow` из robots посещены; устаревшие `/beer/*` помечены как legacy-кандидаты на 301/410.

## 2. Карта публичных маршрутов

### 2.1. Основная навигация (RU) — Confirmed

| URL | Назначение | Тип | Внешние интеграции | Приоритет миграции |
|---|---|---|---|---|
| `/` | Главная / бренд | Landing | Аналитика (YM, GTM, FB/VK pixels) | P0 |
| `/beer` | Каталог продукции | Catalog + filters | Форма «Есть идеи?» | P0 |
| `/beer/{slug}` | Карточка сорта | Product template | — | P0 |
| `/blog` | Лента блога | Feed listing | Tilda Feed | P1 |
| `/blog-all` | Все записи | Feed archive | Tilda Feed | P1 |
| `/blog-all/tpost/{id}-{slug}` | Статья | Article | — | P1 |
| `/blog/{slug}` | Отдельные legacy/campaign-статьи | Static article | — | P1 |
| `/map` | Карта продаж | Map app page | **Mapbox GL** style `omnicoremaps/cknj3azmg0w2t17qqmylsfz8x`; public `pk.` в HTML | P2 (UI сейчас, данные позже) |
| `/agent` | «Агент Глетчер» лендинг | Landing + auth CTAs | Tilda Members (`/members/*`) | P2 публичный UI / P3 кабинет |
| `/tours` | Экскурсии | Landing + booking | **YCLIENTS** iframes `n1347695.yclients.com` | P2 UI / P3 booking |
| `/shop` | Фирменный магазин / предзаказ | Tilda Store | Cart (`tcart`) | P2; юр. ограничения алкоголя — Open |
| `/partnership` | Партнёрам / B2B | Landing + lead form | Tilda forms | P1 |
| `/horeca` | Опт / HoReCa (SEO-посадка) | Landing | — | P1 |
| `/contacts` | Контакты | Contact + form | — | P1 |
| `/policy` | Политика конфиденциальности | Legal | — | P1 |
| `/shopping-rules` | Правила магазина | Legal | — | P1 |
| `/aging` | Промо CYNIC barrel-aged | Campaign | — | P2 |
| `/10-years` | Юбилейная | Campaign | Mapbox упоминается в HTML | P3 |
| `/restaurant` | Банкеты/ресторан | Landing + forms | — | P3 |
| `/vacancies` | Вакансии | Landing | robots Disallow, но HTTP 200 | P3 |
| `/about` | О нас | Landing с анимацией/логикой | Исторически robots Disallow, HTTP 200; source page71867465 | **Обязательный A1, owner 05.11**; см. ABOUT_PAGE_BASELINE.md |

### 2.2. EN-локаль — Confirmed в sitemap

| URL | Назначение |
|---|---|
| `/en` | EN home |
| `/en/beer`, `/en/beer/{slug}` | Каталог и карточки |
| `/en/tours`, `/en/partnership`, `/en/map` | Разделы |
| `/en/blog`, `/en/blog-all`, `/en/blog-all/tpost/...` | Блог EN (42 URL в feed sitemap) |
| `/en/aging` | EN promo |

**Observed:** переключатель RU/EN в header; `hreflang` в выгруженном HTML часто **пустой** — для SEO нужно отдельно сверить и восстановить пары.

### 2.3. Auth / members (Tilda Members) — Confirmed после входа

Подробно: [`MEMBERS_LK_INVENTORY.md`](./MEMBERS_LK_INVENTORY.md).

| URL | Примечание | Статус |
|---|---|---|
| `/members/login` | Tilda Members sign-in UI | Confirmed |
| `/members/signup` | Имя, email, телефон, город, согласие ПДн | Confirmed UI |
| `/members/lk` | Кабинет: баланс ₿, статусы, чеки, рефералка, магазин наград, амбассадор | Confirmed |
| `/members/purchases` | История заказов мерча | Confirmed |
| `/members/recover-password` | Ссылка с login; без session curl → 403 | Observed |

### 2.4. Служебные / modular Tilda pages

Доступны, но не для SEO (часто Disallow): `/header`, `/footer`, `/blog-top`, `/blog-bottom`, `/module/product-page`, `/recommendations-slider`, `/error`, `/ex-test`.

**Assumed:** header/footer подключаются как Tilda library blocks на страницах.

### 2.5. Sitemap / robots — Confirmed

| Ресурс | Содержание |
|---|---|
| `sitemap.xml` | **76** URL (основные страницы + RU/EN beer + часть блога) |
| `sitemap-feed-921152316206.xml` | **83** RU tpost-статей |
| `sitemap-feed-370831704951.xml` | **42** EN tpost-статей |
| `sitemap-store.xml` | пустой / без `<loc>` |
| `robots.txt` | **194** Disallow; много старых `/beer/*`, events, members, tilda endpoints |

**Оценка полного публичного покрытия (Observed):** ≈ 76 (sitemap) + 83 + 42 feed ≈ **200+** индексируемых URL, плюс legacy Disallow.

## 3. Каталог пива (RU) — Confirmed slugs

Фильтры на `/beer` (**Observed** в UI): `ALL` · `CLASSIC` · `CRAFT` · `LIMITED`.

Ссылки на карточки с `/beer` (DOM, 31.10.2026):

| Slug | В sitemap | Примечание |
|---|---|---|
| `/beer/ausweis` | нет (Disallow) | На каталоге есть; SEO-статус уточнить |
| `/beer/blue-monkey` | да | |
| `/beer/bowler-ipa` | да | |
| `/beer/brainstorm` | да | |
| `/beer/brut-grapefruit` | да | |
| `/beer/cynic` | да | также промо `/aging` |
| `/beer/friday-avenue-apa` | да | эталон карточки |
| `/beer/heidegger-hell` | да | |
| `/beer/hop-dragon` | да | |
| `/beer/iron-woods-dry-stout` | да | |
| `/beer/iron-woods-milk-stout` | да | |
| `/beer/milk-of-amnesia-non-alco` | да | |
| `/beer/milk-of-amnesia-v-tropic` | да | |
| `/beer/nut-butter` | да | |
| `/beer/rouge-de-fleur` | да | |
| `/beer/ruby-road` | да | |
| `/beer/tour-de-grapefruit` | да | |
| `/beer/underground-ale` | да | |

В sitemap также: `/beer/brainstorm-apa-alcohol-free` (отдельный slug от `/beer/brainstorm`).

**EN slug map — Confirmed** (live HTTP 200 scrape 31.10.2026; полная таблица в [`PRODUCT_PROPS_INVENTORY.md`](./PRODUCT_PROPS_INVENTORY.md)):

| RU slug | EN slug |
|---|---|
| `milk-of-amnesia-v-tropic` | `milk-of-amnesia` |
| `brainstorm` | `brainstorm-apa-alcohol-free` |
| остальные из каталога (18) | совпадают с RU (в т.ч. `ausweis`, `cynic`) |

Sitemap может отставать (исторически ~17 EN beer URL); источником истины для миграции считать карту выше + CSV props.

## 4. Шаблоны страниц и блоки

### 4.1. `/` Главная — Observed

Порядок блоков (desktop 1440, после age-gate):

1. Sticky/overlay header: logo, RU/EN, «А / АГЕНТ», «МЕНЮ».
2. Hero: oversized typography «ПИВОВАРНЯ / GLETCHER», bottle product shot, seal «QUI QUAERIT, REPERIT!».
3. Brand statement («Мы создаем особенное пиво…»).
4. B2B / дистрибуция / карта — CTA «ПЕРЕЙТИ НА КАРТУ», «ОСТАВИТЬ ЗАЯВКУ».
5. Магазин — «В МАГАЗИН».
6. Экскурсии — «ЗАБРОНИРОВАТЬ».
7. География — «ИСКАТЬ».
8. Медиа/новости — «СМОТРЕТЬ» / «ЧИТАТЬ».
9. Продукция — «В КАТАЛОГ».
10. Лента превью постов блога.
11. Newsletter (email + «ПОДПИСАТЬСЯ»).
12. Footer: контакты, policy, соцсети, Яндекс-рейтинг, 18+.

Интерактив: overlay-меню `#menuclick`; age-gate; подписка (не тестировалась отправкой).

### 4.2. `/beer` Каталог — Observed

1. Header + age-gate.
2. Hero-текст каталога («ПОЛНЫЙ СПЕКТР СОВРЕМЕННОГО ПИВОВАРЕНИЯ»).
3. Filter chips ALL/CLASSIC/CRAFT/LIMITED.
4. Сетка/слайдер бутылок-карточек (mobile: стрелки слайдера, бейдж NEW!).
5. Блок «ЕСТЬ ИДЕИ? НАПИШИТЕ НАМ!» — форма Имя/Email/Комментарий.
6. Footer.

### 4.3. `/beer/{slug}` Карточка — Observed (`friday-avenue-apa`)

Блоки: название/лейбл, «Чего ожидать», «О вкусе», солод/хмель, food pairing, specs (ABV / плотность / IBU / стиль / брожение / объёмы 0.5l / 20l), «ПОПРОБУЙТЕ ТАКЖЕ», legal 18+.

### 4.4. `/tours` — Confirmed content + Observed widgets

- Типы: групповая / индивидуальная (VIP); цены отображаются на сайте (**не фиксировать как утверждённые бизнес-правила**).
- Правила: 18+, паспорт, ~2 часа, предоплата 100% (текст на странице).
- Виджеты YCLIENTS (personal select-services + group-events).
- Как добраться; реквизиты ИП для экскурсий.

### 4.5. `/map` — Observed

- Полноэкранная/крупная Mapbox-карта.
- Style: `mapbox://styles/omnicoremaps/cknj3azmg0w2t17qqmylsfz8x`.
- В HTML присутствует public access token (`pk.`) — **не копировать в клиент Next без ревизии безопасности**.
- Popup template ссылается на `featurePop.properties.Title` (**Confirmed** в HTML).

### 4.6. `/agent` — Observed

- Лендинг бонусной программы / «биркоины».
- CTA регистрация/вход → `/members/signup`, `/members/login`.
- Видео-ассеты на `files.gletcherbrewery.com` (coin animation).

### 4.7. `/shop` — Observed

- Tilda Store + cart markers в HTML.
- Адрес магазина в Клину; контакты; юрлицо ИП Мищенко (текст страницы).
- Онлайн-продажа алкоголя: **не подтверждать scope без юр. согласования** (AGENTS.md).

### 4.8. `/partnership` / `/horeca` / `/contacts`

- B2B value props (дистрибуция, оборудование, ассортимент).
- Lead-формы Tilda.
- `/contacts`: юр. адрес ООО «ГЛЕТЧЕР», телефоны, email.

## 5. Глобальные UX-сценарии

| Сценарий | Точки входа | Статус для Next.js |
|---|---|---|
| Age-gate 18+ | Все публичные страницы с алкогольным контентом | Обязательный глобальный компонент |
| Навигация RU | Меню overlay | SiteHeader + MobileNav |
| Локализация RU↔EN (+ future) | Pill RU/EN | i18n routing `/` ↔ `/en` (+ `sr`/`hy`/`ka`/`de` Proposed, ADR 0001) |
| Каталог → карточка | `/beer` → `/beer/{slug}` | App Router dynamic |
| Карта точек | `/map` | Позже: GeoJSON API; сейчас UI-заглушка допустима |
| Запись на экскурсию | `/tours` → YCLIENTS | Сначала embed/заглушка; замена на этапе 8 |
| Агент: регистрация/вход | `/agent`, меню | **Tilda Members** → своя auth (этап 7); Collabza не подтверждён |
| Подписка / lead-формы | Home, beer, partnership, contacts | Серверные handlers + согласие на ПДн |
| Магазин/корзина | `/shop` | Отдельное решение; юр. риск |

## 6. Аналитика и трекинг — Observed в HTML

- Яндекс.Метрика (`mc.yandex.ru`)
- Google Tag Manager `GTM-TPG89GG`
- Facebook Pixel / VK pixel scripts
- AMP runtime script host `cdn.ampproject.org` (Tilda default)

Перенос: согласовать список счётчиков до launch; не терять ID.

## 7. Требования к переносу на Next.js (высокоуровнево)

1. Сохранить URL 1:1 для sitemap + feed tpost (или 301-матрица).
2. Вынести shared layout: AgeGate, Header, Footer, LocaleSwitch.
3. Каталог и product page — первые контентные шаблоны после design foundation.
4. Не встраивать Mapbox write token; read token — через env, ideally server-proxied config.
5. YCLIENTS на `/tours` — временный iframe до своей брони.
6. Контент блога: импорт из Tilda Feed / экспорт; модель CMS — ADR позже.
7. Медиа: `static.tildacdn.com`, `thb.tildacdn.com`, `files.gletcherbrewery.com` → Object Storage / `public` после прав на ассеты.

## 8. Открытые вопросы владельцу

1. `/about` **обязателен Confirmed владельцем 05.11**, включая animation/interaction
   logic Tilda 71867465: [baseline A1](ABOUT_PAGE_BASELINE.md). Вопрос о необходимости
   снят; актуальные editor/published, EN/index уточнить. Для `/vacancies` вопрос
   публикационного статуса из этого исторического inventory решается отдельно.
2. Полный список активных сортов vs Disallow legacy — что 301, что 410?
3. Лицензии шрифтов: можно ли использовать **Trial** ABC Gravity / demo Gratimo в staging/prod, или есть купленные файлы?
4. Таблица сортов → CLASSIC / CRAFT / LIMITED для `/beer`.
5. Доступ к экспорту Tilda + схеме Airtable/Make для биркоинов (этап 7).
6. Нужна ли EN на эталоне `/beer` сразу?
7. Магазин: только самовывоз/предзаказ мерча или алкоголь online?
8. ~~Подтвердить роль Collabza~~ → см. `INTEGRATIONS_AUDIT.md` (Collabza = data transfer, не auth).
9. Срочно: оплата Airtable (Payment failed).
10. Make blueprint export + список формул Airtable.

---

Ассеты: `assets/`. Discovery: `MEMBERS_LK_INVENTORY.md`, **`INTEGRATIONS_AUDIT.md`**.
