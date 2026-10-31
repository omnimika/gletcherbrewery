/**
 * Single locale registry for routing, UI messages, and product content.
 * See docs/adr/0001-i18n-routing-and-content.md
 */

/** All language tags the product may eventually support. */
export const ALL_LOCALES = ["ru", "en", "sr", "hy", "ka", "de"] as const;

export type AppLocale = (typeof ALL_LOCALES)[number];

/**
 * Locales with published public URLs (sitemap, locale switcher, hreflang).
 * Only these appear in next-intl `routing.locales`.
 */
export const PUBLISHED_LOCALES = ["ru", "en"] as const satisfies readonly AppLocale[];

export type PublishedLocale = (typeof PUBLISHED_LOCALES)[number];

/** Locales reserved in the model but not routed until translation + fonts are ready. */
export const PLANNED_LOCALES = ["sr", "hy", "ka", "de"] as const satisfies readonly AppLocale[];

export const DEFAULT_LOCALE: PublishedLocale = "ru";

/**
 * Copy fallback chain when a string is missing for the active locale.
 * Does **not** imply the locale URL is published.
 */
export const COPY_FALLBACK_CHAIN: readonly AppLocale[] = ["en", "ru"];

/** BCP 47 / HTML `lang` values (script for Serbian is Open — reserved only). */
export const LOCALE_HTML_LANG: Record<AppLocale, string> = {
  ru: "ru",
  en: "en",
  /** Open: confirm `sr-Latn` vs `sr-Cyrl` vs both before publishing. */
  sr: "sr",
  hy: "hy",
  ka: "ka",
  de: "de",
};

export const LOCALE_LABEL: Record<AppLocale, string> = {
  ru: "RU",
  en: "EN",
  sr: "SR",
  hy: "HY",
  ka: "KA",
  de: "DE",
};

export function isAppLocale(value: string): value is AppLocale {
  return (ALL_LOCALES as readonly string[]).includes(value);
}

export function isPublishedLocale(value: string): value is PublishedLocale {
  return (PUBLISHED_LOCALES as readonly string[]).includes(value);
}
