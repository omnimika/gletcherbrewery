import type { MetadataRoute } from "next";
import { listAllSitemapPaths } from "@/content/seo/public-routes";
import { getSiteOrigin, isPublicIndexingEnabled } from "@/lib/seo";

/**
 * Sitemap of published indexable public URLs only.
 * Empty when `ALLOW_SITE_INDEXING` is not `true` (preview/dev default).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublicIndexingEnabled()) {
    return [];
  }

  const origin = getSiteOrigin();
  return listAllSitemapPaths().map((path) => ({
    url: `${origin}${path === "/" ? "" : path}`,
    // lastModified omitted — fixtures lack reliable update timestamps for all entities
  }));
}
