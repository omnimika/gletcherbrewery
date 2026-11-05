# Текущее задание Cursor Agent — Q3: URL / publication / SEO

Дата: **05.11.2026**. Baseline ревью **d6011d2**. **Q1/Q2 закрыты** в этой сессии.
Следующий спринт — только Q3. [Ревью](reviews/2026-11-05-public-integrity.md),
[серия](SPRINT_PLAN.md), [route matrix](discovery/PUBLIC_ROUTE_MATRIX.md).

DS-1/DS-2/DS-3 не начинать заново. /agent 320 polish в d6011d2; visual QA Open.
Прежние acceptances — regression baseline.

## Q1 — закрыто (05.11)

R01/R02/R07/R08 Done. **R05/R06 out of scope (owner).** Lint/tsc/build + Playwright.

## Q2 — закрыто (05.11)

| ID | Статус | Outcome |
|---|---|---|
| R03 | Done | CardGrid `--ds-card-cols` в `minmax`; 8 cards / columns=3 → max 3 на 1440 |
| R04 | Done | Vertical wheel не hijack; autoplay default `0`; Pause/Play только при speed>0; IO + visibility pause |
| R09 | Done | `ManagedVideo`: reduced-motion → no `<video>`; offscreen pause; error fallback |
| R10 | Done | Map `.heroAccent` `#3d5a9e` на ice ≈ **5.71:1** (было ~1.51:1) |

Проверки: `tsc` / `eslint` / `build` PASS. Playwright: design-system cards, /partnership
wheel, /map contrast, /agent video + `prefers-reduced-motion: reduce`.
Browser candidates (shop address absolute, CompareCard hover/focus, CompositionGrid
clip) — **не подтверждены дефекты в этой сессии**; не объявлены PASS/FAIL.
/agent @320 visual sign-off по-прежнему Open (hero stack не трогали).

## Выполнить сейчас — только Q3

Не начинать A1/campaigns/Stage5 вместе с Q3 mass rollout. Scope из SPRINT_PLAN:
route/publication manifest, legacy `/blog-all`, sitemap/robots/metadata policy,
remaining coverage. MCP Tilda только read-only. Commit/push по запросу.

## Следующие порции

**A1 /about** (Tilda 71867465 + animation) → C1 campaigns → stage-4 exit → D5-0.
Klin unpublished/password: не публиковать. Без NocoDB/CMS/cart/payment/новых языков.

## Git / docs

`.gitignore:59` → `/docs/`. Safe Markdown allowlist — в ревью Q1 outcomes + Q2 notes.
Не staging сейчас. Не раскрывать raw/source packs.
