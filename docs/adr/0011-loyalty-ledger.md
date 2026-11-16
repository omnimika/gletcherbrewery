# ADR 0011 — Loyalty ledger («Агент Глетчер»)

Дата решения: **10.11.2026**, уточнение **12.11**. Status: **Proposed**.
Owner policies чеков/spendable/OCR-path Confirmed10.11, status formulas11.11.
Spike реализован, **row-level PostgreSQL rehearsal и full restore Open**.
Имеющийся aggregate policy smoke не является основанием для Accepted.  
Контекст: [AIRTABLE_LOYALTY_SCHEMA](../data/AIRTABLE_LOYALTY_SCHEMA.md),
[LOYALTY_WRITERS_MAP](../data/LOYALTY_WRITERS_MAP.md),
[RECEIPT_QR_VERIFICATION](../discovery/RECEIPT_QR_VERIFICATION.md),
[LOYALTY_OWNER_QUESTIONS](../discovery/LOYALTY_OWNER_QUESTIONS.md).

## Контекст

Airtable: баланс = rollups(earn) − spend; auth = Tilda Members; writers = Make + Collabza.  
Снимок: Users 3384, Σ available 208 289; Checks 5034 (НЕТ 4168 / ДА 866).

## Owner Confirmed (10.11)

1. Check upload стартует с `Оплачено=НЕТ` (staging под QR).  
2. Earn: **`round(sum_gletcher * 0.05)`** — 5% от товаров Gletcher.  
3. Matching: словарь алиасов, **все** транскрипции латиница + кириллица.  
4. **Legacy migration:** существующие на момент owner review чеки `НЕТ`
   проверены вручную → при переносе **`Оплачено=ДА` / verified**.
   Уточнение применения12.11 (Proposed): approved snapshot/record set и provenance;
   при свежем экспорте поздние pending не повышать без подтверждения eligibility.  
5. **Будущий spendable:** тратить можно только с подтверждённых (`ДА` / verified).  
6. Identity key = **email** (Tilda = Collabza = Airtable).  
7. Spend в ledger нужен для будущего магазина; UI/write магазина — позже.
   Postbox/GTIN export также owner-deferred по текущему заданию11.11.  
8. Данные чека — **без платных агрегаторов** (Confirmed). Pipeline:
   photo → QR decode → OCR (self-host) → matcher; else manual/staff.
   Optional later: free Open API ФНС. См. [RECEIPT_FREE_PATH](../discovery/RECEIPT_FREE_PATH.md).  
9. Пароли — onboarding **P1 magic link** Confirmed; пароли Tilda не экспортируются.  
10. Matcher: GTIN/marking first, then aliases кир/лат (нужен мастер-каталог SKU/GTIN).

## Предложение

1. PostgreSQL append-only `loyalty_ledger_entries` — SoT earn/spend/adjust/verify.
   Это target invariant: широкие default grants сейчас допускают UPDATE;
   M2-2 вводит явный REVOKE/GRANT и actual role-negative tests.  
2. Идемпотентность `(source_system, source_record_id, entry_kind)`.  
3. Target Check FSM: pending → `verified` | rejected; текущий код использует
   `pending_staff` и другие pending states. Реальные codes сохранить/сопоставить
   явно, approve/reject+ledger+audit атомарны. Eligible legacy import → `verified`.  
   Ветка `manual_receipt`: фото + ручные поля → staff review → verified/reject.  
4. Spendable = SUM(posted verified earn/approved corrections) − spend.
   Lifetime earn для status/prize сверяется **отдельно**. Net opening не должен
   превращаться в gross lifetime и не складывается с full history повторно.  
5. Matcher: GTIN/marking → SKU → `product_receipt_aliases` (кир/лат).  
6. Receipt pipeline: QR+OCR (+ optional FNS later) → normalize → match → 5%;
   async UX «баллы после проверки / staff».  
7. Auth: email + magic-link onboarding (P1); Members dual-run до cutover.  
8. NocoDB staff adjust только через journal + audit.  
9. Read-only comparison допустим, финансовая двусторонняя sync не подразумевается.
   Один writer на домен; freeze/final delta/Collabza transition — отдельный cutover.

## Persisted rehearsal (DoD)

[Детальный план](../data/LOYALTY_MIGRATION_PLAN.md).
Семь source tables → protected staging → target rows с source IDs/manifest.
Независимые source и target counts/links/statuses/attachments; per-member
available, lifetime, spend, conflicts/quarantine report. Approved legacy set
и новые pending различаются. Исторические earn не пересчитываются новой ставкой.

Обязательны idempotent re-import/resume, rollback, role-negative tests,
финансовые concurrency инварианты без создания shop UI, DB+private files
backup/restore. Fixture earn9000/spend−8800 показывает available200 и status
от lifetime9000. Намеренная порча target должна обнаруживаться reconciliation.

## Out of scope

Production cutover/DNS; invented %/history; online alcohol checkout; undocumented FNS as prod.

## Accepted когда

Row-level persisted rehearsal + независимая сверка + full restore/role evidence PASS;
нет необъяснённых расхождений, documented writer/freeze/rollback checklist.
Aggregate policy tests сами по себе этот gate не закрывают.
ФНС канал может оставаться Open (manual fallback уже Confirmed).

## Связанные

ADR 0002, 0003, 0007. SOURCE_INVENTORY, SPRINT_PLAN M2.
