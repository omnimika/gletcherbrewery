/**
 * Queue snapshot against live delivery_jobs. Skip without DATABASE_URL.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { closeDb, createDb, type AppDb } from "@/server/db/client";
import { getQueueSnapshot } from "./queue-snapshot";
import type postgres from "postgres";

const url = process.env.DATABASE_URL;
const describeDb = url ? describe : describe.skip;

describeDb("queue-snapshot integration", () => {
  let db: AppDb;
  let sql: postgres.Sql;

  before(() => {
    const created = createDb(url!);
    db = created.db;
    sql = created.sql;
  });

  after(async () => {
    await sql.end({ timeout: 5 });
    await closeDb();
  });

  it("returns snapshot shape without throwing", async () => {
    const snap = await getQueueSnapshot(db);
    assert.ok(snap.at);
    assert.equal(typeof snap.byStatus, "object");
    assert.ok(Array.isArray(snap.buckets));
    assert.equal(typeof snap.pendingDueCount, "number");
    assert.equal(typeof snap.expiredLeaseCount, "number");
  });
});
