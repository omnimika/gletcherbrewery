import { createHash } from "node:crypto";
import {
  AIRTABLE_LOYALTY_TABLE_IDS,
  LOYALTY_IMPORT_MAPPING_VERSION,
} from "./tables";
import type { LoyaltyImportManifest, LoyaltyTableFile } from "./types";

export function checksumPayload(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function checksumLoyaltyBatch(
  manifest: LoyaltyImportManifest,
  files: LoyaltyTableFile[],
): string {
  const ordered = [...files].sort((a, b) =>
    a.tableId.localeCompare(b.tableId),
  );
  const payload = JSON.stringify({
    manifest: {
      sourceLabel: manifest.sourceLabel,
      source: manifest.source,
      snapshotBoundary: manifest.snapshotBoundary,
      policy: manifest.policy,
      files: manifest.files,
    },
    tables: ordered.map((f) => ({
      tableId: f.tableId,
      records: f.records.map((r) => ({ id: r.id, fields: r.fields })),
    })),
  });
  return checksumPayload(payload);
}

export function assertManifestShape(
  raw: unknown,
): asserts raw is LoyaltyImportManifest {
  if (!raw || typeof raw !== "object") {
    throw new Error("manifest must be an object");
  }
  const m = raw as Record<string, unknown>;
  if (typeof m.sourceLabel !== "string" || !m.sourceLabel) {
    throw new Error("manifest.sourceLabel required");
  }
  if (!m.source || typeof m.source !== "object") {
    throw new Error("manifest.source required");
  }
  if (!m.policy || typeof m.policy !== "object") {
    throw new Error("manifest.policy required");
  }
  const policy = m.policy as Record<string, unknown>;
  if (typeof policy.version !== "string") {
    throw new Error("manifest.policy.version required");
  }
  if (!policy.legacyEligibility || typeof policy.legacyEligibility !== "object") {
    throw new Error("manifest.policy.legacyEligibility required");
  }
  if (!Array.isArray(m.files)) {
    throw new Error("manifest.files required");
  }
}

export function validateManifestTables(
  manifest: LoyaltyImportManifest,
  files: LoyaltyTableFile[],
): string[] {
  const errors: string[] = [];
  const fileByTable = new Map(files.map((f) => [f.tableId, f]));
  for (const tableId of AIRTABLE_LOYALTY_TABLE_IDS) {
    if (!fileByTable.has(tableId)) {
      errors.push(`missing_table:${tableId}`);
    }
  }
  for (const f of files) {
    if (!AIRTABLE_LOYALTY_TABLE_IDS.includes(f.tableId)) {
      errors.push(`unknown_table:${f.tableId}`);
    }
  }
  if (
    manifest.policy.mappingVersion &&
    manifest.policy.mappingVersion !== LOYALTY_IMPORT_MAPPING_VERSION
  ) {
    // warn-style: allow but record
    errors.push(
      `mapping_version_mismatch:${manifest.policy.mappingVersion}`,
    );
  }
  return errors;
}

export function loadTableFileJson(raw: unknown, tableId: string, fileName: string): LoyaltyTableFile {
  if (!raw || typeof raw !== "object") {
    throw new Error(`${fileName}: expected object`);
  }
  const obj = raw as Record<string, unknown>;
  const recordsRaw = obj.records;
  if (!Array.isArray(recordsRaw)) {
    throw new Error(`${fileName}: records array required`);
  }
  const records = recordsRaw.map((r, i) => {
    if (!r || typeof r !== "object") {
      throw new Error(`${fileName}: record[${i}] invalid`);
    }
    const rec = r as Record<string, unknown>;
    if (typeof rec.id !== "string" || !rec.id) {
      throw new Error(`${fileName}: record[${i}].id required`);
    }
    const fields =
      rec.fields && typeof rec.fields === "object"
        ? (rec.fields as Record<string, unknown>)
        : {};
    return { id: rec.id, fields };
  });
  return { tableId, fileName, records };
}
