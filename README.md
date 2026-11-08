# Gletcher Brewery

Поэтапный перенос действующего сайта на Next.js App Router, TypeScript strict
и Tailwind CSS. Подключён next-intl; реализованы дизайн-фундамент, каталог/product,
home/blog, B2B/legal и публичные agent/tours/map/shop. DS-1/DS-2 уже реализованы.
Текущий приоритет — **Q1: функциональная надёжность**, затем UI/UX regression,
URL/SEO coverage, обязательный /about с анимацией/логикой и подтверждённые
campaigns. Backend — следующий этап.

- [Инструкции агентов](AGENTS.md)
- [Текущее задание Cursor](docs/CURSOR_NEXT_STEPS.md)
- [Дизайн-код и сетка](docs/design/DESIGN_SYSTEM.md)
- [Архитектура дизайн-системы](docs/adr/0010-design-system-and-section-layout.md)
- [Актуальное ревью](docs/reviews/2026-11-05-public-integrity.md)
- [Публичные маршруты и границы](docs/discovery/PUBLIC_ROUTE_MATRIX.md)
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
