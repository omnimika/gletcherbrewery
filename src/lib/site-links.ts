import type { PublishedLocale } from "@/i18n/locales";

/**
 * Temporary navigation for sections not yet migrated locally.
 * Points at confirmed production URLs (gletcherbrewery.com).
 * Do not invent EN peers for RU-only auth/legal pages.
 */
export const PRODUCTION_ORIGIN = "https://www.gletcherbrewery.com";

type ExternalNavKey =
  | "agent"
  | "partners"
  | "tours"
  | "map"
  | "blog"
  | "shop"
  | "b2b"
  | "login"
  | "signup"
  | "policy";

const RU_ONLY: ReadonlySet<ExternalNavKey> = new Set([
  "agent",
  "login",
  "signup",
  "policy",
  "b2b",
]);

const PATHS: Record<ExternalNavKey, { ru: string; en?: string }> = {
  agent: { ru: "/agent" },
  partners: { ru: "/partnership", en: "/en/partnership" },
  tours: { ru: "/tours", en: "/en/tours" },
  map: { ru: "/map", en: "/en/map" },
  blog: { ru: "/blog", en: "/en/blog" },
  shop: { ru: "/shop", en: "/en/shop" },
  /** Live EN home also links the RU B2B landing — keep until EN peer Confirmed. */
  b2b: { ru: "/russian-craft-beer" },
  login: { ru: "/members/login" },
  signup: { ru: "/members/signup" },
  policy: { ru: "/policy" },
};

/** Absolute production URL for a chrome/nav destination. */
export function productionHref(
  key: ExternalNavKey,
  locale: PublishedLocale,
): string {
  const paths = PATHS[key];
  if (locale === "en" && paths.en) {
    return `${PRODUCTION_ORIGIN}${paths.en}`;
  }
  // RU-only destinations stay on RU production even from EN chrome.
  return `${PRODUCTION_ORIGIN}${paths.ru}`;
}

export function isRuOnlyNav(key: ExternalNavKey): boolean {
  return RU_ONLY.has(key);
}

export type { ExternalNavKey };
