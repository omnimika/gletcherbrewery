# Текущее задание Cursor — M1 Mapbox Product publish

Дата: **10.11.2026**.

## Приоритет владельца

Довести **карту + Mapbox CRM** до конца. **M2 Airtable/loyalty не начинать**,
пока retail map/CRM не закрыт.

## Done

- B1–B3 forms + staff triage
- M1-0 location staging rehearsal
- M1-1 chain assortment matrix `/staff/map`
- **M1-2a Product adapter + dry-run publish** (this pass)

## M1-2a — что есть

- Adapter catalog slug → tileset filter token (`Iron Woods`, `Tour De Grapefruit`, …):
  `src/server/retail/product-tokens.ts`
- Dry-run recipe Title→`Product` from PG matrix + audit table
  `app.retail_tileset_publish_runs`
- Staff UI: кнопка **Dry-run Product** на `/staff/map`
- CLI: `npm run retail:tileset-dry-run`
- Style source discovery (read-only pk): `npm run mapbox:inspect-style`

```sh
npm run db:migrate
npm run retail:seed-assortment   # if needed
npm run retail:tileset-dry-run
npm run mapbox:inspect-style     # needs NEXT_PUBLIC_MAPBOX_TOKEN
```

## Локальные источники точек (10.11)

`tmp/mapbox-sources/` — 11 слоёв (perekrestok = `perekrestok(notgood).csv`, provisional).
Patch CRM → `Product`:

```sh
npm run retail:patch-product-sources
# → tmp/mapbox-sources/staged/*.geojson
```

Live Mapbox upload всё ещё gated. Позже (Proposed): скрипт обхода сайтов сетей
для актуальных геометок магазинов — не блокирует текущий Product patch.

## Следом (карта / Mapbox CRM)

1. Проверить staged GeoJSON + unmatched Titles; поправить aliases при необходимости
2. Gated live republish (MTS replace / studio upload) после явного «можно live»
3. Store points CRM; scraper геометок сетей — отдельным этапом

`MAPBOX_ALLOW_TILESET_PUBLISH` = `false` до явного разрешения.

## Explicitly deferred

- M2 Airtable / «Агент Глетчер»
- Production tileset mutate without allow flag + confirmed IDs

## Git

Commit/push по запросу. Не коммитить `.env.local` / sk / pk tokens.
