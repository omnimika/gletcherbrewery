/**
 * Catalog slug ↔ Mapbox feature property `Product` filter tokens.
 *
 * Public `/map` uses Mapbox expression:
 *   ['in', beerKey, ['coalesce', ['get', 'Product'], '']]
 * so tokens must match the RU panel keys in `src/content/map.ts`
 * (e.g. `Iron Woods`, `Tour De Grapefruit`) — not always catalog titles.
 *
 * Status: Confirmed for panel keys observed in production HTML (03.11).
 * Iron Woods Milk Stout / Ruby Road / Brut / Hop Dragon — tokens reserved
 * for CRM even if panel currently hides some thumbs.
 */

import { listingOrderIndex } from "@/content/listing-order";
import { isAssortmentSkuOutOfStock } from "@/server/retail/sku-map";

/** Stable map-filter / tileset `Product` substring for a catalog slug. */
export const CATALOG_SLUG_TO_PRODUCT_TOKEN: Readonly<Record<string, string>> = {
  ausweis: "Ausweis",
  "heidegger-hell": "Heidegger Hell",
  "rouge-de-fleur": "Rouge de Fleur",
  "blue-monkey": "Blue Monkey",
  "bowler-ipa": "Bowler IPA",
  brainstorm: "Brainstorm",
  "friday-avenue-apa": "Friday Avenue",
  "iron-woods-dry-stout": "Iron Woods",
  "iron-woods-milk-stout": "Iron Woods Milk Stout",
  "nut-butter": "Nut Butter",
  "milk-of-amnesia-v-tropic": "Milk of Amnesia",
  "milk-of-amnesia-non-alco": "Milk of Amnesia non-alcoholic",
  "underground-ale": "Underground Ale",
  "ruby-road": "Ruby Road",
  "hop-dragon": "Hop Dragon",
  "brut-grapefruit": "Brut Grapefruit",
  "tour-de-grapefruit": "Tour De Grapefruit",
  cynic: "CYNIC",
};

const TOKEN_TO_SLUG = new Map(
  Object.entries(CATALOG_SLUG_TO_PRODUCT_TOKEN).map(([slug, token]) => [
    token,
    slug,
  ]),
);

export function productTokenForSlug(productSlug: string): string | null {
  return CATALOG_SLUG_TO_PRODUCT_TOKEN[productSlug] ?? null;
}

export function catalogSlugForProductToken(token: string): string | null {
  return TOKEN_TO_SLUG.get(token) ?? null;
}

/**
 * Build tileset `Product` property from available catalog slugs.
 * OUT OF STOCK SKUs are omitted even if marked available in CRM.
 * Order follows catalog series rule (`listing-order.ts`).
 */
export function buildProductProperty(
  availableSlugs: Iterable<string>,
): string {
  const tokens = [...availableSlugs]
    .filter((slug) => !isAssortmentSkuOutOfStock(slug))
    .map((slug) => ({
      slug,
      token: productTokenForSlug(slug),
      order: listingOrderIndex(slug),
    }))
    .filter(
      (row): row is { slug: string; token: string; order: number } =>
        Boolean(row.token),
    )
    .sort((a, b) => a.order - b.order)
    .map((row) => row.token);

  // Dedupe while keeping order (defensive).
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const token of tokens) {
    if (seen.has(token)) continue;
    seen.add(token);
    unique.push(token);
  }
  return unique.join(", ");
}

/** Parse a legacy/current `Product` string into known catalog slugs. */
export function parseProductProperty(product: string): string[] {
  if (!product.trim()) return [];
  const found: string[] = [];
  const seen = new Set<string>();
  // Prefer longest token match to avoid "Milk of Amnesia" eating non-alco.
  const tokens = Object.values(CATALOG_SLUG_TO_PRODUCT_TOKEN).sort(
    (a, b) => b.length - a.length,
  );
  let rest = product;
  for (const token of tokens) {
    if (!rest.includes(token)) continue;
    const slug = catalogSlugForProductToken(token);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    found.push(slug);
    rest = rest.split(token).join(" ");
  }
  return found.sort((a, b) => listingOrderIndex(a) - listingOrderIndex(b));
}
