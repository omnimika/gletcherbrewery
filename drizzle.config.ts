import { defineConfig } from "drizzle-kit";

const url =
  process.env.MIGRATION_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "postgres://gletcher_migrator:gletcher_migrator_dev@127.0.0.1:5432/gletcher_business";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
