#!/usr/bin/env node
/**
 * Reproducible Tilda feed editor JSON → BlogArticleBody fixture.
 *
 * Usage:
 *   node scripts/tilda-blog-import.mjs \
 *     --in .tmp/blog/raw/ld2ni67l11.json \
 *     --id barrel-aged \
 *     --locale ru \
 *     --out barrel-aged-ru.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ARTICLES_DIR = join(ROOT, "src/content/blog/articles");

const ALLOWED = new Set(["strong", "b", "em", "i", "br", "a"]);

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    out[key.slice(2)] = argv[i + 1];
    i += 1;
  }
  return out;
}

/** One-layer HTML entity decode for Tilda feed `text` / descr. */
export function decodeEntities(s) {
  return String(s)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    // Tilda feed editor sometimes emits literal `#nbsp;` instead of `&nbsp;`.
    .replace(/#nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&deg;/g, "°")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) =>
      String.fromCharCode(parseInt(n, 16)),
    )
    .replace(/&amp;/g, "&");
}

/** Known production → local catalog slug fixes (Confirmed catalog). */
const BEER_HREF_FIXES = {
  "/beer/friday-avenue-apa": "/beer/friday-avenue-apa",
  "/beer/brainstorm-apa-alcohol-free": "/beer/brainstorm",
  "/beer/milk-of-amnesia-v-tropic": "/beer/milk-of-amnesia-v-tropic",
};

/** Extract 11-char YouTube id from embed/watch/youtu.be URL; else null. */
export function youtubeIdFromSrc(src) {
  const s = String(src || "").trim();
  if (!s) return null;
  const m =
    s.match(
      /(?:youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/,
    ) || s.match(/^([A-Za-z0-9_-]{11})$/);
  return m ? m[1] : null;
}

function rewriteHref(href) {
  if (!href) return "";
  let h = decodeEntities(href).trim();
  h = h.replace(/^https?:\/\/(www\.)?gletcherbrewery\.com/i, "");
  h = h.replace(/^https?:\/\/feeds\.tilda\.ru/i, "");
  if (h === "gletcherbrewery.com" || h === "www.gletcherbrewery.com") return "/";
  if (h.startsWith("gletcherbrewery.com/")) {
    h = h.slice("gletcherbrewery.com".length);
  }
  // Tilda catalog tabs (`/beer#!/tab/...`) → local listing.
  if (/^\/beer#!/.test(h) || h === "/beer#") return "/beer";
  if (h.startsWith("/beer/")) {
    let path = h.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, "");
    h = BEER_HREF_FIXES[path] || path;
  }
  return h;
}

function escapeText(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Allowlist inline HTML from Tilda `te` fragments. */
export function cleanInlineHtml(raw) {
  if (!raw) return "";
  const input = decodeEntities(raw);
  const tagRe = /<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g;
  let result = "";
  let last = 0;
  let m;
  const openStack = [];
  while ((m = tagRe.exec(input))) {
    result += escapeText(input.slice(last, m.index));
    last = m.index + m[0].length;
    const name = m[1].toLowerCase();
    const closing = m[0].startsWith("</");
    if (!ALLOWED.has(name)) continue;
    if (name === "br") {
      if (!closing) result += "<br />";
      continue;
    }
    if (closing) {
      const mapped = name === "b" ? "strong" : name === "i" ? "em" : name;
      if (openStack.length && openStack[openStack.length - 1] === mapped) {
        openStack.pop();
        result += `</${mapped}>`;
      }
      continue;
    }
    if (name === "a") {
      const hrefMatch = m[2]?.match(
        /\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i,
      );
      let href = hrefMatch
        ? hrefMatch[2] || hrefMatch[3] || hrefMatch[4] || ""
        : "";
      href = rewriteHref(href);
      const esc = escapeText(href);
      const external = /^https?:/i.test(href);
      const extra = external
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      result += `<a href="${esc}"${extra}>`;
      openStack.push("a");
      continue;
    }
    const mapped = name === "b" ? "strong" : name === "i" ? "em" : name;
    result += `<${mapped}>`;
    openStack.push(mapped);
  }
  result += escapeText(input.slice(last));
  while (openStack.length) {
    result += `</${openStack.pop()}>`;
  }
  return result
    .replace(/(?:(?!<br \/>)\s)+/g, " ")
    .replace(/(?:<br \/>\s*){3,}/g, "<br /><br />")
    .trim();
}

function countTypes(items) {
  const c = {};
  for (const item of items) {
    const ty = item.ty || "unknown";
    c[ty] = (c[ty] || 0) + 1;
  }
  return c;
}

/** Drop Tilda editor placeholders that leaked into published HTML. */
function isPlaceholderHtml(html) {
  const t = html.replace(/<[^>]+>/g, "").trim();
  return !t || /^\$?[a-z_]+$/i.test(t) || /^\{\$.+\}$/.test(t);
}

/**
 * Build allowlisted `<ul|ol><li>…</li></ul|ol>` from a list fragment.
 * Item interiors use the inline allowlist; wrappers stay structural.
 */
export function cleanListHtml(raw, style = "ul") {
  const input = decodeEntities(raw || "");
  const tag = style === "ol" ? "ol" : "ul";
  const liRe = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  const items = [];
  let m;
  while ((m = liRe.exec(input))) {
    const inner = cleanInlineHtml(m[1]);
    if (inner && !isPlaceholderHtml(inner)) items.push(inner);
  }
  if (!items.length) {
    // Bare text / already-cleaned fragment without <li>.
    const fallback = cleanInlineHtml(input);
    if (!fallback || isPlaceholderHtml(fallback)) return "";
    return `<${tag}><li>${fallback}</li></${tag}>`;
  }
  return `<${tag}>${items.map((i) => `<li>${i}</li>`).join("")}</${tag}>`;
}

/**
 * Split a text `te` that embeds `<ul>/<ol>` into paragraph + list blocks.
 * Preserves order; strips list tags from paragraphs so ingredients stay readable.
 */
function pushTextWithEmbeddedLists(blocks, rawTe) {
  const input = decodeEntities(rawTe || "");
  const listRe = /<(ul|ol)\b[^>]*>[\s\S]*?<\/\1>/gi;
  let last = 0;
  let m;
  let found = false;
  while ((m = listRe.exec(input))) {
    found = true;
    const before = input.slice(last, m.index);
    const beforeHtml = cleanInlineHtml(before);
    if (beforeHtml && !isPlaceholderHtml(beforeHtml)) {
      blocks.push({ type: "paragraph", html: beforeHtml });
    }
    const style = m[1].toLowerCase() === "ol" ? "ol" : "ul";
    const listHtml = cleanListHtml(m[0], style);
    if (listHtml) blocks.push({ type: "list", style, html: listHtml });
    last = m.index + m[0].length;
  }
  if (!found) {
    const html = cleanInlineHtml(input);
    if (html && !isPlaceholderHtml(html)) {
      blocks.push({ type: "paragraph", html });
    }
    return;
  }
  const after = input.slice(last);
  const afterHtml = cleanInlineHtml(after);
  if (afterHtml && !isPlaceholderHtml(afterHtml)) {
    blocks.push({ type: "paragraph", html: afterHtml });
  }
}

export function convertTildaBlocks(items, report) {
  const blocks = [];
  for (const item of items) {
    const ty = item.ty;
    if (ty === "preface") {
      const html = cleanInlineHtml(item.te || "");
      if (html && !isPlaceholderHtml(html)) {
        blocks.push({ type: "preface", html });
      }
      continue;
    }
    if (ty === "text") {
      pushTextWithEmbeddedLists(blocks, item.te || "");
      continue;
    }
    if (ty === "heading") {
      const level = Number(item.le) || 3;
      const html = cleanInlineHtml(item.te || "");
      if (html && !isPlaceholderHtml(html)) {
        blocks.push({
          type: "heading",
          level: Math.min(4, Math.max(2, level)),
          html,
        });
      }
      continue;
    }
    if (ty === "video") {
      const src = item.url || item.src || "";
      const videoId = youtubeIdFromSrc(src);
      if (videoId) {
        blocks.push({
          type: "video",
          provider: "youtube",
          videoId,
          title: item.caption || item.title || "",
        });
      } else {
        report.deferred.push({
          reason: "unsupported-ty",
          ty: "video",
          src: src || undefined,
          provider: item.p || undefined,
        });
      }
      continue;
    }
    if (ty === "image") {
      const src = item.url || "";
      if (!src) {
        report.deferred.push({ reason: "image-missing-url" });
        continue;
      }
      // Published HTML sometimes wraps embeds as <figure><img src=…>.
      const ytFromImage = youtubeIdFromSrc(src);
      if (ytFromImage) {
        blocks.push({
          type: "video",
          provider: "youtube",
          videoId: ytFromImage,
          title: item.caption || item.alt || "",
        });
        continue;
      }
      if (/video_ext\.php|vkvideo\.ru|\/\/vk\.com\/video/i.test(src)) {
        report.deferred.push({ reason: "unsupported-ty", ty: "video", src });
        continue;
      }
      if (!item.alt) report.altGaps += 1;
      const href = rewriteHref(item.link || "") || null;
      blocks.push({
        type: "image",
        src,
        alt: item.alt || "",
        caption: item.caption || "",
        width: item.w ? Number(item.w) : null,
        height: item.h ? Number(item.h) : null,
        href: href && href !== "/" ? href : null,
      });
      continue;
    }
    if (ty === "quote") {
      const html = cleanInlineHtml(item.te || "");
      if (html) blocks.push({ type: "quote", html });
      continue;
    }
    if (ty === "ul" || ty === "ol" || ty === "list") {
      const style = ty === "ol" ? "ol" : "ul";
      const html = cleanListHtml(item.te || "", style);
      if (html) blocks.push({ type: "list", style, html });
      continue;
    }
    // Tilda redactor spacers — no content.
    if (ty === "br" || ty === "hr") continue;
    // Styled callout → quote (structure preserved; colors deferred).
    if (ty === "callout") {
      const html = cleanInlineHtml(item.te || "");
      if (html && !isPlaceholderHtml(html)) {
        blocks.push({ type: "quote", html });
      }
      continue;
    }
    report.deferred.push({ reason: "unsupported-ty", ty });
  }
  return blocks;
}

export function postToArticle(raw, { id, locale, slugOverride }) {
  const report = { deferred: [], altGaps: 0 };
  const encoded = raw.text || "[]";
  const decoded = decodeEntities(encoded);
  let items;
  try {
    items = JSON.parse(decoded);
  } catch (err) {
    throw new Error(
      `Failed to parse blocks for ${id}:${locale}: ${err.message}`,
    );
  }
  if (!Array.isArray(items)) {
    throw new Error(`Expected block array for ${id}:${locale}`);
  }
  const blocks = convertTildaBlocks(items, report);
  const slug =
    slugOverride || raw.postalias || raw.postdefaulturl || `${id}-${locale}`;
  const coverSrc = raw.image || raw.mediadata || "";
  if (coverSrc && !raw.imagealt) report.altGaps += 1;
  const description =
    raw.seo_descr ||
    decodeEntities(raw.descr || "")
      .replace(/<[^>]+>/g, "")
      .trim() ||
    raw.title ||
    "";
  /** Normalize Tilda `date` → `YYYY-MM-DD HH:mm` (Europe/Moscow editorial). */
  let publishedAt = String(raw.date || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) {
    publishedAt = `${publishedAt} 00:00`;
  } else if (/^\d{4}-\d{2}-\d{2}T/.test(publishedAt)) {
    publishedAt = publishedAt.replace("T", " ").slice(0, 16);
  } else if (publishedAt.length > 16) {
    publishedAt = publishedAt.slice(0, 16);
  }

  return {
    article: {
      id,
      locale,
      slug,
      title: decodeEntities(raw.title || ""),
      description,
      publishedAt,
      cover: { src: coverSrc, alt: raw.imagealt || "" },
      blocks,
    },
    report,
    blockCount: blocks.length,
    tildaTypes: countTypes(items),
  };
}

/** Fixture filename: `YYYY-MM-DD-{id}-{locale}.json`. */
export function articleFixtureName(publishedAt, id, locale) {
  const day = String(publishedAt || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error(`Invalid publishedAt for filename: ${publishedAt}`);
  }
  return `${day}-${id}-${locale}.json`;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.in || !args.id || !args.locale || !args.out) {
    console.error(
      "Usage: node scripts/tilda-blog-import.mjs --in raw.json --id id --locale ru|en --out file.json [--slug override]",
    );
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(args.in, "utf8"));
  const { article, report, blockCount, tildaTypes } = postToArticle(raw, {
    id: args.id,
    locale: args.locale,
    slugOverride: args.slug,
  });
  mkdirSync(ARTICLES_DIR, { recursive: true });
  const outPath = join(ARTICLES_DIR, args.out);
  writeFileSync(outPath, `${JSON.stringify(article, null, 2)}\n`, "utf8");
  console.log(
    JSON.stringify(
      {
        out: outPath,
        slug: article.slug,
        blockCount,
        tildaTypes,
        altGaps: report.altGaps,
        deferred: report.deferred,
      },
      null,
      2,
    ),
  );
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();
