# Home и следующий цикл миграции — ревью 01.11.2026

Проверен **`2c1a9d0`**, ветка `first-front`, на старте дерево чистое.
Baseline: `6453b91`; закрытие прежних A01–A03 проверено относительно `0df9706`
и [предыдущего ревью](2026-10-31-product-acceptance.md).
Codex меняет только разрешённую документацию, без кода/пакетов/commit/push.

## Текущее положение

**Confirmed по AGENTS и документам приёмки:** `/beer` и product template приняты,
product gate записан в `0df9706`. Cynic — owner follow-up, не текущая задача.
A01 исправлен min-height без clipping; A02 — единый dialog shell с header;
A03 — стабильный lifecycle trap. Старые A01–A03 повторно не открывать.

После этого реализован home v1: `/` и `/en`, hero/video/seal, MOA banner,
B2B/map, tours, menu grid, blog teasers и newsletter UI. Home ещё ждёт приёмки.
Текущий этап — **4, публичная миграция**. Backend/NocoDB/Mapbox/бронь не нужны
для закрытия текущего gate. [Задание](../CURSOR_NEXT_STEPS.md),
[серия спринтов](../SPRINT_PLAN.md), [промпт](../CURSOR_REVIEW_PROMPT.md).

## Свежие проверки и ограничения

Node 25.5.0, удовлетворяет текущему engines:

| Проверка | Результат |
|---|---|
| `tsc --noEmit --incremental false` | PASS |
| Полный ESLint `. --max-warnings=0` | PASS |
| Catalog ID/slug round-trip | PASS, 36 RU/EN |
| Messages | 140 RU / 140 EN leaf-ключей, наборы совпадают |
| Изолированный HomeHero render | RU/EN по одному H1; navigation Link заменён простым anchor, только структурная проверка |
| Home teasers | RU: 4 карточки / 1 destination; EN: 4 / 4 |
| Literal `/home/*` media в home components | 7 уникальных ссылок существуют; это не полный asset audit всех content maps |
| Hero video | Все 3 delivery encodes существуют и отслеживаются Git |

Проверки выполнены без записи TS-кеша/тестов. Build/dev/browser на HEAD Codex
не запускал; HTTP, visual parity, CPU, LCP/INP/CLS и реальные сетевые байты не
измерены. Прямые MCP Tilda tools здесь недоступны. Публичные home RU/EN прочитаны
web-инструментом; это текстовый источник, не визуальное сравнение или новый MCP snapshot.

Проверка локальных ссылок 12 изменённых/новых Markdown-файлов и
`git diff --check` — PASS. Снимки 375 файлов вне разрешённой документации
до/после совпали; SHA-256 списка путей/хешей:
`65f9d12f389b95808b10ebe033e0b5e81d48be63df834203770f112f520b2bd6`.
Код, зависимости, конфигурация и assets не изменены Codex.

## Замечания для home

### H01 — P2: RU teaser не открывает выбранный материал

[home.ts](../../src/content/home.ts):127–133 заменяет назначения всех RU карточек
одним `/blog`. [HomeBlog](../../src/components/home/home-blog.tsx):20–35 показывает
их как отдельные статьи. Это рабочий переход в список, но потерян сценарий
«нажать конкретную статью». Placeholder tpost segments из исходного массива
не используются — их нельзя просто включить. Получить точные RU URL из
MCP/feed/публичных ссылок; временный общий CTA должен быть явно обозначен.
EN URLs присутствуют в сохранённом feed sitemap; свежий HTTP их не проверен.

### H02 — P2: video fallback скрывается до успешного canvas frame

[home-hero-bottle.tsx](../../src/components/home/home-hero-bottle.tsx):363–366,409
ставит videoOk по playback/playing. PNG скрывается (:433–434), хотя успешный
canvas frame ещё не подтверждён. Ошибки drawImage/getImageData/putImageData
(:388–402) не перехватываются: исключение прекращает RAF, PNG уже может быть скрыт.
Показывать canvas после первого успешного кадра, сохранять/возвращать PNG при
отказе render/decode/source. Это подтверждённый путь ошибки по коду, не свежая
воспроизведённая поломка локального hero.

До включения `NEXT_PUBLIC_HERO_BOTTLE_BASE` на другом origin дополнительно
проверить CORS: video (:438–448) не имеет crossOrigin, opaque branch читает
пиксели (:394). Canvas с внешним источником без подходящего CORS не допускает
readback ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image)).
Default same-origin не считать уже сломанным; CDN — отдельный конфигурационный gate.

### H03 — P3: frame loop не останавливается вне hero

Тот же компонент :372–415 продолжает RAF, пока смонтирован; нет offscreen/
visibility pause. При opaque source выполняется покадровая маска в native
video dimensions. Нагрузку не измеряли. Предпочесть подготовленное alpha media
или корректный static fallback; если runtime matte остаётся — обосновать замером,
ограничить frame work и останавливать при уходе hero с экрана/скрытии вкладки.
Не усложнять этот UI новыми сервисами или бесконечной полировкой контура.

### H04 — P3: newsletter пропускает базовую validity

[home-newsletter.tsx](../../src/components/home/home-newsletter.tsx):37–39,70–83
имеет noValidate и не проверяет validity. Пустой/невалидный email также выводит
pending note. Fake backend success отсутствует — это уже корректно. Вернуть
простую валидацию либо сделать честный неотправляющий CTA; backend не подключать.

## Приёмочные вопросы, а не подтверждённые ошибки

- Состав RU/EN секций: baseline описывает более короткий EN; MOA EN peer Open.
  В коде один набор компонентов для обеих локалей. Зафиксировать опубликованный
  состав/согласованные отличия; не считать равное число секций обязательным.
- MOA PNG просмотрен: только brand/Milk of Amnesia/non-alcoholic, русского
  baked текста нет. Не открывать ошибку «непереведённый EN баннер».
- Home title/description уже локализованы; RU/EN title соответствует baseline.
  Не требовать повторного исправления title без нового доказательства.
- Delivery encodes: MP4 3 404 967 B, WebM 2 585 261 B, alpha WebM 11 680 025 B.
  Это размеры файлов, не сумма загрузки при визите. Не объявлять видео отсутствующим
  или Git-ignored: ignored только masters/work и локальные материалы.
- Проверить EN shop и прочие CTA по source/HTTP. Отсутствие результата web-open
  не доказывает 404. Не создавать EN peer предположением.
- Новые display-width Trial WOFF остаются локальными/ignored. Проверить clean
  checkout/артефакт с разрешёнными font fallback перед публикацией; локальный
  font-match не является гарантией воспроизводимого деплоя.

## i18n и будущие спринты

Product peer paths уже передаются через SiteShell в header; это прогресс
относительно старого ADR implementation note. Однако Partial<string> всё ещё
не различает missing peer и отсутствие override, undefined даёт текущий pathname.
Catalog/product loops и SEO peers ещё фиксируют RU/EN. UI JSON загружается только
активный; product-copy fallback — отдельный механизм.

Перед блогом с неполными переводами закрепить единый page/entity peer contract,
publication-aware switcher/SEO, stable post IDs и locale slugs, корректные даты.
Snapshot 83 RU / 42 EN blog URL не считать ни сегодняшним итоговым количеством,
ни 42 доказанными парами переводов. Это не требует публикации новых языков.

`sr`/`hy`/`ka`/`de` остаются planned; сербская письменность, glyph coverage,
типографика и required legal messages — отдельные gates. Хранить язык, script
и market отдельно. Блог/CMS ADR не должен сам утверждать ORM/auth/БД.

## Cursor sprint 1 follow-up (после `2c1a9d0`)

Код изменён Cursor Agent в том же дне; commit не создавался.

| ID | Статус | Evidence |
|---|---|---|
| H01 | **Fixed** | `src/content/home.ts` — 4 RU tpost URL с published home |
| H02 | **Fixed** | `home-hero-bottle.tsx` — `frameOk` только после успешного paint; try/catch → PNG |
| H03 | **Fixed** | IntersectionObserver + `visibilitychange` pause; reduced-motion/Save-Data plan без изменений |
| H04 | **Fixed** | `home-newsletter.tsx` + `newsletterInvalid` RU/EN |

Свежие `lint` / `tsc --noEmit` / `build` PASS. Browser: teasers, invalid/valid newsletter,
390×844 + 1440×900. MCP Tilda недоступен. LCP/CPU не измерялись. Home — на приёмку владельцу.

## Рекомендованная очередь

1. **Спринт 1:** home — H01–H04 закрыты в коде; **ждёт приёмки владельцем**.
2. **Спринт 2:** blog source/content/i18n contract и один listing template.
3. **Спринт 3:** один article template на реальной паре + missing peer.
4. **Спринт 4:** перенос подтверждённых статей партиями после приёмки шаблонов.
5. **Спринт 5:** остальные публичные шаблоны отдельными итерациями; затем
   общий stage-4 gate и отдельный план stage 5.

Последующие спринты — **Proposed**. Текущее подтверждённое задание — home;
план серии не означает разрешения массовой реализации, установки CMS/БД или
production-публикации. Полные зависимости/DoD: [SPRINT_PLAN](../SPRINT_PLAN.md).
