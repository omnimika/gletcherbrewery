# Текущее задание Cursor — staff triage после B3

Дата: **09.11.2026**. B1/B2/B3 intake Done; **staff triage slice in progress**.

## Done

| Slice | Status |
|---|---|
| Contacts → PG → NocoDB → Telegram | Done |
| Lead Google Sheets | Cancelled (152-ФЗ) |
| B3 forms → same `/api/forms/submissions` | Done |
| Staff triage API + `/staff` UI | Implemented (local token auth) |

### Staff CRM

- UI: `/staff` (noindex, outside i18n)
- Auth: `STAFF_API_TOKEN` (≥16) → httpOnly cookie / Bearer
- Commands (audited): `set_status` / `assign` / `note` / delivery `replay`
- Workflow statuses: `new` | `in_progress` | `waiting` | `done` | `spam`
- NocoDB остаётся **SELECT-only**; правки только через app API + `app.staff_lead_events`

```sh
# after db:embedded + migrate 0005
npm run dev   # + STAFF_API_TOKEN in .env.local
open http://localhost:3000/staff
```

## Следом (не смешивать)

- M1 retail migration rehearsal
- M2 Airtable/loyalty
- Stage-4: A1 visual `/about`, C1 campaigns
- Полноценный staff SSO/RBAC (вместо shared token) — отдельный ADR

## Git

Commit/push по запросу. Не коммитить `.env.local`.
