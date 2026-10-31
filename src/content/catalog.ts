/**
 * Unified catalog: one product entity (stable `id`) + per-locale translation.
 * Listing cards and detail pages both resolve from here.
 */
import {
  type AppLocale,
  type PublishedLocale,
  COPY_FALLBACK_CHAIN,
  DEFAULT_LOCALE,
  isPublishedLocale,
} from "@/i18n/locales";
import {
  CATALOG_PRODUCTS,
  type ProductBadge,
  type ProductCategory,
} from "@/content/products";
import {
  PRODUCT_PROPS,
  type ProductProps,
  type ProductSpecs,
} from "@/content/product-props";
import type { CatalogCard } from "@/content/catalog-filter";

export type { CatalogCard } from "@/content/catalog-filter";
export { filterCatalogCards } from "@/content/catalog-filter";

export type TranslationStatus = "published" | "draft" | "missing";

export type ProductTranslation = {
  locale: AppLocale;
  slug: string;
  /** Display / accessible title for this locale */
  title: string;
  status: TranslationStatus;
  taste?: string;
  about?: string;
  foodPairing?: string;
  fermentation?: string;
  /** Historical path segments that permanently redirect to `slug` for this locale */
  aliases?: string[];
};

export type CatalogProductRecord = {
  id: string;
  category: ProductCategory;
  image: string;
  badges: ProductBadge[];
  outOfStock?: boolean;
  specs: ProductSpecs;
  translations: Partial<Record<AppLocale, ProductTranslation>>;
};

const LISTING_BY_ID = new Map(
  CATALOG_PRODUCTS.map((p) => [p.slug, p] as const),
);

function translationStatus(locale: AppLocale, props: ProductProps): TranslationStatus {
  if (!isPublishedLocale(locale)) return "missing";
  const slug = props.slugs[locale];
  const taste = props.copy.taste[locale];
  const about = props.copy.about[locale];
  if (slug && taste && about) return "published";
  if (slug || taste || about) return "draft";
  return "missing";
}

function buildTranslation(
  locale: AppLocale,
  props: ProductProps,
): ProductTranslation | undefined {
  const slug = props.slugs[locale];
  if (!slug && !props.copy.taste[locale] && !props.copy.about[locale]) {
    return undefined;
  }
  return {
    locale,
    slug: slug ?? props.slugs.ru,
    title: props.title,
    status: translationStatus(locale, props),
    taste: props.copy.taste[locale],
    about: props.copy.about[locale],
    foodPairing: props.copy.foodPairing[locale],
    fermentation: props.copy.fermentation[locale],
  };
}

function toCategory(raw: ProductProps["category"]): ProductCategory {
  return raw.toLowerCase() as ProductCategory;
}

/** Full catalog records (source of truth for stage-4 product work). */
export const CATALOG: CatalogProductRecord[] = PRODUCT_PROPS.map((props) => {
  const listing = LISTING_BY_ID.get(props.id);
  const translations: CatalogProductRecord["translations"] = {};
  for (const locale of ["ru", "en"] as const) {
    const tr = buildTranslation(locale, props);
    if (tr) translations[locale] = tr;
  }
  return {
    id: props.id,
    category: listing?.category ?? toCategory(props.category),
    image: listing?.image ?? "",
    badges: (listing?.badges ??
      (props.badges.filter((b) => b === "new" || b === "alcofree") as ProductBadge[])),
    outOfStock: listing?.outOfStock,
    specs: props.specs,
    translations,
  };
});

export function getProductById(id: string): CatalogProductRecord | undefined {
  return CATALOG.find((p) => p.id === id);
}

/**
 * Resolve product by locale + slug (or alias). Prefer exact locale match;
 * also accepts any known slug to find the entity (for cross-locale redirects).
 */
export function resolveProduct(
  locale: AppLocale,
  slug: string,
): { product: CatalogProductRecord; matchedLocale: AppLocale } | undefined {
  for (const product of CATALOG) {
    const direct = product.translations[locale];
    if (
      direct &&
      (direct.slug === slug || direct.aliases?.includes(slug))
    ) {
      return { product, matchedLocale: locale };
    }
  }
  for (const product of CATALOG) {
    for (const [loc, tr] of Object.entries(product.translations) as [
      AppLocale,
      ProductTranslation,
    ][]) {
      if (tr.slug === slug || tr.aliases?.includes(slug)) {
        return { product, matchedLocale: loc };
      }
    }
  }
  return undefined;
}

export function isTranslationPublished(
  product: CatalogProductRecord,
  locale: AppLocale,
): boolean {
  return product.translations[locale]?.status === "published";
}

/**
 * Pathname without locale prefix (for next-intl `Link`).
 * Returns null when the translation is not published.
 */
export function productPathname(
  product: CatalogProductRecord,
  locale: PublishedLocale,
): string | null {
  const tr = product.translations[locale];
  if (!tr || tr.status !== "published") return null;
  return `/beer/${tr.slug}`;
}

/** Absolute public URL path including locale prefix when needed (SEO / hreflang). */
export function productPublicPath(
  product: CatalogProductRecord,
  locale: PublishedLocale,
): string | null {
  const pathname = productPathname(product, locale);
  if (!pathname) return null;
  if (locale === DEFAULT_LOCALE) return pathname;
  return `/${locale}${pathname}`;
}

export function pickCopy(
  product: CatalogProductRecord,
  locale: AppLocale,
  field: keyof Pick<
    ProductTranslation,
    "taste" | "about" | "foodPairing" | "fermentation" | "title"
  >,
): string {
  const primary = product.translations[locale]?.[field];
  if (primary) return primary;
  for (const fb of COPY_FALLBACK_CHAIN) {
    const v = product.translations[fb]?.[field];
    if (v) return v;
  }
  return "";
}

/** Locale-aware listing cards (only published translations). */
export function getCatalogCards(locale: PublishedLocale): CatalogCard[] {
  const cards: CatalogCard[] = [];
  for (const product of CATALOG) {
    if (!isTranslationPublished(product, locale)) continue;
    const href = productPathname(product, locale);
    const tr = product.translations[locale];
    if (!href || !tr) continue;
    cards.push({
      id: product.id,
      slug: tr.slug,
      title: tr.title,
      category: product.category,
      image: product.image,
      badges: product.badges,
      outOfStock: product.outOfStock,
      href,
    });
  }
  return cards;
}

/** hreflang peers for a product (published locales only). */
export function productAlternates(
  product: CatalogProductRecord,
): { locale: PublishedLocale; href: string }[] {
  const out: { locale: PublishedLocale; href: string }[] = [];
  for (const locale of ["ru", "en"] as const) {
    const href = productPublicPath(product, locale);
    if (href) out.push({ locale, href });
  }
  return out;
}
