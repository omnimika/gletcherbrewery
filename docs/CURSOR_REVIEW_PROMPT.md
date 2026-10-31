# Готовый промпт Cursor Agent

Ссылки: [AGENTS](../AGENTS.md), [ROADMAP](ROADMAP.md),
[задание](CURSOR_NEXT_STEPS.md), [ревью](reviews/2026-10-31-product-template.md),
[product baseline](discovery/PRODUCT_PAGE_BASELINE.md),
[MCP workflow](discovery/TILDA_MCP_WORKFLOW.md),
[i18n ADR](adr/0001-i18n-routing-and-content.md).

Скопировать в Cursor:

```text
Продолжи gletcherbrewery по текущему плану. Сначала прочитай:
@AGENTS.md
@docs/ROADMAP.md
@docs/CURSOR_NEXT_STEPS.md
@docs/reviews/2026-10-31-product-template.md
@docs/discovery/PRODUCT_PAGE_BASELINE.md
@docs/discovery/TILDA_MCP_WORKFLOW.md
@docs/adr/0001-i18n-routing-and-content.md

Проверь HEAD/Git status/diff: ревью относится к 9e0ee8e и dirty tree,
включая новые product-компоненты/media/assets. Сохрани все мои изменения.
Составь краткий план с критериями; перепроверь замечания по текущему коду.

Владелец уже принял /beer: повторно эту визуальную приёмку не открывай.
Текущий gate — product template v1 этапа 4, эталон Friday Avenue APA.
Сначала T01: единый H1 для всех media-веток, а не только Friday/Cynic.
Точечно закрой T02–T04: keyboard/modal scope включает доступное закрытие,
loop-клоны не дают лишних ссылок и потерянного фокуса, home /agent CTA
использует существующий временный production mapping. Сохрани принятый chrome.

Через MCP Tilda read-only и браузер сверь Friday RU/EN, Ausweis с отдельным
логотипом и Cynic с bottle fallback. Разделяй editor/published. Проверь
масштаб бутылки с padded PNG, hero/header первый paint и resize, related
policy и полноту исходных legal notices. Обнови baseline реальными evidence.
Не переноси весь Zero Block runtime; pixel-perfect для v1 не требуется.
T05 preload нижеэкранной бутылки проверь через Network.

Следуй Accepted i18n ADR; sr/hy/ka/de не публикуй. Зафиксируй задачи registry,
missing peers/translations, UI fallback, чисел и шрифтов. Сохрани существующие
URL и 301 legacy redirects; политику 308 aliases документируй отдельно.

Выполни npm run lint, npx tsc --noEmit, npm run build и локальный запуск.
Проверь все 36 canonical detail: H1/metadata/lang/content/media, разные
MoA/Brainstorm slug, aliases/404/planned locales. Browser: три media-варианта
на 390×844 и 1440×900, короткий viewport, 200% zoom, keyboard/touch.
Проверь новый bundle/Network. Дай список изменений, команды/результаты,
screenshots и ограничения; обнови документы. Визуальную приёмку шаблона
подтверждает владелец. До неё не начинай следующий публичный шаблон.

После приёмки выбери один следующий шаблон stage 4 (кандидат home), начиная
с source baseline. Backend/NocoDB/Mapbox/платежи и новые локали сейчас не нужны.
Не выполняй commit/push, публикацию Tilda и production-изменения без подтверждения.
```
