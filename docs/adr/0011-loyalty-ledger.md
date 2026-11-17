# ADR 0011 — Loyalty ledger («Агент Глетчер»)

Дата решения: **10.11.2026**, уточнение **12.11**, **Accepted 17.11.2026**.
Status: **Accepted** (local protected CSV rehearsal + reconcile).
Owner policies чеков/spendable/OCR-path Confirmed10.11, status formulas11.11.
Production cutover / writer freeze / DNS / full Airtable `RECORD_ID()` export —
отдельные решения (Open).  
Контекст: [AIRTABLE_LOYALTY_SCHEMA](../data/AIRTABLE_LOYALTY_SCHEMA.md),
[LOYALTY_WRITERS_MAP](../data/LOYALTY_WRITERS_MAP.md),
[RECEIPT_QR_VERIFICATION](../discovery/RECEIPT_QR_VERIFICATION.md),
[LOYALTY_OWNER_QUESTIONS](../discovery/LOYALTY_OWNER_QUESTIONS.md),
[CURSOR_NEXT_STEPS](../CURSOR_NEXT_STEPS.md).

## Контекст

Airtable: баланс = rollups(earn) − spend; auth = Tilda Members; writers = Make + Collabza.  
Исторический aggregate smoke (Users ~3384 / Σ ~208 289) не был gate Accepted.
Accepted evidence — protected CSV batch **17.11** (ниже).

## Owner Confirmed (10.11)

1. Check upload стартует с `Оплачено=НЕТ` (staging под QR).  
2. Earn: **`round(sum_gletcher * 0.05)`** — 5% от товаров Gletcher.  
3. Matching: словарь алиасов, **все** транскрипции латиница + кириллица.  
4. **Legacy migration:** существующие на момент owner review чеки `НЕТ`
   проверены вручную → при переносе **`Оплачено=ДА` / verified**.
   Уточнение применения12.11: approved snapshot/record set и provenance;
   при свежем экспорте поздние pending не повышать без подтверждения eligibility.  
5. **Будущий spendable:** тратить можно только с подтверждённых (`ДА` / verified).  
6. Identity key = **email** (Tilda = Collabza = Airtable).  
7. Spend в ledger нужен для будущего магазина; UI/write магазина — позже.
   Postbox/GTIN export также owner-deferred.  
8. Данные чека — **без платных агрегаторов** (Confirmed). Pipeline:
   photo → QR decode → OCR (self-host) → matcher; else manual/staff.
   Optional later: free Open API ФНС. См. [RECEIPT_FREE_PATH](../discovery/RECEIPT_FREE_PATH.md).  
9. Пароли — onboarding **P1 magic link** Confirmed; пароли Tilda не экспортируются.  
10. Matcher: GTIN/marking first, then aliases кир/лат (нужен мастер-каталог SKU/GTIN).

## Решение (Accepted)

1. PostgreSQL append-only `loyalty_ledger_entries` — SoT earn/spend/adjust/verify.
   Широкие default grants не считать append-only: REVOKE/GRANT + role-negative
   tests — M2-2 baseline; production role hardening — M2-5.  
2. Идемпотентность `(source_system, source_record_id, entry_kind)`.  
3. Check FSM: pending → `verified` | rejected; legacy eligible import → `verified`.
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

## Accepted evidence (17.11 owner)

Owner: «ADR0011 Accepted: snapshot CSV 17.11, reconcile 212338 PASS, orphan gap −5823 ок».

Protected local batch (`tmp/Airtable`, gitignored):

| Table | File | Rows (OK / quarantine) |
|---|---|---|
| Пользователи | `Пользователи-Главная.csv` | 3405 OK / 3 email collision |
| Чеки | `Чеки-xls.csv` | 5059 OK / 76 orphan buyer |
| Агенты | `Агенты-Все.csv` | 49 |
| Заказы / Покупки / Товары / Акции | CSV | 1 / 2 / 6 / 1 |

- Legacy `cutoff` = today (`sourceAt ≤ cutoffAt`).
- Reconcile scoped to imported emails: **sum available = sum lifetime = 212338**.
- check-file earn 216811 vs user check rollup 210988 → gap **−5823** =
  orphan checks without buyer (documented class, not FAIL).

## Still Open (не блокируют Accepted)

- Production cutover / writer freeze / DNS.
- Полный Airtable `RECORD_ID()` export (стабильные IDs на следующих batch).
- Object Storage photos, staff identity/RBAC hardening, Postbox — **M2-5**.
- ФНС Open API (manual fallback уже Confirmed).

## Out of scope

Production cutover/DNS; invented %/history; online alcohol checkout; undocumented FNS as prod.

## Связанные

ADR 0002, 0003, 0007. SOURCE_INVENTORY, SPRINT_PLAN M2, LOYALTY_MIGRATION_PLAN.
