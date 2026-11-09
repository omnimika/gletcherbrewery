# Текущее задание Cursor — после B3 forms intake

Дата: **09.11.2026**. B1/B2 Done; **B3 form intake wired**.

## Done

| Slice | Status |
|---|---|
| Contacts → PG → NocoDB → Telegram | Done |
| Lead Google Sheets | Cancelled (152-ФЗ) |
| B3 forms → same `/api/forms/submissions` | Done |

### B3 form_id

- `partnership` (RU/EN; `/partnership`, `/russian-craft-beer`)
- `horeca` (RU)
- `catalog_lead` (RU/EN `/beer`)
- `tours_request` (RU/EN — lead only, not booking)
- `newsletter` (RU/EN home/blog; purpose `newsletter_subscribe`)

Staff CRM: `public.staff_contact_leads` (+ partner_type/inn/tour_date/guests/wishes).
Worker: `npm run worker:delivery`.

## Следом (не смешивать с intake)

- Staff triage/assignment/replay UI (optional polish)
- Stage-4: A1 visual accept, C1 campaigns
- M1/M2 data migration rehearsals

## Git

Commit/push по запросу. Не коммитить `.env.local`.
