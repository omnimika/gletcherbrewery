import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { maxAgeSec, summarizeByStatus } from "./queue-snapshot";

describe("queue-snapshot helpers", () => {
  it("sums counts by status", () => {
    assert.deepEqual(
      summarizeByStatus([
        { status: "pending", count: 2 },
        { status: "failed", count: 1 },
        { status: "pending", count: 3 },
      ]),
      { pending: 5, failed: 1 },
    );
  });

  it("computes max age for a status", () => {
    const now = new Date("2026-11-17T12:00:00.000Z");
    const age = maxAgeSec(
      [
        {
          status: "pending",
          oldestCreatedAt: "2026-11-17T11:59:00.000Z",
        },
        {
          status: "pending",
          oldestCreatedAt: "2026-11-17T11:50:00.000Z",
        },
        {
          status: "failed",
          oldestCreatedAt: "2026-11-17T10:00:00.000Z",
        },
      ],
      "pending",
      now,
    );
    assert.equal(age, 600);
  });
});
