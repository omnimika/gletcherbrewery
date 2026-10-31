# Готовый промпт Cursor Agent

Ссылки: [AGENTS](../AGENTS.md), [ROADMAP](ROADMAP.md),
[задание](CURSOR_NEXT_STEPS.md), [ревью](reviews/2026-10-31-product-acceptance.md),
[product baseline](discovery/PRODUCT_PAGE_BASELINE.md),
[MCP workflow](discovery/TILDA_MCP_WORKFLOW.md),
[i18n ADR](adr/0001-i18n-routing-and-content.md).

Скопировать в Cursor:

```text
Продолжи gletcherbrewery по текущему плану. Сначала прочитай:
@AGENTS.md
@docs/ROADMAP.md
@docs/CURSOR_NEXT_STEPS.md
@docs/reviews/2026-10-31-product-acceptance.md
@docs/discovery/PRODUCT_PAGE_BASELINE.md
@docs/discovery/TILDA_MCP_WORKFLOW.md
@docs/adr/0001-i18n-routing-and-content.md

Проверь HEAD/Git status/diff: ревью относится к чистому 6f84465 до правок
документации Codex. Сохрани документы и все новые пользовательские изменения.
Составь краткий план с критериями; перепроверь замечания по текущему коду.

Владелец уже принял /beer: повторно эту визуальную приёмку не открывай.
Текущий gate — product template v1 этапа 4, эталон Friday Avenue APA.
T01/T03/T04/T05 уже исправлены по коду, не делай их заново. Keyboard-часть T02
исправлена; остаётся modal subtree. Сначала A01 — content не должен
обрезаться фиксированной высотой md/max-height/overflow-hidden при длинном
тексте, коротком окне и zoom. Сохрани одноэкранный вид там, где всё помещается;
в остальных случаях разреши естественное продолжение без потери текста.
Закрой A02 modal scope с header controls и A03 стабильность focus lifecycle
при resize/rerender. Сохрани принятый chrome и рабочий keyboard cycle.

Через MCP Tilda read-only и браузер сверь Friday RU/EN, Ausweis с отдельным
логотипом и Cynic с bottle fallback. Разделяй editor/published. Проверь
hero/header первый paint и resize, длинные описания, related policy.
Проверь Friday/MoA/Brainstorm с #about, сменой языка, related navigation,
Back/Forward: hashchange не покрывает History API. Обнови baseline evidence.
Не переноси весь Zero Block runtime; pixel-perfect для v1 не требуется.
Нижеэкранный preload уже снят; подтверди Network. Полный исходный legal notice
сохрани в backlog публичного переноса до production, не снимай требование AGENTS.

Следуй Accepted i18n ADR; sr/hy/ka/de не публикуй. Зафиксируй задачи registry,
missing peers/translations, UI fallback, чисел и шрифтов. Сохрани существующие
URL и 301 legacy redirects; политику 308 aliases документируй отдельно.

Выполни npm run lint, npx tsc --noEmit, npm run build и локальный запуск.
Проверь все 36 canonical detail: H1/metadata/lang/content/media, разные
MoA/Brainstorm slug, aliases/404/planned locales. Browser: три media-варианта
на 390×844, 1440×900, 1024×600, 1280×500, 200% zoom, keyboard/touch.
Проверь новый bundle/Network. Дай список изменений, команды/результаты,
screenshots и ограничения; обнови документы. Визуальную приёмку шаблона
подтверждает владелец. Старые build/browser результаты не объявляй свежей
проверкой 6f84465. IP-host loop воспроизводи и объясняй по HTTP/Host chain;
localhost пока рабочий способ запуска. До приёмки не начинай следующий шаблон.

После приёмки выбери один следующий шаблон stage 4 (кандидат home), начиная
с source baseline. Backend/NocoDB/Mapbox/платежи и новые локали сейчас не нужны.
Не выполняй commit/push, публикацию Tilda и production-изменения без подтверждения.
```
