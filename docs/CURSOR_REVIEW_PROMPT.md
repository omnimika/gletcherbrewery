# Готовый промпт Cursor Agent

Ссылки: [AGENTS](../AGENTS.md), [ROADMAP](ROADMAP.md),
[задание](CURSOR_NEXT_STEPS.md), [home baseline](discovery/HOME_PAGE_BASELINE.md),
[product baseline](discovery/PRODUCT_PAGE_BASELINE.md),
[MCP workflow](discovery/TILDA_MCP_WORKFLOW.md),
[i18n ADR](adr/0001-i18n-routing-and-content.md).

Скопировать в Cursor:

```text
Продолжи gletcherbrewery по плану этапа 4. Сначала прочитай:
@AGENTS.md
@docs/ROADMAP.md
@docs/CURSOR_NEXT_STEPS.md
@docs/discovery/HOME_PAGE_BASELINE.md
@docs/discovery/TILDA_MCP_WORKFLOW.md
@docs/adr/0001-i18n-routing-and-content.md

/beer и product template уже приняты владельцем (commit 0df9706).
Cynic polish — owner follow-up, не трогай. Каталог и product pages
повторно на визуальную приёмку не открывай.

Текущий gate — home `/` и `/en`. Сверь MCP RU 49072461 / EN 50620901
и live production; editor ≠ published. Доведи v1 по baseline:
hero (video/seal/typography), promos, features, blog teasers, newsletter UI.
Не переноси весь Zero Block runtime; pixel-perfect не требуется.
Сохрани SiteShell; CTAs: локальный /beer + productionHref для map/tours/shop/b2b/blog.
Newsletter без фейкового backend. Один H1, SEO, RU/EN.

Выполни lint, tsc, build, localhost browser 390 и 1440.
Не начинай следующий шаблон до приёмки home владельцем.
Без commit/push и публикации Tilda без подтверждения.
```
