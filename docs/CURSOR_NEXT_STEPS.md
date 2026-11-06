# Текущее задание Cursor Agent — A1: /about + animation

Дата: **06.11.2026**. Baseline ревью **d6011d2**; код Q1–Q3 поверх **0500789**.
[Ревью](reviews/2026-11-05-public-integrity.md), [серия](SPRINT_PLAN.md),
[route matrix](discovery/PUBLIC_ROUTE_MATRIX.md),
[ABOUT baseline](discovery/ABOUT_PAGE_BASELINE.md).

## Q1 / Q2 / Q3 — закрыты

| Sprint | Status |
|---|---|
| Q1 | R01/R02/R07/R08 Done; R05/R06 out of scope (owner) |
| Q2 | R03/R04/R09/R10 Done |
| Q3 | `/blog-all` **308** → `/blog`; `sitemap.ts`/`robots.ts` + `ALLOW_SITE_INDEXING`; route registry; /about MCP settings for A1 |

Q3 SEO: indexing **opt-in** (`ALLOW_SITE_INDEXING=true`); preview Disallow all + empty sitemap.
Не называть 308 «301». Code registry: `src/content/seo/public-routes.ts`.

## Выполнить сейчас — только A1

Обязательный `/about` по Tilda **page 71867465 / project 1212341** вместе с
анимацией и логикой landing. DoD и workflow — `ABOUT_PAGE_BASELINE.md` +
`TILDA_MCP_WORKFLOW.md` (read-only). Не подменять статичной «О нас» / одним Reveal.

Свежий MCP 06.11 (settings only): published, alias `about`, animations on,
`nosearch`/`meta_nofollow` on, 37 records. Дальше — records/ZB/timelines/SBS
через MCP, browser parity, reduced-motion/mobile/keyboard.

Не начинать C1 campaigns / Stage5 / NocoDB вместе с A1 mass rollout.
Klin unpublished/password: не публиковать. Commit/push по запросу.

## Следующие порции

C1 campaigns → stage-4 exit → D5-0. Без cart/payment/новых языков.

## Git / docs

`.gitignore:59` → `/docs/`. Safe Markdown allowlist в ревью. Не staging сейчас.
