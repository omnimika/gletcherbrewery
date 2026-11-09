import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  retailImportBatches,
  retailStagingRows,
} from "@/server/db/schema";
import { annotateRetailRows, buildAnomalyReport } from "./anomalies";
import { parseRetailFile } from "./parse";
import type { RetailAnomalyReport } from "./types";

export type ImportBatchResult = {
  kind: "created" | "replay";
  batchId: string;
  checksum: string;
  report: RetailAnomalyReport;
};

export function checksumPayload(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * Load one file into staging. Same checksum+label → replay existing batch
 * (no duplicate rows). Does not publish to Mapbox.
 */
export async function importRetailBatch(
  db: AppDb,
  input: {
    sourceLabel: string;
    sourceFile: string;
    text: string;
  },
): Promise<ImportBatchResult> {
  const checksum = checksumPayload(input.text);
  const existing = await db
    .select()
    .from(retailImportBatches)
    .where(eq(retailImportBatches.checksum, checksum))
    .limit(5);

  const same = existing.find((b) => b.sourceLabel === input.sourceLabel);
  if (same) {
    return {
      kind: "replay",
      batchId: same.id,
      checksum,
      report: same.report as RetailAnomalyReport,
    };
  }

  const { kind, rows } = parseRetailFile(input.text, input.sourceFile);
  const annotated = annotateRetailRows(rows);
  const report = buildAnomalyReport(annotated);

  const batchId = await db.transaction(async (tx) => {
    const [batch] = await tx
      .insert(retailImportBatches)
      .values({
        sourceKind: kind,
        sourceLabel: input.sourceLabel,
        checksum,
        rowCount: annotated.length,
        anomalyCount: report.anomalyCount,
        status: "loaded",
        report,
      })
      .returning({ id: retailImportBatches.id });

    if (!batch) throw new Error("batch insert failed");

    if (annotated.length) {
      await tx.insert(retailStagingRows).values(
        annotated.map((row) => ({
          batchId: batch.id,
          sourceFile: row.sourceFile,
          sourceRowNumber: row.sourceRowNumber,
          rawJson: row.raw,
          type: row.type,
          title: row.title,
          city: row.city,
          adress: row.adress,
          product: row.product,
          packing: row.packing,
          longitude: row.longitude,
          latitude: row.latitude,
          anomalyCodes: row.anomalyCodes,
          quarantineReason: row.quarantineReason,
        })),
      );
    }

    return batch.id;
  });

  return { kind: "created", batchId, checksum, report };
}
