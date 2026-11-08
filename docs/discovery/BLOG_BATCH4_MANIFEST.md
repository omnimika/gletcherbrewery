# Blog Batch 4 manifest

> Дата: **01.11.2026**  
> Статус: **Transferred**  
> Importer: `scripts/tilda-blog-import.mjs` + `scripts/run-batch4.mjs`  
> Report: `.tmp/blog/batch4-report.json`  
> Fixture naming: `YYYY-MM-DD-{id}-{locale}.json` + JSON `publishedAt` (`YYYY-MM-DD HH:mm`)

## Scope

| id | locale | Tilda UID | publishedAt | peer | status |
|---|---|---|---|---|---|
| brainstorm-motor-fest-2025 | ru | `t3rp7u17x1` | `2025-07-29 19:00` | EN missing | transferred |
| nizhny-gorky-craft | ru | `zslbtrzf81` | `2025-07-01 11:58` | EN missing | transferred |
| klin-may-fest-2025-results | ru | `lvdpb93421` | `2025-06-03 16:13` | EN missing | transferred-with-deferred (`video`, `table`) |
| iron-woods-milk-stout | ru | `bvhspd8pm1` | `2025-04-08 02:00` | Not paired with EN dry stout | transferred |
| rouge-de-fleur | ru/en | `pvbch1v1p1` / `k3spgxeyx1` | `2024-07-23 11:41` / `2024-08-20 16:28` | Confirmed pair | transferred |

## Counts

| Metric | Value |
|---|---|
| Locale-bodies | 6 |
| Deferred `video` | klin-may-fest-2025-results |
| Deferred `table` | klin-may-fest-2025-results |
| Fake peers | 0 |

## Notes

- Klin May participant posts (`active: ""`) skipped; only results post imported.
- Iron Woods Milk Stout RU is **not** the EN Iron Woods dry stout article — peer left `missing`.
- Rouge de Fleur RU/EN peer Confirmed via MCP `postdefaulturl`.
- Source typo `/beer/milk-ofamnesia` in Nizhny body corrected to `/beer/milk-of-amnesia`.
