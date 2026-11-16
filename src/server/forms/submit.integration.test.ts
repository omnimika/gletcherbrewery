/**
 * Real PostgreSQL integration tests for B1 intake.
 * Skip when DATABASE_URL is unset (do not mock the SQL driver).
 */
import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { createDb, closeDb, type AppDb } from "@/server/db/client";
import { deliveryJobs, formSubmissions, submissionConsents } from "@/server/db/schema";
import { FORM_DEFINITIONS } from "./contracts";
import { submitForm } from "./submit";
import { CONTACTS_FORM_ID } from "@/content/forms/contacts-contract";
import type postgres from "postgres";

const url = process.env.DATABASE_URL;
const describeDb = url ? describe : describe.skip;

describeDb("submitForm integration", () => {
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

  function baseInput(key = randomUUID()) {
    return {
      def,
      locale: "ru",
      sourcePath: "/contacts",
      placement: "test",
      idempotencyKey: key,
      fields: {
        name: "Synthetic Contact",
        email: "synthetic.b1@example.com",
        phone: "+7 495 989-24-14",
        city: "Клин",
        company: null,
        comment: "B1 integration synthetic — not production PII",
      },
    };
  }

  it("creates submission + consent + outbox in one transaction", async () => {
    const key = randomUUID();
    const result = await submitForm(db, baseInput(key));
    assert.equal(result.kind, "created");
    if (result.kind !== "created") return;

    const consents = await db
      .select()
      .from(submissionConsents)
      .where(eq(submissionConsents.submissionId, result.submissionId));
    assert.equal(consents.length, 1);

    const jobs = await db
      .select()
      .from(deliveryJobs)
      .where(eq(deliveryJobs.submissionId, result.submissionId));
    assert.equal(jobs.length, 1);
    assert.equal(jobs[0]?.destination, "telegram");
    assert.ok(jobs.every((j) => j.status === "pending"));
  });

  it("replays same key + same payload", async () => {
    const key = randomUUID();
    const first = await submitForm(db, baseInput(key));
    const second = await submitForm(db, baseInput(key));
    assert.equal(first.kind, "created");
    assert.equal(second.kind, "replay");
    if (first.kind !== "created" || second.kind !== "replay") return;
    assert.equal(first.submissionId, second.submissionId);

    const rows = await db
      .select()
      .from(formSubmissions)
      .where(eq(formSubmissions.idempotencyKey, key));
    assert.equal(rows.length, 1);
  });

  it("conflicts on same key + changed payload", async () => {
    const key = randomUUID();
    const first = await submitForm(db, baseInput(key));
    assert.equal(first.kind, "created");
    const changed = baseInput(key);
    changed.fields = { ...changed.fields, name: "Changed Name" };
    const second = await submitForm(db, changed);
    assert.equal(second.kind, "conflict");
  });

  it("concurrent same-key submits do not duplicate", async () => {
    const key = randomUUID();
    const input = baseInput(key);
    const [a, b] = await Promise.all([submitForm(db, input), submitForm(db, input)]);
    const ids = [a, b]
      .filter((r): r is Extract<typeof r, { submissionId: string }> => r.kind !== "conflict")
      .map((r) => r.submissionId);
    assert.equal(new Set(ids).size, 1);
    const rows = await db
      .select()
      .from(formSubmissions)
      .where(eq(formSubmissions.idempotencyKey, key));
    assert.equal(rows.length, 1);
  });
});
