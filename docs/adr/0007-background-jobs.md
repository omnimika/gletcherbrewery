# ADR 0007 — Transactional outbox и delivery worker

Дата: **09.11.2026** (update same day). Status: **Accepted** для Telegram worker
slice. Направления: Telegram + CRM/admin **Confirmed**. Lead Google Sheets —
**Cancelled** владельцем 09.11 (152-ФЗ); не реализовывать.

## Проблема

HTTP form submit не может атомарно сохранить заявку в БД и одновременно
подтвердить два remote API. Отказ одного канала не должен терять lead,
дублировать запись в CRM или заставлять посетителя заново заполнять форму.

## Принятое решение для существующего среза

- Одна PostgreSQL transaction пишет submission/consent и durable jobs.
  HTTP accepted возвращается только после commit.
- NocoDB читает primary business record, не создаёт ещё одну асинхронную lead copy.
- Отдельный worker забирает jobs по lock/lease, с recovery истёкших leases.
  Не fire-and-forget из Next route после response и не scheduler в browser.
- Ack/state update атомарно проверяет lease owner/token/generation (fencing).
  Late response старого worker после lease expiry не меняет текущий attempt;
  expiry не гарантирует отмену старого remote запроса и не устраняет дубли.
- Отдельные delivery/attempts по target и версии; уникальные локальные keys,
  timeout/retry/backoff/jitter, обработка rate limits и terminal/ambiguous outcome.
- Telegram adapter не знает UI и не принимает destinations из public payload.
  Secrets только на сервере, field allowlists явно заданы.
- Сначала PostgreSQL-backed jobs; Redis/отдельный broker не добавлять без
  измеримой необходимости. Worker runtime/liveness/scheduling — ADR 0008/B2.

## Семантика доставки

Локальная идемпотентность и at-least-once retries не доказывают exactly-once
remote side effect. После accepted-but-timeout возможна повторная доставка в
Telegram — явно выбранная duplicate/ambiguous policy. Не маркировать job
delivered только потому, что запрос начал отправляться.

## Implementation gaps12.11

Accepted ADR фиксирует архитектуру, но не отменяет дефекты реализации.
Expired leased jobs сейчас не подбираются; finalize/replay check-then-write
не обеспечивает нужный fencing. Отдельные worker credentials пока не выбраны
runner (он берёт DATABASE_URL app). M2-2 закрывает это recovery/atomic transitions/
role boundary tests. [Ревью R01/R02/R06/R07](../reviews/2026-11-12-agent-crm-and-migration.md).

Member notifications/email пока не поддержаны этим worker автоматически:
loader читает form_submissions. Расширение event types/durable mail после
соответствующего задания, не фиктивные public leads.

## Эксплуатация и приёмка

Наблюдать queue age, attempts, failed/ambiguous counts, remote references без
секретов/PII в логах. Private staff view и manual replay с audit; outbox нельзя
редактировать как произвольную таблицу. Lease crash/двойной worker/потерянный
ack/429/отозванные права входят в integration/fault tests.

B2 Telegram закрыт после E2E: один submission ID в primary DB/NocoDB и группе
Telegram. Sheets destination снят с плана. Mocks — не live PASS.

Детали [pipeline contract](../backend/FORMS_DATA_PIPELINE.md),
[destination inventory](../data/SOURCE_INVENTORY.md). Production writes/cutover
и включение bot inbound commands не разрешаются самим ADR.
