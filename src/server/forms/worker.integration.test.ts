/**
 * Delivery worker lease recovery / fencing against real PostgreSQL.
 * Skip when DATABASE_URL is unset. No live Telegram.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { closeDb, createDb, type AppDb } from "@/server/db/client";
import { deliveryAttempts, deliveryJobs } from "@/server/db/schema";
import { FORM_DEFINITIONS } from "@/server/forms/contracts";
import { submitForm } from "@/server/forms/submit";
import { CONTACTS_FORM_ID } from "@/content/forms/contacts-contract";
import { FakeSuccessAdapter } from "@/server/forms/delivery-adapters";
import {
  finishAttempt,
  processDeliveryBatch,
} from "@/server/forms/worker";
import { replayDeliveryJob } from "@/server/staff/commands";
import type postgres from "postgres";

const url = process.env.DATABASE_URL;
const describeDb = url ? describe : describe.skip;

describeDb("delivery worker lease recovery", () => {
  const def = FORM_DEFINITIONS[CONTACTS_FORM_ID]!;
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

  async function createTelegramJob() {
    const result = await submitForm(db, {
      def,
      locale: "ru",
      sourcePath: "/contacts",
      placement: "worker-lease-test",
      idempotencyKey: randomUUID(),
      fields: {
        name: "Lease Recovery Synthetic",
        email: "lease.recovery@example.com",
        phone: "+7 495 000-00-01",
        city: null,
        company: null,
        comment: "worker lease integration — synthetic",
      },
    });
    assert.equal(result.kind, "created");
    if (result.kind !== "created") throw new Error("expected created");
    const jobs = await db
      .select()
      .from(deliveryJobs)
      .where(eq(deliveryJobs.submissionId, result.submissionId));
    const job = jobs.find((j) => j.destination === "telegram");
    assert.ok(job);
    return job!;
  }

  it("reclaims expired leased and delivers once", async () => {
    const job = await createTelegramJob();
    const past = new Date(Date.now() - 120_000);

    await db
      .update(deliveryJobs)
      .set({
        status: "leased",
        leaseOwner: "dead-worker",
        leaseToken: "stale-token",
        leaseExpiresAt: past,
        nextAttemptAt: past,
        updatedAt: past,
      })
      .where(eq(deliveryJobs.id, job.id));

    const batch = await processDeliveryBatch({
      db,
      owner: "recover-worker",
      adapters: [new FakeSuccessAdapter("telegram")],
      batchSize: 20,
    });

    assert.ok(batch.results.some((r) => r.jobId === job.id && r.outcome === "delivered"));

    const refreshed = await db
      .select()
      .from(deliveryJobs)
      .where(eq(deliveryJobs.id, job.id));
    assert.equal(refreshed[0]?.status, "delivered");
    assert.equal(refreshed[0]?.leaseToken, null);
  });

  it("drops stale ack after lease reclaim", async () => {
    const job = await createTelegramJob();
    const past = new Date(Date.now() - 120_000);
    const staleToken = "old-lease-token";
    const staleOwner = "old-worker";

    await db
      .update(deliveryJobs)
      .set({
        status: "leased",
        leaseOwner: staleOwner,
        leaseToken: staleToken,
        leaseExpiresAt: past,
        nextAttemptAt: past,
        attempts: 0,
        updatedAt: past,
      })
      .where(eq(deliveryJobs.id, job.id));

    // New worker reclaims and delivers.
    const batch = await processDeliveryBatch({
      db,
      owner: "new-worker",
      adapters: [new FakeSuccessAdapter("telegram")],
    });
    assert.ok(batch.results.some((r) => r.jobId === job.id && r.applied === true));

    // Late ack from the expired lease must not rewrite status or add attempts.
    const stale = await finishAttempt(
      db,
      { ...job, attempts: 0, status: "leased" },
      staleToken,
      staleOwner,
      {
        outcome: "failed",
        sanitizedError: "stale_should_not_apply",
      },
      new Date(),
    );
    assert.equal(stale.applied, false);

    const attempts = await db
      .select()
      .from(deliveryAttempts)
      .where(eq(deliveryAttempts.jobId, job.id));
    const delivered = attempts.filter((a) => a.outcome === "delivered");
    assert.equal(delivered.length, 1);
    assert.notEqual(delivered[0]?.leaseToken, staleToken);
    assert.equal(
      attempts.filter((a) => a.sanitizedError === "stale_should_not_apply").length,
      0,
    );

    const refreshed = await db
      .select()
      .from(deliveryJobs)
      .where(eq(deliveryJobs.id, job.id));
    assert.equal(refreshed[0]?.status, "delivered");
  });

  it("refuses replay while lease is active", async () => {
    const job = await createTelegramJob();
    const future = new Date(Date.now() + 60_000);

    await db
      .update(deliveryJobs)
      .set({
        status: "leased",
        leaseOwner: "busy",
        leaseToken: "live",
        leaseExpiresAt: future,
        updatedAt: new Date(),
      })
      .where(eq(deliveryJobs.id, job.id));

    const replay = await replayDeliveryJob(db, job.id, { id: "tester" });
    assert.equal(replay.ok, false);
    if (!replay.ok) assert.equal(replay.code, "active_lease");

    const refreshed = await db
      .select()
      .from(deliveryJobs)
      .where(eq(deliveryJobs.id, job.id));
    assert.equal(refreshed[0]?.status, "leased");
  });

  it("refuses replay of delivered job", async () => {
    const job = await createTelegramJob();
    await db
      .update(deliveryJobs)
      .set({ status: "delivered", remoteReference: "tg:test:1" })
      .where(eq(deliveryJobs.id, job.id));

    const replay = await replayDeliveryJob(db, job.id, { id: "tester" });
    assert.equal(replay.ok, false);
    if (!replay.ok) assert.equal(replay.code, "not_replayable");
  });
});
