import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isReplayableJobStatus,
  isWorkflowStatus,
  WORKFLOW_STATUSES,
} from "./contracts";
import { parseStaffCommandBody } from "./commands";

describe("staff contracts", () => {
  it("accepts known workflow statuses", () => {
    for (const s of WORKFLOW_STATUSES) {
      assert.equal(isWorkflowStatus(s), true);
    }
    assert.equal(isWorkflowStatus("accepted"), false);
    assert.equal(isWorkflowStatus(""), false);
  });

  it("limits replayable delivery statuses", () => {
    assert.equal(isReplayableJobStatus("failed"), true);
    assert.equal(isReplayableJobStatus("delivered"), false);
    assert.equal(isReplayableJobStatus("cancelled_policy"), false);
    assert.equal(isReplayableJobStatus("pending"), false);
  });
});

describe("parseStaffCommandBody", () => {
  it("parses set_status", () => {
    const r = parseStaffCommandBody({
      action: "set_status",
      workflowStatus: "in_progress",
    });
    assert.equal(r.ok, true);
    if (r.ok) assert.deepEqual(r.input, {
      action: "set_status",
      workflowStatus: "in_progress",
    });
  });

  it("parses assign null", () => {
    const r = parseStaffCommandBody({ action: "assign", assignee: null });
    assert.equal(r.ok, true);
    if (r.ok) assert.deepEqual(r.input, { action: "assign", assignee: null });
  });

  it("rejects empty note", () => {
    const r = parseStaffCommandBody({ action: "note", note: 1 });
    assert.equal(r.ok, false);
  });

  it("rejects unknown action", () => {
    const r = parseStaffCommandBody({ action: "delete" });
    assert.equal(r.ok, false);
  });
});
