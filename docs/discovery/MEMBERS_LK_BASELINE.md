# Личный кабинет — baseline Tilda `/members/lk`

Дата: **10.11.2026**.  
Source: Tilda project `1212341`, page `44958479` (`members/lk`), MCP Zero Blocks.  
Публичный URL: https://www.gletcherbrewery.com/members/lk (за логином Members).

Статус исходника: **Observed** (legacy).  
**Owner 10.11:** Tilda-вёрстку ЛК **не** считать эталоном UX; новый UI —  
design-system + task-first IA (баланс → чек → история). Tilda полезна для  
данных/полей/правил, не для композиции.

## Связанные страницы (Confirmed aliases)

| URL | Page ID | Роль |
|---|---|---|
| `/members/lk` | 44958479 | Основной ЛК |
| `/members/login2` | 44431343 | Вход (Tilda Members) |
| `/members/signup` | 44533663 | Регистрация |
| `/members/recover-password` | 64297177 | Пароль |
| `/members/purchases` | 28639656 | Покупки (отдельная) |
| `/agent` | 44414247 | Публичный лендинг программы |

## Навигация ЛК (Observed, ZB `716182346`)

Боковое / мобильное меню кнопок:

1. **ИНФО** — профиль, баланс, уровень, статус, приз, рефералка  
2. **ЗАГРУЗИТЬ ЧЕК** — форма офлайн-покупки  
3. **АГЕНТ** — агентская заявка / статус  
4. **ПОКУПКИ** — история  
5. **МАГАЗИН** — спецпредложения / списание  
6. **СТАТУСЫ** — лестница уровней и призов  

Плюс preload-экран (ZB `716178644`, ice bg + «0…»).

## ИНФО (ZB `716177274`) — поля

| UI | Источник as-is | Новый SoT (Proposed) |
|---|---|---|
| Имя / email / город | Airtable Пользователи via Collabza | `loyalty_members` |
| Баланс биркоинов | formulas / rollups | ledger spendable |
| Уровень, статус, приз | formulas | rules engine — **Open** до сверки формул |
| Прогресс «до след. уровня» | `lk_nextlvl`, done-value | derived from lifetime earn |
| Реферальная ссылка | formula `…/members/lk?utm_…` | generate from member id |
| Контакт по призам | static copy | static / CMS |

Правило уровней (Observed copy): +1 уровень за каждые 1000₿; каждый 5-й — юбилейный приз.

## ЗАГРУЗИТЬ ЧЕК (ZB `716215408`)

Форма `formname=checkupload`: email, город, место (select сетей), дата, сумма, фото.  
Текст на Tilda всё ещё упоминает **3%** в одном блоке — **не** переносить: owner Confirmed **5%** от суммы Gletcher.

## Данные as-is

Collabza READ → Airtable; Make WRITE чеки. Auth = Tilda Members.  
Новый ЛК: auth = magic-link (P1), data = PostgreSQL. Collabza не тащим в UI.

## Next `/members/lk` (11.11)

Сделано: task-first flow; статус/приз/уровень из Airtable formulas;  
агент-заявка (Make mod 50 fields) в PG.  
Ещё нет: staff triage агентов, магазин spend (отложен owner), Postbox login.

## Порядок M2-LK

1. ~~URL + backend spike~~  
2. ~~DS task-first IA~~  
3. ~~Статус/приз formulas~~ Done 11.11  
4. ~~Агент-заявка member write~~ Done 11.11  
5. Staff queue агентов + Telegram (optional)  
6. `/members/login` + Postbox когда будут креды  
7. Магазин spend — после появления shop
