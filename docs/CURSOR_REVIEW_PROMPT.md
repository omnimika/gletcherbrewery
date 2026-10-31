# Готовый промпт Cursor Agent

Ссылки: [AGENTS](../AGENTS.md), [ROADMAP](ROADMAP.md),
[задание](CURSOR_NEXT_STEPS.md), [серия спринтов](SPRINT_PLAN.md),
[ревью](reviews/2026-11-01-home-and-sprints.md),
[home baseline](discovery/HOME_PAGE_BASELINE.md),
[product baseline](discovery/PRODUCT_PAGE_BASELINE.md),
[MCP workflow](discovery/TILDA_MCP_WORKFLOW.md),
[i18n ADR](adr/0001-i18n-routing-and-content.md).

Скопировать в Cursor:

```text
Продолжи gletcherbrewery по плану этапа 4. Сначала прочитай:
@AGENTS.md
@docs/ROADMAP.md
@docs/CURSOR_NEXT_STEPS.md
@docs/SPRINT_PLAN.md
@docs/reviews/2026-11-01-home-and-sprints.md
@docs/discovery/HOME_PAGE_BASELINE.md
@docs/discovery/TILDA_MCP_WORKFLOW.md
@docs/adr/0001-i18n-routing-and-content.md

База ревью — чистый 2c1a9d0 до правок документации Codex. Проверь актуальный
Git status/diff, сохрани документы и новые пользовательские изменения.
/beer и product template уже приняты владельцем (commit 0df9706).
Cynic polish — owner follow-up, не трогай. Каталог и product pages
повторно на визуальную приёмку не открывай.

Выполни только спринт 1 — завершение home `/` и `/en`. Сначала план и критерии.
Перепроверь H01–H04: реальные RU teaser article URLs вместо общего /blog;
PNG fallback до первого успешного canvas frame и при error; ограниченная
offscreen/visibility работа media; validity честной newsletter-заглушки.
Не включай guess-URL из fixture, не добавляй backend и не создавай новый
media pipeline без необходимости: все три video encodes уже tracked.

Через MCP Tilda read-only RU 49072461 / EN 50620901 и public browser сверь
источник; editor ≠ published. RU/EN секции могут различаться: уточни EN
MOA/menu решения и CTA/статьи, не копируй число RU-блоков как обязательное.
Проверь alpha/static/opaque fallback, reduced-motion/Save-Data/autoplay errors.
Если включается внешний media origin, сначала CORS/canvas проверка.
Pixel-perfect/весь Tilda runtime не нужен; сохраняй принятый SiteShell.

Выполни полный lint, tsc, build и локальный запуск. Browser 390×844/1440×900,
короткое окно/200% zoom, keyboard/touch, H1/SEO/links/media; регрессии /beer и
product template. Проверь воспроизводимость assets/font fallback. Обнови
baseline/отчёт реальными screenshots и командами; не выдавай невыполненные
LCP/CPU/browser проверки за PASS. Предъяви home владельцу.

Дальнейшая очередь Proposed: спринт 2 blog source/content/i18n contract + listing,
3 article template, 4 content batches, 5 remaining public templates. Сейчас их
не реализуй; следующий шаблон только после home gate. Новые локали/CMS/БД/
NocoDB/Mapbox/платежи не подключай. Без commit/push и публикации Tilda без подтверждения.
```
