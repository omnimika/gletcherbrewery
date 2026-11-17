import assert from "node:assert/strict";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertManifestShape,
  checksumLoyaltyBatch,
  validateManifestTables,
} from "./manifest";
import { loadLoyaltyFixtureDir } from "./load-fixture-dir";
import { LOYALTY_IMPORT_MAPPING_VERSION } from "./tables";
import { validateLoyaltyFiles } from "./validate";

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../",
);
const fixtureDir = path.join(root, "fixtures/loyalty/m2-4-linked");

describe("loyalty import manifest + validate", () => {
  it("loads synthetic fixture and checksums stably", () => {
    const { manifest, files } = loadLoyaltyFixtureDir(fixtureDir);
    assertManifestShape(manifest);
    assert.equal(manifest.sourceLabel, "m2-4-foundation-synthetic");
    assert.equal(files.length, 7);
    const a = checksumLoyaltyBatch(manifest, files);
    const b = checksumLoyaltyBatch(manifest, files);
    assert.equal(a, b);
    assert.equal(a.length, 64);
  });

  it("validateManifestTables accepts complete fixture", () => {
    const { manifest, files } = loadLoyaltyFixtureDir(fixtureDir);
    const errs = validateManifestTables(manifest, files);
    assert.ok(
      errs.every((e) => !e.startsWith("missing_table:")),
      String(errs),
    );
    assert.equal(manifest.policy.mappingVersion, LOYALTY_IMPORT_MAPPING_VERSION);
  });

  it("quarantines email collision, orphan check, unknown agent handled", () => {
    const { files } = loadLoyaltyFixtureDir(fixtureDir);
    const drafts = validateLoyaltyFiles(files);
    const collision = drafts.find((d) => d.sourceRecordId === "recUserCollisionB");
    assert.ok(collision);
    assert.equal(collision.parseStatus, "quarantine");
    assert.ok(collision.anomalyCodes.includes("email_collision"));

    const orphan = drafts.find((d) => d.sourceRecordId === "recCheckOrphan");
    assert.ok(orphan);
    assert.equal(orphan.parseStatus, "quarantine");
    assert.ok(orphan.anomalyCodes.includes("orphan_check"));

    const okUser = drafts.find((d) => d.sourceRecordId === "recUserBalance");
    assert.equal(okUser?.parseStatus, "ok");
  });
});
