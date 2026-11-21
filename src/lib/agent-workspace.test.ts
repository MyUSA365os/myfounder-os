import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AGENT_WORKSPACE_POLICY, AGENT_WORKSPACE_ISOLATION } from "./agent-workspace";

describe("Agent Workspace V0 safety policy", () => {
  it("limits the CRM pilot to Main", () => {
    assert.equal(AGENT_WORKSPACE_POLICY.environment, "Main");
  });
  it("limits research to up to 10 real contacts and excludes QA", () => {
    assert.equal(AGENT_WORKSPACE_POLICY.contactLimit, 10);
    assert.equal(AGENT_WORKSPACE_POLICY.excludeQa, true);
  });
  it("keeps all work read-only with execution disabled", () => {
    assert.equal(AGENT_WORKSPACE_POLICY.readOnly, true);
    assert.equal(AGENT_WORKSPACE_POLICY.executionEnabled, false);
  });
  it("withholds client campaign data from all sessions without a founder authorization gate", () => {
    assert.equal(AGENT_WORKSPACE_POLICY.campaignAccess, false);
  });
  it("does not treat Boost agents or separate instances as pre-key isolation", () => {
    assert.equal(AGENT_WORKSPACE_ISOLATION.boostPreKeyAgentSelection, false);
    assert.equal(AGENT_WORKSPACE_ISOLATION.boostSeparateInstanceIsolation, false);
    assert.equal(AGENT_WORKSPACE_ISOLATION.submitProductionCrmKeyToBoost, false);
    assert.equal(AGENT_WORKSPACE_ISOLATION.primaryPath, "isolated_sage_worker");
  });
  it("separates evidence and research read-only scopes without client contacting", () => {
    assert.deepEqual(AGENT_WORKSPACE_ISOLATION.evidenceScopes, ["reports:read"]);
    assert.deepEqual(AGENT_WORKSPACE_ISOLATION.researchScopes, [
      "contacts:read",
      "forms:read",
      "prospects:read",
    ]);
    assert.equal(AGENT_WORKSPACE_ISOLATION.clientContactingEnabled, false);
  });
});
