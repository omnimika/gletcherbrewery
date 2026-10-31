/**
 * Client-safe catalog card filtering (no product body copy / PRODUCT_PROPS).
 */
import {
  sortAllViewOrder,
  sortByListingOrder,
} from "@/content/listing-order";
import type {
  ProductBadge,
  ProductCategory,
  ProductFilterId,
} from "@/content/products";

export type CatalogCard = {
  id: string;
  slug: string;
  title: string;
  category: ProductCategory;
  image: string;
  badges: ProductBadge[];
  outOfStock?: boolean;
  /** Locale-unprefixed pathname for next-intl Link, e.g. `/beer/ausweis` */
  href: string;
};

export function filterCatalogCards(
  cards: CatalogCard[],
  filter: ProductFilterId,
): CatalogCard[] {
  if (filter === "all") {
    return sortAllViewOrder(cards);
  }
  return sortByListingOrder(
    cards.filter((c) => c.category === filter),
  );
}
