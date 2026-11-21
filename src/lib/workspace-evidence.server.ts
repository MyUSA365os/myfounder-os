import {
  projectWorkspaceEvidence,
  type WorkspaceEvidenceResult,
} from "./workspace-evidence.schema";

type Settings = { ownerUid?: string; key?: string; mainId?: string };

// Server-only helper with injected settings/transport for isolated security tests.
export async function readWorkspaceEvidence(
  userId: string | undefined,
  settings: Settings,
  transport: typeof fetch = fetch,
): Promise<WorkspaceEvidenceResult> {
  if (!userId || !settings.ownerUid || userId !== settings.ownerUid) {
    throw new Error("ACCESS_DENIED");
  }
  if (!settings.key || !settings.mainId) return { configured: false };
  const unavailable = { configured: true, available: false, reason: "unavailable" } as const;
  try {
    const url = new URL("https://app.ugotleads.io/api/agent/v1/os/workspace-evidence");
    url.searchParams.set("subAccountId", settings.mainId);
    url.searchParams.set("limit", "10");
    const response = await transport(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${settings.key}`, Accept: "application/json" },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
    });
    if (response.status === 404) {
      return { configured: true, available: false, reason: "pending_release" };
    }
    if (response.status !== 200) return unavailable;
    return {
      configured: true,
      available: true,
      evidence: projectWorkspaceEvidence(await response.json(), settings.mainId),
    };
  } catch {
    return unavailable;
  }
}
