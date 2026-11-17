# Retail import & assortment — M1

Дата: **10.11.2026**.

Связано: [SOURCE_INVENTORY](SOURCE_INVENTORY.md), фронтенд-фильтр `Product`
в `src/components/map/sales-map.tsx`, каталог `/beer`.

## Два разных набора данных

| Набор | Что это | Status |
|---|---|---|
| **Chain assortment matrix** | Sheet «Карта»: сеть × сорта (TRUE/FALSE) | **Confirmed** CSV 10.11; staff UI `/staff/map` |
| **Store points / GeoJSON** | Точки с Adress/координатами → `app.retail_locations` + tileset | **Implemented** import 10.11; per-store SKU overrides Open |
| Frontend filter property | `Product` (singular) | **Confirmed** |
| Catalog slug → `Product` filter token | Adapter `product-tokens.ts` (Iron Woods, Tour De Grapefruit, …) | **Confirmed** (panel keys) |
| Tileset Product dry-run | CRM matrix → recipe + `retail_tileset_publish_runs` | **Implemented** (staff + CLI) |
| Tileset live upload | Uploads/MTS replace with sk token | **Proposed** — needs Confirmed `MAPBOX_TILESET_IDS` + allow flag |

## Sheet → catalog SKU map (Confirmed 10.11)

| Sheet column | Catalog `/beer` name | slug |
|---|---|---|
| Ausweis | Ausweis | `ausweis` |
| Blue Monkey | Blue Monkey | `blue-monkey` |
| Bowler IPA | Bowler IPA | `bowler-ipa` |
| Brainstorm 0% | Brainstorm | `brainstorm` |
| Friday Avenue APA | Friday Avenue | `friday-avenue-apa` |
| Heidegger Hell | Heidegger Hell | `heidegger-hell` |
| Iron Woods Stout | Iron Woods Dry Stout | `iron-woods-dry-stout` |
| Nut Butter | Nut Butter | `nut-butter` |
| Milk of Amnesia v. Tropic | Milk of Amnesia | `milk-of-amnesia-v-tropic` |
| Milk of Amnesia non-alcoholic | Milk of Amnesia non-alcoholic | `milk-of-amnesia-non-alco` |
| Rouge de Fleur | Rouge de Fleur | `rouge-de-fleur` |
| Ruby Road | Ruby Road | `ruby-road` |
| Underground Ale | Underground Ale | `underground-ale` |
| Hop Dragon | Hop Dragon | `hop-dragon` |
| Brut Grapefruit | Brut Grapefruit | `brut-grapefruit` |
| Tour De Grapefruit | Tour de Grapefruit | `tour-de-grapefruit` |
| CYNIC | CYNIC | `cynic` |
| _(not in Sheet)_ | Iron Woods Milk Stout | `iron-woods-milk-stout` (seeded FALSE) |

Код: `src/server/retail/sku-map.ts`. Fixture: `fixtures/retail/chain-assortment.csv`.

## Staff CRM

- `/staff` — заявки
- `/staff/map` — матрица чекбоксов → `app.retail_chains` + `app.retail_chain_products` + audit
- `/staff/map/locations` — точки магазинов → `app.retail_locations` (create/delete + GeoJSON sync; привязка к сети)
- NocoDB: SELECT on chains/products/locations; mutations via staff API only

```sh
npm run db:migrate
npm run retail:seed-assortment
npm run retail:import-locations   # GeoJSON layers → retail_locations
# open /staff/map and /staff/map/locations
```

**Assortment scope:** default Product on `/map` comes from the **chain** matrix.
Per-store overrides: `retail_locations.assortment_mode=override` +
`retail_location_products`. Staff UI: `/staff/map/locations/[id]`.
Dry-run / live Product patch applies overrides by `source_key`.

## Location staging (M1-0, still valid)

CSV/GeoJSON points → `retail_import_batches` / `retail_staging_rows`, anomaly report,
no auto-dedup. See earlier sections in git history / scripts `retail:import-rehearsal`.

## Product token map (filter keys)

| Catalog slug | Tileset / panel `Product` token |
|---|---|
| `friday-avenue-apa` | `Friday Avenue` |
| `iron-woods-dry-stout` | `Iron Woods` |
| `tour-de-grapefruit` | `Tour De Grapefruit` |
| `cynic` | `CYNIC` |
| … | full table in `src/server/retail/product-tokens.ts` |

OOS catalog SKUs never enter `Product`. Live publish is **not** triggered by checkbox saves.

## Mapbox tilesets (Confirmed 10.11)

Username: `omnicoremaps`. Style: `cknj3azmg0w2t17qqmylsfz8x`.
All 11 retail layers → tileset IDs: `src/server/retail/mapbox-tilesets.ts`.
Env: `MAPBOX_USERNAME` + `MAPBOX_TILESET_IDS` (local). Live allow flag stays
**false** until upload/replace adapter is wired and owner says go.

## Chain ↔ layer registry (Confirmed 10.11)

`src/server/retail/chain-layer-registry.ts` — CRM title → layer / source Titles.
Staff `/staff/map` groups: on-map · 0 SKU · CRM-only. Public `/map` hides
features with empty `Product` (paused zero-assortment after publish).
EuroSPAR (Калининград) uses distinct source Titles (unverified until dump
has them) so it no longer overwrites mainland EuroSPAR.

## Local point sources (tmp/mapbox-sources)

Manifest: `src/server/retail/source-manifest.ts`. Patch: `npm run retail:patch-product-sources`.
Perekrestok dump is provisional (`notgood`). Future **Proposed**: scrape retail
chain websites for fresh store geometries (owner) — separate from Product CRM.

### Ароматный Мир (Confirmed scrape 10.11)

- Source: `https://amwine.ru/customers/shops/` — all regions via
  `BX.ajax.runComponentAction('aero:shops.list','getStores')` per region code
  (`storeInitState.shops` alone is only the selected region, e.g. Moscow)
- GeoJSON: `tmp/mapbox-sources/aromatny-mir.geojson` (**969** points; 14 regions:
  Москва 559, СПб 344, Тверь 15, Воронеж 15, Обнинск 8, Ярославль 8, …)
- `Title`: `Ароматный Мир`; `Product` from CRM:
  `Blue Monkey, Brainstorm, Nut Butter, Milk of Amnesia`
- Re-scrape: `node scripts/scrape-amwine-shops.mjs` (Chrome; Qrator may block)
- Mapbox tileset **Confirmed**: `omnicoremaps.anvfhv5yjx32` (MTS source
  `702a7b27d2`, source-layer `lnuvqlbzpm6p33qh2h7y`, style layer `aromatny-mir`;
  republished 10.11 with full network)

### Ярче! (Confirmed Studio layer + points 10.11)

- Style layer `yarche` → tileset `omnicoremaps.2q5t7hvp`, source-layer
  `yarche` (not legacy `Yarchefinal-2d64rg`; fixed in style 10.11),
  sprite `yarche-sm`/`md`/`bg`
- Local dump: `tmp/mapbox-sources/yarche.geojson` from owner `Yarche_final_.csv`
  (**296** pts, `Title` = `Ярче!`)
- CRM chain **Ярче!**; Product on publish from matrix
  (`Ausweis, Heidegger Hell, Friday Avenue` after patch)

### Макси (Confirmed scrape 10.11)

- Source: `https://maxi.today/api/v1/shops` (site `https://maxi-retail.ru/`)
- GeoJSON: `tmp/mapbox-sources/maksi.geojson` (**73** points, 12 cities:
  Вологда 25, Череповец 14, Архангельск 10, Северодвинск 7, …)
- `Title`: `Макси`; `Product` from CRM:
  `Ausweis, Blue Monkey, Heidegger Hell, Nut Butter`
- Re-scrape: `npm run retail:scrape-maksi`
- Mapbox tileset **Confirmed**: `omnicoremaps.gletcher-maksi` (source-layer
  `maksi`, style layer `maksi` in composite; sprite `maksi-sm`/`md`/`bg`
  published in Studio 10.11)

### ХМЕЛЬ И СОЛОД (Confirmed scrape 10.11)

- Source: `https://xmel-solod.ru/adress` — Tilda `arMapMarkers*` (Yandex map pins)
- GeoJSON: `tmp/mapbox-sources/hmel-i-solod.geojson` (**86** map pins;
  page address list ~126 lines — unmatched addresses not auto-geocoded)
- `Title`: `ХМЕЛЬ И СОЛОД`; `Product` from fixture CRM:
  `Ausweis, Bowler IPA, Heidegger Hell, Nut Butter, Milk of Amnesia,
  Milk of Amnesia non-alcoholic, Rouge de Fleur`
- One source pin pair shares coordinates (Клин / Московский) — kept both, flagged
- Re-scrape: `npm run retail:scrape-hmel` (optional `--fetch`)
- Mapbox tileset **Confirmed**: `omnicoremaps.gletcher-hmel-i-solod`
  (source-layer `hmel-i-solod`, style layer `hmel-i-solod` as circle until
  Studio sprite `hmel-i-solod-sm`; logo at `public/staff/retail-logos/hmel-i-solod-sm.png`)

## Open / next

- Map/Mapbox CRM **Accepted 10.11** — retail map follow-ups only by request
- Gated Mapbox republish still requires `MAPBOX_ALLOW_TILESET_PUBLISH`
- **M2** Airtable/loyalty — current priority (`docs/CURSOR_NEXT_STEPS.md`)
