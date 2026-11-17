# Кабинет «Агент» и CRM — контракт завершения сценариев

Дата: **12.11.2026**. **Confirmed** — приоритет владельца: базы, кабинет,
работающие формы, приём/обработка данных в CRM. Детали ниже — **Proposed**, если
не сосланы на [owner answers](../discovery/LOYALTY_OWNER_QUESTIONS.md) или
[source schema](../data/AIRTABLE_LOYALTY_SCHEMA.md).
Текущий код и замечания: [ревью](../reviews/2026-11-12-agent-crm-and-migration.md).

## Ответственность компонентов

- PostgreSQL — одна запись/история. NocoDB — обязательный read-only staff view,
  серверные `/api/staff/*` commands — изменения с валидацией и audit.
- Публичная contact/B2B форма создаёт lead, не member account.
- Member-session определяет владельца чека/agent application; member_id/email
  из браузера не разрешают выбирать другого участника.
- `/members/lk` — canonical RU кабинет; действующие legacy redirects сохранить.
  `/agent/login` существует сейчас; `/members/login` в owner note — будущий
  routing decision, не реализованный адрес. Не терять return-to при согласованном
  переходе и не принимать произвольный внешний return URL.
- Telegram — уведомление с ID и закрытой CRM ссылкой. Отказ уведомления не
  отменяет принятую запись. Inbound bot commands — отдельный будущий scope.
- Shared `STAFF_API_TOKEN` — только bootstrap login. Identity = `app.staff_users` +
  `app.staff_sessions` (ADR 0012 Accepted). Actor label от клиента (`x-staff-actor`)
  не принимается. Shared staging: seed allowlist + отдельные credentials.

## Agent application — M2-3

Сейчас есть форма/INSERT/чтение открытой заявки. Завершённый сценарий:

1. Member заполняет заведение/контакты. Сервер валидирует типы/длины/enums,
   определяет member из сессии. Body/status/reviewer/earn от клиента не принимать.
2. Стабильный intent key переживает retry. Same intent возвращает тот же ID;
   different payload — определённый conflict. Дополнительно DB предотвращает
   две активные заявки там, где это принято текущим UX. Точный набор активных
   статусов закрепить перед partial unique; старые дубли сначала в report.
3. Staff queue: pagination, status filter, detail с контактами и историей.
   Команда меняет только разрешённое поле/переход, с expected version или lock.
   Сервер записывает actor, before/after, reason, timestamp и correlation ID.
4. Source содержит **девять** бизнес-статусов (AIRTABLE_LOYALTY_SCHEMA).
   Не схлопывать их в under_review/approved/rejected при миграции. Нужен явный
   mapping: либо сохраняемый source status, либо расширенная target FSM.
   Не объявлять «Одобрена» равным первой отгрузке/действующему клиенту.
5. Member видит собственные заявки, конечный статус и допустимый публичный
   комментарий после refresh/повторного входа. Внутренние staff notes не выдавать.
6. Решение по заявке **не начисляет agent_earn автоматически**: Make mod50 его
   не пишет, правило начисления не установлено. Нужен отдельный подтверждённый
   financial command/contract, когда появится требование.
7. Telegram для чеков и agent applications: destination `telegram_agent` →
   `TELEGRAM_AGENT_CHAT_ID` (группа «Агент Gletcher»). Тот же worker/outbox,
   polymorphic `source_kind`/`source_id` на `delivery_jobs`; **без** фиктивных
   form_submissions. Form leads остаются в `TELEGRAM_CHAT_ID`. Не fire-and-forget
   из Next handler.

Приёмка: member A создаёт заявку → она в staff queue → менеджер меняет состояние
с audit → member A видит итог; B не читает/меняет её. Двойной submit/двойное
решение не создают новые записи/побочные эффекты. DB failure сохраняет ввод и
даёт возможность повтора; fetch failure/non-JSON/timeout обработаны в UI.

## Receipt → review → ledger → кабинет

Owner Confirmed: новый upload pending, 5% только от Gletcher; бесплатные QR/OCR
плюс manual/staff fallback; return `n=2` не начисляет; fiscal duplicate отклоняется.
QR/OCR — источники предположений, не самостоятельное доказательство покупки.

1. Upload: member-scoped, ограничение байтов при чтении и размеров изображения,
   allowlisted формат с проверкой содержимого, deadline/concurrency для OCR.
   Оригинал в private storage; `.tmp` допустим только локально.
2. Staff detail показывает исходное фото через authenticated read (или короткую
   подписанную ссылку после server auth), ручные поля, QR и OCR proposal с provenance.
   Произвольный object key не должен позволять обход проверки прав/path traversal.
   Фото не переносить в `public/`.
3. Единственный переход pending→approved/rejected. Проверка статуса, решение,
   `check_earn` и audit — одна транзакция. Повтор того же решения стабилен;
   конфликтующий уже принятый verdict не перезаписывается.
4. Pending не создаёт posted earn. Approved сумма считается на сервере по
   подтверждённой eligible sum. Reject не оставляет posted earn. Ошибка ledger/audit
   откатывает verdict; manager не редактирует баланс напрямую.
5. Member list/detail показывает состояние и фактические баллы после проверки,
   а не OCR proposal как подтверждённое начисление. Чужие receipt/photo недоступны.
6. Для storage errors/отказа DB нужны cleanup/reconciliation orphan files и
   retention; смена local store на Object Storage — в отдельном staging шаге.

Приёмка: manual upload без QR → pending с фото → staff preview → approve →
одна ledger строка → обновлённые balance/lifetime в кабинете. Отдельно reject,
approve-vs-reject race, repeated approve, duplicate fiscal ID, чужие ID и DB rollback.

## Публичные формы и CRM

Все существующие form_id уже подключены; повторять B1/B3 не требуется.
Матрица locale/purpose и delivery contract — [FORMS_DATA_PIPELINE](FORMS_DATA_PIPELINE.md).
Дальнейшие работы: pagination/filter/search для старых необработанных лидов;
конкурентные patch-команды без lost updates; delivery replay без сброса active
lease/delivered; история и наблюдаемость проблем доставки.

Newsletter имеет отдельную цель и consent evidence, tours request остаётся
заявкой, не booked/paid. Server validation дополнять только обоснованными правилами
полей; не вводить произвольные цены/лимиты бронирования.

## Без расширения текущего scope

Postbox/GTIN owner отложил; CRM и manual flow идут без них. Магазин/spend UI,
автоматические referral бонусы и выдача призов не реализуются в этом спринте.
Статус/приз в кабинете — описание порога, не факт получения/погашения приза;
исторические reward flags требуют отдельного mapping. Убрать обещание «+1%»
до подтверждённого attribution flow. Новые локали не публиковать; domain codes,
email identity, деньги и FSM не должны зависеть от переводов UI.
