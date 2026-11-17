import { eq } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import { loyaltyImportBatches } from "@/server/db/schema";
import { applyLoyaltyStaging } from "./apply";
import {
  assertManifestShape,
  validateManifestTables,
} from "./manifest";
import { stageLoyaltyBatch } from "./stage";
import type {
  ImportMode,
  LoyaltyImportManifest,
  LoyaltyImportReport,
  LoyaltyTableFile,
} from "./types";
import { summarizeByTable, validateLoyaltyFiles } from "./validate";

export type ImportLoyaltyBatchInput = {
  manifest: LoyaltyImportManifest;
  files: LoyaltyTableFile[];
  mode: ImportMode;
};

export async function importLoyaltyBatch(
  db: AppDb,
  input: ImportLoyaltyBatchInput,
): Promise<LoyaltyImportReport> {
  assertManifestShape(input.manifest);
  const manifestErrors = validateManifestTables(
    input.manifest,
    input.files,
  );
  // mapping_version_mismatch is soft; missing tables are hard for foundation
  const hard = manifestErrors.filter((e) => e.startsWith("missing_table:"));
  if (hard.length) {
    throw new Error(`manifest incomplete: ${hard.join(",")}`);
  }

  const drafts = validateLoyaltyFiles(input.files);
  const staged = await stageLoyaltyBatch(db, {
    manifest: input.manifest,
    files: input.files,
    drafts,
  });

  const byTable = summarizeByTable(staged.drafts);
  const quarantines = staged.drafts
    .filter((d) => d.parseStatus === "quarantine")
    .map((d) => ({
      tableId: d.sourceTableId,
      recordId: d.sourceRecordId,
      codes: d.anomalyCodes,
      reason: d.quarantineReason,
    }));

  const baseReport: LoyaltyImportReport = {
    mode: input.mode,
    batchId: staged.batchId,
    checksum: staged.checksum,
    kind: staged.kind,
    status: staged.status,
    rowCount: staged.drafts.length,
    quarantineCount: quarantines.length,
    byTable,
    quarantines,
  };

  if (input.mode === "dry_run") {
    await db
      .update(loyaltyImportBatches)
      .set({
        status: "validated",
        report: {
          ...baseReport,
          phase: "dry_run",
          softManifestErrors: manifestErrors,
        } as unknown as Record<string, unknown>,
        quarantineCount: quarantines.length,
        updatedAt: new Date(),
      })
      .where(eq(loyaltyImportBatches.id, staged.batchId));

    return { ...baseReport, status: "validated" };
  }

  // apply — even on replay, domain upserts are idempotent
  const applied = await applyLoyaltyStaging(
    db,
    staged.batchId,
    input.manifest,
    staged.drafts,
  );

  await db
    .update(loyaltyImportBatches)
    .set({
      status: "applied",
      report: {
        ...baseReport,
        applied,
        phase: "apply",
        softManifestErrors: manifestErrors,
      } as unknown as Record<string, unknown>,
      quarantineCount: quarantines.length,
      updatedAt: new Date(),
    })
    .where(eq(loyaltyImportBatches.id, staged.batchId));

  return {
    ...baseReport,
    status: "applied",
    applied,
  };
}
