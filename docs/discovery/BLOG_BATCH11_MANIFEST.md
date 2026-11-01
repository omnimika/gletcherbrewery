# Blog Batch 11 manifest

> Дата: **01.11.2026**  
> Статус: **Transferred**  
> Importer: `scripts/mcp-post-to-raw.mjs` (JSON + legacy HTML `text`) + `scripts/run-batch11.mjs`  
> Report: `.tmp/blog/batch11-report.json`  
> Fixture naming: `YYYY-MM-DD-{id}-{locale}.json` + JSON `publishedAt` (`YYYY-MM-DD HH:mm`)

## Scope

| id | locale | Tilda UID | publishedAt | categoryId / label | peer | status |
|---|---|---|---|---|---|---|
| cheers-beers | ru | `tfatlkslk1` | `2022-06-01 17:08` | `events` / МЕРОПРИЯТИЯ (parts order: events→photo→recipes) | EN `poxg2fuvl1` | transferred-with-deferred (`video`) |
| cheers-beers | en | `poxg2fuvl1` | `2022-06-01 18:10` | `events` / EVENTS | RU peer | transferred-with-deferred (`video`) |
| prodexpo-2022 | ru | `2pminbnlo1` | `2022-02-03 08:54` | `events` / МЕРОПРИЯТИЯ | RU-only | transferred |
| beer-sensation-more | ru | `hxjjtbo7k1` | `2021-11-25 21:53` | `library` / БИБЛИОТЕКА | RU-only | transferred |
| beer-sensation-acidity-salt | ru | `4ryr3vef21` | `2021-11-12 14:29` | `library` / БИБЛИОТЕКА | RU-only | transferred |
| beer-sensation-bitterness | ru | `x3afu840s1` | `2021-10-01 17:32` | `library` / БИБЛИОТЕКА (**Proposed**: empty `parts`) | RU-only | transferred |

## Deferred / out of this batch

| id | reason |
|---|---|
| expansion / `yvr9000yd1` | Empty feed `text`; `directlink` → `/blog/expansion` (separate page body). EN peer `ebr5zugm31` inactive (`active=""`, `published=""`). |
| Vacancies | Out of migration scope |

## Counts

| Metric | Value |
|---|---|
| Locale-bodies | 6 |
| Confirmed EN peers wired | 1 (`cheers-beers`) |
| Fake peers | 0 |

## Notes

- Categories Confirmed via `feeds_get_post.parts` (project `1212341`, 01.11.2026).
- `mcp-post-to-raw.mjs` now converts legacy HTML `text` fragments into editor-shaped `ty` JSON.
- EN Craft Depot peer has empty `parts`; chip kept `INTERVIEW` from RU entity (Batch 10).
