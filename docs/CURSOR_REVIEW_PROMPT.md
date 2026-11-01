# Готовый промпт Cursor Agent

Ссылки: [AGENTS](../AGENTS.md), [ROADMAP](ROADMAP.md),
[задание](CURSOR_NEXT_STEPS.md), [серия спринтов](SPRINT_PLAN.md),
[дизайн-код](design/DESIGN_SYSTEM.md),
[ADR 0010](adr/0010-design-system-and-section-layout.md),
[ревью](reviews/2026-11-01-design-system.md),
[MCP workflow](discovery/TILDA_MCP_WORKFLOW.md),
[i18n ADR](adr/0001-i18n-routing-and-content.md).

Скопировать в Cursor:

```text
Продолжи gletcherbrewery: выполни DS-1 — дизайн-фундамент и showcase.
Сначала прочитай:
@AGENTS.md
@docs/ROADMAP.md
@docs/CURSOR_NEXT_STEPS.md
@docs/SPRINT_PLAN.md
@docs/design/DESIGN_SYSTEM.md
@docs/adr/0010-design-system-and-section-layout.md
@docs/reviews/2026-11-01-design-system.md
@docs/adr/0001-i18n-routing-and-content.md
@docs/discovery/TILDA_MCP_WORKFLOW.md

База ревью — чистый 6b137e7 до правок документации Codex. Проверь текущие
Git status/diff/log и сохрани пользовательские изменения. Не начинай заново
home/blog import: проект уже дошёл до публичного Sprint 5. Новый запрос
владельца ставит дизайн-систему перед продолжением тиражирования UI.

Сначала дай короткий план DS-1 и критерии. Реализуй semantic design tokens,
Container/ReadingContainer/SectionFrame/CompositionGrid/CardGrid, shared
Button/LinkButton/IconButton, Card surfaces и Field/Feedback recipes.
Сохрани бренд: ice/navy/red, Gravity/Gratimo, границы и скругления. Раздели
font width и реальный weight, brand red и доступный action color.
Проверь существующие recipes до создания новых; не сломай Button callers.

Композиции: full, 50/50 по обеим осям, 25/50/25 по обеим осям, 2×2,
карточки 3/4/6, banner/carousel. Screen = min доступной высоты с ростом по
content, body/controls reflow. Учти ширину И высоту, header, short windows,
mobile keyboard/toolbar, zoom и длинные переводы. Whole-UI transform-scale,
обрезка текста и обязательные 6 узких колонок не подходят.

Создай dev-only showcase в текущем Next.js со всеми сетками/tokens/состояниями:
hover/focus/pressed/selected/disabled/loading/error, hidden-face focus,
media/font fallback, длинный RU/EN, reduced-motion, видимый no-JS/SSR.
Проверь prototype anchors/header offset, native proximity и Reveal в showcase.
Оставь document scroll, не перехватывай wheel/touch. Snap только opt-in;
articles/legal/forms читаются свободно, smooth/JS уважают reduced-motion.

Proposed численные tokens уточняй по showcase без отдельного вопроса на
каждый padding/radius. Не устанавливай Storybook/UI/fullpage/motion/CMS/DB.
Сверка Tilda при необходимости read-only, editor/published раздельно.
Не публикуй sr/hy/ka/de: это будущие языки, а не готовые переводы.

Выполни свежие lint/typecheck/build/local start и browser-матрицу из задания:
320/390/768, короткие окна, 1440/1920, zoom, keyboard, reduced-motion/no-JS.
Проверь регрессии существующих public templates. Запиши команды/screenshots,
недоступные проверки и выбранные tokens, предъяви showcase для ревью.
Сейчас не мигрируй весь сайт. Следом DS-2: один pilot /horeca; затем DS-3:
rollout по шаблонам; потом оставшиеся страницы Sprint 5. Прежние visual
sign-offs — baseline, новый запрос разрешает целевую системную адаптацию
с сохранением content/URL/locale peers. Commit/push/production не выполнять.
```
