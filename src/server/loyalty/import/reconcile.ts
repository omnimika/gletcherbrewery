import { count, eq } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  loyaltyAgentApplications,
  loyaltyImportBatches,
  loyaltyLedgerEntries,
  loyaltyMembers,
  loyaltyReceipts,
  loyaltyStagingRows,
} from "@/server/db/schema";
import {
  lifetimeEarnBircoins,
  spendableBalance,
  type LedgerEntryLike,
} from "@/server/loyalty/spendable";
import type { LoyaltyImportManifest } from "./types";

export type MemberReconcileRow = {
  memberId: string;
  email: string;
  airtableRecordId: string | null;
  available: number;
  lifetime: number;
  spend: number;
  receiptCount: number;
  receiptSourceIds: string[];
  agentAppCount: number;
  agentSourceIds: string[];
  ledgerCount: number;
};

export type LoyaltyReconcileReport = {
  batchId: string | null;
  ok: boolean;
  members: MemberReconcileRow[];
  aggregates: {
    members: number;
    receipts: number;
    ledgerEntries: number;
    agentApplications: number;
    quarantinedStaging: number;
    sumAvailable: number;
    sumLifetime: number;
  };
  expectationDiffs: Array<{
    email: string;
    field: "available" | "lifetime";
    expected: number;
    actual: number;
  }>;
  sourceTargetDiff?: {
    membersExpected: number;
    membersActual: number;
    sumAvailableExpected: number;
    sumAvailableActual: number;
    sumLifetimeExpected: number;
    sumLifetimeActual: number;
    memberBalanceMismatches: number;
    checkEarnGap?: number;
  };
  anomalies: string[];
};

export async function reconcileLoyaltyImport(
  db: AppDb,
  opts: {
    batchId?: string;
    manifest?: LoyaltyImportManifest;
    sourceTargets?: {
      members: number;
      uniqueEmails?: number;
      sumAvailable: number;
      sumLifetime: number;
      checkEarnGap?: number;
      byEmail?: Map<string, { available: number; lifetime: number }>;
    };
    omitMemberRows?: boolean;
  } = {},
): Promise<LoyaltyReconcileReport> {
  const anomalies: string[] = [];
  let batchId = opts.batchId ?? null;

  if (!batchId && opts.manifest) {
    const rows = await db
      .select()
      .from(loyaltyImportBatches)
      .where(eq(loyaltyImportBatches.sourceLabel, opts.manifest.sourceLabel))
      .limit(5);
    batchId = rows[0]?.id ?? null;
  }

  const members = await db.select().from(loyaltyMembers);

  const allLedger = await db
    .select({
      memberId: loyaltyLedgerEntries.memberId,
      entryKind: loyaltyLedgerEntries.entryKind,
      amount: loyaltyLedgerEntries.amount,
      status: loyaltyLedgerEntries.status,
    })
    .from(loyaltyLedgerEntries);
  const ledgerByMember = new Map<string, LedgerEntryLike[]>();
  for (const e of allLedger) {
    const list = ledgerByMember.get(e.memberId) ?? [];
    list.push({
      entryKind: e.entryKind,
      amount: e.amount,
      status: e.status,
    });
    ledgerByMember.set(e.memberId, list);
  }

  const allReceipts = await db
    .select({
      memberId: loyaltyReceipts.memberId,
      airtableCheckId: loyaltyReceipts.airtableCheckId,
    })
    .from(loyaltyReceipts);
  const receiptsByMember = new Map<
    string,
    Array<{ airtableCheckId: string | null }>
  >();
  for (const r of allReceipts) {
    const list = receiptsByMember.get(r.memberId) ?? [];
    list.push({ airtableCheckId: r.airtableCheckId });
    receiptsByMember.set(r.memberId, list);
  }

  const allApps = await db
    .select({
      memberId: loyaltyAgentApplications.memberId,
      airtableAgentId: loyaltyAgentApplications.airtableAgentId,
    })
    .from(loyaltyAgentApplications);
  const appsByMember = new Map<
    string,
    Array<{ airtableAgentId: string | null }>
  >();
  for (const a of allApps) {
    const list = appsByMember.get(a.memberId) ?? [];
    list.push({ airtableAgentId: a.airtableAgentId });
    appsByMember.set(a.memberId, list);
  }

  const memberRows: MemberReconcileRow[] = [];
  for (const m of members) {
    const ledger = ledgerByMember.get(m.id) ?? [];
    const receipts = receiptsByMember.get(m.id) ?? [];
    const apps = appsByMember.get(m.id) ?? [];
    const available = spendableBalance(ledger);
    const lifetime = lifetimeEarnBircoins(ledger);
    const spend = ledger
      .filter((e) => e.status === "posted" && e.entryKind === "spend")
      .reduce((a, e) => a + e.amount, 0);

    memberRows.push({
      memberId: m.id,
      email: m.emailNormalized,
      airtableRecordId: m.airtableRecordId,
      available,
      lifetime,
      spend,
      receiptCount: receipts.length,
      receiptSourceIds: receipts
        .map((r) => r.airtableCheckId)
        .filter((x): x is string => !!x),
      agentAppCount: apps.length,
      agentSourceIds: apps
        .map((a) => a.airtableAgentId)
        .filter((x): x is string => !!x),
      ledgerCount: ledger.length,
    });
  }

  const [receiptAgg] = await db.select({ c: count() }).from(loyaltyReceipts);
  const [ledgerAgg] = await db
    .select({ c: count() })
    .from(loyaltyLedgerEntries);
  const [appAgg] = await db
    .select({ c: count() })
    .from(loyaltyAgentApplications);

  let quarantinedStaging = 0;
  if (batchId) {
    const allStaging = await db
      .select({ parseStatus: loyaltyStagingRows.parseStatus })
      .from(loyaltyStagingRows)
      .where(eq(loyaltyStagingRows.batchId, batchId));
    quarantinedStaging = allStaging.filter(
      (r) => r.parseStatus === "quarantine",
    ).length;
  }

  const expectationDiffs: LoyaltyReconcileReport["expectationDiffs"] = [];
  const expectations = opts.manifest?.expectations?.members ?? [];
  for (const exp of expectations) {
    const row = memberRows.find(
      (m) => m.email === exp.email.trim().toLowerCase(),
    );
    if (!row) {
      anomalies.push(`missing_member:${exp.email}`);
      continue;
    }
    if (row.available !== exp.available) {
      expectationDiffs.push({
        email: exp.email,
        field: "available",
        expected: exp.available,
        actual: row.available,
      });
    }
    if (row.lifetime !== exp.lifetime) {
      expectationDiffs.push({
        email: exp.email,
        field: "lifetime",
        expected: exp.lifetime,
        actual: row.lifetime,
      });
    }
  }

  for (const m of memberRows) {
    if (!Number.isFinite(m.available) || !Number.isFinite(m.lifetime)) {
      anomalies.push(`nonfinite_balance:${m.email}`);
    }
  }

  const scoped = opts.sourceTargets?.byEmail
    ? memberRows.filter((m) => opts.sourceTargets!.byEmail!.has(m.email))
    : memberRows;
  const sumAvailable = scoped.reduce((a, m) => a + m.available, 0);
  const sumLifetime = scoped.reduce((a, m) => a + m.lifetime, 0);
  const sumAvailableAll = memberRows.reduce((a, m) => a + m.available, 0);
  const sumLifetimeAll = memberRows.reduce((a, m) => a + m.lifetime, 0);

  let sourceTargetDiff: LoyaltyReconcileReport["sourceTargetDiff"];
  if (opts.sourceTargets) {
    let memberBalanceMismatches = 0;
    if (opts.sourceTargets.byEmail) {
      for (const m of scoped) {
        const exp = opts.sourceTargets.byEmail.get(m.email)!;
        if (exp.available !== m.available || exp.lifetime !== m.lifetime) {
          memberBalanceMismatches += 1;
        }
      }
    }
    sourceTargetDiff = {
      membersExpected: opts.sourceTargets.uniqueEmails ?? opts.sourceTargets.members,
      membersActual: scoped.length,
      sumAvailableExpected: opts.sourceTargets.sumAvailable,
      sumAvailableActual: sumAvailable,
      sumLifetimeExpected: opts.sourceTargets.sumLifetime,
      sumLifetimeActual: sumLifetime,
      memberBalanceMismatches,
      checkEarnGap: opts.sourceTargets.checkEarnGap,
    };
    if (
      Math.abs(sumAvailable - opts.sourceTargets.sumAvailable) > 1 ||
      Math.abs(sumLifetime - opts.sourceTargets.sumLifetime) > 1
    ) {
      anomalies.push("aggregate_balance_mismatch_vs_airtable_user_rollups");
    }
  }

  const ok =
    expectationDiffs.length === 0 &&
    anomalies.length === 0 &&
    !(sourceTargetDiff && sourceTargetDiff.memberBalanceMismatches > 0);

  return {
    batchId,
    ok,
    members: opts.omitMemberRows ? [] : memberRows,
    aggregates: {
      members: members.length,
      receipts: Number(receiptAgg?.c ?? 0),
      ledgerEntries: Number(ledgerAgg?.c ?? 0),
      agentApplications: Number(appAgg?.c ?? 0),
      quarantinedStaging,
      sumAvailable: sumAvailableAll,
      sumLifetime: sumLifetimeAll,
    },
    expectationDiffs,
    sourceTargetDiff,
    anomalies,
  };
}
