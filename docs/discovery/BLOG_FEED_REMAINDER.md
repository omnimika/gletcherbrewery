# Blog feed remainder inventory (Sprint 4b)

> Дата: **01.11.2026**  
> Источник: Tilda MCP `feeds_get_posts` project `1212341`  
> RU feed `921152316206` (141), EN feed `370831704951` (44)  
> Статус: **Confirmed inventory**; migrations go in follow-up batches.

## Snapshot counts

| Locale | Feed total | Active `y` | Inactive / empty `active` | Local fixtures (approx.) | Sitemap locs (discovery dump) |
|---|---:|---:|---:|---:|---:|
| RU | 141 | ~85 | ~56 | 78 | 83 |
| EN | 44 | ~42 | ~2 | 42 | 42 |

Numbers are MCP page aggregates (01.11.2026), not a live guarantee.

## Classification (RU)

### A. Already migrated (local fixtures / registry)

Sitemap tpost set largely covered by Batches 1–14 + earlier sprints. Alias articles with localSlug without numeric prefix (e.g. homebrew, barrel-aged) count toward coverage separately from UID prefix.

### B. Active feed shells → external page body (alias)

| UID | Title | `directlink` | Local status |
|---|---|---|---|
| `yvr9000yd1` | Расширяем производство! | `/blog/expansion` | **Migrated** RU `/blog/expansion` (01.11.2026). EN peer/page unpublished. |
| `v36h61s2s1` | НОВЫЕ ВАКАНСИИ… | `/vacancies` | **Migrated** RU `/vacancies` (01.11.2026). Production public URL redirects to `/` (Observed); Tilda page published + `nosearch=on`. |
| `m72y3fi0l1` | КЛИН МАЙ ФЕСТ 2023 | `/klin-may-fest-2023` | Listing card → production. Tilda page unpublished + password. Full local → Sprint 5. |
| `6nxnmf6ci1` | BRAINSTORM MOTO FEST 2023 | `/brainstorm-moto-fest-2023` | Listing card → production (~65 records). Full local → Sprint 5. |
| `rubhsruj91` | ВЫИГРАЙ ПРИЗЫ… 10-ЛЕТИЯ | `/10-years` | Listing card → production (~39 records, contest). Full local → Sprint 5 / archive. |

Empty feed `text` / `[]` — do **not** import as tpost bodies.

### C. Active + published tpost remainder

After Batches 1–14 + aliases above, **no remaining active+published RU feed posts with body text** were found missing from local registry (diff 01.11.2026). Barrel/homebrew use Confirmed alias slugs without UID prefix.

### D. Inactive / unpublished (default: skip unless owner asks)

Large cluster of **КЛИН МАЙ FEST 2025: УЧАСТНИКИ** (`cyzdcusrp1` … `kmotsx7yu1`, empty `published` / `active`).

Other inactive examples: seasonal cards, old release drafts, 2018–2020 archive shells without publish stamp.

**Policy (Proposed until owner confirms):** do not migrate inactive posts into public Next listing; keep inventory only.

### E. Deferred media (not missing posts)

| Kind | Examples | Status |
|---|---|---|
| YouTube | MOA, Klin 2023, Vasiliy, Anora | **Wired** `video` block |
| VK embed | gorky, arkhangelsk, match-racing, bar-hub, klin 2025 | Open |
| Self-hosted mp4 | cheers-beers RU/EN (`files.gletcherbrewery.com`) | Open |

## EN remainder

- Feed ≈ fixtures ≈ sitemap for active posts.
- Inactive: `pk3kci79g1` Yammy Jammy (duplicate of published EN release?), `ebr5zugm31` Expansion.

## Next migrations

1. ~~Feed tpost + `/blog/expansion` + `/vacancies`~~ done (Sprint 4b).
2. Full campaign landings → **Sprint 5** event template (not blog article batches).
3. VK / mp4 renderers only with allowlist contract.

