# Blog Batch 14 manifest

> Дата: **01.11.2026**  
> Статус: **Transferred**  
> Importer: `scripts/mcp-post-to-raw.mjs` + `scripts/run-batch14.mjs`  
> Report: `.tmp/blog/batch14-report.json`  
> Fixture naming: `YYYY-MM-DD-{id}-{locale}.json` + JSON `publishedAt` (`YYYY-MM-DD HH:mm`)

## Scope

| id | locale | Tilda UID | publishedAt | categoryId / label | peer | status |
|---|---|---|---|---|---|---|
| saison | en | `yuhkvdcho1` | `2021-12-07 16:16` | `releases` / RELEASES | EN-only | transferred |
| halloween-contest-2021 | ru | `l52cympd71` | `2021-10-26 11:04` | `news` / НОВОСТИ (parts empty, Proposed) | RU-only | transferred |
| pumking-ale | en | `a8p7c969z1` | `2021-10-19 16:57` | `releases` / RELEASES (parts releases,news) | EN-only | transferred |
| vasiliy-klin-interview | ru | `hsri3ayv41` | `2021-08-27 14:26` | `interview` / ИНТЕРВЬЮ | RU-only | transferred-with-deferred (YouTube) |
| yammy-jammy | en | `ffcmeohs71` | `2021-06-17 19:01` | `releases` / RELEASES | EN-only | transferred |
| rauhbier-label | en | `exvllok0p1` | `2021-06-08 19:23` | `library` / GLOSSARY (parts empty, Proposed) | EN-only | transferred |
| rauchbier | en | `2jevneeme1` | `2021-05-20 15:53` | `releases` / RELEASES | EN-only | transferred |
| oatmeal-stout | en | `775ra77481` | `2021-05-19 16:53` | `releases` / RELEASES | EN-only | transferred |
| klin-may-fest-2021-postpone | ru | `0kau2y5h91` | `2021-05-13 12:09` | `events` / МЕРОПРИЯТИЯ | RU-only | transferred |
| extra-virgin | en | `yuxd3l55l1` | `2021-03-18 16:48` | `releases` / RELEASES | EN-only | transferred |
| coco-jungle | en | `d4xo37du81` | `2021-02-26 19:09` | `releases` / RELEASES | EN-only | transferred |
| people-in-beer-anora | ru | `5vvkbd3bd1` | `2021-01-19 16:12` | `interview` / ИНТЕРВЬЮ | RU-only | transferred |
| bowler-ipa-not-apa | ru | `323zbj0y71` | `2020-12-22 16:23` | `news` / НОВОСТИ | RU-only | transferred |
| cooking-beef-nut-butter | ru | `902x4oy5k1` | `2020-12-18 14:06` | `recipes` / ФУДПЕЙРИНГ / РЕЦЕПТЫ | RU-only | transferred |
| anora-podcast-interview | ru | `f52uygiau1` | `2020-12-11 21:44` | `interview` / ИНТЕРВЬЮ (owner override; Tilda parts were news) | RU-only | transferred-with-deferred (YouTube) |
| gzhanets-rouge | ru | `6ku96l8541` | `2020-12-04 14:07` | `recipes` / ФУДПЕЙРИНГ / РЕЦЕПТЫ | RU-only | transferred |

## Counts

| Metric | Value |
|---|---|
| Locale-bodies | 16 (8 RU + 8 EN) |
| Confirmed EN peers (pairs) | 0 |
| Fake peers | 0 |
| Deferred YouTube embeds | 2 (`vasiliy-klin-interview`, `anora-podcast-interview`) |

## Notes

- Closes remaining **sitemap feed** locs (`921152316206` / `370831704951`) for tpost URLs discovered in discovery dumps.
- EN 2021 product releases had no RU feed peers — kept EN-only; no fabricated pairs.
- Anora podcast sits in Tilda **news** part (not interview).
- Klin postpone: `parts` events,news → primary **events**.
- Pumking: `parts` releases,news → primary **releases**.
- YouTube iframes deferred until video renderer (ADR / sprint later).
- Feed still reports more posts than sitemap (`totalPostInFeed` RU 141 / EN 44); non-sitemap / unpublished / alias pages out of this batch.

## Next

Inventory non-sitemap feed posts + `/blog/*` alias pages (e.g. expansion) if owner wants full 141/44 coverage; otherwise Stage 4 public templates / CMS.
