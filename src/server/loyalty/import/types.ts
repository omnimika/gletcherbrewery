import type { LegacyEligibility } from "@/server/loyalty/legacy-policy";

export type ImportMode = "dry_run" | "apply";

export type LoyaltyImportManifest = {
  sourceLabel: string;
  source: {
    system: "airtable";
    baseId: string;
    schemaRevision: string;
    owner: string;
    exportedAt: string;
  };
  files: Array<{
    tableId: string;
    fileName: string;
    encoding?: string;
    rowCount?: number;
  }>;
  snapshotBoundary: string;
  policy: {
    version: string;
    mappingVersion: string;
    legacyEligibility: {
      mode: "approved_set" | "cutoff" | "ineligible";
      recordIds?: string[];
      cutoffAt?: string;
      reason?: string;
    };
  };
  dataHandling: {
    pii: "synthetic" | "protected";
    notes?: string;
  };
  rehearsal?: {
    targetDb?: string;
    runId?: string;
  };
  /** Expected post-apply balances for foundation fixtures (optional). */
  expectations?: {
    members?: Array<{
      email: string;
      available: number;
      lifetime: number;
    }>;
  };
};

export type LoyaltySourceRecord = {
  id: string;
  fields: Record<string, unknown>;
};

export type LoyaltyTableFile = {
  tableId: string;
  fileName: string;
  records: LoyaltySourceRecord[];
};

export type StagingRowDraft = {
  sourceTableId: string;
  sourceRecordId: string;
  sourceFile: string;
  rawJson: Record<string, unknown>;
  parseStatus: "ok" | "quarantine";
  anomalyCodes: string[];
  quarantineReason: string | null;
};

export type LoyaltyImportReport = {
  mode: ImportMode;
  batchId: string;
  checksum: string;
  kind: "created" | "replay";
  status: string;
  rowCount: number;
  quarantineCount: number;
  byTable: Record<
    string,
    { staged: number; ok: number; quarantine: number }
  >;
  applied?: {
    members: number;
    receipts: number;
    ledgerEntries: number;
    agentApplications: number;
    identityMaps: number;
  };
  quarantines: Array<{
    tableId: string;
    recordId: string;
    codes: string[];
    reason: string | null;
  }>;
};

export type ManifestLegacyEligibility = LoyaltyImportManifest["policy"]["legacyEligibility"];

export function toRuntimeEligibility(
  policy: ManifestLegacyEligibility,
  opts?: { sourceAt?: Date | null },
): LegacyEligibility {
  if (policy.mode === "approved_set") {
    return {
      mode: "approved_set",
      recordIds: policy.recordIds ?? [],
      reason: policy.reason,
    };
  }
  if (policy.mode === "cutoff") {
    return {
      mode: "cutoff",
      cutoffAt: new Date(policy.cutoffAt ?? 0),
      sourceAt: opts?.sourceAt ?? null,
      reason: policy.reason,
    };
  }
  return { mode: "ineligible", reason: policy.reason };
}
