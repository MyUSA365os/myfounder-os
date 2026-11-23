import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { fetchCampaignTotals, requestTotals } from "./pr-attribution.server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const campaignId = z.string().regex(/^[A-Za-z0-9_-]{1,160}$/);
export const readPrAttribution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => campaignId.parse(input))
  .handler(async ({ context, data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    if (context.userId !== process.env.FOUNDER_HQ_OWNER_UID)
      throw new Error("Owner access required");
    return fetchCampaignTotals(data);
  });

export const verifyPrReader = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    if (!context.userId || context.userId !== process.env.FOUNDER_HQ_OWNER_UID)
      throw new Error("Owner access required");
    // A fresh missing campaign produces this specific reply only after both tenant and key checks.
    const { response } = await requestTotals(crypto.randomUUID());
    const body = await response.json().catch(() => null);
    return {
      authenticated:
        response.status === 404 &&
        body?.error?.code === "NOT_FOUND" &&
        body?.error?.message === "Campaign not found.",
    };
  });
