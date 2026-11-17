import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AGENT_APP_STATUSES,
  agentAppStatusLabel,
  isOpenAgentStatus,
  isAgentAppStatus,
  MAX_OPEN_AGENT_APPLICATIONS,
} from "./agent-application-status";

describe("agent application statuses", () => {
  it("exposes nine Airtable-aligned statuses", () => {
    assert.equal(AGENT_APP_STATUSES.length, 9);
    assert.ok(isAgentAppStatus("under_review"));
    assert.ok(isAgentAppStatus("active_client"));
    assert.equal(isAgentAppStatus("pending"), false);
  });

  it("open = anything except approved|rejected; cap is 10", () => {
    assert.equal(MAX_OPEN_AGENT_APPLICATIONS, 10);
    assert.equal(isOpenAgentStatus("under_review"), true);
    assert.equal(isOpenAgentStatus("active_client"), true);
    assert.equal(isOpenAgentStatus("no_contact"), true);
    assert.equal(isOpenAgentStatus("approved"), false);
    assert.equal(isOpenAgentStatus("rejected"), false);
  });

  it("labels known statuses in RU", () => {
    assert.equal(agentAppStatusLabel("under_review"), "На рассмотрении");
    assert.equal(agentAppStatusLabel("custom"), "custom");
  });
});
