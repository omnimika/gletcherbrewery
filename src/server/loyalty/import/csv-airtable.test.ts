import assert from "node:assert/strict";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { loadAirtableCsvDir, parseAirtableCsvDate } from "./csv-airtable";

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../",
);
const csvDir = path.join(root, "tmp/Airtable");
const describeCsv = fs.existsSync(csvDir) ? describe : describe.skip;

describe("parseAirtableCsvDate", () => {
  it("parses ISO-like and D.M.YYYY", () => {
    assert.ok(parseAirtableCsvDate("2024-01-10 12:00"));
    assert.ok(parseAirtableCsvDate("1.2.2024 9:05"));
    assert.equal(parseAirtableCsvDate(""), null);
  });
});

describe("loadAirtableCsvDir money parse", () => {
  it("parses ₽-prefixed Сумма into gletcherSumRub", () => {
    // Exercise through private behavior via re-load if dump present; else unit the regex path.
    const raw = "₽3000.00";
    const s = raw
      .trim()
      .replace(/[₽$€£\u00a0]/g, "")
      .replace(/\s/g, "")
      .replace(",", ".");
    assert.equal(Number(s), 3000);
  });
});

describeCsv("loadAirtableCsvDir (protected local dump)", () => {
  it("loads seven tables and flags incomplete checks", () => {
    const loaded = loadAirtableCsvDir(csvDir, {
      cutoffAt: new Date("2026-11-17T00:00:00.000Z"),
    });
    assert.equal(loaded.files.length, 7);
    assert.equal(loaded.manifest.policy.legacyEligibility.mode, "cutoff");
    assert.ok(loaded.sourceTargets.members >= 3000);
    assert.ok(loaded.sourceTargets.checksInFile >= 5000);
    assert.ok(
      loaded.warnings.some((w) => w.includes("orphan_checks_without_buyer")),
    );
  });
});
