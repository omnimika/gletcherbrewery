# ADR 0000 — Site migration strategy

> Status: **Proposed** (31.10.2026)  
> Stage: Design Foundation / Reference `/beer`

## Context

Публичный сайт мигрирует с Tilda на Next.js App Router. Эталон утверждён: `/beer`.

## Decision

1. **Tokens first** — CSS variables в `globals.css` по Observed бренду (`#E6EEFC`, `#0D0F49`, `#E5373C`).
2. **Semantic React** — не копировать Tilda DOM (`t-rec`, `tn-atom`).
3. **Chrome shared** — `AgeGate`, `SiteHeader`, `MainNavOverlay`, `SiteFooter` на всех публичных маршрутах через `SiteShell`.
4. **Content fixtures** — до PostgreSQL/CMS каталог живёт в `src/content/*.ts` (категории CLASSIC/CRAFT/LIMITED/AGING — Confirmed; detail props — `product-props.ts`).
5. **i18n** — ADR 0001 **Accepted**: next-intl, `PUBLISHED_LOCALES` = `ru`/`en`, planned `sr`/`hy`/`ka`/`de`, catalog by stable `id`.
6. **Fonts** — GratimoClassic + Gravity (лицензируемые) в `public/fonts`; ABC Gravity Trial только локально (gitignore), для pixel-match до покупки лицензии.
7. **Route preservation** — `/beer`, будущие `/beer/[slug]` и `/en/beer/[slug]` совпадают с production URL (с учётом slug-map).
8. **Forms** — UI + stub handler; без Tilda/Make до отдельного этапа.

## Consequences

- Этапы 2–3 не блокируются ORM/DB/NocoDB.
- Категории, порядок и badges отражены в owner CSV и фикстурах; повторный запрос этих материалов не нужен. Визуальная приёмка `/beer` остаётся открытой.
- Trial-шрифты не попадают в публичный деплой без лицензии.
- Перед приёмкой исправить текущие дефекты модального меню и карусели из [ревью](../reviews/2026-10-31-current-state.md). Изменение ADR не закрывает замечания к коду.
