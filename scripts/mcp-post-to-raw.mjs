#!/usr/bin/env node
/**
 * Normalize a full MCP feeds_get_post JSON dump into importer raw + meta.
 *
 * Handles both editor JSON arrays (`[{&quot;ty&quot;:…}]`) and legacy HTML
 * fragments stored in `text` (pre-JSON feed posts).
 *
 * Usage:
 *   node scripts/mcp-post-to-raw.mjs --uid zd1a4a40u1 --in .tmp/blog/mcp/zd1a4a40u1.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeEntities } from "./tilda-blog-import.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW = join(ROOT, ".tmp/blog/raw");

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    if (!argv[i].startsWith("--")) continue;
    out[argv[i].slice(2)] = argv[i + 1];
    i += 1;
  }
  return out;
}

function encodeEditorText(items) {
  const json = JSON.stringify(items);
  return json
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Split legacy MCP HTML `text` into editor-like blocks.
 * Covers preface/quote/headings/figure/video/ul/ol + text gaps.
 */
function htmlFragmentToItems(html) {
  let s = String(html || "").trim();
  if (!s) return [];
  // Normalize entity-encoded HTML (MCP may return &lt;br /&gt; style).
  if (/&lt;[a-zA-Z]/.test(s) && !/<[a-zA-Z]/.test(s)) {
    s = decodeEntities(s);
  }
  const items = [];
  const tokenRe =
    /<(blockquote)\s+class="(t-redactor__(?:preface|quote))"[^>]*>([\s\S]*?)<\/blockquote>|<h([2-4])\b[^>]*>([\s\S]*?)<\/h\4>|<figure\b[^>]*>([\s\S]*?)<\/figure>|<ul\b[^>]*>([\s\S]*?)<\/ul>|<ol\b[^>]*>([\s\S]*?)<\/ol>/gi;
  let last = 0;
  let m;
  while ((m = tokenRe.exec(s))) {
    const before = s
      .slice(last, m.index)
      .replace(/^(?:\s|<br\s*\/?>)+|(?:\s|<br\s*\/?>)+$/gi, "");
    if (before.replace(/<br\s*\/?>/gi, "").trim()) {
      items.push({ ty: "text", te: before });
    }
    if (m[1] === "blockquote") {
      const kind = m[2].includes("preface") ? "preface" : "quote";
      items.push({ ty: kind, te: m[3].trim() });
    } else if (m[4]) {
      items.push({ ty: "heading", te: m[5].trim(), le: Number(m[4]) });
    } else if (m[0].toLowerCase().startsWith("<figure")) {
      const part = m[6] || "";
      const videoSrc =
        part.match(/<source[^>]+src="([^"]+)"/i)?.[1] ||
        part.match(/<video[^>]+src="([^"]+)"/i)?.[1];
      if (videoSrc) {
        items.push({ ty: "video", url: videoSrc, p: "html5" });
      } else {
        const src =
          part.match(/data-src="([^"]+)"/)?.[1] ||
          part.match(/src="([^"]+)"/)?.[1];
        const alt =
          m[0].match(/data-alt="([^"]*)"/)?.[1] ||
          part.match(/alt="([^"]*)"/)?.[1] ||
          "";
        const caption =
          part.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1] ||
          "";
        if (src) {
          items.push({
            ty: "image",
            url: src,
            alt: decodeEntities(alt),
            caption: decodeEntities(caption.replace(/<[^>]+>/g, "")),
            link: "",
            blank: "",
            w: "1200",
            h: "675",
          });
        }
      }
    } else if (m[0].toLowerCase().startsWith("<ul")) {
      items.push({ ty: "ul", te: m[7] });
    } else if (m[0].toLowerCase().startsWith("<ol")) {
      items.push({ ty: "ol", te: m[8] });
    }
    last = m.index + m[0].length;
  }
  const after = s
    .slice(last)
    .replace(/^(?:\s|<br\s*\/?>)+|(?:\s|<br\s*\/?>)+$/gi, "");
  if (after.replace(/<br\s*\/?>/gi, "").trim()) {
    items.push({ ty: "text", te: after });
  }
  return items;
}

function normalizeText(full) {
  const original = full.text || "[]";
  const decoded = decodeEntities(original);
  try {
    const parsed = JSON.parse(decoded);
    if (Array.isArray(parsed)) return original;
  } catch {
    // legacy HTML body
  }
  const items = htmlFragmentToItems(decoded);
  return encodeEditorText(items);
}

const args = parseArgs(process.argv);
if (!args.uid || !args.in) {
  console.error(
    "Usage: node scripts/mcp-post-to-raw.mjs --uid UID --in mcp-dump.json",
  );
  process.exit(1);
}

const full = JSON.parse(readFileSync(args.in, "utf8"));
const text = normalizeText(full);
const raw = {
  title: full.title || "",
  text,
  image: full.image || full.mediadata || "",
  imagealt: full.imagealt || "",
  mediadata: full.mediadata || full.image || "",
  seo_descr: full.seo_descr || "",
  descr: full.descr || "",
  postalias: full.postalias ?? null,
  postdefaulturl: full.postdefaulturl || "",
  date: full.date || "",
};
const meta = {
  title: raw.title,
  image: raw.image,
  imagealt: raw.imagealt,
  seo_descr: raw.seo_descr,
  descr: raw.descr,
  postalias: raw.postalias,
  postdefaulturl: raw.postdefaulturl,
  date: raw.date,
  parts: full.parts || "",
};

mkdirSync(RAW, { recursive: true });
const rawPath = join(RAW, `${args.uid}.json`);
const metaPath = join(RAW, `${args.uid}.meta.json`);
writeFileSync(rawPath, `${JSON.stringify(raw)}\n`, "utf8");
writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");

let blockCount = 0;
try {
  blockCount = JSON.parse(decodeEntities(text)).length;
} catch {
  blockCount = -1;
}
console.log(
  JSON.stringify({
    rawPath,
    metaPath,
    slug: raw.postdefaulturl,
    parts: meta.parts,
    blockCount,
  }),
);
