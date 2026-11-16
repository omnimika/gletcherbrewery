# ADR 0002 — PostgreSQL, NocoDB и владение данными

Дата: **09.11.2026**. Status: **Accepted** для B1 non-prod slice (verified
09.11 — см. [B1 evidence](../reviews/2026-11-09-b1-evidence.md)).
Owner priority Confirmed: миграция баз, рабочие формы и NocoDB admin UI.
Production migration / Managed PG cutover — отдельные задания.

## Контекст

На 2095221 backend отсутствует. Airtable/Make/Collabza известны частично по
snapshot 31.10; auth — Tilda Members. Retail source metadata проверены 09.11,
но полные exports и data contracts ещё не получены.
[Реестр источников](../data/SOURCE_INVENTORY.md).

## Предложение для B1

1. PostgreSQL — durable source of truth новых leads, delivery jobs и будущих
   business records. Миграциями владеет приложение; SQL schema versioned.
2. Изолировать metadata NocoDB от business DB/schema. Отдельные роли application,
   migration, read-only NocoDB и worker; проверить grants в integration tests.
3. NocoDB — staff/admin-view тех же таблиц. Начать с read-only view, schema edit
   выключен; нет публичного NocoDB token/DB connection в браузере.
4. Сначала малая schema для Contacts/submission/consent/outbox. Не строить сразу
   полный user/booking/loyalty schema и не создавать пользователей из lead email.
5. Перед запуском проверить pinned version/edition NocoDB на external PostgreSQL,
   роли/редактирование и лицензируемые возможности. Не считать SSO/audit/RLS
   автоматически доступными в Community и не использовать internal NocoDB
   metadata tables как undocumented business schema.
6. Legacy импорт отдельно, через staging/mapping/reconciliation. Новые leads
   не ждут полного разбора бонусных формул; старые writers пока не отключаются.

## Статус после B1 и расширения M2 (12.11)

Local B1 choices уже реализованы: PG17, Drizzle/postgres.js (ADR0003),
NocoDB0.301.2 с отдельной metadata, staff read-only projection (ADR0008).
Не выбирать их повторно. R02 least privilege (16.11): explicit grants + revoke
defaults, `WORKER_DATABASE_URL`, append-only ledger privileges, negative tests.
Полный restore / R10 ещё Open.
[Ревью R02/R10](../reviews/2026-11-12-agent-crm-and-migration.md).

## Исторические Open на входе B1 (решены в local scope, staging отдельно)

- PostgreSQL supported version/image и dev/staging topology; Yandex Cloud target
  остаётся Confirmed. Создание платных ресурсов/production не входит в review.
- ORM/driver — короткий ADR 0003 внутри B1 с причиной/альтернативой; выбранный
  инструмент должен поддерживать транзакцию и уникальные constraints.
- Backup/restore, secret references, migrations ownership и staff access.
- NocoDB exact release/edition и проверка реальных прав; при несовместимости
  представить проверенные варианты, не отменять обязательный NocoDB молча.

## Критерии

Миграции с нуля/upgrade воспроизводимы, grants проверены, synthetic lead commit
атомарен с outbox, read-only staff видит запись. DB failure не даёт accepted;
concurrent idempotent repeat не создаёт дубли. Restore проверен до реального импорта.
Подробнее [pipeline contract](../backend/FORMS_DATA_PIPELINE.md).

## Источники

[NocoDB external source/permissions](https://nocodb.com/docs/product/integrations/data-sources/connect-to-data-source),
[self-hosting/license](https://nocodb.com/docs/self-hosting).
Документация не заменяет проверку выбранной сборки. У data/schema edit разные
defaults; режим прав и PostgreSQL grants выставляются явно.
