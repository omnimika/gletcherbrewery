import { createHash, randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  loyaltyAgentApplications,
  loyaltyLedgerEntries,
  loyaltyMembers,
  loyaltyReceipts,
} from "@/server/db/schema";
import {
  legacyCheckImportStatus,
  LEGACY_CHECK_POLICY_VERSION,
} from "@/server/loyalty/legacy-policy";
import { normalizeMemberEmail } from "@/server/loyalty/normalize-alias";
import { sanitizeLegacyPhotoUrl } from "@/server/loyalty/photo-store";
import {
  bulkUpsertIdentityMaps,
  resolveMemberIdentities,
  upsertIdentityMap,
} from "./map-identity";
import {
  AIRTABLE_LOYALTY_TABLES,
  LOYALTY_IMPORT_SOURCE_SYSTEM,
  mapAgentStatusRu,
} from "./tables";
import {
  toRuntimeEligibility,
  type LoyaltyImportManifest,
  type StagingRowDraft,
} from "./types";

function asString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return null;
}

function asNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function firstLinkId(v: unknown): string | null {
  if (typeof v === "string" && v) return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return null;
}

function fieldsOf(d: StagingRowDraft): Record<string, unknown> {
  return (d.rawJson.fields ?? {}) as Record<string, unknown>;
}

export type ApplyCounts = {
  members: number;
  receipts: number;
  ledgerEntries: number;
  agentApplications: number;
  identityMaps: number;
};

export async function applyLoyaltyStaging(
  db: AppDb,
  batchId: string,
  manifest: LoyaltyImportManifest,
  drafts: StagingRowDraft[],
): Promise<ApplyCounts> {
  const counts: ApplyCounts = {
    members: 0,
    receipts: 0,
    ledgerEntries: 0,
    agentApplications: 0,
    identityMaps: 0,
  };

  const { userTargets } = await resolveMemberIdentities(db, batchId, drafts);

  // Members (batched)
  {
    const userDrafts = drafts.filter(
      (d) =>
        d.sourceTableId === AIRTABLE_LOYALTY_TABLES.users &&
        d.parseStatus === "ok",
    );
    const targetIds = [
      ...new Set(
        userDrafts
          .map((d) => userTargets.get(d.sourceRecordId))
          .filter((x): x is string => !!x),
      ),
    ];
    const existing =
      targetIds.length === 0
        ? []
        : await db
            .select({ id: loyaltyMembers.id })
            .from(loyaltyMembers)
            .where(inArray(loyaltyMembers.id, targetIds));
    const existingIds = new Set(existing.map((r) => r.id));
    const toInsert: Array<{
      id: string;
      emailNormalized: string;
      displayName: string | null;
      phone: string | null;
      city: string | null;
      airtableRecordId: string;
    }> = [];
    const toUpdate: Array<{
      id: string;
      displayName: string | null;
      phone: string | null;
      city: string | null;
      airtableRecordId: string;
    }> = [];
    const identityRows: Array<{
      tableId: string;
      recordId: string;
      entityKind: string;
      targetUuid: string;
    }> = [];

    for (const d of userDrafts) {
      const fields = fieldsOf(d);
      const email = normalizeMemberEmail(String(fields.email ?? ""));
      const targetId = userTargets.get(d.sourceRecordId);
      if (!targetId) continue;
      identityRows.push({
        tableId: AIRTABLE_LOYALTY_TABLES.users,
        recordId: d.sourceRecordId,
        entityKind: "member",
        targetUuid: targetId,
      });
      const row = {
        id: targetId,
        emailNormalized: email,
        displayName: asString(fields.displayName ?? fields.Имя),
        phone: asString(fields.phone ?? fields.Телефон),
        city: asString(fields.city ?? fields.Город),
        airtableRecordId: d.sourceRecordId,
      };
      if (existingIds.has(targetId)) {
        toUpdate.push({
          id: row.id,
          displayName: row.displayName,
          phone: row.phone,
          city: row.city,
          airtableRecordId: row.airtableRecordId,
        });
        continue;
      }
      toInsert.push(row);
      existingIds.add(targetId);
    }

    const chunk = 200;
    for (let i = 0; i < toInsert.length; i += chunk) {
      await db.insert(loyaltyMembers).values(toInsert.slice(i, i + chunk));
    }
    for (const u of toUpdate) {
      await db
        .update(loyaltyMembers)
        .set({
          airtableRecordId: u.airtableRecordId,
          displayName: u.displayName ?? undefined,
          phone: u.phone ?? undefined,
          city: u.city ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(loyaltyMembers.id, u.id));
    }
    counts.members += toInsert.length;
    counts.identityMaps += await bulkUpsertIdentityMaps(
      db,
      batchId,
      identityRows,
    );
  }

  const eligibilityBase = manifest.policy.legacyEligibility;

  // Checks → receipts + optional check_earn (batched)
  {
    const checkDrafts = drafts.filter(
      (d) =>
        d.sourceTableId === AIRTABLE_LOYALTY_TABLES.checks &&
        d.parseStatus === "ok",
    );
    const checkIds = checkDrafts.map((d) => d.sourceRecordId);
    const existingReceipts = await chunkSelectByIds(checkIds, (slice) =>
      db
        .select({
          id: loyaltyReceipts.id,
          airtableCheckId: loyaltyReceipts.airtableCheckId,
        })
        .from(loyaltyReceipts)
        .where(inArray(loyaltyReceipts.airtableCheckId, slice)),
    );
    const receiptByAirtable = new Map(
      existingReceipts
        .filter((r) => r.airtableCheckId)
        .map((r) => [r.airtableCheckId!, r.id] as const),
    );

    const receiptInserts: Array<{
      id: string;
      memberId: string;
      status: string;
      source: string;
      city: string | null;
      venueName: string | null;
      venueNetwork: string | null;
      purchaseAt: string | null;
      gletcherSumRub: string | null;
      proposedEarn: number | null;
      airtableCheckId: string;
      legacyPaidFlag: string;
      staffNote: string;
      reviewedBy: string | null;
      reviewedAt: Date | null;
      createdAt: Date;
      legacyPhotoUrl: string | null;
    }> = [];
    const identityRows: Array<{
      tableId: string;
      recordId: string;
      entityKind: string;
      targetUuid: string;
    }> = [];
    const ledgerInserts: Array<{
      memberId: string;
      entryKind: string;
      amount: number;
      status: string;
      sourceSystem: string;
      sourceRecordId: string;
      receiptId: string;
      eligibleSumRub: string | null;
      metadata: Record<string, unknown>;
    }> = [];

    for (const d of checkDrafts) {
      const fields = fieldsOf(d);
      const buyer = firstLinkId(fields.buyer ?? fields.Покупатель);
      if (!buyer) continue;
      const memberId = userTargets.get(buyer);
      if (!memberId) continue;

      const paidFlag = asString(fields.paidFlag ?? fields.Оплачено);
      const createdRaw = asString(fields.createdAt ?? fields.created_at);
      const sourceAt = createdRaw ? new Date(createdRaw) : null;
      const eligibility = toRuntimeEligibility(eligibilityBase, { sourceAt });
      const legacy = legacyCheckImportStatus(paidFlag, eligibility, {
        recordId: d.sourceRecordId,
      });
      const earn = asNumber(
        fields.earnAmount ?? fields["Биркоины начислить2"],
      );
      const gletcherSum = asNumber(
        fields.gletcherSumRub ?? fields.sumGletcher ?? fields.Сумма,
      );
      const city = asString(fields.city ?? fields.Город);
      const venueName = asString(
        fields.venueName ?? fields.Название ?? fields.venue,
      );
      const venueNetwork = asString(
        fields.buyplace ?? fields.venueNetwork ?? fields.Сеть,
      );
      const purchaseAt =
        sourceAt && !Number.isNaN(sourceAt.getTime())
          ? sourceAt.toISOString().slice(0, 10)
          : null;
      const legacyPhotoUrl = sanitizeLegacyPhotoUrl(
        asString(
          fields.legacyPhotoUrl ?? fields.check ?? fields.Check ?? fields.фото,
        ),
      );

      let receiptId = receiptByAirtable.get(d.sourceRecordId);
      if (!receiptId) {
        receiptId = randomUUID();
        receiptByAirtable.set(d.sourceRecordId, receiptId);
        receiptInserts.push({
          id: receiptId,
          memberId,
          status: legacy.receiptStatus,
          source: "legacy_airtable",
          city,
          venueName,
          venueNetwork,
          purchaseAt,
          gletcherSumRub: gletcherSum != null ? String(gletcherSum) : null,
          proposedEarn: earn,
          airtableCheckId: d.sourceRecordId,
          legacyPaidFlag: legacy.legacyPaidFlag,
          staffNote: `${legacy.note}; policy=${LEGACY_CHECK_POLICY_VERSION}`,
          reviewedBy: legacy.eligible ? "legacy_import" : null,
          reviewedAt: legacy.eligible ? new Date() : null,
          createdAt:
            sourceAt && !Number.isNaN(sourceAt.getTime())
              ? sourceAt
              : new Date(),
          legacyPhotoUrl,
        });
      }

      identityRows.push({
        tableId: AIRTABLE_LOYALTY_TABLES.checks,
        recordId: d.sourceRecordId,
        entityKind: "receipt",
        targetUuid: receiptId,
      });

      if (legacy.receiptStatus === "verified" && earn != null && earn > 0) {
        ledgerInserts.push({
          memberId,
          entryKind: "check_earn",
          amount: earn,
          status: "posted",
          sourceSystem: LOYALTY_IMPORT_SOURCE_SYSTEM,
          sourceRecordId: d.sourceRecordId,
          receiptId,
          eligibleSumRub: gletcherSum != null ? String(gletcherSum) : null,
          metadata: {
            importBatchId: batchId,
            policyVersion: LEGACY_CHECK_POLICY_VERSION,
            legacyPaidFlag: legacy.legacyPaidFlag,
          },
        });
      }
    }

    const chunk = 200;
    for (let i = 0; i < receiptInserts.length; i += chunk) {
      await db.insert(loyaltyReceipts).values(receiptInserts.slice(i, i + chunk));
    }
    counts.receipts += receiptInserts.length;
    counts.identityMaps += await bulkUpsertIdentityMaps(
      db,
      batchId,
      identityRows,
    );
    counts.ledgerEntries += await bulkInsertLedgerIfAbsent(db, ledgerInserts);
  }

  // Orders → shop_earn / spend (historical amounts, no recalc)
  for (const d of drafts) {
    if (
      d.sourceTableId !== AIRTABLE_LOYALTY_TABLES.orders ||
      d.parseStatus !== "ok"
    ) {
      continue;
    }
    const fields = fieldsOf(d);
    const buyer = firstLinkId(fields.buyer ?? fields.Покупатель);
    if (!buyer) continue;
    const memberId = userTargets.get(buyer);
    if (!memberId) continue;

    const earn = asNumber(
      fields.earnAmount ?? fields["Биркоины начислить2"],
    );
    const spend = asNumber(
      fields.spendAmount ?? fields["Биркоины списать"],
    );

    if (earn != null && earn > 0) {
      const inserted = await insertLedgerIfAbsent(db, {
        memberId,
        entryKind: "shop_earn",
        amount: earn,
        sourceRecordId: d.sourceRecordId,
        metadata: { importBatchId: batchId },
      });
      if (inserted) counts.ledgerEntries += 1;
    }
    if (spend != null && spend !== 0) {
      const amount = spend > 0 ? -Math.abs(spend) : spend;
      const inserted = await insertLedgerIfAbsent(db, {
        memberId,
        entryKind: "spend",
        amount,
        sourceRecordId: d.sourceRecordId,
        metadata: { importBatchId: batchId },
      });
      if (inserted) counts.ledgerEntries += 1;
    }

    await upsertIdentityMap(db, {
      batchId,
      tableId: AIRTABLE_LOYALTY_TABLES.orders,
      recordId: d.sourceRecordId,
      entityKind: "order",
      targetUuid: randomUUID(),
    });
    counts.identityMaps += 1;
  }

  // Agent applications (+ optional agent_earn)
  for (const d of drafts) {
    if (
      d.sourceTableId !== AIRTABLE_LOYALTY_TABLES.agents ||
      d.parseStatus !== "ok"
    ) {
      continue;
    }
    const fields = fieldsOf(d);
    const memberRec = firstLinkId(
      fields.member ?? fields.Агент ?? fields.buyer,
    );
    if (!memberRec) continue;
    const memberId = userTargets.get(memberRec);
    if (!memberId) continue;

    const status =
      mapAgentStatusRu(
        asString(fields.status ?? fields["Статус заявки"]),
      ) ?? "under_review";
    const phone =
      asString(fields.phone ?? fields.Телефон) ?? "unknown";
    const city = asString(fields.city ?? fields.Город) ?? "unknown";
    const venueName =
      asString(fields.venueName ?? fields["Название заведения"]) ??
      "unknown";
    const venueType =
      asString(fields.venueType ?? fields["Тип заведения"]) ?? "bar";
    const venueAddress =
      asString(fields.venueAddress ?? fields.Адрес) ?? "unknown";
    const intentKey = createHash("sha256")
      .update(`legacy:${d.sourceRecordId}`)
      .digest("hex")
      .slice(0, 32);

    const existingApp = await db
      .select({ id: loyaltyAgentApplications.id })
      .from(loyaltyAgentApplications)
      .where(eq(loyaltyAgentApplications.airtableAgentId, d.sourceRecordId))
      .limit(1);

    const createdRaw = asString(fields.createdAt ?? fields.created_at);
    const createdAt = createdRaw ? new Date(createdRaw) : null;

    let appId = existingApp[0]?.id;
    if (!appId) {
      appId = randomUUID();
      await db.insert(loyaltyAgentApplications).values({
        id: appId,
        memberId,
        status,
        phone,
        city,
        venueName,
        venueType,
        venueAddress,
        venueBoss: asString(fields.venueBoss ?? fields.Контакт),
        comment: asString(fields.comment ?? fields.Комментарий),
        intentKey,
        airtableAgentId: d.sourceRecordId,
        legacyOrderId: asString(fields.orderId ?? fields.order_id),
        createdAt:
          createdAt && !Number.isNaN(createdAt.getTime())
            ? createdAt
            : new Date(),
      });
      counts.agentApplications += 1;
    }

    await upsertIdentityMap(db, {
      batchId,
      tableId: AIRTABLE_LOYALTY_TABLES.agents,
      recordId: d.sourceRecordId,
      entityKind: "agent_application",
      targetUuid: appId,
    });
    counts.identityMaps += 1;

    const agentEarn = asNumber(
      fields.earnAmount ?? fields["Биркоины начислить агентские"],
    );
    if (agentEarn != null && agentEarn > 0) {
      const inserted = await insertLedgerIfAbsent(db, {
        memberId,
        entryKind: "agent_earn",
        amount: agentEarn,
        sourceRecordId: d.sourceRecordId,
        metadata: { importBatchId: batchId },
      });
      if (inserted) counts.ledgerEntries += 1;
    }
  }

  return counts;
}

async function chunkSelectByIds<T>(
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

async function insertLedgerIfAbsent(
  db: AppDb,
  input: {
    memberId: string;
    entryKind: string;
    amount: number;
    sourceRecordId: string;
    receiptId?: string;
    eligibleSumRub?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<boolean> {
  return (
    (await bulkInsertLedgerIfAbsent(db, [
      {
        memberId: input.memberId,
        entryKind: input.entryKind,
        amount: input.amount,
        status: "posted",
        sourceSystem: LOYALTY_IMPORT_SOURCE_SYSTEM,
        sourceRecordId: input.sourceRecordId,
        receiptId: input.receiptId,
        eligibleSumRub: input.eligibleSumRub ?? null,
        metadata: input.metadata ?? {},
      },
    ])) === 1
  );
}

async function bulkInsertLedgerIfAbsent(
  db: AppDb,
  rows: Array<{
    memberId: string;
    entryKind: string;
    amount: number;
    status: string;
    sourceSystem: string;
    sourceRecordId: string;
    receiptId?: string | null;
    eligibleSumRub?: string | null;
    metadata?: Record<string, unknown>;
  }>,
): Promise<number> {
  if (!rows.length) return 0;
  const sourceIds = [...new Set(rows.map((r) => r.sourceRecordId))];
  const existing = await chunkSelectByIds(sourceIds, (slice) =>
    db
      .select({
        sourceRecordId: loyaltyLedgerEntries.sourceRecordId,
        entryKind: loyaltyLedgerEntries.entryKind,
      })
      .from(loyaltyLedgerEntries)
      .where(
        and(
          eq(loyaltyLedgerEntries.sourceSystem, LOYALTY_IMPORT_SOURCE_SYSTEM),
          inArray(loyaltyLedgerEntries.sourceRecordId, slice),
        ),
      ),
  );
  const have = new Set(
    existing.map((e) => `${e.sourceRecordId}:${e.entryKind}`),
  );
  const toInsert = rows.filter(
    (r) => !have.has(`${r.sourceRecordId}:${r.entryKind}`),
  );
  const chunk = 200;
  for (let i = 0; i < toInsert.length; i += chunk) {
    await db.insert(loyaltyLedgerEntries).values(
      toInsert.slice(i, i + chunk).map((r) => ({
        memberId: r.memberId,
        entryKind: r.entryKind,
        amount: r.amount,
        status: r.status,
        sourceSystem: r.sourceSystem,
        sourceRecordId: r.sourceRecordId,
        receiptId: r.receiptId ?? null,
        eligibleSumRub: r.eligibleSumRub ?? null,
        metadata: r.metadata ?? {},
      })),
    );
  }
  return toInsert.length;
}
