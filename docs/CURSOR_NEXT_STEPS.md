# Текущее задание Cursor — после B2 Telegram

Дата: **09.11.2026**. B1 Done; Telegram delivery live; **Google Sheets lead
export отменён владельцем** (152-ФЗ).

## Решения

| Тема | Статус |
|---|---|
| Contacts → PostgreSQL → NocoDB | Done |
| Worker → Telegram (группа «Заявки Gletcher Brewery») | Done |
| Lead Google Sheets | **Cancelled** (owner 09.11, 152-ФЗ) |
| Retail map Google Sheet | Отдельный read-only import source (не лиды) — не трогать |

## B2 Telegram — Done (slice)

```sh
npm run worker:delivery
npm run worker:delivery -- --once
```

Новые submissions создают только `telegram` outbox job. Legacy `sheets` jobs
→ `cancelled_policy` (migration `0003_cancel_sheets_delivery`).

## Следом

- B3: остальные формы / staff workflows
- Stage-4 backlog: A1 visual accept, C1 campaigns (не blocker B-stream)
- M1/M2 migration rehearsals по приоритету
- Не коммитить `.env.local`; rotate Telegram token если светился в чате

## Git

Commit/push по запросу. `/docs/` ignored — точечный `git add -f` при необходимости.
