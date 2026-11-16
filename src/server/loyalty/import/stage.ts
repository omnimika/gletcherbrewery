import { eq } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  loyaltyImportBatches,
  loyaltyStagingRows,
} from "@/server/db/schema";
import { LEGACY_CHECK_POLICY_VERSION } from "@/server/loyalty/legacy-policy";
import { checksumLoyaltyBatch } from "./manifest";
import {
  LOYALTY_IMPORT_MAPPING_VERSION,
} from "./tables";
import type {
  LoyaltyImportManifest,
  LoyaltyTableFile,
  StagingRowDraft,
} from "./types";
import { summarizeByTable } from "./validate";

export type StageResult = {
  kind: "created" | "replay";
  batchId: string;
  checksum: string;
  status: string;
  drafts: StagingRowDraft[];
};

export async function stageLoyaltyBatch(
  db: AppDb,
  input: {
    manifest: LoyaltyImportManifest;
    files: LoyaltyTableFile[];
    drafts: StagingRowDraft[];
  },
): Promise<StageResult> {
  const checksum = checksumLoyaltyBatch(input.manifest, input.files);
  const existing = await db
    .select()
    .from(loyaltyImportBatches)
    .where(eq(loyaltyImportBatches.checksum, checksum))
    .limit(5);
  const same = existing.find(
    (b) => b.sourceLabel === input.manifest.sourceLabel,
  );

  if (same) {
    const rows = await db
      .select()
      .from(loyaltyStagingRows)
      .where(eq(loyaltyStagingRows.batchId, same.id));
    const drafts: StagingRowDraft[] = rows.map((r) => ({
      sourceTableId: r.sourceTableId,
      sourceRecordId: r.sourceRecordId,
      sourceFile: r.sourceFile,
      rawJson: r.rawJson,
      parseStatus: r.parseStatus === "quarantine" ? "quarantine" : "ok",
      anomalyCodes: r.anomalyCodes ?? [],
      quarantineReason: r.quarantineReason,
    }));
    return {
      kind: "replay",
      batchId: same.id,
      checksum,
      status: same.status,
      drafts,
    };
  }

  const quarantineCount = input.drafts.filter(
    (d) => d.parseStatus === "quarantine",
  ).length;
  const byTable = summarizeByTable(input.drafts);

  const batchId = await db.transaction(async (tx) => {
    const [batch] = await tx
      .insert(loyaltyImportBatches)
      .values({
        sourceLabel: input.manifest.sourceLabel,
        checksum,
        policyVersion:
          input.manifest.policy.version || LEGACY_CHECK_POLICY_VERSION,
        mappingVersion:
          input.manifest.policy.mappingVersion ||
          LOYALTY_IMPORT_MAPPING_VERSION,
        status: "loaded",
        manifest: input.manifest as unknown as Record<string, unknown>,
        report: {
          byTable,
          quarantineCount,
          phase: "staged",
        },
        rowCount: input.drafts.length,
        quarantineCount,
      })
      .returning({ id: loyaltyImportBatches.id });

    if (!batch) throw new Error("loyalty import batch insert failed");

    if (input.drafts.length) {
      await tx.insert(loyaltyStagingRows).values(
        input.drafts.map((d) => ({
          batchId: batch.id,
          sourceTableId: d.sourceTableId,
          sourceRecordId: d.sourceRecordId,
          sourceFile: d.sourceFile,
          rawJson: d.rawJson,
          parseStatus: d.parseStatus,
          anomalyCodes: d.anomalyCodes,
          quarantineReason: d.quarantineReason,
        })),
      );
    }

    return batch.id;
  });

  return {
    kind: "created",
    batchId,
    checksum,
    status: "loaded",
    drafts: input.drafts,
  };
}
