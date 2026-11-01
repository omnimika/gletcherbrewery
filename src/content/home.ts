import type { PublishedLocale } from "@/i18n/locales";
import type { ExternalNavKey } from "@/lib/site-links";

/** Snapshot from production home 31.10.2026 — replace when blog CMS lands. */
export type HomeBlogTeaser = {
  id: string;
  category: string;
  title: string;
  href: string;
  date?: string;
};

export type HomeFeature = {
  id: string;
  titleKey: string;
  bodyKey: string;
  ctaKey: string;
  /** Local Next path or production nav key. */
  href:
    | { kind: "local"; path: "/beer" | "/blog" }
    | { kind: "external"; key: ExternalNavKey };
};

export const HOME_FEATURES: HomeFeature[] = [
  {
    id: "map",
    titleKey: "featureMapTitle",
    bodyKey: "featureMapBody",
    ctaKey: "featureMapCta",
    href: { kind: "external", key: "map" },
  },
  {
    id: "b2b",
    titleKey: "featureB2bTitle",
    bodyKey: "featureB2bBody",
    ctaKey: "featureB2bCta",
    href: { kind: "external", key: "b2b" },
  },
  {
    id: "shop",
    titleKey: "featureShopTitle",
    bodyKey: "featureShopBody",
    ctaKey: "featureShopCta",
    href: { kind: "external", key: "shop" },
  },
  {
    id: "tours",
    titleKey: "featureToursTitle",
    bodyKey: "featureToursBody",
    ctaKey: "featureToursCta",
    href: { kind: "external", key: "tours" },
  },
  {
    id: "catalog",
    titleKey: "featureCatalogTitle",
    bodyKey: "featureCatalogBody",
    ctaKey: "featureCatalogCta",
    href: { kind: "local", path: "/beer" },
  },
  {
    id: "blog",
    titleKey: "featureBlogTitle",
    bodyKey: "featureBlogBody",
    ctaKey: "featureBlogCta",
    href: { kind: "local", path: "/blog" },
  },
];

/**
 * RU teaser destinations Confirmed 01.11.2026 from published home
 * `https://www.gletcherbrewery.com/` (also in feed sitemap 921152316206).
 * Do not substitute listing `/blog` or guessed short slugs.
 */
const BLOG_RU: HomeBlogTeaser[] = [
  {
    id: "homebrew-day",
    category: "БИБЛИОТЕКА",
    title:
      "День легализации домашнего пивоварения: как homebrew изменил крафтовое пиво",
    href: "/blog-all/tpost/homebrewing-craft-beer-history",
    date: "14.10",
  },
  {
    id: "beer-pizza",
    category: "НОВОСТИ",
    title: "9 октября — День пива и пиццы: идеальные сочетания от Gletcher",
    href: "/blog-all/tpost/913cadd4f1-9-oktyabrya-den-piva-i-pitstsi-idealnie",
    date: "09.10",
  },
  {
    id: "barrel-aged",
    category: "БИБЛИОТЕКА",
    title: "Barrel-Aged Beer Day: День выдержанного в бочках пива",
    href: "https://www.gletcherbrewery.com/blog-all/tpost/barrel-aged-beer-day-2026",
    date: "02.10",
  },
  {
    id: "afisha",
    category: "МЕРОПРИЯТИЯ",
    title: "Афиша Gletcher Brewery: WINEPARK, Поляна Пикник и Chicano Day",
    href: "https://www.gletcherbrewery.com/blog-all/tpost/cf46mag0n1-afisha-gletcher-brewery-winepark-polyana",
    date: "23.09",
  },
];

const BLOG_EN: HomeBlogTeaser[] = [
  {
    id: "beer-pizza-en",
    category: "NEWS",
    title:
      "October 9 — International Beer and Pizza Day: perfect pairings by Gletcher",
    href: "/en/blog-all/tpost/5od5iaktd1-october-9-international-beer-and-pizza-d",
  },
  {
    id: "moa-na",
    category: "LIBRARY",
    title: "Milk of Amnesia non-alcoholic",
    href: "https://www.gletcherbrewery.com/en/blog-all/tpost/za6t88elj1-milk-of-amnesia-non-alcoholic",
  },
  {
    id: "aging",
    category: "LIBRARY",
    title: "Gletcher Aging: aged to perfection",
    href: "https://www.gletcherbrewery.com/en/blog-all/tpost/93l8iii9y1-gletcher-aging-aged-to-perfection",
  },
  {
    id: "tour",
    category: "NEWS",
    title: "Tour de Grapefruit: citrus wheat ale",
    href: "https://www.gletcherbrewery.com/en/blog-all/tpost/9i3ig0g2r1-tour-de-grapefruit-citrus-wheat-ale",
  },
];

/** Production tpost URLs for home teasers (RU Confirmed 01.11.2026; EN from live scrape). */
export function getHomeBlogTeasers(locale: PublishedLocale): HomeBlogTeaser[] {
  return locale === "en" ? BLOG_EN : BLOG_RU;
}

/**
 * Hero bottle loop — only delivery files under `public/vid/herobottle/`:
 * `bottle.webm` / `bottle.mp4` (opaque matte + runtime contour cut) and
 * `bottle-alpha.webm` (contour-cut VP9+alpha). Masters and encode scratch:
 * `.tmp/vid/herobottle/` (see README there).
 *
 * `NEXT_PUBLIC_HERO_BOTTLE_BASE` — future CDN / Object Storage prefix
 * (e.g. `https://files.gletcherbrewery.com/vid/herobottle`).
 */
const HERO_BOTTLE_BASE = (
  process.env.NEXT_PUBLIC_HERO_BOTTLE_BASE ?? "/vid/herobottle"
).replace(/\/$/, "");

export const HOME_BOTTLE_VIDEO = {
  /** VP9 + alpha (yuva420p) — exact bottle contour, no matte knockout. */
  webmAlpha: `${HERO_BOTTLE_BASE}/bottle-alpha.webm`,
  webm: `${HERO_BOTTLE_BASE}/bottle.webm`,
  mp4: `${HERO_BOTTLE_BASE}/bottle.mp4`,
} as const;
