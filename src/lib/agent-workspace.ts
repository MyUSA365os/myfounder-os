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
      "Configure the dedicated Main-only research key for the published direct prospect review.",
  },
  {
    title: "Real Ask Sage requests and controls",
    detail:
      "Create, approve and stop the bounded assignment in uGotLeads Agency Settings. Use its workflow run ID to check status and view its report here.",
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
    state: "OWNER SETUP",
    detail:
      "Set the founder UID, Main tenant and two dedicated keys in the private project Secrets screen. Check Live operating evidence for the current connection status.",
  },
  {
    title: "Actual Main evidence and read pilot",
    state: "NOT VERIFIED",
    detail: "The live Founder HQ connection still requires a verified owner-authenticated read.",
  },
  {
    title: "Durable Sage assignment",
    state: "VERIFICATION PENDING",
    detail:
      "Production validation requires a dedicated Main key and a completed owner-approved test run.",
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
