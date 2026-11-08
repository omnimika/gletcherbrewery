# Текущее задание Cursor Agent — после A1

Дата: **06.11.2026**. Baseline ревью **d6011d2**; код Q1–Q3 + A1 поверх **0500789**.
[Ревью](reviews/2026-11-05-public-integrity.md), [серия](SPRINT_PLAN.md),
[route matrix](discovery/PUBLIC_ROUTE_MATRIX.md),
[ABOUT baseline](discovery/ABOUT_PAGE_BASELINE.md),
[ABOUT manifest](discovery/ABOUT_SECTION_MANIFEST.md).

## Q1 / Q2 / Q3 / A1

| Sprint | Status |
|---|---|
| Q1 | R01/R02/R07/R08 Done; R05/R06 out of scope (owner) |
| Q2 | R03/R04/R09/R10 Done |
| Q3 | `/blog-all` **308** → `/blog`; sitemap/robots + `ALLOW_SITE_INDEXING` |
| A1 | `/about` shipped: Tilda 71867465 + scroll/appear/SBS/hover; RU-only; noindex |

A1 code: `src/app/[locale]/about`, `src/components/about/*`, `src/content/about.ts`,
`ZbScrollLinked` in `zb-motion.tsx`. Manifest + adaptations in
`ABOUT_SECTION_MANIFEST.md`. Slide shell: `100svh` + **NLM129 sticky stack**
(`#rec1144141191` → CSS sticky + rising z-index). Owner visual acceptance Open.

## Выполнить сейчас — C1 (после owner accept A1 при необходимости)

Подтверждённые campaigns / legacy URL decisions из route matrix. Не трогать
Klin unpublished/password. Не начинать Stage5 / NocoDB / cart.

## Git / docs

`.gitignore:59` → `/docs/`. Commit/push по запросу.
