/**
 * M2-3 R08: intent replay, one active app, staff status + audit, no ledger earn.
 * Skip when DATABASE_URL unset.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { eq } from "drizzle-orm";
import { closeDb, createDb, type AppDb } from "@/server/db/client";
import {
  loyaltyAgentApplicationEvents,
  loyaltyLedgerEntries,
  loyaltyMembers,
} from "@/server/db/schema";
import {
  createAgentApplication,
  latestOpenAgentApplication,
  setAgentApplicationStatus,
} from "./agent-applications";
import type postgres from "postgres";

const url = process.env.DATABASE_URL;
const describeDb = url ? describe : describe.skip;

describeDb("agent applications R08", () => {
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

  async function member(suffix: string) {
    const email = `r08.${suffix}.${Date.now()}@example.com`;
    const [row] = await db
      .insert(loyaltyMembers)
      .values({
        emailNormalized: email,
        displayName: `R08 ${suffix}`,
        phone: "+79001112233",
        city: "Москва",
      })
      .returning();
    return row!;
  }

  const payload = {
    phone: "+7 900 111-22-33",
    city: "Москва",
    venueName: "Бар Интеграция",
    venueType: "Бар",
    venueAddress: "ул. Тест, 1",
    venueBoss: "Босс",
    comment: "smoke",
  };

  it("same intent replays the same application id", async () => {
    const m = await member("replay");
    const first = await createAgentApplication(db, {
      memberId: m.id,
      ...payload,
    });
    assert.equal(first.ok, true);
    if (!first.ok) return;
    assert.equal(first.replay, false);

    const second = await createAgentApplication(db, {
      memberId: m.id,
      ...payload,
    });
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.equal(second.replay, true);
    assert.equal(second.application.id, first.application.id);
  });

  it("different payload while active returns already_pending", async () => {
    const m = await member("conflict");
    const first = await createAgentApplication(db, {
      memberId: m.id,
      ...payload,
      venueName: "Бар А",
    });
    assert.equal(first.ok, true);

    const second = await createAgentApplication(db, {
      memberId: m.id,
      ...payload,
      venueName: "Бар Б",
    });
    assert.equal(second.ok, false);
    if (second.ok) return;
    assert.equal(second.code, "already_pending");
  });

  it("staff status writes audit and public note; no ledger earn", async () => {
    const m = await member("status");
    const created = await createAgentApplication(db, {
      memberId: m.id,
      ...payload,
      venueName: "Бар Статус",
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    const set = await setAgentApplicationStatus(db, {
      applicationId: created.application.id,
      status: "approved",
      actor: "staff:tester",
      publicNote: "Ждём звонка",
      reason: "ok venue",
    });
    assert.equal(set.ok, true);
    if (!set.ok) return;
    assert.equal(set.already, false);
    assert.equal(set.application.status, "approved");
    assert.equal(set.application.publicNote, "Ждём звонка");

    const open = await latestOpenAgentApplication(db, m.id);
    assert.ok(open);
    assert.equal(open!.status, "approved");
    assert.equal(open!.publicNote, "Ждём звонка");

    const events = await db
      .select()
      .from(loyaltyAgentApplicationEvents)
      .where(
        eq(
          loyaltyAgentApplicationEvents.applicationId,
          created.application.id,
        ),
      );
    assert.ok(events.some((e) => e.action === "created"));
    assert.ok(events.some((e) => e.action === "status_set"));

    const ledger = await db
      .select()
      .from(loyaltyLedgerEntries)
      .where(eq(loyaltyLedgerEntries.memberId, m.id));
    assert.equal(ledger.length, 0);

    const again = await setAgentApplicationStatus(db, {
      applicationId: created.application.id,
      status: "approved",
      actor: "staff:tester",
      publicNote: "Ждём звонка",
    });
    assert.equal(again.ok, true);
    if (!again.ok) return;
    assert.equal(again.already, true);
  });

  it("rejected frees the slot for a new application", async () => {
    const m = await member("reapply");
    const first = await createAgentApplication(db, {
      memberId: m.id,
      ...payload,
      venueName: "Бар Отказ",
    });
    assert.equal(first.ok, true);
    if (!first.ok) return;

    const rejected = await setAgentApplicationStatus(db, {
      applicationId: first.application.id,
      status: "rejected",
      actor: "staff:tester",
      publicNote: "Не наш формат",
    });
    assert.equal(rejected.ok, true);

    const second = await createAgentApplication(db, {
      memberId: m.id,
      ...payload,
      venueName: "Бар Новый",
    });
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.equal(second.replay, false);
    assert.notEqual(second.application.id, first.application.id);
  });
});
