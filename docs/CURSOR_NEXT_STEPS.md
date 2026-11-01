# Текущее задание Cursor Agent

Дата: **01.11.2026**. Sprint 2 listing готов; sprint 3 article template в работе
с учётом будущего Puck в CRM ([ADR 0005](adr/0005-cms.md)).
[Контракт](discovery/BLOG_CONTENT_CONTRACT.md), [план](SPRINT_PLAN.md).

## Статус gates

| Gate | Статус |
|------|--------|
| `/beer` каталог | **Принят** 31.10.2026 |
| `/beer/{slug}` product template | **Принят** 31.10.2026 |
| Home `/`, `/en` | **Ready for owner acceptance** |
| Blog listing `/blog` | **Ready for owner acceptance** |
| Blog article `/blog-all/tpost/{slug}` | **Ready for owner acceptance** (pizza RU/EN + homebrew RU) |

## Sprint 3 — сделано

1. ADR 0005 Proposed: Puck in CRM; block taxonomy = Tilda feed (`preface` /
   `paragraph` / `heading` / `image` + reserved).
2. Fixtures: `src/content/blog/articles/*.json` from published Tilda bodies.
3. Renderer: `BlogArticle` + allowlisted inline HTML; route mirrors production.
4. Listing/home teasers: local href when body exists; else production tpost.
5. Missing peer: homebrew RU local; EN switch → `/en/blog` (no fake EN article).
6. Checks: lint / tsc / build PASS; browser pizza RU↔EN peers; homebrew EN → listing.

## Не сейчас

Установка `@measured/puck`, CMS UI, ORM/БД, партии всех постов, Cynic polish.
Commit/push — только по запросу.
