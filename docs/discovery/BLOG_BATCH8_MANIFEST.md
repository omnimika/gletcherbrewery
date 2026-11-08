# Blog Batch 8 manifest

> Дата: **01.11.2026**  
> Статус: **Transferred**  
> Importer: `scripts/tilda-blog-import.mjs` + `scripts/run-batch8.mjs`  
> Report: `.tmp/blog/batch8-report.json`  
> Fixture naming: `YYYY-MM-DD-{id}-{locale}.json` + JSON `publishedAt` (`YYYY-MM-DD HH:mm`)

## Scope

| id | locale | Tilda UID | publishedAt | peer | status |
|---|---|---|---|---|---|
| pub-history | ru | `v1p6azozg1` | `2024-02-26 12:22` | RU-only | transferred-with-deferred (`html`) |
| stout-guide | ru | `plfsxpk1n1` | `2024-02-04 18:00` | RU-only | transferred |
| cooking-thai-fries | ru | `pj8zx40cu1` | `2024-02-01 10:00` | RU-only | transferred |
| winter-warmers | ru | `kap55i5pe1` | `2024-01-23 09:00` | RU-only | transferred |
| klin-may-fest-2024-invite | ru | `8ionj8vgo1` | `2024-01-12 12:00` | RU-only | transferred |
| non-alcohol-trend | ru | `u9dt270xo1` | `2023-12-17 13:00` | RU-only | transferred |

## Counts

| Metric | Value |
|---|---|
| Locale-bodies | 6 |
| Deferred `html` | pub-history (1) |
| Fake peers | 0 |
| Skipped | Klin May 2024 inactive/duplicates (not in this batch) |

## Notes

- Library/events slice after 2024 product stories; no Confirmed EN peers.
- Importer now splits embedded `<ul>/<ol>` inside `text` into `list` blocks (cooking ingredients, stout steps/catalog).
- Product href fixes: `/beer/friday-avenue-apa`, `/beer/brainstorm`; Tilda `/beer#!/tab/…` → `/beer`.
- Vacancies and inactive Klin May posts remain out of scope.
