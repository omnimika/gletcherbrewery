# Текущее задание Cursor Agent

Дата: 31.10.2026. Ветка `first-front`, dirty tree поверх `9e0ee8e`.
[Ревью](reviews/2026-10-31-product-template.md), [baseline](discovery/PRODUCT_PAGE_BASELINE.md).

## Статус gate `/beer`

Владелец **принял** `/beer` (31.10.2026). Повторную визуальную приёмку каталога
не открывать.

## Product template v1 — код готов к приёмке владельца

### Исправления ревью (этот проход)

| ID | Статус | Что сделано |
|----|--------|-------------|
| T01 | Fixed | Единый `<h1 className="sr-only">` во всех media-ветках ProductHero |
| T02 | Fixed | Focus trap меню включает live header chrome (`chromeRef`) |
| T03 | Fixed | Loop-клоны `inertClone` / `tabIndex=-1`; focus sync в middle copy |
| T04 | Fixed | Home CTA Agent → `productionHref("agent")` |
| T05 | Fixed | Убран `priority` у нижеэкранной бутылки; hover glass без preload |

### Анимации / медиа (запрос владельца)

- Cover/logo → якорь `#about` (smooth scroll).
- Bottle hover → glass fade (ассеты `public/catalog/glasses/*` из `tmp/БОКАЛЫ GLETCHER`).
- Иконки объёмов: `/svg_bottle.svg`, `/svg_keg.svg`.
- Нет glass delivery: underground, brut, tour, cynic — hover не активен.

### Свежие проверки (Cursor, Node 25.5.0)

- `tsc --noEmit`, ESLint changed files, `npm run build` — PASS (42 SSG paths).
- Production `next start --hostname localhost`: **36/36** canonical RU/EN detail
  → HTTP 200 + ровно один H1.
- Browser: Friday + Ausweis hero/H1; home agent → `gletcherbrewery.com/agent`.
- Известное ограничение: `next start --hostname 127.0.0.1` даёт redirect loop
  next-intl (использовать `localhost`).

## Критерий закрытия этапа

Визуальная приёмка product template **владельцем**. До неё следующий публичный
шаблон (home) не начинать. Commit/push — по отдельному разрешению.

## Не сейчас

Home/map/agent/tours backend, NocoDB, новые локали, pixel-perfect Zero Block,
полный legal notice «вред чрезмерного употребления» (пока только drink-responsibly).
