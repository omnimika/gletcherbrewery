#!/usr/bin/env node
/**
 * Batch 13: 2021 library peers + snacks (RU library / EN recipes) + IBU RU-only.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { articleFixtureName, postToArticle } from "./tilda-blog-import.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW = join(ROOT, ".tmp/blog/raw");
const ARTICLES = join(ROOT, "src/content/blog/articles");
const REPORT = join(ROOT, ".tmp/blog/batch13-report.json");

/** @type {{ id: string, locale: string, uid: string, categoryId: string, categoryLabel: string }[]} */
const JOBS = [
  {
    id: "foodpairing-snacks",
    locale: "ru",
    uid: "2n2pr8dng1",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "foodpairing-snacks",
    locale: "en",
    uid: "xy53paori1",
    // Entity stays library (RU primary); EN chip from Tilda recipes part.
    categoryId: "library",
    categoryLabel: "RECIPES",
  },
  {
    id: "bavaria-brewing",
    locale: "ru",
    uid: "730oojkrr1",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "bavaria-brewing",
    locale: "en",
    uid: "pu9xfazps1",
    categoryId: "library",
    categoryLabel: "GLOSSARY",
  },
  {
    id: "beer-foam",
    locale: "ru",
    uid: "9y0d4gr0y1",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "beer-foam",
    locale: "en",
    uid: "ymfo0i2t71",
    categoryId: "library",
    categoryLabel: "GLOSSARY",
  },
  {
    id: "stout-talk",
    locale: "ru",
    uid: "0viy48tr71",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "stout-talk",
    locale: "en",
    uid: "e40oxvnn01",
    categoryId: "library",
    categoryLabel: "GLOSSARY",
  },
  {
    id: "ale-or-lager",
    locale: "ru",
    uid: "gya48ze261",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "ale-or-lager",
    locale: "en",
    uid: "snfk1giyd1",
    categoryId: "library",
    categoryLabel: "GLOSSARY",
  },
  {
    id: "lady-beer-guide",
    locale: "ru",
    uid: "kcpdyda711",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "lady-beer-guide",
    locale: "en",
    uid: "dou93nl341",
    categoryId: "library",
    categoryLabel: "GLOSSARY",
  },
  {
    id: "four-ingredients",
    locale: "ru",
    uid: "zg9u7nn2y1",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "four-ingredients",
    locale: "en",
    uid: "okjzxv2gf1",
    categoryId: "library",
    categoryLabel: "GLOSSARY",
  },
  {
    id: "blanche-weizen",
    locale: "ru",
    uid: "d1knu5x0k1",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "blanche-weizen",
    locale: "en",
    uid: "japn2sfx71",
    categoryId: "library",
    categoryLabel: "GLOSSARY",
  },
  {
    id: "milkshake-ipa",
    locale: "ru",
    uid: "m7zvi7e051",
    categoryId: "library",
    categoryLabel: "БИБЛИОТЕКА",
  },
  {
    id: "milkshake-ipa",
    locale: "en",
    uid: "i7nvy9f6m1",
    categoryId: "library",
    categoryLabel: "GLOSSARY",
  },
  {
    id: "ibu",
    locale: "ru",
    uid: "jbjnakk441",
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
