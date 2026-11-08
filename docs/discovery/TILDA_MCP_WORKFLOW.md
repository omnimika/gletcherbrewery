# Tilda MCP — исходники и проверка миграции

Дата: 31.10.2026. **Confirmed владельцем:** MCP Tilda подключён в Cursor,
есть доступ к исходникам страниц. Это расширяет Discovery; этапы ROADMAP
и визуальную приёмку не отменяет. Codex в этом ревью MCP напрямую не вызывал.

## Источники

- Public site — фактические URL, опубликованный контент и UX посетителя.
- MCP/editor — структура, настройки блоков, breakpoint overrides, ссылки,
  ассеты, вставки. Editor может содержать неопубликованные изменения.
- Owner CSV — согласованные категории/продукты. Расхождения с editor фиксировать
  и разрешать явно, без молчаливой подмены.
- Локальный HTML/JSON — датированный snapshot, не гарантия актуальности.

Разделять `editor / published / local`, raw и интерпретацию Next.js.
`height_vh:80` не доказывает `80svh` или итоговый размер после Tilda JS.

## Первый read-only проход Cursor

1. Прочитать [задание](../CURSOR_NEXT_STEPS.md), проверить доступные MCP tools
   и их схемы, проект/список страниц. `get_page_records`/`get_zero_block`
   упомянуты в имеющемся аудите, но фактический API определяет сервер.
2. Сверить project `1212341`, RU page `16494049` (`beer`), EN page `50623499`
   (`en/beer`): alias/locale/public URL, publication state/date, SEO,
   header/footer linkage. ID — отправная точка, не гарантия неизменности.
3. Считать order/visibility records, hero `735254792`, ALL `802918687`,
   category blocks, form `753207250`. Проверить RU/EN header/menu/footer:
   код ссылается на headerpage `44416371`, ZB `711698335` и menu `715585432`.
4. Получить значения **с наследованием breakpoint overrides**: H/vh,
   upscale/overflow, item width/height/top, hero/arrows. Сверить колонки около
   1200px: [catalog audit](TILDA_BEER_CATALOG.md) и
   [slider audit](TILDA_BEER_SLIDER.md) описывают диапазон неодинаково.
5. Прочитать inserts, NLM113 category targets, NLM127 arrow/drag settings.
   Не запускать извлечённый сторонний JS автоматически. Записать фактический
   шаг/масштабирование, touch/desktop drag, смену категории.
6. Составить RU/EN ALL/CLASSIC/CRAFT/LIMITED order: stable product ID,
   source element ID, position, slug/link, badge. Сопоставить с CSV/adapter;
   не определять порядок витрины порядком detail-фикстуры.
7. Сравнить public/editor-preview и localhost при одинаковых viewport:
   390×844, 960×900, 1200×600, 1440×900. Preview не публиковать. Если browser
   недоступен, отметить ограничение: исходник не равен визуальной приёмке.

## Доказательства

Обновить затронутые части `TILDA_BEER_CATALOG.md`, `TILDA_BEER_SLIDER.md`,
`UI_COMPONENT_AUDIT.md`, `SITE_INVENTORY.md`, `CONTENT_SEO_INVENTORY.md`.
Для каждого нового факта сохранить:

| Поле | Содержание |
|---|---|
| Provenance | дата/время, tool, project/page/record/element ID |
| State | editor/published, public URL, известная дата публикации |
| Raw | ключ/значение, breakpoint, унаследованный default |
| Interpretation | расчёт/runtime-результат отдельно от raw |
| Mapping | Next component/fixture, stable ID, ожидаемый UX |
| Evidence | очищенный snapshot/extract, viewport/screenshot |
| Status | Confirmed / Observed / Open; конфликт и решение |

Крупные raw exports хранить вне `public`; в Git достаточно необходимого
очищенного extract и manifest с SHA-256. Screenshots должны реально существовать.
Прежний snapshot не перезаписывать без даты/происхождения. Не сохранять keys,
cookies, private form endpoints или персональные заявки в отчётах. Права
на экспорт и лицензии медиа остаются отдельным вопросом.

## Границы

MCP использовать для чтения. Сохранение/удаление/публикация блоков и изменение
production-интеграций выходят за задание. Next.js использует локальный
типизированный контент, без runtime-запросов Tilda на каждый визит.
Публичный [Tilda API](https://help.tilda.cc/api) предназначен для синхронизации,
не запроса при каждом посещении; лимиты конкретного MCP могут отличаться.

Переносить результат/UX в React, а не весь Tilda DOM/NOLIM/аналитику.
Отличия вроде шага «одна карточка» или `svh` вместо `vh` фиксировать как
предложение и предъявлять при приёмке. Исходники не подтверждают актуальные
цены, остатки, бонусные правила, бронирование или условия платежей.
