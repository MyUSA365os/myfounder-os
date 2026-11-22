import { z } from "zod";
import { projectSageResearch, type SageResearchReport } from "./sage-research.schema";

const id = z.string().regex(/^[A-Za-z0-9_-]{1,160}$/);
const code = id.nullable();
const assignment = z.object({
  runId: id,
  status: z.enum(["running", "waiting_human", "completed", "failed", "canceled"]),
  correlationId: id,
  approvalId: code,
  completionFact: code,
  terminalReason: code,
  report: z
    .object({
      items: z.array(z.unknown()).max(10),
      excludedCount: z.number().int().min(0).max(10),
    })
    .nullable(),
});
const responseBody = z.object({ subAccountId: id, data: assignment });
type View = Omit<z.infer<typeof assignment>, "report"> & { report: SageResearchReport | null };
type Result =
  | { status: "unconfigured" | "unavailable" | "not_found" }
  | { status: "verified"; assignment: View };

export async function readSageAssignment(
  userId: string | undefined,
  runId: string,
  settings: { ownerUid?: string; key?: string; mainId?: string },
  transport: typeof fetch = fetch,
): Promise<Result> {
  if (!userId || !settings.ownerUid || userId !== settings.ownerUid)
    throw new Error("ACCESS_DENIED");
  if (!settings.key || !settings.mainId) return { status: "unconfigured" };
  try {
    const url = new URL("https://app.ugotleads.io/api/agent/v1/os/sage-assignment");
    url.searchParams.set("subAccountId", settings.mainId);
    url.searchParams.set("runId", id.parse(runId));
    const response = await transport(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${settings.key}`, Accept: "application/json" },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
    });
    if (response.status === 404) return { status: "not_found" };
    if (response.status !== 200) return { status: "unavailable" };
    const { data, subAccountId } = responseBody.parse(await response.json());
    if (
      subAccountId !== settings.mainId ||
      data.runId !== runId ||
      (data.status === "completed") !== Boolean(data.report)
    )
      return { status: "unavailable" };
    const { report, ...metadata } = data;
    const projected =
      report &&
      projectSageResearch(
        {
          data: { subAccountId, items: report.items, nextCursor: null },
        },
        settings.mainId,
      );
    if (projected && report) {
      projected.excludedCount += report.excludedCount;
      if (projected.items.length + projected.excludedCount > 10) return { status: "unavailable" };
    }
    return { status: "verified", assignment: { ...metadata, report: projected } };
  } catch {
    return { status: "unavailable" };
  }
}
