# Текущее задание Cursor — M2 Airtable / «Агент Глетчер»

Дата: **10.11.2026**.

## Confirmed

Loyalty rules, free path (QR+OCR+manual), P1, FNS application parallel.
Staff queue `/staff/loyalty/receipts` works (manual → approve → ledger 5%).

## M2-1 progress

Done:
- Ledger + staff receipts + QR/OCR + aliases seed
- P1 magic-link (server GET verify → cookie → cabinet; DEBUG UI honest)
- Member upload `/agent/cabinet` + `POST /api/loyalty/receipts`
- GTIN plumbing: `src/content/product-gtins.ts`, OCR extract, staff `POST /api/staff/loyalty/aliases`
- SMTP sender via nodemailer (activates when `SMTP_*` set and DEBUG off)

Next:
1. **Owner (позже):** список штрихкодов EAN/GTIN по сортам — пока нет; matcher работает на алиасах + ручной сумме. Когда будет — в `product-gtins.ts` или staff upsert.
2. **Owner (позже):** SMTP/Postbox кредов пока нет — оставляем `LOYALTY_MAGIC_LINK_DEBUG=1` (ссылка в UI).
3. FNS Open API application (parallel; draft in `docs/discovery/FNS_OPEN_API_APPLICATION_DRAFT.md`)
4. ~~Visual polish LK~~ — login/cabinet на DS tokens (10.11). Дальше: Postbox / FNS / GTIN when ready

## Local login

`LOYALTY_MAGIC_LINK_DEBUG=1` → ссылка на странице `/agent/login`, без письма.

## Git

Commit/push по запросу. Без secrets / PII / чеков.
