import { createHash, randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
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
import {
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

  // Members
  for (const d of drafts) {
    if (
      d.sourceTableId !== AIRTABLE_LOYALTY_TABLES.users ||
      d.parseStatus !== "ok"
    ) {
      continue;
    }
    const fields = fieldsOf(d);
    const email = normalizeMemberEmail(String(fields.email ?? ""));
    const targetId = userTargets.get(d.sourceRecordId);
    if (!targetId) continue;

    const existing = await db
      .select({ id: loyaltyMembers.id })
      .from(loyaltyMembers)
      .where(eq(loyaltyMembers.id, targetId))
      .limit(1);

    if (!existing[0]) {
      await db.insert(loyaltyMembers).values({
        id: targetId,
        emailNormalized: email,
        displayName: asString(fields.displayName ?? fields.Имя),
        phone: asString(fields.phone ?? fields.Телефон),
        city: asString(fields.city ?? fields.Город),
        airtableRecordId: d.sourceRecordId,
      });
      counts.members += 1;
    } else {
      await db
        .update(loyaltyMembers)
        .set({
          airtableRecordId: d.sourceRecordId,
          displayName:
            asString(fields.displayName ?? fields.Имя) ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(loyaltyMembers.id, targetId));
    }

    await upsertIdentityMap(db, {
      batchId,
      tableId: AIRTABLE_LOYALTY_TABLES.users,
      recordId: d.sourceRecordId,
      entityKind: "member",
      targetUuid: targetId,
    });
    counts.identityMaps += 1;
  }

  const eligibilityBase = manifest.policy.legacyEligibility;

  // Checks → receipts + optional check_earn
  for (const d of drafts) {
    if (
      d.sourceTableId !== AIRTABLE_LOYALTY_TABLES.checks ||
      d.parseStatus !== "ok"
    ) {
      continue;
    }
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

    const existingReceipt = await db
      .select({ id: loyaltyReceipts.id })
      .from(loyaltyReceipts)
      .where(eq(loyaltyReceipts.airtableCheckId, d.sourceRecordId))
      .limit(1);

    let receiptId = existingReceipt[0]?.id;
    if (!receiptId) {
      receiptId = randomUUID();
      await db.insert(loyaltyReceipts).values({
        id: receiptId,
        memberId,
        status: legacy.receiptStatus,
        source: "legacy_airtable",
        gletcherSumRub:
          gletcherSum != null ? String(gletcherSum) : null,
        proposedEarn: earn,
        airtableCheckId: d.sourceRecordId,
        legacyPaidFlag: legacy.legacyPaidFlag,
        staffNote: `${legacy.note}; policy=${LEGACY_CHECK_POLICY_VERSION}`,
        reviewedBy: legacy.eligible ? "legacy_import" : null,
        reviewedAt: legacy.eligible ? new Date() : null,
      });
      counts.receipts += 1;
    }

    await upsertIdentityMap(db, {
      batchId,
      tableId: AIRTABLE_LOYALTY_TABLES.checks,
      recordId: d.sourceRecordId,
      entityKind: "receipt",
      targetUuid: receiptId,
    });
    counts.identityMaps += 1;

    // Post historical earn only when verified + positive amount
    if (
      legacy.receiptStatus === "verified" &&
      earn != null &&
      earn > 0
    ) {
      const inserted = await insertLedgerIfAbsent(db, {
        memberId,
        entryKind: "check_earn",
        amount: earn,
        sourceRecordId: d.sourceRecordId,
        receiptId,
        eligibleSumRub: gletcherSum != null ? String(gletcherSum) : null,
        metadata: {
          importBatchId: batchId,
          policyVersion: LEGACY_CHECK_POLICY_VERSION,
          legacyPaidFlag: legacy.legacyPaidFlag,
        },
      });
      if (inserted) counts.ledgerEntries += 1;
    }
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
  const existing = await db
    .select({ id: loyaltyLedgerEntries.id })
    .from(loyaltyLedgerEntries)
    .where(
      and(
        eq(loyaltyLedgerEntries.sourceSystem, LOYALTY_IMPORT_SOURCE_SYSTEM),
        eq(loyaltyLedgerEntries.sourceRecordId, input.sourceRecordId),
        eq(loyaltyLedgerEntries.entryKind, input.entryKind),
      ),
    )
    .limit(1);
  if (existing[0]) return false;

  await db.insert(loyaltyLedgerEntries).values({
    memberId: input.memberId,
    entryKind: input.entryKind,
    amount: input.amount,
    status: "posted",
    sourceSystem: LOYALTY_IMPORT_SOURCE_SYSTEM,
    sourceRecordId: input.sourceRecordId,
    receiptId: input.receiptId,
    eligibleSumRub: input.eligibleSumRub ?? null,
    metadata: input.metadata ?? {},
  });
  return true;
}
