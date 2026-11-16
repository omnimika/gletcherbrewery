import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { _hashForTests, _safeEqualForTests } from "./magic-link";

describe("magic-link hashing", () => {
  it("hashes deterministically and compares safely", () => {
    const a = _hashForTests("token-one");
    const b = _hashForTests("token-one");
    const c = _hashForTests("token-two");
    assert.equal(a, b);
    assert.notEqual(a, c);
    assert.equal(_safeEqualForTests(a, b), true);
    assert.equal(_safeEqualForTests(a, c), false);
  });
});
