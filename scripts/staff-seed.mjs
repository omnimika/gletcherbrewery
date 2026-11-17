#!/usr/bin/env node
/**
 * Upsert staff allowlist from STAFF_SEED_USERS env.
 * Format: email:role[,email:role...]
 * Roles: admin | loyalty_manager | retail_editor
 * Example: STAFF_SEED_USERS='you@brewery.ru:admin,map@brewery.ru:retail_editor'
 * PII stay in env — never commit real emails into Git.
 */
import postgres from "postgres";

const url =
  process.env.MIGRATION_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgres://gletcher_migrator:gletcher_migrator_dev@127.0.0.1:54329/gletcher_business";

const raw = (process.env.STAFF_SEED_USERS || "").trim();
if (!raw) {
  console.error(
    "Set STAFF_SEED_USERS=email:role[,email:role...] (roles: admin|loyalty_manager|retail_editor)",
  );
  process.exit(1);
}

const ROLES = new Set(["admin", "loyalty_manager", "retail_editor"]);
const entries = raw.split(",").map((p) => p.trim()).filter(Boolean);
const rows = [];
for (const part of entries) {
  const idx = part.lastIndexOf(":");
  if (idx <= 0) {
    console.error("Bad entry (want email:role):", part);
    process.exit(1);
  }
  const email = part.slice(0, idx).trim().toLowerCase();
  const role = part.slice(idx + 1).trim();
  if (!email.includes("@") || !ROLES.has(role)) {
    console.error("Invalid email/role:", part);
    process.exit(1);
  }
  rows.push({ email, role });
}

const sql = postgres(url, { max: 1 });
try {
  for (const { email, role } of rows) {
    await sql`
      INSERT INTO app.staff_users (email, role, active, updated_at)
      VALUES (${email}, ${role}, true, now())
      ON CONFLICT ((lower(email))) DO UPDATE
        SET role = EXCLUDED.role,
            active = true,
            email = EXCLUDED.email,
            updated_at = now()
    `;
    console.log("upsert", email, role);
  }
  console.log("staff seed OK", rows.length);
} finally {
  await sql.end({ timeout: 2 });
}
