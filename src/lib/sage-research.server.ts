import { projectSageResearch, type SageResearchResult } from "./sage-research.schema";

type Settings = { ownerUid?: string; key?: string; mainId?: string };

export async function readSageResearch(
  userId: string | undefined,
  settings: Settings,
  transport: typeof fetch = fetch,
): Promise<SageResearchResult> {
  if (!userId || !settings.ownerUid || userId !== settings.ownerUid) {
    throw new Error("ACCESS_DENIED");
  }
  if (!settings.key || !settings.mainId) return { configured: false };
  const unavailable = { configured: true, available: false } as const;
  try {
    const url = new URL("https://app.ugotleads.io/api/agent/v1/prospects");
    url.searchParams.set("subAccountId", settings.mainId);
    url.searchParams.set("limit", "10");
    const response = await transport(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${settings.key}`, Accept: "application/json" },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
    });
    if (response.status !== 200) return unavailable;
    return {
      configured: true,
      available: true,
      report: projectSageResearch(await response.json(), settings.mainId),
    };
  } catch {
    return unavailable;
  }
}
