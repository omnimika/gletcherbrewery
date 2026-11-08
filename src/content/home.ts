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
    | { kind: "local"; path: "/beer" | "/blog" | "/tours" | "/map" }
    /** Unprefixed absolute path (RU-only pages reachable from EN chrome). */
    | { kind: "absolute"; path: "/russian-craft-beer" | "/shop" }
    | { kind: "external"; key: ExternalNavKey };
};

export const HOME_FEATURES: HomeFeature[] = [
  {
    id: "map",
    titleKey: "featureMapTitle",
    bodyKey: "featureMapBody",
    ctaKey: "featureMapCta",
    href: { kind: "local", path: "/map" },
  },
  {
    id: "b2b",
    titleKey: "featureB2bTitle",
    bodyKey: "featureB2bBody",
    ctaKey: "featureB2bCta",
    href: { kind: "absolute", path: "/russian-craft-beer" },
  },
  {
    id: "shop",
    titleKey: "featureShopTitle",
    bodyKey: "featureShopBody",
    ctaKey: "featureShopCta",
    /** Absolute RU path — EN peer unpublished; avoid /en/shop 404. */
    href: { kind: "absolute", path: "/shop" },
  },
  {
    id: "tours",
    titleKey: "featureToursTitle",
    bodyKey: "featureToursBody",
    ctaKey: "featureToursCta",
    href: { kind: "local", path: "/tours" },
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
    href: "/blog/2026-10-14-homebrewing-craft-beer-history",
    date: "14.10",
  },
  {
    id: "beer-pizza",
    category: "НОВОСТИ",
    title: "9 октября — День пива и пиццы: идеальные сочетания от Gletcher",
    href: "/blog/2026-10-09-9-oktyabrya-den-piva-i-pitstsi-idealnie",
    date: "09.10",
  },
  {
    id: "barrel-aged",
    category: "БИБЛИОТЕКА",
    title: "Barrel-Aged Beer Day: День выдержанного в бочках пива",
    href: "/blog/2026-10-02-barrel-aged-beer-day-2026",
    date: "02.10",
  },
  {
    id: "afisha",
    category: "МЕРОПРИЯТИЯ",
    title: "Афиша Gletcher Brewery: WINEPARK, Поляна Пикник и Chicano Day",
    href: "/blog/2026-09-23-afisha-gletcher-brewery-winepark-polyana",
    date: "23.09",
  },
];

const BLOG_EN: HomeBlogTeaser[] = [
  {
    id: "beer-pizza-en",
    category: "NEWS",
    title:
      "October 9 — International Beer and Pizza Day: perfect pairings by Gletcher",
    href: "/blog/2026-10-09-october-9-international-beer-and-pizza-d",
  },
  {
    id: "moa-na",
    category: "LIBRARY",
    title: "Milk of Amnesia Non-Alcoholic",
    href: "/blog/2026-03-26-milk-of-amnesia-non-alcoholic",
  },
  {
    id: "aging",
    category: "LIBRARY",
    title: "Gletcher Aging: Aged to Perfection",
    href: "/blog/2026-01-22-gletcher-aging-aged-to-perfection",
  },
  {
    id: "tour",
    category: "NEWS",
    title: "Tour De Grapefruit: citrus wheat ale",
    href: "/blog/2025-02-07-tour-de-grapefruit-citrus-wheat-ale",
  },
];

/** Home blog teasers: locale-relative `/blog/{YYYY-MM-DD-descriptive}` slugs. */
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
