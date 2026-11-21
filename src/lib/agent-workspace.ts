// Setup-only policy. No credential, transport, execution or campaign access path.
export const AGENT_WORKSPACE_POLICY = Object.freeze({
  environment: "Main",
  contactLimit: 10,
  excludeQa: true,
  readOnly: true,
  executionEnabled: false,
  campaignAccess: false,
});

export const AGENT_WORKSPACE_ISOLATION = Object.freeze({
  boostPreKeyAgentSelection: false,
  boostSeparateInstanceIsolation: false,
  submitProductionCrmKeyToBoost: false,
  primaryPath: "isolated_sage_worker",
  evidenceScopes: ["reports:read"],
  researchScopes: ["contacts:read", "forms:read", "prospects:read"],
  clientContactingEnabled: false,
});

export const AGENT_WORKSPACE_STAGES = [
  {
    title: "Release and verify operating evidence",
    detail:
      "Ship the existing uGotLeads read-only evidence endpoint from draft PR #249 (not released). Configure server-only founder UID and a Main-only reports:read credential. Verify actual evidence and negative permission tests.",
  },
  {
    title: "One isolated Sage Revenue Research worker",
    detail:
      "Use a dedicated isolated worker / server-side read-only connector, not Boost-wide MCP. Bind its key to Main with contacts:read, forms:read and prospects:read only; no write scopes. Research up to 10 non-QA records and verify the report against CRM. No client contacting.",
  },
  {
    title: "Real Ask Sage requests and controls",
    detail:
      "Connect an actual job-request UI to canonical workflow status and approval reporting, with meaningful stop/revoke. No request button until the backend truly exists.",
  },
  {
    title: "Isolated Windows desktop / RTILA worker",
    detail:
      "After the read-only pilot, verify an isolated Windows desktop / RTILA worker and its permission boundaries.",
  },
] as const;

export const AGENT_WORKSPACE_MILESTONES = [
  {
    title: "V0 interface and founder-only reader",
    state: "PREVIEW BUILT",
    detail: "Source implementation only; not evidence of a production connection or run.",
  },
  {
    title: "Evidence endpoint · PR #249",
    state: "REVIEW REQUIRED",
    detail: "Open / draft; not released.",
  },
  {
    title: "Server-only founder UID and Main credential",
    state: "NOT CONNECTED",
    detail: "Dedicated Main-only reports:read configuration; never reuse a client-scoped key.",
  },
  {
    title: "Real evidence and negative permission tests",
    state: "NOT VERIFIED",
    detail:
      "Verify actual evidence and denied access for non-founder accounts and wrong tenant/scope.",
  },
  {
    title: "First isolated Sage research run",
    state: "NOT VERIFIED",
    detail:
      "Up to 10 non-QA Main records, read-only scopes, CRM-verified report and no client contacting.",
  },
] as const;

export const AGENT_WORKSPACE_LINKS = Object.freeze({
  issue: "https://github.com/ownyourmarket/ugotleads/issues/247",
  evidencePr: "https://github.com/ownyourmarket/ugotleads/pull/249",
  executiveFuture: "https://github.com/ownyourmarket/ugotleads/issues/250",
  videoContext: "https://github.com/ownyourmarket/ugotleads/issues/252",
  runbook:
    "https://github.com/ownyourmarket/ugotleads/blob/main/docs/integrations/agentos-sage-revenue-pilot.md",
  desktop: "https://github.com/vercel-labs/agent-desktop",
  inventory:
    "https://docs.google.com/spreadsheets/d/1WVZjHkVn5fomOlyjK2J1NUrKI248B4FSBqKI6Idmv_I/edit",
});
