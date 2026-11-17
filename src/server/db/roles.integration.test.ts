/**
 * R02 negative privilege checks against real PostgreSQL roles.
 * Requires DATABASE_URL (app), WORKER_DATABASE_URL, NOCODB_DATABASE_URL.
 * Skip when any URL is unset. No live Telegram/SMTP.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { createDb } from "@/server/db/client";
import { deliveryJobs } from "@/server/db/schema";
import { FORM_DEFINITIONS } from "@/server/forms/contracts";
import { submitForm } from "@/server/forms/submit";
import { CONTACTS_FORM_ID } from "@/content/forms/contacts-contract";
import { FakeSuccessAdapter } from "@/server/forms/delivery-adapters";
import { processDeliveryBatch } from "@/server/forms/worker";

const appUrl = process.env.DATABASE_URL;
const workerUrl = process.env.WORKER_DATABASE_URL;
const nocodbUrl = process.env.NOCODB_DATABASE_URL;

const describeDb =
  appUrl && workerUrl && nocodbUrl ? describe : describe.skip;

function isPermissionDenied(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  return code === "42501";
}

async function expectDenied(
  label: string,
  fn: () => Promise<unknown>,
): Promise<void> {
  try {
    await fn();
    assert.fail(`${label}: expected permission denied`);
  } catch (err) {
    assert.ok(
      isPermissionDenied(err),
      `${label}: expected 42501, got ${String(err)}`,
    );
  }
}

describeDb("R02 role least privilege", () => {
  let app: postgres.Sql;
  let worker: postgres.Sql;
  let nocodb: postgres.Sql;

  before(() => {
    app = postgres(appUrl!, { max: 1, prepare: false });
    worker = postgres(workerUrl!, { max: 1, prepare: false });
    nocodb = postgres(nocodbUrl!, { max: 1, prepare: false });
  });

  after(async () => {
    await app.end({ timeout: 5 });
    await worker.end({ timeout: 5 });
    await nocodb.end({ timeout: 5 });
  });

  it("app can read forms and cannot UPDATE/DELETE ledger", async () => {
    const rows = await app`SELECT id FROM app.form_submissions LIMIT 1`;
    assert.ok(Array.isArray(rows));

    await expectDenied("app UPDATE ledger", () =>
      app`UPDATE app.loyalty_ledger_entries SET amount = amount WHERE false`,
    );
    await expectDenied("app DELETE ledger", () =>
      app`DELETE FROM app.loyalty_ledger_entries WHERE false`,
    );
  });

  it("app may INSERT ledger (append-only path)", async () => {
    // Privilege check only — constraint may fail without member FK.
    // INSERT … SELECT WHERE false never writes a row but still needs INSERT right.
    await app`
      INSERT INTO app.loyalty_ledger_entries (
        member_id, entry_kind, amount, source_system, source_record_id
      )
      SELECT id, 'adjustment', 0, 'r02_perm_probe', 'never'
      FROM app.loyalty_members
      WHERE false
    `;
  });

  it("worker can touch delivery jobs but not loyalty/auth tables", async () => {
    const jobs = await worker`SELECT id, status FROM app.delivery_jobs LIMIT 1`;
    assert.ok(Array.isArray(jobs));

    // Allowed delivery payload columns.
    await worker`
      SELECT id, form_id, source_path, locale, fields
      FROM app.form_submissions
      LIMIT 1
    `;

    await expectDenied("worker SELECT email_normalized on members", () =>
      worker`SELECT email_normalized FROM app.loyalty_members LIMIT 1`,
    );
    await expectDenied("worker SELECT magic tokens", () =>
      worker`SELECT token_hash FROM app.loyalty_magic_link_tokens LIMIT 1`,
    );
    await expectDenied("worker SELECT sessions", () =>
      worker`SELECT session_hash FROM app.loyalty_member_sessions LIMIT 1`,
    );
    await expectDenied("worker INSERT ledger", () =>
      worker`
        INSERT INTO app.loyalty_ledger_entries (
          member_id, entry_kind, amount, source_system, source_record_id
        )
        SELECT id, 'adjustment', 0, 'r02', 'x'
        FROM app.loyalty_members
        WHERE false
      `,
    );
    await expectDenied("worker SELECT consents", () =>
      worker`SELECT id FROM app.submission_consents LIMIT 1`,
    );
  });

  it("worker cannot SELECT non-payload form_submissions columns", async () => {
    await expectDenied("worker SELECT intent_hash", () =>
      worker`SELECT intent_hash FROM app.form_submissions LIMIT 1`,
    );
    await expectDenied("worker SELECT * form_submissions", () =>
      worker`SELECT * FROM app.form_submissions LIMIT 1`,
    );
  });

  it("nocodb is SELECT-only on staff leads and denied on outbox/loyalty", async () => {
    const leads = await nocodb`
      SELECT submission_id FROM public.staff_contact_leads LIMIT 1
    `;
    assert.ok(Array.isArray(leads));

    await expectDenied("nocodb INSERT staff leads", () =>
      nocodb`
        INSERT INTO public.staff_contact_leads
        SELECT * FROM public.staff_contact_leads WHERE false
      `,
    );
    await expectDenied("nocodb UPDATE staff leads", () =>
      nocodb`UPDATE public.staff_contact_leads SET name = name WHERE false`,
    );
    await expectDenied("nocodb SELECT delivery_jobs", () =>
      nocodb`SELECT id FROM app.delivery_jobs LIMIT 1`,
    );
    await expectDenied("nocodb SELECT loyalty_members", () =>
      nocodb`SELECT id FROM app.loyalty_members LIMIT 1`,
    );
    await expectDenied("nocodb SELECT ledger", () =>
      nocodb`SELECT id FROM app.loyalty_ledger_entries LIMIT 1`,
    );
  });

  it("worker cannot ALTER schema / create tables", async () => {
    await expectDenied("worker CREATE TABLE", () =>
      worker`CREATE TABLE app.r02_should_fail (id int)`,
    );
  });

  it("processDeliveryBatch succeeds under WORKER_DATABASE_URL", async () => {
    const { db: appDb, sql: appSql } = createDb(appUrl!);
    const def = FORM_DEFINITIONS[CONTACTS_FORM_ID]!;
    try {
      const result = await submitForm(appDb, {
        def,
        locale: "ru",
        sourcePath: "/contacts",
        placement: "r02-worker-role",
        idempotencyKey: randomUUID(),
        fields: {
          name: "R02 Worker Role",
          email: "r02.worker@example.com",
          phone: "+7 495 000-00-02",
          city: null,
          company: null,
          comment: "worker credential smoke",
        },
      });
      assert.equal(result.kind, "created");
      if (result.kind !== "created") throw new Error("expected created");

      const { db: workerDb, sql: workerSql } = createDb(workerUrl!);
      try {
        const batch = await processDeliveryBatch({
          db: workerDb,
          owner: "r02-worker-role",
          adapters: [new FakeSuccessAdapter("telegram")],
        });
        assert.ok(
          batch.results.some(
            (r) => r.outcome === "delivered" || r.outcome === "stale_lease_dropped",
          ),
        );

        const jobs = await appDb
          .select()
          .from(deliveryJobs)
          .where(eq(deliveryJobs.submissionId, result.submissionId));
        const tg = jobs.find((j) => j.destination === "telegram");
        assert.equal(tg?.status, "delivered");
      } finally {
        await workerSql.end({ timeout: 5 });
      }
    } finally {
      await appSql.end({ timeout: 5 });
    }
  });
});
