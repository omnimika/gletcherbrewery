# ADR 0010 — Design system и секционные композиции

Дата: **01.11.2026**. **Confirmed:** новое направление владельца.
**Proposed:** технические API/численные tokens, подлежащие проверке showcase/пилота.
Резерв `0002`–`0009` сохранён; `0005` уже занят CMS.

## Контекст

На `6b137e7` есть брендовые CSS tokens, Button и несколько доменных layout/
motion реализаций. Общего contract для screen sections, 50/50/25/50/25,
anchors, controls/card states и масштабирования по обеим осям пока нет.
Новый запрос владельца задаёт приоритет: презентационный ритм, адаптация
композиции к окну, строгая сетка и повторное использование фирменного UI.

Сайт остаётся миграцией бизнеса: URL/контент/языковые peers/операции сохраняются.
Предыдущие visual sign-offs — регрессионная база, а не запрет явно запрошенной
теперь системной адаптации. Детальный contract: [DESIGN_SYSTEM](../design/DESIGN_SYSTEM.md).

## Решение для reviewable реализации

1. Разделить SiteShell, SectionFrame, CompositionGrid/Panel и доменные blocks.
   Режимы screen/content/banner; screen имеет минимум доступной высоты и может расти.
2. CSS Grid/Flex + tokens/container queries для контента. Декоративный artwork
   может иметь ограниченный width/height fit; whole-DOM transform-scale не core API.
3. Композиции full, halves x/y, quarters 1/2/1 x/y, quad, card grids 3/4/6,
   banners/carousels. Mobile stacking сохраняет reading order и readable controls.
4. Native document scroll; opt-in proximity для презентационных секций.
   Стабильные anchors, header offset, reduced-motion/keyboard/history. Без
   wheel hijack, global mandatory snap и зависимости от full-page JS engine.
5. Один state/motion contract Button/LinkButton/Card/Field/Reveal/Carousel;
   body/prose не превращаются в fixed-height слайды.
6. Brand palette сохраняется; accessible semantic action/text tokens измеряются.
   Width-слоты Tilda font-weight изолировать legacy adapter и semantic type roles.
7. Сначала DS-1 showcase на существующем Next.js, DS-2 один pilot, DS-3 rollout.
   UI-framework, Storybook, scroll/animation packages не требуются по умолчанию.

## Статус и границы

**DS-1 foundation + showcase — реализован Cursor 01.11.2026** (см.
[DESIGN_SYSTEM](../design/DESIGN_SYSTEM.md) implementation map и
[ревью follow-up](../reviews/2026-11-01-design-system.md)). Численные tokens
остаются reviewable Proposed до приёмки владельцем. DS-2 pilot / DS-3 rollout
ещё не выполнены.

Массовый rollout и production-публикация этим ADR не разрешаются.
Нет новых CMS/DB/Puck/Auth/Mapbox интеграций. Дизайн новых языков учитывается,
но `sr`/`hy`/`ka`/`de` не публикуются этим решением.

## Последствия

- Публичный frontend и будущий Puck editor смогут использовать одни block
  recipes; render primitives не зависят от редактора/БД.
- HomeWindowStage остаётся legacy adapter. **Owner Confirmed (01.11):** home
  mid-blocks — stretch `screen` slides + CompositionGrid fill, не artboard scale
  и не content bands.
- Источник контента/SEO и намеренное изменение геометрии проверяются отдельно:
  screenshot старой страницы не обязывает сохранять её случайные UI расхождения.
- Сначала закрывается design foundation backlog; затем продолжение public
  Sprint 5 по [новому плану](../SPRINT_PLAN.md).

## Проверка

Showcase всех layouts/states + RU/EN/long text, short windows/zoom/reduced-motion,
anchors/Back/Forward/keyboard, стабильность media и нет потери content/focus.
Свежие lint/typecheck/build/browser. Отчёты не подменяют visual acceptance
владельца; подробная матрица в design contract.
