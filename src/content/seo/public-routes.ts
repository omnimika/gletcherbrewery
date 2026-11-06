/**
 * Public route registry for Q3 sitemap/robots and stage-4 coverage.
 * Status tags: Confirmed (code + source), Proposed, Open.
 * Fallback locale destinations are not translation peers / hreflang.
 */

import { CATALOG, productPublicPath } from "@/content/catalog";
import { BLOG_POSTS, blogArticlePathname } from "@/content/blog";
import { getArticleBody } from "@/content/blog/articles";
import type { PublishedLocale } from "@/i18n/locales";

export type RouteDisposition =
  | "local"
  | "external"
  | "deferred"
  | "archive"
  | "exclude";

export type PublicRouteEntry = {
  id: string;
  /** Unprefixed RU path when local, or production path for external. */
  pathRu?: string;
  pathEn?: string;
  /** Eligible for sitemap when indexing enabled and disposition=local. */
  indexable: boolean;
  disposition: RouteDisposition;
  /** Confirmed | Proposed | Open */
  decision: "Confirmed" | "Proposed" | "Open";
  notes: string;
};

/**
 * Static public entities (excluding dynamic beer/blog article slugs).
 * RU-only pages omit pathEn — LocaleSwitch uses `{fallback}` elsewhere.
 */
export const STATIC_PUBLIC_ROUTES: readonly PublicRouteEntry[] = [
  {
    id: "home",
    pathRu: "/",
    pathEn: "/en",
    indexable: true,
    disposition: "local",
    decision: "Confirmed",
    notes: "Home stretch sections",
  },
  {
    id: "beer-listing",
    pathRu: "/beer",
    pathEn: "/en/beer",
    indexable: true,
    disposition: "local",
    decision: "Confirmed",
    notes: "Catalog listing",
  },
  {
    id: "blog-listing",
    pathRu: "/blog",
    pathEn: "/en/blog",
    indexable: true,
    disposition: "local",
    decision: "Confirmed",
    notes: "Local full feed UX; production /blog-all archive maps here via 308",
  },
  {
    id: "blog-all-listing",
    pathRu: "/blog-all",
    pathEn: "/en/blog-all",
    indexable: false,
    disposition: "local",
    decision: "Confirmed",
    notes:
      "Q3: permanentRedirect (HTTP 308) → /blog and /en/blog; articles stay under /blog-all/tpost/*",
  },
  {
    id: "partnership",
    pathRu: "/partnership",
    pathEn: "/en/partnership",
    indexable: true,
    disposition: "local",
    decision: "Confirmed",
    notes: "B2B",
  },
  {
    id: "tours",
    pathRu: "/tours",
    pathEn: "/en/tours",
    indexable: true,
    disposition: "local",
    decision: "Confirmed",
    notes: "YCLIENTS temporary; booking backend deferred",
  },
  {
    id: "map",
    pathRu: "/map",
    pathEn: "/en/map",
    indexable: true,
    disposition: "local",
    decision: "Confirmed",
    notes: "Mapbox frontend; CRM deferred",
  },
  {
    id: "agent",
    pathRu: "/agent",
    indexable: true,
    disposition: "local",
    decision: "Confirmed",
    notes: "RU-only landing; members ops on production",
  },
  {
    id: "shop",
    pathRu: "/shop",
    indexable: true,
    disposition: "local",
    decision: "Confirmed",
    notes: "RU-only; cart/checkout deferred",
  },
  {
    id: "contacts",
    pathRu: "/contacts",
    indexable: true,
    disposition: "local",
    decision: "Confirmed",
    notes: "RU-only; form submit unavailable until backend",
  },
  {
    id: "horeca",
    pathRu: "/horeca",
    indexable: true,
    disposition: "local",
    decision: "Confirmed",
    notes: "RU-only SEO landing",
  },
  {
    id: "russian-craft-beer",
    pathRu: "/russian-craft-beer",
    indexable: false,
    disposition: "local",
    decision: "Confirmed",
    notes: "RU-only noindex",
  },
  {
    id: "policy",
    pathRu: "/policy",
    indexable: true,
    disposition: "local",
    decision: "Confirmed",
    notes: "RU-only legal",
  },
  {
    id: "shopping-rules",
    pathRu: "/shopping-rules",
    indexable: true,
    disposition: "local",
    decision: "Confirmed",
    notes: "RU-only legal",
  },
  {
    id: "blog-expansion",
    pathRu: "/blog/expansion",
    indexable: true,
    disposition: "local",
    decision: "Confirmed",
    notes: "RU alias page",
  },
  {
    id: "vacancies",
    pathRu: "/vacancies",
    indexable: false,
    disposition: "local",
    decision: "Confirmed",
    notes: "RU alias, robots noindex",
  },
  {
    id: "dev-design-system",
    pathRu: "/dev/design-system",
    pathEn: "/en/dev/design-system",
    indexable: false,
    disposition: "exclude",
    decision: "Confirmed",
    notes: "Dev showcase; noindex; not in public sitemap",
  },
  {
    id: "about",
    pathRu: "/about",
    indexable: false,
    disposition: "deferred",
    decision: "Confirmed",
    notes:
      "A1 Confirmed: Tilda 71867465/project1212341 + animation; local route not yet shipped; indexing Open",
  },
  {
    id: "brainstorm-moto-fest-2023",
    pathRu: "/brainstorm-moto-fest-2023",
    indexable: false,
    disposition: "external",
    decision: "Open",
    notes: "Tilda 37060088; C1 candidate after fresh publication check",
  },
  {
    id: "10-years",
    pathRu: "/10-years",
    indexable: false,
    disposition: "archive",
    decision: "Open",
    notes: "Tilda 17960662 contest; archive vs current presentation Open",
  },
  {
    id: "klin-may-fest-2023",
    pathRu: "/klin-may-fest-2023",
    indexable: false,
    disposition: "exclude",
    decision: "Confirmed",
    notes: "Snapshot unpublished + password; do not publish from MCP access",
  },
  {
    id: "aging",
    pathRu: "/aging",
    pathEn: "/en/aging",
    indexable: false,
    disposition: "deferred",
    decision: "Open",
    notes: "In old inventory; local route absent; needs fresh published snapshot",
  },
  {
    id: "restaurant",
    pathRu: "/restaurant",
    indexable: false,
    disposition: "deferred",
    decision: "Open",
    notes: "local/external/archive decision Open",
  },
  {
    id: "members",
    pathRu: "/members",
    indexable: false,
    disposition: "external",
    decision: "Confirmed",
    notes: "Legacy auth/LK on production; stage 7",
  },
  {
    id: "tours-operations",
    pathRu: "/tours/check",
    indexable: false,
    disposition: "external",
    decision: "Open",
    notes: "/tours/check, /tours/preorder legacy ops; URL decision before cutover",
  },
] as const;

/** Absolute public paths for sitemap (locale-prefixed where needed). */
export function listIndexableStaticPaths(): string[] {
  const paths: string[] = [];
  for (const route of STATIC_PUBLIC_ROUTES) {
    if (!route.indexable || route.disposition !== "local") continue;
    if (route.pathRu) paths.push(route.pathRu);
    if (route.pathEn) paths.push(route.pathEn);
  }
  return paths;
}

/** Published product public paths (with locale prefix for EN). */
export function listIndexableProductPaths(): string[] {
  const paths: string[] = [];
  for (const product of CATALOG) {
    for (const locale of ["ru", "en"] as PublishedLocale[]) {
      const href = productPublicPath(product, locale);
      if (href) paths.push(href);
    }
  }
  return paths;
}

/** Local published article paths only (no production-only cards). */
export function listIndexableBlogArticlePaths(): string[] {
  const paths: string[] = [];
  for (const post of BLOG_POSTS) {
    for (const locale of ["ru", "en"] as PublishedLocale[]) {
      const t = post.translations[locale];
      if (!t || t.status !== "published" || !t.localSlug) continue;
      if (!getArticleBody(post.id, locale)) continue;
      paths.push(blogArticlePathname(t.localSlug, locale));
    }
  }
  return paths;
}

export function listAllSitemapPaths(): string[] {
  return [
    ...listIndexableStaticPaths(),
    ...listIndexableProductPaths(),
    ...listIndexableBlogArticlePaths(),
  ];
}
