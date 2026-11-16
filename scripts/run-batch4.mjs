#!/usr/bin/env node
/**
 * Batch 4: convert dumped Tilda raw posts → dated article fixtures + report.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { articleFixtureName, postToArticle } from "./tilda-blog-import.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW = join(ROOT, ".tmp/blog/raw");
const ARTICLES = join(ROOT, "src/content/blog/articles");
const REPORT = join(ROOT, ".tmp/blog/batch4-report.json");

/** @type {{ id: string, locale: string, uid: string }[]} */
const JOBS = [
  { id: "brainstorm-motor-fest-2025", locale: "ru", uid: "t3rp7u17x1" },
  { id: "nizhny-gorky-craft", locale: "ru", uid: "zslbtrzf81" },
  { id: "klin-may-fest-2025-results", locale: "ru", uid: "lvdpb93421" },
  { id: "iron-woods-milk-stout", locale: "ru", uid: "bvhspd8pm1" },
  { id: "rouge-de-fleur", locale: "ru", uid: "pvbch1v1p1" },
  { id: "rouge-de-fleur", locale: "en", uid: "k3spgxeyx1" },
];

mkdirSync(ARTICLES, { recursive: true });
const rows = [];

for (const job of JOBS) {
  const inPath = join(RAW, `${job.uid}.json`);
  if (!existsSync(inPath)) {
    rows.push({ ...job, status: "missing-raw", path: inPath });
    continue;
  }
  const raw = JSON.parse(readFileSync(inPath, "utf8"));
  const { article, report, blockCount, tildaTypes } = postToArticle(raw, {
    id: job.id,
    locale: job.locale,
  });
  const outName = articleFixtureName(article.publishedAt, job.id, job.locale);
  const outPath = join(ARTICLES, outName);
  writeFileSync(outPath, `${JSON.stringify(article, null, 2)}\n`, "utf8");
  rows.push({
    id: job.id,
    locale: job.locale,
    uid: job.uid,
    slug: article.slug,
    publishedAt: article.publishedAt,
    status: report.deferred.length ? "transferred-with-deferred" : "transferred",
    blockCount,
    tildaTypes,
    altGaps: report.altGaps,
    deferred: report.deferred,
    out: outName,
  });
}

writeFileSync(REPORT, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log(JSON.stringify(rows, null, 2));
