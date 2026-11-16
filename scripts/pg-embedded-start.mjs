#!/usr/bin/env node
/**
 * Start non-prod PostgreSQL via embedded binaries (no Docker / Homebrew required).
 * Data dir: .tmp/embedded-pg  (gitignored via .tmp/)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import EmbeddedPostgres from "embedded-postgres";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const databaseDir = path.join(root, ".tmp", "embedded-pg");
const port = Number(process.env.PGPORT || 54329);
const password = process.env.PGPASSWORD || "postgres_dev";

fs.mkdirSync(databaseDir, { recursive: true });

const pg = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password,
  port,
  persistent: true,
});

const alreadyInit = fs.existsSync(path.join(databaseDir, "PG_VERSION"));
if (!alreadyInit) {
  console.log("initialise cluster", databaseDir);
  await pg.initialise();
}

console.log(`start postgres on 127.0.0.1:${port}`);
await pg.start();

const adminUrl = `postgres://postgres:${password}@127.0.0.1:${port}/postgres`;
const sql = postgres(adminUrl, { max: 1 });

async function ensureRole(name, pass) {
  const rows = await sql`SELECT 1 FROM pg_roles WHERE rolname = ${name}`;
  if (!rows.length) {
    await sql.unsafe(
      `CREATE ROLE ${name} LOGIN PASSWORD '${pass.replace(/'/g, "''")}'`,
    );
  }
}

await ensureRole("gletcher_migrator", "gletcher_migrator_dev");
await ensureRole("gletcher_app", "gletcher_app_dev");
await ensureRole("gletcher_nocodb", "gletcher_nocodb_dev");
await ensureRole("gletcher_worker", "gletcher_worker_dev");

async function ensureDb(name, owner) {
  const rows = await sql`SELECT 1 FROM pg_database WHERE datname = ${name}`;
  if (!rows.length) {
    await sql.unsafe(`CREATE DATABASE ${name} OWNER ${owner}`);
  }
}

await ensureDb("gletcher_business", "gletcher_migrator");
await ensureDb("nocodb_meta", "gletcher_migrator");
await sql.unsafe(
  `GRANT CONNECT ON DATABASE gletcher_business TO gletcher_app, gletcher_nocodb, gletcher_worker`,
);
await sql.end({ timeout: 2 });

const biz = postgres(
  `postgres://gletcher_migrator:gletcher_migrator_dev@127.0.0.1:${port}/gletcher_business`,
  { max: 1 },
);
await biz.unsafe(`CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION gletcher_migrator`);
await biz.unsafe(`GRANT USAGE ON SCHEMA app TO gletcher_app, gletcher_nocodb, gletcher_worker`);
await biz.unsafe(`
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  GRANT SELECT, INSERT, UPDATE ON TABLES TO gletcher_app;
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO gletcher_app;
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  GRANT SELECT, INSERT, UPDATE ON TABLES TO gletcher_worker;
ALTER DEFAULT PRIVILEGES FOR ROLE gletcher_migrator IN SCHEMA app
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO gletcher_worker;
`);
await biz.end({ timeout: 2 });

const envPath = path.join(root, ".env.local");
const envLines = [
  `DATABASE_URL=postgres://gletcher_app:gletcher_app_dev@127.0.0.1:${port}/gletcher_business`,
  `MIGRATION_DATABASE_URL=postgres://gletcher_migrator:gletcher_migrator_dev@127.0.0.1:${port}/gletcher_business`,
  `NOCODB_META_DATABASE_URL=postgres://gletcher_migrator:gletcher_migrator_dev@127.0.0.1:${port}/nocodb_meta`,
  `NOCODB_DATABASE_URL=postgres://gletcher_nocodb:gletcher_nocodb_dev@127.0.0.1:${port}/gletcher_business`,
  `PGPORT=${port}`,
  `PGPASSWORD=${password}`,
];

let existing = "";
if (fs.existsSync(envPath)) existing = fs.readFileSync(envPath, "utf8");
const kept = existing
  .split("\n")
  .filter(
    (l) =>
      l &&
      !l.startsWith("DATABASE_URL=") &&
      !l.startsWith("MIGRATION_DATABASE_URL=") &&
      !l.startsWith("NOCODB_META_DATABASE_URL=") &&
      !l.startsWith("NOCODB_DATABASE_URL=") &&
      !l.startsWith("PGPORT=") &&
      !l.startsWith("PGPASSWORD="),
  );
fs.writeFileSync(envPath, [...kept, ...envLines, ""].join("\n"));
console.log("wrote", envPath);

// Run migrations
const migrate = spawn(process.execPath, [path.join(root, "scripts/db-migrate.mjs")], {
  env: {
    ...process.env,
    MIGRATION_DATABASE_URL: envLines[1].split("=").slice(1).join("="),
  },
  stdio: "inherit",
});
await new Promise((resolve, reject) => {
  migrate.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`migrate ${code}`))));
});

console.log("PostgreSQL ready. Leave this process running for B1.");
console.log(`  DATABASE_URL=${envLines[0].slice("DATABASE_URL=".length)}`);

const stop = async () => {
  console.log("stopping…");
  try {
    await pg.stop();
  } catch {
    /* ignore */
  }
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

// Keep alive
await new Promise(() => {});
