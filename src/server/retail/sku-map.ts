/**
 * Sheet column headers → catalog `/beer` product slugs (owner Confirmed 10.11.2026).
 * Display / seed column order follows catalog series rule (listing-order.ts):
 * CLASSIC → CRAFT → LIMITED → AGING → OOS.
 * Map filter tokens / tileset `Product` adapter — separate later step.
 */

import { sortAllViewOrder } from "@/content/listing-order";
import { CATALOG_PRODUCTS } from "@/content/products";

export type SheetBeerColumn = {
  sheetHeader: string;
  productSlug: string;
  catalogName: string;
};

/** Columns present in the owner CSV export (excluding meta columns). */
export const SHEET_BEER_COLUMNS: readonly SheetBeerColumn[] = [
  { sheetHeader: "Ausweis", productSlug: "ausweis", catalogName: "Ausweis" },
  {
    sheetHeader: "Blue Monkey",
    productSlug: "blue-monkey",
    catalogName: "Blue Monkey",
  },
  {
    sheetHeader: "Bowler IPA",
    productSlug: "bowler-ipa",
    catalogName: "Bowler IPA",
  },
  {
    sheetHeader: "Brainstorm 0%",
    productSlug: "brainstorm",
    catalogName: "Brainstorm",
  },
  {
    sheetHeader: "Friday Avenue APA",
    productSlug: "friday-avenue-apa",
    catalogName: "Friday Avenue",
  },
  {
    sheetHeader: "Heidegger Hell",
    productSlug: "heidegger-hell",
    catalogName: "Heidegger Hell",
  },
  {
    sheetHeader: "Iron Woods Stout",
    productSlug: "iron-woods-dry-stout",
    catalogName: "Iron Woods Dry Stout",
  },
  {
    sheetHeader: "Nut Butter",
    productSlug: "nut-butter",
    catalogName: "Nut Butter",
  },
  {
    sheetHeader: "Milk of Amnesia v. Tropic",
    productSlug: "milk-of-amnesia-v-tropic",
    catalogName: "Milk of Amnesia",
  },
  {
    sheetHeader: "Milk of Amnesia non-alcoholic",
    productSlug: "milk-of-amnesia-non-alco",
    catalogName: "Milk of Amnesia non-alcoholic",
  },
  {
    sheetHeader: "Rouge de Fleur",
    productSlug: "rouge-de-fleur",
    catalogName: "Rouge de Fleur",
  },
  {
    sheetHeader: "Ruby Road",
    productSlug: "ruby-road",
    catalogName: "Ruby Road",
  },
  {
    sheetHeader: "Underground Ale",
    productSlug: "underground-ale",
    catalogName: "Underground Ale",
  },
  {
    sheetHeader: "Hop Dragon",
    productSlug: "hop-dragon",
    catalogName: "Hop Dragon",
  },
  {
    sheetHeader: "Brut Grapefruit",
    productSlug: "brut-grapefruit",
    catalogName: "Brut Grapefruit",
  },
  {
    sheetHeader: "Tour De Grapefruit",
    productSlug: "tour-de-grapefruit",
    catalogName: "Tour de Grapefruit",
  },
  { sheetHeader: "CYNIC", productSlug: "cynic", catalogName: "CYNIC" },
] as const;

/**
 * Catalog SKU in `/beer` but not a Sheet column — shown in staff matrix,
 * seeded FALSE until staff sets it.
 */
export const EXTRA_CATALOG_SKU: SheetBeerColumn = {
  sheetHeader: "(catalog) Iron Woods Milk Stout",
  productSlug: "iron-woods-milk-stout",
  catalogName: "Iron Woods Milk Stout",
};

const COLUMN_BY_SLUG = new Map<string, SheetBeerColumn>(
  [...SHEET_BEER_COLUMNS, EXTRA_CATALOG_SKU].map((c) => [c.productSlug, c]),
);

/** Staff matrix + seed column order = catalog series rule. */
export const ASSORTMENT_COLUMNS: readonly SheetBeerColumn[] = sortAllViewOrder(
  CATALOG_PRODUCTS.filter((p) => COLUMN_BY_SLUG.has(p.slug)).map((p) => ({
    id: p.slug,
    category: p.category,
    badges: p.badges,
    outOfStock: p.outOfStock,
    column: COLUMN_BY_SLUG.get(p.slug)!,
  })),
).map((row) => row.column);

export function parseSheetBool(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toUpperCase();
  return v === "TRUE" || v === "1" || v === "YES" || v === "ДА";
}

/** Catalog OUT OF STOCK / discontinued — not assignable on the sales map. */
export function isAssortmentSkuOutOfStock(productSlug: string): boolean {
  const product = CATALOG_PRODUCTS.find((p) => p.slug === productSlug);
  if (!product) return false;
  return Boolean(
    product.outOfStock || product.badges?.includes("discontinued"),
  );
}
