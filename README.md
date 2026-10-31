# Gletcher Brewery

Поэтапный перенос действующего сайта на Next.js App Router, TypeScript strict
и Tailwind CSS. Подключён next-intl; реализован начальный RU/EN каталог.
Каталог и product template приняты владельцем. Главная RU/EN v1 реализована;
текущий спринт — её завершение и приёмка.

- [Инструкции агентов](AGENTS.md)
- [Текущее задание Cursor](docs/CURSOR_NEXT_STEPS.md)
- [Актуальное ревью](docs/reviews/2026-11-01-home-and-sprints.md)
- [Следующая серия спринтов](docs/SPRINT_PLAN.md)
- [Baseline главной](docs/discovery/HOME_PAGE_BASELINE.md)
- [Baseline шаблона сорта](docs/discovery/PRODUCT_PAGE_BASELINE.md)
- [MCP Tilda и исходники](docs/discovery/TILDA_MCP_WORKFLOW.md)
- [Готовый промпт Cursor](docs/CURSOR_REVIEW_PROMPT.md)
- [ROADMAP](docs/ROADMAP.md)
- [Локальная разработка](docs/development.md)
- [i18n ADR](docs/adr/0001-i18n-routing-and-content.md)

Локально: Node.js из диапазона `engines.node` в `package.json`, затем
`npm ci` и `npm run dev`. Проверки разработчика: `npm run lint`,
`npm run typecheck`, `npm run build`. Развёртывание и реальные интеграции
относятся к отдельным этапам.
