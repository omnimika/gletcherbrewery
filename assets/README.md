# Project assets

Организация материалов из `tmp/` (31.10.2026).

## Структура

- `brand/fonts/site-used` — шрифты, помеченные как используемые на сайте (ABC Gravity widths, Gratimo, WOFF).
- `brand/fonts/gratimo` / `brand/fonts/gravity` — семейства для веб/печати.
- `brand/logos` — логотипы main / simple / round (RGB/CMYK/Pantone).
- `catalog/bottles` — PNG бутылок формата `CATALOGUE__*` для `/beer`.
- `catalog/covers` — сортовые обложки.
- `catalog/logos` — сортовые лого (PNG/SVG).

## Осталось в `tmp/` намеренно

- `Gletcher-Brewery-Bottles-Images` (~599MB) — полный архив, включая Bierdeckel и неактуальные сорта; дублирует covers/logos.
- `Gletcher Brewery - ценники A5` (~287MB) — печатные ценники, не нужны для этапа эталона.
- Отдельные `glecther_*.png` — крупные рендеры; при необходимости перенести точечно.

Не коммитить trial-only шрифты в публичный репозиторий без проверки лицензии. См. `Gravity_License.pdf` и пометки Trial у ABC Gravity.
