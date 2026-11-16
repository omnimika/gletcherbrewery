/**
 * Legacy Airtable check → target receipt status (R11).
 * Owner Confirmed 10.11: reviewed НЕТ → verified — but only for an approved
 * eligibility set/cutoff (clarified 12.11). Unknown flags / ineligible rows
 * must not auto-upgrade.
 */

export const LEGACY_CHECK_POLICY_VERSION = "r11-2026-11-16" as const;

export type LegacyEligibility =
  | {
      mode: "approved_set";
      recordIds: ReadonlySet<string> | readonly string[];
      reason?: string;
    }
  | {
      mode: "cutoff";
      /** Inclusive: source created_at / reviewed_at ≤ cutoffAt */
      cutoffAt: Date;
      sourceAt: Date | null;
      reason?: string;
    }
  | {
      mode: "ineligible";
      reason?: string;
    };

export type LegacyCheckImportResult = {
  receiptStatus: "verified" | "pending_manual";
  legacyPaidFlag: string;
  note: string;
  policyVersion: typeof LEGACY_CHECK_POLICY_VERSION;
  eligible: boolean;
};

function normalizePaidFlag(
  airtablePaidFlag: string | null | undefined,
): { flag: string; known: boolean } {
  const raw = (airtablePaidFlag ?? "").trim();
  if (!raw) return { flag: "", known: false };
  const upper = raw.toUpperCase();
  if (upper === "ДА" || upper === "НЕТ") {
    return { flag: upper, known: true };
  }
  return { flag: raw, known: false };
}

function setHas(
  ids: ReadonlySet<string> | readonly string[],
  recordId: string,
): boolean {
  if (ids instanceof Set) return ids.has(recordId);
  return ids.includes(recordId);
}

export function isLegacyEligible(
  eligibility: LegacyEligibility,
  recordId?: string | null,
): boolean {
  if (eligibility.mode === "ineligible") return false;
  if (eligibility.mode === "approved_set") {
    if (!recordId) return false;
    return setHas(eligibility.recordIds, recordId);
  }
  // cutoff
  if (!eligibility.sourceAt) return false;
  return eligibility.sourceAt.getTime() <= eligibility.cutoffAt.getTime();
}

/**
 * Map Airtable Оплачено → target receipt status under an eligibility contract.
 * Without eligibility (or ineligible / unknown flag) → pending_manual, never verified.
 */
export function legacyCheckImportStatus(
  airtablePaidFlag: string | null | undefined,
  eligibility: LegacyEligibility,
  opts?: { recordId?: string | null },
): LegacyCheckImportResult {
  const { flag, known } = normalizePaidFlag(airtablePaidFlag);
  const legacyPaidFlag = flag || "UNKNOWN";
  const eligible = isLegacyEligible(eligibility, opts?.recordId);
  const reason =
    eligibility.mode === "ineligible"
      ? eligibility.reason ?? "ineligible"
      : eligibility.reason ?? eligibility.mode;

  if (!eligible) {
    return {
      receiptStatus: "pending_manual",
      legacyPaidFlag,
      note: `not eligible for legacy verified upgrade (${reason})`,
      policyVersion: LEGACY_CHECK_POLICY_VERSION,
      eligible: false,
    };
  }

  if (!known) {
    return {
      receiptStatus: "pending_manual",
      legacyPaidFlag,
      note: "unknown/null Оплачено flag — not treated as reviewed",
      policyVersion: LEGACY_CHECK_POLICY_VERSION,
      eligible: true,
    };
  }

  return {
    receiptStatus: "verified",
    legacyPaidFlag: flag,
    note:
      flag === "ДА"
        ? "legacy already ДА"
        : "legacy НЕТ upgraded to verified (owner manual review, eligible set/cutoff)",
    policyVersion: LEGACY_CHECK_POLICY_VERSION,
    eligible: true,
  };
}
