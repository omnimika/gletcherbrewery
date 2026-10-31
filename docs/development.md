# Локальная разработка

Статус: Bootstrap завершён; реализованы каркас и начальные RU/EN home/list/detail.
RU доступен без префикса, EN — под `/en`. Приёмка и открытые дефекты описаны
в [текущем задании Cursor](CURSOR_NEXT_STEPS.md) и `ROADMAP.md`.
Серверные бизнес-интеграции относятся к последующим этапам.

## Требования и запуск

Нужны npm и Node.js, удовлетворяющий `engines.node` в `package.json`:
`^20.19.0 || ^22.13.0 || >=24.0.0`. Используйте поддерживаемую LTS-версию.
Нижняя граница учитывает ESLint и его зависимости.

```sh
npm ci
npm run dev
```

Приложение доступно по адресу http://localhost:3000. Переменные окружения
на этом этапе не требуются; `.env.example` оставлен как безопасный шаблон.

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
  content/      # Фикстуры каталога и RU/EN характеристики/тексты продуктов
  lib/          # Age gate, focus trap и справочные helpers карусели
  types/        # Будущие общие типы
```

Псевдоним `@/*` указывает на `src/*`. `types` пока содержит `.gitkeep`.
Страницы и `SiteShell` — серверные компоненты; меню, age gate, фильтры,
карусель и форма используют клиентские компоненты. Отправка формы — stub.
`product-props.ts` и listing assets объединяет `src/content/catalog.ts`:
карточки и detail routes используют стабильный ID и published translations.
Маршруты находятся в `src/app/[locale]`, proxy — `src/proxy.ts`, конфигурация
локалей — `src/i18n`, сообщения — в корневом `messages/`. Часть UI ещё требует
подключения переводов; наличие namespace в JSON само по себе этого не доказывает.

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
[2026-10-31](reviews/2026-10-31-current-state.md).

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
