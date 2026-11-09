# Локальная разработка

Статус 09.11: Q1–Q3 и /about code реализованы; **B1 Done** (PG + NocoDB +
Contacts intake). Текущая работа — [B2 delivery](CURSOR_NEXT_STEPS.md).
RU без префикса, EN под `/en`. Non-prod DB: [B1_RUNBOOK](backend/B1_RUNBOOK.md),
[contract](backend/FORMS_DATA_PIPELINE.md), [sources](data/SOURCE_INVENTORY.md).

## Требования и запуск

Нужны npm и Node.js, удовлетворяющий `engines.node` в `package.json`:
`^20.19.0 || ^22.13.0 || >=24.0.0`. Используйте поддерживаемую LTS-версию.
Нижняя граница учитывает ESLint и его зависимости.

В shell текущего ревью default Node 20.15.1 не соответствует engines;
проверки выполнены установленным Node 25.5.0. Перед npm-командами активировать
совместимую установленную версию; это не повод обновлять зависимости проекта.

```sh
npm ci
npm run db:embedded   # terminal 1 — PostgreSQL + migrate (port 54329)
npm run nocodb:dev    # terminal 2 — http://127.0.0.1:8080
npm run dev           # terminal 3 — http://localhost:3000
```

Подробности и staff view: [B1_RUNBOOK](backend/B1_RUNBOOK.md). Dev/start scripts
используют `--hostname 0.0.0.0 --port 3000`; `allowedDevOrigins` в `next.config.ts`.
Опциональный `NEXT_PUBLIC_HERO_BOTTLE_BASE` — в `.env.example`.

Проверки:

```sh
npm run test:unit
npm run test:integration
npm run db:restore-check
npm run b1:smoke
npm run typecheck
npm run lint
npm run build
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
карусель и форма используют клиентские компоненты. Contacts RU пишет в PostgreSQL
через `/api/forms/submissions`; остальные формы пока unavailable.
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
[2095221, 2026-11-09](reviews/2026-11-09-data-and-forms.md).

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
