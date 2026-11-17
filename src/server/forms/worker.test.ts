import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isJobClaimableAt } from "./worker";

describe("isJobClaimableAt", () => {
  const now = new Date("2026-11-16T12:00:00.000Z");

  it("claims due pending/retry without active lease", () => {
    assert.equal(
      isJobClaimableAt(
        {
          status: "pending",
          nextAttemptAt: "2026-11-16T11:59:00.000Z",
          leaseExpiresAt: null,
        },
        now,
      ),
      true,
    );
    assert.equal(
      isJobClaimableAt(
        {
          status: "retry",
          nextAttemptAt: "2026-11-16T11:00:00.000Z",
          leaseExpiresAt: null,
        },
        now,
      ),
      true,
    );
  });

  it("skips future next_attempt_at", () => {
    assert.equal(
      isJobClaimableAt(
        {
          status: "pending",
          nextAttemptAt: "2026-11-16T12:01:00.000Z",
          leaseExpiresAt: null,
        },
        now,
      ),
      false,
    );
  });

  it("reclaims expired leased", () => {
    assert.equal(
      isJobClaimableAt(
        {
          status: "leased",
          nextAttemptAt: "2026-11-16T11:00:00.000Z",
          leaseExpiresAt: "2026-11-16T11:59:00.000Z",
        },
        now,
      ),
      true,
    );
  });

  it("does not reclaim active leased", () => {
    assert.equal(
      isJobClaimableAt(
        {
          status: "leased",
          nextAttemptAt: "2026-11-16T11:00:00.000Z",
          leaseExpiresAt: "2026-11-16T12:05:00.000Z",
        },
        now,
      ),
      false,
    );
  });

  it("ignores delivered/failed", () => {
    assert.equal(
      isJobClaimableAt(
        {
          status: "delivered",
          nextAttemptAt: "2026-11-16T11:00:00.000Z",
          leaseExpiresAt: null,
        },
        now,
      ),
      false,
    );
    assert.equal(
      isJobClaimableAt(
        {
          status: "failed",
          nextAttemptAt: "2026-11-16T11:00:00.000Z",
          leaseExpiresAt: null,
        },
        now,
      ),
      false,
    );
  });
});
