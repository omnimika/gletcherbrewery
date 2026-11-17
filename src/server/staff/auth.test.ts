import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import {
  isStaffAuthConfigured,
  verifyStaffBootstrapToken,
} from "./auth";
import { requireStaffRole } from "./request-auth";
import { LOYALTY_STAFF_ROLES } from "./roles";
import type { StaffAuthOk } from "./request-auth";

describe("staff bootstrap token", () => {
  const prev = process.env.STAFF_API_TOKEN;

  before(() => {
    process.env.STAFF_API_TOKEN = "test-staff-token-32chars-xxxxx";
  });

  after(() => {
    if (prev === undefined) delete process.env.STAFF_API_TOKEN;
    else process.env.STAFF_API_TOKEN = prev;
  });

  it("is configured when token long enough", () => {
    assert.equal(isStaffAuthConfigured(), true);
  });

  it("verifies bootstrap token constant-time", () => {
    assert.equal(
      verifyStaffBootstrapToken("test-staff-token-32chars-xxxxx"),
      true,
    );
    assert.equal(verifyStaffBootstrapToken("wrong-token-xxxxxxxxxxxxxxxx"), false);
    assert.equal(verifyStaffBootstrapToken(null), false);
  });
});

describe("requireStaffRole", () => {
  it("forbids retail_editor on loyalty routes", () => {
    const auth: StaffAuthOk = {
      ok: true,
      actor: {
        id: "map@example.com",
        email: "map@example.com",
        role: "retail_editor",
        userId: "00000000-0000-4000-8000-000000000001",
        sessionId: "00000000-0000-4000-8000-000000000002",
      },
    };
    const gate = requireStaffRole(auth, LOYALTY_STAFF_ROLES);
    assert.ok(gate);
    assert.equal(gate!.ok, false);
    assert.equal(gate!.response.status, 403);
  });

  it("allows loyalty_manager on loyalty routes", () => {
    const auth: StaffAuthOk = {
      ok: true,
      actor: {
        id: "loy@example.com",
        email: "loy@example.com",
        role: "loyalty_manager",
        userId: "00000000-0000-4000-8000-000000000003",
        sessionId: "00000000-0000-4000-8000-000000000004",
      },
    };
    assert.equal(requireStaffRole(auth, LOYALTY_STAFF_ROLES), null);
  });
});
