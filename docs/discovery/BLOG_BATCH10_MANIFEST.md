# Blog Batch 10 manifest

> Дата: **01.11.2026**  
> Статус: **Transferred**  
> Importer: `scripts/html-to-tilda-raw.mjs` (legacy flat `<section>`) + `scripts/run-batch10.mjs`  
> Report: `.tmp/blog/batch10-report.json`  
> Fixture naming: `YYYY-MM-DD-{id}-{locale}.json` + JSON `publishedAt` (`YYYY-MM-DD HH:mm`)

## Scope

| id | locale | Tilda UID | publishedAt | peer | status |
|---|---|---|---|---|---|
| cooking-salmon-ipa | ru | `hac96kiyz1` | `2022-11-24 15:00` | RU-only | transferred |
| beer-acidity | ru | `79g7nt4ny1` | `2022-11-18 11:00` | EN `lj8oemius1` (wired after batch) | transferred |
| beer-acidity | en | `lj8oemius1` | `2022-11-18 17:44` | RU peer; GLOSSARY | transferred |
| quality-day | ru | `9gst01oa91` | `2022-11-10 14:03` | RU-only | transferred |
| craft-depot-interview | ru | `inxody6ls1` | `2022-09-22 13:40` | EN `c4olen1kd1` (wired after batch) | transferred |
| craft-depot-interview | en | `c4olen1kd1` | `2022-09-22 13:55` | RU peer; INTERVIEW (EN parts empty) | transferred |
| pomor-craft-fest-2022 | ru | `iyanfyplj1` | `2022-08-03 15:51` | EN `dtxtl8kd91` (wired after batch) | transferred |
| pomor-craft-fest-2022 | en | `dtxtl8kd91` | `2022-07-31 13:15` | RU peer; EVENTS | transferred |
| american-hops-1 | ru | `5uhnubazb1` | `2022-01-20 16:38` | RU-only | transferred |

## Counts

| Metric | Value |
|---|---|
| Locale-bodies | 6 RU + 3 EN peers (follow-up same day) |
| Deferred | 0 |
| Fake peers | 0 |

## Notes

- Older editor dumps store HTML fragments (not JSON `ty` arrays); published HTML uses flat `<section>` without `t-redactor__text` wrappers.
- `html-to-tilda-raw.mjs` now falls back to legacy section splitter (`preface`/`quote`/`h*`/`figure`/`ul`/`ol` + text gaps).
- `american-hops-1` is a single continuous text block (no figures in published body).
- Vacancies and inactive 2021–2018 stubs remain out of scope.
