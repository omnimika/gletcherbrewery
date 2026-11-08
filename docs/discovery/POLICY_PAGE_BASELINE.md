# `/policy` — source baseline

Дата: **01.11.2026**. Sprint 5 legal page (paired with `/contacts`).

## Provenance

| Field | Value |
|-------|--------|
| Public URL | https://www.gletcherbrewery.com/policy |
| Tilda page | `13473864` |
| Records | 2 (header + text tpl `106` `223532053`) |
| EN peer | **none** |
| Related | `/shopping-rules` page `13866555` — separate template, not this page |

## Rules

- Copy is **verbatim** from published source HTML. Do not invent or paraphrase legal text.
- Local body: `src/content/policy.ts` generated from `page__policy.html` extract 01.11.2026.
- Footer + forms must link local `/policy` after migration (RU absolute from EN chrome).

## Acceptance (local v1)

- `/policy` RU-only; EN switcher → `/`.
- Title + 8 numbered sections from source.
- lint / typecheck / browser smoke.
