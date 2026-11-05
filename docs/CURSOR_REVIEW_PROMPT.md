# Готовый промпт Cursor Agent — Q1

Дата: **05.11.2026**. [Задание](CURSOR_NEXT_STEPS.md),
[ревью](reviews/2026-11-05-public-integrity.md), [план](SPRINT_PLAN.md),
[route matrix](discovery/PUBLIC_ROUTE_MATRIX.md), [AGENTS](../AGENTS.md).

Скопировать в Cursor:

~~~text
Продолжи gletcherbrewery. Выполни только Q1 — функциональную надёжность
публичного сайта. Сначала прочитай:
@AGENTS.md
@docs/ROADMAP.md
@docs/CURSOR_NEXT_STEPS.md
@docs/SPRINT_PLAN.md
@docs/reviews/2026-11-05-public-integrity.md
@docs/discovery/PUBLIC_ROUTE_MATRIX.md
@docs/design/DESIGN_SYSTEM.md
@docs/adr/0001-i18n-routing-and-content.md
@docs/adr/0010-design-system-and-section-layout.md
@docs/discovery/TILDA_MCP_WORKFLOW.md
@docs/discovery/ABOUT_PAGE_BASELINE.md

Baseline ревью d6011d2, дерево тогда чистое. Перепроверь текущие status/diff/log,
сохрани чужие изменения. DS-1/DS-2 уже реализованы, DS-3 широко перенесён;
не начинай их заново. Agent @320 polish уже в commit, отдельный visual QA Open.

Дай короткий план/критерии, затем выполни Q1:
1. R01: tours/contacts не обещают доставку без отправки. Проверь все пять lead
   форм, сохрани ввод и покажи честное unavailable state с подтверждённым
   контактным/legacy путём. Не создавай backend ради устранения false success.
2. R02: published peer vs unavailable/fallback contract для LocaleSwitch.
   EN на RU-only B2B не ведёт в 404; чужой hash не переносится на fallback,
   а настоящий product/article peer и существующие anchors сохраняются.
3. R05/R06: восстанови Mapbox logo/attribution и корректную mobile panel
   border-box width. Сохрани Product singular и существующую фильтрацию.
4. R07: единый shop dialog close/cancel/hash contract, Escape/reopen,
   Back/Forward, query preservation и focus restoration.
5. R08: graceful WebGL init/load failures, внешний map fallback/retry,
   корректный geocoder teardown при repeated mount/locale transition.
   Пользовательский fallback не показывает env setup инструкции.

Соблюдай scopes и DoD из CURSOR_NEXT_STEPS. Свежие lint/typecheck/build,
local start и targeted browser scenarios: forms valid/invalid/no loss,
RU/EN/anchors, map token/no-token/errors/320/390/desktop, shop dialog history.
Запиши реальные команды/outcomes/screenshots и ограничения; не выдавай
неисполненные browser/production проверки за PASS. Обнови docs после кода.
Проверь docs delivery: .gitignore исключает /docs/, новые review/matrix/baseline/archive
пока ignored. Подготовь точечный список безопасных .md для будущего разрешённого
коммита; не раскрывай массово raw/source packs и не делай staging сейчас.

Q2 design/motion/reflow, Q3 URL/SEO, A1 /about, campaigns и Stage5 — отдельные следующие
спринты. Не подключай NocoDB/PostgreSQL/CMS/cart/payment, не публикуй новые
языки. Mapbox frontend уже установлен — не удаляй его как «преждевременный».
MCP Tilda только read-only; editor/published раздельно. Klin campaign в
snapshot unpublished/password, доступ к исходникам не разрешает публикацию.

Обязательное дополнение владельца: A1 реализует /about по Tilda page71867465,
project1212341, вместе с анимацией и логикой landing. В A1 изучи свежие records,
SBS/timelines/triggers, breakpoint overrides и интерактивы через read-only MCP.
Сохрани характер движения и сценарии; не подменяй landing статичной «О нас»
или одним generic Reveal. Browser parity, mobile/reduced-motion/keyboard — DoD.
Сейчас A1 не выполнять вместо Q1; /about обязателен до stage-4 exit.

Прежние visual acceptances — regression baseline, а не отмена конкретных
подтверждённых дефектов. Не делай общий редизайн. Commit/push/production/DNS
не выполнять без отдельного запроса.
~~~
