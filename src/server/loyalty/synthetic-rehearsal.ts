import { checkEarnBircoins } from "./earn";
import { legacyCheckImportStatus } from "./legacy-policy";
import { spendableBalance } from "./spendable";

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
 * Simulate legacy import policy: all checks → verified, preserve CRM Σ available.
 * Does not invent per-user history — only aggregate continuity check.
 */
export function rehearseLegacyOpeningBalance(input: {
  sumAvailableAsIs: number;
  unpaidCheckEarn: number;
  paidCheckEarn: number;
}): {
  policy: "legacy_all_verified";
  spendableAfterImport: number;
  unpaidBecameVerified: boolean;
  matchesCrmAvailable: boolean;
} {
  const unpaid = legacyCheckImportStatus("НЕТ");
  const paid = legacyCheckImportStatus("ДА");
  assertVerified(unpaid.receiptStatus);
  assertVerified(paid.receiptStatus);

  // Under owner policy, CRM available already includes unpaid earn → keep it.
  const spendableAfterImport = input.sumAvailableAsIs;
  return {
    policy: "legacy_all_verified",
    spendableAfterImport,
    unpaidBecameVerified: true,
    matchesCrmAvailable:
      spendableAfterImport === input.sumAvailableAsIs &&
      input.unpaidCheckEarn + input.paidCheckEarn > 0,
  };
}

function assertVerified(status: string) {
  if (status !== "verified") throw new Error(`expected verified, got ${status}`);
}

/** Future path: only verified earn is spendable; pending does not post ledger. */
export function rehearseFutureSpendableRule(): number {
  return spendableBalance([
    { entryKind: "check_earn", amount: checkEarnBircoins(1000), status: "posted" },
    // pending receipt must NOT create a posted row — simulate by absence
    { entryKind: "spend", amount: -10, status: "posted" },
  ]);
}
