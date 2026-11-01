# Gletcher Brewery

Поэтапный перенос действующего сайта на Next.js App Router, TypeScript strict
и Tailwind CSS. Подключён next-intl; реализованы каталог/product, home, blog
и первые B2B/legal templates. Каталог/product и partnership приняты по текущим
записям. Новый приоритет владельца — **DS-1: дизайн-фундамент и showcase**,
затем один landing pilot и последовательный rollout общих правил.

- [Инструкции агентов](AGENTS.md)
- [Текущее задание Cursor](docs/CURSOR_NEXT_STEPS.md)
- [Дизайн-код и сетка](docs/design/DESIGN_SYSTEM.md)
- [Архитектура дизайн-системы](docs/adr/0010-design-system-and-section-layout.md)
- [Актуальное ревью](docs/reviews/2026-11-01-design-system.md)
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
