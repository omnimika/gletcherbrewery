# Blog Batch 5 manifest

> Дата: **01.11.2026**  
> Статус: **Transferred**  
> Importer: `scripts/tilda-blog-import.mjs` + `scripts/run-batch5.mjs`  
> Report: `.tmp/blog/batch5-report.json`  
> Fixture naming: `YYYY-MM-DD-{id}-{locale}.json` + JSON `publishedAt` (`YYYY-MM-DD HH:mm`)

## Scope

| id | locale | Tilda UID | publishedAt | peer | status |
|---|---|---|---|---|---|
| brainstorm-motor-fest-2024 | ru | `r6g8ym6vs1` | `2024-07-28 12:37` | EN missing | transferred-with-deferred (`html` VK widget) |
| bowler-ipa | ru/en | `rrjjjry2e1` / `08cj20t161` | `2024-07-08 11:12` / `2024-07-16 16:21` | Confirmed pair | transferred |
| iron-woods-dry-stout | ru/en | `uphlmfzxv1` / `a842y8num1` | `2024-07-05 11:29` / `2024-07-02 16:15` | Confirmed pair (≠ milk stout) | transferred |
| brainstorm-apa | ru/en | `s6hgiav341` / `gumm02kpp1` | `2024-06-27 09:36` / `2024-06-28 16:08` | Confirmed pair | transferred |

## Counts

| Metric | Value |
|---|---|
| Locale-bodies | 7 |
| Deferred `html` | brainstorm-motor-fest-2024 |
| Fake peers | 0 |

## Notes

- Iron Woods dry stout is a separate entity from Batch 4 `iron-woods-milk-stout`.
- Source product link for Brainstorm uses `/beer/brainstorm-apa-alcohol-free` (EN slug); RU catalog slug is `/beer/brainstorm` — left as source until product URL alias ADR.
