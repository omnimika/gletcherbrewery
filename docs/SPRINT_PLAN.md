# Следующая серия спринтов — надёжность и завершение публичного этапа

Дата: **05.11.2026**, проверен чистый **d6011d2**, ветка first-front.
[Актуальное ревью](reviews/2026-11-05-public-integrity.md),
[текущее задание](CURSOR_NEXT_STEPS.md), [route matrix](discovery/PUBLIC_ROUTE_MATRIX.md).
Исторический план и его отметки сохранены в [архиве](archive/SPRINT_PLAN_pre_2026-11-05.md).

## Статус и принцип очереди

DS-1 реализован; DS-2 pilot реализован; DS-3 широко перенесён. Эти спринты
не начинать заново. Design/code done не равняется owner visual sign-off:
неподтверждённые приёмки сохраняют Open, выявленные дефекты исправляются адресно.
Stage 4 ещё не закрыт; /map frontend не равен stage-6 CRM, /agent landing —
бонусной системе, /tours iframe — собственной брони, /shop — checkout.

По записям Cursor map/shop приняты 04.11, tours/agent и предыдущие templates
имеют прежние приёмки. /agent @320 polish уже в d6011d2, отдельный visual QA
ещё Open. Большая часть route matrix реализована; остаются legacy URL,
campaign/archival решения и общий public gate.

**Confirmed дополнение владельца 05.11:** /about обязателен вместе с анимацией
и логикой Tilda landing, source page 71867465/project1212341.
[Задание A1 и baseline](discovery/ABOUT_PAGE_BASELINE.md). Это не optional/archive scope.

**Proposed очередь:** Q1 → Q2 → Q3 → **A1 /about** → C1/следующие подтверждённые campaigns →
stage-4 exit → D5-0. **Q1–Q3 Done**; сейчас выполнить только A1. Это результаты с
зависимостями, не календарные обещания и не разрешение запускать всё сразу.

| Спринт | Результат | Условия закрытия |
|---|---|---|
| **Q1 — Done 05.11** | Честные формы, locale, shop/map lifecycle | R01/R02/R07/R08 Done; R05/R06 out of scope (owner); см. ревью |
| **Q2 — Done 05.11** | Design/motion/reflow regression | R03/R04/R09/R10 Done; shop/CompareCard candidates Open |
| **Q3 — Done 06.11** | Route/publication/SEO contract + remaining scope | blog-all 308; sitemap/robots gate; registry; HTTP evidence |
| **A1 — текущий** | /about по Tilda 71867465 вместе с animation/interaction logic | Source behavior parity + responsive/reduced-motion + owner acceptance |
| C1 → Cn | Один опубликованный campaign pilot, затем одобренные остальные | Fresh source baseline, content parity, archive/publication decision |
| Stage-4 exit | Полное согласованное публичное покрытие или явные исключения | Общая RU/EN regression, sign-offs и legacy operation paths |
| D5-0 | Backend discovery и архитектурные решения | Подтверждённые схемы/контракты и reviewable ADR; implementation отдельно |

## Q1 — Done (05.11.2026)

Закрыт по DoD (без R05/R06): пять lead forms без false success; LocaleSwitch
peer/fallback/null; shop dialog hash/history; WebGL/geocoder lifecycle.
R05/R06 — out of scope по решению владельца; `sales-map.module.css` без этих правок.
Outcomes — [ревью](reviews/2026-11-05-public-integrity.md). Commit/push по запросу.

## Q2 — Done (05.11.2026)

R03 CardGrid max columns; R04 carousel scroll/autoplay-off; R09 ManagedVideo;
R10 map accent contrast. Lint/tsc/build + targeted Playwright PASS.
Shop address / CompareCard / CompositionGrid candidates остаются Open без
подтверждённого browser defect. /agent @320 visual QA Open. Details —
[ревью Q2 outcomes](reviews/2026-11-05-public-integrity.md).

## Q3 — Done (06.11.2026)

- `/blog-all` → `/blog` и `/en/blog-all` → `/en/blog` via `permanentRedirect` (**HTTP 308**).
- `src/app/sitemap.ts` + `robots.ts`; gate `ALLOW_SITE_INDEXING` (opt-in).
- Code registry `src/content/seo/public-routes.ts` + updated PUBLIC_ROUTE_MATRIX.
- Remaining campaigns/aging/restaurant/members/tours-ops documented as
  external/deferred/archive/exclude (not closed as Done).
- Fresh MCP settings for /about (A1 handoff). Social/structured deep parity Open.
- HTTP localhost evidence in matrix. Preview stays noindex unless opt-in.

## A1 — обязательный /about с animation/interaction parity

Source указан владельцем: [Tilda page 71867465 / project1212341](https://tilda.ru/page/?pageid=71867465&projectid=1212341).
Подробный [baseline/DoD](discovery/ABOUT_PAGE_BASELINE.md) обязателен для Cursor.
Свежий read-only MCP: records/Zero Blocks, timelines/triggers, scroll/SBS/
breakpoint settings, inserts и все реальные CTA/интерактивы. Не считать,
что набор эффектов уже известен по старому public HTML.

Результат — полноценный landing с характером исходной анимации и логикой,
а не статичная «О нас». Использовать общие layout/UI recipes; уникальные
движения/взаимодействия выделять в компоненты и проверять в движении.
Reduced-motion/mobile/keyboard и native scroll — часть приёмки. Source editor/
published версии различать; старый Disallow не отменяет обязательность страницы,
но и не определяет разрешение индексации. EN/publication — по подтверждённым данным.

Stage-4 exit требует принятого /about с этими критериями. Q1 остаётся текущим;
A1 — отдельный будущий sprint, без параллельного массового rollout.

## C1 → Cn — campaigns по одному, после определения scope

Первый кандидат — /brainstorm-moto-fest-2023 (Tilda 37060088), **после свежей
проверки публикации**. Один source baseline → один template → checks/приёмка.
Следующий /10-years (17960662): сначала archive/current решение; старый конкурс
не становится действующей акцией. Использовать существующие blocks/design recipes;
Puck или новый page builder ради этих страниц не устанавливать.

**Klin 36369657:** snapshot unpublished + password; не публиковать автоматически
из доступных MCP исходников. Нужны отдельное подтверждение public статуса и
scope; results article уже local. Это не блокирует остальные опубликованные pages.
Другие inventory pages переносить только после уточнения статуса/приоритета.
Если владелец оставляет campaign в legacy/archive, документировать решение
и рабочий переход; не считать случайную ссылку закрытием public scope.

## Stage-4 exit и D5-0

Stage-4 exit: закрытые Q1/Q2/Q3, реализованный и принятый **A1 /about с анимацией
и логикой**, resolved coverage и утверждённые исключения для остальных страниц,
RU/EN/URL/media/keyboard/SEO regression, source parity/приёмки, честные внешние
operations. Это gate готовности публичного слоя, не production cutover.

Read-only backend discovery допустим параллельно, с синтетическими примерами
и без production PII. D5-0 собирает реальные схемы Airtable/Make/Collabza/
retail/YCLIENTS по приоритету модулей; ADR 0002 database/NocoDB permissions,
0003 ORM и 0008 hosting/staging. NocoDB обязателен; edition/external PostgreSQL
mode и роли требуют проверки выбранной версии. Puck preference остаётся
Confirmed, установка CMS отложена до CRM. Не выбирать Auth/queues вслепую.

После concrete ADR/контрактов — отдельный implementation sprint со средой,
версионируемыми миграциями и synthetic vertical slice. Не начинать сразу
ledger/booking/payments/CRM, не трогать production и не выполнять cutover.
sr/hy/ka/de остаются planned до translation/script/font/publication gates.
