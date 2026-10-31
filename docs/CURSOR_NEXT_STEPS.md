# Текущее задание Cursor Agent

Дата: 31.10.2026. Product template принят (`0df9706`).
Текущий срез этапа 4: **home `/`**.
[Baseline](discovery/HOME_PAGE_BASELINE.md), [MCP workflow](discovery/TILDA_MCP_WORKFLOW.md).

## Статус gates

| Gate | Статус |
|------|--------|
| `/beer` каталог | **Принят** 31.10.2026 |
| `/beer/{slug}` product template | **Принят** 31.10.2026 (`0df9706`) |
| Cynic visual polish | **Owner follow-up** |
| Home `/` | **In progress** — v1 implementation + baseline |

## Home v1 (этот проход)

- MCP: project `1212341`, RU `49072461`, EN `50620901`; hero ZB `749387570`.
- Baseline: `docs/discovery/HOME_PAGE_BASELINE.md`.
- UI: `HomeHero` (video + seal + H2/H1), promos, features, blog fixture, newsletter UI-only.
- Не ломать принятые `/beer` и product template; Cynic не трогать.

## Критерии приёмки home

- lint / tsc / build; localhost `/` и `/en`.
- Один H1; SEO title/description/canonical/hreflang.
- Hero brand composition (не stub); CTAs на `/beer` и production map/tours/shop/b2b/blog.
- Blog ≥3 teasers; newsletter без фейкового backend success.
- 390×844 + 1440×900; без регрессии каталога/product.
- Pixel-perfect ZB не требуется.

## Следующее после приёмки home

Один следующий публичный шаблон (блог listing / partners / legal — выбрать с владельцем).
Backend — этапы 5+. Commit/push — по разрешению.

## Не сейчас

map/agent/tours backend, NocoDB, новые локали, Cynic polish.
