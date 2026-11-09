#!/usr/bin/env node
/**
 * Apply versioned SQL migrations from ./drizzle as role migrator.
 * Tracks applied files in app.schema_migrations.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const url =
  process.env.MIGRATION_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgres://gletcher_migrator:gletcher_migrator_dev@127.0.0.1:5432/gletcher_business";

const sql = postgres(url, { max: 1, prepare: false });

async function main() {
  await sql`CREATE SCHEMA IF NOT EXISTS app`;
  await sql`
    CREATE TABLE IF NOT EXISTS app.schema_migrations (
      id text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  const dir = path.join(root, "drizzle");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const id = file.replace(/\.sql$/, "");
    const rows = await sql`
      SELECT 1 FROM app.schema_migrations WHERE id = ${id} LIMIT 1
    `;
    if (rows.length) {
      console.log(`skip ${file}`);
      continue;
    }
    const body = fs.readFileSync(path.join(dir, file), "utf8");
    console.log(`apply ${file}`);
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`INSERT INTO app.schema_migrations (id) VALUES (${id})`;
    });
  }

  console.log("migrations OK");
  await sql.end({ timeout: 5 });
}

main().catch(async (err) => {
  console.error(err);
  await sql.end({ timeout: 1 }).catch(() => {});
  process.exit(1);
});
