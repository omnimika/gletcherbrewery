# Ревью текущего состояния — 31.10.2026

> Историческое ревью `5b4910d`. Для HEAD `81713e4` использовать
> [повторное ревью](2026-10-31-follow-up.md). Запись ниже «R01–R09 закрыты»
> была промежуточным отчётом Cursor; повторная проверка выявила частичное
> исправление R02/R07 и новую lint-регрессию в галерее.

База: `5b4910d`, ветка `first-front`; предыдущая база `a6a13a9`.
На старте staged-файлов нет; единственное unstaged-изменение — пользовательский
`baseUrl: "."` в `tsconfig.json`. Оно сохранено. Codex редактирует только
разрешённую документацию; пакеты, код приложения и Git не изменяет.

## Состояние и проверки

- Bootstrap/Discovery имеются. Начат RU/EN срез: next-intl, registry, proxy,
  messages, locale routes, catalog adapter и detail pages. ADR 0001 — Accepted.
- `sr`/`hy`/`ka`/`de` остаются planned; сербская письменность и шрифтовое
  покрытие новых языков открыты. Backend отсутствует в пределах текущего этапа.
- TypeScript: **PASS**, Node 25.5.0, `tsc --noEmit --incremental false`.
- ESLint: **FAIL**, одна ошибка `react-hooks/set-state-in-effect`, меню:31.
- Build/dev/browser в этом ревью не запускались. Существующие `.next`-артефакты
  использовались как дополнительное свидетельство, не как свежая проверка HEAD.
- Просмотр конфигов, сообщений, статических данных и публичных ассетов не
  выявил нового подтверждённого раскрытия секретов. Полноценный security scan,
  нагрузка, LCP и сетевые байты не измерялись.

## Статус исправлений (код, 31.10.2026)

После правок Cursor: `npm run lint`, `typecheck`, `build` — **PASS**.
R01–R09 закрыты в коде; browser/visual sign-off и HTTP-код 308 на alias
ещё требуют ручной проверки. Прежний текст замечаний ниже сохранён как история.

## Открытые замечания

### R01 — P1: текущий lint не проходит ✅ fixed

[main-nav-overlay.tsx](../../src/components/main-nav-overlay.tsx):30–32.
`setMounted(true)` синхронно вызывается в эффекте; реальный запуск ESLint
завершается с кодом 1. Это блокирует обязательный quality gate.
Убрать лишний mounted-state через безопасный lifecycle portal при `open`,
сохранив порядок хуков и SSR/hydration поведение. Не подавлять правило.
Проверка: lint green и ручное открытие меню после hydration.

### R02 — P2: возврат фокуса выполняется до снятия inert

[use-focus-trap.ts](../../src/lib/use-focus-trap.ts):48–51 и
[main-nav-overlay.tsx](../../src/components/main-nav-overlay.tsx):28,34–43.
Cleanup trap возвращает фокус, пока фон ещё inert; более поздний cleanup
снимает блокировку. Ожидаемая кнопка фокус не получает. Объединить lifecycle:
снять inert/scroll lock, затем восстановить фокус. Проверить Escape и кнопку
закрытия с клавиатуры; browser-сценарий в этом ревью не выполнялся.

### R03 — P2: EN UI переведён не полностью

[LeadForm](../../src/components/catalog/lead-form.tsx):28–81 подключается и на
EN listing ([page](../../src/app/[locale]/beer/page.tsx):69), но не использует
`leadForm` messages. Заголовок, подписи, placeholders и сообщения остаются RU.
У detail также зашиты `Style` и `Food pairing:`
([page](../../src/app/[locale]/beer/[slug]/page.tsx):161,172).
Использовать словари активной локали для видимых строк и accessible names.
Проверка: оба языка listing/detail/form, включая ошибку и stub status.

### R04 — P2: canonical alias возвращает временный redirect

[detail page](../../src/app/[locale]/beer/[slug]/page.tsx):86–92 обещает 301,
но `next/navigation.redirect()` использует 307. Пример:
`/en/beer/milk-of-amnesia-v-tropic` → `/en/beer/milk-of-amnesia`.
Применить согласованный постоянный код: 301 согласно текущим инструкциям
либо отдельно согласованный 308. `permanentRedirect` сам по себе даёт 308,
а не 301. Проверить HTTP-код, canonical target и отсутствие циклов.

### R05 — P2: metadata home потеряны при переносе layout

[home](../../src/app/[locale]/page.tsx) не экспортирует metadata; общий
[locale layout](../../src/app/[locale]/layout.tsx):13–19 содержит только title
и metadataBase. У `/` и `/en` нет прежнего description и локализованных
canonical/hreflang; автоматические alternates выключены в routing.
Добавить home generateMetadata из `meta.homeDescription` и published peers.
Проверять финальный HTML для двух home, а не только listing/detail.

### R06 — P2: фильтр сохраняет scroll предыдущей категории

[ProductGallery](../../src/components/catalog/product-gallery.tsx):40,61.
Меняется state фильтра, но прежний scroll container не сбрасывается.
После прокрутки ALL к концу CLASSIC начинается с конца доступного диапазона,
скрывая первые результаты слева. Сбросить позицию после смены списка либо
явно хранить позицию каждой категории. Проверить на узком viewport.

### R07 — P2: у карусели потеряна viewport-height составляющая

[CSS](../../src/components/catalog/product-gallery.module.css):13 задаёт
только `H × vw / screen`. Сохранённый исходный CSS
[`page__beer.html`](../discovery/_raw/page__beer.html):306 для 960–1199 задаёт
`min-height:630px; height:100vh`. На 960×900 это 900 px против текущих 630 px.
Вернуть соответствующий viewport constraint, затем сверить screenshot и
положение следующих секций. Сравнение вычислений выполнено по CSS;
внешний Tilda JS и browser pixel-match не проверялись.

### R08 — P3: полные переводы связаны с client carousel

Client [ProductGallery](../../src/components/catalog/product-gallery.tsx):5–8
импортирует фильтрацию из [catalog.ts](../../src/content/catalog.ts), который
на уровне модуля строит весь CATALOG из PRODUCT_PROPS. Существующий RU/EN
build содержит полные тексты обоих языков в клиентском chunk
`39esoia2_bqy_.js` (42 340 B; около 14 844 B gzip всего chunk).
Артефакт предшествует текущему checkout; его размеры не являются замером
новой сборки. Вынести чистую фильтрацию/типы в модуль без server fixtures,
изолировать data adapter и подтвердить результат свежим bundle-анализом.

### R09 — P3: NEW определяет preload

[ProductCard](../../src/components/catalog/product-card.tsx):30 включает
priority у трёх NEW продуктов. На <480 px видна одна бутылка, но остальные
также грузятся заранее. Выбрать приоритет по первому экрану/LCP отдельно от
маркетингового badge. Время LCP и реальные байты в этом ревью не измерялись.

## Закрытые прежние замечания

- P1 self-inert меню: portal находится вне `#site-root`; повторно не чинить.
- CSS reset перенесён в base; мобильное меню имеет accessible name.
- Карточки теперь используют локальные detail routes, non-alco изображение корректно.
- Email validation и filter button semantics исправлены.
- Новый catalog API даёт 18 RU и 18 EN карточек, корректные canonical
  round-trip по 36 переводам; planned product paths возвращают null.
- Серверные card DTO не содержат body-copy. R08 относится к отдельному
  клиентскому import graph и не опровергает правильность формы DTO.

## Дополнительные gate-проверки

Нужны неизвестный URL/global404, неподдерживаемый locale, все header/footer
ссылки и коллизии/aliases при изменении данных. Root layout сейчас passthrough;
корректные html/body на RU/EN не доказывают корректную оболочку ошибок.
Это задания на проверку, а не утверждение о свежем runtime-результате.

Бизнес-правила платежей/бонусов, production-интеграции и новые языковые тексты
не определялись. Порядок исправлений и критерии —
[CURSOR_NEXT_STEPS.md](../CURSOR_NEXT_STEPS.md).
