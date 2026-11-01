# Текущее задание Cursor Agent

Дата: **01.11.2026**. DS-3 в работе.
Owner Confirmed: home mid-blocks = **stretch screen slides**
(`SectionFrame mode=screen` + `CompositionGrid` fill), без `HomeWindowStage`.
[Дизайн-код](design/DESIGN_SYSTEM.md), [ADR 0010](adr/0010-design-system-and-section-layout.md),
[серия](SPRINT_PLAN.md).

## DS-3 срез (этот запуск) — home stretch slides

- Primitives: `CompositionGrid fill` (fr rows), `Container fill`, screen height chain
- Showcase: `#screen-halves-x`, `#screen-quarters-y`
- Home: `#moa` `#promos` `#tours` `#menu` `#blog` `#newsletter` → screen + snap
- `#promos` / `#newsletter` — halves-x; `#tours` — quarters-y; `#menu` — 3×2

## Ранее в DS-3

- `/contacts`, partnership shell (+ materials hover, bottle carousel hero)
- DS-1/DS-2 closed

## Следующий один template

1. Catalog `/beer` / product — screen/composition pass.
2. Или residual B2B / shopping-rules.

## Backlog

Sprint 5 remainder: `/shopping-rules`, agent/tours/map/shop.
`home-features.tsx` still legacy stage (not on page).
Commit/push только по запросу.
