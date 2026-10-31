import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, PUBLISHED_LOCALES } from "./locales";

/**
 * next-intl routing: RU unprefixed (`/beer`), other published locales prefixed (`/en/beer`).
 * `localeDetection: false` — language comes only from the URL (no Accept-Language / cookie redirects).
 */
export const routing = defineRouting({
  locales: [...PUBLISHED_LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
  localeDetection: false,
  alternateLinks: false,
});
