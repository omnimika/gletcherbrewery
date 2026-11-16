import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type AppDb = PostgresJsDatabase<typeof schema>;

let cached: { url: string; sql: postgres.Sql; db: AppDb } | null = null;

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return url;
}

/**
 * Delivery worker credential (gletcher_worker). Required for `worker:delivery`.
 * Never fall back to DATABASE_URL (app role) — that would bypass R02 isolation.
 */
export function getWorkerDatabaseUrl(): string {
  const url = process.env.WORKER_DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "WORKER_DATABASE_URL is required (gletcher_worker role; do not reuse DATABASE_URL)",
    );
  }
  return url;
}

export function createDb(url = getDatabaseUrl()): { sql: postgres.Sql; db: AppDb } {
  const sql = postgres(url, {
    max: 10,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  const db = drizzle(sql, { schema });
  return { sql, db };
}

/** Shared connection for the Next.js process (app role). */
export function getDb(): AppDb {
  const url = getDatabaseUrl();
  if (!cached || cached.url !== url) {
    if (cached) {
      void cached.sql.end({ timeout: 1 });
    }
    cached = { url, ...createDb(url) };
  }
  return cached.db;
}

export async function closeDb(): Promise<void> {
  if (cached) {
    await cached.sql.end({ timeout: 5 });
    cached = null;
  }
}
