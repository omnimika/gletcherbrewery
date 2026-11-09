# Текущее задание Cursor — M1 assortment matrix

Дата: **10.11.2026**.

## Done

- B1–B3 forms + staff triage
- M1-0 location staging rehearsal (synthetic)
- **M1-1 chain assortment:** Sheet CSV → PG → `/staff/map` checkboxes

## Staff map

```sh
npm run db:migrate
npm run retail:seed-assortment
# http://localhost:3000/staff/map
```

SKU map: catalog `/beer` names (см. `docs/data/RETAIL_IMPORT_CONTRACT.md`).
Tileset publish **не включён** (secret token в `.env.local` — только для будущего job).

## Следом

- Adapter catalog → tileset `Product` + controlled publish
- Store points CRM / link to chains
- M2 Airtable/loyalty

## Git

Commit/push по запросу. Не коммитить `.env.local` / sk tokens.
