import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  legacyCheckImportStatus,
  LEGACY_CHECK_POLICY_VERSION,
} from "./legacy-policy";

describe("legacyCheckImportStatus R11", () => {
  it("does not verify without eligibility (ineligible)", () => {
    const r = legacyCheckImportStatus("НЕТ", { mode: "ineligible" });
    assert.equal(r.receiptStatus, "pending_manual");
    assert.equal(r.eligible, false);
    assert.equal(r.policyVersion, LEGACY_CHECK_POLICY_VERSION);
  });

  it("does not verify unknown flag even when eligible", () => {
    const r = legacyCheckImportStatus(null, {
      mode: "approved_set",
      recordIds: ["rec1"],
    }, { recordId: "rec1" });
    assert.equal(r.receiptStatus, "pending_manual");
    assert.equal(r.legacyPaidFlag, "UNKNOWN");
  });

  it("upgrades НЕТ only when record is in approved_set", () => {
    const ok = legacyCheckImportStatus("НЕТ", {
      mode: "approved_set",
      recordIds: ["recA"],
    }, { recordId: "recA" });
    assert.equal(ok.receiptStatus, "verified");
    assert.equal(ok.legacyPaidFlag, "НЕТ");

    const miss = legacyCheckImportStatus("НЕТ", {
      mode: "approved_set",
      recordIds: ["recA"],
    }, { recordId: "recB" });
    assert.equal(miss.receiptStatus, "pending_manual");
  });

  it("cutoff includes sourceAt on or before cutoff", () => {
    const cutoffAt = new Date("2026-11-10T00:00:00Z");
    const inRange = legacyCheckImportStatus("ДА", {
      mode: "cutoff",
      cutoffAt,
      sourceAt: new Date("2026-11-09T12:00:00Z"),
    });
    assert.equal(inRange.receiptStatus, "verified");

    const late = legacyCheckImportStatus("НЕТ", {
      mode: "cutoff",
      cutoffAt,
      sourceAt: new Date("2026-11-11T00:00:00Z"),
    });
    assert.equal(late.receiptStatus, "pending_manual");
  });
});
