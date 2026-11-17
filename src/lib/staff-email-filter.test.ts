import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  escapeLikePattern,
  parseStaffEmailFilter,
} from "./staff-email-filter";

describe("staff email filter", () => {
  it("normalizes and drops empty", () => {
    assert.equal(parseStaffEmailFilter("  A@B.Ru "), "a@b.ru");
    assert.equal(parseStaffEmailFilter("   "), null);
    assert.equal(parseStaffEmailFilter(null), null);
  });

  it("escapes LIKE wildcards", () => {
    assert.equal(escapeLikePattern("a%b_c"), "a\\%b\\_c");
  });
});
