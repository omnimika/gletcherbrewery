#!/usr/bin/env node
/**
 * Batch 12: 2021 library slice + Confirmed EN glossary peers.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { articleFixtureName, postToArticle } from "./tilda-blog-import.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW = join(ROOT, ".tmp/blog/raw");
const ARTICLES = join(ROOT, "src/content/blog/articles");
const REPORT = join(ROOT, ".tmp/blog/batch12-report.json");

/** @type {{ id: string, locale: string, uid: string, categoryId: string, categoryLabel: string }[]} */
const JOBS = [
  {
    id: "spoiled-beer",
    locale: "ru",
    uid: "jb9hgilpm1",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "foodpairing-caramel",
    locale: "ru",
    uid: "p1og5o2691",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "foodpairing-caramel",
    locale: "en",
    uid: "mejto1lui1",
    categoryId: "library",
    categoryLabel: "GLOSSARY",
  },
  {
    id: "beer-sensation-aroma",
    locale: "ru",
    uid: "ozy0n3ypa1",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "beer-sensation-aroma",
    locale: "en",
    uid: "ck3it9fx11",
    categoryId: "library",
    categoryLabel: "GLOSSARY",
  },
  {
    id: "smoked-malt",
    locale: "ru",
    uid: "pnenfyiyb1",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "smoked-malt",
    locale: "en",
    uid: "d3vg4bzat1",
    categoryId: "library",
    categoryLabel: "GLOSSARY",
  },
  {
    id: "dry-hopping",
    locale: "ru",
    uid: "eajyz692l1",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "dry-hopping",
    locale: "en",
    uid: "txpbxbiek1",
    categoryId: "library",
    categoryLabel: "GLOSSARY",
  },
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
  writeFileSync(
    join(ARTICLES, outName),
    `${JSON.stringify(article, null, 2)}\n`,
    "utf8",
  );
  rows.push({
    id: job.id,
    locale: job.locale,
    uid: job.uid,
    categoryId: job.categoryId,
    categoryLabel: job.categoryLabel,
    slug: article.slug,
    publishedAt: article.publishedAt,
    status: report.deferred.length
      ? "transferred-with-deferred"
      : "transferred",
    blockCount,
    tildaTypes,
    altGaps: report.altGaps,
    deferred: report.deferred,
    out: outName,
  });
}

writeFileSync(REPORT, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log(JSON.stringify(rows, null, 2));
