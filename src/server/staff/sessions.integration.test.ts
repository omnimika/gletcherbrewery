/**
 * M2-5 staff sessions: login allowlist, resolve, revoke; forged actor ignored at API layer.
 * Skip when DATABASE_URL unset.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { closeDb, createDb, type AppDb } from "@/server/db/client";
import {
  createStaffSession,
  resolveStaffSession,
  revokeStaffSession,
} from "./sessions";
import { roleAllows, LOYALTY_STAFF_ROLES } from "./roles";
import type postgres from "postgres";

const url = process.env.DATABASE_URL;
const migrateUrl = process.env.MIGRATION_DATABASE_URL;
const describeDb = url ? describe : describe.skip;

describeDb("staff sessions M2-5", () => {
  let db: AppDb;
  let sql: postgres.Sql;
  let migrateSql: postgres.Sql | null = null;
  const stamp = Date.now();
  const adminEmail = `admin.${stamp}@example.com`;
  const retailEmail = `retail.${stamp}@example.com`;

  before(async () => {
    process.env.DATABASE_URL = url!;
    const created = createDb(url!);
    db = created.db;
    sql = created.sql;
    // staff_users INSERT is migrator-only; seed via MIGRATION_DATABASE_URL when set.
    const seedUrl = migrateUrl || url!;
    const { default: postgresFn } = await import("postgres");
    migrateSql = postgresFn(seedUrl, { max: 1 });
    await migrateSql`
      INSERT INTO app.staff_users (email, role, active)
      VALUES (${adminEmail}, 'admin', true), (${retailEmail}, 'retail_editor', true)
      ON CONFLICT ((lower(email))) DO UPDATE
        SET role = EXCLUDED.role, active = true, email = EXCLUDED.email
    `;
  });

  after(async () => {
    if (migrateSql) await migrateSql.end({ timeout: 2 }).catch(() => {});
    await sql.end({ timeout: 5 });
    await closeDb();
  });

  it("creates session for allowlisted email and resolves cookie token", async () => {
    const created = await createStaffSession(db, { email: adminEmail });
    assert.equal(created.ok, true);
    if (!created.ok) return;
    assert.equal(created.actor.email, adminEmail);
    assert.equal(created.actor.role, "admin");

    const resolved = await resolveStaffSession(db, created.rawToken);
    assert.ok(resolved);
    assert.equal(resolved!.email, adminEmail);
    assert.equal(resolved!.id, adminEmail);
  });

  it("rejects unknown email", async () => {
    const created = await createStaffSession(db, {
      email: `unknown.${stamp}@example.com`,
    });
    assert.equal(created.ok, false);
    if (created.ok) return;
    assert.equal(created.code, "unknown_user");
  });

  it("revoked session no longer resolves", async () => {
    const created = await createStaffSession(db, { email: adminEmail });
    assert.equal(created.ok, true);
    if (!created.ok) return;
    await revokeStaffSession(db, created.rawToken);
    const resolved = await resolveStaffSession(db, created.rawToken);
    assert.equal(resolved, null);
  });

  it("retail_editor is not loyalty-capable (role matrix)", async () => {
    const created = await createStaffSession(db, { email: retailEmail });
    assert.equal(created.ok, true);
    if (!created.ok) return;
    assert.equal(roleAllows(created.actor.role, LOYALTY_STAFF_ROLES), false);
  });
});
