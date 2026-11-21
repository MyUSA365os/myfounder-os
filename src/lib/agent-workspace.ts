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
    title: "Configure and verify released operating evidence",
    detail:
      "Evidence API released in PR #255; owner-only key controls released in PR #257. Securely configure the founder UID, Main tenant and separate Main-only reports:read key in Founder HQ. Actual Main evidence and negative permission checks remain unverified.",
  },
  {
    title: "Owner-click Main prospect review",
    detail:
      "The direct read-only Sage Research Pilot exists in preview source only. Configure its separate Main-only contacts:read, forms:read and prospects:read key. No authorized data has been pulled or 10-prospect report produced; this is not an OS workflow run. No client contacting or shared Boost AgentOS.",
  },
  {
    title: "Real Ask Sage requests and controls",
    detail:
      "Durable request-run-approval-stop worker flow is not built. No canonical workflow run has been executed from this workspace. Add meaningful approval and stop/revoke only with an approved worker backend; direct prospect review does not create a workflow run.",
  },
  {
    title: "Isolated Windows desktop / RTILA worker",
    detail:
      "After the read-only pilot, verify an isolated Windows desktop / RTILA worker and its permission boundaries.",
  },
] as const;

export const AGENT_WORKSPACE_MILESTONES = [
  {
    title: "Evidence backend · PR #255",
    state: "RELEASED",
    detail:
      "Verified November 21, 2026: live on app.ugotleads.io, commit aede766d…; tests/lint/typecheck green, Vercel READY and custom domain verified. Release is not evidence of a Founder HQ connection.",
  },
  {
    title: "Owner-only key panel · PR #257",
    state: "RELEASED",
    detail:
      "Verified November 21, 2026: live on app.ugotleads.io, commit d96a82f…; Vercel READY and domain verified. Separate Main-only evidence and research key controls and legacy Boost MCP pause are released; neither key was created by deployment.",
  },
  {
    title: "Founder HQ dedicated server secrets",
    state: "NOT CONNECTED",
    detail:
      "No private settings configured. Founder UID and Main tenant must be securely configured with two separately scoped keys; never reuse a client-scoped or shared Boost key.",
  },
  {
    title: "Actual Main evidence and read pilot",
    state: "NOT VERIFIED",
    detail:
      "No authorized data pulled, no 10-prospect report produced. Founder HQ readers are preview source only, not published; 60 focused preview tests passed, not a live Main verification.",
  },
  {
    title: "Durable request-run-approval-stop worker flow",
    state: "NOT BUILT",
    detail:
      "No canonical workflow run executed. Direct read-only prospect review is not an agent run, worker execution or approval/stop flow.",
  },
] as const;

export const AGENT_WORKSPACE_LINKS = Object.freeze({
  agencySettings: "https://app.ugotleads.io/agency/settings",
  evidenceRelease: "https://github.com/ownyourmarket/ugotleads/pull/255",
  keyControlsRelease: "https://github.com/ownyourmarket/ugotleads/pull/257",
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
