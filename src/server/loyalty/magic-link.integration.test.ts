/**
 * R03 magic-link consume: atomic unused→used + session; concurrent + rollback.
 * Skip when DATABASE_URL unset.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { eq } from "drizzle-orm";
import { closeDb, createDb, type AppDb } from "@/server/db/client";
import {
  loyaltyMagicLinkTokens,
  loyaltyMemberSessions,
} from "@/server/db/schema";
import {
  consumeMagicLink,
  issueMagicLink,
  _hashForTests,
} from "./magic-link";
import type postgres from "postgres";

const url = process.env.DATABASE_URL;
const describeDb = url ? describe : describe.skip;

describeDb("magic-link consume R03", () => {
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

  it("concurrent consume of one token yields a single session", async () => {
    const issued = await issueMagicLink(db, {
      email: `r03.concurrent.${Date.now()}@example.com`,
    });
    assert.equal(issued.ok, true);
    if (!issued.ok) return;

    const token = new URL(issued.verifyUrl).searchParams.get("token");
    assert.ok(token);

    const [a, b] = await Promise.all([
      consumeMagicLink(db, token!),
      consumeMagicLink(db, token!),
    ]);

    const wins = [a, b].filter((r) => r.ok);
    const losses = [a, b].filter((r) => !r.ok);
    assert.equal(wins.length, 1);
    assert.equal(losses.length, 1);
    if (!losses[0]!.ok) {
      assert.equal(losses[0].code, "consumed");
    }

    const hash = _hashForTests(token!);
    const tokenRows = await db
      .select()
      .from(loyaltyMagicLinkTokens)
      .where(eq(loyaltyMagicLinkTokens.tokenHash, hash));
    assert.ok(tokenRows[0]?.consumedAt);

    const win = wins[0]!;
    assert.equal(win.ok, true);
    if (!win.ok) return;

    const sessions = await db
      .select()
      .from(loyaltyMemberSessions)
      .where(eq(loyaltyMemberSessions.memberId, win.member.id));
    const fresh = sessions.filter(
      (s) => s.sessionHash === _hashForTests(win.sessionToken),
    );
    assert.equal(fresh.length, 1);
  });

  it("rolls back consume when session creation fails", async () => {
    const issued = await issueMagicLink(db, {
      email: `r03.rollback.${Date.now()}@example.com`,
    });
    assert.equal(issued.ok, true);
    if (!issued.ok) return;

    const token = new URL(issued.verifyUrl).searchParams.get("token");
    assert.ok(token);
    const hash = _hashForTests(token!);

    await assert.rejects(
      () =>
        consumeMagicLink(db, token!, {
          beforeSessionInsert: async () => {
            throw new Error("synthetic_session_failure");
          },
        }),
      /synthetic_session_failure/,
    );

    const tokenRows = await db
      .select()
      .from(loyaltyMagicLinkTokens)
      .where(eq(loyaltyMagicLinkTokens.tokenHash, hash));
    assert.equal(tokenRows[0]?.consumedAt, null);

    // Retry succeeds after failed attempt.
    const retry = await consumeMagicLink(db, token!);
    assert.equal(retry.ok, true);
  });
});
