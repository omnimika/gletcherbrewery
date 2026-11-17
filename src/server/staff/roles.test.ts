import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isStaffRole,
  LOYALTY_STAFF_ROLES,
  RETAIL_STAFF_ROLES,
  roleAllows,
} from "./roles";

describe("staff roles", () => {
  it("accepts known roles only", () => {
    assert.equal(isStaffRole("admin"), true);
    assert.equal(isStaffRole("loyalty_manager"), true);
    assert.equal(isStaffRole("retail_editor"), true);
    assert.equal(isStaffRole("staff"), false);
  });

  it("loyalty gate rejects retail_editor", () => {
    assert.equal(roleAllows("retail_editor", LOYALTY_STAFF_ROLES), false);
    assert.equal(roleAllows("loyalty_manager", LOYALTY_STAFF_ROLES), true);
    assert.equal(roleAllows("admin", LOYALTY_STAFF_ROLES), true);
  });

  it("retail gate rejects loyalty_manager", () => {
    assert.equal(roleAllows("loyalty_manager", RETAIL_STAFF_ROLES), false);
    assert.equal(roleAllows("retail_editor", RETAIL_STAFF_ROLES), true);
  });
});
