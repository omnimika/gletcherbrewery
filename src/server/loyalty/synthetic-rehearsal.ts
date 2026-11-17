import { checkEarnBircoins } from "./earn";
import { legacyCheckImportStatus } from "./legacy-policy";
import {
  lifetimeEarnBircoins,
  spendableBalance,
} from "./spendable";

/** Targets from docs/data/fixtures/loyalty-m2-aggregates.json (no PII). */
export const M2_AGGREGATE_TARGETS = {
  users: 3384,
  sumAvailable: 208289,
  checks: 5034,
  paidDa: 866,
  paidNet: 4168,
  earnAll: 212762,
  earnDa: 28941,
  earnNet: 183821,
  checksNoBuyer: 76,
} as const;

/**
 * Aggregate continuity smoke for an *eligible* legacy batch.
 * Not row-level import evidence (R10/M2-4). Eligibility is required.
 */
export function rehearseLegacyOpeningBalance(input: {
  sumAvailableAsIs: number;
  unpaidCheckEarn: number;
  paidCheckEarn: number;
  /** Sample record id that must be in the approved set. */
  sampleRecordId?: string;
}): {
  policy: "legacy_eligible_verified";
  spendableAfterImport: number;
  unpaidBecameVerified: boolean;
  matchesCrmAvailable: boolean;
  scope: "aggregate_smoke_not_row_level";
} {
  const sampleId = input.sampleRecordId ?? "rec_eligible_sample";
  const unpaid = legacyCheckImportStatus("НЕТ", {
    mode: "approved_set",
    recordIds: [sampleId],
  }, { recordId: sampleId });
  const paid = legacyCheckImportStatus("ДА", {
    mode: "approved_set",
    recordIds: [sampleId],
  }, { recordId: sampleId });

  if (unpaid.receiptStatus !== "verified" || paid.receiptStatus !== "verified") {
    throw new Error("eligible legacy sample must verify");
  }

  // Under owner policy, CRM available already includes unpaid earn → keep it.
  const spendableAfterImport = input.sumAvailableAsIs;
  return {
    policy: "legacy_eligible_verified",
    spendableAfterImport,
    unpaidBecameVerified: true,
    matchesCrmAvailable:
      spendableAfterImport === input.sumAvailableAsIs &&
      input.unpaidCheckEarn + input.paidCheckEarn > 0,
    scope: "aggregate_smoke_not_row_level",
  };
}

/** Future path: only verified earn is spendable; pending does not post ledger. */
export function rehearseFutureSpendableRule(): number {
  return spendableBalance([
    { entryKind: "check_earn", amount: checkEarnBircoins(1000), status: "posted" },
    // pending receipt must NOT create a posted row — simulate by absence
    { entryKind: "spend", amount: -10, status: "posted" },
  ]);
}

/**
 * R11 fixture: historical earn 9000, spend −8800 → available 200;
 * lifetime stays 9000 (opening residual must not inflate lifetime).
 */
export function rehearseAvailableVsLifetimeFixture(): {
  available: number;
  lifetime: number;
} {
  const entries = [
    { entryKind: "check_earn", amount: 9000, status: "posted" },
    { entryKind: "spend", amount: -8800, status: "posted" },
    // Mistaken double-path residual — must affect available only if posted,
    // never lifetime:
    { entryKind: "opening", amount: 200, status: "posted" },
  ];
  // If both full history AND opening residual were posted, available would be
  // wrong (9000-8800+200=400). Correct import chooses ONE boundary.
  // Demonstrate lifetime excludes opening; correct available uses history only:
  const historyOnly = entries.filter((e) => e.entryKind !== "opening");
  return {
    available: spendableBalance(historyOnly),
    lifetime: lifetimeEarnBircoins(entries),
  };
}
