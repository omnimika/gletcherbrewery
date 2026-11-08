# Gletcher — дизайн-код, сетка и компоненты

Дата: **01.11.2026**. Новое требование владельца: сайт с ритмом презентации,
адаптацией композиций к ширине **и высоте** окна, якорями и помогающим скроллом.
[ADR 0010](../adr/0010-design-system-and-section-layout.md),
[план](../SPRINT_PLAN.md), [задание Cursor](../CURSOR_NEXT_STEPS.md).

**Confirmed:** направление, существующий бренд, композиции/сетки и повторное
использование UI. **DS-1 реализован** — showcase `/dev/design-system` (dev-only).
**Proposed → Implemented (reviewable):** численные токены и API ниже; DS-2
pilot реализован, DS-3 широко перенесён. Не считать pixel-perfect утверждённым
владельцем без приёмки. Текущие gaps — в проверке реализации 05.11 ниже.

### DS-1 implementation map

| Contract | Code |
|---|---|
| Tokens | `src/app/globals.css` (`@theme` + `:root`) |
| Layout | `src/components/layout/*` |
| Controls / fields / cards | `src/components/ui/*` |
| Reveal / document snap | `src/components/motion/*` |
| Carousel | `src/components/collections/carousel.tsx` |
| Showcase | `src/app/[locale]/dev/design-system/page.tsx` |

Implemented starting values (reviewable): action `#c82731`, brand `#e5373c`,
gutter `clamp(1rem, 3vw, 3rem)`, gap `clamp(1rem, 2vw, 2rem)`, reading `68ch`,
content max `90rem`, radius control/card/pill `0.375/0.75/999`, focus `2px/2px`,
motion feedback/reveal/overlay `160/280/220ms`. CompositionGrid: outer
`@container` + inner grid (self-query на одном узле в Chromium не срабатывает).
Document snap: class `ds-snap-proximity` на `html` через `DocumentProximitySnap`.

## 1. Визуальный характер

- Холодный светлый фон, плотная тёмно-синяя display-типографика, красные акценты,
  тонкие контрастные границы, крупные изображения бутылок/фирменной графики.
- Воздух и строгие выравнивания важнее количества эффектов. На экране один
  главный визуальный акцент; несколько блоков образуют общую композицию.
- Сохранять navy/ice/red, текущие силуэты, логотипы и характер CTA. Спокойная
  глубина допустима для overlay; случайные градиенты/радиусы/тени не добавлять.
- Tilda/MCP — источник бренда/контента/сценариев, а не обязательный runtime/DOM.
  Новая системная сетка может уточнять исходную геометрию по заданию владельца.

## 2. Три уровня layout

| Уровень | Ответственность |
|---|---|
| Page / SiteShell | Один document scroll, header/menu/age gate, locale, общий фон |
| SectionFrame | Смысловая секция, стабильный `id`, заголовок, tone, высота, snap intent |
| CompositionGrid / Panel | Распределение пространства внутри секции, gaps, responsive stacking |

Контент и доменная логика остаются в Home/Product/Blog/B2B компонентах.
Layout primitives не импортируют catalog/content data, не запрашивают API и
не становятся client-components без необходимости. Клиентские helpers — только
для motion, active-section observation и элементов с состоянием.

### Режимы SectionFrame

| Режим | Высота / назначение | Snap |
|---|---|---|
| `screen` | Минимум доступного экрана; hero, короткая презентационная композиция | Опциональный start |
| `content` | Естественная высота; статьи, legal, формы, длинные listing/описания | Обычно none |
| `banner` | Высота по контенту/media aspect; компактный акцент | Обычно none; может входить в screen composition |

`screen` означает **min-height, а не ограничение max-height**. Текст должен
помещаться либо расширять страницу. Несколько panel в одном screen имеют
общий внешний snap target; нельзя заставлять каждую четверть экрана бороться
за отдельный snap. У panel могут быть собственные deep-link anchors.

## 3. Контейнеры и токены layout

Числа ниже Proposed; значения хранить централизованно в CSS/Tailwind tokens.

| Токен / роль | Стартовое значение / правило |
|---|---|
| Space scale | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px, в rem |
| Page gutter | `clamp(1rem, 3vw, 3rem)` + safe-area при необходимости |
| Grid gap | `clamp(1rem, 2vw, 2rem)` |
| Content container | max 90rem, по центру, общий gutter |
| Wide composition | Вся доступная ширина за вычетом gutter; не случайный max-width каждого блока |
| Reading container | 60–72ch, старт 68ch; отдельно от wide media |
| Available section height | `100svh − --header-height`, с безопасным vh fallback |
| Section vertical inset | `clamp(1.5rem, 4svh, 4rem)` для screen; space scale для flow |
| Radius | control 0.375rem, card 0.75rem, pill 999px; допустим sharp variant |
| Border | 1px navy для обычной карточки, 2px emphasis/focus по токену |
| Focus | Контрастный outline 2px + offset 2px, не обрезается container |
| Layer scale | base / sticky header / popover / menu / modal / toast — именованные роли |

Ввести один публичный `--header-height`, временно связанный с текущим `--hh`.
Не держать несколько разных 84px/scroll-mt-24 компенсаций. Высота header должна
быть предсказуема до hydration через CSS; runtime measurement только уточняет.
Safe-area учитывать один раз в layout contract, не добавлять повторно в panels.

`Container` отвечает за inline size/gutter, `SectionFrame` — за vertical rhythm.
Нельзя одновременно добавлять полный section padding в обоих компонентах.

## 4. Композиционная сетка

Использовать CSS Grid для двумерных композиций, Flex для строк действий и
небольших групп. Базовая широкая сетка — **12 колонок**; inline tracks используют
`minmax(0, …)` и дети `min-width:0`. Вертикальные text/form rows сохраняют
intrinsic/min-content minimum: при нехватке места section растёт либо переходит
в flow. Нулевой minimum по block-axis допустим для bounded media/доказанного fit,
а не для произвольного текста: иначе rows могут наложиться вместо расширения.

| Preset | Горизонтально | Вертикально | Пример |
|---|---|---|---|
| `full` | 12 | auto / доступный screen | Hero, большой banner |
| `halves-x` | 6 / 6 | Общая строка | B2B + map, media + copy |
| `halves-y` | 12 | 1 / 1 | Два смысловых блока на экране |
| `quarters-x` | 3 / 6 / 3 | Общая строка | Контекст / главный акцент / CTA |
| `quarters-y` | 12 | 1 / 2 / 1 | Верхний тезис / медиа / действие |
| `quad` | 6 / 6 | 1 / 1 | Четыре панели 2×2 |

Проценты относятся к **свободному месту после gap/padding**, а не к сумме
`50% + 50% + gap`, создающей overflow. Вертикальные ratios точны, пока content
помещается; при переполнении rows расширяются, ограничения снимаются. Не скрывать
текст `overflow:hidden`, line-clamp или внутренним scroll только ради долей.

На узком контейнере halves/quarters складываются в один столбец в DOM reading
order. Не переставлять текст/фокус через CSS order ради красивого mobile.
Для media допустим отдельный мобильный aspect/crop. Начальные breakpoints —
container 40rem / 64rem / 90rem, проверяются на реальных карточках и переводах.

### Card grid — 3, 4 и 6

Различать **количество карточек** и **число колонок**:

- Три карточки: 3×1 wide → 2+1 или 1×3 при уменьшении контейнера.
- Четыре: 4×1 wide либо 2×2, затем 1×4.
- Шесть: по умолчанию 3×2; 6×1 только когда хватает минимальной ширины каждой
  карточки. На tablet — 2×3, на mobile — 1×6 или явная carousel variant.
- Предусмотреть `columns=3|4|6` как желаемый максимум, а не обязательное число
  при любой ширине. Стартовый min card width 15rem, уточняется по типу карточки.
- Не уменьшать всю карточку до 100px и не убирать элементы, чтобы сохранить 6 колонок.
- В ряду одинаковый CardShell stretch, actions выровнены снизу; высоту задаёт
  контент. Не обрезать обязательные названия/CTA, допускается расширение ряда.

## 5. Autoscale по ширине и высоте

1. Сначала доступное пространство: inline size контейнера и block size окна
   с учётом header/browser chrome. Затем выбор preset, затем media/typography.
2. Текст/формы/кнопки используют reflow, `rem`, bounded `clamp()` и container
   queries. Body не масштабируется чистым `vw`/`svh`, сохраняется browser text zoom.
3. Screen-композиция расширяется по высоте при длинном тексте, переводе,
   клавиатуре или zoom. Для короткого landscape допустим content mode.
4. Media-artwork в ограниченном frame может получать fit-scale **по обеим осям**:
   минимальный из width-fit и height-fit, с верхним/нижним пределом. Scale ниже
   читаемого минимума → reflow/смена композиции, не дальнейшее уменьшение UI.
5. `transform:scale()` не является базовым способом масштабировать весь DOM
   с текстом/controls. `HomeWindowStage` — legacy adapter. **Owner Confirmed
   для home:** stretch `SectionFrame mode=screen` + `CompositionGrid fill`
   (fr ratios / halves / quarters / card grid); не возвращать artboard scale
   на mid-blocks. Showcase: `#screen-halves-x`, `#screen-quarters-y`.
6. `svh` — стабильная основа презентационных секций; `dvh` — только где нужен
   live viewport (например menu overlay). Не заставлять высоту и snap постоянно
   прыгать при скрытии browser toolbar. Карточки не обязаны иметь viewport height.

Вторая ось используется для **композиции**, а не как повод ограничить доступность.
Статьи/legal не превращаются в картинки слайдов и не режутся автоматически
каждые 100vh. Их heading anchors и reading width остаются полноценными.

## 6. Якоря и навигация секций

- Каждый смысловой SectionFrame/Panel имеет стабильный уникальный `id` и
  доступный заголовок/label. Список page sections задаётся небольшим manifest:
  `id`, localized label, mode/layout, published/visible, snap intent.
- ID — семантический ASCII kebab-case, общий для RU/EN и не производный от
  текста заголовка/индекса массива. Существующий `#about` и другие публичные
  fragments сохраняются; изменение требует совместимого anchor mapping.
- Общий snapshot/manifest даёт nav links, active state и Copy link. Кнопка
  «следующая секция» — обычная доступная ссылка, не обязательный способ скролла.
- Deep links работают при первой загрузке, client navigation, Back/Forward
  и смене языка. Fragment не отправляется серверу; нужен browser test.
- Ссылки только на реально отрисованные published sections/peers. Если целевой
  блок отсутствует в другой локали, выбрать документированный fallback, не
  рекламировать несуществующий ID и не выдумывать перевод.
- Пользовательский click обновляет hash/history ожидаемым способом. Пассивный
  IntersectionObserver обновляет active UI и **не создаёт history entry на каждый scroll**.
- Фокус: обычный scroll не меняет activeElement; явный переход через section nav
  делает heading/target доступным клавиатуре (`tabIndex=-1` при необходимости),
  не скрытым под header. Не перехватывать focus при пассивном входе секции.

## 7. Smooth scroll и мягкое позиционирование

- Основной scroll — document. Не добавлять внутренний полноэкранный scroll
  wrapper вокруг SiteShell: это ломает anchor/history/keyboard/существующие observers.
- На презентационной странице допустим **opt-in `y proximity`**, секции —
  `scroll-snap-align:start`. `mandatory` и `scroll-snap-stop:always` не default.
- Один snap target на целую композицию. Длинные content sections и form region
  свободно читаются; soft snapping не должно уводить пользователя от текста/поля.
- Общая root scroll-padding компенсирует header; target scroll-margin даёт
  только дополнительный небольшой gap. Не вычитать высоту header дважды.
- Smooth разрешён для явных anchor переходов; при `prefers-reduced-motion`
  CSS и **JS helpers** используют instant/auto, parallax/reveal отключены.
- Сохранять wheel/trackpad/touch momentum, Tab, PageUp/PageDown, Home/End,
  выделение текста, поиск браузера, scroll restoration и browser zoom.
- Не перехватывать wheel/touch/Space для принудительного переключения «слайдов»,
  не добавлять full-page scroll engine/таймеры повторного позиционирования.
- При открытых menu/modal, вводе формы и программном focus snapping не должен
  конкурировать с управлением; проверить short viewport/mobile keyboard.

## 8. Палитра и доступные action tokens

| Роль | Значение / правило |
|---|---|
| Brand ice | `#e6eefc`, основной фон |
| Frost | `#d8e4f7`, вторичная поверхность |
| Navy | `#0d0f49`, основной текст/граница/solid CTA |
| Brand red | `#e5373c`, брендовый акцент/графика |
| Sky / deep | `#93cce6` / `#213561`, дополнительные поверхности/состояния |
| New | `#c8ff00`, badge с navy текстом |
| Action red strong | Proposed `#c82731`, белый текст; проверить все состояния |

Существующий white on brand-red расчётно **4,25:1** — недостаточно для обычного
мелкого текста; white on action-red-strong — **5,54:1**. Сохранить брендовый red,
но не считать любой красный CTA автоматически контрастным. Проверять gradient
по худшей подложке текста и реальные focus/hover/disabled состояния.
Цель: 4,5:1 обычный текст, 3:1 large text/существенные UI границы по WCAG;
декоративная граница не равна обязательному control outline.

## 9. Типографика

- Семантические роли: `display-hero`, `display-section`, `heading-card`,
  `heading-prose`, `body`, `body-small`, `label`, `caption`.
- Display сохраняет Gravity/Gratimo характер; body/prose — читаемая реальная
  face с нормальным weight. Text-size для body старт 1rem, line-height 1.45–1.65;
  reading width около 68ch. Малый текст не должен становиться 8px из-за autoscale.
- В текущем Tilda adapter `font-weight` выбирает **ширину** ABC Gravity.
  Сохранить alias для legacy, новые роли разделяют font family/width и weight.
  Не распространять font-thin/black как случайные width-переключатели по UI.
- Display hero допускает tight line-height/uppercase после проверки glyphs;
  body, формы и длинные заголовки используют безопасную высоту строки.
- Файлы Trial не считать поставленной production-лицензией. Showcase обязан
  проверять committed fallback; `sr`/`hy`/`ka`/`de` — glyph/script/line-height
  checks до публикации. Длинная DE строка — тест reflow, не причина уменьшить весь экран.
- Layout primitives не хардкодят RU строки/locale IDs. Язык, письменность и рынок
  остаются разными параметрами; выбор Serbian Latin/Cyrillic Open. Реальное
  `lang`, font fallback и форматирование передаются из Accepted i18n architecture,
  section manifest содержит только опубликованные варианты. Pseudo-localized
  длинные строки в showcase не создают новых публичных URL.

## 10. Библиотека компонентов

Предлагаемые границы (названия уточнить без создания дублирующих абстракций):

| Семейство | Компоненты / ответственность |
|---|---|
| Layout | Container, ReadingContainer, SectionFrame, CompositionGrid, CardGrid |
| Navigation | SectionNav / AnchorLink, site menu, locale switch |
| Actions | Button, LinkButton, IconButton; общий recipe, разные HTML semantics |
| Surfaces | CardShell, CardMedia, CardHeading, CardActions, Banner |
| Domain | ProductCard, BlogCard, NavigationCard, CompareCard на общих surfaces |
| Controls | Input, Textarea, Select/Choice, Field, FormStatus |
| Feedback | Badge, EmptyState, LoadingState, InlineError |
| Motion | Reveal, общий scroll helper с reduced-motion |
| Collections | Carousel/Slider на одном contract, domain slides отдельно |

Не создавать один компонент с десятками boolean props для всех видов карточек.
Domain data/localized copy передаются сверху. `Button` = действие, `LinkButton`
= реальный anchor/Next Link, `IconButton` имеет localized accessible name.
Full-card link не содержит вложенных кнопок/ссылок/форм. Если действий несколько,
использовать явные ссылки/actions, а не кликабельный div с key handlers.

### Единый state contract

| Состояние | Ожидаемое поведение |
|---|---|
| default / hover | Контрастный default; hover не единственный способ увидеть информацию |
| focus-visible | Видимый общий outline, элемент не скрыт под header/overflow |
| active / pressed | Короткий feedback без layout shift; toggles имеют aria-pressed |
| selected / current | Не только цвет; aria-current/selected по настоящей семантике |
| disabled | Реально недоступное действие; причина при необходимости, не только opacity |
| loading | aria-busy, стабильные размеры/label, защита от повторного действия |
| invalid / error | Сообщение у поля, aria-invalid/describedby, текст сохраняется |
| success / status | Только фактический результат; stub не сообщает об успешной отправке |
| hidden face / inactive slide | Исключён из tab/accessibility tree, focus не остаётся на невидимом control |

Project target для controls — 44–48px по высоте, icon hit area минимум 44×44;
это проектное предпочтение, не подмена WCAG AA минимума 24px с исключениями.
Размеры sm/md/lg и icon определяются tokens, CTA pill и rectangular — явные variants.

## 11. Motion и carousel

Стартовые motion tokens: feedback 120–180ms, reveal 220–320ms, overlay 180–260ms;
ease-out, slide distance 8–16px, stagger 40–60ms с пределом общей волны 400ms.
Фирменный hero/seal — отдельный документированный recipe, не универсальная
анимация всех блоков. Не использовать скачки scale 0.7/сдвиги 80px как default reveal.

Reveal запускается при входе в viewport, обычно один раз, только opacity/
transform. SSR/no-JS/error состояние **видимое**; контент не зависит от IntersectionObserver.
Focus/anchor target не уезжает от пользователя из-за entrance animation.
Reduced-motion отключает reveal/parallax/smooth и даёт статичный media fallback.

Carousel: native horizontal scroll/touch, явные prev/next names, keyboard,
логический порядок/одна доступная копия, осмысленное объявление изменения.
Вертикальный page scroll не перехватывается. Grid и carousel — явный выбор
section recipe, не случайная смена по одному viewport JS значению.
Auto-rotation default off; движение дольше 5s рядом с контентом имеет pause/stop.
Offscreen/hidden media не крутит тяжёлый RAF; ошибки дают устойчивый fallback.

## 12. Showcase и критерии готовности

Первый артефакт реализации — локальная design showcase на существующем Next.js,
например `/dev/design-system` (dev-only или исключена из production/индексации).
Storybook/UI-framework/animation/scroll library по умолчанию не устанавливать.

Showcase демонстрирует:

- Все tokens/type roles, buttons/links/icons/fields/badges, **все состояния**.
- Full, halves-x/y, quarters-x/y, quad; 3/4/6 cards, banner, carousel.
- Длинный RU/EN copy, отсутствие media, loading/error, невидимое compare face.
- Anchors/deep-link, soft snap и flow sections на одной длинной странице.
- Reduced-motion, no-JS content, keyboard и font fallback.

Минимальная матрица: 320px/390×844, 768px tablet, 1024×600, 1280×500,
1440×900, 1920×1080; 200% text/browser zoom и reflow эквивалент 320 CSS px
при 400% zoom. Проверить Chrome/Firefox/Safari по доступности, ограничения записать.
Проверить mobile toolbar/keyboard, Tab/PageDown/Home/End, direct hashes,
Back/Forward, RU/EN switch, выделение/поиск текста. Нет потери контента,
двумерного page overflow, скрытого focus и обязательного JS для чтения.

## 13. Порядок внедрения

DS-1: tokens + layout/primitives + showcase, без массового изменения страниц.
DS-2: anchors/scroll/reveal + **один** согласованный landing pilot с полной
и составной screen-композицией, card grid и banner. Затем DS-3 rollout по одному
template с regression checks. Новый запрос владельца разрешает такую
систематизацию принятых страниц; старые приёмки остаются baseline, а не запретом.
Сохранять URL/контент/локализацию/рабочие сценарии; новая геометрия проверяется
как целевое изменение. Статьи/legal сохраняют reading mode.

## Проверка реализации — 05.11.2026

DS-1 foundation и DS-2 pilot существуют, DS-3 широко перенесён. Ранний
implementation map выше не является текущим списком невыполненных спринтов.
Q2 (05.11) закрыл CardGrid max columns и 3D carousel scroll/autoplay gaps на
коде поверх d6011d2. Исторически на d6011d2 отмечались: CardGrid max columns, 3D carousel
vertical scroll/autoplay/offscreen policy, direct video reduced-motion fallback
и map text contrast. Их не считать выполненными по одному showcase smoke.
Файлы/строки R03/R04/R09/R10 — в [текущем ревью](../reviews/2026-11-05-public-integrity.md).

Q2 проверяет contract на реальных templates: long text/short windows/zoom,
native scroll, hidden focus и media failures. Примеры grid должны иметь больше
элементов, чем желаемое число колонок; no-JS/reduced-motion относится ко всем
вложенным video/client islands, а не только к внешнему Reveal/Zb wrapper.
Map attribution controls сохраняются видимыми. Новые runtime recipes не
обходят общие a11y/motion/layout правила; source-паритет допускает их исправление.

## Первичные источники и обоснования

- [CSS scroll snap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-type)
  — нативное positioning, proximity/mandatory различаются.
- [Scroll padding](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-padding-top)
  — место под fixed header; target margin не должен дублировать компенсацию.
- [Viewport units](https://web.dev/blog/viewport-units) — различие svh/dvh/lvh.
- [WCAG Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) — чтение
  при узком viewport/zoom без потери информации; презентационный стиль не делает сайт исключением.
- [Contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
  и [Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)
  — проверять реальные text/control/focus recipes, не только brand swatches.
- [Target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  — AA minimum с исключениями; 44–48px — более строгая проектная цель.
- [Focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
  — проверка видимости focus с fixed chrome.
- [Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
  — возможность отключения необязательного motion (AAA; проектное правило).
- [Pause/stop/hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
  — управление непрерывным автодвижением, reduced-motion не заменяет все controls.
