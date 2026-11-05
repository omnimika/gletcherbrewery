# Текущее задание Cursor Agent

Дата: **05.11.2026**. DS-3 / Sprint 5.
[Дизайн-код](design/DESIGN_SYSTEM.md), [ADR 0010](adr/0010-design-system-and-section-layout.md),
[серия](SPRINT_PLAN.md).

## Срез — `/agent` mobile 320 polish (код готов, ждёт приёмки)

- Hero @≤479: flex stack (title → brand → lines → bottle+seal → CTA).
- Purchases stickers inset; `overflow-x: clip` на секциях.
- Правки в working tree (`agent-page.tsx` / `.module.css`) — **ещё не в commit**.
- Baseline: [AGENT_PAGE_BASELINE.md](discovery/AGENT_PAGE_BASELINE.md)

## Ранее (принято)

- `/shop` firm store v1 — owner 04.11 (RU-only; cart deferred).
- `/map` — owner 04.11 (style, panel, `Product` filter).
- `/tours` RU/EN; `/agent` landing v1; blog listing; `/shopping-rules`; catalog/product.

## Дальше

1. Owner visual QA `/agent` @320 → commit среза.
2. Campaign landings (BMF/Klin/10-years) **или** backend Stage 5+ — по приоритету владельца.

## Backlog

`home-features.tsx` still legacy stage (not on page).
Shop cart / ЮKassa / merch SKU — Stage 8.
Commit/push только по запросу.
