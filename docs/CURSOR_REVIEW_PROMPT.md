# Промпт Cursor — M2-2, затем кабинет/CRM и миграция

Дата: **12.11.2026**. [Задание](CURSOR_NEXT_STEPS.md), [серия](SPRINT_PLAN.md),
[ревью](reviews/2026-11-12-agent-crm-and-migration.md).

~~~text
Продолжи gletcherbrewery. Приоритет владельца — перенос баз, работающие формы/
данные, кабинет Agent и CRM. Выполни следующий спринт M2-2: надёжность текущего
контура; затем подготовь переход к M2-3/M2-4 по плану.

Сначала прочитай:
@AGENTS.md
@docs/ROADMAP.md
@docs/CURSOR_NEXT_STEPS.md
@docs/SPRINT_PLAN.md
@docs/reviews/2026-11-12-agent-crm-and-migration.md
@docs/backend/FORMS_DATA_PIPELINE.md
@docs/backend/AGENT_CRM_WORKFLOWS.md
@docs/data/LOYALTY_MIGRATION_PLAN.md
@docs/data/SOURCE_INVENTORY.md
@docs/data/AIRTABLE_LOYALTY_SCHEMA.md
@docs/data/LOYALTY_WRITERS_MAP.md
@docs/discovery/LOYALTY_OWNER_QUESTIONS.md
@docs/adr/0002-database.md
@docs/adr/0003-orm-and-migrations.md
@docs/adr/0007-background-jobs.md
@docs/adr/0008-hosting-dev.md
@docs/adr/0011-loyalty-ledger.md

Проверь actual Git status/diff/log. Codex проверил HEAD4a4eb01, second-front,
и незакоммиченный diff task-first /members/lk, agent application API/0012/
schema/level. Сохрани чужую работу. B1-B3 уже реализованы, M1 принят10.11;
не повторяй их и не возвращай Google lead Sheets (Cancelled).

Дай краткий implementation plan и DoD. В M2-2 исправь подтверждённые R01-R07:
expired leased recovery вместе с atomic fencing/finalize/replay; отдельная
worker DB роль и узкие grants (revoke уже выданных прав + оба bootstrap paths);
append-only ledger; atomic magic-link consume+member+session и fail-closed
debug guard без raw sign-in links в логах; receipt approve/reject+ledger+audit
в одной tx; CRM patches без lost update. Telegram: bounded summary, retry_after,
timeout до конца body. Intake/login/upload: bounded read/rate limits и честный
retry UX. Новые бизнес-правила не выдумывай.

Сначала верни PASS проверки: Codex12.11 получил 77 unit PASS, но tsc FAIL
(null LK и narrowing map test), lint FAIL (2 hooks errors в sales-map плюс
локальные generated browser profile files). Не удаляй tmp пользователя и не
отключай hooks rules глобально. Карта принята, визуальный redesign не нужен.

Tests на isolated synthetic PostgreSQL, без загрузки live env/доставки:
two workers/crash/restart/expired lease/stale ack/replay race; actual grants
negative checks; concurrent token consume+rollback; approve-vs-reject/repeat+
ledger failure; parallel CRM patches. Обязательны meaningful DB integration,
unit/lint/typecheck/build/local smoke. Моки/skip не называй live или DB PASS.

Параллельно подготовь source manifest/mapping/synthetic row fixtures для
M2-4. Нынешний aggregate policy test не является переносом; B1-only restore
не является backup всей текущей схемы. Legacy approved НЕТ→verified привязать
к согласованному snapshot/record set. Сверять lifetime и available отдельно,
не складывать opening с полной историей повторно. Уже применённые SQL не менять.

Следующий M2-3: agent application→staff queue/status/audit→member result,
private receipt photo→review→один earn→кабинет; nine source agent statuses
сохранить по mapping. Убрать неподтверждённое referral "+1%". Детали в workflow.
M2-4 — реальный import/reconciliation/restore; M2-5 — staging readiness.

Postbox/SMTP, GTIN export и shop/spend UI owner отложил; не делай их gate для
M2-2/CRM/importer. /about и другие public sign-offs сохранены в backlog.
Production import/legacy changes/auth cutover/DNS/onboarding рассылки,
commit/push не выполнять без отдельного задания. В конце обнови docs/evidence:
R-ID, файлы, команды/результаты, ограничения и следующий проверяемый результат.
~~~
