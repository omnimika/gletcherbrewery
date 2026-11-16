import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  loyaltyProgressFromLifetime,
  provisionalLevelFromLifetime,
} from "./level";

describe("loyaltyProgressFromLifetime (Airtable formulas)", () => {
  it("maps 1000₿ steps like MOD formula", () => {
    assert.deepEqual(provisionalLevelFromLifetime(0), {
      level: 0,
      intoLevel: 0,
      toNextLevel: 1000,
      progressPct: 0,
    });
    assert.equal(loyaltyProgressFromLifetime(999).level, 0);
    assert.equal(loyaltyProgressFromLifetime(1000).level, 1);
    assert.equal(loyaltyProgressFromLifetime(1000).toNextLevel, 1000);
    assert.equal(loyaltyProgressFromLifetime(1000).progressPct, 0);
    assert.equal(loyaltyProgressFromLifetime(2500).level, 2);
    assert.equal(loyaltyProgressFromLifetime(2500).toNextLevel, 500);
    assert.equal(loyaltyProgressFromLifetime(2500).progressPct, 50);
  });

  it("resolves Confirmed status / prize bands", () => {
    assert.equal(loyaltyProgressFromLifetime(0).status, "Новичок");
    assert.equal(loyaltyProgressFromLifetime(0).prize, "—");
    assert.equal(loyaltyProgressFromLifetime(1000).status, "Первооткрыватель");
    assert.equal(
      loyaltyProgressFromLifetime(1000).prize,
      "Ящик регулярного сорта",
    );
    assert.equal(loyaltyProgressFromLifetime(5500).status, "Энтузиаст");
    assert.equal(loyaltyProgressFromLifetime(10999).status, "Авторитет");
    assert.equal(loyaltyProgressFromLifetime(11000).status, "Легенда");
    assert.match(
      loyaltyProgressFromLifetime(11000).prize,
      /Годовой запас пива/,
    );
  });

  it("computes legend percent toward 12000", () => {
    assert.equal(loyaltyProgressFromLifetime(0).legendProgressPct, 0);
    assert.equal(loyaltyProgressFromLifetime(6000).legendProgressPct, 50);
    assert.equal(loyaltyProgressFromLifetime(12000).legendProgressPct, 100);
    assert.equal(loyaltyProgressFromLifetime(20000).legendProgressPct, 100);
  });
});
