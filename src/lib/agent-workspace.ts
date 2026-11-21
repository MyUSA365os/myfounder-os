// Setup-only policy. No credential, transport, execution or campaign access path.
export const AGENT_WORKSPACE_POLICY = Object.freeze({
  environment: "Main",
  contactLimit: 10,
  excludeQa: true,
  readOnly: true,
  executionEnabled: false,
  campaignAccess: false,
});

export const AGENT_WORKSPACE_LINKS = Object.freeze({
  issue: "https://github.com/ownyourmarket/ugotleads/issues/247",
  evidencePr: "https://github.com/ownyourmarket/ugotleads/pull/249",
  runbook:
    "https://github.com/ownyourmarket/ugotleads/blob/main/docs/integrations/agentos-sage-revenue-pilot.md",
  desktop: "https://github.com/vercel-labs/agent-desktop",
  inventory:
    "https://docs.google.com/spreadsheets/d/1WVZjHkVn5fomOlyjK2J1NUrKI248B4FSBqKI6Idmv_I/edit",
});
