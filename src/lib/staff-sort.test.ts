import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nextSortDir, parseStaffSort } from "./staff-sort";

describe("staff-sort", () => {
  const allowed = ["createdAt", "status"] as const;

  it("defaults to createdAt desc", () => {
    assert.deepEqual(parseStaffSort({}, allowed, "createdAt"), {
      sort: "createdAt",
      dir: "desc",
    });
  });

  it("accepts allowed sort/dir and rejects unknown", () => {
    assert.deepEqual(
      parseStaffSort({ sort: "status", dir: "asc" }, allowed, "createdAt"),
      { sort: "status", dir: "asc" },
    );
    assert.deepEqual(
      parseStaffSort({ sort: "hack", dir: "nope" }, allowed, "createdAt"),
      { sort: "createdAt", dir: "desc" },
    );
  });

  it("toggles dir for same field", () => {
    assert.equal(
      nextSortDir({ sort: "createdAt", dir: "desc" }, "createdAt"),
      "asc",
    );
    assert.equal(
      nextSortDir({ sort: "createdAt", dir: "asc" }, "status"),
      "desc",
    );
  });
});
