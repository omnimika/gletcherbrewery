import { and, desc, eq, inArray } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  loyaltyLedgerEntries,
  loyaltyMembers,
  loyaltyReceipts,
} from "@/server/db/schema";
import { checkEarnBircoins } from "./earn";
import {
  parseFiscalQrPayload,
  receiptFingerprint,
} from "./fingerprint";
import { upsertMemberByEmail } from "./members";

const PENDING_STATUSES = [
  "pending_upload",
  "pending_qr",
  "pending_ocr",
  "pending_manual",
  "pending_staff",
] as const;

export type ManualReceiptInput = {
  email: string;
  gletcherSumRub?: number | null;
  city: string;
  purchaseAt: string; // YYYY-MM-DD
  venueNetwork?: string | null;
  venueName?: string | null;
  qrPayload?: string | null;
  photoObjectKey?: string | null;
  displayName?: string | null;
  ocrText?: string | null;
  ocrLines?: unknown[];
  ocrEligibleSum?: number | null;
  sourceHint?: "manual" | "qr" | "ocr";
};

export async function createManualReceipt(db: AppDb, input: ManualReceiptInput) {
  const sumFromInput =
    input.gletcherSumRub != null && Number.isFinite(input.gletcherSumRub)
      ? Number(input.gletcherSumRub)
      : null;
  const sumFromOcr =
    input.ocrEligibleSum != null &&
    Number.isFinite(input.ocrEligibleSum) &&
    input.ocrEligibleSum > 0
      ? Number(input.ocrEligibleSum)
      : null;
  const gletcherSumRub = sumFromInput ?? sumFromOcr;
  if (gletcherSumRub == null || gletcherSumRub < 0) {
    return { ok: false as const, code: "invalid_sum" as const };
  }
  if (!input.city.trim()) {
    return { ok: false as const, code: "invalid_city" as const };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.purchaseAt)) {
    return { ok: false as const, code: "invalid_date" as const };
  }
  const venue =
    (input.venueNetwork?.trim() || "") || (input.venueName?.trim() || "");
  if (!venue) {
    return { ok: false as const, code: "invalid_venue" as const };
  }

  let member;
  try {
    member = await upsertMemberByEmail(db, {
      email: input.email,
      displayName: input.displayName,
      city: input.city,
    });
  } catch {
    return { ok: false as const, code: "invalid_email" as const };
  }

  let fingerprint: string | null = null;
  let fiscalFn: string | null = null;
  let fiscalFd: string | null = null;
  let fiscalFp: string | null = null;
  let fiscalOperation: string | null = null;
  if (input.qrPayload?.trim()) {
    const p = parseFiscalQrPayload(input.qrPayload);
    if (p.fn && p.fd && p.fp) {
      fiscalFn = p.fn;
      fiscalFd = p.fd;
      fiscalFp = p.fp;
      fiscalOperation = p.operation ?? "1";
      fingerprint = receiptFingerprint({
        fn: p.fn,
        fd: p.fd,
        fp: p.fp,
        operation: fiscalOperation,
      });
      const dup = await db
        .select({ id: loyaltyReceipts.id })
        .from(loyaltyReceipts)
        .where(eq(loyaltyReceipts.receiptFingerprint, fingerprint))
        .limit(1);
      if (dup[0]) {
        return {
          ok: false as const,
          code: "duplicate_receipt" as const,
          existingId: dup[0].id,
        };
      }
    }
  }

  const proposedEarn = checkEarnBircoins(gletcherSumRub);
  const source =
    input.sourceHint ??
    (input.qrPayload?.trim()
      ? "qr"
      : input.ocrText
        ? "ocr"
        : "manual");
  const status = "pending_staff";

  const [row] = await db
    .insert(loyaltyReceipts)
    .values({
      memberId: member.id,
      status,
      source,
      photoObjectKey: input.photoObjectKey ?? null,
      qrPayload: input.qrPayload?.trim() || null,
      fiscalFn,
      fiscalFd,
      fiscalFp,
      fiscalOperation,
      receiptFingerprint: fingerprint,
      purchaseAt: input.purchaseAt,
      city: input.city.trim(),
      venueNetwork: input.venueNetwork?.trim() || null,
      venueName: input.venueName?.trim() || null,
      gletcherSumRub: String(gletcherSumRub),
      proposedEarn,
      ocrText: input.ocrText ?? null,
      ocrLines: input.ocrLines ?? [],
    })
    .returning();

  return { ok: true as const, receipt: row! };
}

export async function listPendingReceipts(db: AppDb, limit = 50) {
  return db
    .select({
      receipt: loyaltyReceipts,
      email: loyaltyMembers.emailNormalized,
      displayName: loyaltyMembers.displayName,
    })
    .from(loyaltyReceipts)
    .innerJoin(
      loyaltyMembers,
      eq(loyaltyReceipts.memberId, loyaltyMembers.id),
    )
    .where(inArray(loyaltyReceipts.status, [...PENDING_STATUSES]))
    .orderBy(desc(loyaltyReceipts.createdAt))
    .limit(limit);
}

export async function listReceiptsForMember(
  db: AppDb,
  memberId: string,
  limit = 50,
) {
  return db
    .select()
    .from(loyaltyReceipts)
    .where(eq(loyaltyReceipts.memberId, memberId))
    .orderBy(desc(loyaltyReceipts.createdAt))
    .limit(limit);
}

export async function approveReceipt(
  db: AppDb,
  input: { receiptId: string; actor: string; note?: string | null },
) {
  const [receipt] = await db
    .select()
    .from(loyaltyReceipts)
    .where(eq(loyaltyReceipts.id, input.receiptId))
    .limit(1);
  if (!receipt) return { ok: false as const, code: "not_found" as const };
  if (receipt.status === "verified") {
    return { ok: true as const, receipt, already: true as const };
  }
  if (!PENDING_STATUSES.includes(receipt.status as (typeof PENDING_STATUSES)[number])) {
    return { ok: false as const, code: "invalid_status" as const };
  }

  const sum = Number(receipt.gletcherSumRub ?? 0);
  const earn = receipt.proposedEarn ?? checkEarnBircoins(sum);

  await db.transaction(async (tx) => {
    await tx
      .update(loyaltyReceipts)
      .set({
        status: "verified",
        reviewedBy: input.actor,
        reviewedAt: new Date(),
        staffNote: input.note ?? receipt.staffNote,
        updatedAt: new Date(),
      })
      .where(eq(loyaltyReceipts.id, receipt.id));

    await tx
      .insert(loyaltyLedgerEntries)
      .values({
        memberId: receipt.memberId,
        entryKind: "check_earn",
        amount: earn,
        status: "posted",
        sourceSystem: "loyalty_receipt",
        sourceRecordId: receipt.id,
        receiptId: receipt.id,
        eligibleSumRub: String(sum),
        rewardRate: "0.05",
        metadata: {
          approvedBy: input.actor,
          source: receipt.source,
        },
      })
      .onConflictDoNothing({
        target: [
          loyaltyLedgerEntries.sourceSystem,
          loyaltyLedgerEntries.sourceRecordId,
          loyaltyLedgerEntries.entryKind,
        ],
      });
  });

  const [updated] = await db
    .select()
    .from(loyaltyReceipts)
    .where(eq(loyaltyReceipts.id, receipt.id))
    .limit(1);
  return { ok: true as const, receipt: updated!, already: false as const };
}

export async function rejectReceipt(
  db: AppDb,
  input: { receiptId: string; actor: string; note?: string | null },
) {
  const [receipt] = await db
    .select()
    .from(loyaltyReceipts)
    .where(eq(loyaltyReceipts.id, input.receiptId))
    .limit(1);
  if (!receipt) return { ok: false as const, code: "not_found" as const };
  if (receipt.status === "verified") {
    return { ok: false as const, code: "already_verified" as const };
  }

  const [updated] = await db
    .update(loyaltyReceipts)
    .set({
      status: "rejected",
      reviewedBy: input.actor,
      reviewedAt: new Date(),
      staffNote: input.note ?? receipt.staffNote,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(loyaltyReceipts.id, receipt.id),
        inArray(loyaltyReceipts.status, [...PENDING_STATUSES]),
      ),
    )
    .returning();

  if (!updated) return { ok: false as const, code: "invalid_status" as const };
  return { ok: true as const, receipt: updated };
}
