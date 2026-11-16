# Текущее задание Cursor — M2-2: надёжный контур данных

Дата: **12.11.2026**. Проверены HEAD **4a4eb01**, second-front, и уже изменённое
рабочее дерево кабинета/agent applications. [Ревью и R01–R12](reviews/2026-11-12-agent-crm-and-migration.md),
[серия спринтов](SPRINT_PLAN.md), [готовый промпт](CURSOR_REVIEW_PROMPT.md).

## Что сохраняем

- B1–B3 реализованы; M1 Mapbox/CRM Accepted 10.11. Заново их не выполнять.
- M2-0 inventory/policies есть; M2-1 — spike ledger/receipts/QR/OCR/auth.
  Это не выполненная row-level миграция Airtable.
- Canonical кабинет **`/agent/cabinet`** (страницы `/members/lk` нет;
  301 в `next.config`); task-first IA, status/level/prize (11.11).
- Agent application API/table/UI уже добавлены в рабочем дереве. Это save/read
  срез; staff queue и полный workflow ещё предстоят.
- SMTP Яндекс для magic-link — локально Confirmed 16.11 (`forms@` employee +
  app password). GTIN export — позже; магазин/spend UI — после решения по магазину.
- UX: cabinet photo dropzone + staff local photo preview (objectKey готов к S3).
- Lead Google Sheets отменён. CRM = PostgreSQL + read-only NocoDB + staff commands.
  /about acceptance и публичный backlog сохраняются без блокировки data stream.

## M2-2 — выполнить следующим

До новых панелей/полировки закрыть транзакционные ошибки и проверки качества.
Это non-prod реализация; production import/legacy writers/cutover не входят.

1. **Quality baseline.** Воспроизвести tsc/lint. ~~null type cabinet page +
   product-filter.test~~ Done 16.11; исключить локальные generated browser
   profiles из lint без удаления каталога. Исправить два hooks errors sales-map
   без массового отключения правил/переделки принятого M1.
2. **Worker, R01/R06/R07.** Recovery expired leased + согласованные atomic
   claim/finalize/replay. Late ack старого lease не пишет результат/attempt нового,
   active/delivered job нельзя переочередить гонкой. Abort deadline охватывает
   response body; учитывать retry_after, ограничить Telegram summary длиной,
   оставляя stable ID и private CRM link. Не обещать exactly-once.
3. **Роли, R02.** Forward migration отзывает уже выданные широкие права,
   оба bootstrap paths дают только необходимые grants. Запуск worker отдельной
   ролью/credential; её SELECT ограничить разрешённым delivery payload.
   Ledger append-only: app не UPDATE/DELETE, worker не читает auth/member
   tables и не пишет ledger. NocoDB SELECT-only.
4. **Magic link, R03/R04.** Атомарные unused→used, member upsert/onboarding и
   session creation в одной tx; concurrent use даёт одну сессию, DB failure
   откатывает consume. Debug доступен только изолированно локально, deployment
   fail-closed; raw sign-in URLs не попадают в логи. Postbox для этих tests не нужен.
5. **Receipt decisions, R05.** Атомарные approve/reject только из допустимого
   pending; ledger+verdict+audit в одной tx. Конкурентное противоположное решение
   возвращает конфликт, прежний verdict не перезаписывается.
6. **CRM commands, R06.** Patch/row lock/version не теряют parallel status/assignee/
   note; audit соответствует сохранённым before/after, а не устаревшему snapshot.
7. **Public boundary.** Bounded read/rate limit для intake/request-link/upload,
   безопасные ошибки и сохранение ввода. Конкретные лимиты обосновать существующими
   формами; не придумывать ограничения бизнеса/брони.

## Обязательные доказательства M2-2

Изолированная тестовая PostgreSQL и synthetic данные, без подхвата live .env.local.
Никаких живых sendMessage/SMTP/Mapbox в автоматических DB tests.

- Два worker, crash/expired lease, stale ack, race replay-vs-delivery, 429/body
  timeout/длинное сообщение: accepted submission сохраняется, job наблюдаема.
- Реальные подключения app/worker/nocodb/migrator: нужные операции разрешены,
  forbidden read/write/schema/ledger update действительно отклоняются DB.
- Concurrent token consume; отказ создания session; debug config в deployment.
- Concurrent approve/reject, repeated approve, отказ ledger/audit; один результат.
- Concurrent CRM patches и replay; отсутствие duplicate audit/attempts.
- Unit + новые meaningful DB integration + lint + typecheck + build + локальный
  smoke. Не заменять integration assertions моками и не писать skipped = PASS.
  Build/dev выполняет Cursor в режиме с разрешёнными generated files.
- Обновить evidence/ADR limitations; ADR0011 пока Proposed. Коммиты/push не делать.

## Независимая подготовка уже сейчас

[LOYALTY_MIGRATION_PLAN](data/LOYALTY_MIGRATION_PLAN.md): manifest защищённого
snapshot, source IDs/links, synthetic row fixtures, mapping collisions/orphans,
scope legacy verified policy. Не ждать email/GTIN/ФНС и не читать PII в чат.
Не запускать live exports/imports без соответствующей авторизации.
При parallel work — отдельные worktrees/границы; не редактировать schema
одновременно с другим агентом.

## Следом, отдельными спринтами

- **M2-3:** agent application → staff queue/commands/audit → member status;
  receipt photo preview → review → ledger → member result. Инструкции:
  [AGENT_CRM_WORKFLOWS](backend/AGENT_CRM_WORKFLOWS.md). Telegram по agent
  application optional; referral «+1%» не обещать без backend.
- **M2-4:** настоящий row-level importer/reconciliation + полный DB/files restore.
- **M2-5:** protected staging/staff identity и auth delivery после owner возврата
  к Postbox. Затем конкретное предложение cutover с rollback, без auto-switch.

В отчёте: исходный Git state, что исправлено по R-ID, команды/результаты,
отдельно synthetic/live/unrun, оставшиеся Open и список файлов. Сохранить
чужие изменения; документы могут быть ignored — не выполнять git add автоматически.
