# Blog Batch 12 manifest

> Дата: **01.11.2026**  
> Статус: **Transferred**  
> Importer: `scripts/mcp-post-to-raw.mjs` + `scripts/run-batch12.mjs`  
> Report: `.tmp/blog/batch12-report.json`  
> Fixture naming: `YYYY-MM-DD-{id}-{locale}.json` + JSON `publishedAt` (`YYYY-MM-DD HH:mm`)

## Scope

| id | locale | Tilda UID | publishedAt | categoryId / label | peer | status |
|---|---|---|---|---|---|---|
| spoiled-beer | ru | `jb9hgilpm1` | `2021-09-24 14:39` | `library` / БИБЛИОТЕКА | RU-only | transferred |
| foodpairing-caramel | ru | `p1og5o2691` | `2021-09-14 14:29` | `library` / БИБЛИОТЕКА | EN `mejto1lui1` | transferred |
| foodpairing-caramel | en | `mejto1lui1` | `2021-09-14 16:21` | `library` / GLOSSARY (EN `parts` empty) | RU peer | transferred |
| beer-sensation-aroma | ru | `ozy0n3ypa1` | `2021-08-18 13:03` | `library` / БИБЛИОТЕКА | EN `ck3it9fx11` | transferred |
| beer-sensation-aroma | en | `ck3it9fx11` | `2021-08-18 13:03` | `library` / GLOSSARY | RU peer | transferred |
| smoked-malt | ru | `pnenfyiyb1` | `2021-08-05 16:52` | `library` / БИБЛИОТЕКА | EN `d3vg4bzat1` | transferred |
| smoked-malt | en | `d3vg4bzat1` | `2021-08-05 16:52` | `library` / GLOSSARY | RU peer | transferred |
| dry-hopping | ru | `eajyz692l1` | `2021-07-30 15:01` | `library` / БИБЛИОТЕКА | EN `txpbxbiek1` | transferred |
| dry-hopping | en | `txpbxbiek1` | `2021-07-30 15:01` | `library` / GLOSSARY | RU peer | transferred |

## Counts

| Metric | Value |
|---|---|
| Locale-bodies | 9 (5 RU + 4 EN) |
| Confirmed EN peers | 4 |
| Fake peers | 0 |

## Notes

- Caramel foodpairing sits in RU **БИБЛИОТЕКА** (not recipes part); EN peer has empty `parts` → chip GLOSSARY aligned to entity `library`.
- Sensory aroma completes the “как мы ощущаем пиво” set with Batch 11 acidity/bitterness/more (EN only for aroma Confirmed).
- Next: foodpairing snacks `2n2pr8dng1` ↔ EN `xy53paori1` (RECIPES), Bavaria ↔ `pu9xfazps1`, foam/yeast/lady-guide/ingredients/blanche/milkshake peers, IBU RU-only.
