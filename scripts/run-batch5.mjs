#!/usr/bin/env node
/**
 * Batch 5: convert dumped Tilda raw posts → dated article fixtures + report.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { articleFixtureName, postToArticle } from "./tilda-blog-import.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW = join(ROOT, ".tmp/blog/raw");
const ARTICLES = join(ROOT, "src/content/blog/articles");
const REPORT = join(ROOT, ".tmp/blog/batch5-report.json");

/** @type {{ id: string, locale: string, uid: string }[]} */
const JOBS = [
  { id: "brainstorm-motor-fest-2024", locale: "ru", uid: "r6g8ym6vs1" },
  { id: "bowler-ipa", locale: "ru", uid: "rrjjjry2e1" },
  { id: "bowler-ipa", locale: "en", uid: "08cj20t161" },
  { id: "iron-woods-dry-stout", locale: "ru", uid: "uphlmfzxv1" },
  { id: "iron-woods-dry-stout", locale: "en", uid: "a842y8num1" },
  { id: "brainstorm-apa", locale: "ru", uid: "s6hgiav341" },
  { id: "brainstorm-apa", locale: "en", uid: "gumm02kpp1" },
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
