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
  };
  expectationDiffs: Array<{
    email: string;
    field: "available" | "lifetime";
    expected: number;
    actual: number;
  }>;
  anomalies: string[];
};

export async function reconcileLoyaltyImport(
  db: AppDb,
  opts: {
    batchId?: string;
    manifest?: LoyaltyImportManifest;
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
  const memberRows: MemberReconcileRow[] = [];

  for (const m of members) {
    const ledger = await db
      .select({
        entryKind: loyaltyLedgerEntries.entryKind,
        amount: loyaltyLedgerEntries.amount,
        status: loyaltyLedgerEntries.status,
      })
      .from(loyaltyLedgerEntries)
      .where(eq(loyaltyLedgerEntries.memberId, m.id));

    const receipts = await db
      .select({
        id: loyaltyReceipts.id,
        airtableCheckId: loyaltyReceipts.airtableCheckId,
      })
      .from(loyaltyReceipts)
      .where(eq(loyaltyReceipts.memberId, m.id));

    const apps = await db
      .select({
        id: loyaltyAgentApplications.id,
        airtableAgentId: loyaltyAgentApplications.airtableAgentId,
      })
      .from(loyaltyAgentApplications)
      .where(eq(loyaltyAgentApplications.memberId, m.id));

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

  // Orphan ledger without member should be impossible by FK; check receipts without airtable for corruption probes
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

  const ok = expectationDiffs.length === 0 && anomalies.length === 0;

  return {
    batchId,
    ok,
    members: memberRows,
    aggregates: {
      members: members.length,
      receipts: Number(receiptAgg?.c ?? 0),
      ledgerEntries: Number(ledgerAgg?.c ?? 0),
      agentApplications: Number(appAgg?.c ?? 0),
      quarantinedStaging,
    },
    expectationDiffs,
    anomalies,
  };
}
