# Delivery queue — observability & replay (M2-5.2)

Дата: **17.11.2026**. Non-prod. PII не логировать.

## Signals

| Signal | Where | Meaning |
|---|---|---|
| `GET /api/health` | public | DB up/down; worker heartbeat age; coarse queue counts |
| `GET /api/staff/ops/queue` | staff session | Full buckets by status×destination×source_kind |
| `/staff/ops` | staff UI | Same snapshot, human-readable |
| `.tmp/delivery-worker.heartbeat` | local host | Written each worker poll (~2s) |

**HTTP:** health → **503** only if DB unreachable. Worker missing/stale → `degraded: true`, still **200** if DB up (Next can run without worker briefly).

## Suggested thresholds (local / staging)

- Worker heartbeat age > 30s → restart `npm run worker:delivery`
- `expiredLeaseCount` > 0 → worker should reclaim on next poll; if stuck, check worker logs
- `oldestPendingAgeSec` > 120 with `pendingDueCount` > 0 → worker down or Telegram blocked
- `failed` / `ambiguous` grow → open lead detail → Replay (staff)

## Replay

1. Staff → Заявки → lead detail → Replay on failed/blocked/retry/ambiguous job.
2. API: `POST /api/staff/delivery-jobs/:id/replay` (auth + leads roles).
3. Active lease / delivered → rejected (R06).

Do **not** replay into live Telegram from a restored DB dump without disabling adapters.

## Process

```bash
npm run db:embedded          # leave running
npm run worker:delivery      # leave running
curl -s http://127.0.0.1:3000/api/health | jq .
# staff UI: /staff/ops
```
