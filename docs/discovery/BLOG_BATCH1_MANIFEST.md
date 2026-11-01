# Blog Batch 1 manifest

> Дата: **01.11.2026**  
> Статус: **Transferred** (fixtures + local routes)  
> Importer: `scripts/tilda-blog-import.mjs` (+ `html-to-tilda-raw.mjs` for published HTML → editor-shaped JSON when MCP dump not on disk)  
> Report snapshot: `.tmp/blog/batch1-report.json`

## Scope

Finish listing/home teasers + Confirmed peers. Not full feed (141 RU / 44 EN).

| id | locale | Tilda UID | localSlug | peer | status |
|---|---|---|---|---|---|
| beer-pizza | ru/en | `913cadd4f1` / `5od5iaktd1` | production segments | Confirmed pair | prior (sprint 3) |
| homebrew-day | ru | (alias path) | `homebrewing-craft-beer-history` | EN missing | prior (sprint 3) |
| barrel-aged | ru | `ld2ni67l11` | `barrel-aged-beer-day-2026` (alias) | EN missing | **transferred** |
| afisha-winepark | ru | `cf46mag0n1` | `cf46mag0n1-afisha-…` | EN missing | **transferred** |
| moa-na | ru/en | `u7ezeg5ax1` / `za6t88elj1` | postdefaulturl segments | Confirmed pair (topic/date) | **transferred** |
| aging | en | `93l8iii9y1` | `93l8iii9y1-gletcher-aging-…` | RU Open (≠ Cynic `uvgfhv9ec1`) | **transferred** |
| tour-de-grapefruit | ru/en | `6euma1kok1` / `9i3ig0g2r1` | postdefaulturl segments | Confirmed pair | **transferred** |

## Counts (Batch 1 new bodies)

| Metric | Value |
|---|---|
| Locale-bodies transferred | 7 |
| Unsupported `ty` deferred | 0 |
| Alt gaps (empty alt on cover/inline) | noted in report; not blocking |
| Fake peers invented | 0 |

## Provenance notes

- Primary block source for this batch: published HTML redactor DOM → editor-shaped `ty` JSON → allowlisted fixtures (EN pages needed browser UA; some IPs get 403).
- MCP `feeds_get_post` used for UIDs, titles, SEO, dates, peer confirmation.
- `barrel-aged` public path keeps Confirmed alias `barrel-aged-beer-day-2026` (not only `postdefaulturl`).
- Aging EN not merged with RU Cynic article — different titles/entities.

## Open / deferred for later batches

- Full peer map for remaining ~130 RU / ~40 EN posts.
- Backfill empty `alt` from editorial review.
- Legacy `/blog/{slug}` 301 table.
- Prefer MCP editor JSON dumps in CI once dump workflow is automated.
