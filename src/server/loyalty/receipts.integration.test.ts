/**
 * R05 receipt decisions: atomic approve/reject + ledger; races + rollback.
 * Skip when DATABASE_URL unset.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { eq } from "drizzle-orm";
import { closeDb, createDb, type AppDb } from "@/server/db/client";
import {
  loyaltyLedgerEntries,
  loyaltyReceipts,
} from "@/server/db/schema";
import {
  approveReceipt,
  createManualReceipt,
  rejectReceipt,
} from "./receipts";
import type postgres from "postgres";

const url = process.env.DATABASE_URL;
const describeDb = url ? describe : describe.skip;

describeDb("receipt decisions R05", () => {
  let db: AppDb;
  let sql: postgres.Sql;

  before(() => {
    process.env.DATABASE_URL = url!;
    const created = createDb(url!);
    db = created.db;
    sql = created.sql;
  });

  after(async () => {
    await sql.end({ timeout: 5 });
    await closeDb();
  });

  async function pendingReceipt(suffix: string) {
    const created = await createManualReceipt(db, {
      email: `r05.${suffix}.${Date.now()}@example.com`,
      gletcherSumRub: 1000,
      city: "Москва",
      purchaseAt: "2026-11-16",
      venueName: "Test Shop",
    });
    assert.equal(created.ok, true);
    if (!created.ok) throw new Error("create failed");
    return created.receipt;
  }

  it("approve posts exactly one ledger earn row", async () => {
    const receipt = await pendingReceipt("approve");
    const result = await approveReceipt(db, {
      receiptId: receipt.id,
      actor: "tester",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.already, false);
    assert.equal(result.receipt.status, "verified");

    const ledger = await db
      .select()
      .from(loyaltyLedgerEntries)
      .where(eq(loyaltyLedgerEntries.sourceRecordId, receipt.id));
    assert.equal(ledger.length, 1);
    assert.equal(ledger[0]?.entryKind, "check_earn");
    assert.equal(ledger[0]?.amount, 50);
  });

  it("repeated approve is idempotent and does not double-earn", async () => {
    const receipt = await pendingReceipt("repeat");
    const first = await approveReceipt(db, {
      receiptId: receipt.id,
      actor: "a",
    });
    assert.equal(first.ok, true);
    const second = await approveReceipt(db, {
      receiptId: receipt.id,
      actor: "b",
    });
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.equal(second.already, true);

    const ledger = await db
      .select()
      .from(loyaltyLedgerEntries)
      .where(eq(loyaltyLedgerEntries.sourceRecordId, receipt.id));
    assert.equal(ledger.length, 1);
  });

  it("reject leaves no ledger row", async () => {
    const receipt = await pendingReceipt("reject");
    const result = await rejectReceipt(db, {
      receiptId: receipt.id,
      actor: "tester",
      note: "bad photo",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.receipt.status, "rejected");

    const ledger = await db
      .select()
      .from(loyaltyLedgerEntries)
      .where(eq(loyaltyLedgerEntries.sourceRecordId, receipt.id));
    assert.equal(ledger.length, 0);
  });

  it("concurrent approve vs reject yields one verdict without overwrite", async () => {
    const receipt = await pendingReceipt("race");
    const [a, b] = await Promise.all([
      approveReceipt(db, { receiptId: receipt.id, actor: "approver" }),
      rejectReceipt(db, { receiptId: receipt.id, actor: "rejector" }),
    ]);

    const [final] = await db
      .select()
      .from(loyaltyReceipts)
      .where(eq(loyaltyReceipts.id, receipt.id));
    assert.ok(final);
    assert.ok(final.status === "verified" || final.status === "rejected");

    const ledger = await db
      .select()
      .from(loyaltyLedgerEntries)
      .where(eq(loyaltyLedgerEntries.sourceRecordId, receipt.id));

    if (final.status === "verified") {
      assert.equal(ledger.length, 1);
      assert.equal(a.ok, true);
      if (a.ok) assert.equal(a.already, false);
      assert.ok(!b.ok || (b.ok && b.already !== true));
      if (!b.ok) {
        assert.ok(b.code === "conflict" || b.code === "already_verified");
      }
    } else {
      assert.equal(ledger.length, 0);
      assert.equal(b.ok, true);
      if (!a.ok) assert.equal(a.code, "conflict");
    }
  });

  it("rolls back approve when ledger insert fails", async () => {
    const receipt = await pendingReceipt("rollback");
    await assert.rejects(
      () =>
        approveReceipt(
          db,
          { receiptId: receipt.id, actor: "tester" },
          {
            beforeLedgerInsert: async () => {
              throw new Error("synthetic_ledger_failure");
            },
          },
        ),
      /synthetic_ledger_failure/,
    );

    const [final] = await db
      .select()
      .from(loyaltyReceipts)
      .where(eq(loyaltyReceipts.id, receipt.id));
    assert.equal(final?.status, "pending_staff");

    const ledger = await db
      .select()
      .from(loyaltyLedgerEntries)
      .where(eq(loyaltyLedgerEntries.sourceRecordId, receipt.id));
    assert.equal(ledger.length, 0);

    const retry = await approveReceipt(db, {
      receiptId: receipt.id,
      actor: "tester",
    });
    assert.equal(retry.ok, true);
  });

  it("reject after verify is refused", async () => {
    const receipt = await pendingReceipt("after-verify");
    await approveReceipt(db, { receiptId: receipt.id, actor: "a" });
    const rejected = await rejectReceipt(db, {
      receiptId: receipt.id,
      actor: "b",
    });
    assert.equal(rejected.ok, false);
    if (!rejected.ok) assert.equal(rejected.code, "already_verified");
  });
});
