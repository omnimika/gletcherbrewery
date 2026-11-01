#!/usr/bin/env node
/**
 * Batch 14: remaining sitemap RU posts + EN-only 2021 releases (no fake peers).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { articleFixtureName, postToArticle } from "./tilda-blog-import.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW = join(ROOT, ".tmp/blog/raw");
const ARTICLES = join(ROOT, "src/content/blog/articles");
const REPORT = join(ROOT, ".tmp/blog/batch14-report.json");

/** @type {{ id: string, locale: string, uid: string, categoryId: string, categoryLabel: string }[]} */
const JOBS = [
  {
    id: "halloween-contest-2021",
    locale: "ru",
    uid: "l52cympd71",
    // Tilda `parts` empty — Proposed news (contest/promo).
    categoryId: "news",
    categoryLabel: "НОВОСТИ",
  },
  {
    id: "vasiliy-klin-interview",
    locale: "ru",
    uid: "hsri3ayv41",
    categoryId: "interview",
    categoryLabel: "ИНТЕРВЬЮ",
  },
  {
    id: "klin-may-fest-2021-postpone",
    locale: "ru",
    uid: "0kau2y5h91",
    categoryId: "events",
    categoryLabel: "МЕРОПРИЯТИЯ",
  },
  {
    id: "people-in-beer-anora",
    locale: "ru",
    uid: "5vvkbd3bd1",
    categoryId: "interview",
    categoryLabel: "ИНТЕРВЬЮ",
  },
  {
    id: "bowler-ipa-not-apa",
    locale: "ru",
    uid: "323zbj0y71",
    // Tilda parts → news.
    categoryId: "news",
    categoryLabel: "НОВОСТИ",
  },
  {
    id: "cooking-beef-nut-butter",
    locale: "ru",
    uid: "902x4oy5k1",
    categoryId: "recipes",
    categoryLabel: "ФУДПЕЙРИНГ / РЕЦЕПТЫ",
  },
  {
    id: "anora-podcast-interview",
    locale: "ru",
    uid: "f52uygiau1",
    // Tilda parts → news (not interview part).
    categoryId: "news",
    categoryLabel: "НОВОСТИ",
  },
  {
    id: "gzhanets-rouge",
    locale: "ru",
    uid: "6ku96l8541",
    categoryId: "recipes",
    categoryLabel: "ФУДПЕЙРИНГ / РЕЦЕПТЫ",
  },
  {
    id: "coco-jungle",
    locale: "en",
    uid: "d4xo37du81",
    categoryId: "releases",
    categoryLabel: "RELEASES",
  },
  {
    id: "extra-virgin",
    locale: "en",
    uid: "yuxd3l55l1",
    categoryId: "releases",
    categoryLabel: "RELEASES",
  },
  {
    id: "oatmeal-stout",
    locale: "en",
    uid: "775ra77481",
    categoryId: "releases",
    categoryLabel: "RELEASES",
  },
  {
    id: "rauchbier",
    locale: "en",
    uid: "2jevneeme1",
    categoryId: "releases",
    categoryLabel: "RELEASES",
  },
  {
    id: "rauhbier-label",
    locale: "en",
    uid: "exvllok0p1",
    // Tilda `parts` empty — Proposed library/GLOSSARY (design story).
    categoryId: "library",
    categoryLabel: "GLOSSARY",
  },
  {
    id: "yammy-jammy",
    locale: "en",
    uid: "ffcmeohs71",
    categoryId: "releases",
    categoryLabel: "RELEASES",
  },
  {
    id: "pumking-ale",
    locale: "en",
    uid: "a8p7c969z1",
    categoryId: "releases",
    categoryLabel: "RELEASES",
  },
  {
    id: "saison",
    locale: "en",
    uid: "yuhkvdcho1",
    categoryId: "releases",
    categoryLabel: "RELEASES",
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
