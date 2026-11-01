# Blog Batch 2 manifest

> Дата: **01.11.2026**  
> Статус: **Transferred** (fixtures + local routes)  
> Importer: `scripts/tilda-blog-import.mjs` + `scripts/run-batch2.mjs`  
> Report snapshot: `.tmp/blog/batch2-report.json`

## Scope

Next chronological RU posts after Batch 1 listing teasers, plus Confirmed Friday Avenue pair. Not full feed.

| id | locale | Tilda UID | localSlug | peer | status |
|---|---|---|---|---|---|
| kenig-kraft-fest | ru | `zd1a4a40u1` | `zd1a4a40u1-edem-v-kaliningrad-na-kenig-kraft-fest` | EN missing | **transferred** |
| gorky-craft | ru | `5hportmx81` | `5hportmx81-gorech-kraft-i-rok-n-roll-kak-mi-otorval` | EN missing | **transferred-with-deferred** (`video`) |
| arkhangelsk-craft-fest | ru | `gacdootci1` | `gacdootci1-edem-v-arhangelsk-na-craft-fest` | EN missing | **transferred-with-deferred** (`video`) |
| cynic-story | ru | `uvgfhv9ec1` | `uvgfhv9ec1-cynic-filosofiya-vremeni-i-triumf-impers` | EN Open (≠ aging `93l8iii9y1`) | **transferred** |
| friday-avenue | ru/en | `01gzr6nji1` / `3z3igkl1u1` | postdefaulturl segments | Confirmed pair | **transferred** |

## Counts (Batch 2 new bodies)

| Metric | Value |
|---|---|
| Locale-bodies transferred | 6 |
| Unsupported `ty` deferred | `video` on gorky + arkhangelsk (editor `ty:video` and/or HTML scrape of `video_ext` as fake image — both deferred, never rendered) |
| Alt gaps (empty alt on cover/inline) | noted in report; not blocking |
| Fake peers invented | 0 |

## Provenance notes

- Meta (title, date, cover, `postdefaulturl`, SEO): MCP `feeds_get_post` project `1212341`.
- Block bodies: published HTML → editor-shaped `ty` JSON (`html-to-tilda-raw.mjs`) when full MCP `text` dump not written to disk; EN needed browser UA.
- `ty:video` (VK embeds) confirmed from MCP editor JSON and injected into raw for gorky/arkhangelsk so deferred is explicit in the report — not silently dropped.
- Cynic RU is a separate entity from EN Aging (`93l8iii9y1`); LocaleSwitch falls back to `/blog`.

## Open / deferred for later batches

- Video block renderer (VK embed) for deferred `ty:video`.
- Prefer automated MCP editor JSON dumps in CI (`scripts/mcp-post-to-raw.mjs` ready).
- Backfill empty `alt`.
- Legacy `/blog/{slug}` 301 table.
- Next chronological RU after cynic (e.g. kraftomania `l1amaxj121`, NY `bl766ufrx1`).
