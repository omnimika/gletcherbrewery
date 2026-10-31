# Повторное ревью product template — 31.10.2026

Проверяемый commit: **`6f84465`**, ветка `first-front`. На старте рабочее дерево
чистое, staged/unstaged изменений нет. Baseline: `6cd6476`; статус прежних
T01–T05 сопоставлен с [ревью 9e0ee8e + рабочего дерева](2026-10-31-product-template.md).
Codex изменяет только документацию, без пакетов, commit/push и правок приложения.

`/beer` уже принят владельцем. Текущий этап 4 — product template и его отдельная
визуальная приёмка, затем один следующий публичный шаблон. Backend и новые
локали сейчас не нужны. [Задание](../CURSOR_NEXT_STEPS.md),
[промпт](../CURSOR_REVIEW_PROMPT.md), [baseline](../discovery/PRODUCT_PAGE_BASELINE.md).

## Что изменилось

В `6cd6476` добавлены H1 всех media-веток, header в keyboard trap, скрытие loop
клонов из tab order/доступного дерева, focus sync, production home CTA и снятие
нижеэкранного preload. Добавлены hero → `#about`, bottle/glass hover/focus и
иконки объёмов. В `6f84465` изменены layout/типографика detail/specs,
header после прокрутки и сохранение hash в LocaleSwitch.

| Прежний ID | Текущий статус по коду |
|---|---|
| T01 H1 | Закрыт: 36/36 statically rendered hero имеют один H1 |
| T02 меню | Keyboard reachability исправлена; modal semantics остаётся A02 |
| T03 loop links | Исправлен: aria-hidden + tabIndex=-1 на клонах, focus sync; browser QA остаётся |
| T04 home Agent | Закрыт: используется production mapping |
| T05 preload | Закрыт: BottleWithGlass не задаёт priority |

Не повторять старые формулировки «нет H1», «54 доступных ссылки» или «крестик
недостижим Tab»: они уже не описывают текущий код.

## Свежие проверки Codex

Node 25.5.0, подходящий текущему `engines.node`:

| Проверка | Результат |
|---|---|
| `tsc --noEmit --incremental false` | PASS |
| ESLint `. --max-warnings=0` | PASS |
| Canonical ID/slug round-trip | PASS: 36 RU/EN, без коллизий |
| React static render ProductHero | PASS: 36 hero / 36 H1, настоящий next/image |
| Media mapping | PASS: 48 cover/logo/glass ссылок, все файлы существуют |
| Glass coverage | 14/18; нет underground/brut/tour/cynic, как задокументировано |
| Messages | 75 RU / 75 EN leaf-ключей, одинаковый набор |
| Planned/synthetic draft paths | PASS: публичные paths/alternates не выдаются |

TS/React проверки выполнены в памяти без записи тестов/кеша. Build/dev/browser
на HEAD **не запускались**. Сообщённые Cursor build/36 HTTP 200/browser результаты
относятся к его проходу; их нельзя считать свежей проверкой следующего коммита
`6f84465`. Прямые MCP Tilda tools в этой сессии не доступны; новых MCP-запросов нет.

Ссылки 10 изменённых/новых Markdown-файлов и `git diff --check` — PASS.
Снимки 335 файлов вне разрешённой документации до/после совпали; SHA-256:
`09a460b1ee0330caaff7bd7e1715ac7618d3aa415be9d175f34f75d134ab9f15`.
Код, конфигурация, зависимости и assets не изменены Codex.

## Текущие замечания

### A01 — P2: одноэкранная высота скрывает переполнение текста

[product-detail.tsx](../../src/components/product/product-detail.tsx):60,89.
На `md+` секция имеет height **и max-height** `100svh − --hh` с overflow-hidden;
правая колонка также скрывает overflow. Текст и характеристики имеют ненулевые
минимальные размеры/отступы и могут быть выше доступного окна. Ни расширения
секции, ни доступного scrolling fallback нет: нижние строки становятся недоступны.
Это подтверждённое ограничение CSS, не измеренный screenshot конкретного viewport.

Сохранить одноэкранный дизайн там, где контент помещается; на коротких окнах,
при увеличенном тексте и длинном переводе разрешить естественную высоту/доступное
продолжение. Не сокращать тексты и не уменьшать их до нечитаемого размера ради fit.
Проверить длинные RU/EN продукты, 1024×600, 1280×500, landscape и 200% zoom;
доступность конца about/pairing/specs/malt/hops, а не только верхнего заголовка.

### A02 — P2: header входит в Tab cycle, но находится вне modal subtree

[main-nav-overlay.tsx](../../src/components/main-nav-overlay.tsx):57–60,83–90;
[site-header.tsx](../../src/components/site-header.tsx):133–158,205–235.
`chromeRef` исправляет keyboard reachability. Однако `role=dialog aria-modal=true`
по-прежнему стоит только на portal-div ниже header. Закрытие/язык снаружи его
DOM/accessibility-поддерева не становятся содержимым modal от добавления refs.
Согласовать modal semantics и доступную область controls, сохранив принятый chrome.
[WAI-ARIA modal pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
описывает controls диалога как его descendants. Проверить keyboard и accessibility
tree/screen reader. Подтверждена DOM-структура; поведение конкретного reader не измерялось.

### A03 — P3: новый массив refs перезапускает initial focus

[main-nav-overlay.tsx](../../src/components/main-nav-overlay.tsx):59 создаёт
`additionalRefs: [chromeRef]` при каждом render. Effect trap зависит от массива
([use-focus-trap.ts](../../src/lib/use-focus-trap.ts):100), setup фокусирует первый
dialog item (:63–65). При resize/rerender открытого меню focus сбрасывается.
Стабилизировать refs/lifecycle; проверить сохранение keyboard-позиции при resize.
Это отдельная причина, не прежняя ошибка сохранения origin trigger.

## Обязательные проверки перед product sign-off

- Friday RU/EN, Ausweis с logo overlay, Cynic без cover/logo, плюс длинные
  описания. 390×844, 1440×900 и короткие viewport/zoom из A01.
- Hero → `#about`; header после scroll; переход related → другой продукт;
  RU→EN→RU, Back/Forward. Для MoA/Brainstorm особенно проверить разные slug.
- `useLocationHash` (:28–36 LocaleSwitch) слушает native hashchange, а History API
  его не вызывает ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event)).
  Текущий hero использует native anchor; не выдавать ограничение подписки за уже
  воспроизведённый баг. Проверить hash после Next client navigation, чтобы не
  переносить старый fragment. Fragment не отправляется серверу: curl это не проверит.
- Menu keyboard/modal, возврат фокуса, gallery clone focus, hover/focus glass,
  отсутствие glass, touch и reduced-motion. A02 — частичное закрытие старого T02.
- Новый build, локальный запуск, HTTP/SEO/404/planned locale checks на HEAD.
  Проверка H1 hero в памяти не доказывает финальный HTTP HTML всей страницы.

### localhost / 127.0.0.1

Cursor ранее сообщил loop на `next start --hostname 127.0.0.1`; localhost —
его рабочий способ запуска. Это не подтверждённый новый runtime-результат Codex.
In-memory запуск установленного next-intl middleware с текущей routing config:
RU localhost переписывается в `/ru/...`; RU IP-origin также в `http://localhost:3000/ru/...`;
EN — без rewrite, Location отсутствует во всех четырёх случаях.
Установленный `next/dist/server/web/next-url.js`:15–19 нормализует loopback
hostname в localhost. Этот изолированный результат объясняет, что надо исследовать,
но не воспроизводит полный next-start loop. Не фиксировать проблему как «ошибка
next-intl» без цепочки HTTP, Host/forwarded headers и команды запуска. Зависимости
или production routing ради неподтверждённой причины не менять.

## Сохранённые архитектурные границы

RU/EN dataset полный. Перед частичной публикацией или `sr`/`hy`/`ka`/`de`
остаётся [ADR 0001](../adr/0001-i18n-routing-and-content.md): registry-driven
catalog/SEO peers, missing-peer контракт header/LocaleSwitch, UI fallback/required
keys, сербская письменность, glyph coverage/лицензии, typography. Это будущие gates,
не задача сейчас переводить сайт. 308 aliases и 301 legacy URL документировать отдельно.

Related first-12 policy остаётся Proposed. Перенос полного исходного legal notice
остаётся требованием AGENTS к публичной миграции: отложенный текст нельзя помечать
ненужным/удалённым по умолчанию. До production сверить RU/EN копию; это не новое
заключение о применимом праве и не требование перепроектировать текущий v1.

## Дальше

A01/A02 → A03 вместе с lifecycle → свежий QA HEAD → визуальная приёмка product
template владельцем → один следующий шаблон stage 4 (кандидат home) с MCP baseline.
`/beer` повторно не предъявлять как непринятый. Commit/push/production — отдельно.
