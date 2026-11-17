/**
 * M2-4 foundation import against real PostgreSQL.
 * Skip when DATABASE_URL is unset.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { and, eq, sql } from "drizzle-orm";
import { closeDb, createDb, type AppDb } from "@/server/db/client";
import {
  loyaltyLedgerEntries,
  loyaltyMembers,
  loyaltyReceipts,
} from "@/server/db/schema";
import { importLoyaltyBatch } from "./import-batch";
import { loadLoyaltyFixtureDir } from "./load-fixture-dir";
import { reconcileLoyaltyImport } from "./reconcile";
import type postgres from "postgres";

const url = process.env.DATABASE_URL;
const migratorUrl =
  process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
const describeDb = url ? describe : describe.skip;

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../",
);
const fixtureDir = path.join(root, "fixtures/loyalty/m2-4-linked");

describeDb("loyalty import M2-4 foundation", () => {
  let db: AppDb;
  let sqlClient: postgres.Sql;
  let migratorSql: postgres.Sql;
  let fixture: ReturnType<typeof loadLoyaltyFixtureDir>;

  before(() => {
    process.env.DATABASE_URL = url!;
    const created = createDb(url!);
    db = created.db;
    sqlClient = created.sql;
    // App role cannot DELETE ledger (append-only); cleanup via migrator.
    const mig = createDb(migratorUrl!);
    migratorSql = mig.sql;
    fixture = loadLoyaltyFixtureDir(fixtureDir);
  });

  after(async () => {
    await sqlClient.end({ timeout: 5 });
    await migratorSql.end({ timeout: 5 });
    await closeDb();
  });

  async function cleanupSynthetic() {
    // Delete in FK order for synthetic emails / airtable ids (migrator role)
    await migratorSql`
      DELETE FROM app.loyalty_ledger_entries
      WHERE source_system = 'airtable'
        AND source_record_id LIKE 'rec%'
    `;
    await migratorSql`
      DELETE FROM app.loyalty_agent_application_events
      WHERE application_id IN (
        SELECT id FROM app.loyalty_agent_applications
        WHERE airtable_agent_id LIKE 'rec%'
      )
    `;
    await migratorSql`
      DELETE FROM app.loyalty_agent_applications
      WHERE airtable_agent_id LIKE 'rec%'
    `;
    await migratorSql`
      DELETE FROM app.loyalty_receipts
      WHERE airtable_check_id LIKE 'rec%'
    `;
    await migratorSql`
      DELETE FROM app.loyalty_member_sessions
      WHERE member_id IN (
        SELECT id FROM app.loyalty_members
        WHERE email_normalized LIKE '%@synthetic.test'
           OR airtable_record_id LIKE 'rec%'
      )
    `;
    await migratorSql`
      DELETE FROM app.loyalty_import_identity_map
      WHERE record_id LIKE 'rec%'
    `;
    await migratorSql`
      DELETE FROM app.loyalty_staging_rows
      WHERE batch_id IN (
        SELECT id FROM app.loyalty_import_batches
        WHERE source_label = 'm2-4-foundation-synthetic'
      )
    `;
    await migratorSql`
      DELETE FROM app.loyalty_import_batches
      WHERE source_label = 'm2-4-foundation-synthetic'
    `;
    await migratorSql`
      DELETE FROM app.loyalty_members
      WHERE email_normalized LIKE '%@synthetic.test'
         OR airtable_record_id LIKE 'rec%'
    `;
  }

  it("dry_run stages without business writes", async () => {
    await cleanupSynthetic();
    const beforeMembers = await db.select().from(loyaltyMembers);
    const beforeCount = beforeMembers.filter((m) =>
      m.emailNormalized.endsWith("@synthetic.test"),
    ).length;

    const result = await importLoyaltyBatch(db, {
      ...fixture,
      mode: "dry_run",
    });
    assert.equal(result.status, "validated");
    assert.ok(result.quarantineCount >= 2);

    const afterMembers = await db.select().from(loyaltyMembers);
    const afterCount = afterMembers.filter((m) =>
      m.emailNormalized.endsWith("@synthetic.test"),
    ).length;
    assert.equal(afterCount, beforeCount);

    const receipts = await db
      .select()
      .from(loyaltyReceipts)
      .where(eq(loyaltyReceipts.airtableCheckId, "recCheckEarn1"));
    assert.equal(receipts.length, 0);
  });

  it("apply → available200/lifetime9000; rerun idempotent; reconcile PASS", async () => {
    await cleanupSynthetic();

    const first = await importLoyaltyBatch(db, {
      ...fixture,
      mode: "apply",
    });
    assert.equal(first.status, "applied");
    assert.ok(first.applied);
    assert.ok((first.applied?.members ?? 0) >= 4);

    const member = await db
      .select()
      .from(loyaltyMembers)
      .where(eq(loyaltyMembers.emailNormalized, "balance@synthetic.test"))
      .limit(1);
    assert.equal(member.length, 1);

    const report1 = await reconcileLoyaltyImport(db, {
      batchId: first.batchId,
      manifest: fixture.manifest,
    });
    assert.equal(report1.ok, true, JSON.stringify(report1.expectationDiffs));
    const bal = report1.members.find(
      (m) => m.email === "balance@synthetic.test",
    );
    assert.ok(bal);
    assert.equal(bal.available, 200);
    assert.equal(bal.lifetime, 9000);

    // pending check must not post earn
    const pendingReceipt = await db
      .select()
      .from(loyaltyReceipts)
      .where(eq(loyaltyReceipts.airtableCheckId, "recCheckPending"))
      .limit(1);
    assert.equal(pendingReceipt[0]?.status, "pending_manual");
    const pendingEarn = await db
      .select()
      .from(loyaltyLedgerEntries)
      .where(
        and(
          eq(loyaltyLedgerEntries.sourceRecordId, "recCheckPending"),
          eq(loyaltyLedgerEntries.entryKind, "check_earn"),
        ),
      );
    assert.equal(pendingEarn.length, 0);

    const ledgerBefore = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(loyaltyLedgerEntries)
      .where(eq(loyaltyLedgerEntries.sourceSystem, "airtable"));

    const second = await importLoyaltyBatch(db, {
      ...fixture,
      mode: "apply",
    });
    assert.equal(second.kind, "replay");
    assert.equal(second.status, "applied");

    const ledgerAfter = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(loyaltyLedgerEntries)
      .where(eq(loyaltyLedgerEntries.sourceSystem, "airtable"));
    assert.equal(Number(ledgerAfter[0]?.c), Number(ledgerBefore[0]?.c));
  });

  it("reconcile detects intentional ledger corruption", async () => {
    await cleanupSynthetic();
    const applied = await importLoyaltyBatch(db, {
      ...fixture,
      mode: "apply",
    });
    assert.equal(applied.status, "applied");

    await migratorSql`
      UPDATE app.loyalty_ledger_entries
      SET amount = amount + 999
      WHERE source_record_id = 'recCheckEarn1'
        AND entry_kind = 'check_earn'
    `;

    const report = await reconcileLoyaltyImport(db, {
      batchId: applied.batchId,
      manifest: fixture.manifest,
    });
    assert.equal(report.ok, false);
    assert.ok(report.expectationDiffs.length >= 1);
    await cleanupSynthetic();
  });
});
