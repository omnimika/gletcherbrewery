# Content & SEO Inventory — Gletcher Brewery

> Дата: **31 октября 2026**  
> Цель: сохранить позиции, URL и индексируемость при миграции на Next.js.

## 1. Индексируемые наборы URL

| Источник | Count | Содержание |
|---|---|---|
| `sitemap.xml` | 76 | Core pages, RU/EN beer, часть блога/кампаний |
| RU feed sitemap | 83 | `/blog-all/tpost/...` |
| EN feed sitemap | 42 | `/en/blog-all/tpost/...` |
| `sitemap-store.xml` | 0 loc | Пусто |
| `robots.txt` Disallow | 194 | Legacy beer, events, members, modular pages |

**Confirmed:** sitemap указывает на `https://www.gletcherbrewery.com/...` (www).

## 2. Ключевые SEO-метаданные (выборка) — Confirmed из HTML

| Path | Title | Description (сокр.) | Canonical |
|---|---|---|---|
| `/` | Gletcher Brewery \| Пивоварня Глетчер | российская крафтовая пивоварня… | `https://www.gletcherbrewery.com/` |
| `/beer` | Каталог \| Пивоварня Глетчер | Каталог продукции | `.../beer` |
| `/blog` | Блог \| Gletcher Brewery | (пусто в HTML) | `.../blog` |
| `/map` | Карта Продаж \| Пивоварня Глетчер | (пусто) | `.../map` |
| `/agent` | Агент Глетчер \| … | Бонусная и реферальная программа… | `.../agent` |
| `/tours` | Экскурсии \| … Пивной тур… | Экскурсия на пивоваренный завод… | `.../tours` |
| `/shop` | Магазин \| Пивоварня Глетчер | Мерчандайз и прочие приятности | `.../shop` |
| `/partnership` | Партнёрам \| … поставки… | Профессиональные поставки… | `.../partnership` |
| `/contacts` | Контакты \| Пивоварня Глетчер | Контакты | `.../contacts` |
| `/policy` | Политика Конфиденциальности \| … | (пусто) | `.../policy` |
| `/horeca` | Российское крафтовое пиво оптом \| … | Широчайший выбор сортов… | `.../horeca` |
| `/aging` | CYNIC. Русский Имперский Стаут \| … | Мягкий коньячный аромат… | `.../aging` |
| `/vacancies` | Вакансии \| … | Вакансии пивоварни… | `.../vacancies` |
| `/en` | Gletcher Brewery \| Official Website | (пусто) | `.../en` |
| `/beer/friday-avenue-apa` | Friday Avenue APA \| Gletcher Brewery | (см. HTML) | `.../beer/friday-avenue-apa` |

Полная таблица парсинга: `docs/discovery/_raw/meta_table.json`.

## 3. H1 / контентные заголовки — Observed

| Path | Заметные H1/H2 |
|---|---|
| `/` | H2 «Пивоварня», H1 «gletcher» |
| `/beer` | Display-заголовки каталога (не всегда semantic H1 в a11y tree) |
| `/tours` | «завод» / «экскурсия» / «на пивоваренный» (разнесённый H1) |
| `/partnership` | «РОССИЙСКОЕ КРАФТОВОЕ ПИВО ОПТОМ…» |
| `/contacts` | «КОНТАКТЫ» |

**Риск:** декоративная типографика Tilda Zero Block дробит H1 — при переносе сохранить визуал, но выровнять один осмысленный H1 на страницу.

## 4. Локализация

| Факт | Статус |
|---|---|
| RU default на `/` | Confirmed |
| EN под `/en/...` | Confirmed |
| UI switcher RU/EN | Confirmed |
| `hreflang` link tags | Часто отсутствуют в HTML (**Observed**) — **Open** для восстановления |
| Паритет beer props RU/EN | **Confirmed** scrape 18/18 detail pages — см. [`PRODUCT_PROPS_INVENTORY.md`](./PRODUCT_PROPS_INVENTORY.md) |
| Расхождение slug RU↔EN | **Confirmed** для MoA и Brainstorm; остальные совпадают |
| Будущие локали `sr`, `hy`, `ka`, `de` | **Proposed** в [`ADR 0001`](../adr/0001-i18n-routing-and-content.md); контент пока пуст |
| Модель контента | Locale-invariant specs + per-locale copy; код: `src/content/product-props.ts` |

**SEO implications:** при добавлении локалей сразу планировать `hreflang` + `x-default` (обычно `ru`), canonical на `www`, и 301 со старых EN/RU slug aliases. Не публиковать пустые locale-URL без перевода.

## 5. Блог

### 5.1. Структуры URL — Confirmed

- Современные статьи: `/blog-all/tpost/{tildaId}-{slug}`
- Часть материалов: короткие `/blog/{slug}`, `/gletcher-goes-vegan`, `/even-more-vegan`, `/ipa-not-apa`
- Listing: `/blog`, archive `/blog-all`
- EN: `/en/blog`, `/en/blog-all/tpost/...`

### 5.2. Категории на главной (Observed)

Превью помечаются как «БИБЛИОТЕКА», «НОВОСТИ», «МЕРОПРИЯТИЯ».

### 5.3. Миграция контента

Нужно экспортировать из Tilda:

- HTML/Markdown тела постов
- cover images + alt
- dates, categories, authors (если есть)
- canonical URL каждого tpost
- EN equivalents mapping

**Нельзя** менять path tpost без 301, иначе потеря трафика.

## 6. Медиа-инвентарь (предварительно)

| Источник | Тип | Примечание |
|---|---|---|
| `static.tildacdn.com` | images/css/js | Основной CDN Tilda |
| `thb.tildacdn.com` | thumbnails | |
| `neo.tildacdn.com` | assets | |
| `files.gletcherbrewery.com` | video (coin, hero comps), PDF презентации | Кастомный хост |
| `assets/catalog/*` (локально) | bottles/covers/logos для эталона | Импорт из `tmp/` 31.10.2026 |
| `assets/brand/*` (локально) | fonts + logos | Импорт из brandbook; Trial fonts — лицензия Open |
| Product bottle photography | key brand assets | Нужен экспорт оригиналов |
| Logo (RU/EN variants) | SVG/PNG | В Tilda; запросить master |

og:image присутствует на многих страницах (Tilda defaults) — зафиксировать при переносе metadata API.

## 7. Внутренние ссылки и IA

Главные хабы: `/`, `/beer`, `/map`, `/tours`, `/partnership`, `/blog`, `/agent`, `/shop`, `/contacts`.

Footer всегда ведёт на policy и контакты.

**Редиректы (план, не реализован):**

| Источник | Кандидат действия | Статус |
|---|---|---|
| Disallow legacy `/beer/*` (десятки) | 301 на актуальный сорт или `/beer` / 410 | Open с владельцем |
| `/about` | Обязательный local landing с animation/interaction logic, Tilda 71867465; см. [A1 baseline](ABOUT_PAGE_BASELINE.md) | **Confirmed owner 05.11** для реализации; index/publication/EN Open |
| `/vacancies` | Publish или noindex+redirect | Open из исторического inventory |
| `/horeca` vs `/partnership` | Возможный дубль тематики | Open SEO |
| `/shop-old`, `/toursold`, `/indexold` | 410/301 | Legacy |
| Events `/klin-may-fest-*` | Архив/redirect | Open |
| Non-www / http | Проверить hosting rules | Unknown |

## 8. Structured data / technical SEO

| Тема | Статус |
|---|---|
| JSON-LD Product/Organization | Unknown — не аудировалось глубоко |
| Open Graph / Twitter cards | OG title/image частично есть |
| robots / sitemap в Next | Нужно воспроизвести + обновить |
| Core Web Vitals | Tilda heavy; Next должен улучшить — замерить после эталона |
| Age-gate vs indexing | Боты могут видеть контент иначе, чем пользователи — проверить | Open |

## 9. Юридический / compliance контент

- Age-gate 18+
- Footer «18+ ПЕЙТЕ КУЛЬТУРНО!» / вред здоровью
- `/policy`, `/shopping-rules`
- Реквизиты на `/tours`, `/shop`, `/contacts` (разные ИП/ООО — **Confirmed** тексты; бизнес-смысл разделения — **Open**)

Онлайн-алкоголь: не обещать e-commerce алкоголя без юр. согласования.

## 10. Материалы, которые нужно экспортировать из Tilda

1. Полный список страниц + SEO URL + meta.
2. Zero Block / fonts (Gratimo).
3. Все изображения продуктов и hero в максимальном качестве.
4. Feed posts RU/EN.
5. Forms: endpoint, поля, receivers (email/Make).
6. Header/footer library blocks.
7. Custom domain files на `files.gletcherbrewery.com`.
8. HTML export или project backup.

## 11. SEO checklist перед cutover (будущее)

- [ ] URL inventory freeze  
- [ ] 301 matrix утверждена  
- [ ] `hreflang` пары  
- [ ] sitemap.xml + feed routes в Next  
- [ ] canonical на каждой странице  
- [ ] meta description заполнены (сейчас часть пустых)  
- [ ] Search Console / Метрика сверка трафика  
- [ ] мониторинг 404 после DNS  

