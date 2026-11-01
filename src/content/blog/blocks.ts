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
  /** Sanitized item HTML joined later; reserved until list import lands. */
  html: BlogInlineHtml;
};

export type BlogBlock =
  | BlogPrefaceBlock
  | BlogParagraphBlock
  | BlogHeadingBlock
  | BlogImageBlock
  | BlogQuoteBlock
  | BlogListBlock;

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
  cover: BlogArticleCover;
  blocks: BlogBlock[];
};
