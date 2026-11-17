import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  M2_AGGREGATE_TARGETS,
  rehearseAvailableVsLifetimeFixture,
  rehearseFutureSpendableRule,
  rehearseLegacyOpeningBalance,
} from "./synthetic-rehearsal";
import { legacyCheckImportStatus } from "./legacy-policy";

describe("M2 synthetic aggregates rehearsal", () => {
  it("fixture JSON matches documented targets", () => {
    const fixturePath = path.join(
      process.cwd(),
      "docs/data/fixtures/loyalty-m2-aggregates.json",
    );
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as {
      tables: {
        users: { count: number; sumAvailable: number };
        checks: {
          count: number;
          paidDa: number;
          paidNet: number;
          earnAll: number;
          earnDa: number;
          earnNet: number;
          noBuyer: number;
        };
      };
    };
    assert.equal(fixture.tables.users.count, M2_AGGREGATE_TARGETS.users);
    assert.equal(
      fixture.tables.users.sumAvailable,
      M2_AGGREGATE_TARGETS.sumAvailable,
    );
    assert.equal(fixture.tables.checks.count, M2_AGGREGATE_TARGETS.checks);
    assert.equal(fixture.tables.checks.earnNet, M2_AGGREGATE_TARGETS.earnNet);
    assert.equal(fixture.tables.checks.noBuyer, M2_AGGREGATE_TARGETS.checksNoBuyer);
  });

  it("eligible legacy smoke preserves CRM available (not row-level PASS)", () => {
    const r = rehearseLegacyOpeningBalance({
      sumAvailableAsIs: M2_AGGREGATE_TARGETS.sumAvailable,
      unpaidCheckEarn: M2_AGGREGATE_TARGETS.earnNet,
      paidCheckEarn: M2_AGGREGATE_TARGETS.earnDa,
    });
    assert.equal(r.policy, "legacy_eligible_verified");
    assert.equal(r.scope, "aggregate_smoke_not_row_level");
    assert.equal(r.spendableAfterImport, 208289);
    assert.equal(r.matchesCrmAvailable, true);
  });

  it("ineligible legacy does not auto-verify", () => {
    const r = legacyCheckImportStatus("НЕТ", { mode: "ineligible" });
    assert.equal(r.receiptStatus, "pending_manual");
  });

  it("future spendable ignores non-posted pending", () => {
    assert.equal(rehearseFutureSpendableRule(), 40); // 50 - 10
  });

  it("available≠lifetime fixture: 200 available, 9000 lifetime", () => {
    const r = rehearseAvailableVsLifetimeFixture();
    assert.equal(r.available, 200);
    assert.equal(r.lifetime, 9000);
  });
});
