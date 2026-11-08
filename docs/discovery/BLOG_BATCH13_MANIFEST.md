# Blog Batch 13 manifest

> Дата: **01.11.2026**  
> Статус: **Transferred**  
> Importer: `scripts/mcp-post-to-raw.mjs` + `scripts/run-batch13.mjs`  
> Report: `.tmp/blog/batch13-report.json`  
> Fixture naming: `YYYY-MM-DD-{id}-{locale}.json` + JSON `publishedAt` (`YYYY-MM-DD HH:mm`)

## Scope

| id | locale | Tilda UID | publishedAt | categoryId / label | peer | status |
|---|---|---|---|---|---|---|
| foodpairing-snacks | ru | `2n2pr8dng1` | `2021-07-14 10:42` | `library` / БИБЛИОТЕКА | EN `xy53paori1` | transferred |
| foodpairing-snacks | en | `xy53paori1` | `2021-07-14 10:42` | `library` / RECIPES (EN `parts` recipes) | RU peer | transferred |
| bavaria-brewing | ru | `730oojkrr1` | `2021-06-08 17:18` | `library` / БИБЛИОТЕКА | EN `pu9xfazps1` | transferred |
| bavaria-brewing | en | `pu9xfazps1` | `2021-06-08 18:53` | `library` / GLOSSARY | RU peer | transferred |
| stout-talk | ru | `0viy48tr71` | `2021-05-17 17:40` | `library` / БИБЛИОТЕКА | EN `e40oxvnn01` | transferred |
| stout-talk | en | `e40oxvnn01` | `2021-05-17 17:45` | `library` / GLOSSARY | RU peer (≠ stout-guide 2024) | transferred |
| beer-foam | ru | `9y0d4gr0y1` | `2021-04-23 10:00` | `library` / БИБЛИОТЕКА | EN `ymfo0i2t71` | transferred |
| beer-foam | en | `ymfo0i2t71` | `2021-04-23 15:43` | `library` / GLOSSARY | RU peer | transferred |
| ale-or-lager | ru | `gya48ze261` | `2021-03-20 16:17` | `library` / БИБЛИОТЕКА | EN `snfk1giyd1` | transferred |
| ale-or-lager | en | `snfk1giyd1` | `2021-03-20 16:24` | `library` / GLOSSARY | RU peer | transferred |
| lady-beer-guide | ru | `kcpdyda711` | `2021-03-02 18:38` | `library` / БИБЛИОТЕКА | EN `dou93nl341` | transferred |
| lady-beer-guide | en | `dou93nl341` | `2021-03-02 18:44` | `library` / GLOSSARY | RU peer | transferred |
| four-ingredients | ru | `zg9u7nn2y1` | `2021-02-19 17:29` | `library` / БИБЛИОТЕКА | EN `okjzxv2gf1` | transferred |
| four-ingredients | en | `okjzxv2gf1` | `2021-02-19 18:58` | `library` / GLOSSARY | RU peer | transferred |
| blanche-weizen | ru | `d1knu5x0k1` | `2021-02-09 14:15` | `library` / БИБЛИОТЕКА | EN `japn2sfx71` | transferred |
| blanche-weizen | en | `japn2sfx71` | `2021-02-09 14:55` | `library` / GLOSSARY | RU peer | transferred |
| milkshake-ipa | ru | `m7zvi7e051` | `2021-01-22 18:29` | `library` / БИБЛИОТЕКА | EN `i7nvy9f6m1` | transferred |
| milkshake-ipa | en | `i7nvy9f6m1` | `2021-01-22 18:29` | `library` / GLOSSARY | RU peer | transferred |
| ibu | ru | `jbjnakk441` | `2021-01-12 15:53` | `library` / БИБЛИОТЕКА | RU-only | transferred |

## Counts

| Metric | Value |
|---|---|
| Locale-bodies | 19 (10 RU + 9 EN) |
| Confirmed EN peers | 9 |
| Fake peers | 0 |

## Notes

- Snacks: RU primary part is **БИБЛИОТЕКА**; EN peer is in **RECIPES** → entity `categoryId: library`, EN chip `RECIPES`.
- `stout-talk` (`0viy48tr71` / `e40oxvnn01`, 2021) is **not** Batch 8 `stout-guide` (`plfsxpk1n1`, 2024).
- IBU has no Confirmed EN peer.
- Vacancies skipped; no fabricated peers.
- Next: remaining 2021 / earlier library & news posts per sitemap (Batch 14+).
