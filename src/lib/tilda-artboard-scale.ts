/**
 * Catalog Zero Block `#rec802918687` — Confirmed breakpoints.
 * Prefer CSS (see product-gallery) for layout; helpers remain for docs/tests.
 *
 * | Screen | width% | bottles | artboard H | height_vh |
 * | 1400+  | 20     | 5       | 876        | 80        |
 * | 1200   | 25     | 4       | 700        | 80        |
 * | 960    | 25     | 4       | 630        | 100       |
 * | 640    | 33     | 3       | 520        | 50        |
 * | 480    | 50     | 2       | 500        | 50        |
 * | 320    | 100    | 1       | 596        | 70        |
 */

export const CATALOG_ARTBOARD_SCREENS = [
  320, 480, 640, 960, 1200, 1400,
] as const;

/** Item height as % of artboard (Observed heightunits=% height=85). */
export const CATALOG_ITEM_HEIGHT_RATIO = 0.85;

/** catalogItem top offset as fraction of artboard (Observed top≈105 @ 876). */
export const CATALOG_ITEM_TOP_RATIO = 105 / 876;

export type CatalogBreakpoint = {
  screen: (typeof CATALOG_ARTBOARD_SCREENS)[number];
  itemWidthPercent: number;
  visibleCount: number;
  artboardHeight: number;
  heightVh: number;
};

export const CATALOG_BREAKPOINTS: CatalogBreakpoint[] = [
  {
    screen: 320,
    itemWidthPercent: 100,
    visibleCount: 1,
    artboardHeight: 596,
    heightVh: 70,
  },
  {
    screen: 480,
    itemWidthPercent: 50,
    visibleCount: 2,
    artboardHeight: 500,
    heightVh: 50,
  },
  {
    screen: 640,
    itemWidthPercent: 33,
    visibleCount: 3,
    artboardHeight: 520,
    heightVh: 50,
  },
  {
    screen: 960,
    itemWidthPercent: 25,
    visibleCount: 4,
    artboardHeight: 630,
    heightVh: 100,
  },
  {
    screen: 1200,
    itemWidthPercent: 25,
    visibleCount: 4,
    artboardHeight: 700,
    heightVh: 80,
  },
  {
    screen: 1400,
    itemWidthPercent: 20,
    visibleCount: 5,
    artboardHeight: 876,
    heightVh: 80,
  },
];

export function matchArtboardScreen(windowWidth: number): number {
  let matched: number = CATALOG_ARTBOARD_SCREENS[0];
  for (const screen of CATALOG_ARTBOARD_SCREENS) {
    if (windowWidth >= screen) matched = screen;
  }
  return matched;
}

export function getCatalogBreakpoint(windowWidth: number): CatalogBreakpoint {
  const screen = matchArtboardScreen(windowWidth);
  return (
    CATALOG_BREAKPOINTS.find((b) => b.screen === screen) ??
    CATALOG_BREAKPOINTS[CATALOG_BREAKPOINTS.length - 1]!
  );
}
