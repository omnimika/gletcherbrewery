# Дизайн-система: аудит и новый приоритет — 01.11.2026

Проверен **`6b137e7`**, ветка `first-front`; на старте дерево чистое.
Baseline изменений: `c0dde0c`, прежнее ревью Codex — `2c1a9d0`.
Новый запрос владельца: презентационные композиции, autoscale width/height,
якоря, помогающий smooth scroll, строгая сетка и повторные UI/state/motion recipes.
Это **Confirmed направление**, численные решения — Proposed для пилота.

[Дизайн-код](../design/DESIGN_SYSTEM.md), [ADR 0010](../adr/0010-design-system-and-section-layout.md),
[новая серия](../SPRINT_PLAN.md), [задание](../CURSOR_NEXT_STEPS.md).

## Фактический статус проекта

Код продвинулся дальше прошлого отчёта: blog listing/article renderer, партии
контента, video blocks и small aliases реализованы. По текущему спринт-плану
blog feed/tpost scope закрыт; это не новый полный browser/content audit Codex.
Текущий operational document уже в Sprint 5: `/partnership` RU/EN v1 принят
01.11.2026; `/russian-craft-beer`, `/horeca`, `/contacts`, `/policy` — v1/ожидание
приёмки. `/shopping-rules`, публичные agent/tours/map/shop и campaigns в очереди.

AGENTS/ROADMAP и начало старого SPRINT_PLAN ещё направляют на завершение home
и первый blog template. Это устарело; не запускать эти этапы повторно.
Новый design-system цикл ставится перед дальнейшим тиражированием UI.

Принятия `/beer`, product и partnership сохраняются как история/baseline.
Нынешний явный запрос разрешает контролируемую системную адаптацию этих страниц;
старое «не трогать принятый визуал» не должно блокировать новые требования.
Контент, URL, localizations и рабочие действия сохраняются.

## Подтверждённые пробелы

| Область | Доказательство | Вывод для нового стандарта |
|---|---|---|
| Autoscale | `home-window-stage.tsx`:37–38,52–63: width-artboard → measured height + transform scale + overflow hidden | Legacy adapter, не общий width/height/content-fit contract |
| Viewport | `use-window-artboard-scale.ts`:19–31: только innerWidth, SSR 1400/1 | Нет общего правила высоты, short viewport и overflow fallback |
| Containers | Home stage; partnership max1100, blog max1120 и отдельные gutters | Нужны Container / SectionFrame / ReadingContainer |
| Anchors | У большинства home section нет ID; product использует `#about` | Нужен stable section manifest/anchors, без ломки старых fragments |
| Scroll | globals smooth; snap нет; blog отдельные scrollIntoView/offset | Единый header offset, opt-in proximity, reduced-motion и history |
| Components | `ui/button.tsx`:3–31: четыре variants; CTA/cards/styles копируются по доменам | Общие tokens/recipes и явно описанные состояния |
| Typography | `globals.css`:3–79: weight выбирает width/family slot | Semantic typography roles поверх legacy adapter |
| Motion | mount-анимации и отдельные horeca keyframes | Общий Reveal vocabulary, visible SSR/no-JS и reduced-motion |

Уже имеющиеся брендовые цвета/логотипы/карточки/границы — ценные исходные
recipes. Пробел — отсутствие общего контракта, а не необходимость выкинуть UI.

## Конкретные замечания, которые войдут в design state contract

### DS-A — P2: мелкий текст primary Button не достигает контраста 4,5:1

[button.tsx](../../src/components/ui/button.tsx):7,31: white + brand red и text-sm.
По исходным цветам white/#e5373c = **4,248:1**, navy/red = **4,183:1**;
вывод из цветов, не browser screenshot. Нужен semantic action color/recipe
с проверенным контрастом, сохраняя original red как brand accent.
Proposed dark action-red `#c82731` с white даёт **5,540:1**.
Не заявлять общий WCAG pass по одному цвету: проверить gradient/state/focus.

### DS-B — P2: CompareCard оставляет hidden-face controls в Tab

[horeca-compare-card.tsx](../../src/components/horeca/horeca-compare-card.tsx):30,46–88,117.
Faces скрываются opacity/pointer-events/aria-hidden, но button и Link остаются
focusable. onFocusCapture меняет face и может оставить focus на невидимом control.
Состояния карточек должны исключать hidden controls из tab/accessibility tree
и предсказуемо сохранять/переносить focus. Проверить в showcase и на pilot;
конкретный browser-сценарий в этом ревью не запускался.

### DS-C — P3: JS smooth не использует общий reduced-motion contract

[blog-listing.tsx](../../src/components/blog/blog-listing.tsx):198–200 явно
передаёт `behavior:smooth`, :214 имеет scroll-mt-24, отличный от header variable.
CSS reduced-motion в globals не отменяет явный JS behavior. Общий helper должен
учитывать preference, не дублировать header compensation и сохранять keyboard/focus.

## Рекомендуемое решение

Native document scroll; opt-in proximity для коротких презентационных
композиций. Один внешний snap target на full/half/quarter screen, panels имеют
свои anchors. Контент reflows и расширяет высоту при необходимости; статьи,
legal и длинные формы — reading/content mode. Без wheel hijack и full-page engine.

12-col grid → 6/6, 3/6/3 и соответствующие вертикальные rows. 3/4/6 card presets
означают responsive compositions, не шесть сжатых колонок на телефоне.
UI не уменьшается целиком transform-ом. Decorative artwork может fit по обеим
осям, типографика и controls — bounded fluid layout с читаемыми минимумами.

## Следующие спринты

1. **DS-1:** semantic tokens, layout/UI primitives и локальная showcase всех
   сеток/состояний. Без массовой правки public pages и установки UI-фреймворка.
2. **DS-2:** anchors/scroll/reveal и один pilot; рекомендован `/horeca`, поскольку
   он ещё ждёт приёмки и содержит hero/cards/banner/form. Home — следующий rollout.
3. **DS-3:** по одному template home/B2B → catalog/product → blog/listing;
   article/legal остаются reading flow. Покрыть existing route/hash/locale contracts.
4. **P-Next:** продолжить оставшиеся public Sprint 5 на готовых primitives.

## Проверки и границы

На Node 25.5.0 свежие `tsc --noEmit --incremental false` и полный ESLint — PASS.
Новые правила — документы, не уже реализованная дизайн-система. Build/dev/browser,
визуальный пилот, измерения CLS/INP/LCP и новый live MCP snapshot не выполнялись.
Выводы по коду и первичным источникам; подробнее ссылки в DESIGN_SYSTEM.
Пакеты/приложение, HEAD и index не изменены; изменены только документы.
Числа tokens допускают уточнение в DS-1;
owner direction не означает приёмку невыполненного showcase.

| Проверка | Результат |
|---|---|
| Полный ESLint `--max-warnings=0` | PASS |
| TypeScript `--noEmit --incremental false` | PASS |
| `git diff --check` | PASS |
| Локальные Markdown paths в изменённых документах | 76 проверены, broken = 0 |
| Снимок 549 файлов вне разрешённой документации | SHA-256 совпал до/после |
| Build / dev / browser | Не запускались в read-only ревью |

SHA-256 отсортированного снимка `[path, file SHA-256]`:
`204618fddfb195a6d618f7aacb9ef5d2e02cdf97af2bdad4fa602f044e3b0c40`.
Независимая проверка новых инструкций двумя read-only агентами выполнена;
уточнены intrinsic minima вертикальных grid tracks, чтобы текст не перекрывался.

## Cursor DS-1 follow-up (тот же день)

Реализован foundation + showcase на ветке `first-front` (поверх `6b137e7`,
без commit/push). Showcase: `/dev/design-system` (dynamic, `robots: noindex`;
production → `notFound` без `ENABLE_DESIGN_SHOWCASE=1`).

| Проверка | Результат |
|---|---|
| `npm run lint` | PASS |
| `tsc --noEmit` | PASS |
| `npm run build` | PASS; `ƒ /[locale]/dev/design-system` |
| Browser Chromium (Cursor IDE) | Showcase открыт; tokens/type/actions/fields; compositions 50/50 и 25/50/25 после фикса outer `@container`; cards 3/4/6; banner/carousel; Reveal opacity→1 on enter; Compare demo — hidden face controls не в interactive tree |
| Mobile 390×844 | Stack compositions; header chrome OK |
| Soft snap | `DocumentProximitySnap` → class на `html`; CSS через `--tw-scroll-snap-strictness` |
| DS-A action contrast | Primary → `#c82731`; brand variant сохраняет `#e5373c` |
| DS-B | Showcase demo с `hidden`+`inert`+`tabIndex`; **реальный** `horeca-compare-card` — DS-2 |
| Firefox/Safari / 200% zoom / no-JS dump | Не закрыты; честно Open |
| Hydration warning `locale-switch.tsx` | Pre-existing; виден в Next overlay на showcase |

### Cursor DS-2 follow-up (пилот `/horeca`)

Код: `horeca-page.tsx`, `horeca-compare-card.tsx`, `horeca-sections.ts`.
lint / tsc / build PASS. Browser: `#distribution` → focus section под header;
halves-x audience/distribution; CompareCard DOM `inert`+`tabIndex=-1` на
скрытой face. Owner visual sign-off пилота — Open.

Следующий спринт: DS-3 rollout по templates.
