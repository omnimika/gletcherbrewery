# Чеки без платных агрегаторов

Дата: **10.11.2026**.  
**Owner Confirmed:** платные OFD.ru / APMcheck / Check4Promo и аналоги **не подходят**
как основной канал. Нужен способ достать данные с **фото чека** иначе.

Связанные: [RECEIPT_QR_VERIFICATION](RECEIPT_QR_VERIFICATION.md),
[RECEIPT_FNS_PROVIDER_RESEARCH](RECEIPT_FNS_PROVIDER_RESEARCH.md),
[LOYALTY_OWNER_QUESTIONS](LOYALTY_OWNER_QUESTIONS.md).

## Что бесплатно реально сделать самим

Платный сервис нужен был в основном за одно: **по QR получить полный состав чека
(строки товаров) из ФНС/ОФД**. Без него цепочка распадается на части, которые
можно собрать самим:

```text
Фото чека
   ├─ 1) Локально найти QR на картинке          ← бесплатно (zxing / jsQR / …)
   │      → t, s, fn, i, fp, n
   ├─ 2a) Официальный Open API ФНС              ← API бесплатный, но заявка+юрлицо
   │      → строки товаров (если дадут доступ под loyalty)
   ├─ 2b) OCR строк с фото                      ← бесплатно/свой сервер (Tesseract,
   │      Yandex Vision* и т.п. — *Vision может быть платный; Tesseract = self-host)
   │      → кандидаты «название + сумма»
   └─ 3) Ручная форма + staff                   ← уже Confirmed fallback
          → сумма Gletcher, город, дата, сеть/точка
```

\*Облачный OCR часто платный поштучно — если цель «ноль vendor fees», брать
**self-host Tesseract / PaddleOCR** на своём VPS в РФ (152-ФЗ).

## Рекомендуемая схема без платных промо-API (Proposed)

**Primary сейчас (можно строить сразу):**

1. Пользователь грузит фото.  
2. Сервер/клиент пытается **декодировать QR** с фото.  
3. Если QR ок → сохранить fingerprint `(fn,i,fp,n)` для anti-fraud; статус `pending`.  
4. Параллельно / fallback: **OCR** → список строк → matcher (GTIN если есть в тексте /
   алиасы кир+лат) → `eligible_sum` → `round(*0.05)`.  
5. Если confidence низкий или QR нет → **ручная форма** (Confirmed) + staff.  
6. Staff approve → `Оплачено=ДА` / verified; иначе reject.

**Secondary (параллельно, не блокер кода):**

- Заявка на **бесплатный Open API ФНС** + письменный вопрос про loyalty.
  Если ФНС скажет «да» — подставить получение строк по QR вместо/вдобавок к OCR.
- Неофициальный mobile API — **только лабораторный PoC**, не для начислений.

```text
                    ┌── QR decode OK ──┐
Фото ──► preprocess ┤                  ├── fingerprint + (optional FNS later)
                    └── QR fail ───────┘
                              │
                              ▼
                         OCR lines ──► Gletcher match ──► proposed earn
                              │
                         low confidence / no match
                              ▼
                         manual form + staff queue
```

## Честная оценка качества

| Путь | Строки Gletcher | Подлинность чека | Стоимость |
|---|---|---|---|
| QR + Open API ФНС | Хорошо (если доступ) | Высокая | 0 ₽ API + infra/IP |
| QR decode only | Нет (только итог/ключи) | Частичная | 0 |
| OCR фото | Средне (шум, угол, чек обрезан) | Слабая без сверки | Self-host ≈ VPS |
| OCR + сверка суммы с QR `s=` | Лучше | Средняя | Self-host |
| Manual + staff | Высокая (человек) | Высокая | Время менеджеров |
| Платный агрегатор | Высокая | Высокая | **Отклонён владельцем** |

Практичный минимум без вендоров: **QR с фото + OCR + сверка итога с QR + manual/staff
на спорных**. Это уже закрывает ЛК; ФНС API — апгрейд точности позже.

## Что НЕ обещать

- 100% авто-разбор любого чека РФ без ошибок OCR.  
- Fiscal-grade proof только по фото без ФНС/ОФД.  
- Мгновенные баллы на всех чеках (staff/OCR queue).

## Owner Confirmed 10.11 (вечер)

1. **OCR self-host** — основной авто-путь до/параллельно с ФНС.  
2. Заявку на **Open API ФНС** подаём **параллельно** (апгрейд, не блокер).  
3. Manual + staff — обязательный fallback (доля/SLA уточним по факту нагрузки).

## Code status (10.11)

Done: ledger, staff manual queue, **jsQR** decode on upload (PNG/JPEG), OCR text
heuristics + stub provider, synthetic aggregates rehearsal.

Next: self-host Tesseract/Paddle behind `OcrProvider`; public LK upload after P1;
seed aliases/GTIN catalog.
