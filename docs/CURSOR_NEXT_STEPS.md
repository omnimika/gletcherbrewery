# Текущее задание Cursor Agent

Дата: **01.11.2026**. DS-3 в работе.
Следующее: **DS-3 home mid-blocks** — следующий band без `HomeWindowStage`
(promos / tours / menu / newsletter) **по одному**; или catalog/product.
[Дизайн-код](design/DESIGN_SYSTEM.md), [ADR 0010](adr/0010-design-system-and-section-layout.md),
[серия](SPRINT_PLAN.md).

## DS-3 срез (этот запуск) — home `#blog` + `BlogLatestPosts`

- Новый компонент `BlogLatestPosts` — дизайн с Tilda page `17104885`
  (`module/product-page`): `#rec277882204` (SVG «БЛОГ») + `#rec277844567`
  (FD301, 4 поста, cover + tag on image + title/descr/date)
- Данные: `getLatestBlogPosts(locale, 4)` из listing cards (cover/descr/date)
- `HomeBlog` → thin wrapper; `#blog` off `HomeWindowStage`, `SectionFrame` + snap
- Title mark: `public/home/blog-title.svg`

## Ранее в DS-3

- `#moa` off stage (`HomeMoaBanner` + `DocumentProximitySnap`)
- `/contacts`, partnership shell (+ materials hover, bottle carousel hero)
- Home anchors only

## Следующий один band / template

1. **`#promos`** (B2B + map cards) — следующий логичный mid-block off stage.
2. Или `#tours` / `#menu` / `#newsletter`.
3. Или catalog `/beer` / product — отдельный template pass.

Не брать blog listing redesign в том же запуске (listing уже отдельный).

## Backlog

Sprint 5 remainder после DS-3: `/shopping-rules`, agent/tours/map/shop.
Commit/push только по запросу.
