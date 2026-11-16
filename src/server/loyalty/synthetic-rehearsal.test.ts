import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  M2_AGGREGATE_TARGETS,
  rehearseFutureSpendableRule,
  rehearseLegacyOpeningBalance,
} from "./synthetic-rehearsal";

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

  it("legacy all→verified preserves CRM available", () => {
    const r = rehearseLegacyOpeningBalance({
      sumAvailableAsIs: M2_AGGREGATE_TARGETS.sumAvailable,
      unpaidCheckEarn: M2_AGGREGATE_TARGETS.earnNet,
      paidCheckEarn: M2_AGGREGATE_TARGETS.earnDa,
    });
    assert.equal(r.policy, "legacy_all_verified");
    assert.equal(r.spendableAfterImport, 208289);
    assert.equal(r.matchesCrmAvailable, true);
  });

  it("future spendable ignores non-posted pending", () => {
    assert.equal(rehearseFutureSpendableRule(), 40); // 50 - 10
  });
});
