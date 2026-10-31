# Gletcher Brewery

Поэтапный перенос действующего сайта на Next.js App Router, TypeScript strict
и Tailwind CSS. Подключён next-intl; реализован начальный RU/EN каталог.
Эталон `/beer` принят владельцем; product template v1 ожидает проверок и приёмки.

- [Инструкции агентов](AGENTS.md)
- [Текущее задание Cursor](docs/CURSOR_NEXT_STEPS.md)
- [Актуальное ревью](docs/reviews/2026-10-31-product-acceptance.md)
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
