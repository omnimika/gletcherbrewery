/**
 * Typed blog body blocks — Tilda feed redactor ↔ future Puck components.
 * See docs/adr/0005-cms.md and docs/discovery/BLOG_CONTENT_CONTRACT.md.
 */

export type BlogInlineHtml = string;

export type BlogPrefaceBlock = {
  type: "preface";
  html: BlogInlineHtml;
};

export type BlogParagraphBlock = {
  type: "paragraph";
  html: BlogInlineHtml;
};

export type BlogHeadingBlock = {
  type: "heading";
  level: 2 | 3 | 4;
  html: BlogInlineHtml;
};

export type BlogImageBlock = {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
  width?: number | null;
  height?: number | null;
  href?: string | null;
};

export type BlogQuoteBlock = {
  type: "quote";
  html: BlogInlineHtml;
};

export type BlogListBlock = {
  type: "list";
  style: "ul" | "ol";
  /** Allowlisted `<ul|ol><li>…</li></ul|ol>`; item interiors are inline-only. */
  html: BlogInlineHtml;
};

/**
 * YouTube embed only (allowlisted provider).
 * `videoId` is the 11-char YouTube id — never a free-form iframe URL.
 */
export type BlogVideoBlock = {
  type: "video";
  provider: "youtube";
  videoId: string;
  title?: string;
};

export type BlogBlock =
  | BlogPrefaceBlock
  | BlogParagraphBlock
  | BlogHeadingBlock
  | BlogImageBlock
  | BlogQuoteBlock
  | BlogListBlock
  | BlogVideoBlock;

export type BlogArticleCover = {
  src: string;
  alt: string;
};

export type BlogArticleBody = {
  id: string;
  locale: string;
  slug: string;
  title: string;
  description: string;
  /**
   * Editorial post datetime from Tilda `date` (Europe/Moscow).
   * Format: `YYYY-MM-DD HH:mm`. Filename prefix uses the calendar date.
   */
  publishedAt: string;
  cover: BlogArticleCover;
  blocks: BlogBlock[];
};
