import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { provisionalLevelFromLifetime } from "./level";

describe("provisional level", () => {
  it("maps lifetime earn to 1000₿ steps", () => {
    assert.deepEqual(provisionalLevelFromLifetime(0), {
      level: 0,
      intoLevel: 0,
      toNextLevel: 1000,
      progressPct: 0,
    });
    assert.equal(provisionalLevelFromLifetime(999).level, 0);
    assert.equal(provisionalLevelFromLifetime(1000).level, 1);
    assert.equal(provisionalLevelFromLifetime(2500).level, 2);
    assert.equal(provisionalLevelFromLifetime(2500).toNextLevel, 500);
    assert.equal(provisionalLevelFromLifetime(2500).progressPct, 50);
  });
});
