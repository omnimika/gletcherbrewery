import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AGENT_APP_STATUSES,
  agentAppStatusLabel,
  isActiveAgentStatus,
  isAgentAppStatus,
} from "./agent-application-status";

describe("agent application statuses", () => {
  it("exposes nine Airtable-aligned statuses", () => {
    assert.equal(AGENT_APP_STATUSES.length, 9);
    assert.ok(isAgentAppStatus("under_review"));
    assert.ok(isAgentAppStatus("active_client"));
    assert.equal(isAgentAppStatus("pending"), false);
  });

  it("treats only rejected as inactive for new applications", () => {
    assert.equal(isActiveAgentStatus("under_review"), true);
    assert.equal(isActiveAgentStatus("approved"), true);
    assert.equal(isActiveAgentStatus("active_client"), true);
    assert.equal(isActiveAgentStatus("rejected"), false);
  });

  it("labels known statuses in RU", () => {
    assert.equal(agentAppStatusLabel("under_review"), "На рассмотрении");
    assert.equal(agentAppStatusLabel("custom"), "custom");
  });
});
