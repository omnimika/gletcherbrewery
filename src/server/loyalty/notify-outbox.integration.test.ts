/**
 * Loyalty telegram_agent outbox: enqueue on receipt/agent create; worker delivers.
 * Skip when DATABASE_URL unset. Does not call live Telegram.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { and, eq } from "drizzle-orm";
import { closeDb, createDb, type AppDb } from "@/server/db/client";
import { deliveryJobs, loyaltyMembers } from "@/server/db/schema";
import { LOYALTY_TELEGRAM_DESTINATION } from "@/server/forms/contracts";
import { FakeSuccessAdapter } from "@/server/forms/delivery-adapters";
import { processDeliveryBatch } from "@/server/forms/worker";
import { createAgentApplication } from "./agent-applications";
import { createManualReceipt } from "./receipts";
import type postgres from "postgres";

const url = process.env.DATABASE_URL;
const describeDb = url ? describe : describe.skip;

describeDb("loyalty telegram_agent outbox", () => {
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

  it("receipt create enqueues telegram_agent job; worker delivers via adapter", async () => {
    const created = await createManualReceipt(db, {
      email: `tg.receipt.${Date.now()}@example.com`,
      gletcherSumRub: 500,
      city: "Москва",
      purchaseAt: "2026-11-16",
      venueName: "Test",
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    const [job] = await db
      .select()
      .from(deliveryJobs)
      .where(
        and(
          eq(deliveryJobs.sourceKind, "loyalty_receipt"),
          eq(deliveryJobs.sourceId, created.receipt.id),
          eq(deliveryJobs.destination, LOYALTY_TELEGRAM_DESTINATION),
        ),
      )
      .limit(1);
    assert.ok(job);
    assert.equal(job!.status, "pending");
    assert.equal(job!.submissionId, null);

    // Drain older pending outbox jobs so this receipt job is claimed.
    let doneStatus = "pending";
    for (let i = 0; i < 40; i++) {
      const { processed } = await processDeliveryBatch({
        db,
        adapters: [
          new FakeSuccessAdapter("telegram"),
          new FakeSuccessAdapter(LOYALTY_TELEGRAM_DESTINATION),
        ],
        owner: `test-loyalty-tg-${i}`,
        batchSize: 50,
      });
      const [done] = await db
        .select()
        .from(deliveryJobs)
        .where(eq(deliveryJobs.id, job!.id))
        .limit(1);
      doneStatus = done?.status ?? "missing";
      if (doneStatus === "delivered") break;
      if (processed === 0) break;
    }
    assert.equal(doneStatus, "delivered");
  });

  it("new agent application enqueues telegram_agent; replay does not duplicate", async () => {
    const [member] = await db
      .insert(loyaltyMembers)
      .values({
        emailNormalized: `tg.agent.${Date.now()}@example.com`,
        displayName: "TG Agent",
        phone: "+79001112233",
        city: "Москва",
      })
      .returning();

    const payload = {
      memberId: member!.id,
      phone: "+79001112233",
      city: "Москва",
      venueName: "Бар TG",
      venueType: "Бар",
      venueAddress: "ул. 1",
      venueBoss: null,
      comment: null,
    };

    const first = await createAgentApplication(db, payload);
    assert.equal(first.ok, true);
    if (!first.ok) return;

    const jobs = await db
      .select()
      .from(deliveryJobs)
      .where(
        and(
          eq(deliveryJobs.sourceKind, "loyalty_agent_application"),
          eq(deliveryJobs.sourceId, first.application.id),
          eq(deliveryJobs.destination, LOYALTY_TELEGRAM_DESTINATION),
        ),
      );
    assert.equal(jobs.length, 1);

    const replay = await createAgentApplication(db, payload);
    assert.equal(replay.ok, true);
    if (!replay.ok) return;
    assert.equal(replay.replay, true);

    const jobsAfter = await db
      .select()
      .from(deliveryJobs)
      .where(
        and(
          eq(deliveryJobs.sourceKind, "loyalty_agent_application"),
          eq(deliveryJobs.sourceId, first.application.id),
          eq(deliveryJobs.destination, LOYALTY_TELEGRAM_DESTINATION),
        ),
      );
    assert.equal(jobsAfter.length, 1);
  });
});
