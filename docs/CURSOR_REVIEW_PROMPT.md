# Готовый промпт Cursor Agent

Ссылки: [AGENTS](../AGENTS.md), [ROADMAP](ROADMAP.md),
[задание](CURSOR_NEXT_STEPS.md), [ревью](reviews/2026-10-31-follow-up.md),
[MCP workflow](discovery/TILDA_MCP_WORKFLOW.md),
[i18n ADR](adr/0001-i18n-routing-and-content.md).

Скопировать в Cursor:

```text
Продолжи gletcherbrewery по текущему плану. Сначала прочитай:
@AGENTS.md
@docs/ROADMAP.md
@docs/CURSOR_NEXT_STEPS.md
@docs/reviews/2026-10-31-follow-up.md
@docs/discovery/TILDA_MCP_WORKFLOW.md
@docs/discovery/TILDA_BEER_CATALOG.md
@docs/discovery/TILDA_BEER_SLIDER.md
@docs/adr/0001-i18n-routing-and-content.md

Проверь HEAD/Git status/diff: ревью относится к 81713e4. Сохрани мою правку
messages/ru.json и другие пользовательские изменения. Составь краткий план
с зависимостями и критериями, перепроверь замечания по текущему коду.

Цель — завершить RU/EN /beer для приёмки этапов 2–3. Сначала исправь F01
(lint галереи). Через MCP Tilda выполни read-only сверку RU/EN каталога
и общих header/menu/footer: реальные tools/schema, project/page/records/ZB,
breakpoint inheritance, inserts, порядок сортов, стрелки/drag. Разделяй
editor/published, фиксируй IDs/дату/очищенные evidence. Не публикуй Tilda.

Закрой подтверждённые F02–F06: origin focus до initial focus, контраст языка,
artboard min-height/upscale, display order отдельно от detail-фикстуры,
переходы в ещё не перенесённые разделы. Сохрани выполненные переводы,
home metadata, scroll reset и границу client/server fixtures. Расхождения
Tilda-документов разреши сверкой исходников и браузера, без догадок.

Следуй Accepted i18n ADR; sr/hy/ka/de не публикуй. Зафиксируй задачи registry,
missing peers/translations, UI fallback, чисел и шрифтов. Сохрани существующие
URL и 301 legacy redirects; политику 308 aliases документируй отдельно.

Выполни npm run lint, npx tsc --noEmit, npm run build и локальный запуск.
Проверь HTTP/SEO/404, RU/EN home/list/detail, разные MoA/Brainstorm slug,
planned locales, клавиатуру и touch. Сравни source/localhost на 390×844,
960×900, 1200×600, 1440×900 и 200% zoom. Проверь новый client bundle.
Дай список изменений, команды/результаты, screenshots и ограничения;
обнови документы. Визуальную приёмку подтверждает владелец.

До этого gate не начинай массовый перенос и backend/NocoDB/Mapbox/платежи.
Не выполняй commit/push и production-изменения без моего подтверждения.
```
