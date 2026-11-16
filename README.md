# Gletcher Brewery

Поэтапный перенос действующего сайта на Next.js App Router, TypeScript strict
и Tailwind CSS. Подключён next-intl; реализованы дизайн-фундамент, каталог/product,
home/blog, B2B/legal и публичные agent/tours/map/shop. DS-1/DS-2 уже реализованы.
Q1–Q3 и код /about реализованы; отдельные visual sign-offs Open.
Статус **12.11.2026**: B1–B3 реализованы, M1 map/CRM принят; есть ledger,
QR/OCR/manual receipt queue и magic-link spike. Кабинет /members/lk и agent
application развиваются. Дальше — **M2-2: надёжность данных**, M2-3: member↔staff
workflow, M2-4: настоящий row-level import/reconciliation/restore.
CRM = PostgreSQL + read-only NocoDB + staff commands. Lead Google Sheets отменён.
Postbox/GTIN и shop UI отложены владельцем; они не блокируют CRM/importer.

- [Инструкции агентов](AGENTS.md)
- [Какие docs публичны / локальны](docs/README.md)
- [Дизайн-код и сетка](docs/design/DESIGN_SYSTEM.md)
- [Архитектура дизайн-системы](docs/adr/0010-design-system-and-section-layout.md)
- [Кабинет и CRM workflow](docs/backend/AGENT_CRM_WORKFLOWS.md)
- [Контракт форм и доставки](docs/backend/FORMS_DATA_PIPELINE.md)
- [Публичные маршруты и границы](docs/discovery/PUBLIC_ROUTE_MATRIX.md)
- [Baseline главной](docs/discovery/HOME_PAGE_BASELINE.md)
- [Baseline шаблона сорта](docs/discovery/PRODUCT_PAGE_BASELINE.md)
- [MCP Tilda и исходники](docs/discovery/TILDA_MCP_WORKFLOW.md)
- [Локальная разработка](docs/development.md)
- [i18n ADR](docs/adr/0001-i18n-routing-and-content.md)

Локально (не в публичном git после untrack): `docs/ROADMAP.md`,
`docs/CURSOR_NEXT_STEPS.md`, `docs/SPRINT_PLAN.md`, `docs/reviews/`,
loyalty/migration inventory — см. [docs/README.md](docs/README.md).

Локально: Node.js из диапазона `engines.node` в `package.json`, затем
`npm ci` и `npm run dev`. Проверки разработчика: `npm run lint`,
`npm run typecheck`, `npm run build`. Развёртывание и реальные интеграции
относятся к отдельным этапам.
