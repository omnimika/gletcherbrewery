# Blog Batch 9 manifest

> Дата: **01.11.2026**  
> Статус: **Transferred**  
> Importer: `scripts/tilda-blog-import.mjs` + `scripts/html-to-tilda-raw.mjs` + `scripts/run-batch9.mjs`  
> Report: `.tmp/blog/batch9-report.json`  
> Fixture naming: `YYYY-MM-DD-{id}-{locale}.json` + JSON `publishedAt` (`YYYY-MM-DD HH:mm`)

## Scope

| id | locale | Tilda UID | publishedAt | peer | status |
|---|---|---|---|---|---|
| brainstorm-moto-fest-2023-report | ru | `en25lxya61` | `2023-08-22 10:00` | RU-only | transferred |
| arkhangelsk-craft-fest-2023 | ru | `ybi8xe5lc1` | `2023-08-03 12:54` | RU-only | transferred |
| klin-may-fest-2023-results | ru | `8imlu33eh1` | `2023-05-30 21:09` | RU-only | transferred-with-deferred (`video` YouTube) |
| klin-may-fest-2023-invite | ru | `fjtb6ibov1` | `2023-03-21 12:00` | RU-only | transferred |
| cooking-tuna-aguachile | ru | `gjauaxmg91` | `2023-03-03 15:22` | RU-only | transferred |
| cinnamon-beer | ru | `kd7ovgz6k1` | `2023-02-24 10:00` | RU-only | transferred |

## Counts

| Metric | Value |
|---|---|
| Locale-bodies | 6 |
| Deferred `video` | klin-may-fest-2023-results |
| Fake peers | 0 |

## Skipped (this batch)

| UID | Reason |
|---|---|
| `v36h61s2s1` vacancies | Out of scope (same policy as Batch 8) |
| `6nxnmf6ci1` BRAINSTORM MOTO FEST 2023 | Empty body + `directlink` shell |
| `m72y3fi0l1` КЛИН МАЙ ФЕСТ 2023 | Empty body + `directlink` shell |
| Inactive location/photo posts | `active` empty |

## Notes

- Callout → `quote`; embedded `ul` → `list`; `br` spacers ignored.
- Product href normalize: `brainstorm-apa-alcohol-free` → `/beer/brainstorm`; trailing `/beer/koresh/` → `/beer/koresh`.
- Published HTML Mapbox embed (klin results) not imported; deferred `html`/map path stays Open.
- HTML converter now recognizes `t-redactor__callout` and YouTube `video-container`.
