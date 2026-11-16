import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { AppDb } from "@/server/db/client";
import {
  loyaltyImportIdentityMap,
  loyaltyMembers,
} from "@/server/db/schema";
import { normalizeMemberEmail } from "@/server/loyalty/normalize-alias";
import {
  AIRTABLE_LOYALTY_TABLES,
  LOYALTY_IMPORT_SOURCE_SYSTEM,
} from "./tables";
import type { StagingRowDraft } from "./types";

export type IdentityResolution = {
  /** source record id → target uuid for users that will be/were applied */
  userTargets: Map<string, string>;
  /** emails already claimed in this batch (normalized) */
  claimedEmails: Map<string, string>;
};

/**
 * Resolve member identities for apply: reuse existing airtable/email rows,
 * allocate new UUIDs for new members. Quarantined user rows are skipped.
 */
export async function resolveMemberIdentities(
  db: AppDb,
  batchId: string,
  drafts: StagingRowDraft[],
): Promise<IdentityResolution> {
  const userTargets = new Map<string, string>();
  const claimedEmails = new Map<string, string>();

  const userDrafts = drafts.filter(
    (d) =>
      d.sourceTableId === AIRTABLE_LOYALTY_TABLES.users &&
      d.parseStatus === "ok",
  );

  for (const d of userDrafts) {
    const fields = (d.rawJson.fields ?? {}) as Record<string, unknown>;
    const emailRaw = String(fields.email ?? "");
    const email = normalizeMemberEmail(emailRaw);

    const existingMap = await db
      .select()
      .from(loyaltyImportIdentityMap)
      .where(
        and(
          eq(loyaltyImportIdentityMap.sourceSystem, LOYALTY_IMPORT_SOURCE_SYSTEM),
          eq(loyaltyImportIdentityMap.tableId, AIRTABLE_LOYALTY_TABLES.users),
          eq(loyaltyImportIdentityMap.recordId, d.sourceRecordId),
        ),
      )
      .limit(1);
    if (existingMap[0]) {
      userTargets.set(d.sourceRecordId, existingMap[0].targetUuid);
      claimedEmails.set(email, d.sourceRecordId);
      continue;
    }

    const byAirtable = await db
      .select({ id: loyaltyMembers.id })
      .from(loyaltyMembers)
      .where(eq(loyaltyMembers.airtableRecordId, d.sourceRecordId))
      .limit(1);
    if (byAirtable[0]) {
      userTargets.set(d.sourceRecordId, byAirtable[0].id);
      claimedEmails.set(email, d.sourceRecordId);
      continue;
    }

    const byEmail = await db
      .select({
        id: loyaltyMembers.id,
        airtableRecordId: loyaltyMembers.airtableRecordId,
      })
      .from(loyaltyMembers)
      .where(eq(loyaltyMembers.emailNormalized, email))
      .limit(1);
    if (byEmail[0]) {
      userTargets.set(d.sourceRecordId, byEmail[0].id);
      claimedEmails.set(email, d.sourceRecordId);
      continue;
    }

    const id = randomUUID();
    userTargets.set(d.sourceRecordId, id);
    claimedEmails.set(email, d.sourceRecordId);
    void batchId;
  }

  return { userTargets, claimedEmails };
}

export async function upsertIdentityMap(
  db: AppDb,
  input: {
    batchId: string;
    tableId: string;
    recordId: string;
    entityKind: string;
    targetUuid: string;
  },
) {
  const existing = await db
    .select()
    .from(loyaltyImportIdentityMap)
    .where(
      and(
        eq(loyaltyImportIdentityMap.sourceSystem, LOYALTY_IMPORT_SOURCE_SYSTEM),
        eq(loyaltyImportIdentityMap.tableId, input.tableId),
        eq(loyaltyImportIdentityMap.recordId, input.recordId),
      ),
    )
    .limit(1);
  if (existing[0]) return existing[0].targetUuid;

  await db.insert(loyaltyImportIdentityMap).values({
    batchId: input.batchId,
    sourceSystem: LOYALTY_IMPORT_SOURCE_SYSTEM,
    tableId: input.tableId,
    recordId: input.recordId,
    entityKind: input.entityKind,
    targetUuid: input.targetUuid,
  });
  return input.targetUuid;
}
