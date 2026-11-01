# Текущая серия — design foundation и продолжение публичной миграции

Дата: **01.11.2026**, проверен чистый `6b137e7`.
[Дизайн-код](design/DESIGN_SYSTEM.md), [ревью](reviews/2026-11-01-design-system.md),
[ADR](adr/0010-design-system-and-section-layout.md), [задание](CURSOR_NEXT_STEPS.md).

**Новое Confirmed направление владельца:** презентационные секции, адаптация
композиции по ширине/высоте, якоря, мягкий scroll, строгие grids и общие UI recipes.
Это меняет ближайший приоритет: **сначала DS-1**, затем pilot и rollout.
Ниже дан конкретный план; старый home/blog план сохранён как архив после новой серии.

## Текущий baseline

- Catalog/product и `/partnership` RU/EN приняты по имеющимся записям.
- Blog feed/tpost и small aliases закрыты по предыдущему Sprint 4b; не повторять
  listing/article/batch миграцию с нуля.
- `/russian-craft-beer`, `/horeca`, `/contacts`, `/policy` v1 в коде/ожидают приёмки.
- `/shopping-rules`, публичные agent/tours/map/shop и campaigns остаются backlog.
- Состояние старых sign-offs сохраняется; новый запрос разрешает целевые design
  изменения общих компонентов и принятых страниц с сохранением URL/контента.

| Новый спринт | Reviewable результат | Gate |
|---|---|---|
| DS-1 ✅ | Tokens, SectionFrame/Container/Grid, UI recipes и showcase | Cursor: lint/tsc/build PASS; browser showcase на localhost |
| DS-2 ✅ | Anchors/scroll/Reveal и pilot `/horeca` | Cursor: lint/tsc/build PASS; hashes + CompareCard DS-B; owner sign-off Open |
| DS-3 ← текущий | Последовательный rollout общих standards по templates | Каждый template без функциональных регрессий |
| P-Next | Остальные публичные шаблоны Sprint 5 | Baseline/DoD/приёмка по одному |

Это последовательность результатов, не обещание календарных сроков.
DS-1/DS-2 закрыты Cursor 01.11.2026; DS-3 в работе: contacts + home anchors +
partnership shell (`/partnership` RU/EN + `/russian-craft-beer`) — Cursor PASS.

## DS-1 — foundation и каталог состояний

**Цель:** создать проверяемую библиотеку, на которой можно собирать весь сайт.

1. Перепроверить inventory reuse; выделить семантические color/type/space/
   radius/border/focus/motion/z-index/layout tokens. Сохранить исходный бренд;
   action colors и Tilda font-width adapter сделать явными.
2. Реализовать server-friendly Container/ReadingContainer/SectionFrame/
   CompositionGrid/CardGrid; режимы screen/content/banner, min-height и overflow
   fallback. Прототип soft scroll/anchors показывать только на showcase.
3. Обновить shared Button без поломки callers, добавить LinkButton/IconButton,
   базовые Field/Feedback и Card surfaces; доменные data не переносить в primitives.
4. Showcase в существующем Next.js (dev-only, без Storybook по умолчанию):
   full, 50/50 x/y, 25/50/25 x/y, quad, 3/4/6 cards, banner/carousel recipe;
   default/hover/focus/pressed/selected/disabled/loading/error/missing states.
5. Показать RU/EN длинные строки, no-media/no-JS/font fallback и CompareCard
   hidden-face focus case. Применить contrast/reduced-motion правила.

**DoD:** библиотека и реальные showcase screenshots; TypeScript/lint/build;
320/390/768/1440 + short viewport/zoom; нет clipping/focus loss/двумерного page
overflow. Content остаётся читаемым до hydration. Обновлён design contract с
выбранными/непроверенными tokens. Новые CMS/DB/scroll/animation dependencies не нужны.

**Не входит:** массовое переписывание public pages, переработка контента,
автоматическое разбиение статей на слайды, новый CMS/ORM/Auth/Mapbox backend.

## DS-2 — навигация секций и один pilot

**Рекомендуемый pilot:** `/horeca` (уже v1, ещё ожидает приёмки). Если конкретный
контент не демонстрирует нужные layouts, часть комбинаций остаётся showcase;
не выдумывать маркетинговый текст ради заполнения трёх колонок.

- Составить section manifest: stable IDs, RU label/публикация, frame/layout,
  существующие fragments. Сверить source content/CTA через read-only MCP.
- Применить общие anchors/header offset и opt-in native proximity, Reveal,
  approved button/card recipes. Controls/long forms доступны без snap/scale trap.
- Full viewport + составная композиция + cards/banner должны показать подход
  на живом контенте; 25/50/25 допустимо использовать только там, где есть смысл.
- Исправить CompareCard focus по state contract, проверить touch/keyboard.

**DoD:** pilot browser matrix из DESIGN_SYSTEM; прямые anchors/Back/Forward,
mobile chrome/keyboard, reduced-motion, readable long copy, нет потери сценариев;
source URLs/контент сохранены. Владелец принимает новый layout recipe.
Один pilot не означает разрешение переписать все страницы одним действием.

## DS-3 — rollout по одному template

Очередь Proposed: home → остальные B2B/contacts оболочки → catalog/product →
blog listing. Общие header/button/field recipes переносить осторожно вместе
с regression callers. Статьи и legal используют ReadingContainer/content mode;
их смысловые headings получают anchors, body не режется на full-screen slides.

Для каждого template: before baseline → section map → целевое изменение →
lint/typecheck/build/browser → отчёт и фиксация приёмки. Сохранить существующие
SEO URL/hash/locale peers, фильтры, формы и keyboard. Не повторять импорт статей.
Legacy HomeWindowStage выводить постепенно; одинаковые новые проблемы решать
в общих primitives, не копировать page overrides.

## P-Next — продолжение Sprint 5

После проверенного foundation/pilot продолжить `/shopping-rules`, оставшиеся
публичные agent/tours/map/shop и campaign templates по backlog/бизнес-приоритету.
Они сразу используют design contract. Операции backend остаются на этапах 5+;
страница экскурсии не означает готовую бронь/оплату. Puck/editor пока не устанавливать.

## Архив первоначальной серии home/blog

Ниже сохранены план и последующие отметки исполнения на старой базе `2c1a9d0`.
Они объясняют уже пройденные шаги, **не являются текущим заданием**. Текущие
gate и приоритет — разделы выше и CURSOR_NEXT_STEPS. Не выполнять старые
home/listing/article milestones повторно и не делать вывод о новом sign-off
по одному историческому пункту.

| Спринт | Результат | Зависимость / gate |
|---|---|---|
| 1. Home | Проверенная и принятая RU/EN главная | Текущая работа, начать здесь |
| 2. Blog foundation + listing | Подтверждённые URL/контентный контракт и один листинг | После принятия home |
| 3. Article template | Одна настоящая RU/EN пара + отсутствие перевода | После listing/content contract |
| 4. Blog batches | Перенос статей небольшими проверяемыми партиями | После приёмки article template |
| 5. Public coverage | Остальные шаблоны по одному и общий stage-4 gate | В порядке inventory/бизнес-приоритета |

Порядок информационных/legal страниц можно изменить по бизнес-приоритету;
не объединять несколько больших реализаций в один запуск Cursor.

## Спринт 1 — закончить home

**Цель:** предъявить главную с сохранённым контентом и переходами, устойчивым
hero и честной newsletter-заглушкой. [Задание](CURSOR_NEXT_STEPS.md) — единственный
оперативный checklist; детали H01–H04 в [ревью](reviews/2026-11-01-home-and-sprints.md).

Работы:

1. H01: получить точные RU tpost URL для выбранных teasers. Не включать guess
   paths из fixture. Проверить выбранную статью по назначению, не только HTTP 200.
2. H02: first-successful-frame → reveal; ошибки canvas/decode/network → PNG.
   Проверить local sources и документировать gate внешнего CDN/CORS.
3. H03: ограничить runtime media work: подготовленный alpha/static fallback
   предпочтительнее непроверенной тяжёлой обработки каждого кадра. Проверить
   offscreen/visibility pause, reduced-motion, Save-Data, отказ autoplay.
4. H04: validity или явный неотправляющий newsletter UI, без backend success.
5. Через read-only MCP + public browser составить RU/EN section/CTA manifest.
   Зафиксировать EN MOA/menu решения, не переносить RU bands автоматически.
6. Проверить media/font fallback на воспроизводимом checkout/артефакте,
   metadata, ссылки и адаптивность. Три video encodes уже tracked — не копировать
   их повторно и не создавать новый media pipeline без подтверждённой причины.

**DoD:** свежие lint/typecheck/build; `/` и `/en` с одним H1 и корректными SEO
peers; реальные article destinations; отказ видео не скрывает fallback;
keyboard/touch/200% zoom/short viewport; 390×844 и 1440×900 screenshots;
регрессии `/beer` и разных product media/slug вариантов отсутствуют;
владелец принимает home. CPU/Network/LCP при измерении записать с окружением,
без выдуманного performance pass. Сохранить реальные evidence и ограничения.

**Не входит:** CMS/БД, отправка newsletter, формы в Make, новые языки,
редизайн принятых страниц, Cynic polish. Приёмку home подтверждает владелец.

## Спринт 2 — blog foundation и один listing

**Цель:** доказать схему переноса rich content и неполных переводов до масштабирования.

Сначала read-only Discovery:

- Свежий manifest страниц/feeds/постов: source ID, точный public URL, locale,
  title/description, даты и timezone при наличии, category, body/media,
  status, peer ID, aliases. Отличать source snapshot от текущего published.
- Сохранить разные назначения `/blog`, `/blog-all`, `/blog-all/tpost/...`,
  EN/legacy/article URL. Не унифицировать по удобному новому slug без redirect map.
- 83 RU / 42 EN из старого inventory — начальный snapshot, не целевое количество
  и не автоматические языковые пары. Найти настоящую пару и RU-only пример.

Затем контракты и один шаблон:

- Stable post entity + translations/status/slugs; category IDs отдельно от
  локализованной подписи; дата как подтверждённое значение, не display `14.10`.
- Явный missing-peer контракт SiteShell/LocaleSwitch, registry-driven SEO,
  опубликованные peers и required UI keys; источник fallback не создаёт public URL.
  Проверить synthetic draft/missing и разные slug на текущих RU/EN.
- Описать rich-body export/render и границу доверия: очищенный HTML либо
  типизированные blocks. Не исполнять Tilda/scripts и не делать произвольный
  raw HTML доверенным через `dangerouslySetInnerHTML`.
- Временные typed fixtures/adapter достаточны. CMS/editor выбрать отдельным
  Proposed ADR до установки сервиса; NocoDB не считать rich-content CMS.
  Сверить свободный ADR номер с backlog, не занимать зарезервированные IDs.
- Реализовать **один** listing/archive template по источнику; фильтры/пагинацию
  добавлять только для обнаруженного сценария. Header ссылку переключать на
  локальный маршрут только после его готовности.

**DoD:** manifest+content contract в `docs/discovery`, publication-aware peers,
один listing RU/EN, точные URL/SEO, keyboard/mobile, свежие проверки и приёмка.
Не подключать CMS/ORM/Auth ради первого листинга. Article body пока отдельный gate.

## Спринт 3 — article template как вертикальный срез

**Вход:** принятый listing и контракт спринта 2. **Результат:** один шаблон статьи
на одной реальной RU/EN паре, плюс кейс отсутствующего peer.

- Перенести body, heading hierarchy, обложки/inline media/alt, links и даты;
  сохранить source URL и подтверждённый canonical. Не сочинять перевод/дату.
- Проверить language switch по entity, missing/draft не рекламируются,
  self-canonical/hreflang, unknown slug/404, aliases без циклов.
- Подключить одну готовую статью к listing/home. Остальные пока ведут на
  подтверждённые production URL; не превращать незагруженные body в пустые local pages.
- Проверить безопасный body renderer, длинный RU/EN текст, внешние links,
  responsive images и доступность. Тестировать реальные контрактные края,
  не писать snapshot-тесты, повторяющие JSX.

**DoD:** source parity на паре, publication edge, URL/SEO/media проверки,
lint/typecheck/build, browser desktop/mobile/zoom, владелец принимает template.
Только после этого разрешено планировать партии контента.

## Спринт 4 — перенос блога партиями

Размер первой партии предложить по результату экспорта; не обещать перенос
всех 125 snapshot URL одним действием. Для каждой партии:

1. Сверить свежий manifest и зарегистрировать source IDs, URL, media, translations.
2. Преобразовать воспроизводимо, сохраняя provenance; вывести ошибки/пропуски.
3. Проверить body completeness, URL/canonical/peers, недостающие media/alt,
   redirects 301 для изменённых legacy URL по принятому контракту.
4. Обновить listing/home и sitemap только опубликованными local destinations.
   Зафиксировать сколько transferred / deferred / unknown, без ложного «всё готово».

**DoD партии:** отчёт расхождений, нет потери source URL/контента и фиктивных
переводов, свежие проверки, выборочная browser сверка по типам содержимого.
Количество реальных translated peers определяется данными, не равенством массивов.

## Спринт 4b — blog closure (Confirmed owner 01.11.2026)

**До Sprint 5** закрыть оставшийся blog-scope (раньше «optional»):

1. ~~Newsletter UI на `/blog`~~ done.
2. ~~YouTube `video` block + deferred embeds~~ done; VK/mp4 Open.
3. ~~Inventory + `/blog/expansion` + `/vacancies`~~ done.
4. Campaign landings (BMF/Klin/10-years): listing cards → production; **full pages = Sprint 5**.

Оперативный checklist: [CURSOR_NEXT_STEPS.md](CURSOR_NEXT_STEPS.md).
**Статус 01.11.2026:** blog feed/tpost + small aliases closed.

## Спринт 5 — оставшееся публичное покрытие и gate этапа 4

**Вход:** Sprint 4b blog feed/tpost closed (campaign landings may still be production-linked).

Это **серия мини-спринтов по одному шаблону**, а не массовый запуск:

- B2B/partners: `/partnership` **принято** 01.11.2026;
  `/russian-craft-beer`, `/horeca` v1 — ждут приёмки.
- Contacts/legal: `/contacts` + `/policy` v1 local
  ([CONTACTS_PAGE_BASELINE.md](discovery/CONTACTS_PAGE_BASELINE.md),
  [POLICY_PAGE_BASELINE.md](discovery/POLICY_PAGE_BASELINE.md));
  `/shopping-rules` ещё в очереди. Не генерировать правовые тексты.
- Остальные страницы из inventory, включая публичные agent/tours/map/shop:
  сохранять UI и честные внешние переходы там, где операции ещё в legacy.
  Публичная страница не означает готовую бонусную систему, карту-CRM или бронь.

У каждой итерации: MCP/source baseline → точный scope/DoD → один template →
свежие проверки/приёмка. Реальная доставка lead форм требует отдельного
серверного/consent контракта; до этого UI stub или подтверждённый production CTA.

Завершающий gate: обновлённый route matrix (local/external/deferred),
SEO/canonical/hreflang/sitemap/redirects/404, медиа и лицензии/артефакт,
доступность/переводы/предупреждения, явно перечисленные legacy operations.
Scope завершения публичного этапа подтвердить до объявления stage 4 Done.

## Когда переходить к backend

После согласованного публичного scope и соответствующего gate — отдельный
план этапа 5. Read-only Discovery Airtable/Make/YCLIENTS допустим заранее,
но сейчас не нужны install NocoDB/PostgreSQL, migrations, реальные webhooks
или production credentials. ORM/Auth/CMS/hosting выбираются по контрактам
модулей и ADR, а не одновременно ради «полной архитектуры».

NocoDB остаётся обязательным целевым admin-интерфейсом, PostgreSQL — предложенной
базой business data; edition/external datasource/roles проверить на своём этапе.
Публикация новых `sr`/`hy`/`ka`/`de` — отдельное решение после script/fonts/
translations/market checks. Ни этот план, ни green tests не разрешают commit/push,
DNS cutover, изменение Tilda или production-интеграций.
