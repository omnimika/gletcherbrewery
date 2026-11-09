#!/usr/bin/env node
/**
 * Batch 11: convert MCP/raw dumps → dated article fixtures + report.
 * Includes Confirmed EN peer for Cheers & Beers.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { articleFixtureName, postToArticle } from "./tilda-blog-import.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW = join(ROOT, ".tmp/blog/raw");
const ARTICLES = join(ROOT, "src/content/blog/articles");
const REPORT = join(ROOT, ".tmp/blog/batch11-report.json");

/** @type {{ id: string, locale: string, uid: string, categoryId: string, categoryLabel: string }[]} */
const JOBS = [
  {
    id: "cheers-beers",
    locale: "ru",
    uid: "tfatlkslk1",
    categoryId: "events",
    categoryLabel: "МЕРОПРИЯТИЯ",
  },
  {
    id: "cheers-beers",
    locale: "en",
    uid: "poxg2fuvl1",
    categoryId: "events",
    categoryLabel: "EVENTS",
  },
  {
    id: "prodexpo-2022",
    locale: "ru",
    uid: "2pminbnlo1",
    categoryId: "events",
    categoryLabel: "МЕРОПРИЯТИЯ",
  },
  {
    id: "beer-sensation-more",
    locale: "ru",
    uid: "hxjjtbo7k1",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "beer-sensation-acidity-salt",
    locale: "ru",
    uid: "4ryr3vef21",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "beer-sensation-bitterness",
    locale: "ru",
    uid: "x3afu840s1",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
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
