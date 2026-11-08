import type { MetadataRoute } from "next";
import { getSiteOrigin, isPublicIndexingEnabled } from "@/lib/seo";

/**
 * Robots is not access control. Preview hosts must stay protected separately.
 * When indexing is disabled, disallow all and omit sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  if (!isPublicIndexingEnabled()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dev/", "/members/"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
