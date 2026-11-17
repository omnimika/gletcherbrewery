# Receipt QR verification — «Агент Глетчер» ЛК

Дата: **10.11.2026**.  
Статусы: **Confirmed** (owner) / **Proposed** / **Open**.

Развёрнутые вопросы владельцу (не жаргон):  
[LOYALTY_OWNER_QUESTIONS.md](LOYALTY_OWNER_QUESTIONS.md).

## Цель продукта (Confirmed owner 10.11)

В личном кабинете **Агент Глетчер** покупатели:

1. Регистрируются (Tilda Members сегодня).  
2. Загружают фото чеков с офлайн-покупок.  
3. Копят биркоины / получают уровни и призы.

Загрузка чека **специально** стартует в статусе `Оплачено=НЕТ` — заготовка под
автоматическую верификацию QR.

## Бонус (Confirmed owner 10.11)

**5%** от суммы покупки **товаров Gletcher** в чеке:

```text
биркоины = round(sum_gletcher_line_totals * 0.05)
```

Совпадает с формулой Make `{{round(1.amount * 0.05)}}`; целевой `amount` —
сумма **линий Gletcher** после разбора чека, не весь чек «как попало».

## Целевой алгоритм (Confirmed intent; детали Open)

```text
Фото чека (камера / upload)
        │
        ▼
Распознать QR (t=…&s=…&fn=…&i=…&fp=…&n=…)
        │
        ▼
Проверка чека через ФНС / ОФД API
        │
        ▼
Строки → товары Gletcher (алиасы лат+кир — Confirmed intent)
        │
        ▼
round(Σ Gletcher × 0.05) → биркоины + Оплачено=ДА
(+ audit: QR, OFD hash, matched lines)
```

**Legacy (Confirmed):** все текущие Чеки `НЕТ` при миграции → `ДА` (ручная проверка
уже сделана). Новые — spendable только после `ДА`.

**Fallback без QR (Confirmed):** фото + ручной ввод суммы Gletcher, города, даты,
сети или точки (магазин/бар/ресторан) → staff-проверка → начисление 5%.

Make `334247` mod 47 сейчас: `НЕТ` + provisional `round(amount*0.05)` — interim
до QR-пайплайна.

## Как достаём данные с фото (без платных агрегаторов)

**Confirmed owner:** платные провайдеры не подходят.  
Актуальная схема: [RECEIPT_FREE_PATH.md](RECEIPT_FREE_PATH.md) —
QR с фото → OCR строк → matcher → иначе manual form/staff.  
Опционально позже: бесплатный Open API ФНС (заявка).  
Справочно (отклонённые платные): [RECEIPT_FNS_PROVIDER_RESEARCH](RECEIPT_FNS_PROVIDER_RESEARCH.md).

## Связь с M2

Legacy `НЕТ` ≈ очередь незавершённой верификации.  
Ledger / opening-balance: [ADR 0011](../adr/0011-loyalty-ledger.md).
