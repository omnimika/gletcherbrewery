/**
 * Mapbox layer filters for `/map` retail points.
 * Empty `Product` pins are hidden (paused / zero-SKU chains after publish).
 */

export type MapFilterSpec =
  | string
  | number
  | boolean
  | null
  | MapFilterSpec[];

/** Non-empty Product property (comma-separated beer tokens). */
export const HAS_PRODUCT_FILTER: MapFilterSpec = [
  "!=",
  ["coalesce", ["get", "Product"], ""],
  "",
];

/**
 * Beer panel selection → Mapbox filter.
 * Always requires non-empty Product so zero-assortment stores stay hidden.
 */
export function buildMapProductFilter(
  selected: ReadonlySet<string>,
): MapFilterSpec {
  if (selected.size === 0) {
    return HAS_PRODUCT_FILTER;
  }
  const anyBeer: MapFilterSpec = [
    "any",
    ...[...selected].map(
      (beer) =>
        ["in", beer, ["coalesce", ["get", "Product"], ""]] as MapFilterSpec,
    ),
  ];
  return ["all", HAS_PRODUCT_FILTER, anyBeer];
}
