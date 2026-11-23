import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { reviewFounderRelease } from "./press-ranger.server";
import { fetchCampaignTotals } from "./pr-attribution.server";

type Review = {
  id: string;
  workspace_id: string;
  requested_by: string;
  requested_at: string;
  completed_at: string | null;
  approved_by: string | null;
  report: string | null;
};
type Reviews = {
  public: {
    Tables: {
      media_pr_reviews: {
        Row: Review;
        Insert: Pick<Review, "id" | "workspace_id" | "requested_by">;
        Update: Pick<Review, "approved_by" | "completed_at" | "report">;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
  };
};
const input = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({ action: z.literal("create"), id: z.string().uuid() }),
  z.object({ action: z.literal("approve"), id: z.string().uuid() }),
]);
export const launchReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => input.parse(value))
  .handler(async ({ context, data }) => {
    setResponseHeader("Cache-Control", "no-store");
    if (!context.userId || context.userId !== process.env.FOUNDER_HQ_OWNER_UID)
      throw new Error("Owner access required");
    const { data: workspace, error } = await context.supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", context.userId)
      .single();
    if (error || !workspace) throw new Error("Workspace unavailable");
    const table = (supabaseAdmin as unknown as SupabaseClient<Reviews>).from("media_pr_reviews");
    if (data.action === "create") {
      const created = await table.upsert(
        { id: data.id, workspace_id: workspace.id, requested_by: context.userId },
        { onConflict: "id", ignoreDuplicates: true },
      );
      if (created.error) throw new Error("Could not save assignment");
    }
    if (data.action === "approve") {
      const row = await table
        .select("completed_at")
        .eq("id", data.id)
        .eq("workspace_id", workspace.id)
        .single();
      if (row.error) throw new Error("Assignment unavailable");
      if (!row.data.completed_at) {
        const metrics = await fetchCampaignTotals("myusa-founder-launch");
        const token = process.env.SAGE_PRESS_RANGER_TOKEN;
        if (!token) throw new Error("Press Ranger credential unavailable");
        const releaseEvidence = await reviewFounderRelease(token);
        const report = `The founder launch recorded ${metrics.retainedTrackedClicks} landing page views and ${metrics.leadConversions} new CRM contacts as of ${metrics.checkedAt}. Views include internal verification traffic. ${releaseEvidence}`;
        const saved = await table
          .update({ report, completed_at: new Date().toISOString(), approved_by: context.userId })
          .eq("id", data.id)
          .eq("workspace_id", workspace.id)
          .is("completed_at", null);
        if (saved.error) throw new Error("Could not save result");
      }
    }
    const rows = await table
      .select("id,requested_at,completed_at,report")
      .eq("workspace_id", workspace.id)
      .order("requested_at", { ascending: false })
      .limit(20);
    if (rows.error) throw new Error("Assignments unavailable");
    return rows.data;
  });
