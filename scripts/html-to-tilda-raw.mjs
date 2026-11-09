#!/usr/bin/env node
/**
 * Build a Tilda-like raw post JSON from published HTML + meta sidecar.
 * Used when editor dumps are not on disk; block types still map to the same
 * taxonomy as scripts/tilda-blog-import.mjs.
 *
 * Meta sidecar (.tmp/blog/raw/{uid}.meta.json):
 *   { title, image, imagealt, seo_descr, descr, postalias, postdefaulturl, date }
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { decodeEntities } from "./tilda-blog-import.mjs";

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    if (!argv[i].startsWith("--")) continue;
    out[argv[i].slice(2)] = argv[i + 1];
    i += 1;
  }
  return out;
}

function extractBody(html) {
  const start = html.indexOf("js-feed-post-text");
  const end = html.indexOf("t-feed__post-popup__date-parts-wrapper", start);
  if (start < 0 || end < 0) throw new Error("Cannot find feed post body");
  return html.slice(start, end);
}

/**
 * Older Tilda feed posts store a flat `<section>…</section>` without
 * per-paragraph `t-redactor__text` wrappers. Split into editor-like items.
 */
function legacySectionToItems(chunk) {
  const sec = chunk.match(/<section\b[^>]*>([\s\S]*?)<\/section>/i);
  let s = (sec ? sec[1] : chunk).trim();
  if (!s) return [];
  const items = [];
  const tokenRe =
    /<(blockquote)\s+class="(t-redactor__(?:preface|quote))"[^>]*>([\s\S]*?)<\/blockquote>|<h([2-4])\b[^>]*>([\s\S]*?)<\/h\4>|<figure\b[^>]*>([\s\S]*?)<\/figure>|<ul\b[^>]*>([\s\S]*?)<\/ul>|<ol\b[^>]*>([\s\S]*?)<\/ol>/gi;
  let last = 0;
  let m;
  while ((m = tokenRe.exec(s))) {
    const before = s.slice(last, m.index).replace(/^(?:\s|<br\s*\/?>)+|(?:\s|<br\s*\/?>)+$/gi, "");
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
      const src =
        part.match(/data-src="([^"]+)"/)?.[1] ||
        part.match(/src="([^"]+)"/)?.[1] ||
        m[0].match(/data-src="([^"]+)"/)?.[1] ||
        m[0].match(/src="([^"]+)"/)?.[1];
      const alt =
        m[0].match(/data-alt="([^"]*)"/)?.[1] ||
        part.match(/alt="([^"]*)"/)?.[1] ||
        "";
      const caption =
        part.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1] || "";
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
    } else if (m[0].toLowerCase().startsWith("<ul")) {
      items.push({ ty: "ul", te: m[7] });
    } else if (m[0].toLowerCase().startsWith("<ol")) {
      items.push({ ty: "ol", te: m[8] });
    }
    last = m.index + m[0].length;
  }
  const after = s.slice(last).replace(/^(?:\s|<br\s*\/?>)+|(?:\s|<br\s*\/?>)+$/gi, "");
  if (after.replace(/<br\s*\/?>/gi, "").trim()) {
    items.push({ ty: "text", te: after });
  }
  return items;
}

/**
 * Convert published redactor HTML into Tilda editor-like block array,
 * then entity-encode as `text` for the shared importer.
 */
function htmlBodyToEditorItems(chunk) {
  const openRe =
    /<(div|blockquote|h2|h3|h4)\s+class="(t-redactor__(?:preface|h2|h3|h4|text|quote|callout)[^"]*)"[^>]*>|<figure\b[^>]*>|<div\s+class="t-redactor__video-container"[^>]*>/gi;
  const items = [];
  let i = 0;
  while (true) {
    openRe.lastIndex = i;
    const m = openRe.exec(chunk);
    if (!m) break;
    if (/t-redactor__video-container/i.test(m[0])) {
      const end = chunk.indexOf("</div>", m.index);
      if (end < 0) break;
      const part = chunk.slice(m.index, end + 6);
      const yt =
        part.match(
          /(?:youtube\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]+)/i,
        )?.[0] || "";
      if (yt) {
        const url = yt.startsWith("http")
          ? yt
          : `https://www.youtube.com/embed/${yt.split("/").pop()}`;
        items.push({ ty: "video", url, p: "youtube" });
      }
      i = end + 6;
      continue;
    }
    if (m[0].toLowerCase().startsWith("<figure")) {
      const end = chunk.indexOf("</figure>", m.index);
      if (end < 0) break;
      const part = chunk.slice(m.index, end + 9);
      const src =
        part.match(/data-src="([^"]+)"/)?.[1] ||
        part.match(/src="([^"]+)"/)?.[1];
      const alt = part.match(/alt="([^"]*)"/)?.[1] || "";
      if (src) {
        items.push({
          ty: "image",
          url: src,
          alt: decodeEntities(alt),
          caption: "",
          link: "",
          blank: "",
          w: "1200",
          h: "675",
        });
      }
      i = end + 9;
      continue;
    }
    const tag = m[1].toLowerCase();
    const kind = m[2].split("__")[1];
    const startInner = m.index + m[0].length;
    let inner;
    if (tag === "div") {
      let depth = 0;
      let j = m.index;
      while (j < chunk.length) {
        const no = chunk.indexOf("<div", j);
        const nc = chunk.indexOf("</div>", j);
        if (nc < 0) break;
        if (no >= 0 && no < nc) {
          depth += 1;
          j = no + 4;
        } else {
          depth -= 1;
          j = nc + 6;
          if (depth === 0) {
            inner = chunk.slice(startInner, nc);
            i = j;
            break;
          }
        }
      }
      if (inner === undefined) break;
    } else {
      const close = `</${tag}>`;
      const end = chunk.indexOf(close, startInner);
      if (end < 0) break;
      inner = chunk.slice(startInner, end);
      i = end + close.length;
    }
    // Keep a limited set of inline tags for the importer cleaner
    const te = inner
      .replace(/<img[\s\S]*?>/gi, "")
      .replace(/<\/?(?:span|div|p)[^>]*>/gi, "")
      .trim();
    if (!te) continue;
    if (kind === "preface") items.push({ ty: "preface", te });
    else if (kind === "quote") items.push({ ty: "quote", te });
    else if (kind.startsWith("callout")) items.push({ ty: "callout", te });
    else if (kind.startsWith("h")) {
      items.push({ ty: "heading", te, le: Number(kind.slice(1)) || 3 });
    } else items.push({ ty: "text", te });
  }
  return items;
}

function encodeEditorText(items) {
  // Match Tilda storage: JSON with HTML entities for quotes
  const json = JSON.stringify(items);
  return json
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const args = parseArgs(process.argv);
if (!args.html || !args.meta || !args.out) {
  console.error(
    "Usage: node scripts/html-to-tilda-raw.mjs --html page.html --meta uid.meta.json --out uid.json",
  );
  process.exit(1);
}

const html = readFileSync(args.html, "utf8");
const meta = JSON.parse(readFileSync(args.meta, "utf8"));
const chunk = extractBody(html);
let items = htmlBodyToEditorItems(chunk);
const hasWrappedText = /t-redactor__text/i.test(chunk);
const textish = items.filter((i) =>
  ["text", "preface", "quote", "ul", "ol", "list"].includes(i.ty),
).length;
// Flat legacy bodies: prefer section splitter when wrappers are missing.
if (!hasWrappedText) {
  const legacy = legacySectionToItems(chunk);
  const legacyText = legacy.filter((i) =>
    ["text", "preface", "quote", "ul", "ol"].includes(i.ty),
  ).length;
  if (legacy.length > items.length || legacyText > textish) {
    items = legacy;
  }
}
const raw = {
  title: meta.title,
  text: encodeEditorText(items),
  image: meta.image || "",
  imagealt: meta.imagealt || "",
  mediadata: meta.image || "",
  seo_descr: meta.seo_descr || "",
  descr: meta.descr || "",
  postalias: meta.postalias || null,
  postdefaulturl: meta.postdefaulturl || "",
  date: meta.date || "",
};
mkdirSync(dirname(args.out), { recursive: true });
writeFileSync(args.out, `${JSON.stringify(raw)}\n`, "utf8");
console.log(
  JSON.stringify(
    { out: args.out, blocks: items.length, types: items.map((i) => i.ty) },
    null,
    2,
  ),
);
