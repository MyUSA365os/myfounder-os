import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const campaignId = z.string().regex(/^[A-Za-z0-9_-]{1,160}$/);
const totals = z.object({
  subAccountId: z.string(),
  campaignId,
  leadConversions: z.number().int().nonnegative(),
  retainedTrackedClicks: z.number().int().nonnegative(),
  checkedAt: z.string().datetime(),
});

export const readPrAttribution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => campaignId.parse(input))
  .handler(async ({ context, data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    if (context.userId !== process.env.FOUNDER_HQ_OWNER_UID) throw new Error("Owner access required");
    const key = process.env.UGOTLEADS_PR_ATTRIBUTION_KEY;
    const main = process.env.UGOTLEADS_MAIN_SUB_ACCOUNT_ID;
    if (!key || !main) throw new Error("PR attribution reader is unconfigured");
    const url = new URL("https://app.ugotleads.io/api/agent/v1/os/pr-attribution");
    url.searchParams.set("subAccountId", main);
    url.searchParams.set("campaignId", data);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${key}` }, redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Attribution source unavailable");
    const result = totals.parse(await response.json());
    if (result.subAccountId !== main || result.campaignId !== data) throw new Error("Campaign mismatch");
    return result;
  });
