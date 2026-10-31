/**
 * Baseline strip order by stable product `id` (MCP artboard `left`).
 *
 * Provenance (2026-10-31): Tilda MCP `get_zero_block`
 * project `1212341`, page `16494049`, record `802918687` (ALL carousel).
 *
 * ALL tab presentation (owner Confirmed): NEW first, out-of-stock last;
 * within each bucket keep this baseline order.
 */
export const LISTING_DISPLAY_ORDER = [
  "cynic",
  "milk-of-amnesia-non-alco",
  "milk-of-amnesia-v-tropic",
  "blue-monkey",
  "nut-butter",
  "bowler-ipa",
  "friday-avenue-apa",
  "iron-woods-dry-stout",
  "brainstorm",
  "ruby-road",
  "underground-ale",
  "iron-woods-milk-stout",
  "tour-de-grapefruit",
  "heidegger-hell",
  "ausweis",
  "rouge-de-fleur",
  "hop-dragon",
  "brut-grapefruit",
] as const;

export type ListingProductId = (typeof LISTING_DISPLAY_ORDER)[number];

const ORDER_INDEX = new Map<string, number>(
  LISTING_DISPLAY_ORDER.map((id, index) => [id, index]),
);

/** Stable sort key; unknown ids sort after known ones. */
export function listingOrderIndex(id: string): number {
  return ORDER_INDEX.get(id) ?? LISTING_DISPLAY_ORDER.length + 1;
}

type SortableCard = {
  id: string;
  badges?: readonly string[];
  outOfStock?: boolean;
};

function isNew(item: SortableCard): boolean {
  return Boolean(item.badges?.includes("new"));
}

function isOutOfStock(item: SortableCard): boolean {
  return Boolean(
    item.outOfStock || item.badges?.includes("discontinued"),
  );
}

/**
 * ALL view: 1) NEW (in stock) → 2) remaining in stock → 3) out of stock.
 * Relative order inside each group follows `LISTING_DISPLAY_ORDER`.
 */
export function sortAllViewOrder<T extends SortableCard>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const rank = (item: SortableCard) => {
      if (isOutOfStock(item)) return 2;
      if (isNew(item)) return 0;
      return 1;
    };
    const byRank = rank(a) - rank(b);
    if (byRank !== 0) return byRank;
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
