import { and, eq, inArray } from "drizzle-orm";
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
  userTargets: Map<string, string>;
  claimedEmails: Map<string, string>;
};

/**
 * Resolve member identities for apply (batched; OK for thousands of users).
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
  if (!userDrafts.length) return { userTargets, claimedEmails };

  const recordIds = userDrafts.map((d) => d.sourceRecordId);
  const emails = userDrafts.map((d) => {
    const fields = (d.rawJson.fields ?? {}) as Record<string, unknown>;
    return normalizeMemberEmail(String(fields.email ?? ""));
  });

  async function chunkedInArray<T>(
    ids: string[],
    run: (slice: string[]) => Promise<T[]>,
  ): Promise<T[]> {
    const out: T[] = [];
    const size = 400;
    for (let i = 0; i < ids.length; i += size) {
      const slice = ids.slice(i, i + size);
      if (!slice.length) continue;
      out.push(...(await run(slice)));
    }
    return out;
  }

  const existingMaps = await chunkedInArray(recordIds, (slice) =>
    db
      .select()
      .from(loyaltyImportIdentityMap)
      .where(
        and(
          eq(
            loyaltyImportIdentityMap.sourceSystem,
            LOYALTY_IMPORT_SOURCE_SYSTEM,
          ),
          eq(loyaltyImportIdentityMap.tableId, AIRTABLE_LOYALTY_TABLES.users),
          inArray(loyaltyImportIdentityMap.recordId, slice),
        ),
      ),
  );
  const mapByRecord = new Map(
    existingMaps.map((r) => [r.recordId, r.targetUuid] as const),
  );

  const byAirtable = await chunkedInArray(recordIds, (slice) =>
    db
      .select({
        id: loyaltyMembers.id,
        airtableRecordId: loyaltyMembers.airtableRecordId,
      })
      .from(loyaltyMembers)
      .where(inArray(loyaltyMembers.airtableRecordId, slice)),
  );
  const memberByAirtable = new Map(
    byAirtable
      .filter((r) => r.airtableRecordId)
      .map((r) => [r.airtableRecordId!, r.id] as const),
  );

  const byEmail = await chunkedInArray(emails, (slice) =>
    db
      .select({
        id: loyaltyMembers.id,
        emailNormalized: loyaltyMembers.emailNormalized,
      })
      .from(loyaltyMembers)
      .where(inArray(loyaltyMembers.emailNormalized, slice)),
  );
  const memberByEmail = new Map(
    byEmail.map((r) => [r.emailNormalized, r.id] as const),
  );

  for (const d of userDrafts) {
    const fields = (d.rawJson.fields ?? {}) as Record<string, unknown>;
    const email = normalizeMemberEmail(String(fields.email ?? ""));

    const fromMap = mapByRecord.get(d.sourceRecordId);
    if (fromMap) {
      userTargets.set(d.sourceRecordId, fromMap);
      claimedEmails.set(email, d.sourceRecordId);
      continue;
    }
    const fromAirtable = memberByAirtable.get(d.sourceRecordId);
    if (fromAirtable) {
      userTargets.set(d.sourceRecordId, fromAirtable);
      claimedEmails.set(email, d.sourceRecordId);
      continue;
    }
    const fromEmail = memberByEmail.get(email);
    if (fromEmail) {
      userTargets.set(d.sourceRecordId, fromEmail);
      claimedEmails.set(email, d.sourceRecordId);
      continue;
    }
    const id = randomUUID();
    userTargets.set(d.sourceRecordId, id);
    claimedEmails.set(email, d.sourceRecordId);
  }

  void batchId;
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

export async function bulkUpsertIdentityMaps(
  db: AppDb,
  batchId: string,
  rows: Array<{
    tableId: string;
    recordId: string;
    entityKind: string;
    targetUuid: string;
  }>,
) {
  if (!rows.length) return 0;
  const recordIds = rows.map((r) => r.recordId);
  const existing = await db
    .select()
    .from(loyaltyImportIdentityMap)
    .where(
      and(
        eq(loyaltyImportIdentityMap.sourceSystem, LOYALTY_IMPORT_SOURCE_SYSTEM),
        inArray(loyaltyImportIdentityMap.recordId, recordIds),
      ),
    );
  const have = new Set(
    existing
      .filter((e) => rows.some((r) => r.tableId === e.tableId && r.recordId === e.recordId))
      .map((e) => `${e.tableId}:${e.recordId}`),
  );
  const toInsert = rows.filter((r) => !have.has(`${r.tableId}:${r.recordId}`));
  const chunk = 200;
  for (let i = 0; i < toInsert.length; i += chunk) {
    const slice = toInsert.slice(i, i + chunk);
    await db.insert(loyaltyImportIdentityMap).values(
      slice.map((r) => ({
        batchId,
        sourceSystem: LOYALTY_IMPORT_SOURCE_SYSTEM,
        tableId: r.tableId,
        recordId: r.recordId,
        entityKind: r.entityKind,
        targetUuid: r.targetUuid,
      })),
    );
  }
  return toInsert.length;
}
