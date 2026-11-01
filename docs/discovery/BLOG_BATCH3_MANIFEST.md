# Blog Batch 3 manifest

> Дата: **01.11.2026**  
> Статус: **Transferred**  
> Importer: `scripts/tilda-blog-import.mjs` + `scripts/run-batch3.mjs`  
> Report: `.tmp/blog/batch3-report.json`  
> Fixture naming: `YYYY-MM-DD-{id}-{locale}.json` + JSON `publishedAt` (`YYYY-MM-DD HH:mm`)

## Scope

| id | locale | Tilda UID | publishedAt | peer | status |
|---|---|---|---|---|---|
| kraftomania | ru | `l1amaxj121` | `2026-01-13 12:50` | EN missing | transferred |
| new-year-2026 | ru | `bl766ufrx1` | `2025-12-30 11:35` | EN missing | transferred |
| match-racing | ru | `5vugn2kjy1` | `2025-09-18 11:39` | EN missing | transferred-with-deferred (`video`) |
| bar-hub-expo | ru | `u1mk7vpiy1` | `2025-09-08 11:13` | EN missing | transferred-with-deferred (`video`) |
| brut-grapefruit | ru/en | `lypdkibzr1` / `24i9vt9881` | `2024-08-30 13:51` / `2024-09-03 16:37` | Confirmed pair | transferred |

## Counts

| Metric | Value |
|---|---|
| Locale-bodies | 6 |
| Deferred `video` | match-racing, bar-hub-expo |
| Fake peers | 0 |

## Convention (Batch 3+)

- Filename starts with editorial calendar date from Tilda `date`.
- JSON always includes `publishedAt` with time (`YYYY-MM-DD HH:mm`, Europe/Moscow).
- Existing Batch 1–2 fixtures renamed to the same convention (`scripts/rename-blog-articles-dated.mjs`).
