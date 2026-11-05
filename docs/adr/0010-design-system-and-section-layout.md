# ADR 0010 — Design system и секционные композиции

Дата: **01.11.2026**, проверка реализации **05.11.2026**.
**Confirmed:** направление владельца. DS-1/DS-2 implemented, rollout reviewable;
численные tokens не означают автоматически owner sign-off всех recipes.
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
остаются reviewable до приёмки владельцем. На d6011d2 DS-2 pilot уже реализован,
DS-3 широко перенесён на публичные templates. Не начинать их заново.
Актуальные R03/R04/R09/R10 и reflow проверки — Q2 в
[ревью 05.11](../reviews/2026-11-05-public-integrity.md).

Массовый rollout и production-публикация этим ADR не разрешаются.
CMS/DB/Puck/Auth не выбраны/установлены этим ADR. Mapbox frontend уже реализован
как отдельный public template, CRM/backend остаются будущим этапом.
Дизайн новых языков учитывается,
но `sr`/`hy`/`ka`/`de` не публикуются этим решением.

## Последствия

- Публичный frontend и будущий Puck editor смогут использовать одни block
  recipes; render primitives не зависят от редактора/БД.
- HomeWindowStage остаётся legacy adapter. **Owner Confirmed (01.11):** home
  mid-blocks — stretch `screen` slides + CompositionGrid fill, не artboard scale
  и не content bands.
- Источник контента/SEO и намеренное изменение геометрии проверяются отдельно:
  screenshot старой страницы не обязывает сохранять её случайные UI расхождения.
- Foundation и pilot уже реализованы; текущая серия Q1/Q2/Q3 исправляет
  функциональность, проверяет design contract и закрывает public coverage.
  Campaigns и backend discovery — следующие scope в [плане](../SPRINT_PLAN.md).

## Проверка

Showcase всех layouts/states + RU/EN/long text, short windows/zoom/reduced-motion,
anchors/Back/Forward/keyboard, стабильность media и нет потери content/focus.
Свежие lint/typecheck/build/browser. Отчёты не подменяют visual acceptance
владельца; подробная матрица в design contract.
