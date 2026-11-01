# Следующая серия спринтов — публичная миграция

Дата: **01.11.2026**. База анализа: чистый `2c1a9d0`.
[Ревью](reviews/2026-11-01-home-and-sprints.md),
[ROADMAP](ROADMAP.md), [текущее задание](CURSOR_NEXT_STEPS.md).

**Confirmed:** `/beer` и product template приняты, Cynic у владельца;
активный gate — home `/` и `/en`. **Proposed:** очередь спринтов 2–5 ниже.
Это порции результата с зависимостями, не календарные обещания. Каждый новый
публичный шаблон проходит собственную приёмку до тиражирования.

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
