# Текущее задание Cursor Agent

Дата: **01.11.2026**. DS-1, DS-2 и DS-3 срезы **contacts / home anchors /
partnership shell** выполнены.
Следующее: **DS-3 продолжение** — home window-stage exit / catalog/product —
**по одному**.
[Дизайн-код](design/DESIGN_SYSTEM.md), [ADR 0010](adr/0010-design-system-and-section-layout.md),
[серия](SPRINT_PLAN.md).

## DS-3 срез (этот запуск) — partnership shell

Shared `PartnershipPageView` покрывает `/partnership`, `/en/partnership`,
`/russian-craft-beer`.

- Manifest `partnership-sections.ts`: `#hero` `#pillars` `#materials` `#request`
- Условные секции: pillars/materials только если есть в copy
  (RU partnership — оба; russian-craft-beer — pillars; EN — materials + discount)
- `DocumentProximitySnap`, `SectionFrame`, `CardGrid`, `CompositionGrid` halves-x,
  `Reveal`, `LinkButton` для catalog CTA
- Контент/CTA/downloads/форма сохранены; якоря новые (не было публичных hash)
- Materials hover (ZB `751210595`): preview fade-in ~200ms + download CTA;
  ассеты `/partnership-{pricetag,Bierdeckel,brandbook,logo,bottleglass}.png`
  (каталог без превью — как на source)

Проверки: lint / tsc / build **PASS**; browser `/partnership#request`,
`/russian-craft-beer#request`, `/en/partnership#materials` + hover materials.

## Ранее в DS-3

- `/contacts` — полный shell (`#hero` `#details` `#form`)
- Home — только stable ids; snap / выход из HomeWindowStage отложены

## Следующий один template (выбрать)

1. **Home mid-blocks** — постепенно убрать `HomeWindowStage`, ввести SectionFrame
   без visual regression (самый рискованный).
2. Или **catalog `/beer` / product** — осторожный pass принятых шаблонов.

Не брать blog listing в том же запуске.

## Backlog

Sprint 5 remainder после DS-3: `/shopping-rules`, agent/tours/map/shop.
Commit/push только по запросу.
