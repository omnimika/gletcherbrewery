# Ревью product template v1 — 31.10.2026

HEAD `9e0ee8e`, ветка `first-front`; предыдущая проверенная база `81713e4`.
Проверены коммит и **рабочее дерево**, включая ещё не добавленные в Git
`src/components/product/*`, `product-media.ts`, `format-spec.ts`, covers/logos,
а также изменения detail page, header и RU/EN messages. Staged-файлов на старте
нет. Пользовательские изменения сохранены; Codex редактирует только документы.

**Confirmed по новым инструкциям владельца:** `/beer` принят 31.10.2026.
Визуальную приёмку каталога не открывать заново. Текущий gate этапа 4 —
product template v1 по [baseline](../discovery/PRODUCT_PAGE_BASELINE.md).
Дальнейшие общие accessibility-исправления не отменяют принятие визуала.

[Задание Cursor](../CURSOR_NEXT_STEPS.md),
[готовый промпт](../CURSOR_REVIEW_PROMPT.md),
[предыдущее ревью](2026-10-31-follow-up.md).

## Сделано и соответствие плану

- Разделение на серверные ProductHero, ProductDetail, ProductSpecsPanel,
  ProductRelated; страница собирает контент и labels активной локали.
- Stable ID → media mapping, локальные cover/logo, явный bottle fallback Cynic.
- RU/EN labels, форматирование ABV/OG/IBU/объёмов через Intl, related cards
  только активной опубликованной локали; canonical и aliases сохранены.
- Ранее F01: gallery `setMounted` заменён `useSyncExternalStore`; F02: меню
  получает явный trigger ref, age gate имеет точку продолжения; F03: убран
  `opacity-20`; F04: восстановлены artboard min-heights; F05: display order
  вынесен в `listing-order.ts`; F06: header/menu/footer используют production
  mapping. На стартовой главной осталась локальная `/agent` ссылка (T04).
- F07: числовое форматирование реализовано для текущего набора raw-значений.

Это обоснованное продолжение этапа 4. PostgreSQL/NocoDB/карта/бонусы/бронь
не нужны для завершения шаблона. Главная пока стартовая; её миграция следующая
после приёмки product template, по одному публичному шаблону за раз.

## Свежие проверки

Node 25.5.0, соответствующий текущему `engines.node`:

| Проверка | Результат |
|---|---|
| `tsc --noEmit --incremental false` | PASS |
| ESLint `. --max-warnings=0` | PASS, 0 warnings |
| Canonical ID/slug round-trip | PASS, 36 RU/EN карточек, slug уникальны |
| Фильтры RU и EN | ALL 18 / CLASSIC 3 / CRAFT 11 / LIMITED 3 / AGING 1 |
| Messages | 75 RU / 75 EN leaf-ключей, пропусков между словарями нет |
| Media mapping | 34 cover/logo ссылки существуют; Cynic намеренно без них |
| Planned/draft paths | PASS: planned paths null; synthetic draft исключён из paths/alternates |
| Intl примеры | `5,2` → EN `5.2`, RU `5,2`; `0,33` → EN `0.33`; `N/A` сохранён |
| Статический React render ProductHero | H1 отсутствует в 16/18 вариантах (T01) |

Проверки данных/React render выполнены временной TS-транспиляцией в памяти,
без записи исходников/тестов/кеша. React render использовал настоящий next/image.
Это не HTTP или browser-проверка всего приложения.

Build/dev/browser Codex не запускал. Запись Cursor о browser 200 для Friday/
Cynic/Ausweis — его предыдущий результат; Codex его сейчас не воспроизводил.
Нужен свежий build именно dirty tree с новым шаблоном, а не артефакт коммита.
В этой сессии MCP Tilda tools не доступны; прямых MCP-запросов не было.
Публичные RU/EN Friday просмотрены веб-инструментом, без pixel-comparison.

Локальные ссылки 12 изменённых/новых Markdown-файлов и `git diff --check` —
PASS. Снимки 319 файлов вне разрешённой документации до/после совпали:
SHA-256 списка путей/хешей
`fb916be97691564e1f95607d0309d7d9a0729213abac50b602c06b91c1e8e7e4`.
Код, конфигурация, зависимости и новые пользовательские assets не менялись Codex.

## Замечания

### T01 — P2: большинство продуктов теряет H1

[product-hero.tsx](../../src/components/product/product-hero.tsx):57–71.
Ветка `showLogoOverlay` выводит `<img alt={title}>`, H1 есть только в двух
других ветках. По текущему mapping 16/18 продуктов (32 RU/EN страницы), включая
Ausweis, MoA и Brainstorm, остаются без заголовка первого уровня.
Friday и Cynic проходят, поэтому одна эталонная страница дефект не выявляет.
Обеспечить единый H1 названия независимо от способа вывода wordmark;
визуально скрыть при необходимости. Проверить все 36 canonical страниц.

### T02 — P2: доступный scope меню исключает видимые controls header

[main-nav-overlay.tsx](../../src/components/main-nav-overlay.tsx):51,75–80;
[site-header.tsx](../../src/components/site-header.tsx):136–137,176–204.
Trap ограничен `dialogRef` ниже header. Tab/Shift+Tab циклят ссылки меню;
видимые крестик и language picker находятся снаружи и не достигаются этой
последовательностью. `aria-modal=true` также описывает более узкую область.
Escape работает, но не делает видимый крестик доступным с клавиатуры.
Сохранить принятый chrome: объединить controls и меню в согласованный
доступный scope либо добавить внутреннюю доступную кнопку закрытия.
[WAI-ARIA modal pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
описывает закрытие и Tab-последовательность внутри диалога. Проверить браузером
keyboard и accessibility tree; текущее замечание подтверждено структурой кода.

### T03 — P2: loop-клоны создают повторные фокусируемые ссылки

[product-gallery.tsx](../../src/components/catalog/product-gallery.tsx):80–102,199–207;
[product-card.tsx](../../src/components/catalog/product-card.tsx):26–30.
ALL создаёт три копии: 54 обычных links для 18 продуктов. Клоны не исключены
из tab order/доступного дерева. При фокусе на внешней копии normalize (:126–149)
переставляет scroll в среднюю, но не переводит фокус к эквивалентной ссылке.
Подтверждены копии/links и отсутствие синхронизации; конкретный browser-jump
не воспроизводился. Сохранить принятый loop UX, обеспечить одну логическую
последовательность или управляемое фокусирование/wrap. Проверить Tab и чтение
на границах. Одного `aria-hidden` на фокусируемом клоне недостаточно.

### T04 — P2: на главной осталась локальная ссылка на отсутствующий `/agent`

[home](../../src/app/[locale]/page.tsx):71–76.
Header/menu/footer уже используют `productionHref`, home CTA ещё использует
локальный Link. В дереве приложения `/agent` отсутствует. Применить тот же
временный mapping; backend ради ссылки не создавать. Проверить RU и EN.
Это остаток F06; не блокирует выбор product template, но ломает переход.

### T05 — P3: preload у изображения ниже полного hero

[product-detail.tsx](../../src/components/product/product-detail.tsx):74–82.
Бутылка получает `priority`, хотя content расположен после hero высотой 100svh,
а hero уже имеет preload. Выбирать высокий приоритет по первому экрану/LCP,
проверить Network. В этом ревью влияние на LCP/байты не измерялось.

## Source/visual задачи перед приёмкой шаблона

- Проверить Friday RU/EN, хотя бы один logo-overlay продукт (Ausweis) и Cynic
  без cover/logo. H1/metadata/content/link проверки — на всех 36 страницах.
- Масштаб бутылки: `ProductDetail` использует 200×577 slot с `object-contain`
  для padded PNG 584×960. По alpha bbox Friday физическая бутылка получается
  около 82×296px; сохранённый Tilda shape 200×577 с background cover — около
  144×520px. Это расчёт исходника, не свежий screenshot. Сверить узнаваемый
  масштаб и пустое пространство; pixel-perfect всего Zero Block для v1 не нужен.
- Header публикует `--hh` на documentElement эффектом; проверить первый paint,
  hydration, resize и переходы catalog → detail → detail на мобильном экране.
  Контролировать положение hero без приписывания текущему коду измеренного CLS.
- Related сейчас первые 12 других cards, а не согласованная редакционная
  рекомендация. Зафиксировать как Proposed policy и сверить с источником.
- Публичные [RU Friday](https://www.gletcherbrewery.com/beer/friday-avenue-apa)
  и [EN Friday](https://www.gletcherbrewery.com/en/beer/friday-avenue-apa)
  содержат отдельное предупреждение о вреде чрезмерного употребления алкоголя.
  В текущем footer/messages есть только drink-responsibly. По AGENTS §4.1
  сохранить исходные предупреждения в общей оболочке с RU/EN копией; это проверка
  полноты переноса, не заключение о достаточности текста с точки зрения права.
- Baseline MCP содержит page/record ID, но не полный manifest/screenshot matrix.
  Cursor дополнить provenance и реальные артефакты по [MCP workflow](../discovery/TILDA_MCP_WORKFLOW.md).
  Editor и published могут различаться; доступ к исходникам не является приёмкой.

## i18n и дальнейшая архитектура

Серверные product-компоненты и shared specs + localized copy подходят текущему
этапу. Не внедрять БД/CMS для исправления этих пунктов. Перед частичной
публикацией/новыми локалями остаются задачи [ADR 0001](../adr/0001-i18n-routing-and-content.md):

- Убрать явные RU/EN loops в catalog/metadata в пользу registry + publication.
- `LocaleSwitch` должен различать missing peer и отсутствие override; тип
  пока исключает null, проверки null есть. Header не получает entity peers.
  Для полных RU/EN MoA/Brainstorm entity сохраняется через canonical redirect;
  для draft/missing header рекламировал бы недоступный URL. Это контрактный
  пробел до частичной публикации, а не поломка текущих 36 переводов.
- UI active-only JSON и product-copy fallback имеют разные механизмы.
  Определить required-key/fallback policy и обязательные юридические переводы.
- Сербская письменность, glyph coverage/лицензии `sr`/`hy`/`ka`, длинные DE
  строки, typography и компактный picker остаются gate новых языков.
- Intl работает на текущих простых числах. Для будущих диапазонов/единиц
  не использовать `parseFloat` как строгий парсер: сейчас он отрезал бы хвост.
- Permanent alias 308 и legacy 301 — разная политика. Комментарий «accepted»
  в detail не заменяет ADR; сохранить 301 для изменённых legacy URL по AGENTS.

## Очередность

T01 → точечные T02–T04 и T05 по результатам Network → свежий build/HTTP/QA
product template → визуальная приёмка владельца → один следующий публичный
шаблон stage 4 (кандидат — home). `/beer` повторно не предъявлять как непринятый.
Commit/push/production — по отдельному разрешению. Документы должны сохранять
разницу между owner acceptance, проверенным кодом и невыполненными проверками.
