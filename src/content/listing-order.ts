/**
 * Catalog strip order by series, then baseline id order.
 *
 * Owner Confirmed (2026-11-10) ALL / staff matrix order:
 * 1) CLASSIC → 2) CRAFT → 3) LIMITED → 4) AGING →
 * 5) any SKU marked НЕТ В НАЛИЧИИ / OUT OF STOCK (any series).
 *
 * Relative order inside a bucket follows `LISTING_DISPLAY_ORDER`
 * (MCP artboard baseline, reordered to series groups).
 *
 * Category label is AGING (not AGED).
 */
import type { ProductCategory } from "@/content/products";

export const LISTING_DISPLAY_ORDER = [
  // CLASSIC
  "ausweis",
  "heidegger-hell",
  "rouge-de-fleur",
  // CRAFT (in-stock first in products fixture; OOS milk stout listed with OOS)
  "milk-of-amnesia-non-alco",
  "milk-of-amnesia-v-tropic",
  "brainstorm",
  "blue-monkey",
  "nut-butter",
  "bowler-ipa",
  "underground-ale",
  "friday-avenue-apa",
  "iron-woods-dry-stout",
  "ruby-road",
  // LIMITED (in-stock)
  "tour-de-grapefruit",
  // AGING
  "cynic",
  // OUT OF STOCK (any series) — last bucket
  "iron-woods-milk-stout",
  "hop-dragon",
  "brut-grapefruit",
] as const;

export type ListingProductId = (typeof LISTING_DISPLAY_ORDER)[number];

const ORDER_INDEX = new Map<string, number>(
  LISTING_DISPLAY_ORDER.map((id, index) => [id, index]),
);

/** Series rank for in-stock rows (OOS sorted separately). */
export const CATEGORY_SERIES_RANK: Record<ProductCategory, number> = {
  classic: 0,
  craft: 1,
  limited: 2,
  aging: 3,
};

/** Stable sort key; unknown ids sort after known ones. */
export function listingOrderIndex(id: string): number {
  return ORDER_INDEX.get(id) ?? LISTING_DISPLAY_ORDER.length + 1;
}

type SortableCard = {
  id: string;
  category?: ProductCategory;
  badges?: readonly string[];
  outOfStock?: boolean;
};

function isOutOfStock(item: SortableCard): boolean {
  return Boolean(
    item.outOfStock || item.badges?.includes("discontinued"),
  );
}

function seriesRank(item: SortableCard): number {
  if (!item.category) return CATEGORY_SERIES_RANK.craft;
  return CATEGORY_SERIES_RANK[item.category] ?? 9;
}

/**
 * ALL view / staff matrix columns:
 * CLASSIC → CRAFT → LIMITED → AGING (in stock), then OOS last.
 * Relative order inside each group follows `LISTING_DISPLAY_ORDER`.
 */
export function sortAllViewOrder<T extends SortableCard>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aOos = isOutOfStock(a);
    const bOos = isOutOfStock(b);
    if (aOos !== bOos) return aOos ? 1 : -1;
    if (!aOos) {
      const bySeries = seriesRank(a) - seriesRank(b);
      if (bySeries !== 0) return bySeries;
    }
    return listingOrderIndex(a.id) - listingOrderIndex(b.id);
  });
}

/** Category strips: baseline order, out of stock always last. */
export function sortByListingOrder<T extends SortableCard>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aOos = isOutOfStock(a) ? 1 : 0;
    const bOos = isOutOfStock(b) ? 1 : 0;
    if (aOos !== bOos) return aOos - bOos;
    return listingOrderIndex(a.id) - listingOrderIndex(b.id);
  });
}
