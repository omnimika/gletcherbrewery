# Tilda `/beer` catalog slider — Confirmed (31.10.2026)

Источник: редактор Tilda page `16494049` / project `1212341` (после логина владельца).

> Это записанный Cursor source audit; повторное ревью Codex не выполняло live
> MCP-запросов. По [workflow](TILDA_MCP_WORKFLOW.md) сверить editor/published,
> формулу итоговой высоты/масштабирования и колонки около 1200px, где второй
> Tilda-аудит расходится с этим. Приведённое «Следствие для Next.js» не означает,
> что текущий код уже выполняет контракт: см. [ревью](../reviews/2026-10-31-follow-up.md).

## Архитектура (не один React-слайдер)

Два HTML-виджета **NOLIM**:

### NLM113 — табы категорий

Кнопки с классами `btn-catalog-all|classic|craft|limited` **переключают видимость целых Zero Block `#rec…`**, а не фильтруют единый массив карточек.

| Кнопка | Блоки `idBlocksToView` |
|---|---|
| ALL / all | `#rec806404794`, `#rec802918687` |
| CLASSIC | `#rec806405248`, `#rec789496632` |
| CRAFT | `#rec806405444`, `#rec789496923` |
| LIMITED | `#rec806405560`, `#rec789497080`, `#rec1246811806`, `#rec1246830471`, `#rec1246822696`, `#rec1257447161` |

Active styles: bg `#0c0e45`, font `#ffffff`.

В редакторе подпись первой кнопки — **«ВСЕ»**; на опубликованном сайте Observed ранее как **ALL** — сверить при приёмке.

### NLM127 — горизонтальный сдвиг

```json
{
  "blockId": "#rec802918687",
  "elemClass": "catalogItem",
  "addShift": { "shift480px": "320", "shift640px": "320", "shift960px": "320", "shift1200px": "320", "shiftMax": "320" },
  "arrowOn": "1",
  "leftArrowClass": "leftArrowCat",
  "rightArrowClass": "rightArrowCat",
  "moveOnPress": "1",
  "moveDirection": "1"
}
```

- Сдвиг **320px** на всех брейкпоинтах.
- Стрелки — отдельные shape-элементы Zero Block (`leftArrowCat` / `rightArrowCat`).
- Элементы карусели: класс `catalogItem` внутри целевого `#rec…`.
- `moveOnPress` — перетаскивание/press-move (**Confirmed** в settings).

## Artboard scale — Confirmed

Блок сортов `#rec802918687`:

- `data-artboard-upscale=window` (не `grid`)
- `data-artboard-valign=stretch`
- `data-artboard-screens=320,480,640,960,1200,1400`
- Desktop: `height=876`, `height_vh=80`
- `catalogItem` height ≈ **85%** artboard; width% → число бутылок

| Screen | Item width% | Бутылок | Artboard H | height_vh |
|---:|---:|---:|---:|---:|
| 1400+ | 20 | 5 | 876 | 80 |
| 1200 | 25 | 4 | 700 | 80 |
| 960 | 25 | 4 | 630 | 100 |
| 640 | 33 | 3 | 520 | 50 |
| 480 | 50 | 2 | 500 | 50 |
| 320 | 100 | 1 | 596 | 70 |

Scale: `windowWidth / matchedScreen`. Stage height: `max(H×scale, vh%×windowHeight)`.  
Next: `src/lib/tilda-artboard-scale.ts` + `ProductGallery`.

## Категории — Confirmed (owner CSV)

`tmp/Gletcher beer groups.csv` → `src/content/products.ts`:

| Group | Сорта |
|---|---|
| CLASSIC | Ausweis, Heidegger Hell, Rouge de Fleur |
| CRAFT | MoA NA, MoA, Brainstorm, Blue Monkey, Nut Butter, Bowler, Underground, Friday Avenue, Iron Woods Dry/Milk, Ruby Road |
| LIMITED | Brut Grapefruit, Hop Dragon, Tour de Grapefruit |
| AGING | CYNIC |

UI-фильтры Next: ALL / CLASSIC / CRAFT / LIMITED / AGING.
(На Tilda production chip AGING пока может отсутствовать; владелец подтвердил AGING, не AGED.)

## Следствие для Next.js

- Клиентский filter по fixture — замена NLM113.
- Слайдер: full-bleed + window-upscale размеры + стрелки ±320×scale.
- Badges: `new`, `alcofree` из CSV.
