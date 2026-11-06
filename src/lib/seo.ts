import { PRODUCTION_ORIGIN } from "@/lib/site-links";

/**
 * Public indexing gate (Q3).
 * Preview/dev stay out of search indexes unless explicitly opted in.
 * Robots.txt is not access control — protect previews with auth/network separately.
 */
export function isPublicIndexingEnabled(): boolean {
  return process.env.ALLOW_SITE_INDEXING === "true";
}

/** Canonical site origin for sitemap/robots absolute URLs. */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return PRODUCTION_ORIGIN;
}
