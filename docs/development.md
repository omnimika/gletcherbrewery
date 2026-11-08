# Локальная разработка

Статус на 05.11.2026, d6011d2: DS-1/DS-2 реализованы, DS-3 широко перенесён;
map/shop и остальные основные public templates в коде. Текущая работа — Q1:
[функциональная надёжность](CURSOR_NEXT_STEPS.md), затем Q2/Q3 и public gate.
RU без префикса, EN под `/en`; новые языки ещё не публикуются.
Текущие проверки и дефекты описаны
в [текущем задании Cursor](CURSOR_NEXT_STEPS.md) и `ROADMAP.md`.
Серверные бизнес-интеграции относятся к последующим этапам.

## Требования и запуск

Нужны npm и Node.js, удовлетворяющий `engines.node` в `package.json`:
`^20.19.0 || ^22.13.0 || >=24.0.0`. Используйте поддерживаемую LTS-версию.
Нижняя граница учитывает ESLint и его зависимости.

В shell текущего ревью default Node 20.15.1 не соответствует engines;
проверки выполнены установленным Node 25.5.0. Перед npm-командами активировать
совместимую установленную версию; это не повод обновлять зависимости проекта.

```sh
npm ci
npm run dev
```

Приложение доступно по адресу http://localhost:3000. Текущие dev/start scripts
используют `--hostname 0.0.0.0 --port 3000` для локального/LAN preview;
allowedDevOrigins задан в `next.config.ts`. Для same-origin hero переменные
окружения не требуются. Опциональный публичный `NEXT_PUBLIC_HERO_BOTTLE_BASE`
описан в `.env.example`; перед внешним origin проверить CORS/canvas fallback.

Проверки:

```sh
npm run build
npm run lint
npx tsc --noEmit
```

`npm run typecheck` эквивалентен последней команде. Production-сервер локально:

```sh
npm run build
npm start
```

## Структура

```text
src/
  app/          # App Router, layout, страницы и глобальные стили
  components/   # Общие компоненты интерфейса
  content/      # Catalog/blog/public templates, секции и публикация RU/EN
  lib/          # Focus, scroll, formatting и навигационные helpers
  types/        # Будущие общие типы
```

Псевдоним `@/*` указывает на `src/*`. `types` пока содержит `.gitkeep`.
Страницы и `SiteShell` — серверные компоненты; меню, age gate, фильтры,
карусель и форма используют клиентские компоненты. Отправка формы — stub.
`product-props.ts` и listing assets объединяет `src/content/catalog.ts`:
карточки и detail routes используют стабильный ID и published translations.
Маршруты находятся в `src/app/[locale]`, proxy — `src/proxy.ts`, конфигурация
локалей — `src/i18n`, сообщения — в корневом `messages/`. Форма и detail labels
подключены к RU/EN сообщениям; полнота браузерного UI проверяется отдельно.

Стили Tailwind CSS 4 обрабатывает официальный `@tailwindcss/turbopack` через
`next.config.ts`; правило применяется к `src/app/globals.css`. CSS Modules
карусели обрабатываются отдельно. Отдельный PostCSS-конфиг не нужен.
В `globals.css` подключены локальные Gratimo/Gravity WOFF из `public/fonts`.
ABC Gravity Trial используются только для локального сравнения; Git их
игнорирует. Это не фильтр публикации содержимого `public`: состав артефакта
и разрешение на шрифты нужно проверить перед деплоем. Чистый checkout может
использовать другую цепочку fallback-шрифтов.

Для read-only ревью без обновления TypeScript-кеша:

```sh
./node_modules/.bin/tsc --noEmit --incremental false
./node_modules/.bin/eslint . --max-warnings=0
```

`build` и `dev` создают `.next` и могут обновлять `next-env.d.ts`; эти команды
не входят в режим строгого read-only ревью. Результаты текущего ревью:
[d6011d2, 2026-11-05](reviews/2026-11-05-public-integrity.md).

Mapbox frontend использует публичный token из .env.example; его значение
задаётся локально вне Git. Без token должна работать публичная fallback-ссылка.
Q1 также проверяет invalid token, WebGL initialization и repeat mount.
CRM/публикация tilesets не нужны для локального запуска public templates.

Cursor ранее сообщил рабочий production-start с `--hostname localhost` и loop
с `127.0.0.1`. Для текущего QA использовать localhost; IP-проблему считать
отдельной невоспроизведённой здесь диагностикой. NextURL нормализует loopback,
но это не доказывает причину полного server loop; приложить HTTP/Host chain
перед изменением routing или зависимостей.

`src/components/product` — серверные hero/detail/specs/related;
`src/content/product-media.ts` — cover/logo по stable ID;
`src/lib/format-spec.ts` — числовое отображение. Source baseline:
[PRODUCT_PAGE_BASELINE](discovery/PRODUCT_PAGE_BASELINE.md).

Home-компоненты — `src/components/home`, fixtures — `src/content/home.ts` и
`home-menu.ts`. Delivery video tracked в `public/vid/herobottle`; masters/work
в `.tmp`/ignored. Видеофайлы не нужно получать из приватной машины для checkout.
Фактический preload/CPU/render fallback и font fallback проверяются отдельно.
[Home baseline](discovery/HOME_PAGE_BASELINE.md), [спринты](SPRINT_PLAN.md).

Исходники Tilda доступны Cursor через MCP. Сбор доказательств и сверка
editor/published: [TILDA_MCP_WORKFLOW](discovery/TILDA_MCP_WORKFLOW.md).
MCP не требуется для локального запуска Next.js.

## Сохранность исходных материалов

При Bootstrap исходные материалы были сохранены. README и `.gitingnore`
сохраняются; `AGENTS.md` и документация далее обновляются по разрешению владельца.
В `next.config.ts` задано `agentRules: false`, чтобы `next dev` автоматически
не дописывал инструкции в пользовательский `AGENTS.md`.
Добавлен отдельный `.gitignore`: файл `.gitingnore` Git не использует.
Зависимости, сборка, локальные env-файлы и генерируемые типы Next.js исключены
из Git; `package-lock.json` и `.env.example` предназначены для хранения в нём.

Выбор зависимостей и границы этапа описаны в
[ADR 0000](adr/0000-frontend-bootstrap.md).
