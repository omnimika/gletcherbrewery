# Текущее задание Cursor Agent

Дата: 31.10.2026. Product template принят владельцем поверх `6f84465`
(dirty tree A01–A03 + peer locale hrefs, без commit на момент приёмки).
[Ревью](reviews/2026-10-31-product-acceptance.md),
[baseline](discovery/PRODUCT_PAGE_BASELINE.md), [промпт](CURSOR_REVIEW_PROMPT.md).

## Статус gates

| Gate | Статус |
|------|--------|
| `/beer` каталог | **Принят** владельцем 31.10.2026 — не открывать повторно |
| `/beer/{slug}` product template | **Принят** владельцем 31.10.2026 |
| Cynic visual polish | **Owner follow-up** — владелец поправит позже; Cursor не трогать |

## Product template v1 — закрыт

| ID | Статус | Что сделано |
|----|--------|-------------|
| T01–T05 | Fixed | H1, menu keyboard, loop clones, home Agent, preload |
| A01 | Fixed | `#about` `md:min-h`, без clip overflow-hidden |
| A02 | Fixed | dialog shell включает header controls |
| A03 | Fixed | stable focus trap lifecycle |
| Peer locale + hash | Fixed | `localeHrefs` / Brainstorm / MoA |

Evidence lint/tsc/build/browser — в предыдущей редакции этого файла и baseline.

## Следующее задание Cursor

1. **Commit** product-template diff — только по явному разрешению владельца.
2. После commit: **один** следующий шаблон этапа 4 — **home `/`**.
   - Read-only MCP Tilda + browser: RU/EN source baseline
     (`docs/discovery/TILDA_MCP_WORKFLOW.md`), editor ≠ published.
   - Зафиксировать секции, URL, SEO, медиа, CTA, критерии приёмки
     в `docs/discovery/` (новый HOME baseline).
   - Реализация поверх принятого SiteShell/header/footer; не ломать `/beer`.
3. Backend / NocoDB / Mapbox / новые локали — не сейчас.

## Отложенные требования

- Cynic — правка владельца.
- Related first-12 — Proposed.
- Полный исходный legal notice — backlog до production (AGENTS).

## Не сейчас

map/agent/tours backend, NocoDB, `sr`/`hy`/`ka`/`de`, pixel-perfect Zero Block.
