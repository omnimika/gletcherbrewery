import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clampPageParams,
  clampPageToTotal,
  toPageResult,
} from "./pagination";

describe("pagination", () => {
  it("clamps page/pageSize defaults and bounds", () => {
    assert.deepEqual(clampPageParams({}), {
      page: 1,
      pageSize: 50,
      offset: 0,
    });
    assert.deepEqual(clampPageParams({ page: "3", pageSize: "200" }), {
      page: 3,
      pageSize: 100,
      offset: 200,
    });
    assert.deepEqual(clampPageParams({ page: 0, pageSize: -1 }), {
      page: 1,
      pageSize: 1,
      offset: 0,
    });
  });

  it("clamps page to total pages", () => {
    assert.deepEqual(clampPageToTotal(99, 50, 120), {
      page: 3,
      pageSize: 50,
      offset: 100,
    });
    assert.deepEqual(clampPageToTotal(1, 50, 0), {
      page: 1,
      pageSize: 50,
      offset: 0,
    });
  });

  it("builds page result meta", () => {
    const r = toPageResult([1, 2], 120, 2, 50);
    assert.equal(r.totalPages, 3);
    assert.equal(r.total, 120);
  });
});
