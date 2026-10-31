# Текущее задание Cursor Agent

Дата: 31.10.2026. Ветка `first-front`. Пользовательская правка
`messages/ru.json` (`badges.alcofree`: «Безалкогольное») сохранена.
Рабочее дерево: F01–F06 закрыты в коде (не закоммичено). MCP baseline ALL order /
1200×700 / 4 cols записан в `listing-order.ts` и `TILDA_BEER_CATALOG.md`.
[Актуальное ревью](reviews/2026-10-31-follow-up.md),
[MCP Tilda workflow](discovery/TILDA_MCP_WORKFLOW.md).

**Gate:** lint/tsc/build PASS. Нужна визуальная приёмка владельца `/beer`.

## Цель

Завершить этапы 2–3: точный, доступный RU/EN `/beer` с общим chrome,
проверенным поведением и визуальной приёмкой владельца. Этап 4 уже начат
home/list/detail, но главная пока заглушка. Не переносить массово остальные
страницы и не подключать NocoDB/БД/Mapbox/платежи до текущего gate.

## Порядок изменений

1. **F01: lint галереи.** Исправить `product-gallery.tsx:45`
   `react-hooks/set-state-in-effect`. Проверить resize/SSR/hydration/overflow.
   Не отключать правило и не маскировать его таймером ради green.
2. **Source baseline через MCP.** Сверить RU/EN `/beer`, header/menu/footer по
   [протоколу](discovery/TILDA_MCP_WORKFLOW.md). Получить доступные tools/schema,
   страницы/records/ZB/settings/inserts. Зафиксировать editor vs published,
   inheritance, ALL/category order, arrow/drag behavior. Обновить Tilda-аудиты
   с provenance; разрешить расхождение о колонках около 1200px. Tilda не менять.
3. **F02–F03: модалки и язык.** Сохранить trigger до initial focus; после close
   снять inert/scroll lock, восстановить фокус. Проверить age gate отдельно.
   Исправить resting contrast второго языка в header/menu. Self-inert и старая
   lint-ошибка меню закрыты; сохранить portal вне inert-фона.
4. **F04–F05: карусель.** Вернуть подтверждённые минимум artboard/масштабирование,
   geometry hero/bottles/arrows. Проверить 1200×600. Хранить display order по ID
   отдельно от detail-фикстуры: сейчас ALL расходится с listing-контрактом.
   Шаг/drag и отклонения от production записывать явно, без догадок.
5. **F06: переходы.** Сопоставить header/menu/footer/CTA с локальными маршрутами.
   Для остальных подготовить временные переходы на подтверждённые действующие
   URL либо согласованный недоступный UI. Проверить locale и auth/legal;
   не создавать фиктивные EN ссылки и backend ради переходов.
6. **SEO/регрессии.** Сохранить уже подключённые переводы/home metadata,
   scroll reset, вынесенную фильтрацию и preload. Подтвердить свежими проверками.
   `permanentRedirect` даёт 308, не 301: сохранить обязательный 301 для изменённых
   legacy URL, отдельно описать политику aliases. Проверить root/unknown/404,
   canonical/hreflang/HTML lang.
7. **Проверки/отчёт.** Выполнить команды и browser QA ниже, сравнить screenshots,
   предъявить `/beer` владельцу. Закрывать пункты доказательствами;
   green build не является визуальной приёмкой.

## Критерии приёмки

- Поддерживаемый Node из `engines.node`; `npm run lint`, `npx tsc --noEmit`,
  `npm run build` проходят; локальное приложение открывается.
- RU/EN `/`, `/beer`, все 18 detail работают; разные slug Milk of Amnesia/
  Brainstorm сохраняют ID при смене языка. Нет redirect loops; HTTP-коды и
  Location проверены без автоматического следования redirects.
- Проверены self-canonical/hreflang, неизвестный product/URL, `/de/beer`,
  `/sr/beer`, global 404, html/body/lang, отсутствие рекламы planned locales.
- Меню: initial focus, Tab/Shift+Tab, Escape/крестик, возврат к trigger.
  Age gate блокирует фон; продолжение имеет осмысленный фокус.
- Фильтры после прокрутки показывают начало категории; ALL/category order
  совпадает с зафиксированным источником; короткие списки центрированы.
- RU/EN screenshots: 390×844, 960×900, 1200×600, 1440×900; touch/trackpad/
  desktop controls, resize, 200% zoom, длинные строки. Сравнить source/localhost
  header/menu/hero/bottles/arrows/form в одинаковых состояниях.
- Новый клиентский chunk не содержит полных RU/EN body-copy. Измерения payload/
  LCP, если сделаны, содержат окружение/команду. Старый build не выдавать за новый.
- Формы честно обозначены stub; реальные получатели пока не подключаются.
- Отчёт содержит изменённые файлы, команды/результаты, реальные evidence и
  ограничения. Обновить AGENTS/ROADMAP по результатам проверок.

## Подготовка следующих локалей — до их публикации

`sr`/`hy`/`ka`/`de` не включать сейчас. По [Accepted ADR](adr/0001-i18n-routing-and-content.md):
убрать RU/EN loops adapter/SEO, определить missing peer в LocaleSwitch/header,
UI required-key/fallback policy, нормализовать числа (F07), подтвердить сербскую
письменность, glyph coverage/лицензии и typography. Проверить draft/missing/
slug collisions. Язык, письменность и рынок разделены.

## После приёмки

По stage 4 выбрать один следующий публичный шаблон из SITE_INVENTORY,
снять MCP/source/browser baseline, сформулировать критерии и переносить его
с повторным использованием chrome/i18n. ORM/Auth/CMS/backend — на своих этапах.
Commit/push и production-действия — только по разрешению владельца.
