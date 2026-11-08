# Blog Batch 7 manifest

> Дата: **01.11.2026**  
> Статус: **Transferred**  
> Importer: `scripts/tilda-blog-import.mjs` + `scripts/run-batch7.mjs`  
> Report: `.tmp/blog/batch7-report.json`  
> Fixture naming: `YYYY-MM-DD-{id}-{locale}.json` + JSON `publishedAt` (`YYYY-MM-DD HH:mm`)

## Scope

| id | locale | Tilda UID | publishedAt | peer | status |
|---|---|---|---|---|---|
| heidegger-hell | ru/en | `r1vxz57aa1` / `z246e2pvf1` | `2024-06-13 12:55` / `2024-06-13 10:52` | Confirmed pair | transferred |
| hop-dragon | ru/en | `vo2xnz54a1` / `8e11sgv211` | `2024-06-07 13:43` / `2024-06-07 10:36` | Confirmed pair | transferred |
| ruby-road | ru/en | `db51dn3df1` / `s5buub3ik1` | `2024-06-03 11:33` / `2024-06-03 10:28` | Confirmed pair | transferred |
| milk-of-amnesia | ru/en | `nmvocr5vt1` / `zxbflinfn1` | `2024-05-29 12:03` / `2024-05-29 10:24` | Confirmed pair | transferred-with-deferred (`video` YouTube) |

## Counts

| Metric | Value |
|---|---|
| Locale-bodies | 8 |
| Deferred `video` | milk-of-amnesia RU/EN |
| Fake peers | 0 |

## Notes

- Importer now also defers YouTube embed URLs masquerading as `image` (never Next/Image).
- RU product CTA fixed to `/beer/milk-of-amnesia-v-tropic` (catalog slug).
- Completes the main 2024 product-story Confirmed peer set after Friday Avenue.
