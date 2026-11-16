#!/usr/bin/env node
/**
 * One-shot: add publishedAt + rename fixtures to YYYY-MM-DD-{id}-{locale}.json
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { articleFixtureName } from "./tilda-blog-import.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "../src/content/blog/articles");

/** @type {{ file: string, id: string, locale: string, publishedAt: string }[]} */
const ROWS = [
  { file: "beer-pizza-ru.json", id: "beer-pizza", locale: "ru", publishedAt: "2026-10-09 14:00" },
  { file: "beer-pizza-en.json", id: "beer-pizza", locale: "en", publishedAt: "2026-10-09 15:17" },
  { file: "homebrew-ru.json", id: "homebrew-day", locale: "ru", publishedAt: "2026-10-14 09:00" },
  { file: "barrel-aged-ru.json", id: "barrel-aged", locale: "ru", publishedAt: "2026-10-02 05:00" },
  { file: "afisha-winepark-ru.json", id: "afisha-winepark", locale: "ru", publishedAt: "2026-09-23 13:00" },
  { file: "moa-na-ru.json", id: "moa-na", locale: "ru", publishedAt: "2026-03-26 10:00" },
  { file: "moa-na-en.json", id: "moa-na", locale: "en", publishedAt: "2026-03-26 18:04" },
  { file: "aging-en.json", id: "aging", locale: "en", publishedAt: "2026-01-22 18:14" },
  { file: "tour-de-grapefruit-ru.json", id: "tour-de-grapefruit", locale: "ru", publishedAt: "2025-02-07 12:08" },
  { file: "tour-de-grapefruit-en.json", id: "tour-de-grapefruit", locale: "en", publishedAt: "2025-02-07 16:18" },
  { file: "kenig-kraft-fest-ru.json", id: "kenig-kraft-fest", locale: "ru", publishedAt: "2026-08-14 11:42" },
  { file: "gorky-craft-ru.json", id: "gorky-craft", locale: "ru", publishedAt: "2026-07-08 09:39" },
  { file: "arkhangelsk-craft-fest-ru.json", id: "arkhangelsk-craft-fest", locale: "ru", publishedAt: "2026-02-09 13:00" },
  { file: "cynic-story-ru.json", id: "cynic-story", locale: "ru", publishedAt: "2026-01-22 14:01" },
  { file: "friday-avenue-ru.json", id: "friday-avenue", locale: "ru", publishedAt: "2024-06-21 10:09" },
  { file: "friday-avenue-en.json", id: "friday-avenue", locale: "en", publishedAt: "2024-06-25 15:20" },
];

const renamed = [];
for (const row of ROWS) {
  const from = join(DIR, row.file);
  if (!existsSync(from)) {
    console.error("missing", from);
    process.exit(1);
  }
  const article = JSON.parse(readFileSync(from, "utf8"));
  article.id = row.id;
  article.locale = row.locale;
  article.publishedAt = row.publishedAt;
  const toName = articleFixtureName(row.publishedAt, row.id, row.locale);
  const to = join(DIR, toName);
  writeFileSync(to, `${JSON.stringify(article, null, 2)}\n`, "utf8");
  if (from !== to) unlinkSync(from);
  renamed.push({ from: row.file, to: toName, publishedAt: row.publishedAt });
}

console.log(JSON.stringify(renamed, null, 2));
