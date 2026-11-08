# Blog category audit vs Tilda parts

> Дата: **01.11.2026**  
> Статус: **Confirmed** taxonomy; registry labels resynced

## Source

- RU feed `921152316206` / EN `370831704951` — `feeds_get_parts` + per-part `feeds_get_posts`.
- Implementation: `src/content/blog-categories.ts`.

## Corrections applied to migrated posts

| Was (wrong / coarse) | Now (Tilda) | Examples |
|---|---|---|
| `news` / НОВОСТИ for product stories | `releases` / РЕЛИЗЫ · RELEASES | Friday, MOA, Bowler, Cynic, Tour… |
| `library` for MOA NA / Tour | `releases` | `moa-na`, `tour-de-grapefruit` |
| `library` for cooking | `recipes` / ФУДПЕЙРИНГ / РЕЦЕПТЫ | Thai fries, tuna, salmon |
| `library` for Craft Depot | `interview` / ИНТЕРВЬЮ | `craft-depot-interview` |
| `events` for match-racing | `photo` / ФОТО / ВИДЕО | `match-racing` |
| `events` for moto photo report | `photo` (parts order) | `brainstorm-moto-fest-2023-report` |
| `events` for Klin 2024 invite | `news` (parts order) | `klin-may-fest-2024-invite` |
| Klin 2023 invite | `news` | `klin-may-fest-2023-invite` |
| EN chip `LIBRARY` | `GLOSSARY` | all EN library/glossary peers |
| EN Aging | `releases` / RELEASES | EN-only `aging` |

## Confirmed EN peers wired this pass

| id | RU UID | EN UID | EN chip |
|---|---|---|---|
| beer-acidity | `79g7nt4ny1` | `lj8oemius1` | GLOSSARY |
| craft-depot-interview | `inxody6ls1` | `c4olen1kd1` | INTERVIEW (EN `parts` empty) |
| pomor-craft-fest-2022 | `iyanfyplj1` | `dtxtl8kd91` | EVENTS |
| cheers-beers | `tfatlkslk1` | `poxg2fuvl1` | EVENTS |
| foodpairing-caramel | `p1og5o2691` | `mejto1lui1` | GLOSSARY (EN parts empty) |
| beer-sensation-aroma | `ozy0n3ypa1` | `ck3it9fx11` | GLOSSARY |
| smoked-malt | `pnenfyiyb1` | `d3vg4bzat1` | GLOSSARY |
| dry-hopping | `eajyz692l1` | `txpbxbiek1` | GLOSSARY |
| foodpairing-snacks | `2n2pr8dng1` | `xy53paori1` | RECIPES (EN parts recipes; entity `library`) |
| bavaria-brewing | `730oojkrr1` | `pu9xfazps1` | GLOSSARY |
| stout-talk | `0viy48tr71` | `e40oxvnn01` | GLOSSARY |
| beer-foam | `9y0d4gr0y1` | `ymfo0i2t71` | GLOSSARY |
| ale-or-lager | `gya48ze261` | `snfk1giyd1` | GLOSSARY |
| lady-beer-guide | `kcpdyda711` | `dou93nl341` | GLOSSARY |
| four-ingredients | `zg9u7nn2y1` | `okjzxv2gf1` | GLOSSARY |
| blanche-weizen | `d1knu5x0k1` | `japn2sfx71` | GLOSSARY |
| milkshake-ipa | `m7zvi7e051` | `i7nvy9f6m1` | GLOSSARY |

## Multi-part primary (Confirmed `parts` order)

| uid | parts order → primary |
|---|---|
| `8ionj8vgo1` | news, events → `news` |
| `en25lxya61` | photo, events → `photo` |
| `8imlu33eh1` | events, photo → `events` |
| `5vugn2kjy1` | photo only → `photo` |
| `tfatlkslk1` | events, photo, recipes → `events` |

## Open / not auto-paired

- RU `stout-guide` (`plfsxpk1n1`, 2024) ≠ EN `e40oxvnn01` «Let's talk about Stout» (2021) — different entities; 2021 pair is `stout-talk`.
- IBU `jbjnakk441` — RU-only (no Confirmed EN peer).
- `american-hops-1`, `beer-sensation-bitterness` — empty Tilda `parts`; kept `library` (**Proposed**).
- `halloween-contest-2021` — empty `parts`; Proposed `news`. `rauhbier-label` — empty `parts`; Proposed `library`/GLOSSARY.
- `anora-podcast-interview` — Tilda parts were **news**; owner override → `interview` (01.11.2026).
- EN 2021 releases (saison, pumking, coco…): no RU feed peers — EN-only.
- Expansion `yvr9000yd1` / EN `ebr5zugm31` — feed shells; body on `/blog/expansion`.
