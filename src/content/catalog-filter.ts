/**
 * Client-safe catalog card filtering (no product body copy / PRODUCT_PROPS).
 */
import {
  productsForAllView,
  type ProductBadge,
  type ProductCategory,
  type ProductFilterId,
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
    const asListing = cards.map((c) => ({
      slug: c.slug,
      name: c.title,
      title: c.title,
      category: c.category,
      image: c.image,
      badges: c.badges,
      outOfStock: c.outOfStock,
    }));
    const ordered = productsForAllView(asListing);
    const bySlug = new Map(cards.map((c) => [c.slug, c]));
    return ordered
      .map((p) => bySlug.get(p.slug))
      .filter((c): c is CatalogCard => Boolean(c));
  }
  return cards.filter((c) => c.category === filter);
}
