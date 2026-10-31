# Product props inventory — beer detail pages

> Дата: **31 октября 2026**  
> Источник: живые страницы `https://www.gletcherbrewery.com/beer/{slug}` и `/en/beer/{slug}`  
> Шаблон строки: Ausweis в `tmp/Gletcher beer categories and props.csv` (заполнен владельцем)  
> Артефакты: тот же CSV (заполнен), `docs/discovery/_raw/Gletcher_beer_categories_and_props.csv`, `product_props.json`, `product_props_scrape_report.json`  
> Код-фикстура: `src/content/product-props.ts`  
> i18n ADR: [`docs/adr/0001-i18n-routing-and-content.md`](../adr/0001-i18n-routing-and-content.md)

## 1. Поля (контракт)

| Поле | Локаль | Статус |
|---|---|---|
| `category` | — | Confirmed (owner groups CSV) |
| `title` | shared brand name | Confirmed |
| `url` | RU canonical | Confirmed |
| `badge` | — | Confirmed (`new` lime New!/Новинка!; `alcofree` sky 0% Alco / Безалкогольное 0%; `discontinued` red Out of Stock / Нет в наличии) |
| `abv`, `og`, `ibu` | shared (locale-invariant) | Confirmed from pages |
| `style`, `malts`, `hops` | shared; stored in **CapitalCase** (Title Case; `IPA`/`APA`/`EBC`/`R.I.S.` kept; camelCase brands e.g. `MelaBeech` preserved) | Confirmed |
| `bottleVol`, `kegVol` | shared | Confirmed; keg **absent** on Cynic & Hop Dragon pages |
| `fermentationRu` / `fermentationEn` | localized label | Confirmed |
| `taste*`, `about*`, `foodPairing*` | RU + EN | Confirmed (scraped); future `sr`/`hy`/`ka`/`de` empty until translated |

Ausweis row keeps owner wording (incl. historical `брожжение` typo and food-pairing order). Other rows = Observed from production HTML.

## 2. RU ↔ EN slug map — Confirmed

| RU | EN |
|---|---|
| `ausweis` | `ausweis` |
| `heidegger-hell` | `heidegger-hell` |
| `rouge-de-fleur` | `rouge-de-fleur` |
| `milk-of-amnesia-non-alco` | `milk-of-amnesia-non-alco` |
| `milk-of-amnesia-v-tropic` | `milk-of-amnesia` |
| `brainstorm` | `brainstorm-apa-alcohol-free` |
| `blue-monkey` | `blue-monkey` |
| `nut-butter` | `nut-butter` |
| `bowler-ipa` | `bowler-ipa` |
| `underground-ale` | `underground-ale` |
| `friday-avenue-apa` | `friday-avenue-apa` |
| `iron-woods-dry-stout` | `iron-woods-dry-stout` |
| `iron-woods-milk-stout` | `iron-woods-milk-stout` |
| `ruby-road` | `ruby-road` |
| `brut-grapefruit` | `brut-grapefruit` |
| `hop-dragon` | `hop-dragon` |
| `tour-de-grapefruit` | `tour-de-grapefruit` |
| `cynic` | `cynic` |

**Note:** sitemap historically listed alternate/legacy beer paths; this table is the live pair used for scrape (HTTP 200).

## 3. Coverage summary

- **18/18** products: RU + EN taste/about/specs filled.
- **Keg volume missing** on page (left blank): `cynic` (0,33 bottle only), `hop-dragon`.
- EN food-pairing sometimes shorter or differently worded than RU (Observed, e.g. MoA NA omits mold cheeses on EN; Brut EN lists `pie`).
- Production typos preserved as Observed (`dark chokolate`, `brauny`, `chic wings`, …) — editorial cleanup is **Open**, not silently corrected in the inventory.

## 4. Architecture for more languages

See ADR 0001. Practical rules for this dataset:

1. Keep shared **specs** once; localized prose and labels belong to translations. Preserve raw strings; normalize numeric values with confirmed units before locale-specific formatting.
2. Treat locale-keyed content as a logical API contract. JSON or `products` + `product_translations` are possible future persistence models; choose with the CMS/database ADR, not by adding parallel columns for every language now.
3. UI chrome (filters «ВСЕ», age gate, footer) is a separate message catalog, not product CSV columns.
4. Do not invent Serbian/Armenian/Georgian/German product text; mark status `Open` until translation brief + owner sign-off.

## 5. Implementation and remaining checks

- `src/content/catalog.ts` now supplies stable IDs, locale-aware resolution, listing projection and publication-aware paths. Current data has 18 published RU and 18 EN records; canonical round-trip checks passed in memory.
- `[locale]` routes, `src/proxy.ts`, registry and UI dictionaries are implemented. Planned locales do not have published product paths. Old criticism of the deprecated helper is not a current public-route failure.
- Finish permanent alias redirects, complete UI translation and ensure the client gallery does not import full product prose through the filtering module. See [current review](../reviews/2026-10-31-current-state.md).
- Owner review of CSV for editorial fixes before CMS import.
