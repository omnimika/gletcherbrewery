/**
 * Staff triage commands against real PostgreSQL.
 * Skip when DATABASE_URL is unset.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { closeDb, createDb, type AppDb } from "@/server/db/client";
import { deliveryJobs, staffLeadEvents } from "@/server/db/schema";
import { FORM_DEFINITIONS } from "@/server/forms/contracts";
import { submitForm } from "@/server/forms/submit";
import { CONTACTS_FORM_ID } from "@/content/forms/contacts-contract";
import {
  applyStaffCommand,
  replayDeliveryJob,
} from "./commands";
import type postgres from "postgres";

const url = process.env.DATABASE_URL;
const describeDb = url ? describe : describe.skip;

describeDb("staff commands integration", () => {
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

  async function createLead() {
    const result = await submitForm(db, {
      def,
      locale: "ru",
      sourcePath: "/contacts",
      placement: "staff-test",
      idempotencyKey: randomUUID(),
      fields: {
        name: "Staff Triage Synthetic",
        email: "staff.triage@example.com",
        phone: "+7 495 000-00-00",
        city: null,
        company: null,
        comment: "staff triage integration — synthetic",
      },
    });
    assert.equal(result.kind, "created");
    if (result.kind !== "created") throw new Error("expected created");
    return result.submissionId;
  }

  it("set_status + assign + note write audit events", async () => {
    const id = await createLead();
    const actor = { id: "tester" };

    const status = await applyStaffCommand(db, id, actor, {
      action: "set_status",
      workflowStatus: "in_progress",
    });
    assert.equal(status.ok, true);
    if (!status.ok) return;
    assert.equal(status.lead.workflowStatus, "in_progress");

    const assigned = await applyStaffCommand(db, id, actor, {
      action: "assign",
      assignee: "mika",
    });
    assert.equal(assigned.ok, true);

    const noted = await applyStaffCommand(db, id, actor, {
      action: "note",
      note: "called back",
    });
    assert.equal(noted.ok, true);

    const events = await db
      .select()
      .from(staffLeadEvents)
      .where(eq(staffLeadEvents.submissionId, id));
    assert.ok(events.length >= 3);

    const publicRows = await sql`
      SELECT workflow_status, assignee, staff_note
      FROM public.staff_contact_leads
      WHERE submission_id = ${id}::uuid
    `;
    assert.equal(publicRows[0]?.workflow_status, "in_progress");
    assert.equal(publicRows[0]?.assignee, "mika");
    assert.equal(publicRows[0]?.staff_note, "called back");
  });

  it("replays failed telegram job to pending", async () => {
    const id = await createLead();
    const jobs = await db
      .select()
      .from(deliveryJobs)
      .where(eq(deliveryJobs.submissionId, id));
    const job = jobs.find((j) => j.destination === "telegram");
    assert.ok(job);

    await db
      .update(deliveryJobs)
      .set({ status: "failed", lastError: "synthetic_fail", attempts: 3 })
      .where(eq(deliveryJobs.id, job!.id));

    const replay = await replayDeliveryJob(db, job!.id, { id: "tester" });
    assert.equal(replay.ok, true);

    const refreshed = await db
      .select()
      .from(deliveryJobs)
      .where(eq(deliveryJobs.id, job!.id));
    assert.equal(refreshed[0]?.status, "pending");
  });
});
