# `/shopping-rules` — source baseline

Дата: **01.11.2026**. Sprint 5 legal page (paired with `/policy`).

## Provenance

| Field | Value |
|-------|--------|
| Public URL | https://www.gletcherbrewery.com/shopping-rules |
| Tilda project | `1212341` |
| Tilda page | `13866555` |
| Body record | tpl `106` `229536606` (TX01) |
| EN peer | **none** Confirmed for published SEO; page hrefs include `/en/shopping-rules` (Open / not migrated) |
| Related | `/policy` page `13473864` — separate template |

## Rules

- Copy is **verbatim** from Tilda editor/published HTML. Do not invent or paraphrase legal text.
- Local body: `src/content/shopping-rules.ts` from MCP `get_record_html` + `page__shopping-rules.html` 01.11.2026.
- Decorative source ZB login/signup CTAs (`/members/*`) deferred with shop/auth migration.
- Layout: `SectionFrame mode=content` + `ReadingContainer` (ADR 0010 legal/reading flow).

## Acceptance (local v1)

- `/shopping-rules` RU-only; EN switcher → `/`.
- Meta title matches source; H1 eyebrow `ПРАВИЛА МАГАЗИНА` + document title + 4 numbered sections.
- lint / typecheck / browser smoke.
