# Текущее задание Cursor Agent

Дата: **01.11.2026**. Blog listing redesign + Batches 1–14.
Puck в CRM — позже ([ADR 0005](adr/0005-cms.md)).
[Контракт](discovery/BLOG_CONTENT_CONTRACT.md),
[Batch 1](discovery/BLOG_BATCH1_MANIFEST.md)–[Batch 14](discovery/BLOG_BATCH14_MANIFEST.md),
[категории](discovery/BLOG_CATEGORY_AUDIT.md),
[план](SPRINT_PLAN.md).

## Статус gates

| Gate | Статус |
|------|--------|
| `/beer` каталог | **Принят** 31.10.2026 |
| `/beer/{slug}` product template | **Принят** 31.10.2026 |
| Home `/`, `/en` | **Принят** |
| Blog listing `/blog` | **Redesign ready for owner** (covers, 2-col grid, rubric tabs ≈ production `/blog-all`) |
| Blog article template | **Принят** |
| Blog Batch 1–2 | **Принят** |
| Blog Batch 3–14 | **Ready for owner acceptance** |

## Convention (Confirmed owner)

- Fixture files: `YYYY-MM-DD-{id}-{locale}.json`
- JSON field `publishedAt`: `YYYY-MM-DD HH:mm` (Tilda editorial, Europe/Moscow)
- Continue batches without waiting for acceptance (owner 01.11.2026).
- `categoryId` / chip from Tilda `parts` (primary = first id); see `src/content/blog-categories.ts`.

## Listing redesign — сделано

1. `/blog` cards: cover + category chip on image, title, description, date.
2. Responsive grid: 1 col mobile / 2 col `sm+` (production `inrow2`).
3. Rubric tabs: ВСЕ + 8 categories; client filter by `categoryId`.
4. Cover/description from local article bodies only; production archive CTA removed.

## Дальше

Owner acceptance of listing redesign + Batches 3–14. Optional: non-sitemap feed remainder / alias pages (`/blog/expansion`…), newsletter on listing, then Stage 4 templates or CMS per ROADMAP.

Commit/push — только по запросу.

## Не сейчас

Puck install, video/table/html renderer, ORM/БД, DNS cutover.
