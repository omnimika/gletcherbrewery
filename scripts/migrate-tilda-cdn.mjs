/**
 * Deprecated. Local CDN dump under public/media/tilda was reorganized into:
 *   public/products/{slug}/
 *   public/blog/{article-slug}/
 *   public/pages/{section}/
 *
 * Use: node scripts/reorganize-public-media.mjs [--dry-run]
 * Mapping: public/MEDIA_MAP.json
 */
console.error(
  "migrate-tilda-cdn.mjs is retired. Run scripts/reorganize-public-media.mjs instead.",
);
process.exit(1);
