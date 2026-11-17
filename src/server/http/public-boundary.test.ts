import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  _resetRateLimitBucketsForTests,
  checkRateLimit,
  enforceContentLength,
  FORM_JSON_MAX_BYTES,
} from "./public-boundary";

describe("enforceContentLength", () => {
  it("allows missing Content-Length", () => {
    const req = new Request("http://localhost/x", { method: "POST" });
    assert.equal(enforceContentLength(req, 100).ok, true);
  });

  it("rejects oversized Content-Length", () => {
    const req = new Request("http://localhost/x", {
      method: "POST",
      headers: { "content-length": String(FORM_JSON_MAX_BYTES + 1) },
    });
    const r = enforceContentLength(req, FORM_JSON_MAX_BYTES);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 413);
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => _resetRateLimitBucketsForTests());

  it("allows up to limit then blocks", () => {
    const key = "t:1";
    const windowMs = 60_000;
    for (let i = 0; i < 3; i++) {
      assert.equal(
        checkRateLimit({ key, limit: 3, windowMs, now: 1_000 }).ok,
        true,
      );
    }
    const blocked = checkRateLimit({ key, limit: 3, windowMs, now: 1_000 });
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.equal(blocked.status, 429);
      assert.ok((blocked.retryAfterSec ?? 0) >= 1);
    }
  });

  it("resets after window", () => {
    const key = "t:2";
    assert.equal(
      checkRateLimit({ key, limit: 1, windowMs: 1000, now: 0 }).ok,
      true,
    );
    assert.equal(
      checkRateLimit({ key, limit: 1, windowMs: 1000, now: 0 }).ok,
      false,
    );
    assert.equal(
      checkRateLimit({ key, limit: 1, windowMs: 1000, now: 1001 }).ok,
      true,
    );
  });
});
